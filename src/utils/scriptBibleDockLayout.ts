export interface DockPanelLayout {
  expanded: boolean;
  left: number;
  width: number;
  height: number;
  maxWidth: number;
  zIndex: number;
  miniAlign?: 'left' | 'right' | 'center';
}

export interface ScriptBibleDockLayoutInput {
  isScriptExpanded: boolean;
  isAssetsExpanded: boolean;
  isImagesExpanded: boolean;
  isImagesWide?: boolean;
  viewportWidth: number;
  viewportHeight?: number;
  hoveredMiniPanel?: 'script' | 'assets' | 'images' | null;
  miniCardClientX?: number | null;
}

export interface ScriptBibleDockLayout {
  script: DockPanelLayout;
  assets: DockPanelLayout;
  images: DockPanelLayout;
}

const EDGE_MARGIN = 16;
const TOP_OFFSET = 58;
const PANEL_GAP = 14;
const MINI_WIDTH = 60;
const MINI_HEIGHT = 112;
const MINI_OVERLAP = 22;
const MINI_EXPOSED = MINI_WIDTH - MINI_OVERLAP; // 38px exposed edge

export function computeScriptBibleDockLayout({
  isScriptExpanded,
  isAssetsExpanded,
  isImagesExpanded,
  isImagesWide = false,
  viewportWidth,
  viewportHeight = 900,
  hoveredMiniPanel = null,
  miniCardClientX: _miniCardClientX = null,
}: ScriptBibleDockLayoutInput): ScriptBibleDockLayout {
  const safeViewport = Math.max(420, viewportWidth || 1440);
  const safeViewportHeight = Math.max(320, viewportHeight || 900);
  const expandedHeight = Math.max(240, Math.round(safeViewportHeight - TOP_OFFSET - EDGE_MARGIN));
  const expandedCount =
    (isScriptExpanded ? 1 : 0) +
    (isAssetsExpanded ? 1 : 0) +
    (isImagesExpanded ? 1 : 0);

  // Uniform target width across all 3 workspace cards; wide images mode expands up to 880px safely
  const UNIFORM_CARD_WIDTH = 480;
  const WIDE_IMAGES_CARD_WIDTH = 880;
  const MIN_CARD_WIDTH = 240;

  // Budget horizontal space: collapsed cards tuck partially behind neighbors (38px exposed per tucked card)
  const collapsedCount = 3 - expandedCount;
  let reservedCollapsedWidth = 0;
  if (expandedCount === 0) {
    reservedCollapsedWidth = MINI_WIDTH + 2 * MINI_EXPOSED;
  } else {
    reservedCollapsedWidth = collapsedCount * MINI_EXPOSED;
  }
  const gapBudget =
    (isScriptExpanded && isAssetsExpanded ? PANEL_GAP : 0) +
    (isAssetsExpanded && isImagesExpanded ? PANEL_GAP : 0) +
    (isScriptExpanded && !isAssetsExpanded && isImagesExpanded ? PANEL_GAP : 0);

  const availableExpandedWidth = Math.max(
    MIN_CARD_WIDTH * Math.max(1, expandedCount),
    safeViewport - EDGE_MARGIN * 2 - reservedCollapsedWidth - gapBudget
  );

  const otherExpandedCount = (isScriptExpanded ? 1 : 0) + (isAssetsExpanded ? 1 : 0);
  const imagesTargetWidth = isImagesExpanded && isImagesWide ? WIDE_IMAGES_CARD_WIDTH : UNIFORM_CARD_WIDTH;

  let otherExpandedWidth = UNIFORM_CARD_WIDTH;
  let imagesExpandedWidth = imagesTargetWidth;

  if (isImagesExpanded && isImagesWide) {
    const rawSum = otherExpandedCount * UNIFORM_CARD_WIDTH + WIDE_IMAGES_CARD_WIDTH;
    if (rawSum > availableExpandedWidth && rawSum > 0) {
      const scaleFactor = availableExpandedWidth / rawSum;
      otherExpandedWidth = Math.max(MIN_CARD_WIDTH, Math.floor(UNIFORM_CARD_WIDTH * scaleFactor));
      const remainingForImages = availableExpandedWidth - otherExpandedCount * otherExpandedWidth;
      imagesExpandedWidth = Math.max(MIN_CARD_WIDTH, Math.min(WIDE_IMAGES_CARD_WIDTH, remainingForImages));
    }
  } else {
    const rawExpandedSum = expandedCount * UNIFORM_CARD_WIDTH;
    const scaleFactor =
      rawExpandedSum > availableExpandedWidth && rawExpandedSum > 0
        ? availableExpandedWidth / rawExpandedSum
        : 1;
    otherExpandedWidth = Math.max(MIN_CARD_WIDTH, Math.floor(UNIFORM_CARD_WIDTH * scaleFactor));
    imagesExpandedWidth = otherExpandedWidth;
  }

  const scriptWidth = isScriptExpanded ? otherExpandedWidth : MINI_WIDTH;
  const assetsWidth = isAssetsExpanded ? otherExpandedWidth : MINI_WIDTH;
  const imagesWidth = isImagesExpanded ? imagesExpandedWidth : MINI_WIDTH;

  // Compute left positions and z-ordering so collapsed mini-cards stack with partial overlap
  // and always tuck behind any adjacent expanded big card.
  let scriptLeft = EDGE_MARGIN;
  let assetsLeft = EDGE_MARGIN;
  let imagesLeft = EDGE_MARGIN;

  let scriptZ = isScriptExpanded ? 50 : 42;
  let assetsZ = isAssetsExpanded ? 50 : 42;
  let imagesZ = isImagesExpanded ? 50 : 42;

  let scriptAlign: 'left' | 'right' | 'center' = 'center';
  let assetsAlign: 'left' | 'right' | 'center' = 'center';
  let imagesAlign: 'left' | 'right' | 'center' = 'center';

  if (expandedCount === 0) {
    // (C, C, C): cascade front-to-back left-to-right (script > assets > images)
    scriptLeft = EDGE_MARGIN;
    assetsLeft = scriptLeft + MINI_EXPOSED;
    imagesLeft = assetsLeft + MINI_EXPOSED;
    scriptZ = 43;
    assetsZ = 42;
    imagesZ = 41;
    scriptAlign = 'center';
    assetsAlign = 'right';
    imagesAlign = 'right';
  } else if (isScriptExpanded) {
    // Script expanded at left
    scriptLeft = EDGE_MARGIN;
    scriptZ = 50;

    if (isAssetsExpanded) {
      // (E, E, E) or (E, E, C)
      assetsLeft = scriptLeft + scriptWidth + PANEL_GAP;
      assetsZ = 50;
      if (isImagesExpanded) {
        imagesLeft = assetsLeft + assetsWidth + PANEL_GAP;
        imagesZ = 50;
      } else {
        // Tuck images behind assets' right edge
        imagesLeft = assetsLeft + assetsWidth - MINI_OVERLAP;
        imagesZ = 42;
        imagesAlign = 'right';
      }
    } else {
      // Assets collapsed behind script's right edge
      assetsLeft = scriptLeft + scriptWidth - MINI_OVERLAP;
      assetsZ = 42;
      assetsAlign = 'right';
      if (isImagesExpanded) {
        // (E, C, E): images sits after assets' exposed right edge
        imagesLeft = assetsLeft + MINI_WIDTH + PANEL_GAP;
        imagesZ = 50;
      } else {
        // (E, C, C): images tucks behind assets' right edge
        imagesLeft = assetsLeft + MINI_EXPOSED;
        imagesZ = 41;
        imagesAlign = 'right';
      }
    }
  } else {
    // Script is collapsed on the left while at least one card to its right is expanded
    if (isAssetsExpanded) {
      // (C, E, E) or (C, E, C): script tucks behind assets' left edge
      scriptLeft = EDGE_MARGIN;
      scriptZ = 42;
      scriptAlign = 'left';

      assetsLeft = scriptLeft + MINI_EXPOSED;
      assetsZ = 50;

      if (isImagesExpanded) {
        imagesLeft = assetsLeft + assetsWidth + PANEL_GAP;
        imagesZ = 50;
      } else {
        imagesLeft = assetsLeft + assetsWidth - MINI_OVERLAP;
        imagesZ = 42;
        imagesAlign = 'right';
      }
    } else {
      // (C, C, E): script & assets cascade left-to-right behind images
      scriptLeft = EDGE_MARGIN;
      scriptZ = 41;
      scriptAlign = 'left';

      assetsLeft = scriptLeft + MINI_EXPOSED;
      assetsZ = 42;
      assetsAlign = 'left';

      imagesLeft = assetsLeft + MINI_EXPOSED;
      imagesZ = 50;
    }
  }

  // Hover peek feedback: slide tucked card outward slightly and bring forward cleanly
  if (!isScriptExpanded && hoveredMiniPanel === 'script') {
    scriptLeft = scriptAlign === 'left' ? Math.max(8, scriptLeft - 6) : scriptLeft;
    scriptZ = 52;
  }
  if (!isAssetsExpanded && hoveredMiniPanel === 'assets') {
    if (assetsAlign === 'right') {
      assetsLeft += 14;
    } else if (assetsAlign === 'left') {
      assetsLeft = Math.max(8, assetsLeft - 6);
    }
    assetsZ = 52;
  }
  if (!isImagesExpanded && hoveredMiniPanel === 'images') {
    if (imagesAlign === 'right') {
      imagesLeft += 14;
    }
    imagesZ = 52;
  }

  const script: DockPanelLayout = {
    expanded: isScriptExpanded,
    left: scriptLeft,
    width: scriptWidth,
    height: isScriptExpanded ? expandedHeight : MINI_HEIGHT,
    ...(isScriptExpanded ? {} : { miniAlign: scriptAlign }),
    maxWidth: Math.max(MIN_CARD_WIDTH, safeViewport - EDGE_MARGIN * 2),
    zIndex: scriptZ,
  };

  const assets: DockPanelLayout = {
    expanded: isAssetsExpanded,
    left: assetsLeft,
    width: assetsWidth,
    height: isAssetsExpanded ? expandedHeight : MINI_HEIGHT,
    ...(isAssetsExpanded ? {} : { miniAlign: assetsAlign }),
    maxWidth: Math.max(MIN_CARD_WIDTH, safeViewport - assetsLeft - EDGE_MARGIN),
    zIndex: assetsZ,
  };

  const images: DockPanelLayout = {
    expanded: isImagesExpanded,
    left: imagesLeft,
    width: imagesWidth,
    height: isImagesExpanded ? expandedHeight : MINI_HEIGHT,
    ...(isImagesExpanded ? {} : { miniAlign: imagesAlign }),
    maxWidth: Math.max(MIN_CARD_WIDTH, safeViewport - imagesLeft - EDGE_MARGIN),
    zIndex: imagesZ,
  };

  return { script, assets, images };
}

