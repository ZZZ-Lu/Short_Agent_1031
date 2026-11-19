import {
  NodeModelConfig,
  ScriptTocConfig,
  ScriptTocConfidence,
  ScriptTocPatternTypeRule,
} from '../types/script';

export type TocItemType = 'episode' | 'scene' | 'chapter' | 'heading' | 'segment';

export interface TocItem {
  id: string;
  title: string;
  subTitle?: string;
  lineNumber: number;
  charIndex: number;
  type: TocItemType;
}

export type TocRecognitionState = 'idle' | 'pending' | 'ai' | 'heuristic' | 'fallback';

export const MIN_TOC_INFER_SCRIPT_LENGTH = 20;

export const BUILTIN_TOC_PATTERNS: readonly string[] = [
  '^【\\s*第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回][^】]*】.*',
  '^第\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回].*',
  '^\\d+\\s*[-—–]\\s*\\d+(?:\\s*(?:[日夜晨昏早晚内外景INTEXT.\\s].*)?|$)',
  '^【\\s*(?:场|场景|场次)?\\s*[0-9一二三四五六七八九十百千]+[^】]*】.*',
  '^第\\s*[0-9一二三四五六七八九十百千]+\\s*[场幕].*',
  '^(?:EPISODE|EP|CHAPTER|SCENE)\\s*#?\\s*\\d+.*',
];

const NEXT_LINE_SCENE_META_RX =
  /^(?:[日夜晨昏早晚黄昏清晨白昼午夜]+[\s/·]+[内外]+景?|[内外]+景?[\s/·]+[日夜晨昏早晚黄昏清晨白昼午夜]+)(?:\s+.*)?$/;

interface CompiledRule {
  regex: RegExp;
  explicitType?: TocItemType;
}

function normalizePatternType(rawType?: string): TocItemType | undefined {
  if (!rawType) return undefined;
  const lower = String(rawType).trim().toLowerCase();
  if (lower === 'episode' || lower === 'ep') return 'episode';
  if (lower === 'scene' || lower === 'shot') return 'scene';
  if (lower === 'chapter' || lower === 'act') return 'chapter';
  if (lower === 'heading' || lower === 'title') return 'heading';
  return undefined;
}

function sanitizeRegexFlags(flags?: string): string {
  const cleaned = String(flags || 'i')
    .replace(/[^imsuy]/g, '');
  return cleaned.includes('i') ? cleaned : `${cleaned}i`;
}

function tryCompileRegex(pattern: string, flags?: string): RegExp | null {
  const trimmed = String(pattern || '').trim();
  if (!trimmed) return null;
  try {
    return new RegExp(trimmed, sanitizeRegexFlags(flags));
  } catch {
    return null;
  }
}

/**
 * Deterministic lightweight signature for the structural sample of a script (first 4000 chars).
 * Avoids hashing the entire body on every single keystroke while accurately detecting
 * new scripts, pasted content, or major header format changes.
 */
export function computeScriptTocSignature(scriptText: string): string {
  const sample = (scriptText || '').slice(0, 4000).trim();
  if (!sample) return 'empty';
  // Extract first 25 non-empty lines (trimmed) so body-only edits deep in the script keep the signature stable,
  // while structural changes or pasting a new script produce a distinct signature.
  const structuralLines = sample
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 25)
    .join('\n');

  let hash = 2166136261;
  for (let i = 0; i < structuralLines.length; i++) {
    hash ^= structuralLines.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const bucket = Math.min(4000, sample.length);
  return `${(hash >>> 0).toString(36)}_${Math.floor(bucket / 500)}`;
}

export function buildTocAttemptKey(projectId: string, scriptText: string): string {
  return `${projectId || 'default'}::${computeScriptTocSignature(scriptText)}`;
}

