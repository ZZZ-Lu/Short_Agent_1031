import React, { useEffect, useMemo, useState } from 'react';
import { Braces, Check, CheckCircle2, CircleAlert, Clock3, Copy, Cpu, Download, FileText, MousePointer2, Send, ShieldCheck, SlidersHorizontal, TerminalSquare, Wrench } from 'lucide-react';
import type { AgentRuntimeTrace, AgentTurnTrace } from '../agent/debugTrace';
import type { RuntimeEvent } from '../agent/runtime';
import {
  formatRuntimeTraceExport,
  getPresetExportOptions,
  TRACE_EXPORT_STORAGE_KEY,
  type TraceExportFormat,
  type TraceExportOptions,
  type TraceExportPreset,
  type TraceExportPromptMode,
} from '../agent/traceExport';

interface AgentRuntimeTracePanelProps {
  traces: AgentRuntimeTrace[];
}

type DetailTab = 'prompt' | 'output' | 'tools' | 'task' | 'stateNode' | 'scriptValidator';

const json = (value: unknown) => JSON.stringify(value, null, 2);
const clock = (value?: number) => value ? new Date(value).toLocaleTimeString('zh-CN', { hour12: false }) : '进行中';
const duration = (turn: AgentTurnTrace) => turn.completedAt ? `${turn.completedAt - turn.startedAt} ms` : '进行中';

const statusLabel = (status: string) => ({
  planning: '规划中', waiting_tools: '等待工具', waiting_user: '等待用户', completed: '已完成', failed: '失败', cancelled: '已取消', paused: '已暂停',
}[status] || status);

const eventIcon = (event: RuntimeEvent) => {
  if (event.type === 'tool') return <Wrench size={13} className="text-violet-500" />;
  if (event.type === 'answer') return <Send size={13} className="text-emerald-500" />;
  return <TerminalSquare size={13} className="text-slate-400" />;
};

function loadInitialExportOptions(): TraceExportOptions {
  try {
    const raw = localStorage.getItem(TRACE_EXPORT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...getPresetExportOptions('diagnostic', 'markdown'),
          ...parsed,
        };
      }
    }
  } catch {}
  return getPresetExportOptions('diagnostic', 'markdown');
}

