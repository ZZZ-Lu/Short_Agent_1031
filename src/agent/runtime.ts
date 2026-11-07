import type { AgentHistoryItem, AgentToolCall, AgentTurnResult } from './protocol';
import { initialAgentContext, mergeTaskNotes, validateSelection, type AgentContextSelection } from './contextPolicy';

export type RuntimeTaskStatus = 'planning' | 'waiting_tools' | 'waiting_user' | 'completed' | 'failed' | 'cancelled' | 'paused';
export type RuntimeToolStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface RuntimeEvent {
  id: string;
  taskId: string;
  turnId: string;
  type: 'user' | 'thought' | 'tool' | 'answer' | 'system';
  text: string;
  toolName?: string;
  callId?: string;
  status?: RuntimeToolStatus;
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
  createdAt: number;
}

export interface RuntimeTask {
  context: AgentContextSelection;
  id: string;
  sessionId: string;
  goal: string;
  initialGoal?: string;
  title: string;
  status: RuntimeTaskStatus;
  turn: number;
  summary: string;
  subGoal?: string;
  progress: string;
  notes?: string;
  observations: AgentHistoryItem[];
  plan: Array<{ id: string; title: string; status: 'pending' | 'completed' }>;
  history: AgentHistoryItem[];
  events: RuntimeEvent[];
  pendingCallIds: string[];
  pendingAskCallId?: string;
  negotiationLog: Array<{ role: 'user' | 'agent', content: string, timestamp: number }>;
  lastGoalUpdatedAt: number;
  lastUserInputAt: number;
  images?: string[];
  cardContext?: Record<string, any>;
  thinkingLevel?: 0 | 1;
  domain?: string;
  requestedCategories?: string[];
}

export interface AgentRuntimeOptions {
  enabledTools?: () => readonly string[];
  requestTurn: (task: RuntimeTask, requireTool: boolean, signal?: AbortSignal) => Promise<AgentTurnResult>;
  executeTool: (call: AgentToolCall, task: RuntimeTask, signal?: AbortSignal) => Promise<unknown>;
  updateStateNode?: (task: RuntimeTask, result: AgentTurnResult, signal?: AbortSignal) => Promise<void>;
  onTaskChange?: (task: RuntimeTask) => void;
  maxTurns?: number;
  /** Full Theater V1: a task must include one successful, Agent-selected UI action before completion. */
  requireVisibleInteraction?: boolean;
  /** Returns true only for tools that may run alongside other read-only tools. */
  isParallelSafe?: (call: AgentToolCall) => boolean;
}

const terminal = new Set<RuntimeTaskStatus>(['completed', 'failed', 'cancelled']);

/**
 * The sole owner of task progress. It is intentionally independent from React
 * and DOM: UI state changes are exposed only as tools supplied by the host.
 */
export class AgentRuntime {
  private readonly tasks = new Map<string, RuntimeTask>();
  private readonly running = new Set<string>();
  private readonly abortControllers = new Map<string, AbortController>();
  private readonly options: Required<Pick<AgentRuntimeOptions, 'maxTurns'>> & AgentRuntimeOptions;

  constructor(options: AgentRuntimeOptions) {
    this.options = { ...options, maxTurns: options.maxTurns ?? Infinity };
  }

  createTask(input: { id: string; sessionId: string; goal: string; images?: string[]; cardContext?: Record<string, any> }): RuntimeTask {
    const task: RuntimeTask = {
      context: initialAgentContext(),
      id: input.id,
      sessionId: input.sessionId,
      goal: '',
      initialGoal: input.goal,
      title: '尚未命名',
      status: 'planning',
      turn: 0,
      summary: '',
      progress: '',
      observations: [],
      plan: [],
      history: [],
      events: [],
      pendingCallIds: [],
      negotiationLog: [{ role: 'user', content: input.goal, timestamp: Date.now() }],
      lastGoalUpdatedAt: 0,
      lastUserInputAt: Date.now(),
      images: input.images,
      cardContext: input.cardContext,
    };
    this.tasks.set(task.id, task);
    this.addEvent(task, { type: 'user', text: input.goal });
    return task;
  }

