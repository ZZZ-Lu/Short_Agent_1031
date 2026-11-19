import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Box,
  ChevronsLeftRight,
  ChevronsRightLeft,
  Crosshair,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Link2,
  Maximize2,
  Minimize2,
  Mountain,
  MousePointerClick,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import {
  computeProgressiveBatchCount,
  normalizeScrollOffset,
  WIDTH_TRANSITION_TIMINGS,
  type DockPanelLayout,
  type PanelWidthTransitionMeta,
} from '../utils/scriptBibleDockLayout';
import {
  areInitialFeedImagesSettled,
  collectInitialFeedImageUrls,
  computeVerticalAlignedScrollTop,
  resolveEntryPreviewSrc,
  resolveFeedTileDisplayMeta,
  type AssetCategory,
  type AssetImageFeedCard,
  type AssetImageFeedSection,
  type FeedFocusTargetRequest,
  type ResolvedAssetImageEntry,
} from '../utils/assetImages';
import { escapeAttrSelectorValue, safeQuerySelector } from '../utils/domSelector';
import {
  FullscreenImageLightbox,
  type FullscreenImageLightboxData,
} from './FullscreenImageLightbox';
import { useProjectScopedState } from '../hooks/useProjectScopedState';
import {
  useShellWidthTransitionGuard,
  useUnifiedPanelScrollMemory,
} from '../hooks/useUnifiedPanelScrollMemory';
import {
  buildScrollScopeKey,
  readScrollOffsetFromStorage,
  resolveProjectScopedRawValue,
  writeProjectScopedRawValue,
  writeScrollOffsetToStorage,
} from '../utils/scrollMemory';
import {
  buildAssetAgentTargetId,
  isAssetSectionAgentFocused,
} from '../utils/assetAgentTarget';
import {
  getSelectionOverlayStyle,
  resolveSelectionBorderMode,
  type SelectionBorderMode,
} from '../utils/selectionBorder';

export interface AssetImageFeedPanelProps {
  projectId?: string;
  layout: DockPanelLayout;
  sections: AssetImageFeedSection[];
  timelineCards: AssetImageFeedCard[];
  totalBoundImages: number;
  activeAssetId?: string | null;
  activeAssetIsVersion?: boolean;
  activeCategory?: AssetCategory | null;
  isHovered: boolean;
  onMiniMouseEnter: () => void;
  onMiniMouseMove: (e: React.MouseEvent) => void;
  onMiniMouseLeave: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  isWideMode?: boolean;
  onToggleWideMode?: () => void;
  onSelectSection: (section: AssetImageFeedSection) => void;
  onStartCanvasBind?: (section: AssetImageFeedSection) => void;
  onOpenBindModal: (section: AssetImageFeedSection) => void;
  onRequestAgentGenerate: (section: AssetImageFeedSection) => void;
  onSetPrimaryImage: (section: AssetImageFeedSection, imageId: string) => void;
  onUnbindImage: (section: AssetImageFeedSection, imageId: string) => void;
  onFocusCanvasCard?: (cardId: string) => void;
  onDropLocalFile: (section: AssetImageFeedSection, file: File) => void;
  focusFeedAssetKey?: FeedFocusTargetRequest | null;
  verifyingOrGeneratingAssetIds?: string[];
  widthTransition?: PanelWidthTransitionMeta;
  isCardsLoading?: boolean;
  isEnterAnimationSettled?: boolean;
  agentFocusedTargetId?: string | null;
  agentFocusedTargetIds?: string[];
}

type FeedViewMode = 'sections' | 'timeline';

const panelEase = [0.16, 1, 0.3, 1] as const;

const CATEGORY_META: Record<
  AssetCategory,
  { label: string; dotClass: string; placeholderHint: string }
> = {
  character: {
    label: '角色',
    dotClass: 'bg-blue-500',
    placeholderHint: '拖入或绑定角色资产图',
  },
  location: {
    label: '场景',
    dotClass: 'bg-emerald-500',
    placeholderHint: '拖入或绑定场景资产图',
  },
  prop: {
    label: '道具',
    dotClass: 'bg-amber-500',
    placeholderHint: '拖入或绑定道具资产图',
  },
};

const SOURCE_LABELS: Record<'agent' | 'canvas' | 'upload', string> = {
  agent: 'Agent',
  canvas: '画布',
  upload: '本地',
};

function CategoryPlaceholderGraphic({ category }: { category: AssetCategory }) {
  if (category === 'character') {
    return <User className="w-7 h-7 stroke-[1.4] text-gray-400/80 dark:text-neutral-500" />;
  }
  if (category === 'location') {
    return <Mountain className="w-7 h-7 stroke-[1.4] text-gray-400/80 dark:text-neutral-500" />;
  }
  return <Box className="w-7 h-7 stroke-[1.4] text-gray-400/80 dark:text-neutral-500" />;
}

function AssetCategoryBadgeIcon({ category }: { category: AssetCategory }) {
  if (category === 'character') {
    return (
      <span
        data-feed-category-icon="character"
        className="text-blue-500 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </span>
    );
  }
  if (category === 'location') {
    return (
      <span
        data-feed-category-icon="location"
        className="text-emerald-500 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </span>
    );
  }
  return (
    <span
      data-feed-category-icon="prop"
      className="text-amber-500 flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85 17.96 7.5 12 4.15zM5 15.91l6 3.38v-6.72L5 9.19v6.72zm14 0v-6.72l-6 3.38v6.72l6-3.38z" />
      </svg>
    </span>
  );
}

