import {
  buildImagesScrollStorageKey,
  buildSidePanelScrollStorageKey,
  normalizeScrollOffset,
  parseScriptScrollPositionsMap,
} from './scriptBibleDockLayout';

export type SidePanelSubKey = 'assets' | 'universe' | 'cards';
export type ImagesViewModeKey = 'sections' | 'timeline';

export type ScrollStorageSpec =
  | { kind: 'script'; projectId: string }
  | { kind: 'sidePanel'; projectId: string; subKey: SidePanelSubKey }
  | { kind: 'images'; projectId: string; viewMode: ImagesViewModeKey };

export interface StorageReadLike {
  getItem: (key: string) => string | null;
}

export interface StorageWriteLike {
  setItem: (key: string, value: string) => void;
}

export interface StorageLike extends StorageReadLike, StorageWriteLike {}

export const SCRIPT_SCROLL_POSITIONS_KEY = 'script_scroll_positions';

export function buildScrollScopeKey(spec: ScrollStorageSpec): string {
  const pid = spec.projectId || 'default';
  if (spec.kind === 'script') {
    return `script:${pid}`;
  }
  if (spec.kind === 'sidePanel') {
    return `sidePanel:${pid}:${spec.subKey}`;
  }
  return `images:${pid}:${spec.viewMode}`;
}

export function buildLegacyImagesScrollStorageKey(
  projectId: string,
  viewMode: ImagesViewModeKey
): string {
  return `script_images_feed_scroll_${projectId || 'default'}_${viewMode}`;
}

export interface ScriptScrollAnchor {
  top: number;
  anchorPos?: number;
  offsetFromBlockTop?: number;
  lineHeight?: number;
}

export function normalizeScriptScrollAnchor(entry: unknown): ScriptScrollAnchor {
  if (typeof entry === 'object' && entry !== null) {
    const obj = entry as {
      top?: unknown;
      anchorPos?: unknown;
      offsetFromBlockTop?: unknown;
      lineHeight?: unknown;
    };
    const top = normalizeScrollOffset(obj.top);
    const anchorPos =
      typeof obj.anchorPos === 'number' && Number.isFinite(obj.anchorPos) && obj.anchorPos >= 0
        ? Math.floor(obj.anchorPos)
        : undefined;
    const offsetFromBlockTop =
      typeof obj.offsetFromBlockTop === 'number' && Number.isFinite(obj.offsetFromBlockTop)
        ? obj.offsetFromBlockTop
        : undefined;
    const lineHeight =
      typeof obj.lineHeight === 'number' && Number.isFinite(obj.lineHeight) && obj.lineHeight > 0
        ? obj.lineHeight
        : undefined;
    return {
      top,
      ...(anchorPos !== undefined ? { anchorPos } : {}),
      ...(offsetFromBlockTop !== undefined ? { offsetFromBlockTop } : {}),
      ...(lineHeight !== undefined ? { lineHeight } : {}),
    };
  }
  return { top: normalizeScrollOffset(entry) };
}

export function parseScriptScrollAnchorsMap(
  raw: string | null
): Record<string, ScriptScrollAnchor> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const cleaned: Record<string, ScriptScrollAnchor> = {};
    for (const key of Object.keys(parsed)) {
      cleaned[key] = normalizeScriptScrollAnchor(parsed[key]);
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function readScriptScrollAnchorFromStorage(
  storage: StorageReadLike | null | undefined,
  projectId: string
): ScriptScrollAnchor {
  if (!storage) return { top: 0 };
  const pid = projectId || 'default';
  try {
    const map = parseScriptScrollAnchorsMap(storage.getItem(SCRIPT_SCROLL_POSITIONS_KEY));
    return map[pid] ?? { top: 0 };
  } catch {
    return { top: 0 };
  }
}

export function writeScriptScrollAnchorToStorage(
  storage: StorageLike | null | undefined,
  projectId: string,
  anchor: ScriptScrollAnchor
): void {
  if (!storage) return;
  const pid = projectId || 'default';
  const normalized = normalizeScriptScrollAnchor(anchor);
  try {
    const raw = storage.getItem(SCRIPT_SCROLL_POSITIONS_KEY);
    let existing: Record<string, unknown> = {};
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        existing = parsed as Record<string, unknown>;
      }
    }
    if (
      normalized.top <= 0 &&
      (normalized.anchorPos === undefined || normalized.anchorPos <= 0)
    ) {
      existing[pid] = 0;
    } else if (normalized.anchorPos !== undefined) {
      existing[pid] = normalized;
    } else {
      existing[pid] = normalized.top;
    }
    storage.setItem(SCRIPT_SCROLL_POSITIONS_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage quota/security errors safely
  }
}

