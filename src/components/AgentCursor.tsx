import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion, MotionValue, useTransform, useMotionValue, animate, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { CardData } from './GenerationCard';
import { AgentCoordinateSpace } from '../agent/agentCursorPosition';
import {
  QIQI_TRI,
  QIQI_PIVOT,
  QIQI_VIEWBOX,
  QIQI_STATES,
  QiqiStateSpec,
  buildQiqiInnerMarkup,
  mkQiqiSvg,
} from './qiqiCursorSvg';
export { QIQI_STATES, mkQiqiSvg };
export type { QiqiStateSpec };

export function buildDynamicSelectionPrompt(cards: CardData[]): string {
  if (!cards || cards.length === 0) {
    return "我能帮什么忙？";
  }

  if (cards.length === 1) {
    const card = cards[0];
    const rawName = (card.name || card.fileName || card.prompt || '')
      .replace(/\.(png|jpg|jpeg|webp|gif|mp4|mov|webm)$/i, '')
      .trim();
    const cleanName = rawName.replace(/[\r\n]+/g, ' ').trim();

    if (cleanName && cleanName.length <= 12) {
      return `选了【${cleanName}】，需要我做什么？`;
    }

    if (card.isVideo) {
      return "选了 1 个视频，需要我做什么？";
    }
    if (card.imageUrl || card.fileData || card.isAsset || card.thumbnailUrl) {
      return "选了 1 张图片，需要我做什么？";
    }
    return "选了 1 个卡片，需要我做什么？";
  }

  let videoCount = 0;
  let imageCount = 0;
  let otherCount = 0;

  for (const c of cards) {
    if (c.isVideo) {
      videoCount++;
    } else if (c.imageUrl || c.fileData || c.isAsset || c.thumbnailUrl) {
      imageCount++;
    } else {
      otherCount++;
    }
  }

  const total = cards.length;

  if (imageCount === total) {
    return `选了 ${total} 张图片，需要我做什么？`;
  }
  if (videoCount === total) {
    return `选了 ${total} 个视频，需要我做什么？`;
  }
  if (otherCount === total) {
    return `选了 ${total} 个卡片，需要我做什么？`;
  }

  if (imageCount > 0 && videoCount > 0 && otherCount === 0) {
    return `选了 ${imageCount} 张图片和 ${videoCount} 个视频，需要我做什么？`;
  }

  return `选了 ${total} 个卡片，需要我做什么？`;
}

export interface HudContextMessage {
  text: string;
  speaker: 'user' | 'agent';
}

export interface QuickInputConfig {
  isOpen: boolean;
  targetId: string | null;
  placeholder?: string;
  contextHistory?: HudContextMessage | null;
  lastReply?: string;
  onSubmit: (text: string) => void;
  onClose: () => void;
  focusTrigger?: number;
  value: string;
  onChange: (text: string) => void;
  onAskResolve?: ((answer: string) => void) | null;
}

interface AgentCursorProps {
  agentState: {
    x: number;
    y: number;
    coordinateSpace?: AgentCoordinateSpace;
    visible: boolean;
    isActive: boolean;
    isMoving: boolean;
    speak?: string;
    lastPrompt?: string;
    lastPromptTargetId?: string | null;
    cursorMode?: 'default' | 'inspect' | 'working' | 'interact';
    isSleeping?: boolean;
    isAsking?: boolean;
  };
  transform: {
    tx: MotionValue<number>;
    ty: MotionValue<number>;
    tScale: MotionValue<number>;
  };
  isIdle?: boolean;
  isZooming?: boolean;
  isAgentRunning?: boolean;
  isAgentThinking?: boolean;
  isAgentAsking?: boolean;
  badgeNumber?: number;
  selectedCards?: CardData[];
  quickInput?: QuickInputConfig | null;
  onClickPointer?: () => void;
  onDragAgent?: (newX: number, newY: number, coordinateSpace: AgentCoordinateSpace) => void;
  onDragAgentEnd?: (finalCanvasX: number, finalCanvasY: number, screenX: number, screenY: number) => void;
  onDismissSpeak?: () => void;
  isDarkMode?: boolean;
  onStartAgentBoxSelect?: (canvasX: number, canvasY: number) => void;
  onUpdateAgentBoxSelect?: (canvasX: number, canvasY: number) => void;
  onEndAgentBoxSelect?: () => void;
}

export function mountQiqiSvg(
  el: HTMLElement,
  st: string = 'idle',
  size: number = 88,
  vb?: string,
  noTilt?: boolean,
  isDarkMode: boolean = false
) {
  if (!el) return;
  el.innerHTML = mkQiqiSvg(st, size, vb, noTilt, undefined, isDarkMode);
  const sv = el.querySelector("svg") as SVGSVGElement | null;
  if (sv && typeof sv.setCurrentTime === 'function') {
    try {
      sv.setCurrentTime(0);
    } catch {}
  }
}

