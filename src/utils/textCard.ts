import type { CardData } from '../components/GenerationCard';
import { getCardSize } from '../components/GenerationCard';
import { stripMarkdownFormatting } from './markdownBlocks';

export const TEXT_CARD_DEFAULT_RATIO = '3:4';
export const TEXT_CARD_DEFAULT_RES = '2K';
export const TEXT_CARD_PLACEHOLDER_TITLE = '未命名文本';

const PLACEHOLDER_FULL_ANSWER_RE =
  /^(?:[（(]?\s*(?:无需输出|无|略|不需要|暂无|无需完整版)[^）)]*[）)]?|-+)$/i;

const GENERIC_TASK_TITLES = new Set([
  '',
  '尚未命名',
  '未命名任务',
  '新任务',
  '默认任务',
]);

export interface AgentAnswerCardSignal {
  text?: string | null;
  speak?: string | null;
  hasFullAnswer?: boolean;
}

/**
 * Determines whether an Agent answer event should spawn a canvas Text Card.
 * Strict rule: ONLY when the Agent explicitly produced a full version ("完整版"),
 * never for short-only status updates or placeholder phrases.
 */
export function shouldCreateTextCardForAnswer(signal: AgentAnswerCardSignal): boolean {
  if (!signal || signal.hasFullAnswer !== true) return false;
  const full = typeof signal.text === 'string' ? signal.text.trim() : '';
  if (!full || PLACEHOLDER_FULL_ANSWER_RE.test(full)) return false;
  return true;
}

export interface TextCardWheelCaptureInput {
  isSelected: boolean;
  isEditing: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/**
 * Pure decision function for wheel behavior over a Text Card:
 * - Unselected + hovered: returns false so wheel events zoom the canvas.
 * - Selected (or editing) without pinch-to-zoom modifier: returns true so wheel events scroll the text content.
 */
export function shouldTextCardCaptureWheel(input: TextCardWheelCaptureInput): boolean {
  if (input.ctrlKey || input.metaKey) return false;
  return Boolean(input.isSelected || input.isEditing);
}

export function deriveTextCardTitle(fullText: string, taskTitle?: string | null): string {
  const cleanTaskTitle = typeof taskTitle === 'string' ? taskTitle.trim() : '';
  if (cleanTaskTitle && !GENERIC_TASK_TITLES.has(cleanTaskTitle)) {
    return cleanTaskTitle.slice(0, 28);
  }

  const lines = String(fullText || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/^\|.*\|$/.test(line) || /^[-=_*]{3,}$/.test(line)) continue;
    const cleaned = stripMarkdownFormatting(line)
      .replace(/^[一二三四五六七八九十\d]+[、.．]\s*/, '')
      .trim();
    if (cleaned) {
      return cleaned.length > 26 ? `${cleaned.slice(0, 25)}…` : cleaned;
    }
  }

  return TEXT_CARD_PLACEHOLDER_TITLE;
}

export interface TextCardPlacementOptions {
  existingCards: ReadonlyArray<Pick<CardData, 'id' | 'x' | 'y' | 'ratio' | 'customWidth' | 'customHeight'>>;
  sourceCard?: Pick<CardData, 'id' | 'x' | 'y' | 'ratio' | 'customWidth' | 'customHeight'> | null;
  anchorCanvasPoint?: { x: number; y: number } | null;
  fallbackViewportCenterCanvas?: { x: number; y: number } | null;
  gap?: number;
}

function overlapsExistingCard(
  x: number,
  y: number,
  width: number,
  height: number,
  existingCards: ReadonlyArray<Pick<CardData, 'id' | 'x' | 'y' | 'ratio' | 'customWidth' | 'customHeight'>>,
  padding = 24
): boolean {
  return existingCards.some(card => {
    const dim = getCardSize(card);
    return (
      x < card.x + dim.width + padding &&
      x + width + padding > card.x &&
      y < card.y + dim.height + padding &&
      y + height + padding > card.y
    );
  });
}

function snapToCanvasGrid(value: number, step = 48): number {
  return Math.round(value / step) * step;
}

/**
 * Pure placement calculator for newly created Text Cards.
 * - When deriving/modifying an existing card (sourceCard provided), places to the right
 *   of the source card with collision avoidance — matching Image/Video fork placement.
 * - Otherwise places beside the Agent cursor (or viewport center) without overlapping existing cards.
 */
export function computeTextCardPlacement(
  options: TextCardPlacementOptions
): { x: number; y: number } {
  const gap = options.gap ?? 32;
  const targetDim = getCardSize({ ratio: TEXT_CARD_DEFAULT_RATIO });
  const existing = options.existingCards || [];

  if (options.sourceCard) {
    const sourceDim = getCardSize(options.sourceCard);
    let candidateX = options.sourceCard.x + sourceDim.width + gap;
    const candidateY = options.sourceCard.y;
    for (let attempt = 0; attempt < 16; attempt++) {
      const collides = existing.some(
        c => Math.abs(c.x - candidateX) < 80 && Math.abs(c.y - candidateY) < 80
      );
      if (!collides) break;
      candidateX += targetDim.width + gap;
    }
    return { x: Math.round(candidateX), y: Math.round(candidateY) };
  }

  const base = options.anchorCanvasPoint || options.fallbackViewportCenterCanvas || { x: 384, y: 144 };
  const startX = snapToCanvasGrid(base.x + (options.anchorCanvasPoint ? 48 : -targetDim.width / 2));
  const startY = snapToCanvasGrid(base.y + (options.anchorCanvasPoint ? -48 : -targetDim.height / 2));

  // Search spiral/column slots near the anchor so the card stays immediately visible and never overlaps.
  const stepX = targetDim.width + gap;
  const stepY = targetDim.height + gap;
  const offsets: Array<[number, number]> = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
    [2, 0],
    [0, -1],
    [2, 1],
    [3, 0],
  ];

  for (const [col, row] of offsets) {
    const cx = startX + col * stepX;
    const cy = startY + row * stepY;
    if (!overlapsExistingCard(cx, cy, targetDim.width, targetDim.height, existing)) {
      return { x: Math.round(cx), y: Math.round(cy) };
    }
  }

  return {
    x: Math.round(startX + stepX * 3),
    y: Math.round(startY),
  };
}

export interface CreateTextCardInput {
  id: string;
  x: number;
  y: number;
  title?: string;
  content: string;
  derivedFromId?: string;
  sourceAgentEventId?: string;
}

export function buildTextCardData(input: CreateTextCardInput): CardData {
  const content = String(input.content || '');
  const title = (input.title && input.title.trim()) || deriveTextCardTitle(content);
  return {
    id: input.id,
    x: input.x,
    y: input.y,
    state: 'completed',
    ratio: TEXT_CARD_DEFAULT_RATIO,
    res: TEXT_CARD_DEFAULT_RES,
    prompt: '',
    imageUrl: null,
    isText: true,
    textTitle: title,
    textContent: content,
    ...(input.derivedFromId ? { derivedFromId: input.derivedFromId } : {}),
    ...(input.sourceAgentEventId ? { sourceAgentEventId: input.sourceAgentEventId } : {}),
  };
}

export function buildManualTextCardData(id: string, x: number, y: number): CardData {
  return {
    id,
    x,
    y,
    state: 'completed',
    ratio: TEXT_CARD_DEFAULT_RATIO,
    res: TEXT_CARD_DEFAULT_RES,
    prompt: '',
    imageUrl: null,
    isText: true,
    textTitle: TEXT_CARD_PLACEHOLDER_TITLE,
    textContent: '',
  };
}
