export interface PromptCacheUsageStats {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cacheHitTokens?: number;
  cacheMissTokens?: number;
  hitRate?: number;
}

export interface SplitPromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export const STATIC_MAIN_PROMPT_HEADINGS = new Set([
  '角色与通用准则',
  '背景',
  '当前阶段职责与工作指南',
  '工作指南',
  '输出格式',
  '可用工具',
]);

export const DYNAMIC_MAIN_PROMPT_HEADINGS = new Set([
  '用户指令',
  '认知状态',
  '工具执行结果',
  '页面观察',
]);

const ALL_KNOWN_MAIN_HEADINGS = new Set([
  ...STATIC_MAIN_PROMPT_HEADINGS,
  ...DYNAMIC_MAIN_PROMPT_HEADINGS,
]);

const NUDGE_MARKER = '【⚠️ 系统重要提示：';

function stripTrailingNudgeFromLastStaticSection(sections: Array<{ heading: string; content: string }>): {
  cleanedSections: Array<{ heading: string; content: string }>;
  detachedNudge: string;
} {
  if (sections.length === 0) return { cleanedSections: sections, detachedNudge: '' };
  const last = sections[sections.length - 1];
  if (!STATIC_MAIN_PROMPT_HEADINGS.has(last.heading)) {
    return { cleanedSections: sections, detachedNudge: '' };
  }
  const idx = last.content.indexOf(NUDGE_MARKER);
  if (idx === -1) {
    return { cleanedSections: sections, detachedNudge: '' };
  }
  const before = last.content.slice(0, idx).trim();
  const detachedNudge = last.content.slice(idx).trim();
  const cleanedSections = [
    ...sections.slice(0, -1),
    ...(before ? [{ heading: last.heading, content: before }] : []),
  ];
  return { cleanedSections, detachedNudge };
}

/**
 * Splits a rendered main-loop prompt into an immutable `system` prefix and a
 * volatile `user` suffix so LLM Prefix Caching can reuse the static rules and
 * loaded tool schemas across turns and tasks.
 *
 * Uses exact line matching against the top-level heading whitelist rather than
 * `\b` regex boundaries (which fail on CJK characters) and ignores arbitrary
 * nested `#` headings inside `cardContext` or script text.
 */
export function splitPromptForPrefixCache(rawPrompt: string): SplitPromptResult {
  if (!rawPrompt || typeof rawPrompt !== 'string') {
    return { systemPrompt: '', userPrompt: rawPrompt || '' };
  }

  const lines = rawPrompt.split(/\r?\n/);
  const parsedSections: Array<{ heading: string; lines: string[] }> = [];
  const preambleLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^#\s+(.+)$/);
    const candidateHeading = headingMatch ? headingMatch[1].trim() : '';

    if (candidateHeading && ALL_KNOWN_MAIN_HEADINGS.has(candidateHeading)) {
      parsedSections.push({ heading: candidateHeading, lines: [line] });
    } else if (parsedSections.length > 0) {
      parsedSections[parsedSections.length - 1].lines.push(line);
    } else {
      preambleLines.push(line);
    }
  }

  if (parsedSections.length <= 1) {
    return { systemPrompt: '', userPrompt: rawPrompt };
  }

  const rawSectionObjects = parsedSections
    .map((sec) => ({
      heading: sec.heading,
      content: sec.lines.join('\n').trim(),
    }))
    .filter((sec) => sec.content.length > 0);

  const { cleanedSections, detachedNudge } = stripTrailingNudgeFromLastStaticSection(rawSectionObjects);

  const systemParts: string[] = [];
  const userParts: string[] = [];
  const preambleText = preambleLines.join('\n').trim();
  if (preambleText) {
    userParts.push(preambleText);
  }

  for (const sec of cleanedSections) {
    if (STATIC_MAIN_PROMPT_HEADINGS.has(sec.heading)) {
      systemParts.push(sec.content);
    } else {
      userParts.push(sec.content);
    }
  }

  if (detachedNudge) {
    userParts.push(detachedNudge);
  }

  if (systemParts.length === 0 || userParts.length === 0) {
    return { systemPrompt: '', userPrompt: rawPrompt };
  }

  return {
    systemPrompt: systemParts.join('\n\n'),
    userPrompt: userParts.join('\n\n'),
  };
}

const STATE_OUTPUT_HEADING = '【输出格式（严格输出合法 JSON）】';
const DYNAMIC_STATE_HEADINGS = [
  '【任务背景与聚焦目标】',
  '【当前认知状态（上一轮旧状态）】',
  '【本轮最新输入与主循环输出】',
  '【本轮最新流向与主循环输出】',
];

