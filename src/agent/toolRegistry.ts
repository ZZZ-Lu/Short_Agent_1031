import type { AgentToolName } from './protocol';

export type ToolCategory = '剧本与资产' | '页面观察' | '页面交互' | '操作知识' | '系统控制';

export type ToolRisk = '只读' | '交互动作' | '内部状态';

export interface AgentToolDefinition {
  id: AgentToolName;
  category: ToolCategory;
  description: string;
  input: string;
  output: string;
  mouse: boolean;
  risk: ToolRisk;
}

export const AGENT_TOOL_REGISTRY: AgentToolDefinition[] = [
  { id: 'sys.selectContext', category: '系统控制', description: '选择下一轮思考层级、注入工具和提示词模块；提交后下一轮生效，当前轮只可调用已注入工具。', input: '{ level: 0 | 1, tools: string[], prompts: string[] }', output: '下一轮上下文选择', mouse: false, risk: '内部状态' },
  { id: 'script.directory', category: '剧本与资产', description: '分页读取当前项目的剧本分集目录，可按标题筛选。', input: '{ query?: string, offset?: number, limit?: number }', output: '当前项目分集目录', mouse: false, risk: '只读' },
  { id: 'script.read', category: '剧本与资产', description: '按行分页读取当前项目的剧本正文。', input: '{ offset?: number, limit?: number }', output: '正文、行数及下一页位置', mouse: false, risk: '只读' },
  { id: 'script.search', category: '剧本与资产', description: '在当前项目剧本中搜索关键词。', input: '{ query: string }', output: '匹配行和位置', mouse: false, risk: '只读' },
  { id: 'asset.list', category: '剧本与资产', description: '按类型分页读取当前项目的角色、场景和道具资产，支持关键词检索。', input: '{ type?: "characters" | "locations" | "props", query?: string, offset?: number, limit?: number }', output: '资产列表及分页信息', mouse: false, risk: '只读' },
  { id: 'asset.create', category: '剧本与资产', description: '在当前项目中新增角色、场景或道具资产。支持单个或批量新增（items）。须传入防混淆识别描述 description（写明首次出场、归属者及与相似资产的区分特征）；若存在两个及以上版本则传入 versions 二级版本列表（单一版本资产直接保留在主卡片，不设二级条目）。支持在资产或各 version 中直接传入 provenances（剧本原文中的具体出场描写句数组，支持代词指代或特定造型/动作原句，严禁传“人物：XXX”名单行），阅读剧本后一步完成资产创建与出处点亮。', input: '{ type: "characters" | "locations" | "props", parentId?: string, name?: string, description?: string, provenances?: Array<string | { sceneTitle?: string, lineNumber?: number, evidenceText: string }>, versions?: Array<{ name: string, description?: string, provenances?: array, ... }>, sourceScenes?: string[], items?: Array<{ name: string, description?: string, provenances?: array, versions?: array, ... }>, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }', output: '新增成功的资产条目与 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.update', category: '剧本与资产', description: '修改当前项目中已有的资产或二级版本属性（通过资产 ID 或版本 ID）。可更新识别描述 description、versions 二级版本列表、provenances 具体出场原文证据句、外观服装、场景日夜景、道具状态形态或 sourceScenes。', input: '{ id: string, type?: "characters" | "locations" | "props", updates: object, description?: string, provenances?: Array<string | { sceneTitle?: string, lineNumber?: number, evidenceText: string }>, versions?: array, sourceScenes?: string[] }', output: '更新后的资产条目', mouse: false, risk: '交互动作' },
  { id: 'asset.delete', category: '剧本与资产', description: '删除当前项目中的指定资产条目（支持单个 ID 或多个 ID 批量删除）。', input: '{ id?: string, ids?: string[], type?: "characters" | "locations" | "props" }', output: '删除确认与已删除 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.searchProvenanceCandidates', category: '剧本与资产', description: '针对指定资产或版本，传入其原名及可能简称/别名/版本特征词（aliases），在剧本全文检索所有候选命中并返回前后文切片与具体出场句子（evidenceText），供你顺藤摸瓜排查跨集出场：判断该资产在此处是否需要出现在画面中（需要出现在画面中则算作出场，不出现在画面中则不算出场）。', input: '{ id?: string, name?: string, type?: "characters" | "locations" | "props", aliases?: string[] }', output: '带 candidateId、evidenceText 与前后文语境切片的候选列表', mouse: false, risk: '只读' },
  { id: 'asset.commitProvenance', category: '剧本与资产', description: '提交核验通过的资产出处：既可提交 verifiedCandidateIds，也可在 provenances 中直接提交剧本原文的具体出场描写句（evidenceText，支持代词指代或特定服装/状态/动作描写原句，严禁提交“人物：XXX”名单行），生成上下文指纹锚点并点亮界面出处，使点击出处时精准高亮具体剧情内容。', input: '{ id: string, type?: "characters" | "locations" | "props", aliases?: string[], verifiedCandidateIds?: string[], provenances?: Array<string | { sceneTitle?: string, lineNumber?: number, evidenceText: string }>, summary?: string }', output: '已落盘的核验出处锚点与场次列表', mouse: false, risk: '交互动作' },
  { id: 'guide.lookup', category: '操作知识', description: '查询应用的操作说明；只说明如何通过界面查找信息，不提供当前项目隐藏数据。', input: '{ query: string }', output: '操作路径与注意事项', mouse: false, risk: '只读' },
  { id: 'page.inspect', category: '页面观察', description: '默认返回页面入口概览，正文不直接展开注入；指定 scope 为可见组件 ID（如 script.text）时申请查看该区域的可见内容。动作集合去重，不返回坐标或隐藏数据；分页截断明确提示。', input: '{ scope?: "overview" | 组件ID, offset?: number, limit?: number }', output: '区域可见事实、组件、动作集合、分页及页面提示', mouse: true, risk: '只读' },
  { id: 'card.inspect', category: '页面观察', description: '按需调取指定卡片的图像、生成提示词、输入参考图集合及元参数（画幅比例、渲染状态、模型等）。', input: '{ cardId: string, includeImage?: boolean, includePrompt?: boolean, includeReference?: boolean, includeParameters?: boolean }', output: '请求的卡片属性、文件资源或高清图像视觉反馈', mouse: true, risk: '只读' },
  { id: 'card.detectLandmarks', category: '页面交互', description: '调用画面元素标注大模型节点，对指定卡片进行画面的元素空间定位与语义标注。支持增删查改(CRUD)：action 可为 "detect"（需传入 requirement 标注要求）、"list"、"update"、"delete"、"clear"。', input: '{ cardId: string, action?: "detect" | "list" | "update" | "delete" | "clear", requirement?: string, mode?: "append" | "overwrite", updates?: Array<{ id: string, label?: string, description?: string, point?: {x: number, y: number} }>, deleteIds?: string[], force?: boolean }', output: '{ success: boolean, cardId: string, elements: array, summary: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'card.annotateElements', category: '页面交互', description: '【与 card.detectLandmarks 相同】调用画面元素标注节点，对指定卡片进行画面的元素空间定位与语义标注。', input: '{ cardId: string, action?: "detect" | "list" | "update" | "delete" | "clear", requirement?: string, mode?: "append" | "overwrite", updates?: Array<{ id: string, label?: string, description?: string, point?: {x: number, y: number} }>, deleteIds?: string[], force?: boolean }', output: '{ success: boolean, cardId: string, elements: array, summary: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'card.generate', category: '页面交互', description: '配置参数触发生图或执行【复刻 (Fork)】衍生。若目标卡片为已出图卡片或资产卡片，再次生图会自动触发复刻机制创建新生图卡片以保护历史成果；若为草稿或失败卡片则原地更新。支持多图参考 (referenceCardIds) 及 forceOverwrite。默认模型 Hy Image3.5 preview。', input: '{ name: string, referenceCardIds?: string[], targetCardId?: "new" | string, prompt?: string, aspectRatio?: string, style?: string, autoStart?: boolean, forceOverwrite?: boolean }', output: '{ success: boolean, cardId: string, cardName: string, cardState: "draft" | "generating" | "completed", isForked: boolean, autoStarted: boolean, prompt: string, referenceCount: number, mcpTaskId?: string, imageUrl?: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'ui.actAndObserve', category: '页面交互', description: '在最近一次页面观察中出现的目标上执行一项鼠标动作，并返回动作后新的可见页面事实。', input: '{ targetId: string, action: string, arguments?: { delta?: number, text?: string } }', output: '动作状态与最新可见页面事实', mouse: true, risk: '交互动作' },
  { id: 'sys.endTask', category: '系统控制', description: '当全部计划和目标已完成时结束当前任务。结束汇报直接写在【用户沟通】中，本工具无需传 finalResponse。若等待异步生成可设 paused: true。', input: '{ success?: boolean, paused?: boolean, waitForUser?: string }', output: '任务已结束', mouse: false, risk: '内部状态' },
  { id: 'user.ask', category: '系统控制', description: '向用户主动提问并挂起任务等待回复。问题直接写在【用户沟通（简版）】中，无需传参。', input: '{ question?: string }', output: '用户的回复', mouse: false, risk: '内部状态' },
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