if (typeof window !== 'undefined') {
  (window as any).QIQI = {
    mk: mkQiqiSvg,
    mount: mountQiqiSvg,
    states: QIQI_STATES,
    tri: QIQI_TRI,
    pivot: QIQI_PIVOT,
  };
}

function QiqiCursorIcon({
  state,
  size = 57.6,
  isDarkMode = false,
}: {
  state: 'idle' | 'think' | 'sleep' | 'ask';
  size?: number;
  isDarkMode?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const svgInnerMarkup = useMemo(() => {
    return buildQiqiInnerMarkup(state, false, 'currentColor', isDarkMode);
  }, [state, isDarkMode]);

  useEffect(() => {
    const sv = containerRef.current?.querySelector('svg') as SVGSVGElement | null;
    if (sv && typeof sv.setCurrentTime === 'function') {
      try {
        sv.setCurrentTime(0);
      } catch {}
    }
  }, [state]);

  // Anchor pointer tip V1 (27.95, 20.00 in 92x92 viewBox) to (0, 0) of cursor coordinate
  const tipOffsetX = -(size * (27.95 / 92));
  const tipOffsetY = -(size * (20.0 / 92));
  const colorClass = 'text-[#a45cf8]';

  return (
    <div
      ref={containerRef}
      className={`relative z-10 transition-transform group-hover:scale-105 active:scale-95 pointer-events-none select-none ${colorClass}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: `${tipOffsetX}px`,
        marginTop: `${tipOffsetY}px`,
      }}
    >
      <svg
        key={state}
        width={size}
        height={size}
        viewBox={QIQI_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none select-none block"
        dangerouslySetInnerHTML={{ __html: svgInnerMarkup }}
      />
    </div>
  );
}

function isThinkingPhrase(text?: string): boolean {
  if (!text) return false;
  const clean = text.trim();
  if (!clean) return false;
  if (
    clean.includes('正在操作') || 
    clean.includes('正在标注') || 
    clean.includes('正在生成') || 
    clean.includes('排队渲染') ||
    clean.includes('正在查看') ||
    clean.includes('正在对照') ||
    clean.includes('正在质检')
  ) {
    return false;
  }
  return (
    clean === '...' ||
    clean === '…' ||
    clean === 'thinking' ||
    clean === 'loading' ||
    clean === '正在思考...' ||
    clean === '正在思考' ||
    clean === '图生好了，我先看下...' ||
    clean === '图生好了，我先看下' ||
    clean.includes('正在思考') ||
    clean.includes('正在拉取')
  );
}

function SingleLineMarquee({ 
  text, 
  isDarkMode, 
  isHistory = false,
  speaker = 'agent',
}: { 
  text: string; 
  isDarkMode?: boolean; 
  isHistory?: boolean; 
  speaker?: 'user' | 'agent';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  const cleanText = (text || '').trim();
  const isThinking = isThinkingPhrase(cleanText);

  useLayoutEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      if (textWidth > containerWidth) {
        setOverflow(Math.ceil(textWidth - containerWidth));
      } else {
        setOverflow(0);
      }
    }
  }, [text]);

  const textStyleClass = speaker === 'user'
    ? (isHistory
        ? (isDarkMode 
            ? "inline-block text-[12px] font-medium leading-none text-white/70 tracking-wide antialiased"
            : "inline-block text-[12px] font-medium leading-none text-slate-800/70 tracking-wide antialiased")
        : (isDarkMode 
            ? "inline-block text-[13px] font-semibold leading-none text-white tracking-wide antialiased"
            : "inline-block text-[13px] font-semibold leading-none text-slate-900 tracking-wide antialiased"))
    : (isHistory
        ? (isDarkMode 
            ? "inline-block text-[12px] font-medium leading-none text-[#a45cf8]/70 tracking-wide antialiased"
            : "inline-block text-[12px] font-medium leading-none text-purple-600/70 tracking-wide antialiased")
        : (isDarkMode 
            ? "inline-block text-[13px] font-semibold leading-none text-[#a45cf8] tracking-wide antialiased"
            : "inline-block text-[13px] font-semibold leading-none text-purple-600 tracking-wide antialiased"));

  const dotColorClass = speaker === 'user'
    ? (isHistory ? (isDarkMode ? 'bg-white/60' : 'bg-slate-800/60') : (isDarkMode ? 'bg-white' : 'bg-slate-900'))
    : (isHistory ? (isDarkMode ? 'bg-[#a45cf8]/60' : 'bg-purple-600/60') : (isDarkMode ? 'bg-[#a45cf8]' : 'bg-purple-600'));

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap max-w-[420px] min-w-[24px] flex items-center ${isThinking ? 'justify-center' : 'justify-start text-left'} gap-1.5`}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {isThinking ? (
        <span className="flex items-center gap-1.5 px-1 py-0.5 shrink-0 select-none">
          <span className={textStyleClass}>正在思考</span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <motion.span 
              className={`inline-block w-1.5 h-1.5 rounded-full ${dotColorClass}`}
              animate={{ y: [0, -3.5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            />
            <motion.span 
              className={`inline-block w-1.5 h-1.5 rounded-full ${dotColorClass}`}
              animate={{ y: [0, -3.5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            />
            <motion.span 
              className={`inline-block w-1.5 h-1.5 rounded-full ${dotColorClass}`}
              animate={{ y: [0, -3.5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
          </span>
        </span>
      ) : overflow > 0 ? (
        <motion.span
          ref={textRef}
          key={text}
          className={`${textStyleClass} shrink-0 will-change-transform`}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          animate={{ x: [0, 0, -overflow, -overflow, 0] }}
          transition={{
            duration: Math.max(5, (overflow / 30) + 2.5),
            repeat: Infinity,
            repeatDelay: 1.2,
            times: [0, 0.15, 0.55, 0.75, 1],
            ease: 'easeInOut',
          }}
        >
          {text}
        </motion.span>
      ) : (
        <span
          ref={textRef}
          key={text}
          className={`${textStyleClass} shrink-0`}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export function AgentCursor({ 
  agentState, 
  transform, 
  isIdle = true, 
  isZooming = false, 
  isAgentRunning,
  isAgentThinking,
  isAgentAsking,
  badgeNumber,
  selectedCards = [],
  quickInput, 
  onClickPointer, 
  onDragAgent, 
  onDragAgentEnd, 
  isDarkMode = false,
  onStartAgentBoxSelect,
  onUpdateAgentBoxSelect,
  onEndAgentBoxSelect
}: AgentCursorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAgentBoxSelecting, setIsAgentBoxSelecting] = useState(false);
  const isAgentBoxSelectingRef = useRef(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startPosX: number;
    startPosY: number;
    startCoordSpace: AgentCoordinateSpace;
    startCanvasX: number;
    startCanvasY: number;
    hasMoved: boolean;
  } | null>(null);

  const quickInputRef = useRef<HTMLInputElement>(null);

  // Submit stage machine:
  const [submitStep, setSubmitStep] = useState<'idle' | 'submitting'>('idle');
  const [submittedUserPrompt, setSubmittedUserPrompt] = useState<string | null>(null);

  const submitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const rawIsThinking = isThinkingPhrase(agentState.speak);
  const isActuallyThinking = isAgentThinking !== undefined
    ? isAgentThinking
    : ((isAgentRunning !== false) && rawIsThinking);

  const dynamicPromptText = useMemo(() => {
    return buildDynamicSelectionPrompt(selectedCards || []);
  }, [selectedCards]);

  // When regular quickInput opens or target card changes, settle state and clear any old transient submitted prompt.
  // When user.ask triggers quickInput (onAskResolve is present), preserve the user's prompt in Row 1!
  useEffect(() => {
    if (quickInput?.isOpen && !quickInput?.onAskResolve) {
      setSubmitStep('idle');
      setSubmittedUserPrompt(null);
    }
  }, [quickInput?.isOpen, quickInput?.targetId, quickInput?.onAskResolve]);

  useEffect(() => {
    if (!agentState.speak && !agentState.lastPrompt && !quickInput?.isOpen) {
      setSubmitStep('idle');
      setSubmittedUserPrompt(null);
    }
  }, [agentState.speak, agentState.lastPrompt, quickInput?.isOpen]);

  useEffect(() => {
    if (!isAgentRunning && !isActuallyThinking && !quickInput?.isOpen && submitStep === 'idle') {
      if (!agentState.speak) {
        setSubmittedUserPrompt(null);
      }
    }
  }, [isAgentRunning, isActuallyThinking, quickInput?.isOpen, submitStep, agentState.speak]);

  const isSubmitting = submitStep === 'submitting';

  // Row 1 (Top History/Context Message Model):
  // Structured data-driven message model with intrinsic speaker identity:
  // 1. If user has actively submitted a prompt in this input: speaker is 'user'.
  // 2. If running active task or in user.ask workflow for this target: speaker is 'user'.
  // 3. Otherwise (idle inspection), strictly use target-scoped contextHistory from active target.
  const rawRow1Message = useMemo<HudContextMessage | null>(() => {
    // 1. Active submission stream in this cursor
    if (submittedUserPrompt && submittedUserPrompt.trim()) {
      return {
        text: submittedUserPrompt.trim(),
        speaker: 'user',
      };
    }

    // 2. Active task or user.ask execution
    const isExecutionActive = isAgentRunning || Boolean(quickInput?.onAskResolve) || Boolean(isAgentAsking) || Boolean(agentState.isAsking);
    if (isExecutionActive && agentState.lastPrompt && agentState.lastPrompt.trim()) {
      const scopeMatches = !agentState.lastPromptTargetId || agentState.lastPromptTargetId === (quickInput?.targetId || 'global');
      if (scopeMatches) {
        return {
          text: agentState.lastPrompt.trim(),
          speaker: 'user',
        };
      }
    }

    // 3. Target-scoped persistent context history (from card's chatHistory or canvas globalHistory)
    if (quickInput?.contextHistory) {
      return quickInput.contextHistory;
    }

    // 4. Legacy fallback for lastReply (if contextHistory not explicitly provided)
    if (quickInput?.isOpen && quickInput.lastReply && quickInput.lastReply.trim() && !quickInput.onAskResolve && !isAgentAsking && !agentState.isAsking) {
      return {
        text: quickInput.lastReply.trim(),
        speaker: 'agent',
      };
    }

    return null;
  }, [submittedUserPrompt, isAgentRunning, isAgentAsking, agentState.isAsking, quickInput?.isOpen, quickInput?.onAskResolve, quickInput?.targetId, quickInput?.contextHistory, quickInput?.lastReply, agentState.lastPrompt, agentState.lastPromptTargetId]);

  const hasSelectedCanvasCards = Boolean(selectedCards && selectedCards.length > 0);
  const isDefaultOrSelectionSpeak = !agentState.speak ||
    rawIsThinking ||
    (hasSelectedCanvasCards && agentState.speak.startsWith('选了')) ||
    agentState.speak === '我能帮什么忙？';

  // Effective agent speak for Row 2:
  // If user has submitted a prompt:
  //   - Never revert to dynamic selection prompt ("选了X张图片...") or greeting ("我能帮什么忙？")!
  //   - If agentState.speak has actual agent text (not selection or generic greeting), show it.
  //   - Otherwise show "正在思考..." during thinking/submitting.
  // When Agent is actively running/executing without submittedUserPrompt:
  //   - Strictly execution/thinking mode: show active speak or fallback to "正在思考..." / "正在操作...".
  // When idle and quickInput is open:
  //   - Show dynamic selection prompt for canvas cards, or preserve specific UI/script/asset selection speak.
  const effectiveAgentSpeak = submittedUserPrompt
    ? (agentState.speak && !agentState.speak.startsWith('选了') && agentState.speak !== '我能帮什么忙？' && !isThinkingPhrase(agentState.speak)
        ? agentState.speak
        : "正在思考...")
    : (isAgentRunning
        ? (agentState.speak && !agentState.speak.startsWith('选了') && agentState.speak !== '我能帮什么忙？' 
            ? agentState.speak 
            : (isActuallyThinking ? "正在思考..." : "正在操作..."))
        : (quickInput?.isOpen && submitStep === 'idle' && isDefaultOrSelectionSpeak)
            ? dynamicPromptText
            : (rawIsThinking && isAgentRunning === false)
              ? undefined
              : (agentState.speak || (quickInput?.isOpen ? dynamicPromptText : undefined)));

  const effectiveIsThinking = submittedUserPrompt
    ? (agentState.speak && !agentState.speak.startsWith('选了') && agentState.speak !== '我能帮什么忙？' && !isThinkingPhrase(agentState.speak)
        ? false
        : true)
    : (isAgentRunning
        ? (isAgentThinking !== undefined ? (isAgentThinking && isThinkingPhrase(effectiveAgentSpeak)) : isThinkingPhrase(effectiveAgentSpeak))
        : (quickInput?.isOpen && submitStep === 'idle' && rawIsThinking)
          ? false
          : isActuallyThinking);

  // Deduplication guard: Never display identical text simultaneously in Row 1 and Row 2 (except during submit upward motion)
  const row1Message = useMemo<HudContextMessage | null>(() => {
    if (!rawRow1Message) return null;
    if (isSubmitting) return rawRow1Message;
    if (effectiveAgentSpeak && rawRow1Message.text === effectiveAgentSpeak.trim()) {
      return null;
    }
    return rawRow1Message;
  }, [rawRow1Message, isSubmitting, effectiveAgentSpeak]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = quickInput?.value || '';
    const clean = val.trim();
    if (!clean || submitStep !== 'idle') return;

    // Upward scroll stream: User text takes flight from Row 3 to Row 1, Row 2 exits upward past Row 1 and hides
    setSubmittedUserPrompt(clean);
    setSubmitStep('submitting');

    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
    }

    submitTimerRef.current = setTimeout(() => {
      quickInput?.onSubmit(clean);
      setSubmitStep('idle');
    }, 320);
  };

  const isAsking =
    (Boolean(isAgentAsking) || Boolean(agentState.isAsking) || Boolean(quickInput?.onAskResolve)) &&
    !(effectiveIsThinking || isActuallyThinking || isSubmitting || Boolean(isAgentRunning));

  const isSleeping =
    Boolean(agentState.isSleeping) &&
    !isAsking &&
    !(effectiveIsThinking || isActuallyThinking || isSubmitting || Boolean(isAgentRunning));

  const row2Content = (isSubmitting || isSleeping)
    ? null
    : (effectiveAgentSpeak ? { type: 'agent' as const, text: effectiveAgentSpeak, isThinking: effectiveIsThinking } : null);

  // Tracks horizontal breathing morphing (squeeze & expand) for text updates within the single persistent bubble
  const [morphTrigger, setMorphTrigger] = useState(0);
  const prevSpeakRef = useRef<string | undefined>(agentState.speak);

  useEffect(() => {
    if (
      prevSpeakRef.current && 
      agentState.speak && 
      prevSpeakRef.current !== agentState.speak &&
      !isSubmitting
    ) {
      setMorphTrigger(c => c + 1);
    }
    prevSpeakRef.current = agentState.speak;
  }, [agentState.speak, isSubmitting]);

  // Swapped: Light/Dark Mode Agent Pointer Styles Interchanged!
  const pointerFill = isDarkMode ? '#1c1c1e' : '#ffffff';
  const pointerStroke = isDarkMode ? '#a45cf8' : '#a855f7';
  const bubbleBgClass = isDarkMode 
    ? 'bg-[#18181c]/95 border border-[#a45cf8]/25 shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_14px_rgba(164,92,248,0.18)]' 
    : 'bg-white/95 border border-purple-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.12),0_0_14px_rgba(168,85,247,0.15)]';
  // Plan 1: Receding memory archival layer for historical conversation bubble
  const historyBubbleBgClass = isDarkMode 
    ? 'bg-[#141417]/85 border border-[#a45cf8]/15 shadow-[0_2px_12px_rgba(0,0,0,0.55)]' 
    : 'bg-white/85 border border-purple-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.06)]';
  const textClass = isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold';
  const placeholderClass = isDarkMode ? 'placeholder-white/40' : 'placeholder-slate-400';
  const inputClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const buttonClassActive = isDarkMode ? 'bg-[#a45cf8]/20 hover:bg-[#a45cf8]/35 text-[#a45cf8]' : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-600';
  const buttonClassInactive = isDarkMode ? 'text-white/30' : 'text-slate-400';

  const isOpen = quickInput?.isOpen;
  const focusTrigger = quickInput?.focusTrigger;

  useEffect(() => {
    if (isOpen) {
      // Resilient multi-stage focus strategy to bypass browser context menu and right-click focus-stealing cycles:
      // Stage 1: Immediate focus attempt
      quickInputRef.current?.focus();
      
      // Stage 2: Animation frame focus attempt
      const rId = requestAnimationFrame(() => {
        quickInputRef.current?.focus();
      });

      // Stage 3: Bulletproof timeout focus attempt (fires after browser mouse/selection events settle)
      const timer = setTimeout(() => {
        if (quickInputRef.current) {
          quickInputRef.current.focus();
          const len = quickInputRef.current.value.length;
          quickInputRef.current.setSelectionRange(len, len);
        }
      }, 120);

      return () => {
        cancelAnimationFrame(rId);
        clearTimeout(timer);
      };
    }
  }, [isOpen, focusTrigger]);

  // Auto-blur quick input when clicking elsewhere to release focus (without closing the agent dialogue)
  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentClick = (e: PointerEvent) => {
      const formEl = quickInputRef.current?.form;
      const target = e.target as HTMLElement;
      
      // If the target is NOT inside the form, blur the input to cancel focus, but KEEP the dialogue open!
      if (formEl && !formEl.contains(target)) {
        quickInputRef.current?.blur();
      }
    };

    // Listen with capture on pointerdown to intercept click-away gestures across the application
    document.addEventListener('pointerdown', handleDocumentClick, true);
    return () => {
      document.removeEventListener('pointerdown', handleDocumentClick, true);
    };
  }, [isOpen]);

  const currentCoordSpace: AgentCoordinateSpace = agentState.coordinateSpace === 'screen' ? 'screen' : 'canvas';
  const prevCoordSpaceRef = useRef<AgentCoordinateSpace>(currentCoordSpace);
  const isScreenSpaceMV = useMotionValue(currentCoordSpace === 'screen' ? 1 : 0);

  // Animate the agent's position smoothly in either canvas world space or fixed screen space
  const agentPosX = useMotionValue(agentState.x);
  const agentPosY = useMotionValue(agentState.y);

  useEffect(() => {
    if (prevCoordSpaceRef.current !== currentCoordSpace) {
      const scaleVal = transform.tScale.get() || 1;
      const txVal = transform.tx.get();
      const tyVal = transform.ty.get();
      if (currentCoordSpace === 'screen') {
        agentPosX.set(agentPosX.get() * scaleVal + txVal);
        agentPosY.set(agentPosY.get() * scaleVal + tyVal);
      } else {
        agentPosX.set((agentPosX.get() - txVal) / scaleVal);
        agentPosY.set((agentPosY.get() - tyVal) / scaleVal);
      }
      prevCoordSpaceRef.current = currentCoordSpace;
      isScreenSpaceMV.set(currentCoordSpace === 'screen' ? 1 : 0);
    }

    if (isDragging) {
      agentPosX.set(agentState.x);
      agentPosY.set(agentState.y);
    } else {
      const transition = isZooming && currentCoordSpace === 'canvas'
        ? { type: 'tween', duration: 0.15, ease: 'easeOut' }
        : agentState.isMoving 
          ? { type: 'spring', damping: 28, stiffness: 450, mass: 0.35 }
          : { duration: 0 };
          
      animate(agentPosX, agentState.x, transition as any);
      animate(agentPosY, agentState.y, transition as any);
    }
  }, [agentState.x, agentState.y, currentCoordSpace, isDragging, isZooming, agentState.isMoving, agentPosX, agentPosY, isScreenSpaceMV, transform.tScale, transform.tx, transform.ty]);

  // Derive screen position instantly: invariant when anchored to dock card ('screen'), transformed with camera when on canvas ('canvas')
  const targetScreenX = useTransform(
    [agentPosX, transform.tx, transform.tScale, isScreenSpaceMV],
    ([ax, tx, s, isScreen]: any[]) => (isScreen ? ax : ax * s + tx)
  );
  
  const targetScreenY = useTransform(
    [agentPosY, transform.ty, transform.tScale, isScreenSpaceMV],
    ([ay, ty, s, isScreen]: any[]) => (isScreen ? ay : ay * s + ty)
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAgentRunning) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    isAgentBoxSelectingRef.current = false;
    setIsAgentBoxSelecting(false);

    const scaleVal = transform.tScale.get() || 1;
    const startCanvasX = currentCoordSpace === 'screen' ? (agentState.x - transform.tx.get()) / scaleVal : agentState.x;
    const startCanvasY = currentCoordSpace === 'screen' ? (agentState.y - transform.ty.get()) / scaleVal : agentState.y;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startPosX: agentState.x,
      startPosY: agentState.y,
      startCoordSpace: currentCoordSpace,
      startCanvasX,
      startCanvasY,
      hasMoved: false
    };

    // Start a 350ms long-press timer for Agent box-selection mode (only when awake)
    if (!isSleeping) {
      longPressTimerRef.current = setTimeout(() => {
        if (dragStartRef.current && !dragStartRef.current.hasMoved) {
          isAgentBoxSelectingRef.current = true;
          setIsAgentBoxSelecting(true);
          onStartAgentBoxSelect?.(startCanvasX, startCanvasY);
        }
      }, 350);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    e.stopPropagation();
    e.preventDefault();

    const dist = Math.hypot(e.clientX - dragStartRef.current.pointerX, e.clientY - dragStartRef.current.pointerY);
    if (!dragStartRef.current.hasMoved && dist > 3) {
      dragStartRef.current.hasMoved = true;
      if (!isAgentBoxSelectingRef.current) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        setIsDragging(true);
      }
    }

    if (isAgentBoxSelectingRef.current) {
      const currentCanvasX = dragStartRef.current.startCanvasX + (e.clientX - dragStartRef.current.pointerX) / (transform.tScale.get() || 1);
      const currentCanvasY = dragStartRef.current.startCanvasY + (e.clientY - dragStartRef.current.pointerY) / (transform.tScale.get() || 1);
      onUpdateAgentBoxSelect?.(currentCanvasX, currentCanvasY);
    } else if (dragStartRef.current.hasMoved) {
      if (dragStartRef.current.startCoordSpace === 'screen') {
        const dx = e.clientX - dragStartRef.current.pointerX;
        const dy = e.clientY - dragStartRef.current.pointerY;
        const newX = dragStartRef.current.startPosX + dx;
        const newY = dragStartRef.current.startPosY + dy;

        agentPosX.set(newX);
        agentPosY.set(newY);
        onDragAgent?.(newX, newY, 'screen');
      } else {
        const scaleVal = transform.tScale.get() || 1;
        const dx = (e.clientX - dragStartRef.current.pointerX) / scaleVal;
        const dy = (e.clientY - dragStartRef.current.pointerY) / scaleVal;
        const newX = dragStartRef.current.startPosX + dx;
        const newY = dragStartRef.current.startPosY + dy;

        agentPosX.set(newX);
        agentPosY.set(newY);
        onDragAgent?.(newX, newY, 'canvas');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!dragStartRef.current) return;
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const wasBoxSelecting = isAgentBoxSelectingRef.current;
    const wasMoved = dragStartRef.current.hasMoved;
    const scaleVal = transform.tScale.get() || 1;
    const txVal = transform.tx.get();
    const tyVal = transform.ty.get();
    const rawDx = e.clientX - dragStartRef.current.pointerX;
    const rawDy = e.clientY - dragStartRef.current.pointerY;

    const finalPosX = dragStartRef.current.startCoordSpace === 'screen'
      ? dragStartRef.current.startPosX + rawDx
      : dragStartRef.current.startPosX + rawDx / scaleVal;
    const finalPosY = dragStartRef.current.startCoordSpace === 'screen'
      ? dragStartRef.current.startPosY + rawDy
      : dragStartRef.current.startPosY + rawDy / scaleVal;

    const finalCanvasX = dragStartRef.current.startCoordSpace === 'screen'
      ? (finalPosX - txVal) / scaleVal
      : finalPosX;
    const finalCanvasY = dragStartRef.current.startCoordSpace === 'screen'
      ? (finalPosY - tyVal) / scaleVal
      : finalPosY;

    setIsDragging(false);
    setIsAgentBoxSelecting(false);
    isAgentBoxSelectingRef.current = false;
    dragStartRef.current = null;

    if (wasBoxSelecting) {
      onEndAgentBoxSelect?.();
    } else if (!wasMoved) {
      onClickPointer?.();
    } else {
      agentPosX.set(finalPosX);
      agentPosY.set(finalPosY);
      onDragAgentEnd?.(finalCanvasX, finalCanvasY, e.clientX, e.clientY);
      // 🚀 Bulletproof delayed focus on drag release to bypass browser mouseup focus-clearing cycles
      setTimeout(() => {
        if (quickInputRef.current) {
          quickInputRef.current.focus();
          const len = quickInputRef.current.value.length;
          quickInputRef.current.setSelectionRange(len, len);
        }
      }, 150);
    }
  };

  return (
    <motion.div
      data-agent-cursor-root="true"
      data-agent-coord-space={currentCoordSpace}
      data-agent-sleeping={isSleeping ? 'true' : 'false'}
      data-agent-asking={isAsking ? 'true' : 'false'}
      className="fixed top-0 left-0 z-[9999] flex items-center select-none pointer-events-none"
      style={{ x: targetScreenX, y: targetScreenY }}
      initial={false}
      animate={{ 
        opacity: agentState.visible ? 1 : 0,
        scale: agentState.isActive ? 0.9 : isDragging ? 1.08 : 1
      }}
      transition={{ 
        opacity: { duration: 0.2 },
        scale: { type: 'spring', damping: 15, stiffness: 200 }
      }}
    >
      {/* Floating Wrapper that animates both the Cursor and Speech Bubble together on GPU Compositor */}
      <div
        className="relative flex items-center"
        style={{
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Agent Pointer Cursor (Qiqi SVG + SMIL: idle / think / ask / sleep) */}
        <div
          className="relative group cursor-grab active:cursor-grabbing p-2 -m-2 touch-none pointer-events-auto shrink-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          <QiqiCursorIcon
            state={
              effectiveIsThinking || isActuallyThinking || isSubmitting || Boolean(isAgentRunning)
                ? 'think'
                : isAsking
                  ? 'ask'
                  : isSleeping
                    ? 'sleep'
                    : 'idle'
            }
            size={57.6}
            isDarkMode={isDarkMode}
          />
          <AnimatePresence>
            {isAsking && (
              <motion.div
                key="ask-indicator"
                data-testid="agent-ask-indicator"
                initial={{ opacity: 0, scale: 0.75, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.75, y: 2 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -top-3 left-5.5 z-20 pointer-events-none select-none flex items-end"
              >
                <motion.span
                  className={`inline-block font-black font-mono text-[15px] leading-none tracking-tight ${
                    isDarkMode
                      ? 'text-[#c084fc] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
                      : 'text-purple-600 drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]'
                  }`}
                  animate={{
                    y: [0, -3.5, 0],
                    rotate: [-8, 8, -8],
                    scale: [0.96, 1.08, 0.96],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  ?
                </motion.span>
              </motion.div>
            )}
            {isSleeping && (
              <motion.div
                key="sleep-zzz"
                data-testid="agent-sleep-zzz"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                className="absolute -top-2.5 left-6 z-20 pointer-events-none select-none flex items-end"
              >
                {[
                  { delay: 0, x: 0, y: 0, size: 'text-[10px]' },
                  { delay: 0.55, x: 6, y: -5, size: 'text-[12px]' },
                  { delay: 1.1, x: 13, y: -11, size: 'text-[14px]' },
                ].map((item, idx) => (
                  <motion.span
                    key={idx}
                    className={`absolute font-extrabold font-mono leading-none tracking-tight ${item.size} ${
                      isDarkMode
                        ? 'text-[#c084fc] drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]'
                        : 'text-purple-600 drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]'
                    }`}
                    style={{ left: item.x, top: item.y }}
                    animate={{
                      y: [2, -7],
                      x: [0, 3],
                      opacity: [0, 0.95, 0],
                      scale: [0.78, 1.05, 0.92],
                    }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                       delay: item.delay,
                      ease: 'easeInOut',
                    }}
                  >
                    z
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {badgeNumber !== undefined && badgeNumber > 0 && (
            <div
              data-testid={`agent-cursor-badge-${badgeNumber}`}
              className={`absolute -top-1 -right-1 z-20 min-w-[16px] h-[16px] px-1 rounded-full ${isDarkMode ? 'bg-[#a45cf8]' : 'bg-purple-600'} text-white text-[10px] font-bold font-mono leading-none flex items-center justify-center shadow-md border border-white/90 dark:border-zinc-900 select-none pointer-events-none`}
            >
              {badgeNumber}
            </div>
          )}
        </div>
        
        {/* Stacked Agent HUD beside Cursor */}
        <div className="absolute left-8.5 top-1 flex flex-col gap-1.5 items-start pointer-events-none">
          {/* Primary Speech Row Anchor (Level with Agent Mouse Cursor Pointer) */}
          <div className="relative pointer-events-none min-h-[30px] flex items-center">
            {/* Row 1: Memory shelf - Anchored stably ABOVE Row 2 */}
            <AnimatePresence>
              {!isSleeping && row1Message && (
                <motion.div
                  key={row1Message.text}
                  initial={isSubmitting ? { opacity: 1, y: 64, scale: 1 } : { opacity: 0, scale: 0.82, y: 0 }}
                  animate={{ opacity: 0.88, y: 0, scale: 0.96 }}
                  exit={isSubmitting ? { 
                    opacity: 0, 
                    y: -30, 
                    scale: 0.92,
                    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } 
                  } : { 
                    opacity: 0, 
                    scale: 0.82,
                    y: 0, 
                    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } 
                  }}
                  transition={isSubmitting ? { duration: 0.32, ease: [0.16, 1, 0.3, 1] } : { duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: '0% 100%' }}
                  className="absolute bottom-full mb-1.5 left-0 pointer-events-none select-none shrink-0 z-20 origin-bottom-left"
                >
                  <div className="relative px-3 py-1 flex items-center">
                    <div 
                      className={`absolute inset-0 rounded-xl corner-squircle ${historyBubbleBgClass}`} 
                      style={{
                        willChange: 'transform',
                        transform: 'translate3d(0,0,0)',
                        backfaceVisibility: 'hidden',
                      }}
                    />
                    <div className="relative z-10 flex items-center max-w-[340px]" style={{ transform: 'translateZ(0)' }}>
                      <SingleLineMarquee 
                        text={row1Message.text} 
                        isDarkMode={isDarkMode} 
                        isHistory={true} 
                        speaker={row1Message.speaker} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
   
            {/* Row 2: Speaking Text UI - Level with Cursor Pointer */}
            <AnimatePresence mode="wait">
              {row2Content && (
                <motion.div
                  key={row2Content.text}
                  initial={{ opacity: 0, scale: 0.82, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={isSubmitting ? { 
                    opacity: 0, 
                    y: -50,
                    scale: 0.92,
                    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } 
                  } : { 
                    opacity: 0, 
                    scale: 0.82,
                    y: 0,
                    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } 
                  }}
                  transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: '0% 50%' }}
                  className="pointer-events-none select-none shrink-0 origin-left"
                >
                  <div className="relative px-3.5 py-1.5 flex items-center origin-left">
                    <div 
                      className={`absolute inset-0 rounded-xl corner-squircle ${bubbleBgClass}`} 
                      style={{
                        willChange: 'transform',
                        transform: 'translate3d(0,0,0)',
                        backfaceVisibility: 'hidden',
                      }}
                    />
                    <div className="relative z-10 flex items-center" style={{ transform: 'translateZ(0)' }}>
                      <SingleLineMarquee text={row2Content.text} isDarkMode={isDarkMode} speaker={row2Content.type} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
 
          {/* Row 3: Quick Input Box - Spaced naturally below the speaking bubble, moves UP when submitted */}
          <AnimatePresence>
            {quickInput?.isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -2, scale: 0.96 }}
                animate={isSubmitting ? { opacity: 0, scale: 0.96 } : { opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto select-none shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="relative flex items-center w-[290px]">
                  <div 
                    className={`absolute inset-0 rounded-xl corner-squircle ${bubbleBgClass}`} 
                    style={{
                      willChange: 'transform',
                      transform: 'translate3d(0,0,0)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                  
                  <form
                    onSubmit={handleFormSubmit}
                    className="relative z-10 flex items-center w-full px-3 py-1 gap-1.5"
                  >
                    <input
                      ref={quickInputRef}
                      type="text"
                      value={quickInput?.value || ''}
                      onChange={(e) => quickInput?.onChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          quickInput.onClose();
                        }
                      }}
                      placeholder={quickInput.placeholder || "输入你的想法..."}
                      style={{
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                      className={`flex-1 min-w-0 bg-transparent text-[13px] font-medium outline-none leading-none py-1 antialiased ${isDarkMode ? 'caret-[#a45cf8]' : 'caret-[#a855f7]'} ${inputClass} ${placeholderClass}`}
                    />
                    <button
                      type="submit"
                      disabled={!(quickInput?.value || '').trim() || submitStep !== 'idle'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        (quickInput?.value || '').trim() && submitStep === 'idle'
                          ? buttonClassActive + ' cursor-pointer active:scale-95'
                          : buttonClassInactive + ' cursor-not-allowed'
                      }`}
                    >
                      <motion.div
                        animate={isSubmitting ? { y: -8, opacity: 0, scale: 0.6 } : { y: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 0.14, ease: 'easeIn' }}
                      >
                        <ArrowUp size={13} strokeWidth={2.5} />
                      </motion.div>
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