function findLineHeadingIndex(text: string, heading: string): number {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\r?\\n)${escaped}\\s*(?:\\r?\\n|$)`).exec(text);
  if (!match) return -1;
  return match[0].startsWith('\n') || match[0].startsWith('\r')
    ? match.index + (match[0].startsWith('\r\n') ? 2 : 1)
    : match.index;
}

/**
 * Splits the rendered cognitive state-node prompt into:
 * - `systemPrompt`: immutable role description + full JSON schema specification
 * - `userPrompt`: task background (user goal + cardContext), previous state, and latest turn output
 *
 * Supports both the new static-first `stateNodePrompt.txt` layout and legacy or
 * user-customized layouts where `【输出格式...】` appears at the bottom.
 */
export function splitStateNodePromptForPrefixCache(renderedPrompt: string): SplitPromptResult {
  const fallbackSystem = '你是一个严格输出 JSON 的认知状态增量合并与整理节点。';
  if (!renderedPrompt || typeof renderedPrompt !== 'string') {
    return { systemPrompt: fallbackSystem, userPrompt: renderedPrompt || '' };
  }

  const normalized = renderedPrompt.trim();
  const idxOutput = findLineHeadingIndex(normalized, STATE_OUTPUT_HEADING);
  const dynamicIndices = DYNAMIC_STATE_HEADINGS
    .map(h => findLineHeadingIndex(normalized, h))
    .filter(idx => idx !== -1);

  if (idxOutput === -1 || dynamicIndices.length === 0) {
    return { systemPrompt: fallbackSystem, userPrompt: renderedPrompt };
  }

  const firstDynamicIdx = Math.min(...dynamicIndices);

  if (idxOutput < firstDynamicIdx) {
    // New layout: Role + 【输出格式】 come first, then all dynamic sections in userPrompt
    const systemPrompt = normalized.slice(0, firstDynamicIdx).trim();
    const userPrompt = normalized.slice(firstDynamicIdx).trim();
    if (systemPrompt.length >= 64 && userPrompt.length > 0) {
      return { systemPrompt, userPrompt };
    }
    return { systemPrompt: fallbackSystem, userPrompt: renderedPrompt };
  }

  // Legacy/custom layout: Role -> dynamic sections -> 【输出格式】
  const endOfDynamic = idxOutput;
  const roleHeader = normalized.slice(0, firstDynamicIdx).trim();
  const dynamicBody = normalized.slice(firstDynamicIdx, endOfDynamic).trim();
  const outputSpec = normalized.slice(idxOutput).trim();

  const systemPrompt = [roleHeader, outputSpec].filter(Boolean).join('\n\n').trim();
  if (systemPrompt.length >= 64 && dynamicBody.length > 0) {
    return { systemPrompt, userPrompt: dynamicBody };
  }
  return { systemPrompt: fallbackSystem, userPrompt: renderedPrompt };
}

function toFiniteNonNegInt(val: unknown): number | undefined {
  if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) return undefined;
  return Math.round(val);
}

/**
 * Normalizes LLM provider `usage` payloads across DeepSeek, OpenAI, and
 * OpenAI-compatible providers into unified cache telemetry.
 */
export function normalizeTokenUsage(rawUsage: unknown): PromptCacheUsageStats | undefined {
  if (!rawUsage || typeof rawUsage !== 'object') return undefined;
  const u = rawUsage as Record<string, any>;

  const promptTokens = toFiniteNonNegInt(u.prompt_tokens ?? u.input_tokens);
  const completionTokens = toFiniteNonNegInt(u.completion_tokens ?? u.output_tokens);
  const totalTokens = toFiniteNonNegInt(u.total_tokens);

  const detailsCached = toFiniteNonNegInt(u.prompt_tokens_details?.cached_tokens ?? u.input_tokens_details?.cached_tokens);
  const directHit = toFiniteNonNegInt(u.prompt_cache_hit_tokens ?? u.cached_tokens);
  const cacheHitTokens = directHit ?? detailsCached;

  const directMiss = toFiniteNonNegInt(u.prompt_cache_miss_tokens);
  const cacheMissTokens =
    directMiss ??
    (promptTokens !== undefined && cacheHitTokens !== undefined
      ? Math.max(0, promptTokens - cacheHitTokens)
      : undefined);

  if (
    promptTokens === undefined &&
    completionTokens === undefined &&
    totalTokens === undefined &&
    cacheHitTokens === undefined &&
    cacheMissTokens === undefined
  ) {
    return undefined;
  }

  const hitRate =
    promptTokens !== undefined && promptTokens > 0 && cacheHitTokens !== undefined
      ? Number((cacheHitTokens / promptTokens).toFixed(4))
      : undefined;

  return {
    ...(promptTokens !== undefined ? { promptTokens } : {}),
    ...(completionTokens !== undefined ? { completionTokens } : {}),
    ...(totalTokens !== undefined ? { totalTokens } : {}),
    ...(cacheHitTokens !== undefined ? { cacheHitTokens } : {}),
    ...(cacheMissTokens !== undefined ? { cacheMissTokens } : {}),
    ...(hitRate !== undefined ? { hitRate } : {}),
  };
}
