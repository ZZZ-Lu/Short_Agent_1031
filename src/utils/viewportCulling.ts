import { AspectRatio, CARD_DIMENSIONS, getCardSize } from '../components/GenerationCard';
import { getBottomPanelHeight, hasCardMedia, shouldShowGenerationPromptPanel } from './cardLayout';
import { NANO_LOD_THRESHOLD, NANO_LOD_ENTER_HIGH_THRESHOLD, NANO_LOD_EXIT_HIGH_THRESHOLD } from './cardLodAppearance';

export interface CardBounds {
  id: string;
  x: number;
  y: number;
  ratio: AspectRatio;
  customWidth?: number;
  customHeight?: number;
  prompt?: string;
  referenceImages?: any[];
  referenceImageUrl?: string | null;
  fileName?: string;
  isAsset?: boolean;
  imageUrl?: string | null;
  originalImageUrl?: string | null;
  trueOriginalImageUrl?: string | null;
  thumbnailUrl?: string | null;
  fileData?: unknown;
  originalFileData?: unknown;
  trueOriginalFileData?: unknown;
  isVideo?: boolean;
  isText?: boolean;
  state?: string;
  generationError?: string | null;
}

export interface CanvasViewport {
  viewportWidth: number;
  viewportHeight: number;
  scale: number;
  tx: number;
  ty: number;
}

/**
 * Calculates visual dimensions of a card in canvas world coordinates.
 * Includes the bottom prompt/action panel height only when the card defaults to
 * displaying it (blank drafts, generating cards, or errored generation cards).
 */
export function getCardDimensions(card: CardBounds): { width: number; height: number } {
  const dim = getCardSize(card);
  if (card.isText) {
    return { width: dim.width, height: dim.height };
  }
  const isGenerationCard = !card.fileName && !card.isAsset;
  const includePanelBounds = isGenerationCard && shouldShowGenerationPromptPanel({
    isAssetCard: false,
    hasMedia: hasCardMedia(card),
    state: card.state,
    hasError: Boolean(card.generationError),
  });
  if (!includePanelBounds) {
    return { width: dim.width, height: dim.height };
  }
  const visualWidth = Math.max(dim.width, 480);
  const panelHeight = getBottomPanelHeight(card.prompt, card.referenceImages?.length || (card.referenceImageUrl ? 1 : 0));
  const visualHeight = dim.height + 12 + panelHeight;
  return { width: visualWidth, height: visualHeight };
}

export function getCardWorldBounds(card: CardBounds) {
  const image = getCardSize(card);
  const visual = getCardDimensions(card);
  const left = card.x + Math.min(0, (image.width - visual.width) / 2);
  return { minX: left, minY: card.y, maxX: left + visual.width, maxY: card.y + visual.height };
}

/**
 * Determines whether a card's axis-aligned bounding box intersects with
 * a rectangle defined by the viewport plus a pre-load buffer.
 *
 * This function performs pure mathematical AABB vs AABB collision detection
 * in screen space, completely decoupled from DOM or rendering layers.
 */
export function isCardIntersectingRectangle(
  card: CardBounds,
  viewport: CanvasViewport
): boolean {
  const { viewportWidth, viewportHeight, scale, tx, ty } = viewport;
  if (viewportWidth <= 0 || viewportHeight <= 0 || scale <= 0) return true;

  // Card dimensions in canvas coordinates
  const bounds = getCardWorldBounds(card);

  // Card AABB in screen coordinates
  const cardLeft = bounds.minX * scale + tx;
  const cardTop = bounds.minY * scale + ty;
  const cardRight = bounds.maxX * scale + tx;
  const cardBottom = bounds.maxY * scale + ty;

  // Add a scale-adaptive buffer zone outside screen edges for smooth pre-loading
  const buffer = Math.max(40, Math.min(150, Math.round(150 * Math.sqrt(scale))));
  
  // Explicit user preference: Expand top safety buffer zone specifically for top-edge culling
  const topBuffer = buffer + 350;

  return (
    cardLeft <= viewportWidth + buffer &&
    cardRight >= -buffer &&
    cardTop <= viewportHeight + buffer &&
    cardBottom >= -topBuffer
  );
}