export function hasValidTocPatterns(tocConfig?: ScriptTocConfig | null): boolean {
  if (!tocConfig) return false;
  if (Array.isArray(tocConfig.types) && tocConfig.types.some((t) => typeof t?.regex === 'string' && t.regex.trim().length > 0)) {
    return true;
  }
  if (typeof tocConfig.tocPattern === 'string' && tocConfig.tocPattern.trim().length > 0) {
    return true;
  }
  if (typeof tocConfig.scenePattern === 'string' && tocConfig.scenePattern.trim().length > 0) {
    return true;
  }
  if (Array.isArray(tocConfig.patterns) && tocConfig.patterns.some((p) => typeof p === 'string' && p.trim().length > 0)) {
    return true;
  }
  return false;
}

/**
 * Returns true only when `tocConfig` was genuinely produced by the LLM model node (`confidence === 'ai'`)
 * and contains valid patterns. Legacy configs (missing `confidence`) or fallback configs (`heuristic`/`fallback`)
 * are NOT treated as reusable AI configs so the app immediately upgrades to model recognition when possible.
 */
export function hasReusableAiTocConfig(
  tocConfig?: ScriptTocConfig | null,
  scriptText?: string
): boolean {
  if (!tocConfig || tocConfig.confidence !== 'ai') return false;
  if (!hasValidTocPatterns(tocConfig)) return false;
  if (scriptText && tocConfig.sampleSignature) {
    // Allow reuse when the script already has an AI config whose structural signature matches,
    // or when the existing AI config matches at least one heading in the current script.
    const currentSig = computeScriptTocSignature(scriptText);
    if (tocConfig.sampleSignature === currentSig) return true;
    const compiled = compileRulesFromTocConfig(tocConfig);
    if (compiled.length === 0) return false;
    const lines = scriptText.slice(0, 4000).split('\n');
    return lines.some((raw) => {
      const t = raw.trim();
      return t.length > 0 && compiled.some((rule) => rule.regex.test(t));
    });
  }
  return true;
}

export function shouldTriggerModelTocInference(params: {
  projectId: string;
  scriptText: string;
  tocConfig?: ScriptTocConfig | null;
  attemptedKeys: ReadonlySet<string>;
  force?: boolean;
}): boolean {
  const { projectId, scriptText, tocConfig, attemptedKeys, force } = params;
  if (!scriptText || scriptText.trim().length < MIN_TOC_INFER_SCRIPT_LENGTH) {
    return false;
  }
  if (force) return true;
  if (hasReusableAiTocConfig(tocConfig, scriptText)) {
    return false;
  }
  const attemptKey = buildTocAttemptKey(projectId, scriptText);
  return !attemptedKeys.has(attemptKey);
}

export function resolveTocRecognitionState(params: {
  projectId: string;
  scriptText: string;
  tocConfig?: ScriptTocConfig | null;
  isInferring: boolean;
  attemptedKeys: ReadonlySet<string>;
}): TocRecognitionState {
  const { projectId, scriptText, tocConfig, isInferring, attemptedKeys } = params;
  if (!scriptText || scriptText.trim().length === 0) {
    return 'idle';
  }
  if (isInferring) {
    return 'pending';
  }
  if (hasReusableAiTocConfig(tocConfig, scriptText)) {
    return 'ai';
  }
  if (scriptText.trim().length >= MIN_TOC_INFER_SCRIPT_LENGTH) {
    const attemptKey = buildTocAttemptKey(projectId, scriptText);
    if (!attemptedKeys.has(attemptKey)) {
      // Model node recognition has not yet been attempted for this project/script:
      // hold in `pending` rather than prematurely serving local regex fallback script.
      return 'pending';
    }
  }
  if (tocConfig?.confidence === 'heuristic') {
    return 'heuristic';
  }
  return 'fallback';
}

