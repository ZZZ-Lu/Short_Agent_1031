import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WIDTH_TRANSITION_TIMINGS } from '../utils/scriptBibleDockLayout';
import {
  evaluateScrollRestoreStep,
  isUserScrollKey,
  resolveInitialPositionReady,
  shouldPersistPanelScroll,
} from '../utils/scrollMemory';
import { normalizeScrollOffset } from '../utils/scriptBibleDockLayout';

/**
 * Tracks outer shell width changes (which animate via CSS over `shellResizeMs`)
 * so scroll restoration waits cleanly until layout reflow completes without overwriting
 * persisted offsets with transition-clamped values.
 */
export function useShellWidthTransitionGuard(
  panelWidth: number,
  isExpanded: boolean,
  durationMs: number = WIDTH_TRANSITION_TIMINGS.shellResizeMs + 160
): boolean {
  const prevRef = useRef<{ width: number; expanded: boolean }>({
    width: panelWidth,
    expanded: isExpanded,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const widthChangedThisRender =
    isExpanded &&
    (prevRef.current.width !== panelWidth || !prevRef.current.expanded);

  useLayoutEffect(() => {
    const prev = prevRef.current;
    const expandedWidthTransition =
      isExpanded && (prev.width !== panelWidth || !prev.expanded);
    prevRef.current = { width: panelWidth, expanded: isExpanded };

    if (!isExpanded) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsTransitioning(false);
      return;
    }

    if (expandedWidthTransition) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      setIsTransitioning(true);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setIsTransitioning(false);
      }, durationMs);
    }
  }, [panelWidth, isExpanded, durationMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return widthChangedThisRender || isTransitioning;
}

export interface UseUnifiedPanelScrollMemoryOptions {
  scopeKey: string;
  readPersistedScrollTop: () => number;
  writePersistedScrollTop: (top: number, metadata?: unknown) => void;
  captureScrollMetadata?: (top: number, el: HTMLElement) => unknown;
  resolveRestoreTargetTop?: () => number | null;
  getScrollElement: () => HTMLElement | null;
  isActiveAndVisible: boolean;
  isTransitioning?: boolean;
  isFilteredView?: boolean;
  contentVersion?: string | number;
  maxWaitMs?: number;
  attachSignal?: unknown;
  onUserScroll?: (top: number) => void;
}

export interface UseUnifiedPanelScrollMemoryResult {
  isPositionReady: boolean;
  cancelPendingRestore: () => void;
  handleScrollEvent: (scrollTop?: number) => void;
  reapplyPendingRestore: () => void;
}

interface DirtyWriteRecord {
  scopeKey: string;
  top: number;
  metadata?: unknown;
  write: (top: number, metadata?: unknown) => void;
}

interface PendingRestoreState {
  scopeKey: string;
  rawTargetTop: number;
  targetTop: number;
  startedAtMs: number;
  stablePasses: number;
}

/**
 * Unified scroll memory engine shared across all three Script Bible dock panels:
 * - Panel 1 (Script CodeMirror editor)
 * - Panel 2 (Assets / Universe / Cards side panel)
 * - Panel 3 (Asset Image Feed panel in sections / timeline modes)
 *
 * Handles panel collapse/expand, drawer open/close, project switching, and full page reload
 * with async IndexedDB card loading & image decoding.
 */