export type DockPanelKey = 'script' | 'assets' | 'images';

export type WidthTransitionPhase = 'idle' | 'fade-out' | 'resizing' | 'reveal';

export type DockPanelAction = 'none' | 'resize' | 'expand' | 'collapse';

export interface DockVisualState {
  isScriptExpanded: boolean;
  isAssetsExpanded: boolean;
  isImagesExpanded: boolean;
  isImagesWide: boolean;
}

export interface PanelWidthTransitionMeta {
  frozenWidth: number | null;
  opacity: number;
  hidden: boolean;
  fadeDurationMs: number;
  mountExpandedContent: boolean;
  miniOpacity: number;
  miniHidden: boolean;
}

export type DockWidthTransitionPanels = Record<DockPanelKey, PanelWidthTransitionMeta>;

export const WIDTH_TRANSITION_TIMINGS = {
  fadeOutMs: 95,
  shellResizeMs: 260,
  revealStaggerMs: 55,
  fadeInMs: 140,
} as const;

export function createIdleWidthTransitionPanels(): DockWidthTransitionPanels {
  return {
    script: {
      frozenWidth: null,
      opacity: 1,
      hidden: false,
      fadeDurationMs: 0,
      mountExpandedContent: true,
      miniOpacity: 1,
      miniHidden: false,
    },
    assets: {
      frozenWidth: null,
      opacity: 1,
      hidden: false,
      fadeDurationMs: 0,
      mountExpandedContent: true,
      miniOpacity: 1,
      miniHidden: false,
    },
    images: {
      frozenWidth: null,
      opacity: 1,
      hidden: false,
      fadeDurationMs: 0,
      mountExpandedContent: true,
      miniOpacity: 1,
      miniHidden: false,
    },
  };
}