  getTask(taskId: string): RuntimeTask | undefined {
    return this.tasks.get(taskId);
  }

  addUserInput(taskId: string, input: string, images?: string[], cardContext?: Record<string, any>) {
    const task = this.requireTask(taskId);
    const finalAnswer = input.trim() || '（用户未回答）';
    if (!task.initialGoal && task.goal) {
      task.initialGoal = task.goal;
    }
    task.negotiationLog.push({ role: 'user', content: finalAnswer, timestamp: Date.now() });
    task.lastUserInputAt = Date.now();
    if (images && images.length > 0) {
      task.images = images;
    }
    if (cardContext) {
      task.cardContext = cardContext;
    }
    const currentTurnId = `${task.id}:turn:${task.turn}`;
    this.addEvent(task, { turnId: currentTurnId, type: 'user', text: finalAnswer });

    const pendingAskEvent = [...task.events].reverse().find(
      e => e.type === 'tool' && e.toolName === 'user.ask' && (e.status === 'running' || e.status === 'queued')
    );
    const askCallId = task.pendingAskCallId || pendingAskEvent?.callId;
    if (askCallId) {
      const prevOut = (pendingAskEvent?.output && typeof pendingAskEvent.output === 'object')
        ? (pendingAskEvent.output as Record<string, unknown>)
        : {};
      const question = (typeof prevOut.question === 'string' && prevOut.question)
        || (typeof pendingAskEvent?.input?.question === 'string' && pendingAskEvent.input.question)
        || task.summary
        || '';
      const askOutput: Record<string, unknown> = {
        ...prevOut,
        question: question || '向用户提问',
        answer: finalAnswer,
        status: 'answered',
      };
      this.updateLastTool(task, askCallId, 'succeeded', `用户已回复：${finalAnswer}`, { output: askOutput });
      task.observations.push({
        role: 'tool',
        content: {
          callId: askCallId,
          name: 'user.ask',
          status: 'succeeded',
          output: askOutput,
        },
      });
      task.pendingAskCallId = undefined;
    } else if (task.status === 'waiting_user') {
      const replyCallId = `user_reply_${Date.now()}`;
      task.observations.push({
        role: 'tool',
        content: {
          callId: replyCallId,
          name: 'user.ask',
          status: 'succeeded',
          output: {
            question: task.summary || '等待用户指示',
            answer: finalAnswer,
            status: 'answered',
          },
        },
      });
    }

    // If it was waiting, completed, or paused, resume it
    if (task.status === 'waiting_user' || terminal.has(task.status) || task.status === 'paused') {
      task.status = 'planning';
    }
    this.publish(task);
  }

  addAgentQuestion(taskId: string, question: string) {
    const task = this.requireTask(taskId);
    task.negotiationLog.push({ role: 'agent', content: question, timestamp: Date.now() });
  }

  private isInterrupted(task: RuntimeTask, signal?: AbortSignal): boolean {
    const status = task.status as RuntimeTaskStatus;
    return status === 'paused' || status === 'waiting_user' || terminal.has(status) || Boolean(signal?.aborted);
  }

