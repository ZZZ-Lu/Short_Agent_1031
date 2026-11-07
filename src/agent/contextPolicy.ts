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
  script: { label: '剧本读取与分析', content: '剧本内容按需读取。目录中的集号可能跳号或重复，集数应按实际条目统计。长文本通过分页读取；基于工具返回内容回答。' },
  assets: { label: '项目资产', content: '角色、场景和道具属于当前项目资产。依据剧本分析出的角色造型、场景或关键道具应及时沉淀保存到资产清单中；更新时保留已有设定，仅补全或修订差异。\n【资产识别描述（description）与多版本（versions）规范】\n1. 资产条目的浅色文本描述（description）严禁写空泛套话，核心目的是为了资产精准识别，避免混淆、重复、丢失：\n   - 道具（props）：必须写清首次出场位置（集/场）、归属者（谁的），以及能与其它相似道具区分的关键辨识信息（如“第17集17-1首现 · 戴安娜画给爸爸的生日蛋糕画作，区别于第8集铁链门画”）；若同一道具存在不同形态/状态（如损毁前/损毁后、开启/闭合等），必须按形态/状态区分版本。\n   - 场景（locations）：必须写清首次出场位置、空间归属与核心视觉辨识特征；若同一场景同时存在日景和夜景（或明显不同的时间光影状态），必须分开为两个版本。\n   - 角色（characters）：必须写清首次出场位置、核心身份与人物关系辨识点（其他角色台词或 OS 心理独白中提及该角色的背景信息归入 description）；若同一角色存在不同服装/造型，必须按服装区分版本。\n2. 单版本与多版本规则：单一版本的资产直接在一级卡片展示完整识别描述，严禁使用二级条目；仅当存在两个及以上版本时，才通过 versions 数组记录并在二级列表展示（每个版本包含各自的 name 如“日景/夜景”、“常服/晚礼服”或“完整态/损毁态”、description 及对应属性）。\n【出处工具使用规范】\n1. 唯一锚定标准（根据剧本描述是否出现在画面中）：provenances（出场锚点）以“根据该行剧本描述，该资产是否直接出现在当前画面中”作为唯一判断标准——凡是剧本描述中直接呈现该资产在当前画面里的视觉出场/外貌/状态/动作行（▲...）以及该角色当场说出的台词行，均逐行计入 provenances（排除场首“人物：XXX”名单行，以及他人台词或 OS 心理独白中回顾背景、谈论该资产而非直接描写当前画面的行，后者归入 description）。\n2. 阅读即锚定（免重复检索）：当你已通过 script.read 阅读了某集剧本正文时，在调用 asset.create、asset.update 或 asset.commitProvenance 时直接通过 provenances 字段传入带行号的具体出场原句，对已读并锚定的集数无需再次调用检索工具。\n3. 增量补充与全量重设（mode 参数）：当为已有资产补充新集数/新场次的出处时，调用 asset.commitProvenance 或 asset.update 默认均为 mode: "append"（增量追加合并），系统会自动保留原有集数的出处并去重排序；仅当需要清空并全量重设时，才显式传入 mode: "overwrite"。\n4. 跨集检索工具（asset.searchProvenanceCandidates）的正确用法：当需要排查未读集数的跨集出场时，可调用 asset.searchProvenanceCandidates。注意该工具返回的 candidates 仅是字面匹配候选，你必须逐条阅读 contextSnippet，以“根据该行剧本描述，该资产是否直接出现在当前画面中”为唯一标准剔除他人台词/OS 背景提及或同名混淆条目，再提交给 asset.commitProvenance。' },
  image: { label: '图像生成与卡片', content: '禁止覆盖资产卡片或已出图卡片；重新生成应使用现有复刻机制。只有工具返回 generating 才能宣称生成已启动；默认使用 Hy Image3.5 preview，并提供简短卡片名称。' },
  ui: { label: '页面观察与操作', content: '仅在需要演示或检查页面时使用页面操作。page.inspect 只描述可见界面；ui.actAndObserve 只能操作已观察的目标。' },
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
  if (!isLevel1 && Array.isArray(context.categories)) {
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
  previousCategories: readonly string[] = []
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

  // 1. 已选定具体业务工具 ID -> 自动切入局部执行阶段（level: 1，仅装载所选具体工具，同时记忆已展开分类）
  if (resolvedTools.size > 0) {
    const finalTools = [...resolvedTools];
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

function extractNoteItems(raw: string | undefined): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^[-*•]\s*/, '').trim())
    .filter(line => Boolean(line) && line !== '暂无笔记');
}

function normalizeNoteKey(item: string): string {
  return item.replace(/[。.;；!！\s]+$/g, '').trim();
}

/**
 * 合并并按行归一化去重重点笔记（task.notes），同时在进入实质任务后自动剔除开场寒暄阶段占位笔记。
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
    if (k === 'verifiedScriptHash') continue;
    if (k === 'verifiedProvenance' && Array.isArray(v)) {
      const slimProvenances = v
        .map(item => {
          if (!item || typeof item !== 'object') return undefined;
          const p = item as Record<string, unknown>;
          const slim: Record<string, unknown> = {};
          if (typeof p.sceneTitle === 'string' && p.sceneTitle.trim()) slim.sceneTitle = p.sceneTitle.trim();
          if (typeof p.lineNumber === 'number') slim.lineNumber = p.lineNumber;
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


