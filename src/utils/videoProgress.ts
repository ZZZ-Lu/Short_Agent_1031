export interface VideoProgressDisplayInput {
  currentTime?: number | null;
  storedTime: number;
  duration: number;
  stateProgress: number;
  isPlayerMounted: boolean;
  hasRestoredInitialTime: boolean;
  isScrubbing?: boolean;
  scrubTime?: number | null;
}

export interface VideoProgressDisplayResult {
  displayTime: number;
  displayDuration: number;
  progressPercent: number;
}

export interface VideoScrubSeekDecisionInput {
  targetTime: number;
  duration: number;
  videoReadyState: number;
  videoSeeking: boolean;
  lastSeekIssuedAtMs: number;
  nowMs: number;
  preemptionTimeoutMs?: number;
}

export interface VideoScrubSeekDecision {
  action: 'defer-until-metadata' | 'queue-after-seeked' | 'seek-now';
  clampedTime: number;
}

const DURATION_STORAGE_PREFIX = 'mira_vid_dur_';
const PROGRESS_STORAGE_PREFIX = 'mira_vid_pos_';

// Session caches keep progress & duration immediately available across LOD unmounts/remounts
// before React parent state or IndexedDB roundtrips settle.
const sessionVideoDurationCache = new Map<string, number>();
const sessionVideoProgressCache = new Map<string, number>();

export function clampValidVideoDuration(duration: unknown): number {
  return typeof duration === 'number' && Number.isFinite(duration) && duration > 0 ? duration : 0;
}

export function resolveVideoEndResetMargin(duration: number): number {
  const valid = clampValidVideoDuration(duration);
  if (valid <= 0) return 0.4;
  return Math.min(0.25, Math.max(0.05, valid * 0.04));
}

export function computeSeekTimeFromPercent(percent: number, duration: number): number {
  const validDur = clampValidVideoDuration(duration);
  if (validDur <= 0 || !Number.isFinite(percent)) return 0;
  const clampedPct = Math.min(100, Math.max(0, percent));
  return (clampedPct / 100) * validDur;
}

export function clampVideoSeekTargetTime(targetTime: number, duration: number): number {
  if (!Number.isFinite(targetTime) || targetTime <= 0) return 0;
  const validDur = clampValidVideoDuration(duration);
  if (validDur <= 0) return Math.max(0, targetTime);
  // Keep seek target slightly inside duration so HTMLVideoElement does not auto-reset or stall at EOF.
  return Math.min(Math.max(0, targetTime), Math.max(0, validDur - 0.01));
}

/**
 * Coalesces rapid progress-bar scrub events so an in-flight decode frame can finish painting
 * before the next seek is issued, avoiding black/frozen preview during fast slider drags.
 */
export function resolveVideoScrubSeekStep(input: VideoScrubSeekDecisionInput): VideoScrubSeekDecision {
  const clampedTime = clampVideoSeekTargetTime(input.targetTime, input.duration);
  if (!Number.isFinite(input.videoReadyState) || input.videoReadyState < 1) {
    return { action: 'defer-until-metadata', clampedTime };
  }
  const timeout = typeof input.preemptionTimeoutMs === 'number' && input.preemptionTimeoutMs > 0
    ? input.preemptionTimeoutMs
    : 90;
  const elapsed = input.nowMs - input.lastSeekIssuedAtMs;
  if (input.videoSeeking && elapsed >= 0 && elapsed < timeout) {
    return { action: 'queue-after-seeked', clampedTime };
  }
  return { action: 'seek-now', clampedTime };
}

