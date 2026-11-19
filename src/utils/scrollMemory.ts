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

export interface ImagesScrollAnchor {
  top: number;
  anchorKey?: string;
  offsetRatio?: number;
  offsetPx?: number;
  offsetAfterItemBottomPx?: number;
  savedItemHeight?: number;
  scrollRatio?: number;
}

export interface ImagesFeedAnchorItemLayout {
  key: string;
  top: number;
  height: number;
}

export function normalizeImagesScrollAnchor(entry: unknown): ImagesScrollAnchor {
  if (typeof entry === 'object' && entry !== null) {
    const obj = entry as {
      top?: unknown;
      anchorKey?: unknown;
      offsetRatio?: unknown;
      offsetPx?: unknown;
      offsetAfterItemBottomPx?: unknown;
      savedItemHeight?: unknown;
      scrollRatio?: unknown;
    };
    const top = normalizeScrollOffset(obj.top);
    const anchorKey =
      typeof obj.anchorKey === 'string' && obj.anchorKey.trim().length > 0
        ? obj.anchorKey
        : undefined;
    const offsetRatio =
      typeof obj.offsetRatio === 'number' && Number.isFinite(obj.offsetRatio)
        ? Math.min(1, Math.max(0, obj.offsetRatio))
        : undefined;
    const offsetPx =
      typeof obj.offsetPx === 'number' && Number.isFinite(obj.offsetPx)
        ? Math.round(obj.offsetPx)
        : undefined;
    const offsetAfterItemBottomPx =
      typeof obj.offsetAfterItemBottomPx === 'number' &&
      Number.isFinite(obj.offsetAfterItemBottomPx) &&
      obj.offsetAfterItemBottomPx >= 0
        ? Math.round(obj.offsetAfterItemBottomPx)
        : undefined;
    const savedItemHeight =
      typeof obj.savedItemHeight === 'number' &&
      Number.isFinite(obj.savedItemHeight) &&
      obj.savedItemHeight > 0
        ? Math.round(obj.savedItemHeight)
        : undefined;
    const scrollRatio =
      typeof obj.scrollRatio === 'number' && Number.isFinite(obj.scrollRatio)
        ? Math.min(1, Math.max(0, obj.scrollRatio))
        : undefined;
    return {
      top,
      ...(anchorKey !== undefined ? { anchorKey } : {}),
      ...(offsetRatio !== undefined ? { offsetRatio } : {}),
      ...(offsetPx !== undefined ? { offsetPx } : {}),
      ...(offsetAfterItemBottomPx !== undefined ? { offsetAfterItemBottomPx } : {}),
      ...(savedItemHeight !== undefined ? { savedItemHeight } : {}),
      ...(scrollRatio !== undefined ? { scrollRatio } : {}),
    };
  }
  return { top: normalizeScrollOffset(entry) };
}

function parseRawImagesScrollAnchor(raw: string | null): ImagesScrollAnchor | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return { top: 0 };
  if (trimmed.startsWith('{')) {
    try {
      return normalizeImagesScrollAnchor(JSON.parse(trimmed));
    } catch {
      return { top: 0 };
    }
  }
  return { top: normalizeScrollOffset(trimmed) };
}

export function readImagesScrollAnchorFromStorage(
  storage: StorageReadLike | null | undefined,
  projectId: string,
  viewMode: ImagesViewModeKey
): ImagesScrollAnchor {
  if (!storage) return { top: 0 };
  const pid = projectId || 'default';
  try {
    const primary = parseRawImagesScrollAnchor(
      storage.getItem(buildImagesScrollStorageKey(pid, viewMode))
    );
    if (primary !== null) {
      return primary;
    }
    const legacy = parseRawImagesScrollAnchor(
      storage.getItem(buildLegacyImagesScrollStorageKey(pid, viewMode))
    );
    return legacy ?? { top: 0 };
  } catch {
    return { top: 0 };
  }
}

export function writeImagesScrollAnchorToStorage(
  storage: StorageWriteLike | null | undefined,
  projectId: string,
  viewMode: ImagesViewModeKey,
  anchor: ImagesScrollAnchor
): void {
  if (!storage) return;
  const pid = projectId || 'default';
  const normalized = normalizeImagesScrollAnchor(anchor);
  try {
    const storageKey = buildImagesScrollStorageKey(pid, viewMode);
    if (normalized.top <= 0 && !normalized.anchorKey) {
      storage.setItem(storageKey, '0');
      return;
    }
    if (normalized.anchorKey !== undefined || normalized.scrollRatio !== undefined) {
      storage.setItem(storageKey, JSON.stringify(normalized));
      return;
    }
    storage.setItem(storageKey, String(normalized.top));
  } catch {
    // Ignore storage quota/security errors safely
  }
}

/**
 * Pure vertical anchor capture for the asset image feed.
 * Anchors the viewport top edge to the intersecting item's proportional offset (`offsetRatio`),
 * or to a fixed pixel gap above the next item (`offsetPx < 0`) so toggling default/wide widths
 * preserves the exact visual viewing position across height reflows.
 */