export function extractTocConfigFromResponse(
  data: any,
  sampleSignature?: string
): ScriptTocConfig {
  const flags = typeof data?.flags === 'string' && data.flags.trim() ? data.flags.trim() : 'gim';
  const tocPattern =
    typeof data?.tocPattern === 'string' && data.tocPattern.trim()
      ? data.tocPattern.trim()
      : typeof data?.pattern === 'string' && data.pattern.trim()
        ? data.pattern.trim()
        : undefined;
  const scenePattern =
    typeof data?.scenePattern === 'string' && data.scenePattern.trim()
      ? data.scenePattern.trim()
      : undefined;

  const normalizedTypes: ScriptTocPatternTypeRule[] = Array.isArray(data?.types)
    ? data.types
        .filter((entry: any) => entry && typeof entry.regex === 'string' && entry.regex.trim().length > 0)
        .map((entry: any) => ({
          regex: entry.regex.trim(),
          type: typeof entry.type === 'string' && entry.type.trim() ? entry.type.trim() : 'scene',
        }))
    : [];

  const patternSet = new Set<string>();
  for (const t of normalizedTypes) {
    patternSet.add(t.regex);
  }
  if (tocPattern) patternSet.add(tocPattern);
  if (scenePattern) patternSet.add(scenePattern);
  if (Array.isArray(data?.patterns)) {
    for (const p of data.patterns) {
      if (typeof p === 'string' && p.trim()) patternSet.add(p.trim());
    }
  }

  const confidence: ScriptTocConfidence =
    data?.confidence === 'ai'
      ? 'ai'
      : data?.confidence === 'heuristic'
        ? 'heuristic'
        : 'fallback';

  return {
    ...(tocPattern ? { tocPattern } : {}),
    ...(scenePattern ? { scenePattern } : {}),
    flags,
    patterns: Array.from(patternSet),
    ...(normalizedTypes.length > 0 ? { types: normalizedTypes } : {}),
    ...(typeof data?.patternDescription === 'string' && data.patternDescription.trim()
      ? { patternDescription: data.patternDescription.trim() }
      : {}),
    confidence,
    ...(typeof data?.fallbackReason === 'string' && data.fallbackReason.trim()
      ? { fallbackReason: data.fallbackReason.trim() }
      : {}),
    ...(typeof data?.modelUsed === 'string' && data.modelUsed.trim()
      ? { modelUsed: data.modelUsed.trim() }
      : {}),
    ...(sampleSignature ? { sampleSignature } : {}),
  };
}

export function createFallbackTocConfig(
  fallbackReason: string,
  sampleSignature?: string
): ScriptTocConfig {
  return {
    patterns: [...BUILTIN_TOC_PATTERNS],
    flags: 'gim',
    confidence: 'fallback',
    fallbackReason,
    ...(sampleSignature ? { sampleSignature } : {}),
  };
}

function compileRulesFromTocConfig(tocConfig?: ScriptTocConfig | null): CompiledRule[] {
  if (!tocConfig) return [];
  const rules: CompiledRule[] = [];
  const seen = new Set<string>();

  const pushRule = (pattern: string | undefined, explicitType?: TocItemType) => {
    if (!pattern) return;
    const trimmed = pattern.trim();
    if (!trimmed || seen.has(trimmed)) return;
    const rx = tryCompileRegex(trimmed, tocConfig.flags);
    if (!rx) return;
    seen.add(trimmed);
    rules.push({ regex: rx, explicitType });
  };

  if (Array.isArray(tocConfig.types) && tocConfig.types.length > 0) {
    for (const rule of tocConfig.types) {
      pushRule(rule?.regex, normalizePatternType(rule?.type));
    }
  }

  // If `types` didn't already cover them, include `tocPattern` (episode/toc) and `scenePattern` (scene)
  const hasDistinctPair =
    Boolean(tocConfig.tocPattern && tocConfig.scenePattern) &&
    tocConfig.tocPattern !== tocConfig.scenePattern;
  if (tocConfig.tocPattern) {
    // Only tag tocPattern explicitly as 'episode' if it doesn't look like a combined (?:ep|scene) wrapper
    const looksCombined = tocConfig.scenePattern && tocConfig.tocPattern.includes(tocConfig.scenePattern);
    pushRule(tocConfig.tocPattern, hasDistinctPair && !looksCombined ? 'episode' : undefined);
  }
  if (tocConfig.scenePattern) {
    pushRule(tocConfig.scenePattern, 'scene');
  }
  if (Array.isArray(tocConfig.patterns)) {
    for (const p of tocConfig.patterns) {
      pushRule(p, undefined);
    }
  }

  return rules;
}

