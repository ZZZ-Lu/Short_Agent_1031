import type { AgentToolName } from './protocol';

export type ToolCategory = '剧本与资产' | '页面观察' | '页面交互' | '操作知识' | '系统控制';

export type ToolRisk = '只读' | '交互动作' | '内部状态';

export interface AgentToolDefinition {
  id: AgentToolName;
  category: ToolCategory;
  summary: string;
  description: string;
  input: string;
  output: string;
  mouse: boolean;
  risk: ToolRisk;
}

export const AGENT_TOOL_REGISTRY: AgentToolDefinition[] = [
  { id: 'sys.selectContext', category: '系统控制', summary: '展开分类候选简表、装载具体工具进入执行阶段，或退出执行返回全局计划阶段', description: '在全局计划阶段与局部执行阶段之间切换或补充工具。用法：① 在全局计划阶段，可传 {"categories": [...]} 展开对应分类下的候选工具简表；② 依据当前计划（plan），从候选简表中挑选执行该计划所需的具体工具 ID 传 {"tools": [...]} 装载工具并进入局部执行阶段（在局部执行阶段如需补充工具，可直接传 {"tools": [...]} 增量合并装载，已装载工具会自动保留）；③ 当当前计划的所有步骤均已执行完毕（或需重新调整全局计划）时，无参调用 {{调用 sys.selectContext}} 退出执行并返回全局计划阶段。', input: '{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }', output: '下一轮装载的工具分类或具体工具', mouse: false, risk: '内部状态' },
  { id: 'script.directory', category: '剧本与资产', summary: '读取剧本分集与场次目录概览', description: '分页读取剧本分集与场次目录概览（集号可能跳号或重复，总集数按实际条目统计；可传 query 按标题/场次/角色筛选，返回各集与各场次的起止行号及段落数 paragraphCount）。', input: '{ query?: string, offset?: number, limit?: number }', output: '当前项目分集与场次目录', mouse: false, risk: '只读' },
  { id: 'script.read', category: '剧本与资产', summary: '按“集数 -> 场次 -> 段落”三层结构读取剧本正文', description: '按“集数（episodes）-> 场次（scenes）-> 段落（paragraphs）”三层结构读取剧本正文（段落以换行为分界：换行即为下一段落，没有换行就是一个段落；场次头与人物表已归入 scene 属性，paragraphs 仅含正文段落及各自 index 与 lineNumber）。支持直接传 episode（如 "第一集"/1）、scene（如 "1-2"）、paragraph（段落序号或区间）或 startLine/endLine/offset/limit 定向读取。', input: '{ episode?: string | number, scene?: string | number, paragraph?: number | [number, number], startLine?: number, endLine?: number, offset?: number, limit?: number }', output: '按 episodes -> scenes -> paragraphs 组织的三层结构化剧本数据', mouse: false, risk: '只读' },
  { id: 'script.search', category: '剧本与资产', summary: '在剧本指定范围（目标集/场次/行号区间）或全文中搜索关键词并返回匹配段落行', description: '在剧本中搜索关键词并返回匹配行号与段落内容（可传 episode 如 "第一集"/1、scene 如 "1-5" 或 startLine/endLine 限定搜索范围；未传范围时默认搜索全文）。', input: '{ query: string, episode?: string | number, scene?: string, startLine?: number, endLine?: number, limit?: number }', output: '搜索范围、匹配行和位置', mouse: false, risk: '只读' },
  { id: 'asset.list', category: '剧本与资产', summary: '按类型分页读取或按名称/别名检索已有角色、场景和道具资产', description: '按类型分页读取角色、场景和道具资产，支持按名称/别名关键词 query 检索。', input: '{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }', output: '资产列表及分页信息', mouse: false, risk: '只读' },
  { id: 'asset.create', category: '剧本与资产', summary: '新增角色、场景或道具资产并绑定剧本出处段落（若同一角色存在视觉上的不同造型、场景有日夜景、道具有不同形态，均直接作为该资产的 versions 多版本录入，无需向用户确认是否单独建卡）', description: '新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① description（资产设定简介）须写清首次出场位置（集/场）、身份归属及防混淆辨识特征（未在画面中呈现、仅被提及的背景信息归入 description）；② 单一版本直接写在一级属性；若资产存在多个版本（角色按视觉上的不同造型区分版本，包括不同年龄阶段、不同服装造型等，直接归入同一角色的 versions，无需向用户提问是否单独建角色；场景按日景/夜景区分版本；道具按不同形态/状态区分版本），必须在 versions 数组中同时传入初始版本与所有变体版本（确保 versions 数组长度至少为 2，且每个版本分别绑定各自造型的 provenances 与 aliases），或使用 parentId 为变体版本独立创建衍生卡片；③ provenances（出处锚点）判定规则：根据段落内容，如果资产可能在画面中呈现出来，即判定该段落为出处（直接传入对应场次 sceneTitle 与段落序号 paragraphIndices: [1, 2, 3] 或 paragraphIndex: 1，系统会自动映射行号与原文，无需重复手填 evidenceText）。', input: '{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: Array<{ name: string, description?: string, aliases?: string[], provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }', output: '新增成功的资产条目与 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.update', category: '剧本与资产', summary: '按 ID 修改已有资产属性、增量追加 versions 多版本（如角色不同视觉造型）或补充 provenances 出处段落', description: '按资产 ID 或版本 ID 修改已有资产的属性、二级版本列表（versions，角色按视觉上的不同造型区分版本，含不同年龄阶段或不同服装造型）或补充出处段落（provenances，判定规则：根据段落内容，如果资产可能在画面中呈现出来，即判定该段落为出处；直接传入 sceneTitle 与段落序号 paragraphIndices: [1, 2, 3] 即可，无需手填 evidenceText）。更新属性时直接在顶层传入修改字段（无需包裹在 updates 对象中；注意：传入 description、appearance 等文本属性会直接替换原字段值，若仅补充出处请勿传残缺的单场 description 覆盖已有简介）；更新出处或版本时 mode 默认 "append" 增量追加合并并保留已有其它版本和出处（全量重设传 "overwrite"；向已有资产追加新版本时在 versions 中传入新增版本即可）。', input: '{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }>, versions?: array, updates?: object, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }', output: '更新后的资产条目', mouse: false, risk: '交互动作' },
  { id: 'asset.delete', category: '剧本与资产', summary: '按 ID 删除单个或批量资产/二级版本', description: '按资产 ID 或二级版本 ID 删除单个（id）或批量（ids）条目。', input: '{ id?: string, ids?: string[], type?: "characters" | "locations" | "props" }', output: '删除确认与已删除 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.searchProvenanceCandidates', category: '剧本与资产', summary: '跨集检索剧本中的资产字面匹配候选段落', description: '检索剧本中资产原名/别名（aliases）的字面匹配候选段落（须结合返回的 contextSnippet，按“根据段落内容，如果资产可能在画面中呈现出来，即判定该段落为出处”筛选，再交由 asset.commitProvenance 或 asset.create/update 提交）。', input: '{ id?: string, name?: string, type?: "characters" | "locations" | "props", aliases?: string[], scopeScenes?: string[] }', output: '带 candidateId、evidenceText 与前后文语境切片的候选列表', mouse: false, risk: '只读' },
  { id: 'asset.commitProvenance', category: '剧本与资产', summary: '提交核验通过的资产出处段落锚点', description: '提交核验确认的出处锚点（判定规则：根据段落内容，如果资产可能在画面中呈现出来，即判定该段落为出处；可传 sceneTitle 与 paragraphIndices: [1, 2, 3]、asset.searchProvenanceCandidates 筛选出的 verifiedCandidateIds 或剧本原文段落 provenances；mode 默认 "append" 增量追加并保留旧集数出处，全量重设传 "overwrite"）。', input: '{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", sceneTitle?: string, paragraphIndices?: number[], verifiedCandidateIds?: string[], provenances?: Array<{ sceneTitle?: string, paragraphIndex?: number, paragraphIndices?: number[], lineNumber?: number, evidenceText?: string }> }', output: '已落盘的核验出处锚点与场次列表', mouse: false, risk: '交互动作' },
  { id: 'guide.lookup', category: '操作知识', summary: '查询应用界面操作指南', description: '查询应用界面操作指南（不提供项目隐藏数据）。', input: '{ query: string }', output: '操作路径与注意事项', mouse: false, risk: '只读' },
  { id: 'page.inspect', category: '页面观察', summary: '观察当前可见界面概览或指定组件区域内容', description: '观察当前可见界面概览或指定组件区域内容（仅在需演示或核验界面时使用；传 scope 查看具体可见区域）。', input: '{ scope?: "overview" | string, offset?: number, limit?: number }', output: '区域可见事实、组件、动作集合、分页及页面提示', mouse: true, risk: '只读' },
  { id: 'card.inspect', category: '页面观察', summary: '查看指定卡片的图像、提示词、参考图及画幅参数', description: '查看指定卡片的图像、生成提示词、参考图及画幅比例/分辨率参数。', input: '{ cardId: string, includeImage?: boolean, includePrompt?: boolean, includeReference?: boolean, includeParameters?: boolean }', output: '请求的卡片属性、文件资源或高清图像视觉反馈', mouse: true, risk: '只读' },
  { id: 'card.detectLandmarks', category: '页面交互', summary: '对指定卡片画面进行元素空间定位与语义标注', description: '对指定卡片画面进行元素空间定位与语义标注（action 默认 "detect"，支持 "detect" | "list" | "update" | "delete" | "clear"；mode 默认 "overwrite" 覆盖标注，传 "append" 增量追加）。', input: '{ cardId: string, action?: "detect" | "list" | "update" | "delete" | "clear", requirement?: string, mode?: "append" | "overwrite", updates?: array, deleteIds?: string[] }', output: '{ success: boolean, cardId: string, elements: array, summary: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'card.annotateElements', category: '页面交互', summary: '对指定卡片画面进行元素空间定位与语义标注', description: '【与 card.detectLandmarks 相同】对指定卡片画面进行元素空间定位与语义标注。', input: '{ cardId: string, action?: "detect" | "list" | "update" | "delete" | "clear", requirement?: string, mode?: "append" | "overwrite", updates?: array, deleteIds?: string[] }', output: '{ success: boolean, cardId: string, elements: array, summary: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'card.generate', category: '页面交互', summary: '触发生图或对已有卡片执行复刻衍生创建新卡', description: '触发生图或执行【复刻 (Fork)】衍生（严禁覆盖资产卡或已出图卡片，重绘会自动触发复刻创建新卡；默认使用 Hy Image3.5 preview 并提供简短卡片名 name；仅当返回 generating 时才可宣称生图已启动）。', input: '{ name: string, prompt?: string, referenceCardIds?: string[], targetCardId?: "new" | string, aspectRatio?: string, style?: string, autoStart?: boolean }', output: '{ success: boolean, cardId: string, cardName: string, cardState: "draft" | "generating" | "completed", isForked: boolean, autoStarted: boolean, prompt: string, referenceCount: number, mcpTaskId?: string, imageUrl?: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'ui.actAndObserve', category: '页面交互', summary: '在已观察到的可见目标上执行鼠标动作并返回新界面状态', description: '在最近一次 page.inspect 已观察到的可见目标上执行鼠标动作（action 须以 "mouse." 开头）并返回新界面状态。', input: '{ targetId: string, action: string, arguments?: { delta?: number, deltaX?: number, deltaY?: number, text?: string }, observe?: { scope?: string } }', output: '动作状态与最新可见页面事实', mouse: true, risk: '交互动作' },
  { id: 'sys.endTask', category: '系统控制', summary: '结束当前任务并输出最终汇报（仅限全局计划阶段调用）', description: '结束当前任务（仅限在全局计划与验收阶段调用，最终汇报直接写在【用户沟通】中；若需等待异步任务可设 paused: true）。', input: '{ success?: boolean, paused?: boolean }', output: '任务已结束', mouse: false, risk: '内部状态' },
  { id: 'user.ask', category: '系统控制', summary: '向用户提问并挂起任务等待回复', description: '向用户提问并挂起任务等待回复（问题直接写在【用户沟通】中，无需传参）。', input: '{ question?: string }', output: '用户的回复', mouse: false, risk: '内部状态' },
];

export type AgentToolConfig = Record<AgentToolName, boolean>;

export const DEFAULT_AGENT_TOOL_CONFIG: AgentToolConfig = Object.fromEntries(
  AGENT_TOOL_REGISTRY.map((tool) => [tool.id, true]),
) as AgentToolConfig;

export const getAgentToolConfig = (): AgentToolConfig => {
  try {
    const saved = localStorage.getItem('agent_tool_config');
    return { ...DEFAULT_AGENT_TOOL_CONFIG, ...(saved ? JSON.parse(saved) : {}), 'sys.selectContext': true };
  } catch {
    return { ...DEFAULT_AGENT_TOOL_CONFIG };
  }
};

export const saveAgentToolConfig = (config: AgentToolConfig) => {
  localStorage.setItem('agent_tool_config', JSON.stringify(config));
};
