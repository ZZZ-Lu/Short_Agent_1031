export interface DockOcclusionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width?: number;
  height?: number;
}

export interface UnobstructedViewportRegion {
  openLeft: number;
  openRight: number;
  openWidth: number;
  centerX: number;
  centerY: number;
  occupiedRight: number;
  usedFallbackCenter: boolean;
}

export interface FocusCardCameraParams {
  cardX: number;
  cardY: number;
  cardW: number;
  cardH: number;
  viewportWidth: number;
  viewportHeight: number;
  dockRects: readonly DockOcclusionRect[];
  targetScale?: number;
  minOpenWidth?: number;
}

export interface FocusCardCameraResult extends UnobstructedViewportRegion {
  x: number;
  y: number;
  scale: number;
}

export const DEFAULT_MIN_OPEN_CANVAS_WIDTH = 160;
export const DEFAULT_FOCUS_CARD_SCALE = 1.0;

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Computes the horizontal center and bounds of the remaining open canvas area
 * outside left-docked Script / Assets / Images panels.
 *
 * Pure data-only helper (no DOM dependencies).
 */
export function computeUnobstructedViewportRegion(params: {
  viewportWidth: number;
  viewportHeight: number;
  dockRects: readonly DockOcclusionRect[];
  minOpenWidth?: number;
}): UnobstructedViewportRegion {
  const safeWidth = isValidNumber(params.viewportWidth) && params.viewportWidth > 0 ? params.viewportWidth : 1440;
  const safeHeight = isValidNumber(params.viewportHeight) && params.viewportHeight > 0 ? params.viewportHeight : 900;
  const minOpenWidth =
    isValidNumber(params.minOpenWidth) && params.minOpenWidth >= 0
      ? params.minOpenWidth
      : DEFAULT_MIN_OPEN_CANVAS_WIDTH;

  let maxDockRight = 0;
  for (const rect of params.dockRects) {
    if (!rect) continue;
    const width = isValidNumber(rect.width) ? rect.width : rect.right - rect.left;
    const height = isValidNumber(rect.height) ? rect.height : rect.bottom - rect.top;
    if (!(width > 0 && height > 0)) continue;
    if (rect.right <= 0 || rect.bottom <= 0) continue;
    if (rect.left >= safeWidth || rect.top >= safeHeight) continue;

    if (rect.right > maxDockRight) {
      maxDockRight = rect.right;
    }
  }

  const occupiedRight = Math.min(safeWidth, Math.max(0, maxDockRight));
  const openWidth = Math.max(0, safeWidth - occupiedRight);
  const centerY = safeHeight / 2;

  if (openWidth < minOpenWidth) {
    return {
      openLeft: occupiedRight,
      openRight: safeWidth,
      openWidth,
      centerX: safeWidth / 2,
      centerY,
      occupiedRight,
      usedFallbackCenter: true,
    };
  }

  return {
    openLeft: occupiedRight,
    openRight: safeWidth,
    openWidth,
    centerX: occupiedRight + openWidth / 2,
    centerY,
    occupiedRight,
    usedFallbackCenter: false,
  };
}

/**
 * Computes the camera transform `{ x, y, scale }` needed to zoom to `targetScale`
 * (default 100% / 1.0) and place the target card's center in the middle of the
 * open viewport region outside the left Script/Asset/Image dock cards.
 *
 * Pure data-only helper (no DOM dependencies).
 */
export function computeFocusCardCameraTransform(
  params: FocusCardCameraParams
): FocusCardCameraResult {
  const targetScale =
    isValidNumber(params.targetScale) && params.targetScale > 0
      ? params.targetScale
      : DEFAULT_FOCUS_CARD_SCALE;

  const region = computeUnobstructedViewportRegion({
    viewportWidth: params.viewportWidth,
    viewportHeight: params.viewportHeight,
    dockRects: params.dockRects,
    minOpenWidth: params.minOpenWidth,
  });

  const cardCenterX = params.cardX + params.cardW / 2;
  const cardCenterY = params.cardY + params.cardH / 2;

  return {
    ...region,
    x: region.centerX - cardCenterX * targetScale,
    y: region.centerY - cardCenterY * targetScale,
    scale: targetScale,
  };
}