function compileBuiltinRules(): CompiledRule[] {
  const rules: CompiledRule[] = [];
  for (const p of BUILTIN_TOC_PATTERNS) {
    const rx = tryCompileRegex(p, 'i');
    if (rx) rules.push({ regex: rx });
  }
  return rules;
}

function inferTocItemType(
  rawLine: string,
  trimmed: string,
  matchedExplicitType?: TocItemType
): TocItemType {
  const isDashScene = /^\d+\s*[-—–]\s*\d+/.test(trimmed);
  if (isDashScene) {
    return 'scene';
  }
  if (matchedExplicitType) {
    return matchedExplicitType;
  }
  if (/集|EPISODE|EP\b/i.test(trimmed)) {
    return 'episode';
  }
  if (/场|SCENE|EXT\.|INT\./i.test(trimmed)) {
    return 'scene';
  }
  if (/幕|章|回|CHAPTER|ACT/i.test(trimmed)) {
    return 'chapter';
  }
  if (/^#+\s/.test(rawLine)) {
    return 'heading';
  }
  return /第\s*[0-9一二三四五六七八九十百千]+\s*[集话回]/.test(trimmed) ? 'episode' : 'scene';
}

function extractItemsWithRules(lines: string[], rules: CompiledRule[]): TocItem[] {
  if (rules.length === 0) return [];
  const items: TocItem[] = [];
  let charAccumulator = 0;

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      charAccumulator += rawLine.length + 1;
      return;
    }

    const matchedRule = rules.find((rule) => rule.regex.test(trimmed));
    if (matchedRule) {
      let title = trimmed;
      const bracketMatch = trimmed.match(/^【(.+?)】(?:\s*(.*))?$/);
      let subTitle: string | undefined;
      if (bracketMatch) {
        title = bracketMatch[1];
        if (bracketMatch[2]) subTitle = bracketMatch[2];
      } else if (trimmed.startsWith('#')) {
        title = trimmed.replace(/^#+\s*/, '');
      }

      if (!subTitle && /^\d+\s*[-—–]\s*\d+$/.test(title) && index + 1 < lines.length) {
        const nextTrimmed = lines[index + 1].trim();
        if (NEXT_LINE_SCENE_META_RX.test(nextTrimmed)) {
          subTitle = nextTrimmed;
        }
      }

      const type = inferTocItemType(rawLine, trimmed, matchedRule.explicitType);

      items.push({
        id: `toc-${index}-${charAccumulator}`,
        title,
        subTitle,
        lineNumber: index + 1,
        charIndex: charAccumulator,
        type,
      });
    }

    charAccumulator += rawLine.length + 1;
  });

  return items;
}

function buildFallbackSegmentItems(lines: string[]): TocItem[] {
  if (lines.length <= 3) return [];
  const items: TocItem[] = [];
  const step = Math.max(20, Math.floor(lines.length / 6));
  let acc = 0;
  lines.forEach((line, idx) => {
    if (idx % step === 0 || idx === 0) {
      const preview = line.trim() || `第 ${idx + 1} 行`;
      items.push({
        id: `seg-${idx}`,
        title: preview.length > 24 ? `${preview.slice(0, 24)}...` : preview,
        subTitle: `第 ${idx + 1} 行`,
        lineNumber: idx + 1,
        charIndex: acc,
        type: 'segment',
      });
    }
    acc += line.length + 1;
  });
  return items;
}

/**
 * Pure, DOM-independent TOC extraction adhering strictly to model-first priority:
 * 1. `pending` / `idle` -> returns `[]` (never prematurely executes local fallback script).
 * 2. `ai` -> uses AI-recognized rules exclusively (without merging hardcoded builtin patterns);
 *    only falls back to builtin patterns if AI rules are invalid or yield 0 matches.
 * 3. `heuristic` / `fallback` -> uses fallback script patterns (and segment anchors if needed).
 */