/**
 * Shared Nano/Micro-LOD Scale Threshold: 0.40 (40%)
 * Scale < 0.40 renders via NanoLodCanvas (2D Canvas mode with color blocks).
 * Scale >= 0.40 renders via DOM cards mode (interactive prompt component).
 */
export { NANO_LOD_ENTER_HIGH_THRESHOLD, NANO_LOD_EXIT_HIGH_THRESHOLD };

export function getNanoLodThreshold(): number {
  return NANO_LOD_THRESHOLD;
}

/**
 * Dual-threshold hysteresis state resolver to prevent rapid mount/unmount flickering
 * near the scale 0.40 boundary during continuous zoom gestures.
 */
export function isNanoLodScale(scale: number, currentIsNano: boolean): boolean {
  if (currentIsNano) {
    return scale < NANO_LOD_ENTER_HIGH_THRESHOLD;
  } else {
    return scale < NANO_LOD_EXIT_HIGH_THRESHOLD;
  }
}

export const CARD_DENSITY_HIGH_THRESHOLD = 15; // Kept for backwards compatibility
export const HIGH_RENDER_WEIGHT_THRESHOLD = 12; // Weight threshold where DOM cards start impacting reflow
export const FRAME_BUDGET_MS = 3.5; // Strict JS budget per frame (3.5ms) ensuring React layout and paint have >13ms to guarantee 60 FPS

/**
 * Calculates a rendering complexity weight for a card.
 * Cards with prompt panels, textareas, and reference images have significantly higher DOM weight
 * and layout reflow costs during pan/zoom gestures than simple image asset cards.
 */
export function calculateCardRenderWeight(card: CardBounds): number {
  const isGenerationCard = !card.fileName && !card.isAsset;
  if (!isGenerationCard) {
    return 1; // Plain image or video card: lightweight DOM
  }
  let weight = 2; // Base generation card
  if (card.prompt || (card.referenceImages && card.referenceImages.length > 0)) {
    weight += 3; // Generation card with active prompt/action panel
  }
  if (card.referenceImages && card.referenceImages.length > 0) {
    weight += card.referenceImages.length; // Extra DOM nodes per reference image chip
  }
  return weight;
}

/**
 * Calculates total render weight for a set of visible cards.
 */
export function calculateTotalRenderWeight(cards: CardBounds[]): number {
  let total = 0;
  for (let i = 0; i < cards.length; i++) {
    total += calculateCardRenderWeight(cards[i]);
  }
  return total;
}

/**
 * Calculates per-frame mounting quota based on scale, gesture state, and live frame duration.
 * - Active Gesture: STRICT ZERO-MOUNT (returns 0). Guarantees 60 FPS gesture smoothness during active drag/zoom.
 * - Gesture Settled & Idle: Mounts in frame-budgeted batches (4-6 cards per frame, or 2 under heavy frame duration)
 *   so cards settle in minimal React render cycles rather than dragging across dozens of single-card frames.
 */
export function getLodMountQuota(
  scale: number, 
  isGestureActive: boolean = false, 
  frameIndex: number = 0,
  cardCountOrWeight: number = 0,
  lastFrameDuration: number = 0
): number {
  if (scale < getNanoLodThreshold()) return 0;
  if (isGestureActive) return 0; // Strictly zero DOM mounting during gesture!
  if (lastFrameDuration > 20.0) return 2;
  return 6;
}

export const UNMOUNT_TARGET_DURATION_MS = 200; // Target duration (200ms) to complete progressive DOM card unmounting during High -> Low LOD switch