  async wake(taskId: string): Promise<RuntimeTask> {
    const task = this.requireTask(taskId);
    if ((task.status as RuntimeTaskStatus) === 'cancelled' || this.running.has(taskId)) return task;
    // If task was paused, completed, or waiting_user, unfreeze it to planning so the ReAct loop executes
    if (task.status === 'paused' || task.status === 'completed' || task.status === 'waiting_user') {
      task.status = 'planning';
    }
    this.running.add(taskId);
    let controller = this.abortControllers.get(taskId);
    if (!controller || controller.signal.aborted) {
      controller = new AbortController();
      this.abortControllers.set(taskId, controller);
    }
    const signal = controller.signal;

    try {
      let recoveryCount = 0;
      let emptyToolCount = 0;
      const MAX_EMPTY_TOOL_RETRIES = 2;

      while (!terminal.has(task.status) && (task.status as RuntimeTaskStatus) !== 'paused' && (task.status as RuntimeTaskStatus) !== 'waiting_user' && !signal.aborted) {
        task.turn += 1;
        if (Number.isFinite(this.options.maxTurns) && this.options.maxTurns > 0 && task.turn > this.options.maxTurns) {
          task.status = 'waiting_user';
          const limitMsg = `任务已达到最大轮次限制（${this.options.maxTurns} 轮），已暂停等待用户指导。`;
          task.summary = limitMsg;
          this.addEvent(task, { turnId: `${task.id}:turn:${task.turn}`, type: 'system', text: limitMsg });
          this.publish(task);
          break;
        }

        task.status = 'planning';
        const turnId = `${task.id}:turn:${task.turn}`;
        this.publish(task);

        const result = await this.options.requestTurn(task, recoveryCount > 0, signal);

        // Check if user paused or cancelled while requestTurn was in-flight
        if (this.isInterrupted(task, signal)) {
          break;
        }

        const hasUserAskTool = Array.isArray(result.toolCalls) && result.toolCalls.some(
          call => !call.validationError && (
            call.name === 'user.ask' ||
            (call.name === 'sys.endTask' && typeof call.arguments?.waitForUser === 'string' && Boolean(call.arguments.waitForUser))
          )
        );
        const isOnlySelectContext = Array.isArray(result.toolCalls) &&
          result.toolCalls.length > 0 &&
          result.toolCalls.every(call => !call.validationError && call.name === 'sys.selectContext');

        // The debug transport snapshot is for the developer trace only. It
        // must never become part of the next model request's history.
        // Results are delivered once, except when pausing on user.ask or switching
        // stages/tools via sys.selectContext where the business data read in the
        // preceding turn must remain visible for the subsequent execution/review turn.
        const preservedObservations = (hasUserAskTool || isOnlySelectContext)
          ? task.observations.filter(obs => {
              const content = obs.content as any;
              const name = content?.name;
              if (name === 'sys.nudge' || name === 'user.ask' || name === 'sys.selectContext') {
                return false;
              }
              if (isOnlySelectContext && content?.status !== 'succeeded') {
                return false;
              }
              return true;
            })
          : [];
        task.observations = [...preservedObservations];
        result.narration.forEach(text => this.addEvent(task, { turnId, type: 'thought', text }));
        const fullAnswer = result.response || result.speak || result.fullAnswer;
        if (fullAnswer) {
          this.addEvent(task, { turnId, type: 'answer', text: fullAnswer });
        }

        // Sync cognitive state fields if returned in the turn result
        if (result.plan && Array.isArray(result.plan) && result.plan.length > 0) {
          task.plan = result.plan.map(item => ({ ...item, status: item.status || 'pending' }));
        }
        if (result.taskTitle && typeof result.taskTitle === 'string') {
          task.title = result.taskTitle;
        }
        if (result.subGoal && typeof result.subGoal === 'string') {
          task.subGoal = result.subGoal;
        }
        if (result.progress && typeof result.progress === 'string') {
          task.progress = result.progress;
        }
        if (result.goal && typeof result.goal === 'string') {
          task.goal = result.goal;
        }
        if (Array.isArray(result.failureSummaries)) {
          result.failureSummaries.forEach(summary => {
            if (typeof summary === 'string' && summary.trim()) {
              task.history.push({ role: 'agent', content: { name: 'agent.failure_summary', summary: summary.trim() } });
            }
          });
        }

        if (result.complete) {
          if (this.options.updateStateNode && !this.isInterrupted(task, signal)) {
            try {
              await this.options.updateStateNode(task, result, signal);
            } catch (nodeErr) {
              console.warn('Dedicated state node execution failed:', nodeErr);
            }
          }
          task.status = 'completed';
          if (result.speak) task.summary = result.speak;
          this.publish(task);
          break;
        }

        if (result.toolCalls.length === 0 && !this.isInterrupted(task, signal)) {
          // Check if this task is an active multi-step autonomous task with unfinished work
          const planList = Array.isArray(task.plan) && task.plan.length > 0 ? task.plan : (Array.isArray(result.plan) && result.plan.length > 0 ? result.plan : []);
          const hasPendingPlan = planList.some(p => p && p.status !== 'completed');
          const isAutonomousMode = task.context?.level === 1 || task.thinkingLevel === 1;
          const hasExecutedTools = task.events.some(e => e.type === 'tool' && e.status === 'succeeded');

          const isUnfinishedTask = hasPendingPlan || isAutonomousMode || hasExecutedTools;

          if (isUnfinishedTask && emptyToolCount < MAX_EMPTY_TOOL_RETRIES) {
            emptyToolCount++;
            recoveryCount++;
            const nudgeCallId = `nudge_${Date.now()}`;
            const nudgeMsg = (task.context?.level ?? 0) === 1
              ? '【系统提示】检测到本轮未输出任何 {{调用 ...}} 工具指令。当前处于 1 级执行层（1 级无法直接结束任务），请直接输出具体的业务工具调用指令推进执行；若 1 级执行步骤已完成，请调用 {{调用 sys.selectContext, {"level": 0}}} 返回 0 级验收后再结束任务。'
              : '【系统提示】检测到本轮未输出任何 {{调用 ...}} 工具指令，当前任务尚未结束（未调用 sys.endTask）。请紧接上一轮的【状态检查】与【思考】，直接输出具体的工具调用指令（如调用 sys.selectContext 装载工具，或在任务完全结束时显式调用 sys.endTask 结束任务）。';

            task.observations.push({
              role: 'tool',
              content: {
                callId: nudgeCallId,
                name: 'sys.nudge',
                status: 'failed',
                error: nudgeMsg,
              },
            });
            this.addEvent(task, {
              turnId,
              type: 'system',
              text: `【系统干预】第 ${emptyToolCount} 次检测到本轮未输出工具指令，当前任务尚未结束，正在引导 Agent 继续执行...`,
            });
            this.publish(task);
            continue;
          }

          if (isUnfinishedTask) {
            task.status = 'waiting_user';
            const pauseMsg = result.speak
              ? `${result.speak}（任务已暂停：Agent 未输出后续执行指令，等待用户指导）`
              : '任务已暂停：Agent 未输出后续执行指令，已暂停等待用户指导。';
            task.summary = pauseMsg;
            this.addEvent(task, { turnId, type: 'system', text: pauseMsg });
            this.publish(task);
            break;
          }

          if (this.options.updateStateNode && !this.isInterrupted(task, signal)) {
            try {
              await this.options.updateStateNode(task, result, signal);
            } catch (nodeErr) {
              console.warn('Dedicated state node execution failed:', nodeErr);
            }
          }
          task.status = 'completed';
          if (result.speak) task.summary = result.speak;
          this.publish(task);
          break;
        }

        if (this.isInterrupted(task, signal)) {
          break;
        }

        emptyToolCount = 0;
        recoveryCount = 0;
        task.status = 'waiting_tools';
        task.pendingCallIds = result.toolCalls.map(call => call.id);
        this.publish(task);

        // Preserve explicit Agent ordering around UI mutations. Consecutive
        // read-only calls can run together so guide.lookup + page.inspect do
        // not cost two model-round delays.
        let readBatch: AgentToolCall[] = [];
        const flushReadBatch = async () => {
          if (!readBatch.length) return;
          const batch = readBatch;
          readBatch = [];
          if (this.isInterrupted(task, signal)) return;
          await Promise.all(batch.map(call => this.runTool(task, turnId, call, signal)));
        };
        for (const call of result.toolCalls) {
          if (this.isInterrupted(task, signal)) break;
          if (this.options.isParallelSafe?.(call)) {
            readBatch.push(call);
            continue;
          }
          await flushReadBatch();
          if (this.isInterrupted(task, signal)) break;
          await this.runTool(task, turnId, call, signal);
          if (this.isInterrupted(task, signal)) break;
        }
        if (!this.isInterrupted(task, signal)) {
          await flushReadBatch();
        }
        task.pendingCallIds = [];

        // Dedicated State Node: Run AFTER tools have executed so the cognitive state
        // reflects the actual completed tool actions (e.g., sys.selectContext already loaded tools).
        // When user.ask is present, fire non-blocking so waiting_user UI updates with zero latency.
        if (this.options.updateStateNode && !signal.aborted && (task.status as RuntimeTaskStatus) !== 'cancelled') {
          if (hasUserAskTool) {
            void Promise.resolve(this.options.updateStateNode(task, result, signal))
              .then(() => this.publish(task))
              .catch(nodeErr => console.warn('Dedicated state node execution failed:', nodeErr));
          } else {
            try {
              await this.options.updateStateNode(task, result, signal);
            } catch (nodeErr) {
              console.warn('Dedicated state node execution failed:', nodeErr);
            }
          }
        }

        this.publish(task);
      }
    } catch (error) {
      if ((task.status as RuntimeTaskStatus) === 'cancelled' || signal.aborted) {
        task.status = 'cancelled';
        this.publish(task);
      } else if ((task.status as RuntimeTaskStatus) === 'paused') {
        this.publish(task);
      } else {
        task.status = 'failed';
        const message = error instanceof Error ? error.message : 'Agent 执行失败';
        this.addEvent(task, { type: 'answer', text: message, error: message });
        this.publish(task);
      }
    } finally {
      this.running.delete(taskId);
      if ((task.status as RuntimeTaskStatus) !== 'paused' && (task.status as RuntimeTaskStatus) !== 'waiting_user') {
        this.abortControllers.delete(taskId);
      }
    }
    return task;
  }

