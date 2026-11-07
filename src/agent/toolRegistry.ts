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
  { id: 'sys.selectContext', category: '系统控制', summary: '展开分类候选简表、装载具体工具进入执行阶段，或退出执行返回全局计划阶段', description: '在全局计划阶段与局部执行阶段之间切换上下文。用法：① 在全局计划阶段，先传 {"categories": [...]} 展开对应分类下的候选工具简表；② 从候选简表中按需挑选具体工具 ID 传 {"tools": [...]} 装载工具并进入局部执行阶段；③ 在局部执行阶段完成当前小目标（或需更换工具/调整计划）时，直接无参调用 {{调用 sys.selectContext}} 退出执行并返回全局计划阶段。', input: '{ categories?: Array<"script" | "asset" | "card" | "ui">, tools?: string[], level?: 0 | 1 }', output: '下一轮装载的工具分类或具体工具', mouse: false, risk: '内部状态' },
  { id: 'script.directory', category: '剧本与资产', summary: '分页读取剧本分集目录与各集起止行号', description: '分页读取剧本分集目录（集号可能跳号或重复，总集数按实际条目统计；可传 query 按标题筛选目标集，返回各集 startLine/endLine 行号范围）。', input: '{ query?: string, offset?: number, limit?: number }', output: '当前项目分集目录', mouse: false, risk: '只读' },
  { id: 'script.read', category: '剧本与资产', summary: '按行分页读取剧本正文', description: '按行分页读取剧本正文（可配合 script.directory 返回的 startLine 传入 offset 定向读取目标集）。', input: '{ offset?: number, limit?: number }', output: '正文、行数及下一页位置', mouse: false, risk: '只读' },
  { id: 'script.search', category: '剧本与资产', summary: '在剧本指定范围（目标集/行号区间）或全文中搜索关键词并返回匹配行', description: '在剧本中搜索关键词并返回匹配行号与上下文（可传 episode 如 "第一集"/1 或传 startLine/endLine 限定搜索范围，避免跨集干扰；未传范围时默认搜索全文）。', input: '{ query: string, episode?: string | number, startLine?: number, endLine?: number, limit?: number }', output: '搜索范围、匹配行和位置', mouse: false, risk: '只读' },
  { id: 'asset.list', category: '剧本与资产', summary: '按类型分页读取或检索已有角色、场景和道具资产', description: '按类型分页读取角色、场景和道具资产，支持关键词检索。', input: '{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }', output: '资产列表及分页信息', mouse: false, risk: '只读' },
  { id: 'asset.create', category: '剧本与资产', summary: '新增角色、场景或道具资产（支持直接附带已读剧本出处原句）', description: '新增单个或批量（items）资产，或传 parentId 为已有资产追加二级版本。规则：① description（资产设定简介）须写清首次出场位置（集/场）、身份归属及防混淆辨识特征（其他角色台词或 OS 心理独白中提及该资产的背景信息归入 description）；② 单一形态直接写在一级属性，仅当存在2个及以上造型（角色）、日夜景（场景）或状态形态（道具）时才传 versions 二级列表；③ provenances（出场锚点）以“根据该行剧本描述，该资产是否直接出现在当前画面中”作为唯一判断标准——凡是剧本描述中直接呈现该资产在当前画面里的视觉出场/外貌/状态/动作行（▲...）以及该角色当场说出的台词行，均逐行计入 provenances（排除场首“人物：XXX”名单行，以及他人台词或 OS 心理独白中回顾背景、谈论该资产而非直接描写当前画面的行）。', input: '{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, lineNumber?: number, evidenceText: string }>, versions?: Array<{ name: string, description?: string, provenances?: array }>, items?: array, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }', output: '新增成功的资产条目与 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.update', category: '剧本与资产', summary: '按 ID 修改已有资产属性、二级版本或补充出处', description: '按资产 ID 或版本 ID 修改已有资产的属性、二级版本列表（versions）或直接补充已读剧本的出场原句（provenances，以“根据该行剧本描述，该资产是否直接出现在当前画面中”为唯一标准，包含直接呈现其在画面中的外貌/状态/动作行及角色当场台词，排除场首人物名单行及他人台词/OS 背景提及）。更新属性时保留已有设定仅修订差异；更新出处时 mode 默认 "append" 增量追加并保留旧集数出处，全量重设传 "overwrite"。', input: '{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", name?: string, description?: string, provenances?: Array<{ sceneTitle?: string, lineNumber?: number, evidenceText: string }>, versions?: array, updates?: object, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }', output: '更新后的资产条目', mouse: false, risk: '交互动作' },
  { id: 'asset.delete', category: '剧本与资产', summary: '按 ID 删除单个或批量资产/二级版本', description: '按资产 ID 或二级版本 ID 删除单个（id）或批量（ids）条目。', input: '{ id?: string, ids?: string[], type?: "characters" | "locations" | "props" }', output: '删除确认与已删除 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.searchProvenanceCandidates', category: '剧本与资产', summary: '跨集检索未读剧本中的资产字面匹配候选片段', description: '跨集检索未读剧本中资产原名/别名（aliases）的字面匹配候选（已读并锚定的集数无需调用；须结合返回的 contextSnippet，以“根据该行剧本描述，该资产是否直接出现在当前画面中”为唯一标准，剔除他人台词/OS 背景提及或同名异物条目，再交由 asset.commitProvenance 提交）。', input: '{ id?: string, name?: string, type?: "characters" | "locations" | "props", aliases?: string[], scopeScenes?: string[] }', output: '带 candidateId、evidenceText 与前后文语境切片的候选列表', mouse: false, risk: '只读' },
  { id: 'asset.commitProvenance', category: '剧本与资产', summary: '提交跨集检索核验通过的资产出处锚点', description: '提交经核验确认“根据该行剧本描述，该资产直接出现在当前画面中（含画面动作/状态/外貌描写及角色当场台词）”的出处锚点（可传 asset.searchProvenanceCandidates 筛选出的 verifiedCandidateIds 或已读剧本原句 provenances，不含场首人物名单行及他人台词/OS 背景提及；mode 默认 "append" 增量追加并保留旧集数出处，全量重设传 "overwrite"）。', input: '{ id: string, type?: "characters" | "locations" | "props", mode?: "append" | "overwrite", verifiedCandidateIds?: string[], provenances?: Array<{ sceneTitle?: string, lineNumber?: number, evidenceText: string }> }', output: '已落盘的核验出处锚点与场次列表', mouse: false, risk: '交互动作' },
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
