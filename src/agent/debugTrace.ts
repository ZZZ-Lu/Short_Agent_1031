import type { AgentTurnDebugSnapshot, AgentTurnResult } from './protocol';
import type { RuntimeTask } from './runtime';

export interface AgentTurnTrace {
  id: string;
  turn: number;
  requireTool: boolean;
  startedAt: number;
  completedAt?: number;
  taskBefore: RuntimeTask;
  transport?: AgentTurnDebugSnapshot;
  parsedResult?: AgentTurnResult;
  stateNodeTrace?: {
    prompt?: string;
    response?: any;
  };
  error?: string;
}

export interface AgentRuntimeTrace {
  id: string;
  taskId: string;
  goal: string;
  createdAt: number;
  updatedAt: number;
  task: RuntimeTask;
  turns: AgentTurnTrace[];
}

/** A render-safe task copy for the debugging UI. */
export const snapshotRuntimeTask = (task: RuntimeTask): RuntimeTask => ({
  ...task,
  context: task.context ? { ...task.context, tools: [...task.context.tools], prompts: [...task.context.prompts] } : { level: 0, tools: [], prompts: [] },
  plan: task.plan.map(item => ({ ...item })),
  history: task.history.map(item => ({ ...item })),
  observations: task.observations.map(item => ({ ...item })),
  events: task.events.map(event => ({ ...event })),
  pendingCallIds: [...task.pendingCallIds],
});
