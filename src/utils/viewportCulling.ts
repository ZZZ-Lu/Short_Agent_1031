import { AspectRatio, CARD_DIMENSIONS, getCardSize } from '../components/GenerationCard';
import { getBottomPanelHeight } from './cardLayout';
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
 * Includes the image area, gap, and dynamic bottom prompt/action panel height for generation cards.
 */
export function getCardDimensions(card: CardBounds): { width: number; height: number } {
  const dim = getCardSize(card);
  const isGenerationCard = !card.fileName && !card.isAsset;
  const visualWidth = isGenerationCard ? Math.max(dim.width, 480) : dim.width;
  if (!isGenerationCard) {
    return { width: visualWidth, height: dim.height };
  }
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

/**
 * Doubles grid spacing cleanly by powers of two when zoomed deep out so pattern
 * repetition stays below heavy fill-rate thresholds while keeping world alignment.
 */
export function computeGridDisplaySpacing(
  scale: number,
  baseWorldStep: number = 48,
  minScreenSpacing: number = 16
): number {
  const safeScale = Number.isFinite(scale) && scale > 0.001 ? scale : 0.001;
  const safeStep = Math.max(1, baseWorldStep);
  let spacing = safeStep * safeScale;
  let doublings = 0;
  while (spacing < minScreenSpacing && doublings < 6) {
    spacing *= 2;
    doublings += 1;
  }
  return spacing;
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
 * Enables single-texture world snapshot blitting in NanoLodCanvas below the Nano-LOD threshold
 * during active camera gestures on multi-card canvases (when not dragging individual cards or in Overview).
 */
export function shouldUseNanoGestureSnapshot(
  scale: number,
  cardCount: number,
  isGestureActive: boolean,
  isZoomingOut: boolean,
  isOverviewMode: boolean,
  isDragging: boolean
): boolean {
  if (!isGestureActive || isOverviewMode || isDragging) return false;
  if (scale >= getNanoLodThreshold()) return false;
  return cardCount >= 12 && (isZoomingOut || scale < getNanoLodThreshold());
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
  isGenerating: boolean
): boolean {
  if (effectiveShowOriginal || isGenerating) return false;
  if (prevPxW <= 0 || prevPxH <= 0 || targetPxW <= 0 || targetPxH <= 0) return false;
  return (
    prevPxW >= targetPxW &&
    prevPxH >= targetPxH &&
    prevPxW <= targetPxW * 2.25 &&
    prevPxH <= targetPxH * 2.25
  );
}