export function parseTocItemsFromScript(
  scriptText: string,
  options: {
    state: TocRecognitionState;
    tocConfig?: ScriptTocConfig | null;
  }
): TocItem[] {
  if (!scriptText || !scriptText.trim()) return [];
  if (options.state === 'idle' || options.state === 'pending') {
    return [];
  }

  const lines = scriptText.split('\n');

  if (options.state === 'ai') {
    const aiRules = compileRulesFromTocConfig(options.tocConfig);
    const aiItems = extractItemsWithRules(lines, aiRules);
    if (aiItems.length > 0) {
      return aiItems;
    }
    // Safety net: if AI rules compiled to nothing or matched 0 headings, fall back gracefully
    const builtinFallbackItems = extractItemsWithRules(lines, compileBuiltinRules());
    if (builtinFallbackItems.length > 0) {
      return builtinFallbackItems;
    }
    return buildFallbackSegmentItems(lines);
  }

  // Fallback / heuristic mode (only reached when model node & agent are unavailable)
  const configRules = compileRulesFromTocConfig(options.tocConfig);
  const builtinRules = compileBuiltinRules();
  const seenSources = new Set(configRules.map((r) => r.regex.source));
  const combinedFallbackRules = [
    ...configRules,
    ...builtinRules.filter((r) => !seenSources.has(r.regex.source)),
  ];

  const fallbackItems = extractItemsWithRules(lines, combinedFallbackRules);
  if (fallbackItems.length > 0) {
    return fallbackItems;
  }

  return buildFallbackSegmentItems(lines);
}

export interface TocModelCredentialInputs {
  nodeModels?: Partial<NodeModelConfig> | null;
  legacyTocModel?: string | null;
  legacyAgentModel?: string | null;
  keys: {
    deepseekKey?: string;
    qwenKey?: string;
    glmKey?: string;
    arkKey?: string;
    geminiKey?: string;
  };
}

export function pickApiKeyForModel(
  model: string,
  keys: TocModelCredentialInputs['keys']
): string {
  const m = String(model || '').toLowerCase();
  const deepseek = (keys.deepseekKey || '').trim();
  const qwen = (keys.qwenKey || '').trim();
  const glm = (keys.glmKey || '').trim();
  const ark = (keys.arkKey || '').trim();
  const gemini = (keys.geminiKey || '').trim();

  if (m.includes('gemini')) {
    return gemini || deepseek || qwen || ark;
  }
  if (m.includes('doubao') || m.includes('seed-2-1') || m.includes('seed-2.1') || m.includes('ark') || m.includes('volces')) {
    return ark || deepseek || qwen || glm;
  }
  if (m.includes('qwen') || m.includes('dashscope')) {
    return qwen || deepseek || ark;
  }
  if (m.includes('glm') || m.includes('zhipu')) {
    return glm || qwen || deepseek || ark;
  }
  return deepseek || qwen || ark || glm || gemini;
}

/**
 * Resolves the primary TOC Parser model node and secondary Agent model node + credentials,
 * so the server can try Parser node first, Agent model second, and heuristic script last.
 */
export function resolveTocModelRequestConfig(inputs: TocModelCredentialInputs): {
  modelType: string;
  apiKey: string;
  agentModelType: string;
  agentApiKey: string;
  deepseekKey: string;
} {
  const agentModelType =
    (inputs.nodeModels?.agentModel || '').trim() ||
    (inputs.legacyAgentModel || '').trim() ||
    'deepseek-v4-flash';

  const modelType =
    (inputs.nodeModels?.tocInferModel || '').trim() ||
    (inputs.legacyTocModel || '').trim() ||
    agentModelType;

  return {
    modelType,
    apiKey: pickApiKeyForModel(modelType, inputs.keys),
    agentModelType,
    agentApiKey: pickApiKeyForModel(agentModelType, inputs.keys),
    deepseekKey: (inputs.keys.deepseekKey || '').trim(),
  };
}