export function resolveCodeMirrorTargetTopFromBlock(params: {
  blockTop: number;
  blockHeight: number;
  offsetFromBlockTop?: number;
  savedLineHeight?: number;
  fallbackTop: number;
  topPadding?: number;
}): number {
  const { blockTop, blockHeight, offsetFromBlockTop, savedLineHeight, fallbackTop } = params;
  const topPadding = params.topPadding ?? 16;
  if (
    typeof offsetFromBlockTop !== 'number' ||
    !Number.isFinite(offsetFromBlockTop) ||
    !Number.isFinite(blockTop)
  ) {
    return normalizeScrollOffset(fallbackTop);
  }
  let adjustedOffset = offsetFromBlockTop;
  if (
    typeof savedLineHeight === 'number' &&
    Number.isFinite(savedLineHeight) &&
    savedLineHeight > 0 &&
    Number.isFinite(blockHeight) &&
    blockHeight > 0 &&
    Math.abs(blockHeight - savedLineHeight) > 4 &&
    adjustedOffset > topPadding
  ) {
    const scrolledIntoLine = adjustedOffset - topPadding;
    const scaled = scrolledIntoLine * (blockHeight / savedLineHeight);
    const maxLineContentScroll = Math.max(0, blockHeight - topPadding);
    adjustedOffset = topPadding + Math.min(scaled, maxLineContentScroll);
  }
  return Math.max(0, Math.round(blockTop + adjustedOffset));
}

export function resolveInitialPositionReady(params: {
  isActiveAndVisible: boolean;
  isFilteredView: boolean;
  hasScopeMatch: boolean;
  scopeReady: boolean;
  persistedTargetTop: number;
}): boolean {
  if (!params.isActiveAndVisible) {
    return false;
  }
  if (params.isFilteredView) {
    return true;
  }
  if (params.hasScopeMatch && params.scopeReady) {
    return true;
  }
  return normalizeScrollOffset(params.persistedTargetTop) <= 0;
}

export function readScrollOffsetFromStorage(
  storage: StorageReadLike | null | undefined,
  spec: ScrollStorageSpec
): number {
  if (!storage) return 0;
  const pid = spec.projectId || 'default';
  try {
    if (spec.kind === 'script') {
      const map = parseScriptScrollPositionsMap(storage.getItem(SCRIPT_SCROLL_POSITIONS_KEY));
      return normalizeScrollOffset(map[pid]);
    }
    if (spec.kind === 'sidePanel') {
      return normalizeScrollOffset(storage.getItem(buildSidePanelScrollStorageKey(pid, spec.subKey)));
    }
    const primary = storage.getItem(buildImagesScrollStorageKey(pid, spec.viewMode));
    if (primary !== null) {
      return normalizeScrollOffset(primary);
    }
    return normalizeScrollOffset(storage.getItem(buildLegacyImagesScrollStorageKey(pid, spec.viewMode)));
  } catch {
    return 0;
  }
}

export function writeScrollOffsetToStorage(
  storage: StorageLike | null | undefined,
  spec: ScrollStorageSpec,
  offset: number
): void {
  if (!storage) return;
  const pid = spec.projectId || 'default';
  const safeOffset = normalizeScrollOffset(offset);
  try {
    if (spec.kind === 'script') {
      const map = parseScriptScrollPositionsMap(storage.getItem(SCRIPT_SCROLL_POSITIONS_KEY));
      map[pid] = safeOffset;
      storage.setItem(SCRIPT_SCROLL_POSITIONS_KEY, JSON.stringify(map));
      return;
    }
    if (spec.kind === 'sidePanel') {
      storage.setItem(buildSidePanelScrollStorageKey(pid, spec.subKey), String(safeOffset));
      return;
    }
    storage.setItem(buildImagesScrollStorageKey(pid, spec.viewMode), String(safeOffset));
  } catch {
    // Ignore storage quota/security errors safely
  }
}

export function resolveProjectScopedRawValue(params: {
  storage: StorageReadLike | null | undefined;
  projectId: string | undefined;
  projectKeyPrefix: string;
  fallbackGlobalKey?: string;
}): string | null {
  if (!params.storage) return null;
  try {
    if (params.projectId) {
      return params.storage.getItem(`${params.projectKeyPrefix}${params.projectId}`);
    }
    if (params.fallbackGlobalKey) {
      return params.storage.getItem(params.fallbackGlobalKey);
    }
    return null;
  } catch {
    return null;
  }
}