export function resolveVideoProgressDisplay(input: VideoProgressDisplayInput): VideoProgressDisplayResult {
  const displayDuration = clampValidVideoDuration(input.duration);
  const storedTime = typeof input.storedTime === 'number' && Number.isFinite(input.storedTime) && input.storedTime >= 0
    ? input.storedTime
    : 0;
  const rawCurrentTime = typeof input.currentTime === 'number' && Number.isFinite(input.currentTime) && input.currentTime >= 0
    ? input.currentTime
    : null;

  if (input.isScrubbing) {
    const clampedProgress = typeof input.stateProgress === 'number' && Number.isFinite(input.stateProgress)
      ? Math.min(100, Math.max(0, input.stateProgress))
      : 0;
    const explicitScrubTime =
      typeof input.scrubTime === 'number' && Number.isFinite(input.scrubTime) && input.scrubTime >= 0
        ? input.scrubTime
        : displayDuration > 0
          ? computeSeekTimeFromPercent(clampedProgress, displayDuration)
          : storedTime;
    return {
      displayTime: explicitScrubTime,
      displayDuration,
      progressPercent: clampedProgress,
    };
  }

  // Before an active <video> element finishes its initial seek to storedTime, avoid flashing 0:00.
  const useLiveCurrentTime =
    input.isPlayerMounted &&
    rawCurrentTime !== null &&
    (input.hasRestoredInitialTime || rawCurrentTime > 0.05 || storedTime <= 0.05);

  const displayTime = useLiveCurrentTime ? rawCurrentTime! : storedTime;

  let progressPercent = 0;
  if (displayDuration > 0 && displayTime > 0) {
    progressPercent = Math.min(100, Math.max(0, (displayTime / displayDuration) * 100));
  } else if (displayDuration > 0 && useLiveCurrentTime && displayTime === 0) {
    progressPercent = 0;
  } else if (typeof input.stateProgress === 'number' && Number.isFinite(input.stateProgress) && input.stateProgress > 0) {
    progressPercent = Math.min(100, Math.max(0, input.stateProgress));
  }

  return {
    displayTime,
    displayDuration,
    progressPercent,
  };
}

export function getCachedVideoDuration(cardId: string, cardDuration?: number): number {
  const fromProp = clampValidVideoDuration(cardDuration);
  if (fromProp > 0) {
    sessionVideoDurationCache.set(cardId, fromProp);
    return fromProp;
  }
  const fromMemory = sessionVideoDurationCache.get(cardId);
  if (fromMemory && fromMemory > 0) return fromMemory;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(`${DURATION_STORAGE_PREFIX}${cardId}`);
      if (raw !== null) {
        const parsed = clampValidVideoDuration(parseFloat(raw));
        if (parsed > 0) {
          sessionVideoDurationCache.set(cardId, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
  }
  return 0;
}

export function setCachedVideoDuration(cardId: string, duration: number): number {
  const valid = clampValidVideoDuration(duration);
  if (!cardId || valid <= 0) return 0;
  sessionVideoDurationCache.set(cardId, valid);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(`${DURATION_STORAGE_PREFIX}${cardId}`, valid.toFixed(3));
    } catch {
      // Ignore quota/storage errors
    }
  }
  return valid;
}

export function getCachedVideoProgress(cardId: string, cardCurrentTime?: number): number {
  if (typeof window !== 'undefined') {
    try {
      const local = window.localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${cardId}`);
      if (local !== null) {
        const parsed = parseFloat(local);
        if (Number.isFinite(parsed) && parsed >= 0) {
          sessionVideoProgressCache.set(cardId, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
  }
  if (sessionVideoProgressCache.has(cardId)) {
    const fromMemory = sessionVideoProgressCache.get(cardId);
    if (typeof fromMemory === 'number' && Number.isFinite(fromMemory) && fromMemory >= 0) {
      return fromMemory;
    }
  }
  return typeof cardCurrentTime === 'number' && Number.isFinite(cardCurrentTime) && cardCurrentTime > 0
    ? cardCurrentTime
    : 0;
}

export function setCachedVideoProgress(
  cardId: string,
  time: number,
  options?: { force?: boolean }
): void {
  if (!cardId || !Number.isFinite(time)) return;
  const force = Boolean(options?.force);
  if (!force) {
    if (time <= 0.1) return;
    const existing = getCachedVideoProgress(cardId, 0);
    // Protect established progress against uninitialized 0s mount states.
    if (existing > 0.5 && time <= 0.2) return;
  }
  const normalized = Math.max(0, time);
  sessionVideoProgressCache.set(cardId, normalized);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${cardId}`, normalized.toFixed(2));
    } catch {
      // Ignore quota/storage errors
    }
  }
}

export function clearCachedVideoProgress(cardId: string): void {
  if (!cardId) return;
  sessionVideoProgressCache.delete(cardId);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(`${PROGRESS_STORAGE_PREFIX}${cardId}`);
    } catch {
      // Ignore storage access restrictions
    }
  }
}