/**
 * Calculates per-frame unmounting quota based on time budget and remaining culled cards.
 * High -> Low LOD transitions happen very quickly during large-scale zoom-out,
 * so unmounting is time-budgeted to complete smoothly within targetDurationMs (default 200ms).
 *
 * @param remainingCulledCount Total number of culled cards still awaiting DOM removal
 * @param elapsedMs Elapsed time in milliseconds since this unmount session began
 * @param targetDurationMs Target completion duration in milliseconds
 * @returns Number of cards to unmount in the current frame
 */
export function getLodUnmountQuota(
  remainingCulledCount: number,
  elapsedMs: number,
  targetDurationMs: number = UNMOUNT_TARGET_DURATION_MS
): number {
  if (remainingCulledCount <= 0) return 0;
  if (elapsedMs >= targetDurationMs) return remainingCulledCount;

  const remainingTime = Math.max(16.6, targetDurationMs - elapsedMs);
  const remainingFrames = Math.max(1, Math.ceil(remainingTime / 16.6));
  return Math.max(1, Math.ceil(remainingCulledCount / remainingFrames));
}

export const NANO_FULL_IMAGE_MIN_SCALE = 0.6;

/**
 * Selects up to `quota` mounted card IDs to unmount first during a High -> Low LOD transition.
 * Picks perimeter cards furthest from the viewport center first so focal cards stay resident
 * longest in case the user reverses zoom back into Standard LOD.
 */
export function pickZoomOutUnmountBatch(
  mountedIds: Iterable<string>,
  cardsById: ReadonlyMap<string, CardBounds>,
  viewportCenter: { x: number; y: number },
  quota: number
): string[] {
  if (quota <= 0) return [];
  const entries: Array<{ id: string; distSq: number }> = [];
  for (const id of mountedIds) {
    const card = cardsById.get(id);
    if (!card) {
      entries.push({ id, distSq: Infinity });
      continue;
    }
    const size = getCardSize(card);
    const cx = card.x + size.width / 2;
    const cy = card.y + size.height / 2;
    const dx = cx - viewportCenter.x;
    const dy = cy - viewportCenter.y;
    entries.push({ id, distSq: dx * dx + dy * dy });
  }
  if (entries.length === 0) return [];
  if (quota >= entries.length) {
    return entries.map(entry => entry.id);
  }
  entries.sort((a, b) => b.distSq - a.distSq);
  return entries.slice(0, quota).map(entry => entry.id);
}

/**
 * Avoids expensive 2D Canvas downsampling of high-res full bitmaps during active gestures,
 * zoom-out, or scales below 60% where lightweight proxy thumbnails already match screen size.
 */
export function shouldUseNanoCanvasThumbOnly(
  scale: number,
  isGestureActive: boolean,
  isZoomingOut: boolean,
  allowGestureUpgrade: boolean = false
): boolean {
  if (isZoomingOut || scale < NANO_FULL_IMAGE_MIN_SCALE) return true;
  if (isGestureActive && !allowGestureUpgrade) return true;
  return false;
}

/**
 * Enables cheap rectangular drawing and simplified bottom panels in NanoLodCanvas during
 * active zoom-out gestures, deferring Path2D clipping and full skeleton details until idle.
 */
export function shouldSimplifyNanoCanvasCard(
  scale: number,
  isGestureActive: boolean,
  isZoomingOut: boolean
): boolean {
  return isGestureActive && (isZoomingOut || scale < NANO_FULL_IMAGE_MIN_SCALE);
}

/**
 * Quantizes camera scale into the discrete buckets actually needed by DOM cards
 * (image DPR steps > 1.0, ReferenceThumbItem at 1.0 / 2.0, and high-scale >= 1.8 / 2.5),
 * eliminating redundant React state updates across 0.10..0.99 zoom ranges.
 */
export function quantizeCardScaleTier(scale: number): number {
  if (!Number.isFinite(scale) || scale < 1.0) return 0.9;
  if (scale < 1.5) return 1.25;
  if (scale <= 1.8) return 1.75;
  if (scale < 2.0) return 1.9;
  if (scale <= 2.5) return 2.25;
  if (scale <= 3.5) return 3.0;
  return 4.0;
}