export interface WidthTransitionPlan {
  hasAnyAffected: boolean;
  affectedPanels: Record<DockPanelKey, boolean>;
  frozenWidths: Record<DockPanelKey, number | null>;
  revealOrder: DockPanelKey[];
}

export interface DockTransitionPlan extends WidthTransitionPlan {
  actions: Record<DockPanelKey, DockPanelAction>;
}

const PANEL_ORDER: DockPanelKey[] = ['images', 'assets', 'script'];

/**
 * Classifies every panel transition across expand, collapse, and width-change operations so
 * inner DOM freezes/unmounts cleanly before outer shell resizing ("用时间换帧数").
 */
export function buildDockTransitionPlan(params: {
  prevLayout: ScriptBibleDockLayout;
  nextLayout: ScriptBibleDockLayout;
}): DockTransitionPlan {
  const { prevLayout, nextLayout } = params;
  const actions: Record<DockPanelKey, DockPanelAction> = {
    script: 'none',
    assets: 'none',
    images: 'none',
  };
  const affectedPanels: Record<DockPanelKey, boolean> = {
    script: false,
    assets: false,
    images: false,
  };
  const frozenWidths: Record<DockPanelKey, number | null> = {
    script: null,
    assets: null,
    images: null,
  };
  const revealOrder: DockPanelKey[] = [];

  for (const key of PANEL_ORDER) {
    const prev = prevLayout[key];
    const next = nextLayout[key];

    if (!prev.expanded && next.expanded) {
      actions[key] = 'expand';
      affectedPanels[key] = true;
      frozenWidths[key] = null;
      revealOrder.push(key);
    } else if (prev.expanded && !next.expanded) {
      actions[key] = 'collapse';
      affectedPanels[key] = true;
      frozenWidths[key] = prev.width;
      revealOrder.push(key);
    } else if (prev.expanded && next.expanded && prev.width !== next.width) {
      actions[key] = 'resize';
      affectedPanels[key] = true;
      frozenWidths[key] = prev.width;
      revealOrder.push(key);
    }
  }

  return {
    hasAnyAffected: revealOrder.length > 0,
    actions,
    affectedPanels,
    frozenWidths,
    revealOrder,
  };
}

