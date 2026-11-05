export type AgentToolName =
  | 'sys.selectContext'
  | 'script.directory'
  | 'script.read'
  | 'script.search'
  | 'asset.list'
  | 'asset.create'
  | 'asset.update'
  | 'asset.delete'
  | 'asset.searchProvenanceCandidates'
  | 'asset.commitProvenance'
  | 'guide.lookup'
  | 'page.inspect'
  | 'card.inspect'
  | 'card.generate'
  | 'card.detectLandmarks'
  | 'card.annotateElements'
  | 'ui.actAndObserve'
  | 'sys.updateState'
  | 'sys.setThinkingLevel'
  | 'sys.endTask'
  | 'user.ask'
  | 'script.readMetadata'
  | 'script.readDirectory'
  | 'script.readEpisode'
  | 'asset.extractElements'
  | 'card.batchCreate';

export interface ToolCategoryMeta {
  id: string;
  name: string;
  description: string;
  toolIds: AgentToolName[];
}

export const TOOL_CATEGORIES: Record<string, ToolCategoryMeta> = {
  script: {
    id: 'script',
    name: '剧本数据工具箱',
    description: '后台直接读取剧本元数据(readMetadata)、完整目录(readDirectory)、分集正文(readEpisode)及全文快速检索(search)',
    toolIds: ['script.readMetadata', 'script.readDirectory', 'script.readEpisode', 'script.search'],
  },
  asset: {
    id: 'asset',
    name: '项目资产管理与提取',
    description: '项目角色/场景/道具资产的增删查改(asset.list, asset.create, asset.update, asset.delete)、出处候选检索与逐条核验落盘(asset.searchProvenanceCandidates, asset.commitProvenance)与提取',
    toolIds: ['asset.list', 'asset.create', 'asset.update', 'asset.delete', 'asset.searchProvenanceCandidates', 'asset.commitProvenance', 'asset.extractElements'],
  },
  card: {
    id: 'card',
    name: '画布与分镜卡片控制',
    description: '批量创建卡片(batchCreate)、生图/复刻控制(generate)、深入探针查看(inspect)、元素空间标注(detectLandmarks/annotateElements)',
    toolIds: ['card.batchCreate', 'card.generate', 'card.inspect', 'card.detectLandmarks', 'card.annotateElements'],
  },
  ui: {
    id: 'ui',
    name: '页面观察与交互操作',
    description: '页面结构与组件观察(page.inspect)及GUI鼠标手势交互(ui.actAndObserve)',
    toolIds: ['page.inspect', 'ui.actAndObserve'],
  },
  system: {
    id: 'system',
    name: '系统与任务调度',
    description: '应用指南查询(guide.lookup)、认知状态更新(sys.updateState)、思考层级切换(sys.setThinkingLevel)与任务收尾(sys.endTask)',
    toolIds: ['guide.lookup', 'sys.updateState', 'sys.setThinkingLevel', 'sys.endTask', 'user.ask'],
  },
};

export interface AgentToolCall {
  id: string;
  name: AgentToolName;
  arguments: Record<string, unknown>;
  validationError?: string;
}

export interface AgentTurnResult {
  narration: string[];
  speak?: string;
  fullAnswer?: string;
  taskTitle?: string;
  goal?: string;
  subGoal?: string;
  progress?: string;
  thinkingLevel?: 0 | 1;
  domain?: string;
  requestedCategories?: string[];
  failureSummaries?: string[];
  plan?: Array<{ id: string; title: string; status?: 'pending' | 'completed' }>;
  toolCalls: AgentToolCall[];
  scriptValidatorTrace?: any;
  jsonAdapterTrace?: any;
  response?: string;
  waitForUser?: string;
  complete: boolean;
  /**
   * Development-only transport record. It is intentionally kept out of the
   * next model turn's history; the runtime trace panel uses it to show the
   * exact request assembled by the server and the raw provider message.
   */
  debug?: AgentTurnDebugSnapshot;
}

export interface AgentTurnDebugSnapshot {
  request: {
    model: string;
    messages: Array<{ role: string; content: unknown }>;
    tools: unknown[];
    context?: { level: number; tools: string[]; prompts: string[] };
  };
  response: {
    content: unknown;
    toolCalls: unknown[];
  };
}

export interface AgentHistoryItem {
  role: 'user' | 'agent' | 'tool';
  content: unknown;
}
