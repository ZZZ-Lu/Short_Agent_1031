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

export interface TextCardNanoTitleLayoutInput {
  textTitle?: string | null;
  textContent?: string | null;
  width: number;
  height: number;
}

export interface TextCardNanoTitleLayout {
  title: string;
  lines: string[];
  fontSize: number;
  lineHeight: number;
  maxTextWidth: number;
  isPlaceholder: boolean;
}

const NANO_TITLE_LAYOUT_CACHE_LIMIT = 256;
const nanoTitleLayoutCache = new Map<string, TextCardNanoTitleLayout>();

const NANO_TITLE_FONT_TIERS: ReadonlyArray<{ ratio: number; maxLines: number }> = [
  { ratio: 0.28, maxLines: 2 },
  { ratio: 0.23, maxLines: 2 },
  { ratio: 0.19, maxLines: 3 },
  { ratio: 0.16, maxLines: 3 },
  { ratio: 0.135, maxLines: 4 },
  { ratio: 0.115, maxLines: 4 },
  { ratio: 0.095, maxLines: 4 },
];

const LINE_HEIGHT_MULTIPLIER = 1.24;

function estimateCharEmWidth(ch: string): number {
  const code = ch.charCodeAt(0);
  if (ch === ' ' || ch === '\t') return 0.34;
  if (code <= 0x7f) {
    if (".,:;!|'\"`iIl1".includes(ch)) return 0.38;
    if ((code >= 65 && code <= 90) || '@#%&*+=~'.includes(ch)) return 0.72;
    return 0.58;
  }
  if (code > 0x2e7f) return 1.02;
  return 0.66;
}

function estimateStringWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) {
    em += estimateCharEmWidth(ch);
  }
  return em * fontSize;
}

function resolveNanoCardTitle(
  textTitle?: string | null,
  textContent?: string | null
): { title: string; isPlaceholder: boolean } {
  const trimmedTitle = typeof textTitle === 'string' ? textTitle.replace(/\s+/g, ' ').trim() : '';
  if (trimmedTitle && trimmedTitle !== TEXT_CARD_PLACEHOLDER_TITLE) {
    return { title: trimmedTitle, isPlaceholder: false };
  }
  const trimmedContent = typeof textContent === 'string' ? textContent.trim() : '';
  if (trimmedContent) {
    const derived = deriveTextCardTitle(trimmedContent).replace(/\s+/g, ' ').trim();
    if (derived && derived !== TEXT_CARD_PLACEHOLDER_TITLE) {
      return { title: derived, isPlaceholder: false };
    }
  }
  return { title: TEXT_CARD_PLACEHOLDER_TITLE, isPlaceholder: true };
}

function wrapCharsGreedy(chars: string[], maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  let current = '';
  let currentW = 0;
  for (const ch of chars) {
    const chW = estimateCharEmWidth(ch) * fontSize;
    if (current && currentW + chW > maxWidth) {
      lines.push(current.trimEnd());
      current = ch === ' ' ? '' : ch;
      currentW = current ? chW : 0;
    } else {
      current += ch;
      currentW += chW;
    }
  }
  if (current.trim()) {
    lines.push(current.trim());
  }
  return lines;
}

function wrapTitleLines(title: string, maxWidth: number, fontSize: number): string[] {
  if (!title) return [];
  const hasSpaces = /\s/.test(title);
  if (!hasSpaces) {
    const chars = Array.from(title);
    const greedy = wrapCharsGreedy(chars, maxWidth, fontSize);
    if (greedy.length >= 2) {
      const totalWidth = estimateStringWidth(title, fontSize);
      const targetWidth = Math.min(maxWidth, (totalWidth / greedy.length) * 1.08);
      const balanced = wrapCharsGreedy(chars, targetWidth, fontSize);
      if (balanced.length === greedy.length) {
        return balanced;
      }
    }
    return greedy;
  }

  const tokens = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  let currentW = 0;
  const spaceW = estimateCharEmWidth(' ') * fontSize;

  for (const token of tokens) {
    const tokenW = estimateStringWidth(token, fontSize);
    if (!current) {
      if (tokenW <= maxWidth) {
        current = token;
        currentW = tokenW;
      } else {
        const splitToken = wrapCharsGreedy(Array.from(token), maxWidth, fontSize);
        if (splitToken.length > 1) {
          lines.push(...splitToken.slice(0, -1));
        }
        current = splitToken[splitToken.length - 1] || '';
        currentW = estimateStringWidth(current, fontSize);
      }
      continue;
    }

    if (currentW + spaceW + tokenW <= maxWidth) {
      current += ` ${token}`;
      currentW += spaceW + tokenW;
    } else {
      lines.push(current);
      if (tokenW <= maxWidth) {
        current = token;
        currentW = tokenW;
      } else {
        const splitToken = wrapCharsGreedy(Array.from(token), maxWidth, fontSize);
        if (splitToken.length > 1) {
          lines.push(...splitToken.slice(0, -1));
        }
        current = splitToken[splitToken.length - 1] || '';
        currentW = estimateStringWidth(current, fontSize);
      }
    }
  }

  if (current) {
    lines.push(current);
  }
  return lines;
}