/**
 * Backward-compatible alias for width-only transition planning (and full expand/collapse/resize).
 */
export function buildWidthTransitionPlan(params: {
  prevLayout: ScriptBibleDockLayout;
  nextLayout: ScriptBibleDockLayout;
}): WidthTransitionPlan {
  const plan = buildDockTransitionPlan(params);
  return {
    hasAnyAffected: plan.hasAnyAffected,
    affectedPanels: plan.affectedPanels,
    frozenWidths: plan.frozenWidths,
    revealOrder: plan.revealOrder,
  };
}

export function buildDockTransitionPhase1(plan: DockTransitionPlan): DockWidthTransitionPanels {
  const next = createIdleWidthTransitionPanels();
  for (const key of PANEL_ORDER) {
    const action = plan.actions[key];
    if (action === 'expand') {
      next[key] = {
        frozenWidth: null,
        opacity: 1,
        hidden: false,
        fadeDurationMs: WIDTH_TRANSITION_TIMINGS.fadeOutMs,
        mountExpandedContent: false,
        miniOpacity: 0,
        miniHidden: false,
      };
    } else if (action === 'collapse' || action === 'resize') {
      next[key] = {
        frozenWidth: plan.frozenWidths[key],
        opacity: 0,
        hidden: false,
        fadeDurationMs: WIDTH_TRANSITION_TIMINGS.fadeOutMs,
        mountExpandedContent: true,
        miniOpacity: 1,
        miniHidden: false,
      };
    }
  }
  return next;
}

