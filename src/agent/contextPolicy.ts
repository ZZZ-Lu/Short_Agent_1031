import { AGENT_TOOL_REGISTRY, type AgentToolDefinition } from './toolRegistry';
import type { AgentToolName } from './protocol';

export type ThinkingLevel = 0 | 1;
export interface AgentContextSelection { level: ThinkingLevel; tools: AgentToolName[]; prompts: string[] }

export const PROMPT_MODULES: Record<string, { label: string; content: string }> = {
  script: { label: '剧本读取与分析', content: '剧本内容按需读取。目录中的集号可能跳号或重复，集数应按实际条目统计。长文本通过分页读取；基于工具返回内容回答。' },
  assets: { label: '项目资产', content: '角色、场景和道具属于当前项目资产。支持 asset.list（查询）、asset.create（创建）、asset.update（修改）、asset.delete（删除）全套增删查改能力；依据剧本分析出的角色造型、场景或关键道具应及时沉淀保存到资产清单中。' },
  image: { label: '图像生成与卡片', content: '禁止覆盖资产卡片或已出图卡片；重新生成应使用现有复刻机制。只有工具返回 generating 才能宣称生成已启动；默认使用 Hy Image3.5 preview，并给 card.generate 提供简短名称。' },
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