export function AgentRuntimeTracePanel({ traces }: AgentRuntimeTracePanelProps) {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('prompt');
  const [exportOptions, setExportOptions] = useState<TraceExportOptions>(loadInitialExportOptions);
  const [showExportConfig, setShowExportConfig] = useState(false);
  const [copiedTask, setCopiedTask] = useState(false);
  const [copiedTurn, setCopiedTurn] = useState(false);
  const [copiedListTraceId, setCopiedListTraceId] = useState<string | null>(null);
  const latestTrace = traces.at(-1);

  const updateExportOptions = (updater: (prev: TraceExportOptions) => TraceExportOptions) => {
    setExportOptions(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(TRACE_EXPORT_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const applyPreset = (preset: Exclude<TraceExportPreset, 'custom'>) => {
    updateExportOptions(prev => getPresetExportOptions(preset, prev.format));
  };

  useEffect(() => {
    if (!selectedTraceId || !traces.some(trace => trace.id === selectedTraceId)) setSelectedTraceId(latestTrace?.id || null);
  }, [latestTrace?.id, selectedTraceId, traces]);

  const trace = traces.find(item => item.id === selectedTraceId) || latestTrace;
  const turns = trace?.turns || [];
  const latestTurn = turns.at(-1);

  useEffect(() => {
    if (!selectedTurnId || !turns.some(turn => turn.id === selectedTurnId)) setSelectedTurnId(latestTurn?.id || null);
  }, [latestTurn?.id, selectedTurnId, turns]);

  const turn = turns.find(item => item.id === selectedTurnId) || latestTurn;
  const turnEvents = useMemo(() => turn && trace
    ? trace.task.events.filter(event => event.turnId === turn.id)
    : [], [trace, turn]);

  const handleCopyFullTaskTrace = (targetTrace: AgentRuntimeTrace = trace!) => {
    if (!targetTrace) return;
    const content = formatRuntimeTraceExport(targetTrace, exportOptions);
    navigator.clipboard.writeText(content);
    if (targetTrace.id === trace?.id) {
      setCopiedTask(true);
      setTimeout(() => setCopiedTask(false), 2000);
    } else {
      setCopiedListTraceId(targetTrace.id);
      setTimeout(() => setCopiedListTraceId(curr => (curr === targetTrace.id ? null : curr)), 2000);
    }
  };

  const handleDownloadTaskTrace = () => {
    if (!trace) return;
    const content = formatRuntimeTraceExport(trace, exportOptions);
    const ext = exportOptions.format === 'json' ? 'json' : 'md';
    const mime = exportOptions.format === 'json' ? 'application/json;charset=utf-8' : 'text/markdown;charset=utf-8';
    const rawTitle = (trace.task.title && trace.task.title !== '尚未命名')
      ? trace.task.title
      : (trace.task.initialGoal || trace.goal || 'trace');
    const safeTitle = rawTitle
      .replace(/[\\/:*?"<>|\s]+/g, '_')
      .slice(0, 24);
    const filename = `trace_${safeTitle}_${turns.length}turns.${ext}`;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCurrentTurn = () => {
    if (!trace || !turn) return;
    const singleTurnOptions: TraceExportOptions = {
      ...exportOptions,
      promptMode: exportOptions.promptMode === 'none' ? 'all_turns' : exportOptions.promptMode,
      includeModelOutput: true,
      includeToolCalls: true,
    };
    const content = formatRuntimeTraceExport(trace, singleTurnOptions, turn.id);
    navigator.clipboard.writeText(content);
    setCopiedTurn(true);
    setTimeout(() => setCopiedTurn(false), 2000);
  };

  const presetLabel =
    exportOptions.preset === 'diagnostic'
      ? '诊断复盘版'
      : exportOptions.preset === 'io_only'
      ? '仅模型输入/输出'
      : exportOptions.preset === 'full'
      ? '全量镜像'
      : '自定义项';

  if (!trace) {
    return (
      <section className="grid flex-1 place-items-center bg-[#fbfbfc] text-center dark:bg-[#121214]">
        <div className="max-w-sm text-slate-400">
          <TerminalSquare className="mx-auto mb-3 opacity-30" size={36} />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">尚无 Agent 运行记录</p>
          <p className="mt-1 text-xs leading-5">从画布发起一次真实任务后，这里会保留当前会话中每轮实际发送的 Prompt、模型输出、工具输入输出和页面观察。</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="flex min-h-0 flex-1 select-text bg-[#fbfbfc] dark:bg-[#121214]"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-gray-100 dark:border-white/10 dark:bg-[#151517]">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-white/10">
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-violet-500">Runtime Trace</p>
          <h2 className="mt-1 text-base font-semibold">运行追踪</h2>
          <p className="mt-1 text-[11px] leading-4 text-slate-400">展示已实际运行的 Prompt、工具与页面证据；支持一键导出全轮次调试日志。</p>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {[...traces].reverse().map(item => {
            const active = item.id === trace.id;
            const isItemCopied = copiedListTraceId === item.id || (active && copiedTask);
            return <div
              key={item.id}
              onClick={() => { setSelectedTraceId(item.id); setSelectedTurnId(null); }}
              className={`group relative w-full cursor-pointer rounded-xl px-3 py-3 text-left transition ${active ? 'bg-violet-50 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200' : 'hover:bg-slate-50 dark:hover:bg-white/10'}`}
            >
              <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5"><Clock3 size={11} />{clock(item.createdAt)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyFullTaskTrace(item);
                  }}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-violet-100 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-500/30"
                  title={`按当前预设（${presetLabel}）一键复制该任务全部轮次日志`}
                >
                  {isItemCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  <span>{isItemCopied ? '已复制' : '复制日志'}</span>
                </button>
              </div>
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-5">
                {(item.task?.title && item.task.title !== '尚未命名') ? item.task.title : (item.task?.initialGoal || item.goal)}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">{item.turns?.length || 0} 轮 · {statusLabel(item.task.status)}</p>
            </div>;
          })}
        </div>
      </aside>

      <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-gray-100 dark:border-white/10 dark:bg-[#151517]">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold">
              {(trace.task.title && trace.task.title !== '尚未命名') ? trace.task.title : (trace.task.initialGoal || trace.goal)}
            </p>
            {turns.length > 0 && (
              <span className="shrink-0 text-[10px] font-medium text-slate-400">
                {(() => {
                  const start = turns[0].startedAt;
                  const lastTurn = turns[turns.length - 1];
                  const end = lastTurn.completedAt || Date.now();
                  const diff = Math.max(0, end - start);
                  if (diff < 1000) return `${diff} ms`;
                  if (diff < 60000) return `${(diff / 1000).toFixed(1)} s`;
                  const mins = Math.floor(diff / 60000);
                  const secs = Math.floor((diff % 60000) / 1000);
                  return `${mins}分 ${secs}秒`;
                })()}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">最终目标：{trace.task.goal || trace.task.initialGoal || trace.goal}</p>

          {/* Task-level Export Action Bar */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleCopyFullTaskTrace(trace)}
              className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-2.5 text-[11px] font-medium text-white shadow-2xs transition hover:bg-violet-700 active:scale-[0.99] cursor-pointer"
              title={`一键复制当前任务全部 ${turns.length} 轮日志（当前模式：${presetLabel}）`}
            >
              {copiedTask ? <Check size={12} /> : <Copy size={12} />}
              <span className="truncate">{copiedTask ? `已复制 ${turns.length} 轮明细` : `复制全任务日志 (${presetLabel})`}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTaskTrace}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700 cursor-pointer"
              title={`下载当前任务日志 (.${exportOptions.format === 'json' ? 'json' : 'md'})`}
              aria-label="下载任务追踪日志"
            >
              <Download size={12} />
            </button>
            <button
              type="button"
              onClick={() => setShowExportConfig(v => !v)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition cursor-pointer ${
                showExportConfig
                  ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/60 dark:text-violet-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-200'
              }`}
              title="配置导出内容颗粒度与预设"
              aria-label="配置导出内容颗粒度"
            >
              <SlidersHorizontal size={12} />
            </button>
          </div>

          {/* Expandable Granularity & Preset Configuration Panel */}
          {showExportConfig && (
            <div className="mt-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-[11px] shadow-xs dark:border-white/10 dark:bg-[#1c1c20]">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-200">导出预设模式</span>
                <div className="inline-flex rounded-md border border-slate-200 p-0.5 dark:border-white/10">
                  {(['markdown', 'json'] as TraceExportFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => updateExportOptions(prev => ({ ...prev, format: fmt }))}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition cursor-pointer ${
                        exportOptions.format === fmt
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {fmt === 'markdown' ? 'MD' : 'JSON'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 mb-2.5">
                {([
                  ['diagnostic', '诊断复盘版', '模型输出 + 工具入参/出参'],
                  ['io_only', '仅输入输出', '每轮 Prompt + 模型输出'],
                  ['full', '全量镜像', '含 Prompt/工具/状态节点/快照'],
                ] as const).map(([key, label, desc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    title={desc}
                    className={`rounded-lg border px-1.5 py-1 text-center text-[10px] font-medium transition cursor-pointer ${
                      exportOptions.preset === key
                        ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-2 dark:border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 dark:text-slate-300">实际 Prompt</span>
                  <select
                    value={exportOptions.promptMode}
                    onChange={(e) =>
                      updateExportOptions(prev => ({
                        ...prev,
                        preset: 'custom',
                        promptMode: e.target.value as TraceExportPromptMode,
                      }))
                    }
                    className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-700 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-200"
                  >
                    <option value="none">不导出 (精简防刷屏)</option>
                    <option value="first_turn">仅第 1 轮包含</option>
                    <option value="all_turns">每轮均包含全文</option>
                  </select>
                </div>

                {([
                  ['includeContextSummary', '上下文注入摘要 (层级/工具/模块)'],
                  ['includeModelOutput', '模型原始输出 (思考/调用/沟通)'],
                  ['includeToolCalls', '工具调用历史与输入/输出'],
                  ['truncateLongToolOutput', '超长工具返回自动折叠 (>800字)'],
                  ['includeParsedResult', '服务端解析结构 (parsedResult)'],
                  ['includeAuxNodes', '状态提取节点 & 脚本校验器'],
                  ['includeTaskSnapshots', '每轮调用前任务快照 (taskBefore)'],
                ] as const).map(([field, label]) => (
                  <label key={field} className="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(exportOptions[field])}
                      onChange={(e) =>
                        updateExportOptions(prev => ({
                          ...prev,
                          preset: 'custom',
                          [field]: e.target.checked,
                        }))
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="truncate">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {turns.map(item => {
            const active = item.id === turn?.id;
            const toolCount = item.parsedResult?.toolCalls?.length || 0;
            const validatorTrace = item.parsedResult?.scriptValidatorTrace || item.parsedResult?.jsonAdapterTrace;
            return <button key={item.id} onClick={() => setSelectedTurnId(item.id)} className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-violet-400 bg-violet-50/80 dark:border-violet-500 dark:bg-violet-950/40' : 'border-slate-200 bg-gray-100 hover:border-slate-300 dark:border-white/10 dark:bg-white/[.03]'}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">第 {item.turn} 轮</span><span className="text-[10px] text-slate-400">{duration(item)}</span></div>
              <p className="mt-1 text-[11px] text-slate-500">{item.transport?.request.context ? `${item.transport.request.context.level} 级 · ${item.transport.request.context.tools.length} 个注入工具` : (item.requireTool ? 'Runtime 要求继续调用工具' : '正常唤醒')}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Wrench size={11} />{toolCount} 个工具</span>
                {item.stateNodeTrace && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setSelectedTurnId(item.id); setDetailTab('stateNode'); }}
                    className="inline-flex items-center gap-1 rounded bg-violet-100 px-1.5 py-0.5 font-medium text-violet-700 hover:bg-violet-200 dark:bg-violet-900/60 dark:text-violet-300 dark:hover:bg-violet-800/80 cursor-pointer"
                    title="点击查看此轮状态提取节点 Prompt 与输出"
                  >
                    <Cpu size={10} />
                    状态节点
                  </span>
                )}
                {validatorTrace && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setSelectedTurnId(item.id); setDetailTab('scriptValidator'); }}
                    className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-800/80 cursor-pointer"
                    title="点击查看此轮命令脚本校验器 0ms 执行记录"
                  >
                    <ShieldCheck size={10} />
                    脚本校验
                  </span>
                )}
                {item.error && <span className="text-red-500">· 请求失败</span>}
              </div>
            </button>;
          })}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-slate-200 bg-gray-100 px-3 py-2 dark:border-white/10 dark:bg-[#151517]">
          {([
            ['prompt', Braces, '实际 Prompt'],
            ['output', Send, '模型输出'],
            ['tools', Wrench, '工具与组件'],
            ['stateNode', Cpu, '认知状态提取节点'],
            ['scriptValidator', ShieldCheck, '命令脚本校验器'],
            ['task', CheckCircle2, '任务快照'],
          ] as const).map(([key, Icon, label]) => <button key={key} onClick={() => setDetailTab(key)} className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs ${detailTab === key ? 'bg-slate-100 font-medium text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Icon size={13} />{label}</button>)}
          <div className="ml-auto flex items-center gap-2">
            {turn && (
              <button
                type="button"
                onClick={handleCopyCurrentTurn}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700 cursor-pointer"
                title={`一键复制第 ${turn.turn} 轮完整输入、输出与工具记录`}
              >
                {copiedTurn ? <Check size={12} className="text-emerald-500" /> : <FileText size={12} className="text-violet-500" />}
                <span>{copiedTurn ? `已复制第 ${turn.turn} 轮` : `复制第 ${turn.turn} 轮全貌`}</span>
              </button>
            )}
            <span className="text-[10px] text-slate-400">{turn ? `${clock(turn.startedAt)} · ${duration(turn)}` : ''}</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          {!turn && <div className="grid h-full place-items-center text-sm text-slate-400">等待第一轮模型请求。</div>}
          {turn && detailTab === 'prompt' && <div className="flex min-h-0 flex-1 flex-col space-y-3">
            {turn.transport?.request.context && (
              <details className="rounded-xl border border-slate-200 bg-gray-100 p-3 dark:border-white/10 dark:bg-white/[.03] shrink-0">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    本轮实际注入的思考层级与工具列表
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">点击展开/收起</span>
                </summary>
                <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                  <JsonBlock title="" value={turn.transport.request.context} />
                </div>
              </details>
            )}
            {turn.transport ? (
              <JsonBlock 
                className="flex min-h-0 flex-1 flex-col"
                title={`模型：${turn.transport.request.model}`} 
                value={turn.transport.request.messages?.[0]?.content || turn.transport.request} 
              />
            ) : <PendingBlock />}
          </div>}
          {turn && detailTab === 'output' && <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <JsonBlock className="flex min-h-[220px] flex-1 flex-col" title="模型原始返回" value={turn.transport?.response?.content || null} />
            {turn.error && <TraceNotice icon={<CircleAlert size={15} />} title="轮次请求失败" text={turn.error} danger />}
          </div>}
          {turn && detailTab === 'tools' && <div className="space-y-3">
            <TraceNotice icon={<MousePointer2 size={15} />} title="组件与鼠标动作的来源" text="工具输入的 targetId 来自本轮之前的 page.inspect；ui.actAndObserve 的输出会包含动作后的 page.inspect。展开记录可查看完整 JSON、可见组件坐标与页面状态。" />
            {turnEvents.length ? turnEvents.map(event => <ToolEventCard key={event.id} event={event} />) : <PendingBlock text="本轮尚未产生 Runtime 工具事件。" />}
          </div>}
          {turn && detailTab === 'stateNode' && <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <TraceNotice
              icon={<Cpu size={15} />}
              title="认知状态提取节点（/api/agent/update-state-node）"
              text="在每轮主循环结束后自动触发运行，解析主 Agent 输出并提取更新认知状态 JSON（标题、目标、小目标、进度、笔记与计划）。"
            />
            {turn.stateNodeTrace?.prompt ? (
              <JsonBlock className="flex min-h-[200px] flex-1 flex-col" title="状态节点输入 Prompt" value={turn.stateNodeTrace.prompt} />
            ) : null}
            {turn.stateNodeTrace?.response ? (
              <JsonBlock className="flex min-h-[200px] flex-1 flex-col" title="状态节点解析更新结果" value={turn.stateNodeTrace.response} />
            ) : (
              <PendingBlock text="本轮尚未产生状态节点更新数据。" />
            )}
          </div>}
          {turn && detailTab === 'scriptValidator' && <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <TraceNotice
              icon={<ShieldCheck size={15} />}
              title="命令脚本确定性校验器（纯 TypeScript 代码 · 0ms 延迟）"
              text="【无次级模型节点】主模型（Main LLM）生成响应时按协议会在文本中包含【状态检查】与【思考】段落。脚本校验器直接读取主模型返回的这段原始文本（rawInput），在 0ms 内使用纯 TypeScript 语法正则提取 {{调用 ...}} 命令，校验参数及权限后直接执行。"
            />
            {(turn.parsedResult?.scriptValidatorTrace || turn.parsedResult?.jsonAdapterTrace) ? (
              <JsonBlock className="flex min-h-0 flex-1 flex-col" title="命令脚本校验模式与数据追踪" value={turn.parsedResult?.scriptValidatorTrace || turn.parsedResult?.jsonAdapterTrace} />
            ) : (
              <PendingBlock text="本轮主模型未输出指令或尚未产生脚本校验追踪记录。" />
            )}
          </div>}
          {turn && detailTab === 'task' && <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <JsonBlock className="flex min-h-[200px] flex-1 flex-col" title="本轮调用前的任务快照（实际注入 task / history 的来源）" value={turn.taskBefore} />
            <JsonBlock className="flex min-h-[200px] flex-1 flex-col" title="任务最新状态" value={trace.task} />
          </div>}
        </div>
      </main>
    </section>
  );
}

function TraceNotice({ icon, title, text, danger = false }: { icon: React.ReactNode; title: string; text: string; danger?: boolean }) {
  return <div className={`flex gap-2 rounded-xl border p-3 text-xs leading-5 shrink-0 ${danger ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500 dark:text-red-300' : 'border-violet-100 bg-violet-50 text-slate-600 dark:border-violet-500/20 dark:bg-violet-500 dark:text-slate-300'}`}><span className="mt-0.5 shrink-0 text-violet-500">{icon}</span><div><p className="font-semibold">{title}</p><p className="mt-0.5 opacity-80">{text}</p></div></div>;
}

function JsonBlock({ title, value, className }: { title: string; value: unknown; className?: string }) {
  const [copied, setCopied] = useState(false);
  const isString = typeof value === 'string';
  // If it's an object, JSON.stringify escapes \n to \\n. We unescape it here for UI readability.
  let displayValue = isString ? value : json(value);
  displayValue = displayValue.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section className={`min-w-0 max-w-full ${className || ''}`}>
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
          <h3 className="truncate text-xs font-semibold">{title}</h3>
        </div>
        <button 
          onClick={handleCopy}
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700 cursor-pointer"
          title="复制全部文本"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          <span>{copied ? '已复制' : '复制文本'}</span>
        </button>
      </div>
      <pre className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-all [word-break:break-all] [overflow-wrap:anywhere] select-text rounded-xl border border-slate-200 bg-gray-100 p-4 font-mono text-[11px] leading-6 text-slate-700 dark:border-white/10 dark:bg-black dark:text-slate-300">
        {displayValue}
      </pre>
    </section>
  );
}

function PendingBlock({ text = '本轮仍在请求模型或尚未返回可展示的调试数据。' }: { text?: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400 dark:border-white/15">{text}</div>;
}

function ToolEventCard({ event }: { event: RuntimeEvent; key?: React.Key }) {
  return <details className="rounded-xl border border-slate-200 bg-gray-100 p-3 dark:border-white/10 dark:bg-white/[.03] select-text">
    <summary className="flex cursor-pointer list-none items-center gap-2"><span className="shrink-0">{eventIcon(event)}</span><span className="min-w-0 flex-1 truncate text-xs font-medium">{event.text}</span><span className="text-[10px] text-slate-400">{event.status || event.type}</span></summary>
    <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
      <p className="text-[11px] text-slate-500">{new Date(event.createdAt).toLocaleTimeString('zh-CN', { hour12: false })} · {event.toolName || event.type}</p>
      <div className="whitespace-pre-wrap select-text break-all text-[11px] leading-5 text-slate-700 dark:text-slate-300">
        {event.text}
      </div>
      {event.input !== undefined && <JsonBlock title="工具输入" value={event.input} />}
      {event.output !== undefined && <JsonBlock title="工具输出" value={event.output} />}
      {event.error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-500 dark:text-red-300">{event.error}</p>}
    </div>
  </details>;
}