export function buildDockTransitionPhase2(
  prev: DockWidthTransitionPanels,
  plan: DockTransitionPlan
): DockWidthTransitionPanels {
  const next: DockWidthTransitionPanels = { ...prev };
  for (const key of PANEL_ORDER) {
    const action = plan.actions[key];
    if (action === 'expand') {
      next[key] = {
        ...prev[key],
        frozenWidth: null,
        opacity: 0,
        hidden: true,
        fadeDurationMs: 0,
        mountExpandedContent: false,
        miniOpacity: 0,
        miniHidden: true,
      };
    } else if (action === 'collapse') {
      next[key] = {
        ...prev[key],
        frozenWidth: null,
        opacity: 0,
        hidden: true,
        fadeDurationMs: 0,
        mountExpandedContent: false,
        miniOpacity: 0,
        miniHidden: true,
      };
    } else if (action === 'resize') {
      next[key] = {
        ...prev[key],
        opacity: 0,
        hidden: true,
        fadeDurationMs: 0,
        mountExpandedContent: true,
      };
    }
  }
  return next;
}

export function buildDockTransitionPhase3Prepare(
  prev: DockWidthTransitionPanels,
  key: DockPanelKey,
  action: DockPanelAction
): DockWidthTransitionPanels {
  if (action === 'expand' || action === 'resize') {
    return {
      ...prev,
      [key]: {
        frozenWidth: null,
        opacity: 0,
        hidden: false,
        fadeDurationMs: 0,
        mountExpandedContent: true,
        miniOpacity: 1,
        miniHidden: false,
      },
    };
  }
  if (action === 'collapse') {
    return {
      ...prev,
      [key]: {
        frozenWidth: null,
        opacity: 1,
        hidden: false,
        fadeDurationMs: 0,
        mountExpandedContent: false,
        miniOpacity: 0,
        miniHidden: false,
      },
    };
  }
  return prev;
}

export function buildDockTransitionPhase3Reveal(
  prev: DockWidthTransitionPanels,
  key: DockPanelKey,
  action: DockPanelAction
): DockWidthTransitionPanels {
  if (action === 'expand' || action === 'resize') {
    return {
      ...prev,
      [key]: {
        ...prev[key],
        frozenWidth: null,
        opacity: 1,
        hidden: false,
        fadeDurationMs: WIDTH_TRANSITION_TIMINGS.fadeInMs,
        mountExpandedContent: true,
      },
    };
  }
  if (action === 'collapse') {
    return {
      ...prev,
      [key]: {
        ...prev[key],
        miniOpacity: 1,
        miniHidden: false,
        fadeDurationMs: WIDTH_TRANSITION_TIMINGS.fadeInMs,
      },
    };
  }
  return prev;
}

export function normalizeScrollOffset(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 0;
}

export function buildImagesScrollStorageKey(projectId: string, viewMode: 'sections' | 'timeline'): string {
  return `script_images_panel_scroll_${projectId}_${viewMode}`;
}

export function buildSidePanelScrollStorageKey(
  projectId: string,
  panel: 'assets' | 'universe' | 'cards'
): string {
  return `script_side_panel_scroll_${projectId}_${panel}`;
}

