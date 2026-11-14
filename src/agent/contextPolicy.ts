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

export const CONTROL_TOOLS: AgentToolName[] = ['sys.selectContext', 'experience.search', 'sys.endTask', 'user.ask'];
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
    ...(isLevel1 ? (context.tools || []).filter(toolId => toolId !== 'sys.endTask' && toolId !== 'experience.search') : []),
  ]);

  const injected = AGENT_TOOL_REGISTRY.filter(
    tool =>
      expandedTools.has(tool.id) &&
      (tool.id === 'sys.selectContext' || tool.id === 'experience.search' || available.has(tool.id))
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

  let requestedEndTaskOnlyGuard = false;

  for (const rawCat of (args.categories as string[] | undefined) ?? []) {
    const trimmed = rawCat.trim();
    const catKey = CATEGORY_ALIASES[trimmed.toLowerCase()];
    if (catKey && TOOL_CATEGORIES[catKey]) {
      resolvedCategories.add(catKey);
    } else if (trimmed === 'sys.endTask') {
      requestedEndTaskOnlyGuard = true;
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
    if (id === 'sys.endTask') {
      requestedEndTaskOnlyGuard = true;
    } else if (known.has(id as AgentToolName)) {
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

  if (requestedEndTaskOnlyGuard && args.level === 1 && resolvedTools.size === 0) {
    throw new Error('sys.endTask 仅限全局计划与验收阶段（0 级）调用，不可装载到局部执行阶段（1 级）；请无参调用 sys.selectContext 返回全局阶段后再结束任务。');
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
    // 若模型在切入 1 级装载 [asset.create, asset.update] 分步提取写入套件时漏传了 script.read，自动配齐 script.read 形成完整读写闭环
    if (
      resolvedTools.has('asset.create') &&
      resolvedTools.has('asset.update') &&
      known.has('script.read') &&
      available.has('script.read')
    ) {
      resolvedTools.add('script.read');
    }
    const validPrevTools = previousLevel1Tools.filter(
      t => t !== 'sys.endTask' && t !== 'experience.search' && known.has(t) && (available.has(t) || t === 'sys.selectContext')
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
 * 将冗长的 verifiedProvenance 数组按场次聚合为轻量摘要：
 * 保留 { sceneId, sceneTitle, count, lines } 以便区分同号不同场次（如两个 1-5）并确认落盘行号，
 * 剔除冗余的整段中英双语 evidenceText / anchorText / fallbackCharIndex 等大体积字段。
 */
function summarizeProvenanceListForPrompt(provenances: unknown[]): Array<Record<string, unknown>> {
  const grouped = new Map<string, { sceneId?: string; sceneTitle: string; count: number; lineNumbers: number[] }>();
  for (const raw of provenances) {
    if (!raw || typeof raw !== 'object') continue;
    const p = raw as Record<string, unknown>;
    const sceneId = typeof p.sceneId === 'string' && p.sceneId.trim() ? p.sceneId.trim() : undefined;
    const sceneTitle = typeof p.sceneTitle === 'string' && p.sceneTitle.trim() ? p.sceneTitle.trim() : '未知场次';
    const key = sceneId || sceneTitle;
    let entry = grouped.get(key);
    if (!entry) {
      entry = {
        ...(sceneId ? { sceneId } : {}),
        sceneTitle,
        count: 0,
        lineNumbers: [],
      };
      grouped.set(key, entry);
    }
    entry.count += 1;
    if (typeof p.lineNumber === 'number' && Number.isFinite(p.lineNumber) && !entry.lineNumbers.includes(p.lineNumber)) {
      entry.lineNumbers.push(p.lineNumber);
    }
  }
  return Array.from(grouped.values()).map(g => ({
    ...(g.sceneId ? { sceneId: g.sceneId } : {}),
    sceneTitle: g.sceneTitle,
    count: g.count,
    ...(g.lineNumbers.length > 0 ? { lines: g.lineNumbers.sort((a, b) => a - b) } : {}),
  }));
}

/**
 * 面向 LLM Prompt 的工具返回值净化与裁剪：
 * 1. 剥离 Base64 大体积图像数据；
 * 2. 将 verifiedProvenance 按场次聚合为 { sceneId, sceneTitle, count, lines } 轻量摘要，
 *    并在存在 versions 自带出处时省略主卡顶层重复 verifiedProvenance（保留 verifiedProvenanceCount），
 *    避免 asset.update / asset.list 返回数十段双语原文撑爆后期 Prompt。
 */
function countDistinctVerifiedProvenanceForPrompt(rawObj: Record<string, unknown>): number {
  const parentAnchors = Array.isArray(rawObj.verifiedProvenance) ? rawObj.verifiedProvenance : [];
  const versionAnchors = Array.isArray(rawObj.versions)
    ? rawObj.versions.flatMap(ver =>
        ver && typeof ver === 'object' && Array.isArray((ver as Record<string, unknown>).verifiedProvenance)
          ? ((ver as Record<string, unknown>).verifiedProvenance as unknown[])
          : []
      )
    : [];
  const all = [...parentAnchors, ...versionAnchors];
  if (all.length === 0) return 0;
  const keys = new Set<string>();
  all.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const a = item as Record<string, unknown>;
    const textPart = a.anchorText || a.evidenceText || a.text || (a.lineNumber !== undefined ? '' : idx);
    const key =
      typeof a.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
        ? `pos:${a.fallbackCharIndex}`
        : `${a.sceneId || a.sceneTitle || ''}:${a.lineNumber ?? ''}:${textPart}`;
    keys.add(key);
  });
  return keys.size;
}

export function cleanToolOutputForPrompt(val: unknown, depth = 0): unknown {
  if (depth > 8) return val;
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
  const rawObj = val as Record<string, unknown>;
  const hasVersionsWithProvenance =
    Array.isArray(rawObj.versions) &&
    rawObj.versions.some(
      ver => ver && typeof ver === 'object' && Array.isArray((ver as Record<string, unknown>).verifiedProvenance) && ((ver as Record<string, unknown>).verifiedProvenance as unknown[]).length > 0
    );

  const cleanedObj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawObj)) {
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
      if (hasVersionsWithProvenance) {
        const totalCount = countDistinctVerifiedProvenanceForPrompt(rawObj);
        if (totalCount > 0) {
          cleanedObj.verifiedProvenanceCount = totalCount;
        }
        continue;
      }
      const slimProvenances = summarizeProvenanceListForPrompt(v);
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
  if (hasVersionsWithProvenance && cleanedObj.verifiedProvenanceCount === undefined) {
    const totalCount = countDistinctVerifiedProvenanceForPrompt(rawObj);
    if (totalCount > 0) {
      cleanedObj.verifiedProvenanceCount = totalCount;
    }
  }
  return cleanedObj;
}

/**
 * 为认知状态更新节点（updateStateNode）提取精简、确定性的工具真实返回值摘要，
 * 防止状态节点盲信主循环叙事或把未命中/错读场次误判为已完成。
 */
export function summarizeToolOutputForStateNode(
  toolName: string,
  status: string,
  output: unknown,
  error?: string
): string {
  if (status === 'failed') {
    return `失败: ${String(error || '未知错误').slice(0, 240)}`;
  }
  if (!output || typeof output !== 'object') {
    return typeof output === 'string' && output.trim() ? output.trim().slice(0, 200) : '执行成功';
  }
  const out = output as Record<string, any>;

  if (toolName === 'script.read') {
    if (out.notFound) {
      return `未命中: ${String(out.message || '未匹配到指定剧本集数或场次').slice(0, 260)}`;
    }
    if (Array.isArray(out.episodes)) {
      const sceneItems: string[] = [];
      for (const ep of out.episodes) {
        for (const sc of Array.isArray(ep?.scenes) ? ep.scenes : []) {
          const idPart = sc.id ? `${sc.id} ` : '';
          sceneItems.push(`${idPart}"${sc.title || sc.sceneNumber || sc.index || '未知场次'}"(${sc.paragraphCount ?? 0}段)`);
        }
      }
      const scCount = typeof out.sceneCount === 'number' ? out.sceneCount : sceneItems.length;
      const paraCount = typeof out.paragraphCount === 'number' ? out.paragraphCount : 0;
      if (scCount === 0 || paraCount === 0) {
        return `未读取到有效正文 (sceneCount=${scCount}, paragraphCount=${paraCount})`;
      }
      const shown = sceneItems.slice(0, 6).join('；');
      const more = sceneItems.length > 6 ? ` 等共${sceneItems.length}场` : '';
      return `实际读取 ${scCount} 场共 ${paraCount} 段: [${shown}${more}]${out.hasVolumeWarning ? '（触发数据量预警）' : ''}`;
    }
    if (typeof out.content === 'string') {
      const lineCount = out.content ? String(out.content).split('\n').length : 0;
      return `实际读取第 ${out.startLine ?? out.offset ?? 1}～${out.endLine ?? '?'} 行 (共 ${lineCount} 行)`;
    }
  }

  if (toolName === 'script.directory') {
    const epCount = out.total ?? (Array.isArray(out.entries) ? out.entries.length : 0);
    const totalScenes = out.totalScenes ?? '未知';
    const totalParas = out.totalParagraphs ?? '未知';
    const epParts = Array.isArray(out.entries)
      ? out.entries.slice(0, 3).map((ep: any) => {
          const scIds = Array.isArray(ep?.scenes)
            ? ep.scenes.slice(0, 8).map((s: any) => `${s.id || s.sceneNumber || s.title}(${s.paragraphCount ?? 0}段)`).join(',')
            : `${ep?.sceneCount ?? 0}场`;
          return `${ep?.number || ep?.title || ep?.id}:[${scIds}]`;
        })
      : [];
    return `返回 ${epCount} 集共 ${totalScenes} 场/${totalParas} 段${epParts.length > 0 ? ` (${epParts.join('；')})` : ''}`;
  }

  if (toolName === 'script.search') {
    const total = typeof out.total === 'number' ? out.total : (Array.isArray(out.matches) ? out.matches.length : 0);
    const scList = Array.isArray(out.scenesSummary)
      ? out.scenesSummary
          .slice(0, 8)
          .map((s: any) => `${s.sceneId || s.sceneNumber || s.sceneTitle}(${s.matchCount ?? 0}处)`)
          .join('、')
      : '';
    return `搜索命中 ${total} 处${scList ? `: [${scList}]` : ''}`;
  }

  if (toolName === 'asset.list') {
    const total = typeof out.total === 'number' ? out.total : (Array.isArray(out.items) ? out.items.length : 0);
    const names = Array.isArray(out.items)
      ? out.items
          .slice(0, 6)
          .map((it: any) => {
            const raw = it?.item || it;
            const distinctProv = raw && typeof raw === 'object' ? countDistinctVerifiedProvenanceForPrompt(raw) : 0;
            const provCount =
              typeof raw?.verifiedProvenanceCount === 'number'
                ? raw.verifiedProvenanceCount
                : typeof raw?.verifiedCount === 'number'
                  ? raw.verifiedCount
                  : distinctProv > 0
                    ? distinctProv
                    : Array.isArray(raw?.verifiedProvenance)
                      ? raw.verifiedProvenance.length
                      : undefined;
            const provStr = provCount !== undefined && provCount > 0 ? `, 出处:${provCount}条` : '';
            const verStr =
              Array.isArray(raw?.versions) && raw.versions.length > 0
                ? `, versions:[${raw.versions.map((v: any) => `${v.name}:${v.id}`).join(',')}]`
                : '';
            return `${raw?.name || '未命名'}(id:${raw?.id || '?'}${provStr}${verStr})`;
          })
          .join('、')
      : '';
    return `查询返回 ${total} 条${names ? `: [${names}]` : ''}`;
  }

  if (toolName === 'asset.create') {
    const items = Array.isArray(out.items) ? out.items : (out.id ? [out] : []);
    const createdCount = out.createdCount ?? items.length;
    const desc = items
      .slice(0, 5)
      .map((it: any) => {
        const distinctProv = it && typeof it === 'object' ? countDistinctVerifiedProvenanceForPrompt(it) : 0;
        const provCount =
          typeof it?.verifiedProvenanceCount === 'number'
            ? it.verifiedProvenanceCount
            : typeof it?.verifiedCount === 'number'
              ? it.verifiedCount
              : distinctProv > 0
                ? distinctProv
                : undefined;
        const provStr = provCount !== undefined && provCount > 0 ? `, 出处:${provCount}条` : '';
        const verStr = Array.isArray(it?.versions) && it.versions.length > 0
          ? `, versions:[${it.versions.map((v: any) => `${v.name}:${v.id}`).join(',')}]`
          : '';
        return `${it?.name || '未命名'}(id:${it?.id || '?'}${provStr}${verStr})`;
      })
      .join('、');
    return `已落盘创建 ${createdCount} 项${desc ? `: [${desc}]` : ''}`;
  }

  if (toolName === 'asset.update') {
    const item = out.item || out;
    const verCount = Array.isArray(item?.versions) ? item.versions.length : 0;
    const distinctProv = item && typeof item === 'object' ? countDistinctVerifiedProvenanceForPrompt(item) : 0;
    const provCount =
      out.provenanceBoundCount ??
      out.verifiedCount ??
      out.verifiedProvenanceCount ??
      (distinctProv > 0
        ? distinctProv
        : Array.isArray(item?.verifiedProvenance)
          ? item.verifiedProvenance.length
          : undefined);
    const extras: string[] = [];
    if (provCount !== undefined) extras.push(`出处:${provCount}条`);
    if (verCount > 0) {
      const verNames = item.versions.map((v: any) => `${v.name}:${v.id}`).join(',');
      extras.push(`版本:${verCount}个(${verNames})`);
    }
    return `已落盘更新 ${item?.name || '资产'}(id:${item?.id || out.id || '?'})${extras.length > 0 ? ` [${extras.join(', ')}]` : ''}`;
  }

  if (toolName === 'asset.delete') {
    const deletedIds = Array.isArray(out.deletedIds) ? out.deletedIds.join(', ') : '';
    return `已删除 ${out.deletedCount ?? 0} 项${deletedIds ? ` (${deletedIds})` : ''}`;
  }

  if (toolName === 'asset.commitProvenance') {
    const scenes = Array.isArray(out.sourceScenes) ? out.sourceScenes.join('、') : '';
    return `已提交核验出处 ${out.verifiedCount ?? 0} 条${scenes ? ` (${scenes})` : ''}`;
  }

  if (toolName === 'asset.searchProvenanceCandidates') {
    return `检索到 ${out.totalCandidates ?? 0} 条出处候选`;
  }

  if (toolName === 'sys.selectContext') {
    const parts = [`level=${out.level ?? ''}`];
    if (out.transition) parts.push(`transition=${out.transition}`);
    if (Array.isArray(out.tools) && out.tools.length > 0) parts.push(`tools=[${out.tools.join(',')}]`);
    if (Array.isArray(out.categories) && out.categories.length > 0) parts.push(`categories=[${out.categories.join(',')}]`);
    return parts.join(', ');
  }

  if (toolName === 'experience.search') {
    const titles = Array.isArray(out.experiences)
      ? out.experiences.map((e: any) => e?.title || e?.id).filter(Boolean).join('、')
      : '';
    return `匹配经验 ${out.matchedCount ?? 0} 条${titles ? `: [${titles}]` : ''}`;
  }

  try {
    return JSON.stringify(cleanToolOutputForPrompt(out)).slice(0, 240);
  } catch {
    return '执行成功';
  }
}