export function useUnifiedPanelScrollMemory({
  scopeKey,
  readPersistedScrollTop,
  writePersistedScrollTop,
  captureScrollMetadata,
  resolveRestoreTargetTop,
  getScrollElement,
  isActiveAndVisible,
  isTransitioning = false,
  isFilteredView = false,
  contentVersion,
  maxWaitMs = 2600,
  attachSignal,
  onUserScroll,
}: UseUnifiedPanelScrollMemoryOptions): UseUnifiedPanelScrollMemoryResult {
  const readRef = useRef(readPersistedScrollTop);
  readRef.current = readPersistedScrollTop;
  const writeRef = useRef(writePersistedScrollTop);
  writeRef.current = writePersistedScrollTop;
  const captureMetadataRef = useRef(captureScrollMetadata);
  captureMetadataRef.current = captureScrollMetadata;
  const resolveTargetRef = useRef(resolveRestoreTargetTop);
  resolveTargetRef.current = resolveRestoreTargetTop;
  const getElRef = useRef(getScrollElement);
  getElRef.current = getScrollElement;
  const onUserScrollRef = useRef(onUserScroll);
  onUserScrollRef.current = onUserScroll;

  const activeRef = useRef(isActiveAndVisible);
  activeRef.current = isActiveAndVisible;
  const transitioningRef = useRef(isTransitioning);
  transitioningRef.current = isTransitioning;
  const filteredRef = useRef(isFilteredView);
  filteredRef.current = isFilteredView;
  const scopeKeyRef = useRef(scopeKey);
  scopeKeyRef.current = scopeKey;
  const maxWaitMsRef = useRef(maxWaitMs);
  maxWaitMsRef.current = maxWaitMs;

  const pendingRestoreRef = useRef<PendingRestoreState | null>(null);
  const isApplyingProgrammaticRef = useRef(false);
  const programmaticGuardUntilRef = useRef(0);
  const lastProgrammaticTargetRef = useRef<number | null>(null);
  const programmaticClearRafRef = useRef<number | null>(null);
  const loopRafRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const dirtyWriteRef = useRef<DirtyWriteRecord | null>(null);
  const writeDebounceRef = useRef<number | null>(null);

  // Synchronously track whether the current scope's initial position has settled.
  // Never start ready=true while inactive so the first active frame mounts hidden when target > 0.
  const settledScopeRef = useRef<string | null>(null);
  const [positionReadyState, setPositionReadyState] = useState<{
    scopeKey: string;
    ready: boolean;
  }>(() => ({
    scopeKey,
    ready:
      isActiveAndVisible &&
      !isFilteredView &&
      normalizeScrollOffset(readPersistedScrollTop()) <= 0,
  }));

  const flushDirtyWrite = useCallback(() => {
    if (writeDebounceRef.current !== null) {
      window.clearTimeout(writeDebounceRef.current);
      writeDebounceRef.current = null;
    }
    const dirty = dirtyWriteRef.current;
    if (dirty) {
      dirtyWriteRef.current = null;
      dirty.write(dirty.top, dirty.metadata);
    }
  }, []);

  const stopRestoreLoop = useCallback(() => {
    if (loopRafRef.current !== null) {
      cancelAnimationFrame(loopRafRef.current);
      loopRafRef.current = null;
    }
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (programmaticClearRafRef.current !== null) {
      cancelAnimationFrame(programmaticClearRafRef.current);
      programmaticClearRafRef.current = null;
    }
    isApplyingProgrammaticRef.current = false;
  }, []);

  const markScopeReady = useCallback((key: string) => {
    settledScopeRef.current = key;
    setPositionReadyState((prev) =>
      prev.scopeKey === key && prev.ready ? prev : { scopeKey: key, ready: true }
    );
  }, []);

  const cancelPendingRestore = useCallback(() => {
    if (pendingRestoreRef.current) {
      pendingRestoreRef.current = null;
    }
    stopRestoreLoop();
    markScopeReady(scopeKeyRef.current);
  }, [markScopeReady, stopRestoreLoop]);

  const applyProgrammaticScrollTop = useCallback((el: HTMLElement, targetTop: number) => {
    isApplyingProgrammaticRef.current = true;
    lastProgrammaticTargetRef.current = targetTop;
    programmaticGuardUntilRef.current = performance.now() + 90;
    el.scrollTop = targetTop;
    if (programmaticClearRafRef.current !== null) {
      cancelAnimationFrame(programmaticClearRafRef.current);
    }
    programmaticClearRafRef.current = requestAnimationFrame(() => {
      programmaticClearRafRef.current = null;
      isApplyingProgrammaticRef.current = false;
    });
  }, []);

  const resolveCurrentTargetTop = useCallback((fallbackTop: number) => {
    const resolver = resolveTargetRef.current;
    if (!resolver) {
      return normalizeScrollOffset(fallbackTop);
    }
    const resolved = resolver();
    if (typeof resolved === 'number' && Number.isFinite(resolved)) {
      return normalizeScrollOffset(resolved);
    }
    return normalizeScrollOffset(fallbackTop);
  }, []);

  const stepRestore = useCallback(() => {
    const pending = pendingRestoreRef.current;
    if (!pending || pending.scopeKey !== scopeKeyRef.current || !activeRef.current || filteredRef.current) {
      stopRestoreLoop();
      return;
    }

    const el = getElRef.current();
    if (!el) {
      return;
    }

    const resolvedTargetTop = resolveCurrentTargetTop(pending.rawTargetTop);
    if (Math.abs(resolvedTargetTop - pending.targetTop) > 1) {
      pending.targetTop = resolvedTargetTop;
      pending.stablePasses = 0;
    }

    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    const elapsedMs = performance.now() - pending.startedAtMs;
    const decision = evaluateScrollRestoreStep({
      targetTop: pending.targetTop,
      currentScrollTop: el.scrollTop,
      maxScrollTop,
      elapsedMs,
      maxWaitMs: maxWaitMsRef.current,
      stablePasses: pending.stablePasses,
      isTransitioning: transitioningRef.current,
    });

    if (decision.action === 'done') {
      pendingRestoreRef.current = null;
      stopRestoreLoop();
      markScopeReady(pending.scopeKey);
      return;
    }

    pending.stablePasses = decision.nextStablePasses;
    if (Math.abs(el.scrollTop - Math.min(decision.nextScrollTop, maxScrollTop)) > 1) {
      applyProgrammaticScrollTop(el, decision.nextScrollTop);
    }

    if (loopRafRef.current !== null) {
      cancelAnimationFrame(loopRafRef.current);
    }
    loopRafRef.current = requestAnimationFrame(() => {
      loopRafRef.current = null;
      stepRestore();
    });
  }, [applyProgrammaticScrollTop, markScopeReady, resolveCurrentTargetTop, stopRestoreLoop]);

  const reapplyPendingRestore = useCallback(() => {
    if (pendingRestoreRef.current && activeRef.current && !filteredRef.current) {
      stepRestore();
    }
  }, [stepRestore]);

  const handleScrollEvent = useCallback(
    (explicitTop?: number) => {
      const el = getElRef.current();
      if (!el) return;
      const top = normalizeScrollOffset(
        typeof explicitTop === 'number' ? explicitTop : el.scrollTop
      );
      const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
      const pending = pendingRestoreRef.current;

      if (
        performance.now() < programmaticGuardUntilRef.current &&
        (pending ||
          (lastProgrammaticTargetRef.current !== null &&
            Math.abs(top - lastProgrammaticTargetRef.current) <= 4))
      ) {
        return;
      }

      const canPersist = shouldPersistPanelScroll({
        isActiveAndVisible: activeRef.current,
        isTransitioning: transitioningRef.current,
        isRestoring: isApplyingProgrammaticRef.current,
        isFilteredView: filteredRef.current,
        hasPendingRestore: Boolean(pending),
        pendingTargetTop: pending?.targetTop ?? null,
        currentScrollTop: top,
        maxScrollTop,
      });

      if (!canPersist) {
        return;
      }

      // If pending restore exists and maxScrollTop already reached targetTop when a user-scrolled offset differs,
      // clear pending restore and accept the new offset.
      if (pending) {
        if (Math.abs(top - Math.min(pending.targetTop, maxScrollTop)) <= 4) {
          return;
        }
        pendingRestoreRef.current = null;
        stopRestoreLoop();
        markScopeReady(scopeKeyRef.current);
      }

      onUserScrollRef.current?.(top);

      const currentScope = scopeKeyRef.current;
      const writer = writeRef.current;
      const metadata = captureMetadataRef.current?.(top, el);
      dirtyWriteRef.current = {
        scopeKey: currentScope,
        top,
        metadata,
        write: writer,
      };

      if (writeDebounceRef.current !== null) {
        window.clearTimeout(writeDebounceRef.current);
      }
      writeDebounceRef.current = window.setTimeout(() => {
        writeDebounceRef.current = null;
        const dirty = dirtyWriteRef.current;
        if (dirty && dirty.scopeKey === currentScope) {
          dirtyWriteRef.current = null;
          dirty.write(dirty.top, dirty.metadata);
        }
      }, 75);
    },
    [markScopeReady, stopRestoreLoop]
  );

  // Flush pending dirty scroll on pagehide / beforeunload / visibility hidden
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleFlush = () => {
      flushDirtyWrite();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushDirtyWrite();
      }
    };
    window.addEventListener('pagehide', handleFlush);
    window.addEventListener('beforeunload', handleFlush);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pagehide', handleFlush);
      window.removeEventListener('beforeunload', handleFlush);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [flushDirtyWrite]);

  // Core activation / restoration effect + ResizeObserver + user-input cancellation listeners
  useEffect(() => {
    if (!isActiveAndVisible || isFilteredView) {
      flushDirtyWrite();
      pendingRestoreRef.current = null;
      stopRestoreLoop();
      settledScopeRef.current = null;
      setPositionReadyState((prev) =>
        prev.scopeKey === scopeKey && !prev.ready ? prev : { scopeKey, ready: false }
      );
      return;
    }

    const el = getElRef.current();
    if (!el) {
      return;
    }

    // Read persisted offset for this scope
    const rawTargetTop = normalizeScrollOffset(readRef.current());
    const targetTop = resolveCurrentTargetTop(rawTargetTop);

    if (rawTargetTop <= 0 && targetTop <= 0) {
      pendingRestoreRef.current = null;
      if (el.scrollTop > 1) {
        applyProgrammaticScrollTop(el, 0);
      }
      markScopeReady(scopeKey);
    } else {
      pendingRestoreRef.current = {
        scopeKey,
        rawTargetTop: rawTargetTop > 0 ? rawTargetTop : targetTop,
        targetTop,
        startedAtMs: performance.now(),
        stablePasses: 0,
      };
      setPositionReadyState((prev) =>
        prev.scopeKey === scopeKey && !prev.ready ? prev : { scopeKey, ready: false }
      );
      applyProgrammaticScrollTop(el, targetTop);
      stepRestore();

      // Safety fallback timeout in case no resize/rAF fires near expiry
      fallbackTimerRef.current = window.setTimeout(() => {
        fallbackTimerRef.current = null;
        if (pendingRestoreRef.current?.scopeKey === scopeKey) {
          stepRestore();
        }
      }, maxWaitMs + 50);
    }

    // Active user input immediately cancels any pending programmatic scroll restore
    const handleUserInputIntent = () => {
      programmaticGuardUntilRef.current = 0;
      lastProgrammaticTargetRef.current = null;
      if (pendingRestoreRef.current) {
        cancelPendingRestore();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUserScrollKey(e.key)) {
        programmaticGuardUntilRef.current = 0;
        lastProgrammaticTargetRef.current = null;
        if (pendingRestoreRef.current) {
          cancelPendingRestore();
        }
      }
    };

    el.addEventListener('wheel', handleUserInputIntent, { passive: true });
    el.addEventListener('touchstart', handleUserInputIntent, { passive: true });
    el.addEventListener('pointerdown', handleUserInputIntent, { passive: true });
    el.addEventListener('keydown', handleKeyDown, { passive: true });

    // Observe both the scroll container and its inner content wrapper for async size growth
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (pendingRestoreRef.current?.scopeKey === scopeKey) {
          stepRestore();
        }
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    return () => {
      // Flush any unsaved user scroll belonging ONLY to this departing scope
      flushDirtyWrite();
      el.removeEventListener('wheel', handleUserInputIntent);
      el.removeEventListener('touchstart', handleUserInputIntent);
      el.removeEventListener('pointerdown', handleUserInputIntent);
      el.removeEventListener('keydown', handleKeyDown);
      resizeObserver?.disconnect();
      pendingRestoreRef.current = null;
      stopRestoreLoop();
    };
  }, [
    scopeKey,
    isActiveAndVisible,
    isFilteredView,
    attachSignal,
    maxWaitMs,
    applyProgrammaticScrollTop,
    cancelPendingRestore,
    flushDirtyWrite,
    markScopeReady,
    resolveCurrentTargetTop,
    stepRestore,
    stopRestoreLoop,
  ]);

  const prevTransitioningRef = useRef(isTransitioning);

  // Flush pre-transition user scroll cleanly on transition start, and re-align if
  // browser clamping or text re-wrapping moved target offset while transitioning.
  useEffect(() => {
    const wasTransitioning = prevTransitioningRef.current;
    prevTransitioningRef.current = isTransitioning;

    if (!isActiveAndVisible || isFilteredView) return;

    if (isTransitioning && !wasTransitioning) {
      flushDirtyWrite();
      return;
    }

    if (!isTransitioning) {
      if (pendingRestoreRef.current?.scopeKey === scopeKey) {
        stepRestore();
        return;
      }
      if (wasTransitioning && !dirtyWriteRef.current) {
        const el = getElRef.current();
        if (!el) return;
        const rawTargetTop = normalizeScrollOffset(readRef.current());
        const targetTop = resolveCurrentTargetTop(rawTargetTop);
        const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
        if (targetTop > 0 && Math.abs(el.scrollTop - Math.min(targetTop, maxScrollTop)) > 2) {
          pendingRestoreRef.current = {
            scopeKey,
            rawTargetTop: rawTargetTop > 0 ? rawTargetTop : targetTop,
            targetTop,
            startedAtMs: performance.now(),
            stablePasses: 0,
          };
          applyProgrammaticScrollTop(el, targetTop);
          stepRestore();
        }
      }
    }
  }, [
    scopeKey,
    isActiveAndVisible,
    isFilteredView,
    isTransitioning,
    contentVersion,
    applyProgrammaticScrollTop,
    flushDirtyWrite,
    resolveCurrentTargetTop,
    stepRestore,
  ]);

  // Synchronously derive whether the panel has settled at its initial position
  const persistedTargetTop = normalizeScrollOffset(readRef.current());
  const isPositionReady = resolveInitialPositionReady({
    isActiveAndVisible,
    isFilteredView,
    hasScopeMatch: positionReadyState.scopeKey === scopeKey,
    scopeReady: positionReadyState.ready,
    persistedTargetTop,
  });

  return {
    isPositionReady,
    cancelPendingRestore,
    handleScrollEvent,
    reapplyPendingRestore,
  };
}
