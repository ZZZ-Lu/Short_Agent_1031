export type AgentCoordinateSpace = 'canvas' | 'screen';

export interface AgentCameraTransform {
  tx: number;
  ty: number;
  scale: number;
}

export interface AgentPositionedPoint {
  x: number;
  y: number;
  coordinateSpace?: AgentCoordinateSpace;
}

export interface RectBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width?: number;
  height?: number;
}

export function toScreenPoint(
  point: AgentPositionedPoint,
  camera: AgentCameraTransform
): { x: number; y: number } {
  if (point.coordinateSpace === 'screen') {
    return { x: point.x, y: point.y };
  }
  const scale = camera.scale || 1;
  return {
    x: point.x * scale + camera.tx,
    y: point.y * scale + camera.ty,
  };
}

export function toCanvasPoint(
  point: AgentPositionedPoint,
  camera: AgentCameraTransform
): { x: number; y: number } {
  if (point.coordinateSpace === 'screen') {
    const scale = camera.scale || 1;
    return {
      x: (point.x - camera.tx) / scale,
      y: (point.y - camera.ty) / scale,
    };
  }
  return { x: point.x, y: point.y };
}

export function resolveAgentCursorStoragePoint(
  tipScreenX: number,
  tipScreenY: number,
  canvasX: number,
  canvasY: number,
  isInDockCard: boolean
): { x: number; y: number; coordinateSpace: AgentCoordinateSpace } {
  if (isInDockCard) {
    return {
      x: tipScreenX,
      y: tipScreenY,
      coordinateSpace: 'screen',
    };
  }
  return {
    x: canvasX,
    y: canvasY,
    coordinateSpace: 'canvas',
  };
}

export function isPointInAnyRect(
  x: number,
  y: number,
  rects: readonly RectBounds[]
): boolean {
  for (const rect of rects) {
    const w = rect.width ?? (rect.right - rect.left);
    const h = rect.height ?? (rect.bottom - rect.top);
    if (w <= 0 || h <= 0) continue;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return true;
    }
  }
  return false;
}

export function isPointInDockCardRects(screenX: number, screenY: number): boolean {
  if (typeof document === 'undefined') return false;
  const dockCards = document.querySelectorAll('[data-dock-card="true"]');
  if (!dockCards.length) return false;
  const rects: RectBounds[] = [];
  dockCards.forEach((el) => {
    const r = el.getBoundingClientRect();
    rects.push({
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    });
  });
  return isPointInAnyRect(screenX, screenY, rects);
}
