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
  { id: 'asset.create', category: '剧本与资产', description: '在当前项目中新增角色、场景或道具资产。支持单个新增（直接传入 name 及各分类属性、sourceScenes 出现场次出处列表）或批量新增（传入 items 资产对象数组一次性新增多个）。各分类属性：角色 characters（name, role, appearance, age, gender, personality, performanceNotes, sourceScenes）；场景 locations（name, timeOfDay, atmosphere, visualDetails, locationType: "INT" | "EXT", sourceScenes）；道具 props（name, owner, materialAndState, storySignificance, sourceScenes）。', input: '{ type: "characters" | "locations" | "props", name?: string, sourceScenes?: string[], items?: Array<{ name: string, sourceScenes?: string[], ...各分类属性 }>, role?: string, appearance?: string, atmosphere?: string, visualDetails?: string, materialAndState?: string, owner?: string }', output: '新增成功的资产条目与 ID', mouse: false, risk: '交互动作' },
  { id: 'asset.update', category: '剧本与资产', description: '修改当前项目中已有的资产属性（通过资产 ID）。可更新角色外貌、服装变体、场景细节、道具状态或 sourceScenes（多处出现的出处场次列表）。', input: '{ id: string, type?: "characters" | "locations" | "props", updates: object, sourceScenes?: string[] }', output: '更新后的资产条目', mouse: false, risk: '交互动作' },
  { id: 'asset.delete', category: '剧本与资产', description: '删除当前项目中的指定资产条目（支持单个 ID 或多个 ID 批量删除）。', input: '{ id?: string, ids?: string[], type?: "characters" | "locations" | "props" }', output: '删除确认与已删除 ID', mouse: false, risk: '交互动作' },
  { id: 'guide.lookup', category: '操作知识', description: '查询应用的操作说明；只说明如何通过界面查找信息，不提供当前项目隐藏数据。', input: '{ query }', output: '操作路径与注意事项', mouse: false, risk: '只读' },
  { id: 'page.inspect', category: '页面观察', description: '默认返回页面入口概览，正文不直接展开注入；指定 scope 为可见组件 ID（如 script.text）时申请查看该区域的可见内容。动作集合去重，不返回坐标或隐藏数据；分页截断明确提示。', input: '{ scope?: "overview" | 组件ID, offset?: number, limit?: number }', output: '区域可见事实、组件、动作集合、分页及页面提示', mouse: true, risk: '只读' },
  { id: 'card.inspect', category: '页面观察', description: '深入探针查看指定的卡片，可选择性地调取高清生成图像、生成提示词、输入参考图集合及其他元参数（如画幅比例、渲染状态、模型等）。支持在复刻、对照时精细索取图片，节省全局Token并极大提高分析纯度。', input: '{ cardId: string, includeImage?: boolean, includePrompt?: boolean, includeReference?: boolean, includeParameters?: boolean }', output: '请求的卡片属性、文件资源或高清图像视觉反馈', mouse: true, risk: '只读' },
  { id: 'card.detectLandmarks', category: '页面交互', description: '调用画面元素标注大模型节点，对指定卡片进行画面的元素空间定位与语义标注。支持增删查改(CRUD)：action 可为 "detect"（必须传入 requirement 描述具体标注要求，如"标注主角手中的长剑与玉佩"，支持 mode="append" 追加或 "overwrite" 覆写）、"list"（查看已有标注列表）、"update"（修改指定元素标签/坐标/描述）、"delete"（删除指定 ID 标注）、"clear"（清空所有标注）。', input: '{ cardId: string, action?: "detect" | "list" | "update" | "delete" | "clear", requirement?: string, mode?: "append" | "overwrite", updates?: Array<{ id: string, label?: string, description?: string, point?: {x: number, y: number} }>, deleteIds?: string[], force?: boolean }', output: '{ success: boolean, cardId: string, elements: array, summary: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'card.annotateElements', category: '页面交互', description: '【与 card.detectLandmarks 相同】调用画面元素标注节点，对指定卡片进行画面的元素空间定位与语义标注。支持增删查改(CRUD)：action 可为 "detect"（必填 requirement 标注要求）、"list"、"update"、"delete"、"clear"。', input: '{ cardId: string, action?: "detect" | "list" | "update" | "delete" | "clear", requirement?: string, mode?: "append" | "overwrite", updates?: Array<{ id: string, label?: string, description?: string, point?: {x: number, y: number} }>, deleteIds?: string[], force?: boolean }', output: '{ success: boolean, cardId: string, elements: array, summary: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'card.generate', category: '页面交互', description: '对指定卡片配置参数、触发生图或执行【复刻 (Fork)】衍生。必须传入卡片名称 name 参数（规范：尽可能简短，辨识度高，如"金发女郎晚礼服"、"赛博霓虹街景"）。遵循人机统一的画布生图哲学：若目标卡片为【已出图卡片 (completed)】或【资产卡片 (isAsset)】，再次生图时会自动触发与人类 UI 完全一致的【复刻 (Fork)】机制在右侧衍生创建新生图卡片，继承画幅/模型与参考图，建立父子血缘以保护历史生成成果；仅当目标卡片为【草稿 (draft)】或【失败卡片 (failed)】时才在原卡片上原地更新。支持多图参考 (referenceCardIds)、autoStart (控制草稿还是直接排队) 及 forceOverwrite 控制。生图默认使用免费模型 Hy Image3.5 preview。', input: '{ name: string, referenceCardIds?: string[], targetCardId?: "new" | string, prompt?: string, aspectRatio?: string, style?: string, autoStart?: boolean, forceOverwrite?: boolean }', output: '{ success: boolean, cardId: string, cardName: string, cardState: "draft" | "generating" | "completed", isForked: boolean, autoStarted: boolean, prompt: string, referenceCount: number, mcpTaskId?: string, imageUrl?: string, message: string }', mouse: true, risk: '交互动作' },
  { id: 'ui.actAndObserve', category: '页面交互', description: '在最近一次页面观察中出现的目标上执行一项鼠标动作，并返回动作后新的可见页面事实。', input: '{ targetId: string, action: string, arguments?: { delta?: number, text?: string } }', output: '动作状态与最新可见页面事实', mouse: true, risk: '交互动作' },
  { id: 'sys.endTask', category: '系统控制', description: '当全部计划和目标已完成时，调用此工具结束当前任务。任务结束汇报直接写在【用户沟通】（完整版/简版）中，本工具无需传 finalResponse 参数。若任务属于等待后台异步生成/出图，可设置 paused: true 挂起暂停。', input: '{ success?: boolean, paused?: boolean, waitForUser?: string }', output: '任务已结束', mouse: false, risk: '内部状态' },
  { id: 'user.ask', category: '系统控制', description: '向用户主动提问并挂起任务等待回复。你想问的问题直接写在【用户沟通（简版）】中，本工具无需传入重复问题。', input: '{ question?: string }', output: '用户的回复', mouse: false, risk: '内部状态' },
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
