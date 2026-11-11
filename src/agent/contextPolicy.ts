import { AGENT_TOOL_REGISTRY, type AgentToolDefinition } from './toolRegistry';
import type { AgentToolName } from './protocol';

export type ThinkingLevel = 0 | 1;
export interface AgentContextSelection {
  level: ThinkingLevel;
  tools: AgentToolName[];
  prompts: string[];
  categories?: string[];
}

export interface ToolCategoryDefinition {
  id: string;
  label: string;
  description: string;
  tools: AgentToolName[];
  promptId: string;
}

export const TOOL_CATEGORIES: Record<string, ToolCategoryDefinition> = {
  script: {
    id: 'script',
    label: '剧本工具箱',
    description: '读取分集目录、分页读取剧本正文、搜索关键词',
    tools: ['script.directory', 'script.read', 'script.search'],
    promptId: 'script',
  },
  asset: {
    id: 'asset',
    label: '资产工具箱',
    description: '查询、新增、修改、删除角色/场景/道具资产，检索与锚定剧本出处',
    tools: [
      'asset.list',
      'asset.create',
      'asset.update',
      'asset.delete',
      'asset.searchProvenanceCandidates',
      'asset.commitProvenance',
    ],
    promptId: 'assets',
  },
  card: {
    id: 'card',
    label: '画布与生图工具箱',
    description: '查看卡片详情、画面元素空间标注、生图与复刻衍生',
    tools: ['card.inspect', 'card.detectLandmarks', 'card.generate'],
    promptId: 'image',
  },
  ui: {
    id: 'ui',
    label: '界面观察与操作',
    description: '观察当前可见界面结构、查询操作说明、执行鼠标交互',
    tools: ['page.inspect', 'ui.actAndObserve', 'guide.lookup'],
    promptId: 'ui',
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  script: 'script',
  scripts: 'script',
  asset: 'asset',
  assets: 'asset',
  card: 'card',
  cards: 'card',
  image: 'card',
  images: 'card',
  ui: 'ui',
  page: 'ui',
  guide: 'ui',
};

export const PROMPT_MODULES: Record<string, { label: string; content: string }> = {
  script: { label: '剧本读取与分析', content: '按集数 -> 场次 -> 段落三层结构读取、检索与分析剧本数据。' },
  assets: { label: '项目资产', content: '查询、创建、更新角色/场景/道具资产，维护多版本造型与画面出处锚点。' },
  image: { label: '图像生成与卡片', content: '查看卡片属性、空间标注元素，执行生图或复刻衍生。' },
  ui: { label: '页面观察与操作', content: '观察当前可见界面结构、查询操作指南或执行鼠标交互。' },
};

export const CONTROL_TOOLS: AgentToolName[] = ['sys.selectContext', 'sys.endTask', 'user.ask'];
export const LEVEL_1_CONTROL_TOOLS: AgentToolName[] = ['sys.selectContext', 'user.ask'];
export const initialAgentContext = (): AgentContextSelection => ({ level: 0, tools: [], prompts: [], categories: [] });

export function derivePromptsFromTools(tools: readonly string[]): string[] {
  const prompts = new Set<string>();
  for (const id of tools) {
    if (id.startsWith('script.')) prompts.add('script');
    else if (id.startsWith('asset.')) prompts.add('assets');
    else if (id.startsWith('card.')) prompts.add('image');
    else if (id.startsWith('page.') || id.startsWith('ui.') || id.startsWith('guide.')) prompts.add('ui');
  }
  return [...prompts];
}

export function resolveContext(selection: AgentContextSelection | undefined, enabled: readonly string[]) {
  const available = new Set(enabled);
  const context = selection ?? initialAgentContext();
  const isLevel1 = context.level === 1;
  const activeControlTools = isLevel1 ? LEVEL_1_CONTROL_TOOLS : CONTROL_TOOLS;
  const expandedTools = new Set<AgentToolName>([
    ...activeControlTools,
    ...(isLevel1 ? (context.tools || []) : []),
  ]);

  const injected = AGENT_TOOL_REGISTRY.filter(
    tool =>
      expandedTools.has(tool.id) &&
      (tool.id === 'sys.selectContext' || available.has(tool.id))
  );
  const injectedIds = injected.map(tool => tool.id);

  const candidateToolIds = new Set<AgentToolName>();
  if (Array.isArray(context.categories)) {
    for (const rawCat of context.categories) {
      const catKey = CATEGORY_ALIASES[String(rawCat).trim().toLowerCase()];
      const cat = catKey ? TOOL_CATEGORIES[catKey] : undefined;
      if (cat) {
        for (const toolId of cat.tools) {
          if (available.has(toolId)) {
            candidateToolIds.add(toolId);
          }
        }
      }
    }
  }
  const candidateTools = AGENT_TOOL_REGISTRY.filter(tool => candidateToolIds.has(tool.id));

  const explicitPrompts = Array.isArray(context.prompts)
    ? context.prompts.filter(id => Object.hasOwn(PROMPT_MODULES, id))
    : [];
  const autoPrompts = derivePromptsFromTools(injectedIds);
  const prompts = [...new Set([...explicitPrompts, ...autoPrompts])];
  return {
    level: context.level,
    tools: injectedIds,
    prompts,
    categories: context.categories || [],
    candidateTools,
    catalog: AGENT_TOOL_REGISTRY.filter(tool => available.has(tool.id) || tool.id === 'sys.selectContext'),
  };
}

export function validateSelection(
  args: Record<string, unknown>,
  enabled: readonly string[],
  previousCategories: readonly string[] = [],
  previousLevel1Tools: readonly AgentToolName[] = []
): AgentContextSelection {
  if (args.level !== undefined && args.level !== 0 && args.level !== 1) {
    throw new Error('level 必须为 0 或 1。');
  }
  if (args.tools !== undefined && (!Array.isArray(args.tools) || !args.tools.every(item => typeof item === 'string'))) {
    throw new Error('tools 必须是工具 ID 数组。');
  }
  if (args.categories !== undefined && (!Array.isArray(args.categories) || !args.categories.every(item => typeof item === 'string'))) {
    throw new Error('categories 必须是工具分类 ID 数组。');
  }
  if (args.prompts !== undefined && (!Array.isArray(args.prompts) || !args.prompts.every(item => typeof item === 'string'))) {
    throw new Error('prompts 必须是提示词模块 ID 数组。');
  }

  const available = new Set(enabled);
  const known = new Set(AGENT_TOOL_REGISTRY.map((tool: AgentToolDefinition) => tool.id));
  const resolvedTools = new Set<AgentToolName>();
  const resolvedCategories = new Set<string>();

  for (const rawCat of (args.categories as string[] | undefined) ?? []) {
    const trimmed = rawCat.trim();
    const catKey = CATEGORY_ALIASES[trimmed.toLowerCase()];
    if (catKey && TOOL_CATEGORIES[catKey]) {
      resolvedCategories.add(catKey);
    } else if (known.has(trimmed as AgentToolName)) {
      if (!available.has(trimmed) && trimmed !== 'sys.selectContext') {
        throw new Error(`工具不存在或未启用：${trimmed}`);
      }
      resolvedTools.add(trimmed as AgentToolName);
    } else {
      throw new Error(`工具分类不存在或未启用：${rawCat}`);
    }
  }

  for (const rawId of (args.tools as string[] | undefined) ?? []) {
    const id = rawId.trim();
    const catKey = CATEGORY_ALIASES[id.toLowerCase()];
    if (known.has(id as AgentToolName)) {
      if (!available.has(id) && id !== 'sys.selectContext') {
        throw new Error(`工具不存在或未启用：${id}`);
      }
      resolvedTools.add(id as AgentToolName);
    } else if (catKey && TOOL_CATEGORIES[catKey]) {
      resolvedCategories.add(catKey);
    } else {
      throw new Error(`工具不存在或未启用：${id}`);
    }
  }

  const explicitPrompts: string[] = [];
  for (const id of (args.prompts as string[] | undefined) ?? []) {
    const normalizedPrompt = id === 'asset' ? 'assets' : id;
    if (!Object.hasOwn(PROMPT_MODULES, normalizedPrompt)) {
      throw new Error(`提示词模块不存在：${id}`);
    }
    explicitPrompts.push(normalizedPrompt);
  }

  const rememberedCategories = previousCategories
    .map(c => CATEGORY_ALIASES[String(c).trim().toLowerCase()])
    .filter((c): c is string => Boolean(c && TOOL_CATEGORIES[c]));
  const mergedCategories = [...new Set([...rememberedCategories, ...resolvedCategories])];

  // 1. 已选定具体业务工具 ID -> 自动切入或保持在局部执行阶段（level: 1，若当前已在 1 级则增量合并已装载工具，同时记忆已展开分类）
  if (resolvedTools.size > 0) {
    // 若模型在切入 1 级装载 script.read 时同时显式传入了 categories: ["asset"]（意图将资产读写工具组与 script.read 一并注入 1 级），自动配齐 asset.create 与 asset.update
    const hasExplicitAssetTool = [...resolvedTools].some(t => t.startsWith('asset.'));
    if (resolvedCategories.has('asset') && resolvedTools.has('script.read') && !hasExplicitAssetTool) {
      for (const pairTool of ['asset.create', 'asset.update'] as AgentToolName[]) {
        if (known.has(pairTool) && available.has(pairTool)) {
          resolvedTools.add(pairTool);
        }
      }
    }
    const validPrevTools = previousLevel1Tools.filter(
      t => known.has(t) && (available.has(t) || t === 'sys.selectContext')
    );
    const finalTools = [...new Set([...validPrevTools, ...resolvedTools])];
    const finalPrompts = [...new Set([...explicitPrompts, ...derivePromptsFromTools(finalTools)])];
    return {
      level: 1,
      tools: finalTools,
      prompts: finalPrompts,
      categories: mergedCategories,
    };
  }

  // 2. 仅选择了工具分类 categories（未选具体 tools） -> 保持在全局计划阶段（level: 0），展开对应分类下的候选工具简表供下一轮挑选
  if (resolvedCategories.size > 0) {
    return {
      level: 0,
      tools: [],
      prompts: explicitPrompts,
      categories: mergedCategories,
    };
  }

  // 3. 未传 categories 与 tools 且未显式强制 level: 1 -> 退出局部执行阶段，返回全局计划与验收阶段（卸载全部业务工具，保留已展开分类记忆）
  if (args.level === undefined || args.level === 0) {
    return {
      level: 0,
      tools: [],
      prompts: explicitPrompts,
      categories: rememberedCategories,
    };
  }

  throw new Error('进入局部执行阶段必须通过 tools 指定具体工具 ID 数组（若尚未展开分类，请先传 categories 展开候选工具简表）。');
}

const OBSOLETE_GREETING_NOTE_RE = /尚未明确具体任务|尚未提供具体创作任务|处于需求引导阶段/;
const REDUNDANT_META_NOTE_RE = /^(最终目标|已装载工具|执行原则|资产清单面板|当前计划|当前进度)[:：]/;

function extractNoteItems(raw: string | undefined): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^[-*•]\s*/, '').trim())
    .filter(line => Boolean(line) && line !== '暂无笔记' && !REDUNDANT_META_NOTE_RE.test(line));
}