export interface GridPatternSpec {
  spacing: number;
  tileSize: number;
  dotRadiusTile: number;
  dotRadiusCss: number;
}

export const DEFAULT_GRID_DOT_RADIUS_CSS = 1.76;

/**
 * Computes screen-space grid spacing proportional to the canvas scale so dot spacing
 * shrinks smoothly as the canvas zooms out (no discontinuous 2x jumps), clamped only
 * above the minimum physical dot diameter.
 */
export function computeGridDisplaySpacing(
  scale: number,
  baseWorldStep: number = 48,
  minScreenSpacing: number = DEFAULT_GRID_DOT_RADIUS_CSS * 2.1
): number {
  const safeScale = Number.isFinite(scale) && scale > 0.001 ? scale : 0.001;
  const safeStep = Math.max(1, baseWorldStep);
  return Math.max(minScreenSpacing, safeStep * safeScale);
}

/**
 * Computes tile dimensions and tile-space dot radius so every dot maintains a constant
 * screen-space size across the entire zoom range (10%..500%) while spacing scales with zoom.
 */
export function computeGridPatternSpec(
  scale: number,
  dpr: number,
  baseWorldStep: number = 48,
  dotRadiusCss: number = DEFAULT_GRID_DOT_RADIUS_CSS,
  isGestureActive: boolean = false
): GridPatternSpec {
  const safeDotRadius =
    Number.isFinite(dotRadiusCss) && dotRadiusCss > 0.25 ? dotRadiusCss : DEFAULT_GRID_DOT_RADIUS_CSS;
  const safeDpr = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  const spacing = computeGridDisplaySpacing(scale, baseWorldStep, safeDotRadius * 2.1);
  const deviceSpacing = spacing * safeDpr;
  // Use a single fixed 128px tile during active gestures to prevent per-frame offscreen canvas
  // reallocations and createPattern rebuilds, and discrete power-of-two buckets at rest.
  const tileSize = isGestureActive
    ? 128
    : deviceSpacing >= 384
    ? 512
    : deviceSpacing >= 192
    ? 256
    : deviceSpacing >= 96
    ? 128
    : 64;
  const dotRadiusTile = safeDotRadius * (tileSize / spacing);
  return {
    spacing,
    tileSize,
    dotRadiusTile,
    dotRadiusCss: safeDotRadius,
  };
}

/**
 * Defers cold decoding of raw high-res imageUrl/originalImageUrl inside NanoLodCanvas
 * during active zoom-out gestures when no thumbnail or cached bitmap is ready yet.
 */
export function shouldDeferNanoColdFallback(
  hasCachedOrThumb: boolean,
  isGestureActive: boolean,
  isZoomingOut: boolean
): boolean {
  return Boolean(!hasCachedOrThumb && isGestureActive && isZoomingOut);
}

/**
 * Previously enabled single-texture world snapshot blitting in NanoLodCanvas below the Nano-LOD threshold
 * during active camera gestures. Disabled so 10% zoom panning/dragging keeps crisp per-card rendering.
 */
export function shouldUseNanoGestureSnapshot(
  _scale: number,
  _cardCount: number,
  _isGestureActive: boolean,
  _isZoomingOut: boolean,
  _isOverviewMode: boolean,
  _isDragging: boolean
): boolean {
  return false;
}

export interface ZoomHudState {
  pct: number;
  label: '远景' | '中景' | '近景' | '特写';
  colorClass: string;
  zoomInDisabled: boolean;
}

/**
 * Computes ZoomControlGroup display metadata from raw camera scale for zero-re-render DOM updates.
 */
