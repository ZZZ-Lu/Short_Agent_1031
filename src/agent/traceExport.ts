import type { AgentRuntimeTrace, AgentTurnTrace } from './debugTrace';
import type { PromptCacheUsageStats } from './promptCache';
import type { RuntimeEvent } from './runtime';

export type TraceExportPreset = 'diagnostic' | 'io_only' | 'full' | 'custom';
export type TraceExportFormat = 'markdown' | 'json';
export type TraceExportPromptMode = 'none' | 'first_turn' | 'all_turns';

export interface TraceExportOptions {
  preset: TraceExportPreset;
  format: TraceExportFormat;
  promptMode: TraceExportPromptMode;
  includeContextSummary: boolean;
  includeModelOutput: boolean;
  includeParsedResult: boolean;
  includeToolCalls: boolean;
  truncateLongToolOutput: boolean;
  maxToolOutputChars: number;
  includeAuxNodes: boolean;
  includeTaskSnapshots: boolean;
}

export const TRACE_EXPORT_STORAGE_KEY = 'mira_runtime_trace_export_options_v1';

export function getPresetExportOptions(
  preset: Exclude<TraceExportPreset, 'custom'>,
  format: TraceExportFormat = 'markdown'
): TraceExportOptions {
  if (preset === 'io_only') {
    return {
      preset: 'io_only',
      format,
      promptMode: 'all_turns',
      includeContextSummary: true,
      includeModelOutput: true,
      includeParsedResult: false,
      includeToolCalls: false,
      truncateLongToolOutput: false,
      maxToolOutputChars: 800,
      includeAuxNodes: false,
      includeTaskSnapshots: false,
    };
  }
  if (preset === 'full') {
    return {
      preset: 'full',
      format,
      promptMode: 'all_turns',
      includeContextSummary: true,
      includeModelOutput: true,
      includeParsedResult: true,
      includeToolCalls: true,
      truncateLongToolOutput: false,
      maxToolOutputChars: 800,
      includeAuxNodes: true,
      includeTaskSnapshots: true,
    };
  }
  // Default: 'diagnostic' (诊断复盘版：上下文摘要 + 模型原始输出 + 工具调用入参与返回结果)
  return {
    preset: 'diagnostic',
    format,
    promptMode: 'none',
    includeContextSummary: true,
    includeModelOutput: true,
    includeParsedResult: false,
    includeToolCalls: true,
    truncateLongToolOutput: false,
    maxToolOutputChars: 800,
    includeAuxNodes: false,
    includeTaskSnapshots: false,
  };
}

export function truncateDeepValue(value: unknown, maxChars: number): unknown {
  if (maxChars <= 0) return value;
  if (typeof value === 'string') {
    if (value.length <= maxChars) return value;
    const headLen = Math.max(100, Math.floor(maxChars * 0.65));
    const tailLen = Math.max(60, Math.floor(maxChars * 0.25));
    const omitted = value.length - headLen - tailLen;
    if (omitted <= 40) return value;
    return `${value.slice(0, headLen)}\n...[已折叠中间 ${omitted} 字符，总长 ${value.length} 字符]...\n${value.slice(value.length - tailLen)}`;
  }
  if (Array.isArray(value)) {
    return value.map(item => truncateDeepValue(item, maxChars));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = truncateDeepValue(v, maxChars);
    }
    return out;
  }
  return value;
}

export interface ExtractedTurnToolRecord {
  index: number;
  toolName: string;
  status: string;
  summaryText: string;
  input: unknown;
  output: unknown;
  error?: string;
  timestamp?: number;
}