function normalizeNoteKey(item: string): string {
  return item.replace(/[。.;；!！\s]+$/g, '').trim();
}

/**
 * 合并并按行归一化去重重点笔记（task.notes），同时在进入实质任务后自动剔除开场寒暄阶段占位笔记与重复元信息。
 */
export function mergeTaskNotes(
  existingNotes: string | undefined,
  incomingNotes: string | undefined,
  mode: string = 'overwrite'
): string {
  const incomingItems = extractNoteItems(incomingNotes);
  if (incomingItems.length === 0) {
    return existingNotes?.trim() || '';
  }
  const existingItems = extractNoteItems(existingNotes);
  const isOverwrite = mode === 'overwrite' || mode === 'replace' || mode === 'rewrite';
  const combined = isOverwrite ? incomingItems : [...existingItems, ...incomingItems];

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const item of combined) {
    const key = normalizeNoteKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  const hasConcreteNotes = deduped.some(item => !OBSOLETE_GREETING_NOTE_RE.test(item));
  const pruned = hasConcreteNotes
    ? deduped.filter(item => !OBSOLETE_GREETING_NOTE_RE.test(item))
    : deduped;

  return pruned.map(item => `- ${item}`).join('\n');
}

/**
 * 面向 LLM Prompt 的工具返回值净化与裁剪：
 * 1. 剥离 Base64 大体积图像数据；
 * 2. 剔除前端高亮专用的内部锚点字段（verifiedScriptHash 及 verifiedProvenance 中的 id/sceneId/matchedTerm/anchorText/offsetInAnchor/fallbackCharIndex），
 *    仅保留 { sceneTitle, lineNumber, evidenceText } 等业务语义字段。
 */