export function formatZoomHudState(scale: number): ZoomHudState {
  const safeScale = Number.isFinite(scale) ? scale : 1;
  const pct = Math.round(safeScale * 100);
  let label: ZoomHudState['label'];
  let colorClass: string;
  if (pct < 40) {
    label = '远景';
    colorClass = 'text-blue-500 dark:text-blue-400';
  } else if (pct < 100) {
    label = '中景';
    colorClass = 'text-emerald-500 dark:text-emerald-400';
  } else if (pct < 200) {
    label = '近景';
    colorClass = 'text-amber-500 dark:text-amber-400';
  } else {
    label = '特写';
    colorClass = 'text-rose-500 dark:text-rose-400';
  }
  return {
    pct,
    label,
    colorClass,
    zoomInDisabled: safeScale >= 4.99,
  };
}

export interface FpsHudBadge {
  text: string;
  dotClassName: string;
}

/**
 * Formats FPS indicator text and status dot classes for direct DOM updates without React re-renders.
 */
export function formatFpsHudBadge(fps: number): FpsHudBadge {
  const safeFps = Number.isFinite(fps) ? Math.max(0, Math.round(fps)) : 60;
  const colorClass =
    safeFps >= 58
      ? 'bg-emerald-500 animate-pulse'
      : safeFps >= 45
      ? 'bg-teal-500'
      : safeFps >= 30
      ? 'bg-amber-500'
      : 'bg-red-500';
  return {
    text: String(safeFps),
    dotClassName: `w-1.5 h-1.5 rounded-full ${colorClass} shrink-0`,
  };
}

/**
 * Avoids shrinking and clearing CardImageCanvas backing buffers when DPR steps down
 * slightly on zoom-out, while allowing growth and bounds-capped shrinkage when oversampled > 2.25x.
 */
export function shouldPreserveCardCanvasBackingStore(
  prevPxW: number,
  prevPxH: number,
  targetPxW: number,
  targetPxH: number,
  effectiveShowOriginal: boolean,
  isGenerating: boolean,
  isGestureActive: boolean = false
): boolean {
  if (isGenerating) return false;
  if (prevPxW <= 0 || prevPxH <= 0 || targetPxW <= 0 || targetPxH <= 0) return false;
  // During an active zoom/pan gesture or tween, never downsize and wipe an already-rasterized
  // backing buffer; let the GPU compositor scale it smoothly and resize once at idle.
  if (isGestureActive && prevPxW >= targetPxW && prevPxH >= targetPxH) {
    return true;
  }
  if (effectiveShowOriginal) return false;
  return (
    prevPxW >= targetPxW &&
    prevPxH >= targetPxH &&
    prevPxW <= targetPxW * 2.25 &&
    prevPxH <= targetPxH * 2.25
  );
}

/**
 * Defers tearing down 4K original textures while actively zooming out or animating,
 * keeping GPU-cached high-res bitmaps intact until the camera settles.
 */
export function shouldDeferOriginalTierDowngrade(
  scale: number,
  isGestureActive: boolean,
  isZoomingOut: boolean,
  isTweenZooming: boolean
): boolean {
  if (scale >= 2.0) return false;
  return Boolean(isGestureActive || isZoomingOut || isTweenZooming);
}

/**
 * Defers tearing down 4K original textures for cards that shift outside the viewport
 * during active camera gestures, zoom-outs, or programmatic tweens (e.g. cursor-anchored
 * zoom-out while still >= 200%), avoiding synchronous 4K canvas redraws mid-motion.
 */
export function shouldDeferOffscreenOriginalDowngrade(
  isGestureActive: boolean,
  isZoomingOut: boolean,
  isTweenZooming: boolean
): boolean {
  return Boolean(isGestureActive || isZoomingOut || isTweenZooming);
}

export interface CardCanvasGestureRedrawCheck {
  isGestureActive: boolean;
  hasPaintedFrame: boolean;
  sameCardAndImage: boolean;
  sameDimensions: boolean;
  hasBackingStore: boolean;
  isGenerating: boolean;
  hasActiveTransition: boolean;
  isUpgradingToOriginal: boolean;
}

/**
 * Skips redundant synchronous canvas clear/draw passes during active camera gestures
 * (such as crossing 200% downward or flipping smoothing quality) when the card already
 * has a valid painted bitmap for the same media and dimensions.
 */
