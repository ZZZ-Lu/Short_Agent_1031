import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, MotionValue } from 'motion/react';
import {
  Check,
  Copy,
  Edit3,
  FileText,
  Maximize2,
  PlusSquare,
  Trash2,
} from 'lucide-react';
import { CardData, getCardSize } from './GenerationCard';
import { MarkdownContent } from './MarkdownContent';
import { cardCornerStyle } from '../utils/cardLodAppearance';
import { mountedDomCardIds } from '../utils/promptSurfaceCache';
import { cardEntryFrame } from '../utils/cardEntrance';
import { shouldTextCardCaptureWheel } from '../utils/textCard';
import { shouldSyncOutlineWidth } from '../utils/viewportCulling';

export interface TextCardProps {
  data: CardData;
  scale: MotionValue<number>;
  tx?: MotionValue<number>;
  ty?: MotionValue<number>;
  isSelected: boolean;
  isSingleSelected?: boolean;
  isAgentTarget?: boolean;
  agentFocusRole?: string | null;
  allCards?: CardData[];
  onSelect?: (e: React.PointerEvent, id: string, selectOnlyOnPointerUp?: boolean) => void;
  onDragEnd?: (id: string, dx: number, dy: number) => void;
  onDelete?: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CardData>, isSignificant?: boolean) => void;
  onForkTextCard?: (sourceCardId: string) => void;
  onOpenPreview?: (cardId: string) => void;
  onHover?: (id: string | null) => void;
}