export function cleanToolOutputForPrompt(val: unknown, depth = 0): unknown {
  if (depth > 6) return val;
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('data:image/') || (trimmed.length > 500 && /^[A-Za-z0-9+/=]{500,}$/.test(trimmed))) {
      return `[图片数据 ${Math.round(trimmed.length / 1024)}KB]`;
    }
    return trimmed;
  }
  if (typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val
      .map(item => cleanToolOutputForPrompt(item, depth + 1))
      .filter(item => item !== undefined);
  }
  const cleanedObj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (
      k === 'verifiedScriptHash' ||
      k === 'hasVolumeWarning' ||
      k === 'notice' ||
      k === 'warning' ||
      k === 'autoReturnedToLevel0'
    ) {
      continue;
    }
    if (k === 'verifiedProvenance' && Array.isArray(v)) {
      const slimProvenances = v
        .map(item => {
          if (!item || typeof item !== 'object') return undefined;
          const p = item as Record<string, unknown>;
          const slim: Record<string, unknown> = {};
          if (typeof p.sceneTitle === 'string' && p.sceneTitle.trim()) slim.sceneTitle = p.sceneTitle.trim();
          const evText = typeof p.evidenceText === 'string' && p.evidenceText.trim()
            ? p.evidenceText.trim()
            : (typeof p.matchedTerm === 'string' && p.matchedTerm.trim() ? p.matchedTerm.trim() : undefined);
          if (evText) slim.evidenceText = evText;
          if (typeof p.versionId === 'string' && p.versionId.trim()) slim.versionId = p.versionId.trim();
          if (typeof p.versionName === 'string' && p.versionName.trim()) slim.versionName = p.versionName.trim();
          return Object.keys(slim).length > 0 ? slim : undefined;
        })
        .filter(item => item !== undefined);
      if (slimProvenances.length > 0) {
        cleanedObj[k] = slimProvenances;
      }
      continue;
    }
    const cleanedVal = cleanToolOutputForPrompt(v, depth + 1);
    if (cleanedVal !== undefined && !(Array.isArray(cleanedVal) && cleanedVal.length === 0)) {
      cleanedObj[k] = cleanedVal;
    }
  }
  return cleanedObj;
}


