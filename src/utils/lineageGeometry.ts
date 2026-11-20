export interface RectBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LiveDragDelta {
  draggingCardId: string;
  dx: number;
  dy: number;
}

export interface LiveNanoDragDelta {
  cardId: string;
  dx: number;
  dy: number;
}

export interface LineageSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Calculates the exact intersection point where the ray from (cx, cy)
 * towards (targetX, targetY) exits the rectangular boundary.
 */
export function getRectBorderIntersection(
  rectX: number,
  rectY: number,
  width: number,
  height: number,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const cx = rectX + width / 2;
  const cy = rectY + height / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return { x: cx, y: cy };
  }

  const hw = width / 2;
  const hh = height / 2;

  const sx = Math.abs(dx) > 0.001 ? hw / Math.abs(dx) : Infinity;
  const sy = Math.abs(dy) > 0.001 ? hh / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);

  return {
    x: cx + dx * s,
    y: cy + dy * s,
  };
}

/**
 * Resolves a card's live world position during active DOM or Nano-Canvas drags
 * without mutating or reading from DOM nodes.
 */
export function resolveLiveCardPosition(
  card: { id: string; x: number; y: number },
  activeSelectedSet: ReadonlySet<string>,
  domDelta?: LiveDragDelta | null,
  nanoDelta?: LiveNanoDragDelta | null
): { x: number; y: number } {
  if (domDelta) {
    if (
      domDelta.draggingCardId === card.id ||
      (activeSelectedSet.has(card.id) && activeSelectedSet.has(domDelta.draggingCardId))
    ) {
      return { x: card.x + domDelta.dx, y: card.y + domDelta.dy };
    }
  }

  if (nanoDelta) {
    if (
      nanoDelta.cardId === card.id ||
      (activeSelectedSet.has(card.id) && activeSelectedSet.has(nanoDelta.cardId))
    ) {
      return { x: card.x + nanoDelta.dx, y: card.y + nanoDelta.dy };
    }
  }

  return { x: card.x, y: card.y };
}

/**
 * Computes exact border-to-border line endpoints between two card world boxes.
 */
export function computeLineageSegment(source: RectBox, target: RectBox): LineageSegment {
  const srcCenterX = source.x + source.width / 2;
  const srcCenterY = source.y + source.height / 2;
  const tgtCenterX = target.x + target.width / 2;
  const tgtCenterY = target.y + target.height / 2;

  const startPoint = getRectBorderIntersection(
    source.x,
    source.y,
    source.width,
    source.height,
    tgtCenterX,
    tgtCenterY
  );
  const endPoint = getRectBorderIntersection(
    target.x,
    target.y,
    target.width,
    target.height,
    srcCenterX,
    srcCenterY
  );

  return {
    x1: startPoint.x,
    y1: startPoint.y,
    x2: endPoint.x,
    y2: endPoint.y,
  };
}

export function isSameLineageSegment(a: LineageSegment | undefined, b: LineageSegment): boolean {
  if (!a) return false;
  return (
    Math.abs(a.x1 - b.x1) < 0.01 &&
    Math.abs(a.y1 - b.y1) < 0.01 &&
    Math.abs(a.x2 - b.x2) < 0.01 &&
    Math.abs(a.y2 - b.y2) < 0.01
  );
}