export function shouldSkipCardCanvasGestureRedraw(
  params: CardCanvasGestureRedrawCheck
): boolean {
  if (!params.isGestureActive) return false;
  if (!params.hasPaintedFrame || !params.hasBackingStore) return false;
  if (!params.sameCardAndImage || !params.sameDimensions) return false;
  if (params.isGenerating || params.hasActiveTransition) return false;
  if (params.isUpgradingToOriginal) return false;
  return true;
}

/**
 * Thresholds CSS outline/padding updates on selected cards during continuous zoom
 * so tiny sub-pixel deltas at >200% scale do not trigger per-frame paint invalidation.
 */
export function shouldSyncOutlineWidth(
  prevWidthPx: number | null,
  nextWidthPx: number,
  minDeltaPx: number = 0.15
): boolean {
  if (!Number.isFinite(nextWidthPx)) return false;
  if (prevWidthPx === null || !Number.isFinite(prevWidthPx)) return true;
  if (nextWidthPx === 0 && prevWidthPx !== 0) return true;
  if (prevWidthPx === 0 && nextWidthPx !== 0) return true;
  return Math.abs(nextWidthPx - prevWidthPx) >= minDeltaPx;
}

export interface NanoCanvasRenderQuality {
  dprCap: number;
  imageSmoothingQuality: 'low' | 'high';
}

/**
 * Drops NanoLodCanvas backing resolution and resampling quality during active gestures or
 * fast zoom-outs, restoring 1.5x DPR and high-quality smoothing once settled.
 */
export function computeNanoCanvasRenderQuality(
  isGestureActive: boolean,
  isZoomingOut: boolean,
  simplifyCard: boolean
): NanoCanvasRenderQuality {
  if (isGestureActive || isZoomingOut || simplifyCard) {
    return { dprCap: 1, imageSmoothingQuality: 'low' };
  }
  return { dprCap: 1.5, imageSmoothingQuality: 'high' };
}

/**
 * Compares two ID lists to avoid allocating fresh selection arrays or triggering full-tree renders.
 */
export function areStringArraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Computes the target DPR for CardImageCanvas:
 * - When `effectiveShowOriginal` is false (< 200% or deferred gesture), caps buffer to the 1200px proxy edge.
 * - When `effectiveShowOriginal` is true and the original image is loaded, matches the original image's
 *   native pixel resolution directly, capped at 4K (4096px max edge / 4096x4096 pixel budget).
 */
export function computeCardCanvasTargetDpr(
  cardWidth: number,
  cardHeight: number,
  screenDpr: number,
  requestedDpr: number,
  effectiveShowOriginal: boolean,
  originalNaturalWidth: number = 0,
  originalNaturalHeight: number = 0
): number {
  const safeW = Math.max(1, cardWidth);
  const safeH = Math.max(1, cardHeight);
  const maxCardEdge = Math.max(safeW, safeH);
  const safeScreenDpr = Math.max(1, screenDpr || 1);
  const baseDpr = Math.max(safeScreenDpr, requestedDpr || safeScreenDpr);
  const maxFullDpr = Math.max(safeScreenDpr, 1200 / maxCardEdge);

  if (effectiveShowOriginal && originalNaturalWidth > 0 && originalNaturalHeight > 0) {
    const max4kDpr = Math.max(safeScreenDpr, 4096 / maxCardEdge);
    const nativeOrigDpr = Math.max(
      originalNaturalWidth / safeW,
      originalNaturalHeight / safeH
    );
    const targetOrigDpr = Math.min(Math.max(safeScreenDpr, nativeOrigDpr), max4kDpr);
    const max4kBudget = 4096 * 4096;
    const byArea = Math.sqrt(max4kBudget / Math.max(1, Math.round(safeW) * Math.round(safeH)));
    return Math.max(1, Math.min(targetOrigDpr, byArea));
  }

  return Math.min(baseDpr, maxFullDpr);
}