export function parseScriptScrollPositionsMap(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const cleaned: Record<string, number> = {};
    for (const key of Object.keys(parsed)) {
      const entry = parsed[key];
      const numeric =
        typeof entry === 'object' && entry !== null && 'top' in entry
          ? (entry as { top?: unknown }).top
          : entry;
      cleaned[key] = normalizeScrollOffset(numeric);
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function shouldPersistImagesFeedScroll(params: {
  isRestoringScroll: boolean;
  isProgrammaticScroll: boolean;
  isTransitionHidden: boolean;
  shouldMountExpandedContent: boolean;
  onlyShowActiveAsset: boolean;
  pendingTargetTop?: number | null;
  currentScrollTop?: number;
  maxScrollTop?: number;
}): boolean {
  if (
    params.isRestoringScroll ||
    params.isProgrammaticScroll ||
    params.isTransitionHidden ||
    !params.shouldMountExpandedContent ||
    params.onlyShowActiveAsset
  ) {
    return false;
  }
  if (
    typeof params.pendingTargetTop === 'number' &&
    params.pendingTargetTop > 0 &&
    typeof params.currentScrollTop === 'number' &&
    typeof params.maxScrollTop === 'number'
  ) {
    // While a pending restore is still waiting for async cards/images to expand scrollHeight,
    // never overwrite the saved target with a browser-clamped scrollTop.
    if (
      params.currentScrollTop < params.pendingTargetTop - 2 &&
      params.maxScrollTop < params.pendingTargetTop - 2
    ) {
      return false;
    }
  }
  return true;
}

export function shouldReapplyPendingImageScroll(params: {
  pendingKey: string | null | undefined;
  currentKey: string;
  targetTop: number;
  nowMs: number;
  expiresAtMs: number;
  onlyShowActiveAsset: boolean;
}): boolean {
  if (params.onlyShowActiveAsset) return false;
  if (!params.pendingKey || params.pendingKey !== params.currentKey) return false;
  if (!(params.targetTop > 0)) return false;
  return params.nowMs < params.expiresAtMs;
}

export function shouldForceExpandScriptOnRequestedViewChange(params: {
  prevRequestedView: string;
  nextRequestedView: string;
  isInitialMount?: boolean;
}): boolean {
  if (params.nextRequestedView === 'directory') {
    return true;
  }
  if (params.isInitialMount || params.prevRequestedView === params.nextRequestedView) {
    return false;
  }
  return params.nextRequestedView === 'script';
}

/**
 * Pure helper that computes the rightmost horizontal coordinate (in screen/viewport px)
 * occupied by the Script Bible dock cards on the left side of the viewport.
 */
export function resolveDockOccupiedRightEdge(
  dockLayout: ScriptBibleDockLayout,
  includeSidePanels: boolean = true
): number {
  const scriptRight = dockLayout.script.left + dockLayout.script.width;
  if (!includeSidePanels) {
    return scriptRight;
  }
  const assetsRight = dockLayout.assets.left + dockLayout.assets.width;
  const imagesRight = dockLayout.images.left + dockLayout.images.width;
  return Math.max(scriptRight, assetsRight, imagesRight);
}

export interface UncoveredCanvasFocusParams {
  cardX: number;
  cardY: number;
  cardWidth: number;
  cardHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  occupiedLeftWidth?: number;
  targetScale?: number;
}

export interface UncoveredCanvasFocusTransform {
  x: number;
  y: number;
  scale: number;
  centerScreenX: number;
  centerScreenY: number;
}

/**
 * Computes the target canvas camera transform (`x`, `y`, `scale`) so that the target card's
 * center lands at the center of the uncovered canvas area to the right of the left-side dock
 * cards (`[occupiedLeftWidth, viewportWidth]`) at 100% canvas scale (`targetScale = 1`).
 */
export function computeUncoveredCanvasFocusTransform(
  params: UncoveredCanvasFocusParams
): UncoveredCanvasFocusTransform {
  const safeViewportW = Math.max(320, params.viewportWidth || 1440);
  const safeViewportH = Math.max(240, params.viewportHeight || 900);
  const scale =
    typeof params.targetScale === 'number' &&
    Number.isFinite(params.targetScale) &&
    params.targetScale > 0
      ? params.targetScale
      : 1;

  const rawLeft = params.occupiedLeftWidth;
  const clampedLeft =
    typeof rawLeft === 'number' &&
    Number.isFinite(rawLeft) &&
    rawLeft > 0 &&
    rawLeft < safeViewportW
      ? rawLeft
      : 0;

  const centerScreenX = (clampedLeft + safeViewportW) / 2;
  const centerScreenY = safeViewportH / 2;

  const cardCenterX = params.cardX + params.cardWidth / 2;
  const cardCenterY = params.cardY + params.cardHeight / 2;

  return {
    x: centerScreenX - cardCenterX * scale,
    y: centerScreenY - cardCenterY * scale,
    scale,
    centerScreenX,
    centerScreenY,
  };
}