  pause(taskId: string) {
    const task = this.requireTask(taskId);
    if (!terminal.has(task.status) && task.status !== 'paused') {
      task.status = 'paused';
      this.addEvent(task, { type: 'system', text: '任务已暂停。' });
      this.publish(task);
    }
  }

  async resume(taskId: string): Promise<RuntimeTask> {
    const task = this.requireTask(taskId);
    if (task.status === 'paused') {
      task.status = 'planning';
      this.addEvent(task, { type: 'system', text: '任务已继续执行。' });
      this.publish(task);
      return this.wake(taskId);
    }
    return task;
  }

  cancel(taskId: string) {
    const task = this.requireTask(taskId);
    if (!terminal.has(task.status)) {
      task.status = 'cancelled';
      const controller = this.abortControllers.get(taskId);
      if (controller) {
        controller.abort();
        this.abortControllers.delete(taskId);
      }
      this.addEvent(task, { type: 'system', text: '任务已取消。' });
      this.publish(task);
    }
  }

  private async runTool(task: RuntimeTask, turnId: string, call: AgentToolCall, signal?: AbortSignal) {
    if (call.validationError) {
      const errMsg = call.validationError;
      this.addEvent(task, { turnId, type: 'tool', text: `调用拦截：${call.name}`, toolName: call.name, callId: call.id, status: 'failed', input: call.arguments, error: errMsg });
      task.history.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: errMsg } });
      task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: errMsg } });
      return;
    }

    this.addEvent(task, { turnId, type: 'tool', text: `调用中：${call.name}`, toolName: call.name, callId: call.id, status: 'queued', input: call.arguments });
    this.updateLastTool(task, call.id, 'running', `调用中：${call.name}`);
    
    if (call.name === 'sys.selectContext') {
      try {
        const prevCategories = task.requestedCategories?.length
          ? task.requestedCategories
          : (task.context?.categories ?? []);
        const explicitlyExpandedCategories = Array.isArray(call.arguments?.categories) && call.arguments.categories.length > 0;
        const selection = validateSelection(call.arguments, this.options.enabledTools?.() ?? [], prevCategories);
        task.context = selection;
        task.thinkingLevel = selection.level;
        if (Array.isArray(selection.categories) && selection.categories.length > 0) {
          task.requestedCategories = selection.categories;
        }
        let statusSummary = '';
        let transition: 'enter_execution' | 'expand_categories' | 'return_to_plan' = 'return_to_plan';
        if (selection.level === 1 && selection.tools.length > 0) {
          transition = 'enter_execution';
          statusSummary = `已进入局部执行阶段并装载具体工具: ${selection.tools.join(', ')}`;
        } else if (explicitlyExpandedCategories && selection.categories && selection.categories.length > 0) {
          transition = 'expand_categories';
          statusSummary = `已展开工具分类 [${selection.categories.join(', ')}] 的候选简表，请挑选具体工具填入 tools 进入局部执行阶段`;
        } else {
          transition = 'return_to_plan';
          statusSummary = '已返回全局计划与验收阶段（局部执行工具已卸载，可核对全局计划并推进下一步或调用 sys.endTask 结束任务）';
        }
        const obsOutput = { ...selection, transition };
        this.updateLastTool(task, call.id, 'succeeded', statusSummary, { output: obsOutput });
        task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'succeeded', output: obsOutput } });
      } catch (error) {
        const message = error instanceof Error ? error.message : '上下文选择失败';
        this.updateLastTool(task, call.id, 'failed', `失败：${call.name} · ${message}`, { error: message });
        task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: message } });
      }
      return;
    }

    if (call.name === 'sys.updateState') {
      if (typeof call.arguments.progress === 'string') task.progress = call.arguments.progress;
      if (typeof call.arguments.subGoal === 'string') task.subGoal = call.arguments.subGoal;
      if (typeof call.arguments.taskTitle === 'string') task.title = call.arguments.taskTitle;
      if (typeof call.arguments.goal === 'string') {
        task.goal = call.arguments.goal;
        task.lastGoalUpdatedAt = Date.now();
      }
      let rawNotes = call.arguments.notes;
      if (Array.isArray(rawNotes)) {
        rawNotes = rawNotes.join('\n');
      }
      if (typeof rawNotes === 'string') {
        const mode = String(call.arguments.notesMode || call.arguments.mode || 'append');
        task.notes = mergeTaskNotes(task.notes, rawNotes, mode);
      } else if (typeof call.arguments.overwriteNotes === 'string') {
        task.notes = mergeTaskNotes(task.notes, call.arguments.overwriteNotes, 'overwrite');
      } else if (typeof call.arguments.appendNotes === 'string') {
        task.notes = mergeTaskNotes(task.notes, call.arguments.appendNotes, 'append');
      }
      if (Array.isArray(call.arguments.plan)) task.plan = call.arguments.plan.map((item: any) => ({ ...item, status: item.status || 'pending' }));
      this.updateLastTool(task, call.id, 'succeeded', `已完成：${call.name}`, { output: '状态已持久化' });
      task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'succeeded', output: '状态已持久化' } });
      return;
    }

    if (call.name === 'sys.setThinkingLevel') {
      const levelVal = Number(call.arguments.level);
      if (levelVal === 0 || levelVal === 1) {
        task.thinkingLevel = levelVal as 0 | 1;
      }
      if (typeof call.arguments.domain === 'string') {
        task.domain = call.arguments.domain;
      }
      if (Array.isArray(call.arguments.requestedCategories)) {
        task.requestedCategories = call.arguments.requestedCategories.filter((c: any) => typeof c === 'string');
      }
      const statusMsg = `思考层级调整为 Level ${task.thinkingLevel ?? 0} (${task.domain || '通用领域'})，装载分类: [${(task.requestedCategories || []).join(', ') || '全局'}]`;
      this.updateLastTool(task, call.id, 'succeeded', `已完成：${call.name}`, { output: statusMsg });
      task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'succeeded', output: statusMsg } });
      return;
    }

    if (call.name === 'user.ask') {
      const existingAnswer = task.events.find(e => e.turnId === turnId && e.type === 'answer');
      const communicationText = existingAnswer?.text || '';
      const rawQuestion = typeof call.arguments?.question === 'string' && call.arguments.question.trim()
        ? call.arguments.question.trim()
        : '';
      const questionText = rawQuestion || communicationText || '请确认或补充信息：';
      const thoughtEvents = task.events.filter(e => e.turnId === turnId && e.type === 'thought' && e.text?.trim());
      const latestThought = thoughtEvents.length > 0 ? thoughtEvents[thoughtEvents.length - 1].text.trim() : undefined;

      if (!existingAnswer && questionText) {
        this.addEvent(task, { turnId, type: 'answer', text: questionText });
      }
      task.summary = communicationText || questionText;
      task.pendingAskCallId = call.id;
      task.status = 'waiting_user';

      let hostQuestion = questionText;
      try {
        const hostOut = await this.options.executeTool(call, task, signal);
        if (typeof hostOut === 'string' && hostOut.trim()) {
          hostQuestion = hostOut.trim();
        } else if (hostOut && typeof hostOut === 'object' && typeof (hostOut as any).question === 'string' && (hostOut as any).question.trim()) {
          hostQuestion = (hostOut as any).question.trim();
        }
      } catch (err) {
        console.warn('user.ask host hook error:', err);
      }

      const fullQuestionForContext = communicationText && rawQuestion && !communicationText.includes(rawQuestion)
        ? `${rawQuestion}（${communicationText}）`
        : (communicationText || rawQuestion || hostQuestion);

      const lastLog = task.negotiationLog[task.negotiationLog.length - 1];
      if (!lastLog || lastLog.role !== 'agent' || lastLog.content !== fullQuestionForContext) {
        task.negotiationLog.push({ role: 'agent', content: fullQuestionForContext, timestamp: Date.now() });
      }

      this.updateLastTool(task, call.id, 'running', `等待用户回复：${hostQuestion}`, {
        output: {
          question: fullQuestionForContext,
          shortQuestion: hostQuestion,
          agentContext: latestThought,
          status: 'waiting_user',
        },
      });
      this.publish(task);
      return;
    }

    if (call.name === 'sys.endTask') {
      if ((task.context?.level ?? 0) === 1) {
        const errMsg = '当前处于局部执行阶段，不可直接调用 sys.endTask 结束任务。请先调用 sys.selectContext 返回全局计划与验收阶段核对全局计划后，再调用 sys.endTask。';
        this.updateLastTool(task, call.id, 'failed', `失败：${call.name} · ${errMsg}`, { error: errMsg });
        task.history.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: errMsg } });
        task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: errMsg } });
        return;
      }
      const existingAnswer = task.events.find(e => e.turnId === turnId && e.type === 'answer');
      const communicationText = existingAnswer?.text || '';
      const responseSuggestsPending = /后台|渲染|排队|稍候|生成中|等待生成|正在生成|提交生成/i.test(communicationText);

      // Check if recent observations or tool calls in this task contain active pending card.generate
      const hasRecentPendingGeneration = task.observations.some(obs => {
        const content = obs.content as any;
        const out = content?.output;
        return content?.name === 'card.generate' && (
          out?.cardState === 'generating' ||
          out?.status === 'pending' ||
          out?.autoStarted === true
        );
      }) || task.events.some(e => e.toolName === 'card.generate' && (e.status === 'succeeded' || e.status === 'running'));

      const isPaused = Boolean(
        call.arguments?.paused ||
        call.arguments?.isPaused ||
        call.arguments?.status === 'paused' ||
        hasRecentPendingGeneration ||
        responseSuggestsPending
      );

      if (typeof call.arguments?.waitForUser === 'string' && call.arguments.waitForUser) {
        task.status = 'waiting_user';
        const waitForUserText = call.arguments.waitForUser;
        if (!existingAnswer) {
          this.addEvent(task, { turnId, type: 'answer', text: waitForUserText });
        }
        const fullAsk = communicationText || waitForUserText;
        const lastLog = task.negotiationLog[task.negotiationLog.length - 1];
        if (fullAsk && (!lastLog || lastLog.role !== 'agent' || lastLog.content !== fullAsk)) {
          task.negotiationLog.push({ role: 'agent', content: fullAsk, timestamp: Date.now() });
        }
        task.summary = fullAsk || task.summary;
      } else if (isPaused) {
        task.status = 'paused';
        const pauseMsg = communicationText || '任务已挂起暂停，等待后台事件唤醒。';
        if (!existingAnswer) {
          this.addEvent(task, { turnId, type: 'answer', text: pauseMsg });
        }
        task.summary = pauseMsg || task.summary;
      } else {
        task.status = 'completed';
        const finalMsg = communicationText || '任务完成。';
        if (!existingAnswer) {
          this.addEvent(task, { turnId, type: 'answer', text: finalMsg });
        }
        task.summary = finalMsg || task.summary;
      }
      this.updateLastTool(task, call.id, 'succeeded', `已完成：${call.name}`, { output: '任务已结束' });
      this.publish(task);
      return;
    }

    try {
      const output = await this.options.executeTool(call, task, signal);
      if (task.status === 'paused' || task.status === 'waiting_user' || terminal.has(task.status) || signal?.aborted) return;
      this.updateLastTool(task, call.id, 'succeeded', `已完成：${call.name}`, { output });
      task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'succeeded', output } });
    } catch (error) {
      if (task.status === 'cancelled' || signal?.aborted) return;
      const message = error instanceof Error ? error.message : '工具执行失败';
      this.updateLastTool(task, call.id, 'failed', `失败：${call.name} · ${message}`, { error: message });
      task.history.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: message } });
      task.observations.push({ role: 'tool', content: { callId: call.id, name: call.name, status: 'failed', error: message } });
    }
  }

  addFeedback(taskId: string, text: string, type: 'answer' | 'system' = 'answer') {
    const task = this.tasks.get(taskId);
    if (!task) return;
    this.addEvent(task, { type, text });
  }

  notifyTaskUpdated(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    this.publish(task);
  }

  private addEvent(task: RuntimeTask, partial: Omit<RuntimeEvent, 'id' | 'taskId' | 'turnId' | 'createdAt'> & { turnId?: string }) {
    task.events.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, taskId: task.id, turnId: partial.turnId || `${task.id}:system`, createdAt: Date.now(), ...partial });
    task.events = task.events.slice(-80);
    this.publish(task);
  }

  private updateLastTool(task: RuntimeTask, callId: string, status: RuntimeToolStatus, text: string, extra: Pick<RuntimeEvent, 'output' | 'error'> = {}) {
    const event = [...task.events].reverse().find(item => item.callId === callId);
    if (event) Object.assign(event, { status, text, ...extra });
    this.publish(task);
  }

  private publish(task: RuntimeTask) { this.options.onTaskChange?.({ ...task, events: [...task.events], history: [...task.history], pendingCallIds: [...task.pendingCallIds] }); }
  private requireTask(taskId: string) { const task = this.tasks.get(taskId); if (!task) throw new Error(`未知任务：${taskId}`); return task; }
}