export const TextCard: React.FC<TextCardProps> = React.memo(function TextCard({
  data,
  scale,
  isSelected,
  isSingleSelected,
  isAgentTarget,
  agentFocusRole,
  allCards,
  onSelect,
  onDragEnd,
  onDelete,
  onUpdate,
  onForkTextCard,
  onOpenPreview,
  onHover,
}) {
  const { id, x, y } = data;
  const dim = getCardSize(data);
  const w = dim.width;
  const h = dim.height;

  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(data.textTitle || '');
  const [draftContent, setDraftContent] = useState(data.textContent || '');
  const [copied, setCopied] = useState(false);
  const [entryFrame, setEntryFrame] = useState(() => cardEntryFrame(id));

  const cardRef = useRef<HTMLDivElement>(null);
  const cardBodyRef = useRef<HTMLDivElement>(null);
  const dualSelectionBorderRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const totalDxRef = useRef(0);
  const totalDyRef = useRef(0);
  const posRef = useRef({ x, y });
  const slaveNodesRef = useRef<Array<{ el: HTMLElement; initialX: number; initialY: number }>>([]);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // @LOCK-START:text-card-outline-sync
  const needsSelectionOutline = Boolean(isSelected || isAgentTarget);
  useEffect(() => {
    if (!needsSelectionOutline) {
      if (cardBodyRef.current) cardBodyRef.current.style.outlineWidth = '0px';
      return;
    }
    let rafId: number | null = null;
    let lastOutlinePx: number | null = null;
    let lastDualPaddingPx: number | null = null;

    const applyOutlineWidth = (force: boolean) => {
      const safeScale = Math.max(scale.get() || 1, 0.001);
      if (cardBodyRef.current) {
        const nextOutlinePx = isAgentTarget && isSelected ? 0 : 2 / safeScale;
        if (force || shouldSyncOutlineWidth(lastOutlinePx, nextOutlinePx)) {
          lastOutlinePx = nextOutlinePx;
          cardBodyRef.current.style.outlineWidth = `${nextOutlinePx}px`;
        }
      }
      if (dualSelectionBorderRef.current && isAgentTarget && isSelected) {
        const nextPaddingPx = 2 / safeScale;
        if (force || shouldSyncOutlineWidth(lastDualPaddingPx, nextPaddingPx)) {
          lastDualPaddingPx = nextPaddingPx;
          dualSelectionBorderRef.current.style.padding = `${nextPaddingPx}px`;
        }
      }
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyOutlineWidth(false);
      });
    };
    const handleRestored = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      applyOutlineWidth(true);
    };

    applyOutlineWidth(true);
    const unsubScale = scale.on('change', scheduleSync);
    window.addEventListener('canvas-styles-restored', handleRestored);
    return () => {
      unsubScale();
      window.removeEventListener('canvas-styles-restored', handleRestored);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [scale, needsSelectionOutline, isAgentTarget, isSelected]);
  // @LOCK-END:text-card-outline-sync

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(data.textTitle || '');
      setDraftContent(data.textContent || '');
    }
  }, [data.textTitle, data.textContent, isEditing]);

  useEffect(() => {
    if (!isDraggingRef.current) {
      posRef.current = { x, y };
      if (cardRef.current) {
        cardRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  }, [x, y]);

  useEffect(() => {
    if (!entryFrame || entryFrame.held) return;
    const durationMs = (entryFrame.duration || 0.82) * 1000 + (entryFrame.delay || 0) * 1000;
    const timer = setTimeout(() => setEntryFrame(null), Math.max(50, durationMs + 20));
    return () => clearTimeout(timer);
  }, [entryFrame]);

  useLayoutEffect(() => {
    mountedDomCardIds.add(id);
    if (typeof window !== 'undefined') {
      if (!(window as any).__paintedCardIds) (window as any).__paintedCardIds = new Set<string>();
      (window as any).__paintedCardIds.add(id);
      window.dispatchEvent(new CustomEvent('card-painted', { detail: { cardId: id } }));
    }
    return () => {
      mountedDomCardIds.delete(id);
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const commitEdits = useCallback(() => {
    const nextTitle = draftTitle.trim() || '未命名文本';
    const nextContent = draftContent;
    if (nextTitle !== (data.textTitle || '') || nextContent !== (data.textContent || '')) {
      onUpdate(id, {
        textTitle: nextTitle,
        textContent: nextContent,
      });
    }
    setIsEditing(false);
  }, [draftTitle, draftContent, data.textTitle, data.textContent, id, onUpdate]);

  const enterEditMode = useCallback(() => {
    setDraftTitle(data.textTitle || '');
    setDraftContent(data.textContent || '');
    setIsEditing(true);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [data.textTitle, data.textContent]);

  const handleCopy = useCallback(async () => {
    const text = data.textContent || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be restricted in headless/iframe contexts
    }
  }, [data.textContent]);

  const handleContainerPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button === 1) {
        e.preventDefault();
        return;
      }
      if (e.button === 0 && e.isTrusted) {
        onSelect?.(e, id);
      }
    },
    [id, onSelect]
  );

  const handleDragPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (isEditing) return;
      e.stopPropagation();

      isDraggingRef.current = true;
      (window as any).isDraggingCard = true;
      (window as any).draggingCardId = id;
      window.dispatchEvent(new CustomEvent('abort-mount-queue'));
      window.dispatchEvent(new CustomEvent('card-painted', { detail: { cardId: id } }));

      lastPosRef.current = { x: e.clientX, y: e.clientY };
      totalDxRef.current = 0;
      totalDyRef.current = 0;
      let didApplyDegrade = false;

      if (isSelected) {
        const slaves: Array<{ el: HTMLElement; initialX: number; initialY: number }> = [];
        const nodes = document.querySelectorAll('[data-card-id][data-selected="true"]');
        nodes.forEach(node => {
          if (node !== cardRef.current) {
            const el = node as HTMLElement;
            const match = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
            if (match) {
              slaves.push({ el, initialX: parseFloat(match[1]), initialY: parseFloat(match[2]) });
            } else {
              const slaveId = el.getAttribute('data-card-id');
              const cardObj = allCards?.find(c => c.id === slaveId);
              if (cardObj) slaves.push({ el, initialX: cardObj.x, initialY: cardObj.y });
            }
          }
        });
        slaveNodesRef.current = slaves;
      } else {
        slaveNodesRef.current = [];
      }

      let prevEffectiveDx = 0;
      let prevEffectiveDy = 0;

      const handleWindowMove = (moveEvent: PointerEvent) => {
        if (!isDraggingRef.current) return;
        const currentScale = scale.get() || 1;
        const dx = (moveEvent.clientX - lastPosRef.current.x) / currentScale;
        const dy = (moveEvent.clientY - lastPosRef.current.y) / currentScale;
        lastPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        totalDxRef.current += dx;
        totalDyRef.current += dy;

        const rawX = x + totalDxRef.current;
        const rawY = y + totalDyRef.current;
        const GRID_STEP = 48;
        const targetX = moveEvent.altKey ? rawX : Math.round(rawX / GRID_STEP) * GRID_STEP;
        const targetY = moveEvent.altKey ? rawY : Math.round(rawY / GRID_STEP) * GRID_STEP;

        posRef.current = { x: targetX, y: targetY };
        const effectiveDx = targetX - x;
        const effectiveDy = targetY - y;

        if (!didApplyDegrade && Math.hypot(totalDxRef.current, totalDyRef.current) > 1.5) {
          didApplyDegrade = true;
          window.getSelection()?.removeAllRanges();
          const workspace = document.getElementById('canvas-workspace');
          if (workspace) {
            workspace.setAttribute('data-gesture', 'true');
            window.dispatchEvent(new CustomEvent('canvas-gesture-start'));
          }
        }

        if (effectiveDx === prevEffectiveDx && effectiveDy === prevEffectiveDy) {
          return;
        }
        prevEffectiveDx = effectiveDx;
        prevEffectiveDy = effectiveDy;

        // Publish transient drag delta for zero-React-render lineage line & overlay sync
        (window as any).__dragDelta = {
          dx: effectiveDx,
          dy: effectiveDy,
          draggingCardId: id,
        };

        if (cardRef.current) {
          cardRef.current.style.transform = `translate(${targetX}px, ${targetY}px)`;
        }
        slaveNodesRef.current.forEach(slave => {
          slave.el.style.transform = `translate(${slave.initialX + effectiveDx}px, ${slave.initialY + effectiveDy}px)`;
        });
        window.dispatchEvent(new CustomEvent('card-drag-move'));
      };

      const handleWindowUp = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        (window as any).__dragDelta = null;
        (window as any).isDraggingCard = false;
        (window as any).draggingCardId = null;
        window.removeEventListener('pointermove', handleWindowMove);
        window.removeEventListener('pointerup', handleWindowUp);
        window.removeEventListener('pointercancel', handleWindowUp);

        const finalDx = posRef.current.x - x;
        const finalDy = posRef.current.y - y;
        if (Math.abs(finalDx) > 0.5 || Math.abs(finalDy) > 0.5) {
          if (typeof (window as any).resetGlobalZoomTimer === 'function') {
            (window as any).resetGlobalZoomTimer();
          }
          onDragEnd?.(id, finalDx, finalDy);
        }
        window.dispatchEvent(new CustomEvent('card-drag-move'));
        slaveNodesRef.current = [];
      };

      window.addEventListener('pointermove', handleWindowMove);
      window.addEventListener('pointerup', handleWindowUp);
      window.addEventListener('pointercancel', handleWindowUp);
    },
    [allCards, id, isEditing, isSelected, onDragEnd, scale, x, y]
  );

  const handleBodyWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      // Only scroll text when the card is selected (or editing); when unselected & hovered, let wheel bubble to zoom canvas
      if (
        !shouldTextCardCaptureWheel({
          isSelected,
          isEditing,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
        })
      ) {
        return;
      }
      e.stopPropagation();
    },
    [isEditing, isSelected]
  );

  const currentScale = scale.get() || 1;
  const titleText = (data.textTitle || '').trim() || '未命名文本';
  const contentText = data.textContent || '';
  const hasContent = contentText.trim().length > 0;

  // Selection & Agent Focus outline/glow parity with GenerationCard
  const bodyOutlineClass = isAgentTarget && isSelected
    ? 'outline-none shadow-[0_0_20px_rgba(59,130,246,0.35),0_0_25px_rgba(168,85,247,0.45)]'
    : agentFocusRole === 'working'
      ? 'outline outline-[#a45cf8] shadow-[0_0_28px_rgba(168,85,247,0.55)] animate-pulse'
      : agentFocusRole === 'reference'
        ? 'outline outline-dashed outline-[#a45cf8] shadow-[0_0_15px_rgba(168,85,247,0.3)]'
        : isAgentTarget
          ? 'outline outline-[#a45cf8] shadow-[0_0_25px_rgba(168,85,247,0.45),0_20px_40px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_0_30px_rgba(168,85,247,0.55),0_24px_48px_-8px_rgba(0,0,0,0.65)]'
          : isSelected
            ? 'outline outline-[#3b82f6]'
            : 'outline-none';

  return (
    <div
      ref={cardRef}
      data-card-id={id}
      data-card-kind="text"
      data-agent-target={`canvas.card.${id}`}
      data-agent-actions="mouse.move mouse.click mouse.doubleClick mouse.hover mouse.drag"
      data-selected={isSelected ? 'true' : 'false'}
      data-agent-focus={agentFocusRole || undefined}
      className={`absolute top-0 left-0 pointer-events-none ${
        isSelected ? 'z-30' : isAgentTarget ? 'z-20' : isHovered ? 'z-10' : 'z-0'
      }`}
      style={{ transformOrigin: 'top left', transform: `translate(${x}px, ${y}px)` }}
      onPointerDownCapture={handleContainerPointerDown}
    >
      <motion.div
        initial={entryFrame ? { scale: entryFrame.scale, opacity: entryFrame.opacity } : false}
        animate={
          entryFrame?.held
            ? { scale: entryFrame.scale, opacity: entryFrame.opacity, y: 0 }
            : entryFrame
              ? { scale: entryFrame.scales, opacity: entryFrame.opacities, y: 0 }
              : { scale: 1, opacity: 1, y: 0 }
        }
        transition={{ duration: entryFrame?.duration || 0, delay: entryFrame?.delay || 0, ease: 'linear' }}
        onAnimationComplete={() => {
          if (entryFrame && !entryFrame.held && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('card-entrance-complete', { detail: { cardId: id } }));
            setEntryFrame(null);
          }
        }}
        transformTemplate={(_, generated) => generated.replace(/translateZ\([^)]+\)/g, '')}
        className="flex flex-col group items-start relative text-card"
        style={{
          transformOrigin: entryFrame ? `${entryFrame.pivotX - x}px ${entryFrame.pivotY - y}px` : '50% 50%',
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          onHover?.(id);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover?.(null);
        }}
      >
        {/* Top Floating Action Bar (Single-selected, matches image/video cards) */}
        {isSingleSelected && (
          <div
            className="absolute -top-14 left-0 z-40 pointer-events-auto flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg select-none"
            onPointerDown={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => (isEditing ? commitEdits() : enterEditMode())}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              aria-label={isEditing ? '完成编辑' : '编辑文本'}
            >
              {isEditing ? <Check size={13} /> : <Edit3 size={13} />}
              <span>{isEditing ? '完成' : '编辑'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPreview?.(id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              aria-label="放大阅读"
            >
              <Maximize2 size={13} />
              <span>放大阅读</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!hasContent}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="复制文本"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>

            <button
              type="button"
              onClick={() => onForkTextCard?.(id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              aria-label="创建副本"
              title="在右侧创建副本"
            >
              <PlusSquare size={13} />
              <span>副本</span>
            </button>

            <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

            <button
              type="button"
              onClick={() => onDelete?.(id)}
              className="flex items-center justify-center p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
              aria-label="删除文本卡片"
              title="删除卡片"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        <div
          className="card-selection-scaler w-full flex flex-col items-start relative transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isSelected && !isEditing ? 'scale(1.03)' : 'scale(1)',
            transformOrigin: `${w / 2}px 120px`,
          }}
        >
          {/* Ambient & Selected Static Shadow Layers (zero filter on card subtree) */}
          <div
            aria-hidden
            className="card-shadow-layer pointer-events-none absolute left-0 top-0 squircle bg-white dark:bg-neutral-900"
            style={{
              width: w,
              height: h,
              ...cardCornerStyle,
              filter:
                currentScale > 2.5
                  ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  : 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.08)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.04))',
              opacity: isSelected ? 0 : 1,
            }}
          />
          <div
            aria-hidden
            className="card-shadow-layer pointer-events-none absolute left-0 top-0 squircle bg-white dark:bg-neutral-900"
            style={{
              width: w,
              height: h,
              ...cardCornerStyle,
              filter: 'drop-shadow(0 16px 28px rgba(0, 0, 0, 0.18)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))',
              opacity: isSelected ? 1 : 0,
            }}
          />

          {/* Fixed-Dimension Text Card Body (420x560, identical to Image Card) */}
          <div
            ref={cardBodyRef}
            className={`pointer-events-auto relative flex flex-col overflow-hidden squircle bg-white dark:bg-[#1d1e22] transition-colors [&.drag-degraded]:!shadow-none [&.drag-degraded]:!backdrop-filter-none ${bodyOutlineClass}`}
            style={{
              width: w,
              height: h,
              ...cardCornerStyle,
              outlineWidth: isAgentTarget && isSelected
                ? '0px'
                : (isAgentTarget || isSelected)
                  ? `${2 / Math.max(scale.get() || 1, 0.001)}px`
                  : '0px',
            }}
          >
            {/* Header Bar (Top Bar: h-12 = 48px, Drag Handle + Title + Category Tag) */}
            <div
              data-testid="text-card-header-bar"
              onPointerDown={handleDragPointerDown}
              className="flex items-center justify-between gap-2 px-4 h-12 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 shrink-0 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText size={13} strokeWidth={2.2} />
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={e => setDraftTitle(e.target.value)}
                    onPointerDown={e => e.stopPropagation()}
                    onKeyDown={e => {
                      e.stopPropagation();
                      if (e.key === 'Enter') textareaRef.current?.focus();
                      if (e.key === 'Escape') commitEdits();
                    }}
                    placeholder="输入标题..."
                    aria-label="文本卡片标题"
                    className="w-full bg-white dark:bg-neutral-800 border border-blue-300 dark:border-blue-700 rounded-md px-2 py-0.5 text-[13.5px] font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    className="text-[13.5px] font-semibold text-neutral-900 dark:text-neutral-100 truncate"
                    title={titleText}
                  >
                    {titleText}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10.5px] font-medium px-1.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  文本
                </span>
              </div>
            </div>

            {/* Scrollable Body (Markdown Preview or Editor) */}
            {isEditing ? (
              <div
                data-prevent-canvas-wheel="true"
                className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#1d1e22]"
                onPointerDown={e => e.stopPropagation()}
                onWheel={e => {
                  if (!e.ctrlKey && !e.metaKey) e.stopPropagation();
                }}
              >
                <div className="flex-1 flex flex-col min-h-0 px-4 py-3.5">
                  <textarea
                    ref={textareaRef}
                    value={draftContent}
                    onChange={e => setDraftContent(e.target.value)}
                    onKeyDown={e => {
                      e.stopPropagation();
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        commitEdits();
                      } else if (e.key === 'Escape') {
                        commitEdits();
                      }
                    }}
                    placeholder="在此输入或粘贴 Markdown 文本（支持标题、列表、加粗与表格）..."
                    aria-label="文本卡片正文"
                    className="flex-1 w-full resize-none bg-transparent text-[13px] leading-[1.65] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none font-sans [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  />
                </div>
                <div
                  data-testid="text-card-footer-bar"
                  className="flex items-center justify-between px-4 h-12 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 text-[11.5px] text-neutral-400 dark:text-neutral-500 shrink-0 select-none"
                >
                  <span>支持 Markdown 排版 · Ctrl+Enter 完成</span>
                  <button
                    type="button"
                    onClick={commitEdits}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors"
                  >
                    完成
                  </button>
                </div>
              </div>
            ) : (
              <div
                ref={scrollAreaRef}
                data-testid="text-card-scroll-body"
                onPointerDown={handleDragPointerDown}
                onWheel={handleBodyWheel}
                className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-3.5 cursor-grab active:cursor-grabbing select-none"
              >
                {/* Guiding Edit Button at top-left start of content (no click/double-click on body to edit) */}
                <div className="flex items-center justify-start mb-2.5">
                  <button
                    type="button"
                    data-testid="text-card-inline-edit-btn"
                    aria-label={hasContent ? '编辑此文本卡片' : '点击输入文本'}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      enterEditMode();
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border transition-colors cursor-pointer select-none ${
                      hasContent
                        ? 'px-2.5 py-1 text-[12px] font-medium text-blue-600 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/80 dark:border-blue-800/70 hover:bg-blue-100 dark:hover:bg-blue-900/70'
                        : 'px-3 py-1.5 text-[12.5px] font-medium text-blue-600 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/80 shadow-xs'
                    }`}
                  >
                    <Edit3 size={13} strokeWidth={2} />
                    <span>{hasContent ? '编辑文本' : '点击输入文本...'}</span>
                  </button>
                </div>

                {hasContent ? (
                  <MarkdownContent content={contentText} compact />
                ) : (
                  <div className="pt-1 text-[12px] leading-relaxed text-neutral-400 dark:text-neutral-500 select-none pointer-events-none">
                    点击上方「点击输入文本...」按钮开始编写（支持标题、加粗、列表与 Markdown 表格）
                  </div>
                )}
              </div>
            )}

            {/* Bottom Meta Bar (h-12 = 48px, identical height to Top Header Bar) */}
            {!isEditing && (
              <div
                data-testid="text-card-footer-bar"
                onPointerDown={handleDragPointerDown}
                className="flex items-center justify-between px-4 h-12 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 text-[11.5px] text-neutral-400 dark:text-neutral-500 shrink-0 select-none cursor-grab active:cursor-grabbing"
              >
                <span>{hasContent ? `${contentText.length} 字` : '空白文本卡片'}</span>
                <button
                  type="button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation();
                    onOpenPreview?.(id);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  展开阅读
                </button>
              </div>
            )}
            {/* Card Edge Ring Overlay (1px border when idle; hidden when selected/agent-focused so outline & dual border stay crisp) */}
            <div
              className={`card-edge-ring-overlay absolute inset-0 pointer-events-none z-[25] squircle transition-colors duration-180 ease-out ${
                isAgentTarget || isSelected
                  ? 'border-0'
                  : 'border border-neutral-200/95 dark:border-neutral-700/85 group-hover:border-neutral-300 dark:group-hover:border-neutral-600'
              }`}
              style={cardCornerStyle}
            />

            {/* Dual Co-Presence Border Overlay (Half User Blue #3b82f6 + Half Agent Purple #a45cf8) */}
            {isAgentTarget && isSelected && (
              <div
                ref={dualSelectionBorderRef}
                className="dual-selection-border absolute inset-0 pointer-events-none rounded-[20px] corner-squircle z-[90] select-none transition-opacity duration-150"
                style={{
                  ...cardCornerStyle,
                  padding: `${2 / Math.max(scale.get() || 1, 0.001)}px`,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #3b82f6 44%, #a45cf8 56%, #a45cf8 100%)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
});