export function writeProjectScopedRawValue(params: {
  storage: StorageWriteLike | null | undefined;
  projectId: string | undefined;
  projectKeyPrefix: string;
  value: string;
  globalKey?: string;
}): void {
  if (!params.storage) return;
  try {
    if (params.projectId) {
      params.storage.setItem(`${params.projectKeyPrefix}${params.projectId}`, params.value);
      return;
    }
    if (params.globalKey) {
      params.storage.setItem(params.globalKey, params.value);
    }
  } catch {
    // Ignore storage errors
  }
}

export interface ShouldPersistScrollParams {
  isActiveAndVisible: boolean;
  isTransitioning: boolean;
  isRestoring: boolean;
  isFilteredView: boolean;
  hasPendingRestore: boolean;
  pendingTargetTop: number | null;
  currentScrollTop: number;
  maxScrollTop: number;
}

/**
 * Guards against overwriting saved vertical scroll offsets when a panel is hidden/collapsed,
 * mid-transition, showing a filtered subset, or temporarily clamped by async content/image loading.
 */
export function shouldPersistPanelScroll(params: ShouldPersistScrollParams): boolean {
  if (
    !params.isActiveAndVisible ||
    params.isTransitioning ||
    params.isRestoring ||
    params.isFilteredView
  ) {
    return false;
  }
  if (
    params.hasPendingRestore &&
    typeof params.pendingTargetTop === 'number' &&
    params.pendingTargetTop > 0 &&
    params.currentScrollTop < params.pendingTargetTop - 2 &&
    params.maxScrollTop < params.pendingTargetTop - 2
  ) {
    return false;
  }
  return true;
}

export interface EvaluateRestoreStepParams {
  targetTop: number;
  currentScrollTop: number;
  maxScrollTop: number;
  elapsedMs: number;
  maxWaitMs: number;
  stablePasses: number;
  isTransitioning: boolean;
  requiredStablePasses?: number;
}

export type ScrollRestoreDecision =
  | { action: 'done'; reason: 'zero_target' | 'reached_and_stable' | 'timeout' }
  | {
      action: 'apply_and_wait';
      nextScrollTop: number;
      nextStablePasses: number;
      reason: 'transitioning' | 'waiting_for_height' | 'stabilizing';
    };

/**
 * Pure state-machine step for unified vertical scroll restoration across CodeMirror, asset lists,
 * and async image feeds. Handles width transitions (260ms), IndexedDB load delays, and lazy image decoding.
 */
export function evaluateScrollRestoreStep(
  params: EvaluateRestoreStepParams
): ScrollRestoreDecision {
  const target = normalizeScrollOffset(params.targetTop);
  if (target <= 0) {
    return { action: 'done', reason: 'zero_target' };
  }

  if (params.isTransitioning) {
    return {
      action: 'apply_and_wait',
      nextScrollTop: target,
      nextStablePasses: 0,
      reason: 'transitioning',
    };
  }

  const maxScroll = Math.max(0, Number.isFinite(params.maxScrollTop) ? params.maxScrollTop : 0);
  const currentScroll = Math.max(
    0,
    Number.isFinite(params.currentScrollTop) ? params.currentScrollTop : 0
  );
  const clampedTarget = Math.min(target, maxScroll);
  const reachable = maxScroll >= target - 2;
  const aligned = Math.abs(currentScroll - clampedTarget) <= 2;

  if (params.elapsedMs >= params.maxWaitMs) {
    return { action: 'done', reason: 'timeout' };
  }

  if (!reachable) {
    return {
      action: 'apply_and_wait',
      nextScrollTop: target,
      nextStablePasses: 0,
      reason: 'waiting_for_height',
    };
  }

  if (!aligned) {
    return {
      action: 'apply_and_wait',
      nextScrollTop: target,
      nextStablePasses: 0,
      reason: 'stabilizing',
    };
  }

  const nextStablePasses = params.stablePasses + 1;
  const neededPasses = Math.max(1, params.requiredStablePasses ?? 3);
  if (nextStablePasses >= neededPasses) {
    return { action: 'done', reason: 'reached_and_stable' };
  }

  return {
    action: 'apply_and_wait',
    nextScrollTop: target,
    nextStablePasses,
    reason: 'stabilizing',
  };
}

const USER_SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
]);

export function isUserScrollKey(key: string): boolean {
  return USER_SCROLL_KEYS.has(key);
}