function truncateLineWithEllipsis(line: string, maxWidth: number, fontSize: number): string {
  const ellipsis = '…';
  const ellipsisW = estimateCharEmWidth(ellipsis) * fontSize;
  const budget = Math.max(0, maxWidth - ellipsisW);
  const chars = Array.from(line.trimEnd());
  let out = '';
  let w = 0;
  for (const ch of chars) {
    const chW = estimateCharEmWidth(ch) * fontSize;
    if (w + chW > budget) break;
    out += ch;
    w += chW;
  }
  const trimmed = out.trimEnd();
  return trimmed ? `${trimmed}${ellipsis}` : ellipsis;
}

/**
 * Pure, DOM-free big-title layout calculator for Text Card NanoLOD rendering.
 * Picks the largest typographic tier that fits cleanly inside the card cover without
 * calling Canvas measureText per frame, and caches layouts in a bounded Map.
 */
export function computeTextCardNanoTitleLayout(
  input: TextCardNanoTitleLayoutInput
): TextCardNanoTitleLayout {
  const width = Math.max(40, Math.round(input.width || 0));
  const height = Math.max(40, Math.round(input.height || 0));
  const { title, isPlaceholder } = resolveNanoCardTitle(input.textTitle, input.textContent);

  const cacheKey = `${title}|${isPlaceholder ? 1 : 0}|${width}x${height}`;
  const cached = nanoTitleLayoutCache.get(cacheKey);
  if (cached) return cached;

  const padX = Math.round(width * 0.1);
  const padY = Math.round(height * 0.12);
  const maxTextWidth = Math.max(32, width - padX * 2);
  const maxTextHeight = Math.max(32, height - padY * 2);
  const minDim = Math.min(maxTextWidth, maxTextHeight);

  let chosen: TextCardNanoTitleLayout | null = null;

  for (const tier of NANO_TITLE_FONT_TIERS) {
    const fontSize = Math.max(18, Math.min(112, Math.round(minDim * tier.ratio)));
    const lineHeight = Math.round(fontSize * LINE_HEIGHT_MULTIPLIER);
    const lines = wrapTitleLines(title, maxTextWidth, fontSize);
    if (
      lines.length > 0 &&
      lines.length <= tier.maxLines &&
      lines.length * lineHeight <= maxTextHeight
    ) {
      chosen = {
        title,
        lines,
        fontSize,
        lineHeight,
        maxTextWidth,
        isPlaceholder,
      };
      break;
    }
  }

  if (!chosen) {
    const fallbackTier = NANO_TITLE_FONT_TIERS[NANO_TITLE_FONT_TIERS.length - 1];
    const fontSize = Math.max(18, Math.min(112, Math.round(minDim * fallbackTier.ratio)));
    const lineHeight = Math.round(fontSize * LINE_HEIGHT_MULTIPLIER);
    const maxFittingLines = Math.max(
      1,
      Math.min(fallbackTier.maxLines, Math.floor(maxTextHeight / lineHeight))
    );
    const wrapped = wrapTitleLines(title, maxTextWidth, fontSize);
    const clampedLines = wrapped.slice(0, maxFittingLines);
    if (wrapped.length > maxFittingLines && clampedLines.length > 0) {
      const lastIdx = clampedLines.length - 1;
      const overflowSource = `${clampedLines[lastIdx]}${wrapped[maxFittingLines] ? ' ' + wrapped[maxFittingLines] : ''}`;
      clampedLines[lastIdx] = truncateLineWithEllipsis(overflowSource, maxTextWidth, fontSize);
    }
    chosen = {
      title,
      lines: clampedLines.length > 0 ? clampedLines : [title],
      fontSize,
      lineHeight,
      maxTextWidth,
      isPlaceholder,
    };
  }

  if (nanoTitleLayoutCache.size >= NANO_TITLE_LAYOUT_CACHE_LIMIT) {
    const oldestKey = nanoTitleLayoutCache.keys().next().value;
    if (oldestKey !== undefined) {
      nanoTitleLayoutCache.delete(oldestKey);
    }
  }
  nanoTitleLayoutCache.set(cacheKey, chosen);
  return chosen;
}