export function computeImagesScrollAnchorFromLayout(params: {
  scrollTop: number;
  maxScrollTop: number;
  items: ImagesFeedAnchorItemLayout[];
}): ImagesScrollAnchor {
  const safeTop = normalizeScrollOffset(params.scrollTop);
  const safeMaxScroll = normalizeScrollOffset(params.maxScrollTop);
  if (safeTop <= 0) {
    return { top: 0 };
  }

  const scrollRatio =
    safeMaxScroll > 0 ? Math.min(1, Math.max(0, safeTop / safeMaxScroll)) : undefined;

  const validItems = params.items
    .filter(
      (item) =>
        typeof item.key === 'string' &&
        item.key.length > 0 &&
        Number.isFinite(item.top) &&
        Number.isFinite(item.height) &&
        item.height > 0
    )
    .slice()
    .sort((a, b) => a.top - b.top);

  if (validItems.length === 0) {
    return {
      top: safeTop,
      ...(scrollRatio !== undefined ? { scrollRatio } : {}),
    };
  }

  // 1. Viewport top intersects an item directly
  for (let i = 0; i < validItems.length; i += 1) {
    const item = validItems[i];
    if (safeTop >= item.top && safeTop < item.top + item.height) {
      const rawOffset = safeTop - item.top;
      const offsetRatio = Math.min(0.999999, Math.max(0, rawOffset / item.height));
      return {
        top: safeTop,
        anchorKey: item.key,
        offsetRatio,
        offsetPx: Math.round(rawOffset),
        savedItemHeight: Math.round(item.height),
        ...(scrollRatio !== undefined ? { scrollRatio } : {}),
      };
    }
  }

  // 2. Viewport top sits in a fixed-height gap or section header directly above the next item
  const nextItem = validItems.find((item) => item.top > safeTop);
  if (nextItem) {
    return {
      top: safeTop,
      anchorKey: nextItem.key,
      offsetPx: Math.round(safeTop - nextItem.top),
      savedItemHeight: Math.round(nextItem.height),
      ...(scrollRatio !== undefined ? { scrollRatio } : {}),
    };
  }

  // 3. Viewport top sits in bottom padding below the final item
  const lastItem = validItems[validItems.length - 1];
  return {
    top: safeTop,
    anchorKey: lastItem.key,
    offsetAfterItemBottomPx: Math.max(0, Math.round(safeTop - (lastItem.top + lastItem.height))),
    savedItemHeight: Math.round(lastItem.height),
    ...(scrollRatio !== undefined ? { scrollRatio } : {}),
  };
}

/**
 * Pure vertical target resolution for the asset image feed.
 * Resolves the saved ImagesScrollAnchor against the current layout geometry (after width change,
 * expand, or reload) and returns the target scrollTop clamped to `[0, maxScrollTop]`.
 */
export function resolveImagesTargetTopFromAnchor(params: {
  anchor: ImagesScrollAnchor;
  maxScrollTop: number;
  items: ImagesFeedAnchorItemLayout[];
}): number {
  const anchor = normalizeImagesScrollAnchor(params.anchor);
  const safeFallback = normalizeScrollOffset(anchor.top);
  const safeMaxScroll = Math.max(
    0,
    Number.isFinite(params.maxScrollTop) ? Math.round(params.maxScrollTop) : 0
  );

  if (safeFallback <= 0 && !anchor.anchorKey) {
    return 0;
  }

  const clampTarget = (value: number): number => {
    const rounded = Math.max(0, Math.round(value));
    return safeMaxScroll > 0 ? Math.min(safeMaxScroll, rounded) : 0;
  };

  const matchedItem = anchor.anchorKey
    ? params.items.find(
        (item) =>
          item.key === anchor.anchorKey &&
          Number.isFinite(item.top) &&
          Number.isFinite(item.height) &&
          item.height > 0
      )
    : undefined;

  if (matchedItem) {
    let rawTarget: number;
    if (typeof anchor.offsetAfterItemBottomPx === 'number') {
      rawTarget = matchedItem.top + matchedItem.height + anchor.offsetAfterItemBottomPx;
    } else if (typeof anchor.offsetPx === 'number' && anchor.offsetPx < 0) {
      rawTarget = matchedItem.top + anchor.offsetPx;
    } else if (
      typeof anchor.savedItemHeight === 'number' &&
      Math.abs(matchedItem.height - anchor.savedItemHeight) <= 2 &&
      typeof anchor.offsetPx === 'number'
    ) {
      rawTarget = matchedItem.top + anchor.offsetPx;
    } else if (typeof anchor.offsetRatio === 'number') {
      rawTarget = matchedItem.top + anchor.offsetRatio * matchedItem.height;
    } else if (typeof anchor.offsetPx === 'number') {
      rawTarget = matchedItem.top + anchor.offsetPx;
    } else {
      rawTarget = matchedItem.top;
    }
    return clampTarget(rawTarget);
  }

  if (typeof anchor.scrollRatio === 'number' && safeMaxScroll > 0) {
    return clampTarget(anchor.scrollRatio * safeMaxScroll);
  }

  return safeMaxScroll > 0 ? Math.min(safeMaxScroll, safeFallback) : safeFallback;
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
    return readImagesScrollAnchorFromStorage(storage, pid, spec.viewMode).top;
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