export function extractTurnToolRecords(
  trace: AgentRuntimeTrace,
  turn: AgentTurnTrace,
  options: Pick<TraceExportOptions, 'truncateLongToolOutput' | 'maxToolOutputChars'>
): ExtractedTurnToolRecord[] {
  const allEvents: RuntimeEvent[] = Array.isArray(trace.task?.events) ? trace.task.events : [];
  const turnToolEvents = allEvents.filter(e => e.turnId === turn.id && e.type === 'tool');

  if (turnToolEvents.length > 0) {
    return turnToolEvents.map((ev, idx) => ({
      index: idx + 1,
      toolName: ev.toolName || ev.text || 'unknown_tool',
      status: ev.status || 'completed',
      summaryText: ev.text || '',
      input: options.truncateLongToolOutput
        ? truncateDeepValue(ev.input, options.maxToolOutputChars)
        : ev.input,
      output: options.truncateLongToolOutput
        ? truncateDeepValue(ev.output, options.maxToolOutputChars)
        : ev.output,
      error: ev.error,
      timestamp: ev.createdAt,
    }));
  }

  // Fallback to parsedResult.toolCalls if runtime events haven't populated or were skipped
  const parsedCalls = Array.isArray(turn.parsedResult?.toolCalls) ? turn.parsedResult!.toolCalls : [];
  return parsedCalls.map((call, idx) => ({
    index: idx + 1,
    toolName: call.name || 'unknown_tool',
    status: 'called',
    summaryText: `调用 ${call.name}`,
    input: options.truncateLongToolOutput
      ? truncateDeepValue(call.arguments, options.maxToolOutputChars)
      : call.arguments,
    output: undefined,
  }));
}

function formatDurationMs(startedAt: number, completedAt?: number): string {
  if (!completedAt || completedAt < startedAt) return '进行中';
  const diff = completedAt - startedAt;
  if (diff < 1000) return `${diff} ms`;
  return `${diff} ms (${(diff / 1000).toFixed(2)} s)`;
}