export const AssetImageFeedPanel = React.memo(function AssetImageFeedPanel({
  projectId,
  layout,
  sections,
  timelineCards,
  totalBoundImages,
  activeAssetId,
  activeAssetIsVersion = false,
  activeCategory,
  isHovered,
  onMiniMouseEnter,
  onMiniMouseMove,
  onMiniMouseLeave,
  onExpand,
  onCollapse,
  isWideMode = false,
  onToggleWideMode,
  onSelectSection,
  onStartCanvasBind,
  onOpenBindModal,
  onRequestAgentGenerate,
  onSetPrimaryImage,
  onUnbindImage,
  onFocusCanvasCard,
  onDropLocalFile,
  focusFeedAssetKey,
  verifyingOrGeneratingAssetIds = [],
  widthTransition,
  isCardsLoading = false,
  isEnterAnimationSettled = true,
  agentFocusedTargetId = null,
  agentFocusedTargetIds = [],
}: AssetImageFeedPanelProps) {
  const readViewModeForProject = useCallback((pid: string | undefined): FeedViewMode => {
    if (typeof window === 'undefined') return 'sections';
    const saved = resolveProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_images_view_mode_',
      fallbackGlobalKey: 'script_images_view_mode',
    });
    return saved === 'timeline' ? 'timeline' : 'sections';
  }, []);

  const writeViewModeForProject = useCallback((pid: string | undefined, mode: FeedViewMode) => {
    if (typeof window === 'undefined') return;
    writeProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_images_view_mode_',
      value: mode,
      globalKey: 'script_images_view_mode',
    });
  }, []);

  const [viewMode, setViewMode] = useProjectScopedState<FeedViewMode>({
    projectId,
    readValue: readViewModeForProject,
    writeValue: writeViewModeForProject,
  });
  const [onlyShowActiveAsset, setOnlyShowActiveAsset] = useState(false);
  const [dragOverSectionKey, setDragOverSectionKey] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<FullscreenImageLightboxData | null>(null);
  const [loadedDimensionsByKey, setLoadedDimensionsByKey] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [imageLoadStateByUrl, setImageLoadStateByUrl] = useState<
    Record<string, 'loaded' | 'error'>
  >({});
  const [initialBatchTimedOut, setInitialBatchTimedOut] = useState(false);
  const [isFeedRevealed, setIsFeedRevealed] = useState(false);
  const markImageSettled = useCallback(
    (
      url: string | undefined,
      status: 'loaded' | 'error',
      tileKey?: string,
      naturalWidth?: number,
      naturalHeight?: number,
      hasExplicitNativeDims?: boolean
    ) => {
      if (!url) return;
      setImageLoadStateByUrl((prev) => {
        if (prev[url] === status) return prev;
        return { ...prev, [url]: status };
      });
      if (
        status === 'loaded' &&
        tileKey &&
        !hasExplicitNativeDims &&
        typeof naturalWidth === 'number' &&
        naturalWidth > 0 &&
        typeof naturalHeight === 'number' &&
        naturalHeight > 0
      ) {
        setLoadedDimensionsByKey((prev) => {
          const existing = prev[tileKey];
          if (existing && existing.width === naturalWidth && existing.height === naturalHeight) {
            return prev;
          }
          return { ...prev, [tileKey]: { width: naturalWidth, height: naturalHeight } };
        });
      }
    },
    []
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastHandledFocusNonceRef = useRef<number | null>(null);
  const activeVerticalAnchorRef = useRef<{
    request: FeedFocusTargetRequest;
    lastPlannedScrollTop: number | null;
    expiresAtMs: number;
    cancelledByUser: boolean;
  } | null>(null);
  const alignRafRef = useRef<number | null>(null);
  const focusedTargetList = useMemo(
    () =>
      [agentFocusedTargetId, ...(agentFocusedTargetIds || [])].filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0
      ),
    [agentFocusedTargetId, agentFocusedTargetIds]
  );

  const effectiveProjectId = projectId || 'default';
  const scrollSpec = useMemo(
    () => ({
      kind: 'images' as const,
      projectId: effectiveProjectId,
      viewMode,
    }),
    [effectiveProjectId, viewMode]
  );
  const scopeKey = useMemo(() => buildScrollScopeKey(scrollSpec), [scrollSpec]);

  const isShellWidthTransitioning = useShellWidthTransitionGuard(
    layout.width,
    layout.expanded
  );
  const isImagesTransitioning =
    isShellWidthTransitioning ||
    Boolean(widthTransition?.hidden) ||
    Boolean(widthTransition && widthTransition.opacity < 1);
  const isExpandedContentMounted =
    layout.expanded && widthTransition?.mountExpandedContent !== false;
  const isFeedBodyMounted =
    isExpandedContentMounted && isEnterAnimationSettled && !isCardsLoading;
  const imagesContentVersion = `${sections.length}:${timelineCards.length}:${totalBoundImages}:${isWideMode ? 'wide' : 'std'}`;

  const {
    cancelPendingRestore,
    handleScrollEvent,
    reapplyPendingRestore,
  } = useUnifiedPanelScrollMemory({
    scopeKey,
    readPersistedScrollTop: () =>
      typeof window !== 'undefined'
        ? readScrollOffsetFromStorage(window.localStorage, scrollSpec)
        : 0,
    writePersistedScrollTop: (top) => {
      if (typeof window !== 'undefined') {
        writeScrollOffsetToStorage(window.localStorage, scrollSpec, top);
      }
    },
    getScrollElement: () => scrollContainerRef.current,
    isActiveAndVisible: isFeedBodyMounted && !widthTransition?.hidden,
    isTransitioning: isImagesTransitioning,
    isFilteredView: onlyShowActiveAsset,
    contentVersion: imagesContentVersion,
    maxWaitMs: 2800,
  });

  const handleFeedScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      handleScrollEvent(e.currentTarget.scrollTop);
    },
    [handleScrollEvent]
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  useEffect(() => {
    if (!activeAssetId && onlyShowActiveAsset) {
      setOnlyShowActiveAsset(false);
    }
  }, [activeAssetId, onlyShowActiveAsset]);

  // Reset per-project ephemeral UI flags when project changes
  useEffect(() => {
    setOnlyShowActiveAsset(false);
    lastHandledFocusNonceRef.current = null;
  }, [projectId]);

  const findFeedFocusTargetElement = useCallback(
    (container: HTMLElement, req: FeedFocusTargetRequest): HTMLElement | null => {
      const safeKey = escapeAttrSelectorValue(req.key);
      if (req.imageId) {
        const safeImgId = escapeAttrSelectorValue(req.imageId);
        const bySectionAndImage = safeQuerySelector(
          container,
          `[data-feed-section="${safeKey}"][data-feed-image-id="${safeImgId}"]`
        ) as HTMLElement | null;
        if (bySectionAndImage) return bySectionAndImage;

        const byImageOnly = safeQuerySelector(
          container,
          `[data-feed-image-id="${safeImgId}"]`
        ) as HTMLElement | null;
        if (byImageOnly) return byImageOnly;
      }
      if (req.cardId) {
        const safeCardId = escapeAttrSelectorValue(req.cardId);
        const bySectionAndCard = safeQuerySelector(
          container,
          `[data-feed-section="${safeKey}"][data-feed-card-id="${safeCardId}"]`
        ) as HTMLElement | null;
        if (bySectionAndCard) return bySectionAndCard;

        const byCardOnly = safeQuerySelector(
          container,
          `[data-feed-card-id="${safeCardId}"]`
        ) as HTMLElement | null;
        if (byCardOnly) return byCardOnly;
      }
      return safeQuerySelector(
        container,
        `[data-feed-section="${safeKey}"]`
      ) as HTMLElement | null;
    },
    []
  );

  const performFeedFocusScroll = useCallback(
    (container: HTMLElement, req: FeedFocusTargetRequest, isRefinement: boolean = false) => {
      const targetEl = findFeedFocusTargetElement(container, req);
      if (!targetEl) return false;

      cancelPendingRestore();

      if (
        req.alignMode === 'vertical-anchor' &&
        typeof req.anchorClientY === 'number' &&
        Number.isFinite(req.anchorClientY)
      ) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const nextScrollTop = computeVerticalAlignedScrollTop({
          containerTop: containerRect.top,
          containerHeight: containerRect.height,
          targetTop: targetRect.top,
          targetHeight: targetRect.height,
          anchorClientY: req.anchorClientY,
          currentScrollTop: container.scrollTop,
          maxScrollTop: Math.max(0, container.scrollHeight - container.clientHeight),
          padding: 12,
        });

        const activeState = activeVerticalAnchorRef.current;
        if (isRefinement) {
          if (!activeState || activeState.request.nonce !== req.nonce || activeState.cancelledByUser) {
            return false;
          }
          if (
            activeState.lastPlannedScrollTop !== null &&
            Math.abs(nextScrollTop - activeState.lastPlannedScrollTop) <= 12
          ) {
            return false;
          }
        }
        if (activeState && activeState.request.nonce === req.nonce) {
          activeState.lastPlannedScrollTop = nextScrollTop;
        }
        container.scrollTo({ top: nextScrollTop, behavior: 'smooth' });
        return true;
      }

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return true;
    },
    [cancelPendingRestore, findFeedFocusTargetElement]
  );

  const refineVerticalAnchorAfterImageLoad = useCallback(() => {
    const activeState = activeVerticalAnchorRef.current;
    if (!activeState || activeState.cancelledByUser) return;
    if (performance.now() > activeState.expiresAtMs) {
      activeVerticalAnchorRef.current = null;
      return;
    }
    const container = scrollContainerRef.current;
    if (!container || !isExpandedContentMounted || widthTransition?.hidden) return;
    const req = activeState.request;
    requestAnimationFrame(() => {
      if (activeVerticalAnchorRef.current?.request.nonce !== req.nonce) return;
      performFeedFocusScroll(container, req, true);
    });
  }, [isExpandedContentMounted, performFeedFocusScroll, widthTransition?.hidden]);

  // Smoothly scroll the right image feed only on explicit new focus clicks (gated by nonce)
  useEffect(() => {
    if (
      !isExpandedContentMounted ||
      widthTransition?.hidden ||
      isImagesTransitioning ||
      !focusFeedAssetKey
    ) {
      return;
    }
    if (lastHandledFocusNonceRef.current === focusFeedAssetKey.nonce) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    lastHandledFocusNonceRef.current = focusFeedAssetKey.nonce;

    if (focusFeedAssetKey.alignMode === 'vertical-anchor') {
      activeVerticalAnchorRef.current = {
        request: focusFeedAssetKey,
        lastPlannedScrollTop: null,
        expiresAtMs: performance.now() + 1400,
        cancelledByUser: false,
      };
    } else {
      activeVerticalAnchorRef.current = null;
    }

    if (alignRafRef.current !== null) {
      cancelAnimationFrame(alignRafRef.current);
      alignRafRef.current = null;
    }

    alignRafRef.current = requestAnimationFrame(() => {
      alignRafRef.current = null;
      performFeedFocusScroll(container, focusFeedAssetKey, false);
    });
  }, [
    isExpandedContentMounted,
    widthTransition?.hidden,
    isImagesTransitioning,
    focusFeedAssetKey,
    viewMode,
    performFeedFocusScroll,
  ]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isExpandedContentMounted || widthTransition?.hidden) return;
    const cancelActiveAnchor = () => {
      if (activeVerticalAnchorRef.current) {
        activeVerticalAnchorRef.current.cancelledByUser = true;
      }
    };
    container.addEventListener('wheel', cancelActiveAnchor, { passive: true });
    container.addEventListener('touchstart', cancelActiveAnchor, { passive: true });
    container.addEventListener('pointerdown', cancelActiveAnchor, { passive: true });
    return () => {
      container.removeEventListener('wheel', cancelActiveAnchor);
      container.removeEventListener('touchstart', cancelActiveAnchor);
      container.removeEventListener('pointerdown', cancelActiveAnchor);
      if (alignRafRef.current !== null) {
        cancelAnimationFrame(alignRafRef.current);
        alignRafRef.current = null;
      }
    };
  }, [isExpandedContentMounted, widthTransition?.hidden]);

  const displayedSections = useMemo(() => {
    if (!onlyShowActiveAsset || !activeAssetId) return sections;
    return sections.filter((sec) => {
      if (sec.assetId === activeAssetId || sec.parentId === activeAssetId) {
        return !activeCategory || sec.category === activeCategory;
      }
      return false;
    });
  }, [sections, onlyShowActiveAsset, activeAssetId, activeCategory]);

  const displayedTimelineCards = useMemo(() => {
    if (!onlyShowActiveAsset || !activeAssetId) return timelineCards;
    return timelineCards.filter((card) => {
      if (card.assetId === activeAssetId || card.parentId === activeAssetId) {
        return !activeCategory || card.category === activeCategory;
      }
      return false;
    });
  }, [timelineCards, onlyShowActiveAsset, activeAssetId, activeCategory]);

  const activeFeedTotalCount =
    viewMode === 'sections' ? displayedSections.length : displayedTimelineCards.length;
  const shouldForceMountAllFeedItems =
    onlyShowActiveAsset ||
    Boolean(focusFeedAssetKey) ||
    (typeof window !== 'undefined' &&
      normalizeScrollOffset(readScrollOffsetFromStorage(window.localStorage, scrollSpec)) > 0);
  const [feedBatchLimit, setFeedBatchLimit] = useState<number>(0);

  useEffect(() => {
    if (!isFeedBodyMounted) {
      setFeedBatchLimit(0);
      return;
    }
    setFeedBatchLimit((prev) =>
      computeProgressiveBatchCount({
        totalCount: activeFeedTotalCount,
        currentCount: prev,
        initialBatchSize: 6,
        batchStep: 8,
        forceAll: shouldForceMountAllFeedItems,
      })
    );
  }, [isFeedBodyMounted, activeFeedTotalCount, shouldForceMountAllFeedItems, projectId, viewMode]);

  useEffect(() => {
    if (!isFeedBodyMounted || feedBatchLimit >= activeFeedTotalCount) {
      return;
    }
    const rafId = requestAnimationFrame(() => {
      setFeedBatchLimit((prev) =>
        computeProgressiveBatchCount({
          totalCount: activeFeedTotalCount,
          currentCount: prev,
          initialBatchSize: 6,
          batchStep: 8,
          forceAll: shouldForceMountAllFeedItems,
        })
      );
    });
    return () => cancelAnimationFrame(rafId);
  }, [isFeedBodyMounted, feedBatchLimit, activeFeedTotalCount, shouldForceMountAllFeedItems]);

  const batchedSections = useMemo(
    () =>
      !isFeedBodyMounted
        ? []
        : displayedSections.length <= feedBatchLimit
          ? displayedSections
          : displayedSections.slice(0, feedBatchLimit),
    [isFeedBodyMounted, displayedSections, feedBatchLimit]
  );

  const batchedTimelineCards = useMemo(
    () =>
      !isFeedBodyMounted
        ? []
        : displayedTimelineCards.length <= feedBatchLimit
          ? displayedTimelineCards
          : displayedTimelineCards.slice(0, feedBatchLimit),
    [isFeedBodyMounted, displayedTimelineCards, feedBatchLimit]
  );

  const requiredInitialUrls = useMemo(
    () =>
      !isFeedBodyMounted
        ? []
        : collectInitialFeedImageUrls({
            viewMode,
            sections: batchedSections,
            timelineCards: batchedTimelineCards,
            maxCount: 6,
          }),
    [isFeedBodyMounted, viewMode, batchedSections, batchedTimelineCards]
  );

  const allInitialImagesSettled = useMemo(
    () => areInitialFeedImagesSettled(requiredInitialUrls, imageLoadStateByUrl),
    [requiredInitialUrls, imageLoadStateByUrl]
  );

  // Reset initial feed reveal gate when project changes, panel closes/animates in, or project cards reload
  useEffect(() => {
    if (!isFeedBodyMounted) {
      setIsFeedRevealed(false);
      setInitialBatchTimedOut(false);
    }
  }, [isFeedBodyMounted, projectId]);

  // Safety fallback timer so slow/external images never keep the panel hidden indefinitely
  useEffect(() => {
    if (!isFeedBodyMounted || isFeedRevealed || allInitialImagesSettled) {
      return;
    }
    const timer = window.setTimeout(() => {
      setInitialBatchTimedOut(true);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [isFeedBodyMounted, isFeedRevealed, allInitialImagesSettled]);

  // Smooth rAF reveal identical to widthTransition Phase 3 once card open settles + initial images are ready
  useEffect(() => {
    if (!isFeedBodyMounted) {
      return;
    }
    if (!isFeedRevealed && (allInitialImagesSettled || initialBatchTimedOut)) {
      const rafId = requestAnimationFrame(() => {
        setIsFeedRevealed(true);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isFeedBodyMounted, isFeedRevealed, allInitialImagesSettled, initialBatchTimedOut]);

  const sectionLookup = useMemo(() => {
    const map = new Map<string, AssetImageFeedSection>();
    for (const sec of sections) {
      map.set(sec.key, sec);
    }
    return map;
  }, [sections]);

  const handleDragOver = useCallback((e: React.DragEvent, sectionKey: string) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSectionKey(sectionKey);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, sectionKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSectionKey((prev) => (prev === sectionKey ? null : prev));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, section: AssetImageFeedSection) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSectionKey(null);
      const files = Array.from(e.dataTransfer?.files || []) as File[];
      const file = files.find((f) => f.type.startsWith('image/'));
      if (file) {
        onDropLocalFile(section, file);
      }
    },
    [onDropLocalFile]
  );

  // Renders a single visual-first image tile (used in multi-image grids, single-image slots, and timeline)
  const renderImageTile = (
    section: AssetImageFeedSection,
    img: ResolvedAssetImageEntry,
    options: {
      isStandaloneSingle?: boolean;
      showSectionTitle?: boolean;
      isActive?: boolean;
      isAgentFocused?: boolean;
      agentTargetId?: string;
      isDragTarget?: boolean;
      isGeneratingForSection?: boolean;
      isEager?: boolean;
    } = {}
  ) => {
    const {
      isStandaloneSingle = false,
      showSectionTitle = false,
      isActive = false,
      isAgentFocused = false,
      agentTargetId,
      isDragTarget = false,
      isGeneratingForSection = false,
      isEager = false,
    } = options;

    const meta = CATEGORY_META[section.category];
    const tileKey = `${section.key}:${img.id}`;
    const isGenerating = img.cardState === 'generating';
    const previewSrc = resolveEntryPreviewSrc(img);
    const tileLoadStatus = previewSrc ? imageLoadStateByUrl[previewSrc] : undefined;
    const isTileImgLoaded = tileLoadStatus === 'loaded';
    const isTileImgErrored = tileLoadStatus === 'error';
    const hasRenderableImage = Boolean(!isGenerating && previewSrc && !isTileImgErrored);
    const isTileContentVisible = !hasRenderableImage || isTileImgLoaded;
    const borderMode = isDragTarget
      ? 'none'
      : resolveSelectionBorderMode({
          isUserSelected: isActive,
          isAgentFocused,
        });

    const displayMeta = resolveFeedTileDisplayMeta({
      section,
      img,
      isStandaloneSingle,
      showSectionTitle,
      loadedDimensions: loadedDimensionsByKey[tileKey],
      hasRenderableImage,
    });
    const { displayName } = displayMeta;

    return (
      <div
        key={tileKey}
        data-feed-card="true"
        data-feed-section={section.key}
        data-feed-image-id={img.id}
        {...(img.cardId ? { 'data-feed-card-id': img.cardId } : {})}
        data-selection-border-mode={borderMode}
        {...(agentTargetId ? { 'data-agent-target': agentTargetId } : {})}
        {...(isStandaloneSingle
          ? {
              'data-feed-asset-id': section.assetId,
              onDragOver: (e: React.DragEvent) => handleDragOver(e, section.key),
              onDragLeave: (e: React.DragEvent) => handleDragLeave(e, section.key),
              onDrop: (e: React.DragEvent) => handleDrop(e, section),
            }
          : {})}
        style={
          hasRenderableImage && img.aspectRatio
            ? { aspectRatio: img.aspectRatio }
            : undefined
        }
        className={`group/tile relative ${
          hasRenderableImage
            ? !img.aspectRatio && !isTileImgLoaded
              ? isWideMode
                ? 'min-h-60'
                : 'min-h-48'
              : ''
            : isWideMode
              ? 'h-60'
              : 'h-48'
        } w-full rounded-[24px] corner-squircle overflow-hidden bg-gray-100 dark:bg-neutral-900 transition-colors`}
      >
        {isDragTarget || borderMode !== 'none' ? (
          <div
            key="selection-overlay"
            aria-hidden
            className={`${!isDragTarget && borderMode === 'dual' ? 'dual-selection-border ' : ''}absolute inset-0 pointer-events-none rounded-[24px] corner-squircle z-30 select-none`}
            style={getSelectionOverlayStyle(
              isDragTarget ? 'user' : (borderMode as Exclude<SelectionBorderMode, 'none'>),
              '2px'
            )}
          />
        ) : (
          <div
            key="idle-border"
            aria-hidden
            className="absolute inset-0 pointer-events-none rounded-[24px] corner-squircle z-30 select-none border border-gray-200/80 dark:border-white/[0.08] group-hover/tile:border-gray-300 dark:group-hover/tile:border-white/20 transition-colors"
          />
        )}
        {/* Visual Hero Frame (1 per row, full-bleed at original aspect ratio without cropping) */}
        <button
          type="button"
          data-lightbox-source-id={`feed:${tileKey}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasRenderableImage && isTileImgLoaded && previewSrc) {
              const imgEl = e.currentTarget.querySelector('img') as HTMLImageElement | null;
              const rectSource = (imgEl || e.currentTarget).getBoundingClientRect();
              const naturalRatio =
                imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0
                  ? imgEl.naturalWidth / imgEl.naturalHeight
                  : rectSource.width > 0 && rectSource.height > 0
                    ? rectSource.width / rectSource.height
                    : undefined;
              const subtitleParts = [
                meta.label,
                SOURCE_LABELS[img.source] || '画布',
                img.ratio,
              ].filter(Boolean);
              setLightboxImage({
                src: img.originalImageUrl || img.imageUrl || previewSrc,
                title: displayMeta.leftTagText,
                subtitle: subtitleParts.join(' · '),
                originRect: {
                  left: rectSource.left,
                  top: rectSource.top,
                  width: rectSource.width,
                  height: rectSource.height,
                },
                aspectRatio: naturalRatio,
                cardBorderRadius: 24,
                sourceId: `feed:${tileKey}`,
              });
              // Defer heavy ProjectScriptBible highlight/scroll update until the enter zoom settles
              window.setTimeout(() => onSelectSection(section), 300);
            } else {
              onSelectSection(section);
            }
          }}
          className={`w-full ${hasRenderableImage ? '' : 'h-full'} block text-left cursor-pointer focus:outline-none`}
          aria-label={`全屏查看资产 ${displayName} 的资产图 ${img.label || img.cardTitle || img.id}`}
        >
          {isGenerating ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-purple-50/80 dark:bg-purple-950/30 animate-pulse px-3 text-center">
              <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
              <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300">
                正在生成资产图...
              </span>
            </div>
          ) : hasRenderableImage && previewSrc ? (
            <img
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0 && el.naturalHeight > 0) {
                  el.style.aspectRatio = `${el.naturalWidth} / ${el.naturalHeight}`;
                  if (!isTileImgLoaded) {
                    markImageSettled(
                      previewSrc,
                      'loaded',
                      tileKey,
                      el.naturalWidth,
                      el.naturalHeight,
                      Boolean(img.nativeWidth && img.nativeHeight)
                    );
                  }
                }
              }}
              src={previewSrc}
              alt={isTileImgLoaded ? (img.label || img.cardTitle || displayName) : ''}
              width={img.nativeWidth}
              height={img.nativeHeight}
              style={img.aspectRatio ? { aspectRatio: img.aspectRatio } : undefined}
              loading={isEager ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                const target = e.currentTarget;
                if (target.naturalWidth > 0 && target.naturalHeight > 0) {
                  target.style.aspectRatio = `${target.naturalWidth} / ${target.naturalHeight}`;
                }
                markImageSettled(
                  previewSrc,
                  'loaded',
                  tileKey,
                  target.naturalWidth,
                  target.naturalHeight,
                  Boolean(img.nativeWidth && img.nativeHeight)
                );
                reapplyPendingRestore();
                refineVerticalAnchorAfterImageLoad();
              }}
              onError={() => {
                markImageSettled(previewSrc, 'error');
              }}
              className={`w-full h-auto block transition-all duration-150 ease-out ${
                isTileImgLoaded
                  ? 'opacity-100 group-hover/tile:scale-[1.015]'
                  : 'opacity-0 pointer-events-none'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gray-100/90 dark:bg-neutral-800/75 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <div className="w-10 h-10 rounded-xl corner-squircle bg-white/80 dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-center">
                <CategoryPlaceholderGraphic category={section.category} />
              </div>
            </div>
          )}
        </button>

        {/* Top-left Canvas-Unified Frosted Name Tag (with asset category icon) */}
        <div
          data-feed-tag="left"
          className={`absolute z-10 pointer-events-none flex justify-start transition-opacity duration-150 ease-out ${
            isTileContentVisible ? 'opacity-100' : 'opacity-0 invisible'
          }`}
          style={{
            top: '12px',
            left: '12px',
            right: displayMeta.leftTagMaxRightCss,
          }}
        >
          <div
            title={displayMeta.showPrimaryStar ? `${displayMeta.leftTagText}（主图）` : displayMeta.leftTagText}
            className="bg-white/80 dark:bg-black/60 backdrop-blur-md h-[26px] px-2.5 rounded-xl corner-squircle border border-black/10 dark:border-white/10 shadow-sm flex items-center gap-1.5 max-w-full min-w-0"
          >
            <AssetCategoryBadgeIcon category={section.category} />
            <span className="text-gray-900 dark:text-white/95 text-[11px] font-medium truncate leading-normal tracking-wide">
              {displayMeta.leftTagText}
            </span>
          </div>
        </div>

        {/* Top-right Canvas-Unified Frosted Resolution Tag */}
        {displayMeta.resolutionTag && (
          <div
            data-feed-tag="right"
            className={`absolute z-10 pointer-events-none transition-opacity duration-150 ease-out ${
              isTileContentVisible ? 'opacity-100' : 'opacity-0 invisible'
            }`}
            style={{
              top: '12px',
              right: '12px',
            }}
          >
            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md h-[26px] px-2.5 rounded-xl corner-squircle border border-black/10 dark:border-white/10 shadow-sm flex items-center justify-center">
              <span className="text-gray-900 dark:text-white/90 text-[10px] font-bold tracking-wider leading-normal tabular-nums">
                {displayMeta.resolutionTag}
              </span>
            </div>
          </div>
        )}

        {/* Drag drop hint overlay when dragging a file */}
        {isDragTarget && (
          <div className="absolute inset-0 z-20 bg-blue-600/80 flex items-center justify-center text-xs font-semibold text-white pointer-events-none">
            松开添加资产图
          </div>
        )}

        {/* Bottom-centered Canvas-Selected-Style Hover Toolbar */}
        <div
          data-feed-hover-toolbar="true"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100%-24px)] pointer-events-none opacity-0 translate-y-1.5 scale-95 ${
            isTileContentVisible
              ? 'group-hover/tile:opacity-100 group-hover/tile:translate-y-0 group-hover/tile:scale-100 group-hover/tile:pointer-events-auto group-focus-within/tile:opacity-100 group-focus-within/tile:translate-y-0 group-focus-within/tile:scale-100 group-focus-within/tile:pointer-events-auto'
              : 'invisible'
          } transition-all duration-150 ease-out`}
        >
          <div className="flex items-center gap-1 bg-white/95 dark:bg-[#222222]/95 backdrop-blur-md border border-gray-200/90 dark:border-neutral-700/80 shadow-xl rounded-[14px] corner-squircle px-1.5 py-1">
            {isStandaloneSingle && (
              <>
                {onStartCanvasBind && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartCanvasBind(section);
                    }}
                    title="从画布绑定"
                    aria-label={`为 ${displayName} 从画布绑定资产图`}
                    className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/70 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
                  >
                    <MousePointerClick className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  </button>
                )}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBindModal(section);
                  }}
                  title="列表或本地上传绑定"
                  aria-label={`为 ${displayName} 列表或本地上传绑定资产图`}
                  className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/70 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestAgentGenerate(section);
                  }}
                  disabled={isGeneratingForSection}
                  title="生成绑定"
                  aria-label={`为 ${displayName} 生成绑定资产图`}
                  className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/70 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-300 disabled:opacity-50 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                </button>
              </>
            )}
            {!img.isPrimary && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetPrimaryImage(section, img.id);
                }}
                title="设为资产主图"
                aria-label={`将 ${displayMeta.leftTagText} 设为资产主图`}
                className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/70 text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-300 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </button>
            )}
            {img.cardId && !img.cardMissing && onFocusCanvasCard && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusCanvasCard(img.cardId!);
                }}
                title="在画布中定位"
                aria-label={`在画布中定位 ${img.cardTitle || displayName}`}
                className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/70 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              </button>
            )}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onUnbindImage(section, img.id);
              }}
              title="解除绑定"
              aria-label={`解除 ${displayName} 的资产图绑定`}
              className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-red-50 dark:hover:bg-red-950/70 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renders a clean image-first placeholder card unified with canvas top-left frosted name tag
  const renderPlaceholderTile = (
    section: AssetImageFeedSection,
    isActive: boolean,
    isAgentFocused: boolean,
    isDragTarget: boolean,
    isGenerating: boolean,
    linkedEmptyEntry?: ResolvedAssetImageEntry
  ) => {
    const displayTitle = section.parentName
      ? `${section.parentName} · ${section.name}`
      : section.name;
    const sectionTargetId = buildAssetAgentTargetId(
      section.category,
      section.assetId,
      section.parentId
    );
    const borderMode = isDragTarget
      ? 'none'
      : resolveSelectionBorderMode({
          isUserSelected: isActive,
          isAgentFocused,
        });

    return (
      <div
        key={section.key}
        data-feed-card="true"
        data-feed-section={section.key}
        data-feed-asset-id={section.assetId}
        data-agent-target={sectionTargetId}
        data-selection-border-mode={borderMode}
        onDragOver={(e) => handleDragOver(e, section.key)}
        onDragLeave={(e) => handleDragLeave(e, section.key)}
        onDrop={(e) => handleDrop(e, section)}
        className={`group/tile relative ${isWideMode ? 'h-60' : 'h-48'} w-full rounded-[24px] corner-squircle overflow-hidden transition-colors flex items-center justify-center px-4 ${
          isDragTarget
            ? 'bg-blue-50 dark:bg-blue-950/50'
            : borderMode === 'dual'
              ? `${isGenerating ? 'animate-pulse ' : ''}bg-gradient-to-br from-blue-50/55 to-purple-50/55 dark:from-blue-950/30 dark:to-purple-950/30`
              : borderMode === 'agent'
                ? `${isGenerating ? 'animate-pulse ' : ''}bg-purple-50/55 dark:bg-purple-950/30`
                : isGenerating
                  ? 'bg-purple-50/80 dark:bg-purple-950/30 animate-pulse'
                  : borderMode === 'user'
                    ? 'bg-blue-50/55 dark:bg-blue-950/30'
                    : 'bg-white/75 dark:bg-neutral-800/75'
        }`}
      >
        {isDragTarget || borderMode !== 'none' ? (
          <div
            key="selection-overlay"
            aria-hidden
            className={`${!isDragTarget && borderMode === 'dual' ? 'dual-selection-border ' : ''}absolute inset-0 pointer-events-none rounded-[24px] corner-squircle z-30 select-none`}
            style={getSelectionOverlayStyle(
              isDragTarget ? 'user' : (borderMode as Exclude<SelectionBorderMode, 'none'>),
              '2px'
            )}
          />
        ) : (
          <div
            key="idle-border"
            aria-hidden
            className={`absolute inset-0 pointer-events-none rounded-[24px] corner-squircle z-30 select-none border transition-colors ${
              isGenerating
                ? 'border-purple-300/70 dark:border-purple-500/40'
                : 'border-gray-200/80 dark:border-white/[0.08] group-hover/tile:border-gray-300 dark:group-hover/tile:border-white/20'
            }`}
          />
        )}
        {/* Background click selects this asset card (syncs Asset List if expanded) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection(section);
          }}
          aria-label={`选择资产 ${displayTitle}`}
          title={`选中 ${displayTitle}`}
          className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
        />

        {/* Top-left Canvas-Unified Frosted Name Tag (with asset category icon) */}
        <div
          data-feed-tag="left"
          className="absolute z-10 pointer-events-none flex justify-start"
          style={{
            top: '12px',
            left: '12px',
            right: '12px',
          }}
        >
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md h-[26px] px-2.5 rounded-xl corner-squircle border border-black/10 dark:border-white/10 shadow-sm flex items-center gap-1.5 max-w-full min-w-0">
            <AssetCategoryBadgeIcon category={section.category} />
            <span className="text-gray-900 dark:text-white/95 text-[11px] font-medium truncate leading-normal tracking-wide">
              {displayTitle}
            </span>
          </div>
        </div>

        {/* Bottom-centered hover tools if an empty/draft canvas card is currently linked */}
        {linkedEmptyEntry && !isGenerating && (
          <div
            data-feed-hover-toolbar="true"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100%-24px)] pointer-events-none opacity-0 translate-y-1.5 scale-95 group-hover/tile:opacity-100 group-hover/tile:translate-y-0 group-hover/tile:scale-100 group-hover/tile:pointer-events-auto group-focus-within/tile:opacity-100 group-focus-within/tile:translate-y-0 group-focus-within/tile:scale-100 group-focus-within/tile:pointer-events-auto transition-all duration-150 ease-out"
          >
            <div className="flex items-center gap-1 bg-white/95 dark:bg-[#222222]/95 backdrop-blur-md border border-gray-200/90 dark:border-neutral-700/80 shadow-xl rounded-[14px] corner-squircle px-1.5 py-1">
              {linkedEmptyEntry.cardId && !linkedEmptyEntry.cardMissing && onFocusCanvasCard && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusCanvasCard(linkedEmptyEntry.cardId!);
                  }}
                  title="在画布中定位"
                  aria-label={`在画布中定位 ${linkedEmptyEntry.cardTitle || displayTitle}`}
                  className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/70 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
                >
                  <Crosshair className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                </button>
              )}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnbindImage(section, linkedEmptyEntry.id);
                }}
                title="解除空绑定"
                aria-label={`解除 ${displayTitle} 的资产图绑定`}
                className="w-7 h-7 rounded-[10px] corner-squircle bg-gray-100/80 dark:bg-neutral-800/80 hover:bg-red-50 dark:hover:bg-red-950/70 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Centered visual stack: Category Icon + Quiet Actions */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 max-w-full pointer-events-none">
          {isGenerating ? (
            <>
              <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
              <span className="text-[11px] font-medium text-purple-600 dark:text-purple-300">
                正在生成资产图...
              </span>
            </>
          ) : isDragTarget ? (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
              松开绑定资产图
            </span>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl corner-squircle bg-white/90 dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-center group-hover/tile:scale-105 group-hover/tile:border-blue-400/40 transition-transform">
                <CategoryPlaceholderGraphic category={section.category} />
              </div>

              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 px-1">
                {onStartCanvasBind && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartCanvasBind(section);
                    }}
                    title="直接在画布中点击图像卡片绑定"
                    aria-label={`为 ${displayTitle} 从画布绑定`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/90 dark:bg-neutral-900/75 border border-black/[0.06] dark:border-white/[0.08] text-gray-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MousePointerClick className="w-3 h-3" />
                    <span>从画布绑定</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBindModal(section);
                  }}
                  title="打开列表或本地上传绑定弹窗"
                  aria-label={`为 ${displayTitle} 列表或本地上传绑定`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/90 dark:bg-neutral-900/75 border border-black/[0.06] dark:border-white/[0.08] text-gray-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ImagePlus className="w-3 h-3" />
                  <span>列表或本地上传绑定</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestAgentGenerate(section);
                  }}
                  aria-label={`为 ${displayTitle} 生成绑定`}
                  title="Agent 自动生成资产图并绑定"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/90 dark:bg-neutral-900/75 border border-black/[0.06] dark:border-white/[0.08] text-gray-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>生成绑定</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: -8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.22, delay: 0.1, ease: panelEase },
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
        y: -8,
        transition: { duration: 0.16, ease: panelEase },
      }}
      data-dock-card="true"
      data-prevent-canvas-wheel="true"
      data-agent-target={layout.expanded ? 'images.panel' : 'images.collapsed'}
      onMouseEnter={() => {
        if (!layout.expanded) onMiniMouseEnter();
      }}
      onMouseMove={(e) => {
        if (!layout.expanded) onMiniMouseMove(e);
      }}
      onMouseLeave={() => {
        if (!layout.expanded) onMiniMouseLeave();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      style={{
        left: `${layout.left}px`,
        width: `${layout.width}px`,
        zIndex: layout.zIndex,
        transitionProperty: 'left, width, height, box-shadow',
        transitionDuration: `${WIDTH_TRANSITION_TIMINGS.shellResizeMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        ...(layout.expanded ? { maxWidth: `${layout.maxWidth}px` } : { height: `${layout.height ?? 112}px` }),
      }}
      className={`fixed top-[58px] flex select-none pointer-events-auto transform-gpu bg-[#f3f4f6] dark:bg-[#1C1C1E] border border-gray-300 dark:border-white/10 corner-squircle overflow-hidden ${
        layout.expanded
          ? 'bottom-4 rounded-[24px] shadow-2xl flex-col select-text cursor-default'
          : `rounded-[20px] group ${
              isHovered ? 'shadow-xl border-blue-500/60' : 'shadow-md'
            }`
      }`}
    >
      {!layout.expanded ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          aria-label="展开图片面板"
          title="放大图片面板"
          style={{
            opacity: widthTransition ? widthTransition.miniOpacity : 1,
            visibility: widthTransition?.miniHidden ? 'hidden' : 'visible',
            pointerEvents:
              widthTransition && (widthTransition.miniOpacity < 1 || widthTransition.miniHidden)
                ? 'none'
                : undefined,
            transition:
              widthTransition && widthTransition.fadeDurationMs > 0
                ? `opacity ${widthTransition.fadeDurationMs}ms ease-out`
                : undefined,
          }}
          className={`w-full h-full flex flex-col justify-center py-2.5 select-none overflow-hidden cursor-pointer ${
            layout.miniAlign === 'right'
              ? 'items-end pr-2 pl-1'
              : layout.miniAlign === 'left'
                ? 'items-start pl-2 pr-1'
                : 'items-center px-1.5'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-white/80 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-400/50 transition-colors shadow-2xs shrink-0">
              <Maximize2 className="w-3 h-3" />
            </span>
            <div className="flex flex-col items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="[writing-mode:vertical-lr] tracking-[0.2em] text-xs font-black text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                图片
              </span>
            </div>
          </div>
        </button>
      ) : !isExpandedContentMounted ? null : (
        <div
          style={{
            opacity: widthTransition ? widthTransition.opacity : 1,
            visibility: widthTransition?.hidden ? 'hidden' : 'visible',
            pointerEvents:
              widthTransition && (widthTransition.opacity < 1 || widthTransition.hidden)
                ? 'none'
                : undefined,
            transition:
              widthTransition && widthTransition.fadeDurationMs > 0
                ? `opacity ${widthTransition.fadeDurationMs}ms ease-out`
                : `opacity ${WIDTH_TRANSITION_TIMINGS.fadeInMs}ms ease-out`,
            ...(widthTransition?.frozenWidth != null
              ? {
                  width: `${widthTransition.frozenWidth}px`,
                  minWidth: `${widthTransition.frozenWidth}px`,
                  maxWidth: `${widthTransition.frozenWidth}px`,
                  flexShrink: 0,
                }
              : {}),
          }}
          className="flex flex-col h-full w-full select-text overflow-hidden"
        >
          {/* Header */}
          <div className="shrink-0 relative z-0 border-b border-gray-300/80 dark:border-white/[0.04]">
            <div className="pl-[22px] pr-3.5 pt-3 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">
                    图片
                  </span>
                  {totalBoundImages > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold tabular-nums">
                      {totalBoundImages}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onToggleWideMode && (
                  <button
                    type="button"
                    onClick={onToggleWideMode}
                    aria-label={isWideMode ? '恢复图片面板默认宽度' : '加宽图片面板'}
                    aria-pressed={isWideMode}
                    data-agent-target="images.widthToggle"
                    className={`p-1.5 rounded-xl corner-squircle transition-colors cursor-pointer ${
                      isWideMode
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    title={isWideMode ? '恢复默认宽度' : '切换为更宽宽度'}
                  >
                    {isWideMode ? (
                      <ChevronsRightLeft className="w-4 h-4" />
                    ) : (
                      <ChevronsLeftRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onCollapse}
                  aria-label="收起图片面板"
                  data-agent-target="images.close"
                  className="p-1.5 rounded-xl corner-squircle text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="缩小图片面板"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="px-3.5 pb-2.5 pt-0.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('sections')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'sections'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>按资产</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'timeline'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>时间流</span>
                </button>
              </div>

              {activeAssetId && (
                <button
                  type="button"
                  onClick={() => setOnlyShowActiveAsset((prev) => !prev)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer truncate max-w-[140px] ${
                    onlyShowActiveAsset
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/80 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:text-blue-600'
                  }`}
                  title="仅看当前选中资产的资产图"
                >
                  {onlyShowActiveAsset ? '仅看当前 · 开' : '仅看当前'}
                </button>
              )}
            </div>
          </div>

          {/* Media-First Single-Column Feed Body */}
          <div
            ref={scrollContainerRef}
            onScroll={handleFeedScroll}
            data-agent-target="images.feed.scroll"
            style={{ overflowAnchor: 'none' }}
            className={`flex-1 overflow-y-auto p-3 pb-24 min-h-0 transition-opacity duration-150 ease-out ${
              !isFeedBodyMounted || !isFeedRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {!isFeedBodyMounted ? (
              <div className="w-full flex-1 h-full" />
            ) : viewMode === 'sections' ? (
              displayedSections.length === 0 ? (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-12 rounded-2xl bg-gray-200/70 dark:bg-neutral-800 flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-gray-400 dark:text-neutral-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-neutral-200">
                    暂无匹配的资产条目
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                    先在左侧提取或新建资产后，这里会以图片卡片流形式展示资产图。
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {batchedSections.map((section, sectionIndex) => {
                    const meta = CATEGORY_META[section.category];
                    const categoryMatches = !activeCategory || activeCategory === section.category;
                    const isSectionActive =
                      Boolean(activeAssetId) &&
                      categoryMatches &&
                      ((activeAssetId === section.assetId &&
                        Boolean(activeAssetIsVersion) === Boolean(section.isVersion)) ||
                        (!activeAssetIsVersion && section.parentId === activeAssetId));
                    const sectionTargetId = buildAssetAgentTargetId(
                      section.category,
                      section.assetId,
                      section.parentId
                    );
                    const boundCardIds = section.images
                      .map((img) => img.cardId)
                      .filter((id): id is string => Boolean(id));
                    const isSectionAgentFocused = isAssetSectionAgentFocused(
                      section,
                      focusedTargetList,
                      boundCardIds
                    );
                    const isDragTarget = dragOverSectionKey === section.key;
                    const isGeneratingForSection = verifyingOrGeneratingAssetIds.includes(
                      section.assetId
                    );
                    const displayTitle = section.parentName
                      ? `${section.parentName} · ${section.name}`
                      : section.name;

                    // 0 bound images -> single-column image-first placeholder card
                    if (section.images.length === 0) {
                      return renderPlaceholderTile(
                        section,
                        isSectionActive,
                        isSectionAgentFocused,
                        isDragTarget,
                        isGeneratingForSection
                      );
                    }

                    // Exactly 1 bound entry:
                    // If the bound entry has no live preview image yet (e.g. draft/error/missing card),
                    // render the unified placeholder card style instead of a mismatched fallback box.
                    if (section.images.length === 1 && !isGeneratingForSection) {
                      const singleImg = section.images[0];
                      const singlePreviewSrc = resolveEntryPreviewSrc(singleImg);
                      const hasLivePreview = Boolean(
                        singlePreviewSrc && imageLoadStateByUrl[singlePreviewSrc] !== 'error'
                      );
                      const isCardGenerating = singleImg.cardState === 'generating';
                      if (!hasLivePreview) {
                        return renderPlaceholderTile(
                          section,
                          isSectionActive,
                          isSectionAgentFocused,
                          isDragTarget,
                          isCardGenerating,
                          singleImg
                        );
                      }
                      return renderImageTile(section, singleImg, {
                        isStandaloneSingle: true,
                        isActive: isSectionActive,
                        isAgentFocused: isSectionAgentFocused,
                        agentTargetId: sectionTargetId,
                        isDragTarget,
                        isGeneratingForSection,
                        isEager: sectionIndex < 6,
                      });
                    }

                    // 2+ bound images (or generating additional while holding existing image) -> single-column group
                    const groupBorderMode = isDragTarget
                      ? 'none'
                      : resolveSelectionBorderMode({
                          isUserSelected: isSectionActive,
                          isAgentFocused: isSectionAgentFocused,
                        });
                    return (
                      <div
                        key={section.key}
                        data-feed-section={section.key}
                        data-feed-asset-id={section.assetId}
                        data-agent-target={sectionTargetId}
                        data-selection-border-mode={groupBorderMode}
                        onDragOver={(e) => handleDragOver(e, section.key)}
                        onDragLeave={(e) => handleDragLeave(e, section.key)}
                        onDrop={(e) => handleDrop(e, section)}
                        className={`relative rounded-[24px] corner-squircle p-2.5 transition-colors ${
                          isDragTarget
                            ? 'bg-blue-50/90 dark:bg-blue-950/40'
                            : groupBorderMode === 'dual'
                              ? 'bg-gradient-to-br from-blue-50/70 to-purple-50/70 dark:from-blue-950/30 dark:to-purple-950/30'
                              : groupBorderMode === 'agent'
                                ? 'bg-purple-50/70 dark:bg-purple-950/30'
                                : groupBorderMode === 'user'
                                  ? 'bg-blue-50/70 dark:bg-blue-950/30'
                                  : 'bg-white/65 dark:bg-white/[0.03]'
                        }`}
                      >
                        {isDragTarget || groupBorderMode !== 'none' ? (
                          <div
                            key="selection-overlay"
                            aria-hidden
                            className={`${!isDragTarget && groupBorderMode === 'dual' ? 'dual-selection-border ' : ''}absolute inset-0 pointer-events-none rounded-[24px] corner-squircle z-30 select-none`}
                            style={getSelectionOverlayStyle(
                              isDragTarget ? 'user' : (groupBorderMode as Exclude<SelectionBorderMode, 'none'>),
                              '2px'
                            )}
                          />
                        ) : (
                          <div
                            key="idle-border"
                            aria-hidden
                            className="absolute inset-0 pointer-events-none rounded-[24px] corner-squircle z-30 select-none border border-gray-200/80 dark:border-white/[0.07]"
                          />
                        )}
                        <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSection(section);
                            }}
                            className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer group"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
                            <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                              {displayTitle}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-neutral-500 shrink-0 tabular-nums">
                              {section.images.length} 张
                            </span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            {onStartCanvasBind && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStartCanvasBind(section);
                                }}
                                aria-label={`为 ${displayTitle} 从画布绑定`}
                                title="从画布绑定"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium text-gray-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <MousePointerClick className="w-3 h-3" />
                                <span>从画布绑定</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenBindModal(section);
                              }}
                              aria-label={`为 ${displayTitle} 列表或本地上传绑定`}
                              title="列表或本地上传绑定"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium text-gray-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <ImagePlus className="w-3 h-3" />
                              <span>列表/上传</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestAgentGenerate(section);
                              }}
                              disabled={isGeneratingForSection}
                              aria-label={`为 ${displayTitle} 生成绑定`}
                              title="生成绑定"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium text-gray-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              {isGeneratingForSection ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-purple-500" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>{isGeneratingForSection ? '生成中' : '生成绑定'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          {section.images.map((img, imgIndex) =>
                            renderImageTile(section, img, {
                              isStandaloneSingle: false,
                              showSectionTitle: false,
                              isAgentFocused: Boolean(
                                img.cardId && focusedTargetList.includes(img.cardId)
                              ),
                              isEager: sectionIndex < 4 && imgIndex < 2,
                            })
                          )}
                          {isGeneratingForSection && (
                            <div className="rounded-[24px] corner-squircle overflow-hidden border border-purple-300/60 dark:border-purple-500/40 bg-purple-50/70 dark:bg-purple-950/25 h-44 flex flex-col items-center justify-center gap-1.5 animate-pulse">
                              <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
                              <span className="text-[11px] font-medium text-purple-600 dark:text-purple-300">
                                正在生成...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : displayedTimelineCards.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-12 rounded-2xl corner-squircle bg-gray-200/70 dark:bg-neutral-800 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-gray-400 dark:text-neutral-500" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-neutral-200">
                  暂无已绑定的资产图
                </p>
                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                  切换回「按资产」视图可为任意占位图卡片绑定或生成资产图。
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {batchedTimelineCards.map((entry, entryIndex) => {
                  const sec = sectionLookup.get(`${entry.category}:${entry.assetId}`) || {
                    key: `${entry.category}:${entry.assetId}`,
                    assetId: entry.assetId,
                    parentId: entry.parentId,
                    parentName: entry.parentName,
                    name: entry.assetName,
                    category: entry.category,
                    isVersion: entry.isVersion,
                    subtitle: '',
                    images: [entry.image],
                  };
                  const timelineActive =
                    Boolean(activeAssetId) &&
                    (!activeCategory || activeCategory === entry.category) &&
                    ((activeAssetId === entry.assetId &&
                      Boolean(activeAssetIsVersion) === Boolean(entry.isVersion)) ||
                      (!activeAssetIsVersion && entry.parentId === activeAssetId));
                  const timelineSectionTargetId = buildAssetAgentTargetId(
                    sec.category,
                    sec.assetId,
                    sec.parentId
                  );
                  const timelineAgentFocused = isAssetSectionAgentFocused(
                    sec,
                    focusedTargetList,
                    entry.image.cardId ? [entry.image.cardId] : undefined
                  );
                  return renderImageTile(sec, entry.image, {
                    isStandaloneSingle: false,
                    showSectionTitle: true,
                    isActive: timelineActive,
                    isAgentFocused: timelineAgentFocused,
                    agentTargetId: timelineSectionTargetId,
                    isEager: entryIndex < 6,
                  });
                })}
              </div>
            )}
          </div>
        </div>
      )}
      <FullscreenImageLightbox image={lightboxImage} onClose={handleCloseLightbox} />
    </motion.div>
  );
});
