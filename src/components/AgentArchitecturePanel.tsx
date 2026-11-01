import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Versioned design content; no runtime implementation or browser persistence.
const sections = [
  ["执行原则", "Agent 默认通过后台工具读取当前项目、执行操作和生成。用户要求演示、需要核对页面或后台能力缺失时，使用页面观察与 UI 操作。"],
  ["数据与工具", "后台工具按需访问当前项目数据，长内容分页；写入和生成复用业务校验、保存和撤销能力。已注册工具必须真实可执行。"],
  ["页面操作", "page.inspect 只返回当前可见页面事实；ui.actAndObserve 对已观察目标执行操作并返回真实结果。后台工具可读取当前项目未显示的数据。"],
  ["当前能力", "剧本目录、正文分页、全文搜索及角色、场景、道具列表已作为后台工具注册。页面观察和鼠标操作继续保留；首轮自动观察默认关闭。剧本和资产写入工具需接入业务能力后注册。"],
];

export const AgentArchitecturePanel = () => {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopySection = () => {
    const title = sections[active][0];
    const content = sections[active][1];
    navigator.clipboard.writeText(`# ${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#fbfbfc] select-text dark:bg-[#121214]">
      <header className="shrink-0 border-b border-slate-200 px-6 py-5 dark:border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold select-text">
            Mira 技术架构 V1 <span className="ml-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-normal text-amber-800">讨论稿 · Runtime 实施中</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500 select-text">单 Agent · 流式指令 · 工具执行 · 观察回流。按章节编号逐条讨论、修订。</p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav aria-label="架构方案章节" className="flex shrink-0 gap-1 overflow-auto border-b border-slate-200 p-3 md:w-64 md:flex-col md:border-b-0 md:border-r dark:border-white/10">
          {sections.map(([title], i) => (
            <button
              key={title}
              onClick={() => { setActive(i); setCopied(false); }}
              aria-current={active === i ? 'page' : undefined}
              className={`shrink-0 rounded-lg px-3 py-3 text-left text-sm transition ${
                active === i
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-500 dark:text-violet-200 font-medium'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <span className="mr-2 font-mono text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
              {title}
            </button>
          ))}
        </nav>
        <article key={active} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-6 md:p-10 select-text">
          <div className="mx-auto max-w-4xl pb-16">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-xs tracking-widest text-violet-500">
                讨论条目 {String(active + 1).padStart(2, '0')} / {sections.length}
              </p>
              <button
                type="button"
                onClick={handleCopySection}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-200 dark:hover:bg-neutral-700 transition cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? '已复制本节文本' : '复制本节内容'}</span>
              </button>
            </div>
            <h3 className="mb-6 text-2xl font-semibold select-text">{sections[active][0]}</h3>
            <div className="space-y-4">
              {sections[active][1].split('\n').map((text, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200/60 bg-white p-4 text-sm leading-7 text-slate-700 shadow-2xs whitespace-pre-wrap break-words [overflow-wrap:anywhere] select-text dark:border-white/5 dark:bg-[#18181b] dark:text-slate-200"
                >
                  {text}
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between border-t border-slate-200 pt-4 dark:border-white/10">
              <button
                disabled={active === 0}
                onClick={() => { setActive(active - 1); setCopied(false); }}
                className="text-sm font-medium text-violet-600 dark:text-violet-400 disabled:opacity-30 hover:underline cursor-pointer"
              >
                ← 上一节
              </button>
              <button
                disabled={active === sections.length - 1}
                onClick={() => { setActive(active + 1); setCopied(false); }}
                className="text-sm font-medium text-violet-600 dark:text-violet-400 disabled:opacity-30 hover:underline cursor-pointer"
              >
                下一节 →
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