function formatJsonPretty(value: unknown): string {
  if (value === undefined) return 'null';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatPromptMessagesForTrace(msgs: unknown, fallbackRequest: unknown): unknown {
  if (Array.isArray(msgs) && msgs.length > 1) {
    return msgs
      .map((m: any) => {
        const role = String(m?.role || 'unknown').toUpperCase();
        const body = typeof m?.content === 'string' ? m.content : JSON.stringify(m?.content ?? '');
        return body ? `=== [${role}] ===\n${body}` : '';
      })
      .filter(Boolean)
      .join('\n\n');
  }
  if (Array.isArray(msgs) && msgs.length === 1) {
    return msgs[0]?.content ?? fallbackRequest ?? null;
  }
  return fallbackRequest ?? null;
}

function formatCacheUsageLine(usage?: PromptCacheUsageStats): string | null {
  if (!usage || typeof usage.promptTokens !== 'number') return null;
  const hit = typeof usage.cacheHitTokens === 'number' ? usage.cacheHitTokens : undefined;
  const pct = hit !== undefined && usage.promptTokens > 0
    ? ((hit / usage.promptTokens) * 100).toFixed(1)
    : undefined;
  const hitText = hit !== undefined ? `缓存命中 ${hit} (${pct}%)` : '未返回命中明细';
  const outText = typeof usage.completionTokens === 'number' ? ` · 输出 ${usage.completionTokens}` : '';
  return `Prompt ${usage.promptTokens} tokens · ${hitText}${outText}`;
}

function aggregateTraceCacheStats(turns: AgentTurnTrace[]): {
  mainPromptTokens: number;
  mainCacheHitTokens: number;
  statePromptTokens: number;
  stateCacheHitTokens: number;
} {
  let mainPromptTokens = 0;
  let mainCacheHitTokens = 0;
  let statePromptTokens = 0;
  let stateCacheHitTokens = 0;

  for (const turn of turns) {
    const u = turn.transport?.response?.usage;
    if (u && typeof u.promptTokens === 'number') {
      mainPromptTokens += u.promptTokens;
      mainCacheHitTokens += u.cacheHitTokens ?? 0;
    }
    const su = turn.stateNodeTrace?.usage;
    if (su && typeof su.promptTokens === 'number') {
      statePromptTokens += su.promptTokens;
      stateCacheHitTokens += su.cacheHitTokens ?? 0;
    }
  }
  return { mainPromptTokens, mainCacheHitTokens, statePromptTokens, stateCacheHitTokens };
}

export function buildStructuredTraceExportObject(
  trace: AgentRuntimeTrace,
  options: TraceExportOptions,
  filterTurnId?: string
): Record<string, unknown> {
  const turns = filterTurnId
    ? (trace.turns || []).filter(t => t.id === filterTurnId)
    : (trace.turns || []);

  const firstStart = turns[0]?.startedAt || trace.createdAt;
  const lastEnd = turns.at(-1)?.completedAt || trace.updatedAt;

  const resolvedGoal = trace.task?.goal || trace.goal || trace.task?.initialGoal || '';
  const resolvedTitle = (trace.task?.title && trace.task.title !== '尚未命名')
    ? trace.task.title
    : (trace.task?.initialGoal || trace.goal || resolvedGoal);
  const cacheAgg = aggregateTraceCacheStats(turns);
  const hasCacheStats = cacheAgg.mainPromptTokens > 0 || cacheAgg.statePromptTokens > 0;

  return {
    taskId: trace.taskId,
    traceId: trace.id,
    title: resolvedTitle,
    goal: resolvedGoal,
    status: trace.task?.status || 'unknown',
    totalTurns: turns.length,
    totalDurationMs: lastEnd && firstStart && lastEnd >= firstStart ? lastEnd - firstStart : undefined,
    ...(hasCacheStats ? { cacheSummary: cacheAgg } : {}),
    exportedAt: new Date().toISOString(),
    exportPreset: options.preset,
    turns: turns.map((turn, idx) => {
      const turnObj: Record<string, unknown> = {
        turn: turn.turn,
        id: turn.id,
        startedAt: turn.startedAt,
        completedAt: turn.completedAt,
        durationMs: turn.completedAt ? turn.completedAt - turn.startedAt : undefined,
      };

      if (options.includeContextSummary) {
        turnObj.context = turn.transport?.request?.context || {
          thinkingLevel: turn.thinkingLevel ?? turn.taskBefore?.thinkingLevel ?? 0,
          requireTool: turn.requireTool,
        };
        if (turn.transport?.request?.model) {
          turnObj.model = turn.transport.request.model;
        }
        if (turn.transport?.response?.usage) {
          turnObj.usage = turn.transport.response.usage;
        }
      }

      const shouldIncludePrompt =
        options.promptMode === 'all_turns' ||
        (options.promptMode === 'first_turn' && idx === 0);
      if (shouldIncludePrompt) {
        const msgs = turn.transport?.request?.messages;
        turnObj.prompt = formatPromptMessagesForTrace(msgs, turn.transport?.request ?? null);
      }

      if (options.includeModelOutput) {
        turnObj.modelRawOutput = turn.transport?.response?.content ?? null;
      }

      if (options.includeParsedResult && turn.parsedResult) {
        const { debug: _debug, ...restParsed } = turn.parsedResult;
        turnObj.parsedResult = restParsed;
      }

      if (options.includeToolCalls) {
        turnObj.toolCalls = extractTurnToolRecords(trace, turn, options);
      }

      if (options.includeAuxNodes) {
        turnObj.stateNodeTrace = turn.stateNodeTrace ?? null;
        turnObj.scriptValidatorTrace =
          turn.parsedResult?.scriptValidatorTrace ??
          turn.parsedResult?.jsonAdapterTrace ??
          null;
      }

      if (options.includeTaskSnapshots) {
        turnObj.taskBefore = turn.taskBefore;
      }

      if (turn.error) {
        turnObj.error = turn.error;
      }

      return turnObj;
    }),
    ...(options.includeTaskSnapshots ? { finalTaskState: trace.task } : {}),
  };
}

export function formatRuntimeTraceExport(
  trace: AgentRuntimeTrace,
  options: TraceExportOptions,
  filterTurnId?: string
): string {
  if (options.format === 'json') {
    return JSON.stringify(buildStructuredTraceExportObject(trace, options, filterTurnId), null, 2);
  }

  const turns = filterTurnId
    ? (trace.turns || []).filter(t => t.id === filterTurnId)
    : (trace.turns || []);

  const firstStart = turns[0]?.startedAt || trace.createdAt;
  const lastEnd = turns.at(-1)?.completedAt || trace.updatedAt;
  const totalDuration =
    lastEnd && firstStart && lastEnd >= firstStart
      ? `${((lastEnd - firstStart) / 1000).toFixed(1)} s`
      : '进行中';

  const lines: string[] = [];
  const scopeTitle = filterTurnId && turns.length === 1
    ? `单轮运行追踪（第 ${turns[0].turn} 轮）`
    : `任务运行追踪明细（共 ${turns.length} 轮）`;

  const resolvedGoal = trace.task?.goal || trace.goal || trace.task?.initialGoal || '';
  const resolvedTitle = (trace.task?.title && trace.task.title !== '尚未命名')
    ? trace.task.title
    : (trace.task?.initialGoal || trace.goal || resolvedGoal);
  lines.push(`# ${scopeTitle}：${resolvedTitle}`);
  lines.push(`- **最终目标**：${resolvedGoal}`);
  lines.push(`- **任务状态**：${trace.task?.status || 'unknown'} · **总耗时**：${totalDuration}`);
  if (trace.task?.subGoal || trace.task?.progress) {
    lines.push(`- **最新进展**：${trace.task.progress || '无'}（小目标：${trace.task.subGoal || '无'}）`);
  }
  const mdCacheAgg = aggregateTraceCacheStats(turns);
  if (mdCacheAgg.mainPromptTokens > 0 || mdCacheAgg.statePromptTokens > 0) {
    const parts: string[] = [];
    if (mdCacheAgg.mainPromptTokens > 0) {
      const pct = ((mdCacheAgg.mainCacheHitTokens / mdCacheAgg.mainPromptTokens) * 100).toFixed(1);
      parts.push(`主循环命中 ${mdCacheAgg.mainCacheHitTokens} / ${mdCacheAgg.mainPromptTokens} tokens (${pct}%)`);
    }
    if (mdCacheAgg.statePromptTokens > 0) {
      const pct = ((mdCacheAgg.stateCacheHitTokens / mdCacheAgg.statePromptTokens) * 100).toFixed(1);
      parts.push(`状态节点命中 ${mdCacheAgg.stateCacheHitTokens} / ${mdCacheAgg.statePromptTokens} tokens (${pct}%)`);
    }
    lines.push(`- **缓存命中汇总**：${parts.join(' · ')}`);
  }
  lines.push('');

  turns.forEach((turn, idx) => {
    lines.push(`---`);
    lines.push(`## 第 ${turn.turn} 轮（耗时：${formatDurationMs(turn.startedAt, turn.completedAt)}）`);

    if (options.includeContextSummary) {
      const ctx = turn.transport?.request?.context;
      const modelName = turn.transport?.request?.model || 'default';
      if (ctx) {
        lines.push(
          `- **运行上下文**：模型 \`${modelName}\` · 思考层级 \`${ctx.level} 级\` · 注入工具 (${ctx.tools.length})：\`${ctx.tools.join(', ') || '无'}\``
        );
      } else {
        lines.push(
          `- **运行上下文**：模型 \`${modelName}\` · 思考层级 \`${turn.thinkingLevel ?? 0} 级\` · ${turn.requireTool ? '强制要求调用工具' : '正常唤醒'}`
        );
      }
      const turnUsageLine = formatCacheUsageLine(turn.transport?.response?.usage);
      if (turnUsageLine) {
        lines.push(`- **Token 与缓存**：${turnUsageLine}`);
      }
    }

    const shouldIncludePrompt =
      options.promptMode === 'all_turns' ||
      (options.promptMode === 'first_turn' && idx === 0);

    if (shouldIncludePrompt) {
      const msgs = turn.transport?.request?.messages;
      const rawPrompt = formatPromptMessagesForTrace(msgs, turn.transport?.request);
      lines.push('');
      lines.push(`### [第 ${turn.turn} 轮] 实际发送 Prompt`);
      lines.push('```text');
      lines.push(rawPrompt ? formatJsonPretty(rawPrompt) : '（未记录 Prompt）');
      lines.push('```');
    }

    if (options.includeModelOutput) {
      const rawOutput = turn.transport?.response?.content;
      lines.push('');
      lines.push(`### [第 ${turn.turn} 轮] 模型原始输出`);
      lines.push('```text');
      if (typeof rawOutput === 'string' && rawOutput.trim()) {
        lines.push(rawOutput.trim());
      } else if (turn.parsedResult) {
        const fallbackParts: string[] = [];
        if (Array.isArray(turn.parsedResult.narration) && turn.parsedResult.narration.length) {
          fallbackParts.push(turn.parsedResult.narration.join('\n'));
        }
        if (turn.parsedResult.speak) {
          fallbackParts.push(`用户沟通：${turn.parsedResult.speak}`);
        }
        lines.push(fallbackParts.join('\n\n') || '（本轮无模型原始文本输出）');
      } else {
        lines.push('（本轮尚未返回模型输出）');
      }
      lines.push('```');
    }

    if (options.includeParsedResult && turn.parsedResult) {
      const { debug: _debug, ...restParsed } = turn.parsedResult;
      lines.push('');
      lines.push(`### [第 ${turn.turn} 轮] 服务端解析结果`);
      lines.push('```json');
      lines.push(formatJsonPretty(restParsed));
      lines.push('```');
    }

    if (options.includeToolCalls) {
      const toolRecords = extractTurnToolRecords(trace, turn, options);
      lines.push('');
      lines.push(`### [第 ${turn.turn} 轮] 工具调用记录（共 ${toolRecords.length} 个）`);
      if (toolRecords.length === 0) {
        lines.push('（本轮未调用任何工具）');
      } else {
        for (const rec of toolRecords) {
          lines.push(`#### 🛠️ 工具 ${rec.index}：\`${rec.toolName}\` (${rec.status})`);
          if (rec.input !== undefined) {
            lines.push('**工具输入 (Input)**：');
            lines.push('```json');
            lines.push(formatJsonPretty(rec.input));
            lines.push('```');
          }
          if (rec.output !== undefined) {
            lines.push('**工具输出 (Output)**：');
            lines.push('```json');
            lines.push(formatJsonPretty(rec.output));
            lines.push('```');
          }
          if (rec.error) {
            lines.push(`**工具报错 (Error)**：\`${rec.error}\``);
          }
        }
      }
    }

    if (options.includeAuxNodes) {
      if (turn.stateNodeTrace?.prompt || turn.stateNodeTrace?.response) {
        lines.push('');
        lines.push(`### [第 ${turn.turn} 轮] 认知状态提取节点`);
        const stateUsageLine = formatCacheUsageLine(turn.stateNodeTrace.usage);
        if (stateUsageLine) {
          lines.push(`- **状态节点 Token 与缓存**：${stateUsageLine}`);
        }
        if (turn.stateNodeTrace.prompt) {
          lines.push('**状态节点输入 Prompt**：');
          lines.push('```text');
          lines.push(formatJsonPretty(turn.stateNodeTrace.prompt));
          lines.push('```');
        }
        if (turn.stateNodeTrace.response) {
          lines.push('**状态节点输出结果**：');
          lines.push('```json');
          lines.push(formatJsonPretty(turn.stateNodeTrace.response));
          lines.push('```');
        }
      }
      const validatorTrace = turn.parsedResult?.scriptValidatorTrace || turn.parsedResult?.jsonAdapterTrace;
      if (validatorTrace) {
        lines.push('');
        lines.push(`### [第 ${turn.turn} 轮] 命令脚本校验器追踪`);
        lines.push('```json');
        lines.push(formatJsonPretty(validatorTrace));
        lines.push('```');
      }
    }

    if (options.includeTaskSnapshots) {
      lines.push('');
      lines.push(`### [第 ${turn.turn} 轮] 调用前任务快照 (taskBefore)`);
      lines.push('```json');
      lines.push(formatJsonPretty(turn.taskBefore));
      lines.push('```');
    }

    if (turn.error) {
      lines.push('');
      lines.push(`> ❌ **本轮请求异常**：${turn.error}`);
    }

    lines.push('');
  });

  return lines.join('\n').trim() + '\n';
}
