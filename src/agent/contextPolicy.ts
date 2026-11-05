import { AGENT_TOOL_REGISTRY, type AgentToolDefinition } from './toolRegistry';
import type { AgentToolName } from './protocol';

export type ThinkingLevel = 0 | 1;
export interface AgentContextSelection { level: ThinkingLevel; tools: AgentToolName[]; prompts: string[] }

export const PROMPT_MODULES: Record<string, { label: string; content: string }> = {
  script: { label: '剧本读取与分析', content: '剧本内容按需读取。目录中的集号可能跳号或重复，集数应按实际条目统计。长文本通过分页读取；基于工具返回内容回答。' },
  assets: { label: '项目资产', content: '角色、场景和道具属于当前项目资产。依据剧本分析出的角色造型、场景或关键道具应及时沉淀保存到资产清单中；更新时保留已有设定，仅补全或修订差异。\n【资产识别描述（description）与多版本（versions）规范】\n1. 资产条目的浅色文本描述（description）严禁写空泛套话，核心目的是为了资产精准识别，避免混淆、重复、丢失：\n   - 道具（props）：必须写清首次出场位置（集/场）、归属者（谁的），以及能与其它相似道具区分的关键辨识信息（如“第17集17-1首现 · 戴安娜画给爸爸的生日蛋糕画作，区别于第8集铁链门画”）；若同一道具存在不同形态/状态（如损毁前/损毁后、开启/闭合等），必须按形态/状态区分版本。\n   - 场景（locations）：必须写清首次出场位置、空间归属与核心视觉辨识特征；若同一场景同时存在日景和夜景（或明显不同的时间光影状态），必须分开为两个版本。\n   - 角色（characters）：必须写清首次出场位置、核心身份与人物关系辨识点；若同一角色存在不同服装/造型，必须按服装区分版本。\n2. 单版本与多版本规则：单一版本的资产直接在一级卡片展示完整识别描述，严禁使用二级条目；仅当存在两个及以上版本时，才通过 versions 数组记录并在二级列表展示（每个版本包含各自的 name 如“日景/夜景”、“常服/晚礼服”或“完整态/损毁态”、description 及对应属性）。\n【出处机制与具体内容高亮规范】\n1. 出场唯一标准：分析剧本，该资产（或该特定版本）在此处是否需要出现在画面中——需要出现则算作出场，不出现在画面中则不算出场。\n2. 阅读即锚定（免重复检索，支持代词与具体内容高亮）：当你已通过 script.read 阅读了剧本正文并调用 asset.create 或 asset.update 创建/更新资产（及 versions 二级版本）时，直接在资产或对应 version 的 provenances 字段中填入已读剧本里的具体出场描写原句（如 provenances: [{ sceneTitle: "13-1", lineNumber: 69, evidenceText: "▲布拉姆穿着丝绸睡衣审视着娜塔莉亚的表情" }]）。evidenceText 必须摘抄体现该资产或该版本在画面中出场的具体动作、造型或环境描写原句（即使原文使用“他/她”等代词或泛指也能精准锚定），严禁摘抄“人物：XXX”等顶部名单行。这样可在创建时一步点亮已读集数的出处并在点击时整句高亮该具体内容，无需对已读内容重复检索。\n3. 跨集顺藤摸瓜（基于剧本已定稿前提）：由于项目剧本已全局定稿，若仅提取局部集数（如第1集）资产，对贯穿全剧的专有角色、专属核心道具或专有场景，在完成本集直接锚定后，应顺藤摸瓜调用 asset.searchProvenanceCandidates 检索全剧其余集数的候选片段，逐一判断是否在画面中出场，并调用 asset.commitProvenance（可传 verifiedCandidateIds 或包含代词/具体动作描写的 provenances 原句列表）一次性锁定全剧出场场次；泛指/消耗类普通道具则仅锚定当前确认集数，避免跨集同名混淆。' },
  image: { label: '图像生成与卡片', content: '禁止覆盖资产卡片或已出图卡片；重新生成应使用现有复刻机制。只有工具返回 generating 才能宣称生成已启动；默认使用 Hy Image3.5 preview，并提供简短卡片名称。' },
  ui: { label: '页面观察与操作', content: '仅在需要演示或检查页面时使用页面操作。page.inspect 只描述可见界面；ui.actAndObserve 只能操作已观察的目标。' },
};

export const CONTROL_TOOLS: AgentToolName[] = ['sys.selectContext', 'sys.endTask', 'user.ask'];
export const initialAgentContext = (): AgentContextSelection => ({ level: 0, tools: [], prompts: [] });

export function resolveContext(selection: AgentContextSelection | undefined, enabled: readonly string[]) {
  const available = new Set(enabled);
  const context = selection ?? initialAgentContext();
  const selected = new Set([...CONTROL_TOOLS, ...context.tools]);
  const injected = AGENT_TOOL_REGISTRY.filter(tool => selected.has(tool.id) && (tool.id === 'sys.selectContext' || available.has(tool.id)));
  return { level: context.level, tools: injected.map(tool => tool.id), prompts: context.prompts.filter(id => Object.hasOwn(PROMPT_MODULES, id)), catalog: AGENT_TOOL_REGISTRY.filter(tool => available.has(tool.id) || tool.id === 'sys.selectContext') };
}

export function validateSelection(args: Record<string, unknown>, enabled: readonly string[]): AgentContextSelection {
  if (args.level !== 0 && args.level !== 1) throw new Error('level 必须为 0 或 1。');
  if (!Array.isArray(args.tools) || !args.tools.every(item => typeof item === 'string')) throw new Error('tools 必须是工具 ID 数组。');
  if (!Array.isArray(args.prompts) || !args.prompts.every(item => typeof item === 'string')) throw new Error('prompts 必须是提示词模块 ID 数组。');
  const available = new Set(enabled);
  const known = new Set(AGENT_TOOL_REGISTRY.map((tool: AgentToolDefinition) => tool.id));
  for (const id of args.tools) if (!known.has(id as AgentToolName) || !available.has(id)) throw new Error(`工具不存在或未启用：${id}`);
  for (const id of args.prompts) if (!Object.hasOwn(PROMPT_MODULES, id)) throw new Error(`提示词模块不存在：${id}`);
  return { level: args.level, tools: [...new Set(args.tools)] as AgentToolName[], prompts: [...new Set(args.prompts)] };
}
