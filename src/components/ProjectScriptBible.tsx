import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as Diff from 'diff';
import { motion, AnimatePresence } from 'motion/react';
import { CODE_PIPELINE_PROMPTS } from '../constants/prompts';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  BookText,
  Users,
  MapPin,
  Box,
  Palette,
  Copy,
  Sparkles,
  Wand2,
  FileText,
  ListOrdered,
  List,
  Bookmark,
  Hash,
  RefreshCw,
  Cpu,
  Search,
  Replace,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Layers,
  Maximize2,
  Minimize2,
  Eye,
  Link2,
  MousePointerClick,
  ImagePlus
} from 'lucide-react';

// Git-like Content-Addressed Storage Utils
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash.toString(36);
};

const getSceneStore = () => {
  try {
    return JSON.parse(localStorage.getItem('script_scene_store') || '{}');
  } catch {
    return {};
  }
};

const saveSceneStore = (store: any) => {
  try {
    localStorage.setItem('script_scene_store', JSON.stringify(store));
  } catch {}
};

const extractBlocks = (text: string, tocItems: any[]) => {
  const blocks: { title: string, hash: string }[] = [];
  const store = getSceneStore();
  let updatedStore = false;

  const addBlock = (title: string, content: string) => {
    const hash = hashString(content);
    blocks.push({ title, hash });
    if (!store[hash]) {
      store[hash] = content;
      updatedStore = true;
    }
  };

  if (tocItems.length === 0) {
    addBlock('全局', text);
  } else {
    if (tocItems[0].charIndex > 0) {
      addBlock('前言', text.substring(0, tocItems[0].charIndex));
    }
    for (let i = 0; i < tocItems.length; i++) {
      const start = tocItems[i].charIndex;
      const end = i + 1 < tocItems.length ? tocItems[i + 1].charIndex : text.length;
      addBlock(tocItems[i].title, text.substring(start, end));
    }
  }

  if (updatedStore) saveSceneStore(store);
  return blocks;
};

const reconstructText = (blocks: { title: string, hash: string }[]) => {
  const store = getSceneStore();
  return blocks.map(b => store[b.hash] || '').join('');
};

import { ScriptProject, ScriptCharacter, ScriptLocation, ScriptProp, ScriptAssetVersion, ProvenanceStatus, ScriptAnnotation } from '../types/script';
import { ScriptCodeEditor, ScriptCodeEditorRef } from './script/ScriptCodeEditor';
import { assetExtractionService } from '../services/assetExtractionService';
import { calculateAssetProvenance, resolveVerifiedProvenance, AssetProvenanceItem, AssetProvenanceHighlightSpan } from '../utils/assetProvenance';
import { getAssetIdentificationText, getVersionIdentificationText, mergeMultiVersionAssetList, itemToVersion } from '../utils/assetVersions';
import { buildAssetAgentTargetId, parseAssetAgentTargetId } from '../utils/assetAgentTarget';
import { agentFocusManager } from '../agent/agentFocusManager';
import {
  getSelectionOverlayStyle,
  resolveSelectionBorderMode,
  type SelectionBorderMode,
} from '../utils/selectionBorder';
import { findAssetRowElement } from '../utils/domSelector';
import { ScriptView } from '../agent/scriptTools';
import { CardData, compressImageBlob } from './GenerationCard';
import { AssetItemContextMenu } from './AssetItemContextMenu';
import type { AssetContextCategory, AssetContextMenuActionId } from '../utils/assetContextMenu';
import {
  buildDockTransitionPhase1,
  buildDockTransitionPhase2,
  buildDockTransitionPhase3Prepare,
  buildDockTransitionPhase3Reveal,
  buildDockTransitionPlan,
  computeScriptBibleDockLayout,
  createIdleWidthTransitionPanels,
  resolveDockOccupiedRightEdge,
  shouldForceExpandScriptOnRequestedViewChange,
  WIDTH_TRANSITION_TIMINGS,
  type DockWidthTransitionPanels,
} from '../utils/scriptBibleDockLayout';
import { AssetImageFeedPanel } from './AssetImageFeedPanel';
import {
  FullscreenImageLightbox,
  type FullscreenImageLightboxData,
} from './FullscreenImageLightbox';
import { AssetBindImageModal, type AssetBindTargetInfo } from './AssetBindImageModal';
import {
  buildAssetImageFeed,
  buildAssetBindPickerTarget,
  bindImageToAssetItem,
  setPrimaryAssetImageOnItem,
  unbindImageFromAssetItem,
  buildCardSnapshotMap,
  getPrimaryAssetImageEntry,
  resolveAssetImageEntries,
  resolveAssetThumbFeedFocusTarget,
  type AssetBindPickerTarget,
  type AssetCategory,
  type AssetImageFeedSection,
  type FeedFocusTargetRequest,
} from '../utils/assetImages';
import { useProjectScopedState } from '../hooks/useProjectScopedState';
import {
  useShellWidthTransitionGuard,
  useUnifiedPanelScrollMemory,
} from '../hooks/useUnifiedPanelScrollMemory';
import {
  buildScrollScopeKey,
  readScriptScrollAnchorFromStorage,
  readScrollOffsetFromStorage,
  resolveProjectScopedRawValue,
  writeProjectScopedRawValue,
  writeScriptScrollAnchorToStorage,
  writeScrollOffsetToStorage,
  type ScriptScrollAnchor,
} from '../utils/scrollMemory';

type TocItemType = 'episode' | 'scene' | 'chapter' | 'heading' | 'segment';

interface ProjectScriptBibleProps {
  currentProject: ScriptProject;
  projects: ScriptProject[];
  cards?: CardData[];
  isCardsLoading?: boolean;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (updated: Partial<ScriptProject>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  isTocOpen: boolean;
  onTocOpenChange: (isOpen: boolean) => void;
  tocScrollRequest: { id: number; delta: number } | null;
  onTocAtBottomChange: (isAtBottom: boolean) => void;
  requestedView: ScriptView;
  onViewChange: (view: ScriptView) => void;
  requestedTocItemId?: string | null;
  onTocItemOpened: (item: { id: string; title: string; lineNumber: number; type: TocItemType }) => void;
  onSelectionChange: (selection: { text: string; start: number; end: number; lineStart: number; lineEnd: number } | null) => void;
  onRequestGenerateAsset?: (assetName: string, prompt: string) => void;
  onRequestGenerateAssetImage?: (category: AssetCategory, item: any, parentItem?: any) => void;
  onStartCanvasAssetBind?: (target: AssetBindPickerTarget) => void;
  requestedBindModalTarget?: {
    category: AssetCategory;
    assetId: string;
    parentId?: string;
    nonce: number;
  } | null;
  onFocusCanvasCard?: (cardId: string, occupiedLeftWidth?: number) => void;
  agentFocusedTargetId?: string | null;
  agentFocusedTargetIds?: string[];
  isAgentSleeping?: boolean;
  verifyingAssetIds?: string[];
  generatingAssetIds?: string[];
  onRequestVerifyAssetProvenance?: (category: 'character' | 'location' | 'prop', item: any) => void;
  selectedAssetIds?: Set<string>;
  onSelectedAssetIdsChange?: (action: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

type TabType = 'script' | 'assets' | 'universe' | 'cards';
type AssetFilterType = 'all' | 'characters' | 'locations' | 'props';

const scriptBibleCardEase = [0.16, 1, 0.3, 1] as const;

// 联动动画变体：打开时左侧先出现(delay: 0)，右侧后出现(delay: 0.08)；关闭时右侧先消失(delay: 0)，左侧后消失(delay: 0.08)
const leftCardVariants = {
  hidden: { opacity: 0, scale: 0.97, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: scriptBibleCardEase,
      delay: 0,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -8,
    transition: {
      duration: 0.16,
      ease: scriptBibleCardEase,
      delay: 0.08,
    },
  },
};

const rightCardVariants = {
  hidden: { opacity: 0, scale: 0.97, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.22, delay: 0.08, ease: scriptBibleCardEase },
      scale: { duration: 0.22, delay: 0.08, ease: scriptBibleCardEase },
      y: { duration: 0.22, delay: 0.08, ease: scriptBibleCardEase },
      layout: { duration: 0.22, ease: scriptBibleCardEase },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -8,
    transition: {
      duration: 0.16,
      ease: scriptBibleCardEase,
      delay: 0,
    },
  },
};

interface CandidateMatchesOverlayProps {
  yTop: number;
  cardHeight?: number;
  matchesCount: number;
  activeAssetMatches: AssetProvenanceItem[];
  activeAssetMatchIndex: number | null;
  provenanceStatus?: ProvenanceStatus;
  onTriggerVerify?: () => void;
  onSelectMatch: (idx: number, match: AssetProvenanceItem) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

const CandidateMatchesOverlay = React.memo(function CandidateMatchesOverlay({
  yTop,
  cardHeight = 600,
  matchesCount,
  activeAssetMatches,
  activeAssetMatchIndex,
  provenanceStatus = 'unverified',
  onTriggerVerify,
  onSelectMatch,
  onExpandedChange,
}: CandidateMatchesOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredMatchIdx, setHoveredMatchIdx] = useState<number | null>(null);
  const [scrollState, setScrollState] = useState({ canScrollUp: false, canScrollDown: false });
  const listRef = useRef<HTMLDivElement>(null);
  const retractTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateScrollState = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const canUp = el.scrollTop > 4;
    const canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    setScrollState(prev => {
      if (prev.canScrollUp === canUp && prev.canScrollDown === canDown) return prev;
      return { canScrollUp: canUp, canScrollDown: canDown };
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const raf = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(raf);
  }, [activeAssetMatches.length, updateScrollState]);

  const maskImage = useMemo(() => {
    const { canScrollUp, canScrollDown } = scrollState;
    if (canScrollUp && canScrollDown) {
      return 'linear-gradient(to bottom, transparent 0px, black 32px, black calc(100% - 32px), transparent 100%)';
    }
    if (canScrollUp) {
      return 'linear-gradient(to bottom, transparent 0px, black 32px, black 100%)';
    }
    if (canScrollDown) {
      return 'linear-gradient(to bottom, black 0px, black calc(100% - 32px), transparent 100%)';
    }
    return undefined;
  }, [scrollState]);

  const handleMouseEnter = useCallback(() => {
    if (retractTimerRef.current) {
      clearTimeout(retractTimerRef.current);
      retractTimerRef.current = null;
    }
    setIsExpanded(true);
    onExpandedChange?.(true);
  }, [onExpandedChange]);

  const handleMouseLeave = useCallback(() => {
    if (retractTimerRef.current) {
      clearTimeout(retractTimerRef.current);
    }
    retractTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      onExpandedChange?.(false);
    }, 500);
  }, [onExpandedChange]);

  useEffect(() => {
    return () => {
      if (retractTimerRef.current) {
        clearTimeout(retractTimerRef.current);
      }
      onExpandedChange?.(false);
    };
  }, [onExpandedChange]);

  // Distinguish between few entries vs many entries
  const isFew = provenanceStatus !== 'verified' || matchesCount <= 3;

  // Header pill is 24px high (px-3 py-1 text-xs font-bold), vertical center is at 12px
  const headerCenterOffset = 12;

  // Exact content height based on status and match count
  const contentHeight = (provenanceStatus !== 'verified' || matchesCount === 0)
    ? 28
    : Math.min(380, Math.max(0, matchesCount * 26 + (matchesCount - 1) * 6));

  const totalOverlayHeight = 24 + 6 + contentHeight;
  const effectiveCardHeight = cardHeight || 600;

  // Position calculation:
  // 1. When entries are few (出处条目很少):
  //    Header pill center directly aligns with asset row center (yTop)!
  // 2. When entries are many (左侧条目较多时):
  //    Whole overlay centers vertically around asset row center (yTop - totalOverlayHeight / 2)
  const calculatedTop = isFew
    ? yTop - headerCenterOffset
    : yTop - totalOverlayHeight / 2;

  // Clamp within container boundaries
  const maxTop = Math.max(12, effectiveCardHeight - 16 - totalOverlayHeight);
  const clampedTop = Math.max(12, Math.min(maxTop, calculatedTop));

  return (
    <motion.div
      data-provenance-overlay="true"
      initial={{ opacity: 0, x: 70 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: 70,
        transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] },
      }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        top: `${clampedTop}px`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`absolute right-0 z-40 flex flex-col items-end gap-1.5 select-none overflow-visible pr-2 will-change-transform ${
        isExpanded ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Header Tag - Static position without sliding */}
      <div
        onMouseEnter={handleMouseEnter}
        onClick={(e) => {
          e.stopPropagation();
          if (activeAssetMatches.length > 0) {
            onSelectMatch(0, activeAssetMatches[0]);
          }
        }}
        className="mr-1 shrink-0 px-3 py-1 rounded-full bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-100 shadow-md text-xs font-bold font-mono whitespace-nowrap pointer-events-auto cursor-pointer flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        {provenanceStatus === 'verifying' ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>核验中</span>
          </>
        ) : provenanceStatus === 'verified' ? (
          <span>{matchesCount} 处</span>
        ) : (
          <span>待核验</span>
        )}
      </div>

      {/* Candidate Index Badges / Verification Status Actions */}
      {provenanceStatus === 'verifying' ? (
        <div
          onMouseEnter={handleMouseEnter}
          className="mr-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 text-[11px] shadow-sm pointer-events-auto flex items-center gap-1.5"
        >
          <span>正在核验出处...</span>
        </div>
      ) : provenanceStatus !== 'verified' ? (
        <button
          type="button"
          onMouseEnter={handleMouseEnter}
          onClick={(e) => {
            e.stopPropagation();
            onTriggerVerify?.();
          }}
          className="mr-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] shadow-sm pointer-events-auto cursor-pointer transition-colors"
        >
          让 Agent 核验出处
        </button>
      ) : activeAssetMatches.length > 0 ? (
        <div
          ref={listRef}
          onScroll={updateScrollState}
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
          }}
          className={`flex flex-col items-end gap-1.5 max-h-[380px] overflow-y-auto overflow-x-hidden no-scrollbar py-1 ${
            isExpanded ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {activeAssetMatches.map((m, idx) => {
            const isHovered = hoveredMatchIdx === idx;
            const isSelected = activeAssetMatchIndex === idx;

            return (
              <button
                key={`${m.id || m.charIndex}-${idx}`}
                type="button"
                style={{
                  transform: isExpanded ? 'translate3d(0, 0, 0)' : 'translate3d(calc(100% - 28px), 0, 0)',
                  transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
                onMouseEnter={() => {
                  handleMouseEnter();
                  setHoveredMatchIdx(idx);
                }}
                onMouseLeave={() => setHoveredMatchIdx(null)}
                onClick={() => onSelectMatch(idx, m)}
                title={`${m.displayLabel} (第${m.lineNumber}行${m.matchedTerm ? ` · 匹配:“${m.matchedTerm}”` : ''})`}
                className={`group shrink-0 flex items-center justify-start rounded-full h-[26px] px-3 w-[105px] shadow-md text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer pointer-events-auto ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : isHovered
                    ? 'bg-blue-50 dark:bg-neutral-700 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-100'
                }`}
              >
                {/* Display label */}
                <span className={`truncate text-xs text-left w-full ${isSelected ? 'text-white font-semibold' : 'text-gray-900 dark:text-neutral-100 font-semibold'}`}>
                  {m.displayLabel}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          onMouseEnter={handleMouseEnter}
          onClick={(e) => {
            if (onTriggerVerify) {
              e.stopPropagation();
              onTriggerVerify();
            }
          }}
          title={onTriggerVerify ? '点击让 Agent 重新核验出处' : undefined}
          className={`mr-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 text-[11px] shadow-sm pointer-events-auto ${
            onTriggerVerify ? 'hover:bg-blue-50 dark:hover:bg-neutral-700 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors' : ''
          }`}
        >
          正文中未找到匹配
        </div>
      )}
    </motion.div>
  );
});

export const ProjectScriptBible = React.memo(function ProjectScriptBible({
  currentProject,
  projects,
  cards = [],
  isCardsLoading = false,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onUpdateProject,
  isOpen,
  onToggleOpen,
  onClose,
  isTocOpen,
  onTocOpenChange,
  tocScrollRequest,
  onTocAtBottomChange,
  requestedView,
  onViewChange,
  requestedTocItemId,
  onTocItemOpened,
  onSelectionChange,
  onRequestGenerateAsset,
  onRequestGenerateAssetImage,
  onStartCanvasAssetBind,
  requestedBindModalTarget,
  onFocusCanvasCard,
  agentFocusedTargetId,
  agentFocusedTargetIds = [],
  isAgentSleeping = false,
  verifyingAssetIds = [],
  generatingAssetIds = [],
  onRequestVerifyAssetProvenance,
  selectedAssetIds: propsSelectedAssetIds,
  onSelectedAssetIdsChange
}: ProjectScriptBibleProps) {
  const isTargetAgentFocused = useCallback((targetId: string) => {
    return agentFocusedTargetId === targetId || agentFocusedTargetIds.includes(targetId);
  }, [agentFocusedTargetId, agentFocusedTargetIds]);
  const getAssetRowBorderClasses = useCallback((mode: SelectionBorderMode, isVersionRow: boolean) => {
    if (mode === 'dual') {
      return isVersionRow
        ? 'bg-gradient-to-r from-blue-100/90 to-purple-100/85 dark:from-blue-900/55 dark:to-purple-900/45 text-gray-900 dark:text-neutral-100'
        : 'bg-gradient-to-r from-blue-100/90 to-purple-100/85 dark:from-blue-900/55 dark:to-purple-900/45 text-gray-900 dark:text-neutral-100';
    }
    if (mode === 'agent') {
      return isVersionRow
        ? 'bg-purple-100/85 dark:bg-purple-900/45 text-purple-800 dark:text-purple-200'
        : 'bg-purple-100/85 dark:bg-purple-900/45 text-purple-800 dark:text-purple-200';
    }
    if (mode === 'user') {
      return isVersionRow
        ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
        : 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 active:bg-blue-200/90 dark:active:bg-blue-800/80';
    }
    return isVersionRow
      ? 'hover:bg-blue-50/80 dark:hover:bg-neutral-800/70 text-gray-600 dark:text-neutral-300'
      : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40';
  }, []);

  const renderAssetRowSelectionBorderOverlay = useCallback((mode: SelectionBorderMode, isVersionRow: boolean) => {
    if (mode === 'none') return null;
    const radiusClass = isVersionRow ? 'rounded-lg' : 'rounded-xl corner-squircle';
    return (
      <div
        aria-hidden
        className={`${mode === 'dual' ? 'dual-selection-border ' : ''}absolute inset-0 pointer-events-none ${radiusClass} z-10 select-none`}
        style={getSelectionOverlayStyle(mode, '2px')}
      />
    );
  }, []);
  const currentProjectRef = useRef(currentProject);
  currentProjectRef.current = currentProject;
  const prevProjectIdRef = useRef<string | undefined>(currentProject?.id);

  // Navigation & filtering states inside drawer (synchronously scoped per project)
  const [activeTab, setActiveTab] = useState<TabType>('script');

  const readSidePanelForProject = useCallback(
    (pid: string | undefined): 'assets' | 'universe' | 'cards' | null => {
      if (typeof window === 'undefined') return 'assets';
      const saved = resolveProjectScopedRawValue({
        storage: window.localStorage,
        projectId: pid,
        projectKeyPrefix: 'script_bible_active_side_panel_',
        fallbackGlobalKey: 'script_bible_active_side_panel',
      });
      if (saved === 'null' || saved === 'closed') return null;
      if (saved === 'assets' || saved === 'universe' || saved === 'cards') return saved;
      return 'assets';
    },
    []
  );

  const writeSidePanelForProject = useCallback(
    (pid: string | undefined, panel: 'assets' | 'universe' | 'cards' | null) => {
      if (typeof window === 'undefined') return;
      const val = panel === null ? 'null' : panel;
      writeProjectScopedRawValue({
        storage: window.localStorage,
        projectId: pid,
        projectKeyPrefix: 'script_bible_active_side_panel_',
        value: val,
        globalKey: 'script_bible_active_side_panel',
      });
      if (panel !== null) {
        writeProjectScopedRawValue({
          storage: window.localStorage,
          projectId: pid,
          projectKeyPrefix: 'script_bible_last_open_side_panel_',
          value: panel,
          globalKey: 'script_bible_last_open_side_panel',
        });
      }
    },
    []
  );

  const [activeSidePanel, setActiveSidePanel] = useProjectScopedState<
    'assets' | 'universe' | 'cards' | null
  >({
    projectId: currentProject?.id,
    readValue: readSidePanelForProject,
    writeValue: writeSidePanelForProject,
  });

  const readScriptExpandedForProject = useCallback((pid: string | undefined): boolean => {
    if (typeof window === 'undefined') return true;
    const saved = resolveProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_script_expanded_',
      fallbackGlobalKey: 'script_bible_script_expanded',
    });
    return saved !== 'false';
  }, []);

  const writeScriptExpandedForProject = useCallback((pid: string | undefined, expanded: boolean) => {
    if (typeof window === 'undefined') return;
    writeProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_script_expanded_',
      value: String(expanded),
      globalKey: 'script_bible_script_expanded',
    });
  }, []);

  const [isScriptExpanded, setIsScriptExpanded] = useProjectScopedState<boolean>({
    projectId: currentProject?.id,
    readValue: readScriptExpandedForProject,
    writeValue: writeScriptExpandedForProject,
  });

  const readImagesExpandedForProject = useCallback((pid: string | undefined): boolean => {
    if (typeof window === 'undefined') return true;
    const saved = resolveProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_images_expanded_',
      fallbackGlobalKey: 'script_bible_images_expanded',
    });
    return saved !== 'false';
  }, []);

  const writeImagesExpandedForProject = useCallback((pid: string | undefined, expanded: boolean) => {
    if (typeof window === 'undefined') return;
    writeProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_images_expanded_',
      value: String(expanded),
      globalKey: 'script_bible_images_expanded',
    });
  }, []);

  const [isImagesExpanded, setIsImagesExpanded] = useProjectScopedState<boolean>({
    projectId: currentProject?.id,
    readValue: readImagesExpandedForProject,
    writeValue: writeImagesExpandedForProject,
  });

  const readImagesWideForProject = useCallback((pid: string | undefined): boolean => {
    if (typeof window === 'undefined') return false;
    const saved = resolveProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_images_wide_',
      fallbackGlobalKey: 'script_bible_images_wide',
    });
    return saved === 'true';
  }, []);

  const writeImagesWideForProject = useCallback((pid: string | undefined, wide: boolean) => {
    if (typeof window === 'undefined') return;
    writeProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_images_wide_',
      value: String(wide),
      globalKey: 'script_bible_images_wide',
    });
  }, []);

  const [isImagesWide, setIsImagesWide] = useProjectScopedState<boolean>({
    projectId: currentProject?.id,
    readValue: readImagesWideForProject,
    writeValue: writeImagesWideForProject,
  });

  type DockVisualStateSnapshot = {
    scriptExpanded: boolean;
    sidePanel: 'assets' | 'universe' | 'cards' | null;
    imagesExpanded: boolean;
    imagesWide: boolean;
  };
  type DockVisualEntry = DockVisualStateSnapshot & {
    projectId: string | undefined;
  };

  // Visual dock state drives outer dockLayout; lags intended state by Phase 1 fade-out
  // so inner card content freezes/unmounts before outer shells glide cleanly without scaling or reflowing.
  const [visualDockEntry, setVisualDockEntry] = useState<DockVisualEntry>(() => ({
    projectId: currentProject?.id,
    scriptExpanded: isScriptExpanded,
    sidePanel: activeSidePanel,
    imagesExpanded: isImagesExpanded,
    imagesWide: isImagesWide,
  }));
  const visualDock: DockVisualStateSnapshot =
    visualDockEntry.projectId === currentProject?.id
      ? {
          scriptExpanded: visualDockEntry.scriptExpanded,
          sidePanel: visualDockEntry.sidePanel,
          imagesExpanded: visualDockEntry.imagesExpanded,
          imagesWide: visualDockEntry.imagesWide,
        }
      : {
          scriptExpanded: isScriptExpanded,
          sidePanel: activeSidePanel,
          imagesExpanded: isImagesExpanded,
          imagesWide: isImagesWide,
        };
  if (visualDockEntry.projectId !== currentProject?.id) {
    setVisualDockEntry({
      projectId: currentProject?.id,
      scriptExpanded: isScriptExpanded,
      sidePanel: activeSidePanel,
      imagesExpanded: isImagesExpanded,
      imagesWide: isImagesWide,
    });
  }

  const [widthTransitionPanels, setWidthTransitionPanels] = useState<DockWidthTransitionPanels>(() =>
    createIdleWidthTransitionPanels()
  );
  const visualDockRef = useRef<DockVisualStateSnapshot>(visualDock);
  visualDockRef.current = visualDock;
  const intendedDockRef = useRef<DockVisualStateSnapshot>({
    scriptExpanded: isScriptExpanded,
    sidePanel: activeSidePanel,
    imagesExpanded: isImagesExpanded,
    imagesWide: isImagesWide,
  });
  intendedDockRef.current = {
    scriptExpanded: isScriptExpanded,
    sidePanel: activeSidePanel,
    imagesExpanded: isImagesExpanded,
    imagesWide: isImagesWide,
  };
  const widthChoreographyTimersRef = useRef<number[]>([]);
  const widthChoreographyRafsRef = useRef<number[]>([]);
  const widthChoreographyActiveRef = useRef(false);

  const clearWidthChoreography = useCallback(() => {
    for (const timerId of widthChoreographyTimersRef.current) {
      window.clearTimeout(timerId);
    }
    for (const rafId of widthChoreographyRafsRef.current) {
      cancelAnimationFrame(rafId);
    }
    widthChoreographyTimersRef.current = [];
    widthChoreographyRafsRef.current = [];
    widthChoreographyActiveRef.current = false;
  }, []);

  const setVisualDockState = useCallback(
    (pid: string | undefined, state: DockVisualStateSnapshot) => {
      visualDockRef.current = state;
      setVisualDockEntry({
        projectId: pid,
        ...state,
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      clearWidthChoreography();
    };
  }, [clearWidthChoreography]);

  useEffect(() => {
    clearWidthChoreography();
    setWidthTransitionPanels(createIdleWidthTransitionPanels());
  }, [currentProject?.id, clearWidthChoreography]);

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const viewportWidthRef = useRef(viewportWidth);
  viewportWidthRef.current = viewportWidth;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [hoveredMiniPanel, setHoveredMiniPanel] = useState<'script' | 'assets' | 'images' | null>(null);
  const [miniCardClientX, setMiniCardClientX] = useState<number | null>(null);

  const handleMiniCardMouseEnter = useCallback((panel: 'script' | 'assets' | 'images' = 'assets') => {
    setHoveredMiniPanel(panel);
    setMiniCardClientX(null);
  }, []);

  const handleMiniCardMouseMove = useCallback((e: React.MouseEvent, panel: 'script' | 'assets' | 'images' = 'assets') => {
    setHoveredMiniPanel(panel);
    setMiniCardClientX(e.clientX);
  }, []);

  const handleMiniCardMouseLeave = useCallback((panel?: 'script' | 'assets' | 'images') => {
    setHoveredMiniPanel((prev) => (!panel || prev === panel ? null : prev));
    setMiniCardClientX(null);
  }, []);

  useEffect(() => {
    if (activeSidePanel !== null) {
      setHoveredMiniPanel((prev) => (prev === 'assets' ? null : prev));
    }
  }, [activeSidePanel]);

  useEffect(() => {
    if (isScriptExpanded) {
      setHoveredMiniPanel((prev) => (prev === 'script' ? null : prev));
    }
  }, [isScriptExpanded]);

  useEffect(() => {
    if (isImagesExpanded) {
      setHoveredMiniPanel((prev) => (prev === 'images' ? null : prev));
    }
  }, [isImagesExpanded]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'script') {
      clearWidthChoreography();
      setVisualDockState(currentProjectRef.current?.id, intendedDockRef.current);
      setWidthTransitionPanels(createIdleWidthTransitionPanels());
    }
  }, [isOpen, activeTab, clearWidthChoreography, setVisualDockState]);

  const applyDockTransition = useCallback(
    (patch: Partial<DockVisualStateSnapshot>) => {
      const pid = currentProjectRef.current?.id;
      const currentIntended = intendedDockRef.current;
      const nextIntended: DockVisualStateSnapshot = {
        ...currentIntended,
        ...patch,
      };

      if (patch.scriptExpanded !== undefined && patch.scriptExpanded !== currentIntended.scriptExpanded) {
        setIsScriptExpanded(patch.scriptExpanded);
      }
      if (patch.sidePanel !== undefined && patch.sidePanel !== currentIntended.sidePanel) {
        setActiveSidePanel(patch.sidePanel);
      }
      if (patch.imagesExpanded !== undefined && patch.imagesExpanded !== currentIntended.imagesExpanded) {
        setIsImagesExpanded(patch.imagesExpanded);
      }
      if (patch.imagesWide !== undefined && patch.imagesWide !== currentIntended.imagesWide) {
        setIsImagesWide(patch.imagesWide);
      }
      intendedDockRef.current = nextIntended;

      if (!isOpenRef.current || activeTabRef.current !== 'script') {
        clearWidthChoreography();
        setVisualDockState(pid, nextIntended);
        setWidthTransitionPanels(createIdleWidthTransitionPanels());
        return;
      }

      clearWidthChoreography();

      const currentVisual = visualDockRef.current;
      const prevLayout = computeScriptBibleDockLayout({
        isScriptExpanded: currentVisual.scriptExpanded,
        isAssetsExpanded: currentVisual.sidePanel !== null,
        isImagesExpanded: currentVisual.imagesExpanded,
        isImagesWide: currentVisual.imagesWide,
        viewportWidth: viewportWidthRef.current,
        hoveredMiniPanel: null,
        miniCardClientX: null,
      });
      const nextLayout = computeScriptBibleDockLayout({
        isScriptExpanded: nextIntended.scriptExpanded,
        isAssetsExpanded: nextIntended.sidePanel !== null,
        isImagesExpanded: nextIntended.imagesExpanded,
        isImagesWide: nextIntended.imagesWide,
        viewportWidth: viewportWidthRef.current,
        hoveredMiniPanel: null,
        miniCardClientX: null,
      });

      const plan = buildDockTransitionPlan({ prevLayout, nextLayout });
      if (!plan.hasAnyAffected) {
        setVisualDockState(pid, nextIntended);
        setWidthTransitionPanels(createIdleWidthTransitionPanels());
        return;
      }

      widthChoreographyActiveRef.current = true;

      // Phase 1: Fade out mini-cards (expanding) or lock inner pixel width & fade out (collapsing / resizing)
      setWidthTransitionPanels(buildDockTransitionPhase1(plan));

      // Phase 2: Hide inner subtrees / keep expanded content unmounted and glide ONLY outer shells
      const resizeTimer = window.setTimeout(() => {
        setWidthTransitionPanels((prev) => buildDockTransitionPhase2(prev, plan));
        setVisualDockState(pid, nextIntended);
      }, WIDTH_TRANSITION_TIMINGS.fadeOutMs);
      widthChoreographyTimersRef.current.push(resizeTimer);

      // Phase 3: Mount/unhide at opacity: 0 at final width so DOM + scroll layout settle, then rAF fade-in
      const resizeEndMs = WIDTH_TRANSITION_TIMINGS.fadeOutMs + WIDTH_TRANSITION_TIMINGS.shellResizeMs;
      plan.revealOrder.forEach((panelKey, index) => {
        const action = plan.actions[panelKey];
        const revealTimer = window.setTimeout(() => {
          setWidthTransitionPanels((prev) => buildDockTransitionPhase3Prepare(prev, panelKey, action));
          const rafId = requestAnimationFrame(() => {
            setWidthTransitionPanels((prev) => buildDockTransitionPhase3Reveal(prev, panelKey, action));
          });
          widthChoreographyRafsRef.current.push(rafId);
        }, resizeEndMs + index * WIDTH_TRANSITION_TIMINGS.revealStaggerMs);
        widthChoreographyTimersRef.current.push(revealTimer);
      });

      const settleMs =
        resizeEndMs +
        Math.max(0, plan.revealOrder.length - 1) * WIDTH_TRANSITION_TIMINGS.revealStaggerMs +
        WIDTH_TRANSITION_TIMINGS.fadeInMs +
        32;
      const settleTimer = window.setTimeout(() => {
        widthChoreographyActiveRef.current = false;
        setWidthTransitionPanels(createIdleWidthTransitionPanels());
      }, settleMs);
      widthChoreographyTimersRef.current.push(settleTimer);
    },
    [
      clearWidthChoreography,
      setActiveSidePanel,
      setIsImagesExpanded,
      setIsImagesWide,
      setIsScriptExpanded,
      setVisualDockState,
    ]
  );

  const handleCloseSidePanel = useCallback(() => {
    setHoveredMiniPanel((prev) => (prev === 'assets' ? null : prev));
    setMiniCardClientX(null);
    applyDockTransition({ sidePanel: null });
  }, [applyDockTransition]);

  const handleToggleImagesWide = useCallback(() => {
    applyDockTransition({ imagesWide: !intendedDockRef.current.imagesWide });
  }, [applyDockTransition]);

  const dockLayout = useMemo(
    () =>
      computeScriptBibleDockLayout({
        isScriptExpanded: visualDock.scriptExpanded,
        isAssetsExpanded: activeTab === 'script' && visualDock.sidePanel !== null,
        isImagesExpanded: activeTab === 'script' && visualDock.imagesExpanded,
        isImagesWide: visualDock.imagesWide,
        viewportWidth,
        hoveredMiniPanel,
        miniCardClientX,
      }),
    [visualDock, activeTab, viewportWidth, hoveredMiniPanel, miniCardClientX]
  );

  const handleFocusCanvasCardFromFeed = useCallback(
    (cardId: string) => {
      if (!onFocusCanvasCard) return;
      const settledLayout = computeScriptBibleDockLayout({
        isScriptExpanded: intendedDockRef.current.scriptExpanded,
        isAssetsExpanded: activeTab === 'script' && intendedDockRef.current.sidePanel !== null,
        isImagesExpanded: activeTab === 'script' && intendedDockRef.current.imagesExpanded,
        isImagesWide: intendedDockRef.current.imagesWide,
        viewportWidth,
        hoveredMiniPanel: null,
        miniCardClientX: null,
      });
      const occupiedLeftWidth = resolveDockOccupiedRightEdge(
        settledLayout,
        activeTab === 'script'
      );
      onFocusCanvasCard(cardId, occupiedLeftWidth);
    },
    [onFocusCanvasCard, activeTab, viewportWidth]
  );

  const changeActiveTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    onViewChange(tab);
  }, [onViewChange]);

  const readAssetFilterForProject = useCallback((pid: string | undefined): AssetFilterType => {
    if (typeof window === 'undefined') return 'all';
    const saved = resolveProjectScopedRawValue({
      storage: window.localStorage,
      projectId: pid,
      projectKeyPrefix: 'script_bible_asset_filter_',
      fallbackGlobalKey: 'script_bible_asset_filter',
    });
    if (saved === 'all' || saved === 'characters' || saved === 'locations' || saved === 'props') {
      return saved;
    }
    return 'all';
  }, []);

  const writeAssetFilterForProject = useCallback(
    (pid: string | undefined, filter: AssetFilterType) => {
      if (typeof window === 'undefined') return;
      writeProjectScopedRawValue({
        storage: window.localStorage,
        projectId: pid,
        projectKeyPrefix: 'script_bible_asset_filter_',
        value: filter,
        globalKey: 'script_bible_asset_filter',
      });
    },
    []
  );

  const [assetFilter, setAssetFilter] = useProjectScopedState<AssetFilterType>({
    projectId: currentProject?.id,
    readValue: readAssetFilterForProject,
    writeValue: writeAssetFilterForProject,
  });

  const isScriptShellWidthTransitioning = useShellWidthTransitionGuard(
    dockLayout.script.width,
    isOpen && activeTab === 'script' && visualDock.scriptExpanded
  );
  const isSidePanelShellWidthTransitioning = useShellWidthTransitionGuard(
    dockLayout.assets.width,
    isOpen && activeTab === 'script' && visualDock.sidePanel !== null
  );

  const sidePanelContentRef = useRef<HTMLDivElement>(null);
  const effectiveProjectId = currentProject?.id || 'default';
  const sidePanelScrollSpec = useMemo(
    () => ({
      kind: 'sidePanel' as const,
      projectId: effectiveProjectId,
      subKey: (visualDock.sidePanel || 'assets') as 'assets' | 'universe' | 'cards',
    }),
    [effectiveProjectId, visualDock.sidePanel]
  );
  const sidePanelScopeKey = useMemo(
    () => buildScrollScopeKey(sidePanelScrollSpec),
    [sidePanelScrollSpec]
  );
  const isSidePanelTransitioning =
    isSidePanelShellWidthTransitioning ||
    widthTransitionPanels.assets.hidden ||
    widthTransitionPanels.assets.opacity < 1;
  const sidePanelContentVersion = `${assetFilter}:${currentProject.characters?.length || 0}:${currentProject.locations?.length || 0}:${currentProject.props?.length || 0}:${cards?.length || 0}`;

  const sidePanelScrollMemory = useUnifiedPanelScrollMemory({
    scopeKey: sidePanelScopeKey,
    readPersistedScrollTop: () =>
      typeof window !== 'undefined'
        ? readScrollOffsetFromStorage(window.localStorage, sidePanelScrollSpec)
        : 0,
    writePersistedScrollTop: (top) => {
      if (typeof window !== 'undefined') {
        writeScrollOffsetToStorage(window.localStorage, sidePanelScrollSpec, top);
      }
    },
    getScrollElement: () => sidePanelContentRef.current,
    isActiveAndVisible:
      isOpen &&
      activeTab === 'script' &&
      visualDock.sidePanel !== null &&
      widthTransitionPanels.assets.mountExpandedContent &&
      !widthTransitionPanels.assets.hidden,
    isTransitioning: isSidePanelTransitioning,
    contentVersion: sidePanelContentVersion,
    maxWaitMs: 1600,
  });

  const handleSidePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setAssetContextMenu(null);
    sidePanelScrollMemory.handleScrollEvent(e.currentTarget.scrollTop);
    setActiveAssetHighlight(prev => {
      if (!prev || !scriptCardRef.current) return prev;
      const el = findAssetRowElement(document, {
        category: prev.category,
        itemId: prev.id,
        isVersion: prev.isVersion,
      });
      if (!el) return prev;
      const rowRect = el.getBoundingClientRect();
      const cardRect = scriptCardRef.current.getBoundingClientRect();
      const newY = rowRect.top - cardRect.top + rowRect.height / 2;
      return { ...prev, yTop: newY, cardHeight: cardRect.height || prev.cardHeight };
    });
  }, [sidePanelScrollMemory.handleScrollEvent]);

  const [scriptDraftEntry, setScriptDraftEntry] = useState<{ projectId: string; text: string }>(() => ({
    projectId: currentProject?.id || '',
    text: currentProject?.scriptText || '',
  }));
  const currentProjectIdStr = currentProject?.id || '';
  const scriptDraft =
    scriptDraftEntry.projectId === currentProjectIdStr
      ? scriptDraftEntry.text
      : (currentProject?.scriptText || '');
  const setScriptDraft = useCallback((updater: React.SetStateAction<string>) => {
    const pid = currentProjectRef.current?.id || '';
    const fallbackText = currentProjectRef.current?.scriptText || '';
    setScriptDraftEntry((prev) => {
      const base = prev.projectId === pid ? prev.text : fallbackText;
      const next = typeof updater === 'function' ? updater(base) : updater;
      if (prev.projectId === pid && prev.text === next) return prev;
      return { projectId: pid, text: next };
    });
  }, []);

  const [currentSceneIndicator, setCurrentSceneIndicator] = useState('全局');
  const [versionStatus, setVersionStatus] = useState('已同步');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAssessedTextRef = useRef(currentProject?.scriptText || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAnimationSettled, setIsAnimationSettled] = useState(false);
  const [isScriptExpandSettled, setIsScriptExpandSettled] = useState<boolean>(() => isScriptExpanded);
  const [isExtractingAssets, setIsExtractingAssets] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);

  // Asset Management state (Batch Selection, Add & Edit, Multi-version collapse)
  const [internalSelectedAssetIds, setInternalSelectedAssetIds] = useState<Set<string>>(new Set());
  const selectedAssetIds = propsSelectedAssetIds ?? internalSelectedAssetIds;
  const setSelectedAssetIds = useCallback((action: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    if (onSelectedAssetIdsChange) {
      onSelectedAssetIdsChange(action);
    } else {
      setInternalSelectedAssetIds(action);
    }
  }, [onSelectedAssetIdsChange]);
  const [lastClickedAssetId, setLastClickedAssetId] = useState<string | null>(null);
  const [boxSelection, setBoxSelection] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
  } | null>(null);
  const assetListContainerRef = useRef<HTMLDivElement>(null);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<{ category: 'character' | 'location' | 'prop'; item: any; parentName?: string } | null>(null);
  const [addCategory, setAddCategory] = useState<'character' | 'location' | 'prop'>('character');
  const [collapsedMultiVersionIds, setCollapsedMultiVersionIds] = useState<Set<string>>(new Set());
  const [assetForm, setAssetForm] = useState({
    id: '',
    parentId: '',
    parentName: '',
    name: '',
    identificationDesc: '',
    subtitle: '',
    description: '',
    detail: '',
    isEditing: false
  });

  const displayCharacters = useMemo(
    () => mergeMultiVersionAssetList('characters', (currentProject?.characters || []).filter((c): c is ScriptCharacter => Boolean(c && c.id))),
    [currentProject?.characters]
  );
  const displayLocations = useMemo(
    () => mergeMultiVersionAssetList('locations', (currentProject?.locations || []).filter((l): l is ScriptLocation => Boolean(l && l.id))),
    [currentProject?.locations]
  );
  const displayProps = useMemo(
    () => mergeMultiVersionAssetList('props', (currentProject?.props || []).filter((p): p is ScriptProp => Boolean(p && p.id))),
    [currentProject?.props]
  );

  const toggleMultiVersionCollapse = useCallback((assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedMultiVersionIds(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  }, []);

  const handleViewAssetDetails = (category: 'character' | 'location' | 'prop', item: any, parentName?: string) => {
    setViewingAsset({ category, item, parentName });
  };

  const [assetContextMenu, setAssetContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    category: AssetContextCategory;
    item: any;
    parentItem?: any;
  } | null>(null);

  const handleCloseAssetContextMenu = useCallback(() => {
    setAssetContextMenu(null);
  }, []);

  const [bindImageModalTarget, setBindImageModalTarget] = useState<AssetBindTargetInfo | null>(null);
  const [focusFeedAssetKey, setFocusFeedAssetKey] = useState<FeedFocusTargetRequest | null>(null);
  const focusFeedNonceRef = useRef(0);
  const triggerFocusFeedAsset = useCallback(
    (target: string | Omit<FeedFocusTargetRequest, 'nonce'>) => {
      focusFeedNonceRef.current += 1;
      const normalized = typeof target === 'string' ? { key: target } : target;
      setFocusFeedAssetKey({ ...normalized, nonce: focusFeedNonceRef.current });
    },
    []
  );
  const [detailModalLightboxImage, setDetailModalLightboxImage] = useState<FullscreenImageLightboxData | null>(null);
  const cardsById = useMemo(() => buildCardSnapshotMap(cards || []), [cards]);

  useEffect(() => {
    if (!isOpen || activeSidePanel === null) {
      setAssetContextMenu(null);
    }
  }, [isOpen, activeSidePanel]);

  const scriptCardRef = useRef<HTMLDivElement>(null);
  const [hoveredMatchIdx, setHoveredMatchIdx] = useState<number | null>(null);

  // Active asset highlight state for script provenance jump
  const [activeAssetHighlight, setActiveAssetHighlight] = useState<{
    id: string;
    name: string;
    category: 'character' | 'location' | 'prop';
    isVersion?: boolean;
    sourceScenes?: string[];
    yTop?: number;
    cardHeight?: number;
  } | null>(null);
  const [activeAssetMatchIndex, setActiveAssetMatchIndex] = useState<number | null>(null);
  const [activeMultiHighlightSpans, setActiveMultiHighlightSpans] = useState<AssetProvenanceHighlightSpan[]>([]);
  const [activeProvenanceTargetChar, setActiveProvenanceTargetChar] = useState<number | null>(null);
  const [isCandidateOverlayExpanded, setIsCandidateOverlayExpanded] = useState(false);

  const handleSelectAssetHighlight = useCallback((
    category: 'character' | 'location' | 'prop',
    item: any,
    e?: React.MouseEvent<HTMLDivElement>,
    forceActivate: boolean = false,
    parentName?: string,
    isVersionOverride?: boolean,
    options?: {
      rowEl?: HTMLElement | null;
      feedFocusOverride?: Omit<FeedFocusTargetRequest, 'nonce'> | null;
      skipFeedFocus?: boolean;
    }
  ) => {
    if (!item || !item.id) return;
    const isVersionClick = typeof isVersionOverride === 'boolean' ? isVersionOverride : Boolean(parentName);
    if (
      !forceActivate &&
      activeAssetHighlight?.id === item.id &&
      Boolean(activeAssetHighlight?.isVersion) === isVersionClick
    ) {
      setActiveAssetHighlight(null);
      setActiveMultiHighlightSpans([]);
      setActiveProvenanceTargetChar(null);
      setIsCandidateOverlayExpanded(false);
    } else {
      let rawY = 140;
      let cardH = 600;
      const measuredRowEl = options?.rowEl || e?.currentTarget || null;
      if (measuredRowEl) {
        const rowRect = measuredRowEl.getBoundingClientRect();
        if (scriptCardRef.current) {
          const cardRect = scriptCardRef.current.getBoundingClientRect();
          cardH = cardRect.height || 600;
          rawY = rowRect.top - cardRect.top + rowRect.height / 2;
        }
      } else {
        const el = findAssetRowElement(document, {
          category,
          itemId: String(item.id),
          isVersion: isVersionClick,
        });
        if (el && scriptCardRef.current) {
          const rowRect = el.getBoundingClientRect();
          const cardRect = scriptCardRef.current.getBoundingClientRect();
          cardH = cardRect.height || 600;
          rawY = rowRect.top - cardRect.top + rowRect.height / 2;
        }
      }

      const displayName = parentName ? `${parentName}（${item.name || ''}）` : (item.name || '');

      setActiveAssetHighlight({
        id: item.id,
        name: displayName,
        category,
        isVersion: isVersionClick,
        sourceScenes: item.sourceScenes,
        yTop: rawY,
        cardHeight: cardH,
      });
      if (!options?.skipFeedFocus) {
        if (options?.feedFocusOverride) {
          triggerFocusFeedAsset(options.feedFocusOverride);
        } else {
          triggerFocusFeedAsset({ key: `${category}:${item.id}`, alignMode: 'nearest' });
        }
      }
      setActiveAssetMatchIndex(null);
      setActiveMultiHighlightSpans([]);
      setActiveProvenanceTargetChar(null);
    }
  }, [activeAssetHighlight, triggerFocusFeedAsset]);

  const applyAssetImageUpdater = useCallback((
    category: AssetCategory,
    assetId: string,
    updater: (item: any) => any,
    parentId?: string
  ) => {
    const updateList = (list: any[]) =>
      list.map((entry) => {
        if (parentId) {
          if (entry.id !== parentId) return entry;
          const prevVersions: ScriptAssetVersion[] = Array.isArray(entry.versions) ? entry.versions : [];
          let updatedPrimaryVersion: ScriptAssetVersion | null = null;
          const nextVersions = prevVersions.map((v, idx) => {
            if (v.id !== assetId) return v;
            const nextV = updater(v);
            if (idx === 0 && v.id === entry.id) {
              updatedPrimaryVersion = nextV;
            }
            return nextV;
          });
          return {
            ...entry,
            ...(updatedPrimaryVersion
              ? {
                  images: updatedPrimaryVersion.images,
                  referenceImage: updatedPrimaryVersion.referenceImage,
                }
              : {}),
            versions: nextVersions,
          };
        }
        if (entry.id !== assetId) return entry;
        const nextEntry = updater(entry);
        if (Array.isArray(nextEntry.versions) && nextEntry.versions.length > 0) {
          const nextVersions = nextEntry.versions.map((v: ScriptAssetVersion, idx: number) =>
            idx === 0 && v.id === assetId
              ? { ...v, images: nextEntry.images, referenceImage: nextEntry.referenceImage }
              : v
          );
          return { ...nextEntry, versions: nextVersions };
        }
        return nextEntry;
      });

    if (category === 'character') {
      onUpdateProject({ characters: updateList(displayCharacters) });
    } else if (category === 'location') {
      onUpdateProject({ locations: updateList(displayLocations) });
    } else {
      onUpdateProject({ props: updateList(displayProps) });
    }
  }, [displayCharacters, displayLocations, displayProps, onUpdateProject]);

  const findAssetTargetById = useCallback((
    category: AssetCategory,
    assetId: string,
    parentId?: string
  ): { item: any; parentItem?: any } | null => {
    const list =
      category === 'character'
        ? displayCharacters
        : category === 'location'
          ? displayLocations
          : displayProps;
    for (const entry of list) {
      if (parentId) {
        if (entry.id === parentId && Array.isArray(entry.versions)) {
          const hit = entry.versions.find((v) => v.id === assetId);
          if (hit) return { item: hit, parentItem: entry };
        }
      } else {
        if (entry.id === assetId) return { item: entry };
        if (Array.isArray(entry.versions)) {
          const hit = entry.versions.find((v) => v.id === assetId);
          if (hit) return { item: hit, parentItem: entry };
        }
      }
    }
    return null;
  }, [displayCharacters, displayLocations, displayProps]);

  const handleBindCanvasCardToSection = useCallback((
    category: AssetCategory,
    assetId: string,
    parentId: string | undefined,
    params: { card: CardData; label?: string; setPrimary: boolean }
  ) => {
    applyAssetImageUpdater(
      category,
      assetId,
      (targetItem) =>
        bindImageToAssetItem(
          targetItem,
          {
            cardId: params.card.id,
            imageUrl: params.card.imageUrl || params.card.originalImageUrl || undefined,
            thumbnailUrl: params.card.thumbnailUrl || params.card.imageUrl || undefined,
            label: params.label || params.card.fileName || params.card.name || undefined,
            prompt: params.card.prompt || undefined,
            source: 'canvas',
            setPrimary: params.setPrimary,
          },
          cardsById
        ).updatedItem,
      parentId
    );
    triggerFocusFeedAsset(`${category}:${assetId}`);
  }, [applyAssetImageUpdater, cardsById, triggerFocusFeedAsset]);

  const handleBindUploadedImageToSection = useCallback((
    category: AssetCategory,
    assetId: string,
    parentId: string | undefined,
    params: { dataUrl: string; label?: string; setPrimary: boolean }
  ) => {
    applyAssetImageUpdater(
      category,
      assetId,
      (targetItem) =>
        bindImageToAssetItem(
          targetItem,
          {
            imageUrl: params.dataUrl,
            thumbnailUrl: params.dataUrl,
            label: params.label || '本地参考图',
            source: 'upload',
            setPrimary: params.setPrimary,
          },
          cardsById
        ).updatedItem,
      parentId
    );
    triggerFocusFeedAsset(`${category}:${assetId}`);
  }, [applyAssetImageUpdater, cardsById, triggerFocusFeedAsset]);

  const handleDropLocalFileOnFeedSection = useCallback(async (section: AssetImageFeedSection, file: File) => {
    try {
      const dataUrl = await compressImageBlob(file, 1280, 0.85);
      handleBindUploadedImageToSection(section.category, section.assetId, section.parentId, {
        dataUrl,
        label: file.name.replace(/\.[^/.]+$/, '') || '本地图像',
        setPrimary: section.images.length === 0,
      });
    } catch {}
  }, [handleBindUploadedImageToSection]);

  const handleSetPrimaryFeedImage = useCallback((section: AssetImageFeedSection, imageId: string) => {
    applyAssetImageUpdater(
      section.category,
      section.assetId,
      (targetItem) => setPrimaryAssetImageOnItem(targetItem, imageId, cardsById),
      section.parentId
    );
  }, [applyAssetImageUpdater, cardsById]);

  const handleUnbindFeedImage = useCallback((section: AssetImageFeedSection, imageId: string) => {
    applyAssetImageUpdater(
      section.category,
      section.assetId,
      (targetItem) => unbindImageFromAssetItem(targetItem, imageId, cardsById),
      section.parentId
    );
  }, [applyAssetImageUpdater, cardsById]);

  const handleSelectFeedSection = useCallback((section: AssetImageFeedSection) => {
    const found = findAssetTargetById(section.category, section.assetId, section.parentId);
    if (found) {
      handleSelectAssetHighlight(section.category, found.item, undefined, true, found.parentItem?.name, section.isVersion);
    }
    // Only jump/scroll Asset List when it is currently expanded
    if (activeSidePanel !== 'assets') return;

    const requiredFilter: AssetFilterType =
      section.category === 'character'
        ? 'characters'
        : section.category === 'location'
          ? 'locations'
          : 'props';
    if (assetFilter !== 'all' && assetFilter !== requiredFilter) {
      setAssetFilter('all');
    }
    if (section.parentId) {
      setCollapsedMultiVersionIds((prev) => {
        if (!prev.has(section.parentId!)) return prev;
        const next = new Set(prev);
        next.delete(section.parentId!);
        return next;
      });
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scope: ParentNode = sidePanelContentRef.current || document;
        const el = findAssetRowElement(scope, {
          category: section.category,
          itemId: section.assetId,
          parentId: section.parentId,
          isVersion: section.isVersion,
        });
        if (el) {
          sidePanelScrollMemory.cancelPendingRestore();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }, [activeSidePanel, assetFilter, findAssetTargetById, handleSelectAssetHighlight, sidePanelScrollMemory.cancelPendingRestore]);

  const handleOpenBindModalFromSection = useCallback((section: AssetImageFeedSection) => {
    const found = findAssetTargetById(section.category, section.assetId, section.parentId);
    if (found) {
      setBindImageModalTarget({
        category: section.category,
        item: found.item,
        parentItem: found.parentItem,
      });
    }
  }, [findAssetTargetById]);

  const handleStartCanvasBindFromSection = useCallback((section: AssetImageFeedSection) => {
    const found = findAssetTargetById(section.category, section.assetId, section.parentId);
    if (found && onStartCanvasAssetBind) {
      onStartCanvasAssetBind(
        buildAssetBindPickerTarget({
          category: section.category,
          item: found.item,
          parentItem: found.parentItem,
        })
      );
    }
  }, [findAssetTargetById, onStartCanvasAssetBind]);

  useEffect(() => {
    if (!requestedBindModalTarget) return;
    const found = findAssetTargetById(
      requestedBindModalTarget.category,
      requestedBindModalTarget.assetId,
      requestedBindModalTarget.parentId
    );
    if (found) {
      setBindImageModalTarget({
        category: requestedBindModalTarget.category,
        item: found.item,
        parentItem: found.parentItem,
      });
    }
  }, [requestedBindModalTarget, findAssetTargetById]);

  const handleRequestGenerateFromSection = useCallback((section: AssetImageFeedSection) => {
    const found = findAssetTargetById(section.category, section.assetId, section.parentId);
    if (found) {
      applyDockTransition({ imagesExpanded: true });
      onRequestGenerateAssetImage?.(section.category, found.item, found.parentItem);
    }
  }, [findAssetTargetById, onRequestGenerateAssetImage, applyDockTransition]);

  const handleOpenAssetContextMenu = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    category: AssetContextCategory,
    item: any,
    parentItem?: any
  ) => {
    e.preventDefault();
    // Allow contextmenu event to bubble up to App.tsx handleContextMenu so
    // right-clicking an asset item summons the Agent cursor (Agent-only purple if unselected,
    // or dual-color if user already selected it) without forcing user selection state.
    setAssetContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      category,
      item,
      parentItem,
    });
  }, []);

  // Dismiss stale asset context menu if Agent focus moves to another target
  useEffect(() => {
    if (!agentFocusedTargetId || !agentFocusedTargetId.startsWith('assets.item.')) return;
    const parsedTarget = parseAssetAgentTargetId(agentFocusedTargetId);
    setAssetContextMenu((prev) => {
      if (
        parsedTarget &&
        prev?.item?.id === parsedTarget.itemId &&
        Boolean(prev.parentItem) === parsedTarget.isVersion &&
        (!parsedTarget.parentId || prev.parentItem?.id === parsedTarget.parentId)
      ) {
        return prev;
      }
      return null;
    });
  }, [agentFocusedTargetId]);

  // Synchronize agent focus to cover all multi-selected asset items when agent targets one of them
  useEffect(() => {
    if (!agentFocusedTargetId || !agentFocusedTargetId.startsWith('assets.item.')) return;
    const parsed = parseAssetAgentTargetId(agentFocusedTargetId);
    if (!parsed) return;

    if (selectedAssetIds.has(parsed.itemId) && selectedAssetIds.size > 1) {
      const referenceTargetIds: string[] = [];
      selectedAssetIds.forEach(id => {
        if (id !== parsed.itemId) {
          for (const cat of ['character', 'location', 'prop'] as const) {
            const found = findAssetTargetById(cat, id);
            if (found) {
              const tId = buildAssetAgentTargetId(cat, found.item.id, found.parentItem?.id);
              if (tId && tId !== agentFocusedTargetId) {
                referenceTargetIds.push(tId);
              }
              break;
            }
          }
        }
      });

      const currentRefs = agentFocusManager.getSnapshot().referenceCardIds;
      const currentRefsSet = new Set(currentRefs);
      const isAlreadyBatchFocused = referenceTargetIds.every(r => currentRefsSet.has(r)) && currentRefsSet.size === referenceTargetIds.length;
      if (!isAlreadyBatchFocused) {
        agentFocusManager.batchSetFocus({
          primary: agentFocusedTargetId,
          references: referenceTargetIds,
          role: 'inspect',
          sourceTool: 'context_menu',
        });
      }
    }
  }, [agentFocusedTargetId, selectedAssetIds, findAssetTargetById]);

  // Cancel asset highlight and selection when clicking on blank space (outside asset items and provenance overlay)
  useEffect(() => {
    if (!activeAssetHighlight && selectedAssetIds.size === 0) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Keep selection if clicking inside an asset item, inside its context menu, inside CandidateMatchesOverlay, Agent HUD, or inside the script card
      if (
        target.closest('[data-asset-item]') ||
        target.closest('[data-asset-context-menu]') ||
        target.closest('[data-provenance-overlay]') ||
        target.closest('[data-agent-target="images.panel"]') ||
        target.closest('[data-agent-cursor-root="true"]') ||
        target.closest('[data-image-bind-modal]') ||
        (scriptCardRef.current && scriptCardRef.current.contains(target))
      ) {
        return;
      }

      setSelectedAssetIds(new Set());
      setLastClickedAssetId(null);
      setActiveAssetHighlight(null);
      setActiveMultiHighlightSpans([]);
      setActiveProvenanceTargetChar(null);
      setIsCandidateOverlayExpanded(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeAssetHighlight, selectedAssetIds.size]);



  const getViewingAssetPrompt = useMemo(() => {
    if (!viewingAsset || !viewingAsset.item) return '';
    const { category, item, parentName } = viewingAsset;
    const fullName = parentName ? `${parentName} (${item.name})` : item.name;
    if (category === 'character') {
      return `Cinematic character portrait of ${fullName}, ${item.role || ''}, ${item.age || ''}. ${item.appearance || item.description || ''}. Style: ${currentProject.universe.artStyle}, ${currentProject.universe.colorTone}, 35mm photograph, hyperdetailed master film still.`;
    } else if (category === 'location') {
      return `Cinematic wide environment establishing shot of ${fullName}, ${item.type || 'INT'}, ${item.timeOfDay || '日'}. Atmosphere: ${item.atmosphere || item.description || ''}. Details: ${item.visualDetails || ''}. Style: ${currentProject.universe.artStyle}, ${currentProject.universe.cinematography}, film still.`;
    } else {
      return `Close-up studio cinematography shot of ${fullName}. Material and state: ${item.materialAndState || item.description || ''}. Significant story object. Style: ${currentProject.universe.artStyle}, ${currentProject.universe.colorTone}, pristine high detail.`;
    }
  }, [viewingAsset, currentProject]);

  const handleAssetRowClick = (
    id: string,
    category: 'character' | 'location' | 'prop',
    item: any,
    e: React.MouseEvent,
    isVersion = false,
    parentName?: string
  ) => {
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      setSelectedAssetIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setLastClickedAssetId(id);
    } else if (e.shiftKey && lastClickedAssetId) {
      e.stopPropagation();
      const visibleIds: string[] = [];
      if (assetFilter === 'all' || assetFilter === 'characters') {
        displayCharacters.forEach(c => {
          if (c?.id) visibleIds.push(c.id);
          if (Array.isArray(c.versions)) {
            c.versions.forEach(v => { if (v?.id) visibleIds.push(v.id); });
          }
        });
      }
      if (assetFilter === 'all' || assetFilter === 'locations') {
        displayLocations.forEach(l => {
          if (l?.id) visibleIds.push(l.id);
          if (Array.isArray(l.versions)) {
            l.versions.forEach(v => { if (v?.id) visibleIds.push(v.id); });
          }
        });
      }
      if (assetFilter === 'all' || assetFilter === 'props') {
        displayProps.forEach(p => {
          if (p?.id) visibleIds.push(p.id);
          if (Array.isArray(p.versions)) {
            p.versions.forEach(v => { if (v?.id) visibleIds.push(v.id); });
          }
        });
      }

      const startIdx = visibleIds.indexOf(lastClickedAssetId);
      const endIdx = visibleIds.indexOf(id);
      if (startIdx !== -1 && endIdx !== -1) {
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);
        setSelectedAssetIds(prev => {
          const next = new Set(prev);
          for (let i = min; i <= max; i++) {
            next.add(visibleIds[i]);
          }
          return next;
        });
      }
    } else {
      if (selectedAssetIds.has(id)) {
        // Unselect: clicking an already selected asset item cancels its selected state
        setSelectedAssetIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        if (activeAssetHighlight?.id === id) {
          setActiveAssetHighlight(null);
          setActiveMultiHighlightSpans([]);
          setActiveProvenanceTargetChar(null);
          setIsCandidateOverlayExpanded(false);
        }
        setLastClickedAssetId(null);
      } else {
        setSelectedAssetIds(new Set([id]));
        setLastClickedAssetId(id);
        handleSelectAssetHighlight(category, item, e, isVersion, parentName);
      }
    }
  };

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>, containerRef: React.RefObject<HTMLDivElement | null>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-asset-item="true"]') || target.closest('button') || target.closest('input')) {
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startX = e.clientX - rect.left + container.scrollLeft;
    const startY = e.clientY - rect.top + container.scrollTop;

    setBoxSelection({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      isDragging: false,
    });

    let didDrag = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const curX = moveEvent.clientX - rect.left + container.scrollLeft;
      const curY = moveEvent.clientY - rect.top + container.scrollTop;
      setBoxSelection(prev => {
        if (!prev) return null;
        const dx = Math.abs(curX - prev.startX);
        const dy = Math.abs(curY - prev.startY);
        const isDragging = prev.isDragging || dx > 5 || dy > 5;

        if (isDragging) {
          didDrag = true;
          const boxLeft = Math.min(prev.startX, curX);
          const boxRight = Math.max(prev.startX, curX);
          const boxTop = Math.min(prev.startY, curY);
          const boxBottom = Math.max(prev.startY, curY);

          const assetRows = container.querySelectorAll('[data-asset-item="true"]');
          const newlySelected = new Set<string>(e.shiftKey || e.ctrlKey || e.metaKey ? selectedAssetIds : []);
          assetRows.forEach(row => {
            const rowRect = row.getBoundingClientRect();
            const rLeft = rowRect.left - rect.left + container.scrollLeft;
            const rRight = rowRect.right - rect.left + container.scrollLeft;
            const rTop = rowRect.top - rect.top + container.scrollTop;
            const rBottom = rowRect.bottom - rect.top + container.scrollTop;

            if (!(rRight < boxLeft || rLeft > boxRight || rBottom < boxTop || rTop > boxBottom)) {
              const assetId = row.getAttribute('data-asset-id') || parseAssetAgentTargetId(row.getAttribute('data-agent-target'))?.itemId;
              if (assetId) newlySelected.add(assetId);
            }
          });
          setSelectedAssetIds(newlySelected);
        }

        return {
          ...prev,
          currentX: curX,
          currentY: curY,
          isDragging,
        };
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setBoxSelection(null);
      if (!didDrag && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // Simple click on empty container space -> clear all selections!
        setSelectedAssetIds(new Set());
        setLastClickedAssetId(null);
        setActiveAssetHighlight(null);
        setActiveMultiHighlightSpans([]);
        setActiveProvenanceTargetChar(null);
        setIsCandidateOverlayExpanded(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleBatchDeleteAssets = () => {
    if (selectedAssetIds.size === 0) return;
    const newCharacters = displayCharacters.filter(c => !selectedAssetIds.has(c.id));
    const newLocations = displayLocations.filter(l => !selectedAssetIds.has(l.id));
    const newProps = displayProps.filter(p => !selectedAssetIds.has(p.id));
    onUpdateProject({
      characters: newCharacters,
      locations: newLocations,
      props: newProps
    });
    setSelectedAssetIds(new Set());
  };

  const handleDeleteSingleAsset = (category: 'character' | 'location' | 'prop', id: string, parentId?: string) => {
    const removeFromList = (list: any[]) => {
      if (parentId) {
        return list.map(item =>
          item.id === parentId && Array.isArray(item.versions)
            ? { ...item, versions: item.versions.filter((v: any) => v.id !== id) }
            : item
        );
      }
      return list.filter(item => item.id !== id);
    };

    if (category === 'character') {
      onUpdateProject({ characters: removeFromList(displayCharacters) });
    } else if (category === 'location') {
      onUpdateProject({ locations: removeFromList(displayLocations) });
    } else {
      onUpdateProject({ props: removeFromList(displayProps) });
    }
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleOpenAddAsset = (category: 'character' | 'location' | 'prop' = 'character', parentItem?: any) => {
    setAddCategory(category);
    setAssetForm({
      id: '',
      parentId: parentItem ? parentItem.id : '',
      parentName: parentItem ? parentItem.name : '',
      name: '',
      identificationDesc: '',
      subtitle: category === 'character' ? (parentItem?.role || '主要角色') : category === 'location' ? `${parentItem?.type || 'INT'} · 夜景` : (parentItem?.owner || '核心道具'),
      description: '',
      detail: '',
      isEditing: false
    });
    setIsAddAssetOpen(true);
  };

  const handleOpenEditAsset = (category: 'character' | 'location' | 'prop', item: any, parentItem?: any) => {
    setAddCategory(category);
    if (category === 'character') {
      setAssetForm({
        id: item.id,
        parentId: parentItem ? parentItem.id : '',
        parentName: parentItem ? parentItem.name : '',
        name: item.name || '',
        identificationDesc: item.description || '',
        subtitle: item.role || parentItem?.role || '',
        description: item.appearance || '',
        detail: item.age || '',
        isEditing: true
      });
    } else if (category === 'location') {
      setAssetForm({
        id: item.id,
        parentId: parentItem ? parentItem.id : '',
        parentName: parentItem ? parentItem.name : '',
        name: item.name || '',
        identificationDesc: item.description || '',
        subtitle: `${item.type || parentItem?.type || 'INT'} · ${item.timeOfDay || '日'}`,
        description: item.atmosphere || '',
        detail: item.visualDetails || '',
        isEditing: true
      });
    } else {
      setAssetForm({
        id: item.id,
        parentId: parentItem ? parentItem.id : '',
        parentName: parentItem ? parentItem.name : '',
        name: item.name || '',
        identificationDesc: item.description || '',
        subtitle: item.owner || parentItem?.owner || '',
        description: item.materialAndState || '',
        detail: item.storySignificance || '',
        isEditing: true
      });
    }
    setIsAddAssetOpen(true);
  };

  const handleSaveAssetForm = () => {
    if (!assetForm.name.trim()) return;
    const cleanIdentDesc = assetForm.identificationDesc.trim() || undefined;

    // Adding or editing a second-level version under a parent asset
    if (assetForm.parentId) {
      const parts = assetForm.subtitle.split('·').map(s => s.trim());
      const locType = (parts[0]?.toUpperCase() === 'EXT' ? 'EXT' : 'INT') as 'INT' | 'EXT';
      const locTime = parts[1] || parts[0] || assetForm.name.trim();

      const buildVersionPayload = (verId: string, existingVer?: ScriptAssetVersion): ScriptAssetVersion => {
        const base: ScriptAssetVersion = {
          ...(existingVer || {}),
          id: verId,
          name: assetForm.name.trim(),
          description: cleanIdentDesc,
        };
        if (addCategory === 'character') {
          base.role = assetForm.subtitle.trim() || undefined;
          base.appearance = assetForm.description.trim() || undefined;
        } else if (addCategory === 'location') {
          base.type = locType;
          base.timeOfDay = locTime;
          base.atmosphere = assetForm.description.trim() || undefined;
          base.visualDetails = assetForm.detail.trim() || undefined;
        } else {
          base.owner = assetForm.subtitle.trim() || undefined;
          base.materialAndState = assetForm.description.trim() || undefined;
          base.storySignificance = assetForm.detail.trim() || undefined;
        }
        return base;
      };

      const updateParentVersions = (list: any[]) =>
        list.map(parent => {
          if (parent.id !== assetForm.parentId) return parent;
          let prevVersions: ScriptAssetVersion[] = Array.isArray(parent.versions) ? [...parent.versions] : [];
          if (assetForm.isEditing) {
            const nextVersions = prevVersions.map(v => (v.id === assetForm.id ? buildVersionPayload(v.id, v) : v));
            return { ...parent, versions: nextVersions };
          } else {
            if (prevVersions.length === 0) {
              const defaultName = addCategory === 'location' ? '日景' : addCategory === 'character' ? '常服' : '初始态';
              prevVersions = [itemToVersion(addCategory === 'character' ? 'characters' : addCategory === 'location' ? 'locations' : 'props', parent, defaultName)];
            }
            const newVerId = `${parent.id}_ver_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
            return { ...parent, versions: [...prevVersions, buildVersionPayload(newVerId)] };
          }
        });

      if (addCategory === 'character') {
        onUpdateProject({ characters: updateParentVersions(displayCharacters) });
      } else if (addCategory === 'location') {
        onUpdateProject({ locations: updateParentVersions(displayLocations) });
      } else {
        onUpdateProject({ props: updateParentVersions(displayProps) });
      }
      setIsAddAssetOpen(false);
      return;
    }

    if (assetForm.isEditing) {
      if (addCategory === 'character') {
        const updated = displayCharacters.map(c =>
          c.id === assetForm.id
            ? { ...c, name: assetForm.name.trim(), description: cleanIdentDesc, role: assetForm.subtitle, appearance: assetForm.description, age: assetForm.detail }
            : c
        );
        onUpdateProject({ characters: updated });
      } else if (addCategory === 'location') {
        const parts = assetForm.subtitle.split('·').map(s => s.trim());
        const type = (parts[0]?.toUpperCase() === 'EXT' ? 'EXT' : 'INT') as 'INT' | 'EXT';
        const timeOfDay = parts[1] || parts[0] || '日';
        const updated = displayLocations.map(l =>
          l.id === assetForm.id
            ? { ...l, name: assetForm.name.trim(), description: cleanIdentDesc, type, timeOfDay, atmosphere: assetForm.description, visualDetails: assetForm.detail }
            : l
        );
        onUpdateProject({ locations: updated });
      } else {
        const updated = displayProps.map(p =>
          p.id === assetForm.id
            ? { ...p, name: assetForm.name.trim(), description: cleanIdentDesc, owner: assetForm.subtitle, materialAndState: assetForm.description, storySignificance: assetForm.detail }
            : p
        );
        onUpdateProject({ props: updated });
      }
    } else {
      const newId = `${addCategory}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      if (addCategory === 'character') {
        const newChar: ScriptCharacter = {
          id: newId,
          name: assetForm.name.trim(),
          description: cleanIdentDesc,
          role: assetForm.subtitle || '角色',
          appearance: assetForm.description || '无具体描述',
          age: assetForm.detail || '',
          performanceNotes: ''
        };
        onUpdateProject({ characters: mergeMultiVersionAssetList('characters', [...displayCharacters, newChar]) });
      } else if (addCategory === 'location') {
        const parts = assetForm.subtitle.split('·').map(s => s.trim());
        const type = (parts[0]?.toUpperCase() === 'EXT' ? 'EXT' : 'INT') as 'INT' | 'EXT';
        const timeOfDay = parts[1] || '日';
        const newLoc: ScriptLocation = {
          id: newId,
          name: assetForm.name.trim(),
          description: cleanIdentDesc,
          type,
          timeOfDay,
          atmosphere: assetForm.description || '无具体描述',
          visualDetails: assetForm.detail || ''
        };
        onUpdateProject({ locations: mergeMultiVersionAssetList('locations', [...displayLocations, newLoc]) });
      } else {
        const newProp: ScriptProp = {
          id: newId,
          name: assetForm.name.trim(),
          description: cleanIdentDesc,
          owner: assetForm.subtitle || '未知',
          materialAndState: assetForm.description || '无具体描述',
          storySignificance: assetForm.detail || ''
        };
        onUpdateProject({ props: mergeMultiVersionAssetList('props', [...displayProps, newProp]) });
      }
    }
    setIsAddAssetOpen(false);
  };

  const handleExtractAssets = async () => {
    if (!currentProject || !scriptDraft.trim()) {
      setExtractionFeedback('剧本正文为空，无法提取资产。');
      setTimeout(() => setExtractionFeedback(null), 3000);
      return;
    }
    
    setIsExtractingAssets(true);
    applyDockTransition({ sidePanel: 'assets' });
    setExtractionFeedback('正在深入分析剧本全文，提取实体资产...');
    
    try {
      const apiKey = localStorage.getItem('deepseek_api_key') || '';
      const { project: updatedProject } = await assetExtractionService.extractAssetsFromScript(
        currentProject.id,
        scriptDraft,
        apiKey
      );
      
      onUpdateProject(updatedProject);
      setExtractionFeedback(`提取完成！共提取 ${updatedProject.characters?.length || 0} 个角色，${updatedProject.locations?.length || 0} 个场景，${updatedProject.props?.length || 0} 个核心道具。`);
    } catch (error: any) {
      console.error('Extraction error:', error);
      setExtractionFeedback(`提取失败: ${error.message}`);
    } finally {
      setIsExtractingAssets(false);
      setTimeout(() => setExtractionFeedback(null), 5000);
    }
  };


  // Script CodeMirror scroll attachment helpers
  const inferenceAttemptedRef = useRef<Set<string>>(new Set());
  const editorRef = useRef<ScriptCodeEditorRef | null>(null);
  const cancelScriptPendingRestoreRef = useRef<(() => void) | null>(null);
  const [scriptEditorMountNonce, setScriptEditorMountNonce] = useState(0);
  const handleScriptEditorReady = useCallback(() => {
    setScriptEditorMountNonce((n) => n + 1);
  }, []);

  // Project selector dropdown inside card
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Table of Contents (TOC) Dropdown state & parsing
  const [inferredPatterns, setInferredPatterns] = useState<string[]>(() => {
    if (Array.isArray(currentProject.tocConfig?.patterns) && currentProject.tocConfig!.patterns!.length > 0) {
      return currentProject.tocConfig!.patterns!;
    }
    try {
      const saved = localStorage.getItem(`script_toc_patterns_${currentProject.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isInferringToc, setIsInferringToc] = useState(false);
  const tocButtonRef = useRef<HTMLButtonElement>(null);
  const tocCardRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const tocListRef = useRef<HTMLDivElement>(null);

  const prevRequestedViewRef = useRef<ScriptView | null>(null);

  useEffect(() => {
    const isInitialMount = prevRequestedViewRef.current === null;
    const prevView = prevRequestedViewRef.current ?? requestedView;
    prevRequestedViewRef.current = requestedView;

    if (shouldForceExpandScriptOnRequestedViewChange({
      prevRequestedView: prevView,
      nextRequestedView: requestedView,
      isInitialMount,
    })) {
      applyDockTransition({ scriptExpanded: true });
    }

    if (requestedView === 'directory') {
      setActiveTab('script');
      onTocOpenChange(true);
      return;
    }
    setActiveTab(requestedView);
  }, [requestedView, onTocOpenChange, applyDockTransition]);

  const imageFeed = useMemo(
    () =>
      buildAssetImageFeed({
        characters: displayCharacters,
        locations: displayLocations,
        props: displayProps,
        assetFilter,
        cards: cards || [],
      }),
    [displayCharacters, displayLocations, displayProps, assetFilter, cards]
  );

  const liveViewingAsset = useMemo(() => {
    if (!viewingAsset?.item) return null;
    const found = findAssetTargetById(viewingAsset.category, viewingAsset.item.id);
    return {
      category: viewingAsset.category,
      item: found?.item || viewingAsset.item,
      parentName: viewingAsset.parentName || found?.parentItem?.name,
      parentItem: found?.parentItem,
    };
  }, [viewingAsset, findAssetTargetById]);

  const liveBindImageModalTarget = useMemo<AssetBindTargetInfo | null>(() => {
    if (!bindImageModalTarget?.item) return null;
    const found = findAssetTargetById(
      bindImageModalTarget.category,
      bindImageModalTarget.item.id,
      bindImageModalTarget.parentItem?.id
    );
    return {
      category: bindImageModalTarget.category,
      item: found?.item || bindImageModalTarget.item,
      parentItem: found?.parentItem || bindImageModalTarget.parentItem,
    };
  }, [bindImageModalTarget, findAssetTargetById]);

  const handleAssetThumbClick = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      category: AssetCategory,
      item: any,
      parentItem?: any
    ) => {
      e.stopPropagation();
      if (!item || !item.id) return;
      const rowEl =
        (e.currentTarget.closest('[data-asset-item="true"]') as HTMLElement | null) ||
        e.currentTarget;
      const rowRect = rowEl.getBoundingClientRect();
      const anchorClientY = rowRect.top + rowRect.height / 2;
      const canLinkRightFeed = Boolean(
        activeTab === 'script' && isImagesExpanded && visualDockRef.current.imagesExpanded
      );
      const resolvedTarget = canLinkRightFeed
        ? resolveAssetThumbFeedFocusTarget({
            category,
            item,
            cardsById,
          })
        : null;
      handleSelectAssetHighlight(
        category,
        item,
        undefined,
        true,
        parentItem?.name,
        Boolean(parentItem),
        {
          rowEl,
          skipFeedFocus: !canLinkRightFeed,
          feedFocusOverride: resolvedTarget
            ? {
                ...resolvedTarget,
                anchorClientY,
                alignMode: 'vertical-anchor',
              }
            : null,
        }
      );
    },
    [activeTab, cardsById, handleSelectAssetHighlight, isImagesExpanded]
  );

  const renderAssetThumbBadge = useCallback(
    (category: AssetCategory, item: any, parentItem?: any) => {
      const entries = resolveAssetImageEntries(item, cardsById);
      if (entries.length === 0) return null;
      const primary = getPrimaryAssetImageEntry(item, cardsById);
      const thumbSrc = primary?.thumbnailUrl || primary?.imageUrl;
      const itemLabel = parentItem?.name
        ? `${parentItem.name} · ${item?.name || ''}`
        : String(item?.name || '资产');
      return (
        <button
          type="button"
          data-asset-thumb-trigger="true"
          onClick={(e) => handleAssetThumbClick(e, category, item, parentItem)}
          className="inline-flex items-center gap-1 shrink-0 rounded-md cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
          title={`已绑定 ${entries.length} 张资产图 · 点击定位右侧对应图像`}
          aria-label={`定位 ${itemLabel} 的资产图`}
        >
          {primary?.cardState === 'generating' ? (
            <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-400/50 flex items-center justify-center animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-purple-500" />
            </span>
          ) : thumbSrc ? (
            <img
              src={thumbSrc}
              alt=""
              loading={thumbSrc.startsWith('data:') ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-md object-cover border border-black/10 dark:border-white/15 shrink-0 hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-colors"
            />
          ) : (
            <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 flex items-center justify-center hover:border-blue-500/60 transition-colors">
              <ImageIcon className="w-3 h-3 text-gray-400" />
            </span>
          )}
          {entries.length > 1 && (
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold">
              {entries.length}
            </span>
          )}
        </button>
      );
    },
    [cardsById, handleAssetThumbClick]
  );

  // TOC scroll position memory
  const tocScrollPositionsRef = useRef<Record<string, number>>({});

  // Restore TOC list scroll position when TOC opens or project changes
  useEffect(() => {
    if (isTocOpen) {
      let saved = tocScrollPositionsRef.current[currentProject.id];
      if (saved === undefined) {
        try {
          const stored = localStorage.getItem(`script_toc_list_scroll_${currentProject.id}`);
          if (stored) {
            saved = parseFloat(stored) || 0;
            tocScrollPositionsRef.current[currentProject.id] = saved;
          }
        } catch {}
      }
      if (saved && saved > 0) {
        requestAnimationFrame(() => {
          if (tocListRef.current) {
            tocListRef.current.scrollTop = saved!;
          }
        });
      }
    }
  }, [isTocOpen, currentProject.id]);

  const handleTocListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    tocScrollPositionsRef.current[currentProject.id] = top;
    try {
      localStorage.setItem(`script_toc_list_scroll_${currentProject.id}`, String(top));
    } catch {}
    onTocAtBottomChange(top + e.currentTarget.clientHeight >= e.currentTarget.scrollHeight - 2);
  };

  useEffect(() => {
    if (!isTocOpen || !tocListRef.current) return;
    const list = tocListRef.current;
    onTocAtBottomChange(list.scrollTop + list.clientHeight >= list.scrollHeight - 2);
  }, [isTocOpen, onTocAtBottomChange]);

  interface TocItem {
    id: string;
    title: string;
    subTitle?: string;
    lineNumber: number;
    charIndex: number;
    type: TocItemType;
  }

  // Automatically infer TOC patterns in background when script content exists and no patterns stored yet
  useEffect(() => {
    if (!scriptDraft || scriptDraft.trim().length < 20) return;

    // Ensure project.scenes is populated even if patterns were already loaded from cache
    if (inferredPatterns.length > 0) {
      if (!Array.isArray(currentProject.scenes) || currentProject.scenes.length === 0) {
        import('../utils/slicer')
          .then(({ sliceScriptIntoScenes }) => {
            const scenePat = currentProject.tocConfig?.scenePattern || inferredPatterns[1];
            const flags = currentProject.tocConfig?.flags || 'gim';
            const newScenes = sliceScriptIntoScenes(scriptDraft, scenePat, flags);
            if (newScenes.length > 0) {
              onUpdateProject({ scenes: newScenes });
            }
          })
          .catch(() => {});
      }
      return;
    }

    const saved = localStorage.getItem(`script_toc_patterns_${currentProject.id}`);
    if (saved && saved !== '[]') return;

    if (inferenceAttemptedRef.current.has(currentProject.id)) return;

    let isMounted = true;
    const autoInfer = async () => {
      setIsInferringToc(true);
      inferenceAttemptedRef.current.add(currentProject.id);
      try {
        const sampleText = scriptDraft.slice(0, 4000);
        // Retrieve API credentials from settings
        const agentModel = localStorage.getItem('agentModel') || 'deepseek-v4-flash';
        const activeModel = localStorage.getItem('script_toc_infer_model') || agentModel;
        
        const deepseekKey = localStorage.getItem('deepseek_api_key') || '';
        const qwenKey = localStorage.getItem('qwen_api_key') || '';
        const glmKey = localStorage.getItem('glm_api_key') || '';
        const arkKey = localStorage.getItem('ark_api_key') || localStorage.getItem('volcengine_api_key') || '';
        
        let apiKey = deepseekKey;
        if (activeModel.includes('doubao') || activeModel.includes('seed-2-1') || activeModel.includes('seed-2.1') || activeModel.includes('ark') || activeModel.includes('volces')) {
          apiKey = arkKey || deepseekKey || qwenKey;
        } else if (activeModel.includes('qwen') || activeModel.includes('dashscope')) {
          apiKey = qwenKey;
        } else if (activeModel.includes('glm')) {
          apiKey = glmKey;
        }

        const systemPrompt = CODE_PIPELINE_PROMPTS.tocInferSystemPrompt;

        const res = await fetch('/api/script-toc-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sampleText,
            systemPrompt,
            modelType: activeModel,
            apiKey: apiKey,
            deepseekKey: deepseekKey 
          })
        });
        if (!res.ok) throw new Error("Automatic inference failed");
        const data = await res.json();
        if (!isMounted) return;

        try {
          localStorage.setItem('last_toc_infer_result', JSON.stringify(data, null, 2));
        } catch (e) {}

        let patterns: string[] = [];
        if (data.tocPattern) patterns.push(data.tocPattern);
        if (data.scenePattern) patterns.push(data.scenePattern);

        if (patterns.length > 0) {
          setInferredPatterns(patterns);
          localStorage.setItem(`script_toc_patterns_${currentProject.id}`, JSON.stringify(patterns));
        }

        import('../utils/slicer').then(({ sliceScriptIntoScenes }) => {
          if (!isMounted) return;
          const newScenes = sliceScriptIntoScenes(scriptDraft, data.scenePattern, data.flags || 'gim');
          onUpdateProject({
            tocConfig: {
              tocPattern: data.tocPattern,
              scenePattern: data.scenePattern,
              flags: data.flags || 'gim',
              patterns,
            },
            scenes: newScenes,
          });
        }).catch(console.error);

      } catch {
        if (!isMounted) return;
        const fallbackPatterns = [
          "^【\\s*第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回][^】]*】.*",
          "^第\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回].*",
          "^\\d+\\s*[-—–]\\s*\\d+.*",
          "^【\\s*(?:场|场景|场次)?\\s*[0-9一二三四五六七八九十百千]+[^】]*】.*",
          "^第\\s*[0-9一二三四五六七八九十百千]+\\s*[场幕].*",
          "^(?:EPISODE|EP|CHAPTER|SCENE)\\s*#?\\s*\\d+.*"
        ];
        setInferredPatterns(fallbackPatterns);
        import('../utils/slicer').then(({ sliceScriptIntoScenes }) => {
          if (!isMounted) return;
          const newScenes = sliceScriptIntoScenes(scriptDraft);
          onUpdateProject({
            tocConfig: { patterns: fallbackPatterns, flags: 'gim' },
            scenes: newScenes,
          });
        }).catch(() => {});
      } finally {
        if (isMounted) setIsInferringToc(false);
      }
    };

    const timer = setTimeout(() => {
      autoInfer();
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentProject.id, scriptDraft, inferredPatterns.length]);

  const tocItems = useMemo<TocItem[]>(() => {
    if (!scriptDraft || !scriptDraft.trim()) return [];
    const lines = scriptDraft.split('\n');
    const items: TocItem[] = [];
    let charAccumulator = 0;

    const builtinPatterns = [
      "^【\\s*第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回][^】]*】.*",
      "^第\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回].*",
      "^\\d+\\s*[-—–]\\s*\\d+(?:\\s*(?:[日夜晨昏早晚内外景INTEXT.\\s].*)?|$)",
      "^【\\s*(?:场|场景|场次)?\\s*[0-9一二三四五六七八九十百千]+[^】]*】.*",
      "^第\\s*[0-9一二三四五六七八九十百千]+\\s*[场幕].*",
      "^(?:EPISODE|EP|CHAPTER|SCENE)\\s*#?\\s*\\d+.*"
    ];

    const mergedPatternStrings = Array.from(new Set([...inferredPatterns, ...builtinPatterns]));
    const activeRegexes: RegExp[] = [];
    mergedPatternStrings.forEach(patternStr => {
      try {
        activeRegexes.push(new RegExp(patternStr, 'i'));
      } catch (e) {
        console.warn("Invalid regex pattern from AI:", patternStr);
      }
    });

    if (activeRegexes.length === 0) return [];

    const nextLineSceneMetaRx =
      /^(?:[日夜晨昏早晚黄昏清晨白昼午夜]+[\s/·]+[内外]+景?|[内外]+景?[\s/·]+[日夜晨昏早晚黄昏清晨白昼午夜]+)(?:\s+.*)?$/;

    lines.forEach((rawLine, index) => {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        charAccumulator += rawLine.length + 1;
        return;
      }

      const isMatch = activeRegexes.some(rx => rx.test(trimmed));

      if (isMatch) {
        let title = trimmed;
        const bracketMatch = trimmed.match(/^【(.+?)】(?:\s*(.*))?$/);
        let subTitle: string | undefined;
        if (bracketMatch) {
          title = bracketMatch[1];
          if (bracketMatch[2]) subTitle = bracketMatch[2];
        } else if (trimmed.startsWith('#')) {
          title = trimmed.replace(/^#+\s*/, '');
        }

        // If bare dash-scene header like "22-2" is followed by "日 内 布拉姆房间" on next line, attach as subTitle
        if (!subTitle && /^\d+\s*[-—–]\s*\d+$/.test(title) && index + 1 < lines.length) {
          const nextTrimmed = lines[index + 1].trim();
          if (nextLineSceneMetaRx.test(nextTrimmed)) {
            subTitle = nextTrimmed;
          }
        }

        let type: TocItem['type'] = 'scene';
        const isDashScene = /^\d+\s*[-—–]\s*\d+/.test(trimmed);
        if (!isDashScene && /集|EPISODE|EP\b/i.test(trimmed)) {
          type = 'episode';
        } else if (isDashScene || /场|SCENE|EXT\.|INT\./i.test(trimmed)) {
          type = 'scene';
        } else if (/幕|章|回|CHAPTER|ACT/i.test(trimmed)) {
          type = 'chapter';
        } else if (/^#+\s/.test(rawLine)) {
          type = 'heading';
        } else {
          type = /第\s*[0-9一二三四五六七八九十百千]+\s*[集话回]/.test(trimmed) ? 'episode' : 'scene';
        }

        items.push({
          id: `toc-${index}-${charAccumulator}`,
          title,
          subTitle,
          lineNumber: index + 1,
          charIndex: charAccumulator,
          type,
        });
      }
      charAccumulator += rawLine.length + 1; // +1 for \n
    });

    // Fallback: If no explicit headings, generate section anchors every ~30 lines
    if (items.length === 0 && lines.length > 3) {
      const step = Math.max(20, Math.floor(lines.length / 6));
      let acc = 0;
      lines.forEach((line, idx) => {
        if (idx % step === 0 || idx === 0) {
          const preview = line.trim() || `第 ${idx + 1} 行`;
          items.push({
            id: `seg-${idx}`,
            title: preview.length > 24 ? preview.slice(0, 24) + '...' : preview,
            subTitle: `第 ${idx + 1} 行`,
            lineNumber: idx + 1,
            charIndex: acc,
            type: 'segment',
          });
        }
        acc += line.length + 1;
      });
    }

    return items;
  }, [scriptDraft, inferredPatterns]);



  const liveHighlightedAsset = useMemo(() => {
    if (!activeAssetHighlight) return null;
    const { id, category, isVersion } = activeAssetHighlight;
    const sourceList =
      category === 'character'
        ? displayCharacters
        : category === 'location'
          ? displayLocations
          : displayProps;

    for (const entry of sourceList) {
      if (isVersion && Array.isArray(entry.versions)) {
        const ver = entry.versions.find((v: any) => v.id === id);
        if (ver) {
          return {
            ...ver,
            name: `${entry.name}（${ver.name}）`,
          };
        }
      }
      if (!isVersion && entry.id === id) {
        if (Array.isArray(entry.versions) && entry.versions.length > 0) {
          const parentAnchors = Array.isArray(entry.verifiedProvenance) ? entry.verifiedProvenance : [];
          const versionAnchors = entry.versions.flatMap((v: any) =>
            Array.isArray(v?.verifiedProvenance) ? v.verifiedProvenance : []
          );
          if (versionAnchors.length > 0) {
            const mergedMap = new Map<string, any>();
            for (const a of [...parentAnchors, ...versionAnchors]) {
              if (!a) continue;
              const key =
                typeof a.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
                  ? `pos:${a.fallbackCharIndex}`
                  : `${a.sceneTitle || ''}:${a.lineNumber || ''}:${a.anchorText || a.evidenceText || a.id || ''}`;
              const prev = mergedMap.get(key);
              if (!prev || (a.evidenceText && (!prev.evidenceText || a.evidenceText.length > prev.evidenceText.length))) {
                mergedMap.set(key, a);
              }
            }
            const aggregatedAnchors = Array.from(mergedMap.values()).sort(
              (a, b) => (a.fallbackCharIndex ?? 0) - (b.fallbackCharIndex ?? 0)
            );
            if (aggregatedAnchors.length > 0) {
              return {
                ...entry,
                provenanceStatus: 'verified' as const,
                verifiedProvenance: aggregatedAnchors,
              };
            }
          }
        }
        return entry;
      }
      if (Array.isArray(entry.versions)) {
        const ver = entry.versions.find((v: any) => v.id === id);
        if (ver) {
          return {
            ...ver,
            name: `${entry.name}（${ver.name}）`,
          };
        }
      }
    }
    return null;
  }, [activeAssetHighlight, displayCharacters, displayLocations, displayProps]);

  const activeProvenanceStatus = useMemo<ProvenanceStatus>(() => {
    if (!activeAssetHighlight) return 'unverified';
    if (verifyingAssetIds.includes(activeAssetHighlight.id) || liveHighlightedAsset?.provenanceStatus === 'verifying') {
      return 'verifying';
    }
    if (liveHighlightedAsset?.provenanceStatus === 'verified' || (Array.isArray(liveHighlightedAsset?.verifiedProvenance) && liveHighlightedAsset.verifiedProvenance.length > 0)) {
      return 'verified';
    }
    return liveHighlightedAsset?.provenanceStatus || 'unverified';
  }, [activeAssetHighlight, verifyingAssetIds, liveHighlightedAsset]);

  const activeAssetMatches = useMemo(() => {
    if (!activeAssetHighlight || !scriptDraft) return [];
    // Only display verified provenance matches; never display raw unverified full-text hits directly
    if (activeProvenanceStatus !== 'verified') return [];
    if (Array.isArray(liveHighlightedAsset?.verifiedProvenance) && liveHighlightedAsset.verifiedProvenance.length > 0) {
      return resolveVerifiedProvenance(scriptDraft, tocItems, liveHighlightedAsset.verifiedProvenance, {
        assetName: liveHighlightedAsset.name || activeAssetHighlight.name,
      });
    }
    return [];
  }, [activeAssetHighlight, activeProvenanceStatus, liveHighlightedAsset, scriptDraft, tocItems]);

  const jumpToAssetMatch = useCallback((match: AssetProvenanceItem) => {
    if (activeTab !== 'script') {
      changeActiveTab('script');
    }

    const highlightSpans: AssetProvenanceHighlightSpan[] =
      Array.isArray(match.highlights) && match.highlights.length > 0
        ? match.highlights
        : (() => {
            const startChar = match.highlightCharIndex ?? match.firstMatchCharIndex ?? match.charIndex;
            const len =
              match.highlightText && match.highlightText.length > 0
                ? match.highlightText.length
                : match.matchedTerm && match.matchedTerm.length > 0
                  ? match.matchedTerm.length
                  : activeAssetHighlight ? activeAssetHighlight.name.length : 2;
            return [
              {
                charIndex: startChar,
                endCharIndex: startChar + len,
                text: scriptDraft.slice(startChar, startChar + len),
                lineNumber: match.lineNumber,
              },
            ];
          })();

    setActiveMultiHighlightSpans(highlightSpans);

    const firstSpan = highlightSpans[0];
    const jumpChar = firstSpan ? firstSpan.charIndex : (match.highlightCharIndex ?? match.firstMatchCharIndex ?? match.charIndex);
    setActiveProvenanceTargetChar(jumpChar);

    requestAnimationFrame(() => {
      cancelScriptPendingRestoreRef.current?.();
      editorRef.current?.scrollToOffset(jumpChar, { center: true, behavior: 'smooth' });
    });
  }, [activeAssetHighlight, activeTab, changeActiveTab, scriptDraft]);

  const handleJumpToToc = (item: TocItem) => {
    onTocOpenChange(false);
    if (activeTab !== 'script') {
      changeActiveTab('script');
    }

    const performJump = () => {
      cancelScriptPendingRestoreRef.current?.();
      editorRef.current?.scrollToOffset(item.charIndex, {
        center: false,
        behavior: 'smooth',
        select: true,
        selectLength: item.title.length,
      });
      editorRef.current?.focus();
    };

    if (activeTab === 'script') {
      requestAnimationFrame(() => {
        performJump();
      });
    } else {
      setTimeout(() => {
        requestAnimationFrame(() => {
          performJump();
        });
      }, 200);
    }
    onTocItemOpened({ id: item.id, title: item.title, lineNumber: item.lineNumber, type: item.type });
  };

  useEffect(() => {
    if (!requestedTocItemId) return;
    const item = tocItems.find(candidate => candidate.id === requestedTocItemId);
    if (item) handleJumpToToc(item);
  }, [requestedTocItemId, tocItems]);

  // Click outside or Escape to close TOC list card
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (tocCardRef.current?.contains(target) || tocButtonRef.current?.contains(target)) {
        return;
      }
      onTocOpenChange(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onTocOpenChange(false);
      }
    };
    if (isTocOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTocOpen, onTocOpenChange]);

  // Search and batch replace state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(`script_versions_${currentProject?.id}`) || "[]"); } catch { return []; }
  });
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [replaceFeedback, setReplaceFeedback] = useState<string | null>(null);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);



  const getPreviewText = () => {
    if (!previewVersionId) return scriptDraft;
    const activeVersion = versions.find(v => v.id === previewVersionId);
    if (!activeVersion) return scriptDraft;

    let targetText = activeVersion.scriptText;
    if (activeVersion.scale === 'scene_edit' && activeVersion.affectedScenes && activeVersion.affectedScenes[activeVersion.scene] && activeVersion.scene !== '全局' && tocItems.length > 0) {
        let rebuiltText = '';
        for (let i = 0; i < tocItems.length; i++) {
            if (tocItems[i].title === activeVersion.scene) {
                const start = tocItems[i].charIndex;
                const end = i < tocItems.length - 1 ? tocItems[i+1].charIndex : scriptDraft.length;
                rebuiltText = scriptDraft.slice(0, start) + activeVersion.affectedScenes[activeVersion.scene] + scriptDraft.slice(end);
                break;
            }
        }
        if (rebuiltText) targetText = rebuiltText;
    }
    return targetText;
  };
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute all match ranges in scriptDraft
  const searchMatches = useMemo(() => {
    if (!searchText) return [];
    const matches: { start: number; end: number }[] = [];
    const source = isCaseSensitive ? scriptDraft : scriptDraft.toLowerCase();
    const target = isCaseSensitive ? searchText : searchText.toLowerCase();
    let index = 0;
    while ((index = source.indexOf(target, index)) !== -1) {
      matches.push({ start: index, end: index + target.length });
      index += Math.max(1, target.length);
    }
    return matches;
  }, [scriptDraft, searchText, isCaseSensitive]);

  const safeMatchIndex = searchMatches.length > 0
    ? ((currentMatchIndex % searchMatches.length) + searchMatches.length) % searchMatches.length
    : 0;

  const jumpToMatch = useCallback((index: number) => {
    if (searchMatches.length === 0) return;
    const match = searchMatches[index];
    if (!match) return;

    cancelScriptPendingRestoreRef.current?.();
    editorRef.current?.scrollToOffset(match.start, {
      center: true,
      behavior: 'smooth',
      select: true,
      selectLength: match.end - match.start,
    });
    editorRef.current?.focus();

    const selText = scriptDraft.slice(match.start, match.end);
    const linesBefore = scriptDraft.slice(0, match.start).split('\n');
    const linesSelected = selText.split('\n');
    const lineStart = linesBefore.length;
    const lineEnd = lineStart + linesSelected.length - 1;
    onSelectionChange({ text: selText, start: match.start, end: match.end, lineStart, lineEnd });
  }, [searchMatches, scriptDraft, onSelectionChange]);

  const handleNextMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const next = (safeMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(next);
    jumpToMatch(next);
  }, [safeMatchIndex, searchMatches.length, jumpToMatch]);

  const handlePrevMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const prev = (safeMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prev);
    jumpToMatch(prev);
  }, [safeMatchIndex, searchMatches.length, jumpToMatch]);

  // When search keyword changes, jump to first match
  useEffect(() => {
    if (isSearchOpen && searchText && searchMatches.length > 0) {
      jumpToMatch(0);
      setCurrentMatchIndex(0);
    }
  }, [searchText, isCaseSensitive]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 80);
    }
  }, [isSearchOpen]);

  const handleDismissProvenanceHighlights = useCallback(() => {
    setActiveMultiHighlightSpans([]);
    setActiveProvenanceTargetChar(null);
    setActiveAssetHighlight(null);
    setActiveAssetMatchIndex(null);
  }, []);

  // Keyboard shortcuts: Ctrl+F (Search) and Escape (Dismiss Highlights) inside script panel
  useEffect(() => {
    if (!isOpen || activeTab !== 'script') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      } else if (e.key === 'Escape') {
        if (activeMultiHighlightSpans.length > 0) {
          handleDismissProvenanceHighlights();
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, activeMultiHighlightSpans.length, isSearchOpen, handleDismissProvenanceHighlights]);

  // Single replace
  const handleReplaceCurrent = useCallback(() => {
    if (searchMatches.length === 0) return;
    const match = searchMatches[safeMatchIndex];
    if (!match) return;
    const newScript = scriptDraft.slice(0, match.start) + replaceText + scriptDraft.slice(match.end);
    setScriptDraft(newScript);
    onUpdateProject({ scriptText: newScript });
    onSelectionChange(null);
    setReplaceFeedback('已替换 1 处');
    setTimeout(() => setReplaceFeedback(null), 2000);
  }, [searchMatches, safeMatchIndex, scriptDraft, replaceText, onUpdateProject, onSelectionChange]);

  // Batch replace all matches
  const handleReplaceAll = useCallback(() => {
    if (!searchText || searchMatches.length === 0) return;
    const count = searchMatches.length;
    let newScript = '';
    if (isCaseSensitive) {
      newScript = scriptDraft.replaceAll(searchText, replaceText);
    } else {
      const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      newScript = scriptDraft.replace(regex, replaceText);
    }
    setScriptDraft(newScript);
    onUpdateProject({ scriptText: newScript });
    onSelectionChange(null);
    setReplaceFeedback(`已批量替换 ${count} 处文本`);
    setTimeout(() => setReplaceFeedback(null), 2500);
  }, [searchText, searchMatches.length, isCaseSensitive, scriptDraft, replaceText, onUpdateProject, onSelectionChange]);

  // Sync script draft & per-project ephemeral state when currentProject changes
  useEffect(() => {
    const didProjectChange = prevProjectIdRef.current !== currentProject?.id;
    prevProjectIdRef.current = currentProject?.id;

    setScriptDraftEntry({
      projectId: currentProject?.id || '',
      text: currentProject?.scriptText || '',
    });
    lastAssessedTextRef.current = currentProject?.scriptText || '';
    setActiveMultiHighlightSpans([]);

    if (didProjectChange) {
      setActiveAssetHighlight(null);
      setFocusFeedAssetKey(null);
      setActiveAssetMatchIndex(null);
      setActiveProvenanceTargetChar(null);
      setPreviewVersionId(null);
      setCollapsedMultiVersionIds(new Set());
      setSelectedAssetIds(new Set());
      try {
        setVersions(JSON.parse(localStorage.getItem(`script_versions_${currentProject?.id}`) || '[]'));
      } catch {
        setVersions([]);
      }
    }

    if (Array.isArray(currentProject?.tocConfig?.patterns) && currentProject.tocConfig!.patterns!.length > 0) {
      setInferredPatterns(currentProject.tocConfig!.patterns!);
      return;
    }
    try {
      const saved = localStorage.getItem(`script_toc_patterns_${currentProject.id}`);
      setInferredPatterns(saved ? JSON.parse(saved) : []);
    } catch {
      setInferredPatterns([]);
    }
  }, [currentProject]);

  // Separate Card animation from CodeMirror rendering
  useEffect(() => {
    if (isOpen) {
      setIsAnimationSettled(false);
      // Wait exactly for card scale/opacity animation (200ms) to settle completely
      const timer = setTimeout(() => {
        setIsAnimationSettled(true);
      }, 210);
      return () => clearTimeout(timer);
    } else {
      setIsAnimationSettled(false);
    }
  }, [isOpen]);

  // Keep Script expand settled state aligned with visual shell expansion & mountExpandedContent
  useEffect(() => {
    setIsScriptExpandSettled(
      visualDock.scriptExpanded && widthTransitionPanels.script.mountExpandedContent
    );
  }, [visualDock.scriptExpanded, widthTransitionPanels.script.mountExpandedContent]);

  const scriptScrollSpec = useMemo(
    () => ({
      kind: 'script' as const,
      projectId: effectiveProjectId,
    }),
    [effectiveProjectId]
  );
  const scriptScopeKey = useMemo(
    () => buildScrollScopeKey(scriptScrollSpec),
    [scriptScrollSpec]
  );
  const scriptAnchorCacheRef = useRef<{ projectId: string; anchor: ScriptScrollAnchor } | null>(null);
  const readScriptAnchor = useCallback((): ScriptScrollAnchor => {
    if (typeof window === 'undefined') return { top: 0 };
    if (scriptAnchorCacheRef.current?.projectId === effectiveProjectId) {
      return scriptAnchorCacheRef.current.anchor;
    }
    const anchor = readScriptScrollAnchorFromStorage(window.localStorage, effectiveProjectId);
    scriptAnchorCacheRef.current = { projectId: effectiveProjectId, anchor };
    return anchor;
  }, [effectiveProjectId]);

  const isScriptTransitioning =
    isScriptShellWidthTransitioning ||
    widthTransitionPanels.script.hidden ||
    widthTransitionPanels.script.opacity < 1;

  const isScriptReadyToMount =
    isAnimationSettled &&
    isScriptExpandSettled &&
    isOpen &&
    activeTab === 'script' &&
    visualDock.scriptExpanded &&
    widthTransitionPanels.script.mountExpandedContent &&
    !widthTransitionPanels.script.hidden;

  const scriptScrollMemory = useUnifiedPanelScrollMemory({
    scopeKey: scriptScopeKey,
    readPersistedScrollTop: () => readScriptAnchor().top,
    captureScrollMetadata: () => editorRef.current?.getScrollAnchor() ?? null,
    writePersistedScrollTop: (top, metadata) => {
      if (typeof window !== 'undefined') {
        const metaAnchor =
          metadata && typeof metadata === 'object' ? (metadata as ScriptScrollAnchor) : null;
        const nextAnchor: ScriptScrollAnchor = metaAnchor
          ? { ...metaAnchor, top }
          : { top };
        scriptAnchorCacheRef.current = { projectId: effectiveProjectId, anchor: nextAnchor };
        writeScriptScrollAnchorToStorage(window.localStorage, effectiveProjectId, nextAnchor);
      }
    },
    resolveRestoreTargetTop: () => {
      const anchor = readScriptAnchor();
      if (typeof anchor.anchorPos !== 'number') {
        return anchor.top;
      }
      const resolved = editorRef.current?.resolveScrollTopForAnchor(anchor);
      return typeof resolved === 'number' ? resolved : anchor.top;
    },
    getScrollElement: () => editorRef.current?.getEditorView()?.scrollDOM ?? null,
    isActiveAndVisible: isScriptReadyToMount,
    isTransitioning: isScriptTransitioning,
    isFilteredView: Boolean(previewVersionId),
    contentVersion: `${effectiveProjectId}:${scriptDraft.length}:${activeMultiHighlightSpans.length}`,
    maxWaitMs: 1800,
    attachSignal: scriptEditorMountNonce,
  });

  cancelScriptPendingRestoreRef.current = scriptScrollMemory.cancelPendingRestore;
  const isPositionReady = scriptScrollMemory.isPositionReady;

  const handleScriptScroll = useCallback(
    (top: number) => {
      scriptScrollMemory.handleScrollEvent(top);
    },
    [scriptScrollMemory.handleScrollEvent]
  );

  // Click outside to close project dropdown menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
        setEditingProjectId(null);
        setDeletingProjectId(null);
        setIsCreatingNew(false);
      }
    };
    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectDropdownOpen]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingNew(false);
    }
  };

  const totalAssets =
    (currentProject.characters?.length || 0) +
    (currentProject.locations?.length || 0) +
    (currentProject.props?.length || 0);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  
  const triggerAssessChange = async (val: string, scene: string, offset: number) => {
    try {
      const oldText = lastAssessedTextRef.current;
      if (val === oldText) return;
      
      setVersionStatus('分析意图中...');
      const char_delta = val.length - oldText.length;
      
      let action = 'type';
      if (Math.abs(char_delta) > 50) action = 'paste_or_delete';
      
      const Diff = await import('diff');
      const diffs = Diff.diffChars(oldText, val);
      
      let diffStartOld = oldText.length;
      let diffEndOld = 0;
      let diffStartNew = val.length;
      let diffEndNew = 0;
      
      let oldIndex = 0;
      let newIndex = 0;
      
      for (const part of diffs) {
          if (part.added || part.removed) {
              diffStartOld = Math.min(diffStartOld, oldIndex);
              diffStartNew = Math.min(diffStartNew, newIndex);
              
              diffEndOld = Math.max(diffEndOld, oldIndex + (part.removed ? part.value.length : 0));
              diffEndNew = Math.max(diffEndNew, newIndex + (part.added ? part.value.length : 0));
          }
          
          if (!part.added) {
              oldIndex += part.value.length;
          }
          if (!part.removed) {
              newIndex += part.value.length;
          }
      }
      
      const padding = 150;
      const extractStart = Math.max(0, Math.min(diffStartOld, diffStartNew) - padding);
      const extractEndOld = Math.min(oldText.length, diffEndOld + padding);
      const extractEndNew = Math.min(val.length, diffEndNew + padding);

      const before_snippet = oldText.slice(extractStart, extractEndOld);
      const after_snippet = val.slice(extractStart, extractEndNew);

      const requestBody = {
        action,
        affected_scene_orders: [scene],
        char_delta,
        before_snippet,
        after_snippet
      };
      
      const startedAt = Date.now();
      const res = await fetch('/api/script/assess-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (res.ok) {
        const data = await res.json();
        const duration = Date.now() - startedAt;
        
        // Log to Node Debugger
        try {
          const timestamp = new Date().toLocaleTimeString();
          const logLine = `[${timestamp}] 运行完成 (${duration}ms) => ${JSON.stringify(data)}`;
          let existingLogs = [];
          try { existingLogs = JSON.parse(localStorage.getItem('change_assess_logs') || '[]'); } catch {}
          existingLogs.unshift(logLine);
          if (existingLogs.length > 50) existingLogs = existingLogs.slice(0, 50);
          localStorage.setItem('change_assess_logs', JSON.stringify(existingLogs));
          
          // Save result data
          localStorage.setItem('last_change_assess_result', JSON.stringify(data, null, 2));
          // Save raw input data so it shows up exactly in SettingsPage
          localStorage.setItem('last_change_assess_raw_input', JSON.stringify(requestBody, null, 2));
          
          // We also need to save the formatted requestInput (system + user prompt)
          const systemPromptStr = '你是一个剧本版本意图判定助手。请仔细对比 before_snippet 和 after_snippet 评估修改级别(trivial/scene_edit/structural)。关键要求：summary 必须极其具体地说明改了什么内容。根据实际动作选择最贴切的句式，例如：删除操作用“删除了[某某剧情/词语]”；新增操作用“新增了[某某剧情/词语]”；替换操作用“将[原内容]改为[新内容]”。不要写“改台词”等模糊废话，也不要生硬套用替换句式。限制在15字以内。必须输出 JSON：{"scale":"trivial"|"scene_edit"|"structural", "summary":string}';
          const requestInputStr = `[SYSTEM]\n${systemPromptStr}\n\n[USER]\n${JSON.stringify(requestBody, null, 2)}`;
          localStorage.setItem('last_change_assess_request', requestInputStr);
        } catch (e) {}

        const statusText = data.scale === 'trivial' ? '已保存 (微调)' : (data.scale === 'scene_edit' ? `${scene}已暂存: ${data.summary}` : `里程碑更新: ${data.summary}`);
        setVersionStatus(statusText);
        setVersions(prev => {
             // Generate incremental snapshot
             let sceneText = val;
             let globalOrderSnapshot = ['全局'];
             // Find current scene boundaries if it's a scene edit
             if (data.scale === 'scene_edit' && tocItems && tocItems.length > 0) {
                 for (let i = 0; i < tocItems.length; i++) {
                     if (tocItems[i].title === scene) {
                         const start = tocItems[i].charIndex;
                         const end = i < tocItems.length - 1 ? tocItems[i+1].charIndex : val.length;
                         sceneText = val.slice(start, end);
                         break;
                     }
                 }
                 globalOrderSnapshot = tocItems.map(item => item.title);
             }

             const newVersions = [{
               id: Date.now().toString(),
               timestamp: Date.now(),
               summary: data.summary,
               scale: data.scale,
               scene: scene,
               affectedScenes: { [scene]: sceneText },
               globalOrderSnapshot: globalOrderSnapshot,
               scriptText: val // Keep fallback
             }, ...prev].slice(0, 50);
             try { localStorage.setItem(`script_versions_${currentProject.id}`, JSON.stringify(newVersions)); } catch {}
             return newVersions;
           });
      } else {
         setVersionStatus('已保存');
      }
      
      lastAssessedTextRef.current = val;
    } catch (e) {
      setVersionStatus('已保存 (离线)');
    }
  };

  const updateSceneIndicator = (val: string, cursorOffset: number) => {
    let currentScene = '全局';
    for (let i = tocItems.length - 1; i >= 0; i--) {
        if (cursorOffset >= tocItems[i].charIndex) {
            currentScene = tocItems[i].title;
            break;
        }
    }
    setCurrentSceneIndicator(currentScene);
    return currentScene;
  };

  useEffect(() => {
    if (!autoSaveEnabled && typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
    }
  }, [autoSaveEnabled]);

  const editorAnnotations = useMemo<ScriptAnnotation[]>(() => {
    const list: ScriptAnnotation[] = [];

    // 1. Search & Replace highlights
    if (searchMatches.length > 0) {
      searchMatches.forEach((m, idx) => {
        list.push({
          id: `search-${idx}-${m.start}`,
          from: m.start,
          to: m.end,
          category: 'search',
          active: idx === safeMatchIndex,
          colorVariant: 'amber',
        });
      });
    }

    // 2. Provenance highlights
    if (activeMultiHighlightSpans.length > 0) {
      activeMultiHighlightSpans.forEach((sp, idx) => {
        const isTarget = activeProvenanceTargetChar !== null
          ? sp.charIndex === activeProvenanceTargetChar
          : idx === 0;

        list.push({
          id: `prov-${idx}-${sp.charIndex}`,
          from: sp.charIndex,
          to: sp.endCharIndex,
          category: 'provenance',
          name: sp.text,
          active: isTarget,
          badgeText: activeMultiHighlightSpans.length > 1 ? `${idx + 1}` : undefined,
          badgeTooltip: `出处条目 ${idx + 1}/${activeMultiHighlightSpans.length}: ${sp.text} (点击聚焦)`,
          colorVariant: 'blue',
          onClick: () => {
            setActiveProvenanceTargetChar(sp.charIndex);
          },
        });
      });
    }

    return list;
  }, [searchMatches, safeMatchIndex, activeMultiHighlightSpans, activeProvenanceTargetChar]);

  const handleScriptTextChange = useCallback((val: string) => {
    setScriptDraft(val);
    if (activeMultiHighlightSpans.length > 0) {
      setActiveMultiHighlightSpans([]);
      setActiveProvenanceTargetChar(null);
    }
    onUpdateProject({ scriptText: val });

    const cursorOffset = editorRef.current?.getSelection().start || 0;
    const scene = updateSceneIndicator(val, cursorOffset);
    setVersionStatus('有未保存改动');

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (autoSaveEnabled) {
      typingTimerRef.current = setTimeout(() => {
        triggerAssessChange(val, scene, cursorOffset);
      }, 3000);
    }
  }, [activeMultiHighlightSpans.length, autoSaveEnabled, onUpdateProject, triggerAssessChange]);

  const handleSaveRename = (projectId: string) => {
    if (editingProjectName.trim()) {
      onRenameProject(projectId, editingProjectName.trim());
    }
    setEditingProjectId(null);
  };

  return (
    <>
      {/* Single Unified Capsule Entry (Top-Left Floating Trigger Group) */}
      <div 
        className="fixed top-4 left-4 z-[70] flex items-center gap-1.5" 
        ref={dropdownRef}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          data-agent-target="script-bible-toggle"
          data-agent-actions="mouse.move mouse.click mouse.hover"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          className={`flex items-center gap-2 px-3.5 h-[36px] border rounded-2xl corner-squircle transition-all group ${
            isOpen
              ? 'bg-gray-200 dark:bg-neutral-700/80 border-gray-300 dark:border-white/15 shadow-sm'
              : 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-[#404040] shadow-md hover:bg-gray-50 dark:hover:bg-neutral-700'
          }`}
          title={isOpen ? "收起剧本卡片" : "打开剧本与项目控制中心"}
        >
          <span className="text-sm font-bold text-gray-900 dark:text-neutral-100 max-w-[180px] truncate tracking-tight flex items-center">
            {currentProject.name}
          </span>

          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[11px] font-semibold tracking-tight whitespace-nowrap flex items-center justify-center">
            剧本&资产
          </span>
        </button>

        {/* Dropdown Button for Switching Projects placed to the right */}
        <button
          onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
          className={`w-[36px] h-[36px] rounded-2xl corner-squircle bg-gray-100 dark:bg-neutral-800 border shadow-md flex items-center justify-center transition-all ${
            isProjectDropdownOpen
              ? 'border-blue-500/80 ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'border-gray-300 dark:border-[#404040] text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
          }`}
          title="切换剧本项目"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isProjectDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
            }`}
          />
        </button>

        {/* Project Dropdown Menu */}
        <AnimatePresence>
          {isProjectDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-11 w-64 bg-gray-100 dark:bg-neutral-800 border border-gray-100 dark:border-[#404040] rounded-2xl corner-squircle shadow-2xl p-2 z-50 flex flex-col gap-1"
            >
              <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>剧本项目列表</span>
                <span className="text-[10px] lowercase font-normal">{projects.length} 个项目</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (editingProjectId !== proj.id && deletingProjectId !== proj.id) {
                        onSelectProject(proj.id);
                        setIsProjectDropdownOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl corner-squircle text-xs cursor-pointer group transition-colors ${
                      proj.id === currentProject.id
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200'
                    }`}
                  >
                    {editingProjectId === proj.id ? (
                      <div
                        className="flex items-center gap-1.5 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(proj.id);
                            if (e.key === 'Escape') setEditingProjectId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-gray-100 dark:bg-neutral-800 text-xs px-2 py-1 rounded-lg corner-squircle outline-none text-gray-900 dark:text-white border border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(proj.id)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg corner-squircle"
                          title="保存名称"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProjectId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg corner-squircle"
                          title="取消"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : deletingProjectId === proj.id ? (
                      <div
                        className="flex items-center justify-between w-full gap-2 py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                          确认删除「{proj.name}」？
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteProject(proj.id);
                              setDeletingProjectId(null);
                            }}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium rounded-md corner-squircle transition-colors"
                          >
                            删除
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProjectId(null)}
                            className="px-1.5 py-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-[11px] rounded-md corner-squircle"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="truncate pr-2">{proj.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {proj.id === currentProject.id && <Check className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProjectId(null);
                              setEditingProjectId(proj.id);
                              setEditingProjectName(proj.name);
                            }}
                            className="p-1 opacity-60 hover:opacity-100 text-gray-400 hover:text-blue-500 rounded-lg corner-squircle transition-opacity"
                            title="重命名项目"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (projects.length <= 1) return;
                              setEditingProjectId(null);
                              setDeletingProjectId(proj.id);
                            }}
                            disabled={projects.length <= 1}
                            className={`p-1 rounded-lg corner-squircle transition-all ${
                              projects.length <= 1
                                ? 'text-gray-300 dark:text-neutral-600 cursor-not-allowed opacity-30'
                                : 'opacity-60 hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                            }`}
                            title={projects.length <= 1 ? "至少保留一个项目" : "删除项目"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Create New Project Section */}
              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-[#404040]">
                {!isCreatingNew ? (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl corner-squircle transition-colors font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新建项目
                  </button>
                ) : (
                  <form onSubmit={handleCreateSubmit} className="flex flex-col gap-1.5 p-1">
                    <input
                      type="text"
                      placeholder="输入新项目名称..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsCreatingNew(false);
                          setNewProjectName('');
                        }
                      }}
                      autoFocus
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg corner-squircle bg-gray-100 dark:bg-neutral-800 border border-blue-500 text-gray-900 dark:text-neutral-100 outline-none"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNew(false);
                          setNewProjectName('');
                        }}
                        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg corner-squircle transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={!newProjectName.trim()}
                        className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg corner-squircle font-medium transition-colors"
                      >
                        创建
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Script & Project Hub Floating System: 分离卡片布局 (上菜单卡片 + 下正文卡片) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
            ref={cardContainerRef}
            variants={leftCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            data-dock-card="true"
            data-prevent-canvas-wheel="true"
            data-agent-target={visualDock.scriptExpanded ? 'script.panel' : 'script.collapsed'}
            onMouseEnter={() => {
              if (!visualDock.scriptExpanded) handleMiniCardMouseEnter('script');
            }}
            onMouseMove={(e) => {
              if (!visualDock.scriptExpanded) handleMiniCardMouseMove(e, 'script');
            }}
            onMouseLeave={() => {
              if (!visualDock.scriptExpanded) handleMiniCardMouseLeave('script');
            }}
            style={{
              left: `${dockLayout.script.left}px`,
              width: `${dockLayout.script.width}px`,
              zIndex: dockLayout.script.zIndex,
              transitionProperty: 'left, width, height, box-shadow',
              transitionDuration: `${WIDTH_TRANSITION_TIMINGS.shellResizeMs}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              ...(dockLayout.script.expanded
                ? { maxWidth: `${dockLayout.script.maxWidth}px` }
                : { height: `${dockLayout.script.height ?? 112}px` }),
            }}
            className={`fixed top-[58px] flex pointer-events-auto transform-gpu bg-[#f3f4f6] dark:bg-[#1C1C1E] border corner-squircle overflow-hidden ${
              visualDock.scriptExpanded
                ? `bottom-4 flex-col select-text rounded-[24px] shadow-2xl ${
                    agentFocusedTargetId === 'script.text' || agentFocusedTargetId === 'script.panel'
                      ? 'border-purple-500/80 ring-2 ring-purple-500/50'
                      : 'border-gray-300 dark:border-white/10'
                  }`
                : `select-none rounded-[20px] group ${
                    hoveredMiniPanel === 'script'
                      ? 'shadow-xl border-blue-500/60'
                      : 'border-gray-300 dark:border-white/10 shadow-md'
                  }`
            }`}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {!visualDock.scriptExpanded ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredMiniPanel((prev) => (prev === 'script' ? null : prev));
                  applyDockTransition({ scriptExpanded: true });
                }}
                aria-label="展开剧本正文面板"
                title="放大剧本正文面板"
                style={{
                  opacity: widthTransitionPanels.script.miniOpacity,
                  visibility: widthTransitionPanels.script.miniHidden ? 'hidden' : 'visible',
                  pointerEvents:
                    widthTransitionPanels.script.miniOpacity < 1 || widthTransitionPanels.script.miniHidden
                      ? 'none'
                      : undefined,
                  transition:
                    widthTransitionPanels.script.fadeDurationMs > 0
                      ? `opacity ${widthTransitionPanels.script.fadeDurationMs}ms ease-out`
                      : undefined,
                }}
                className={`w-full h-full flex flex-col justify-center py-2.5 select-none overflow-hidden cursor-pointer ${
                  dockLayout.script.miniAlign === 'right'
                    ? 'items-end pr-2 pl-1'
                    : dockLayout.script.miniAlign === 'left'
                      ? 'items-start pl-2 pr-1'
                      : 'items-center px-1.5'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/80 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-400/50 transition-colors shadow-2xs shrink-0">
                    <Maximize2 className="w-3 h-3" />
                  </span>
                  <div className="flex flex-col items-center gap-1">
                    <BookText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="[writing-mode:vertical-lr] tracking-[0.2em] text-xs font-black text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                      剧本
                    </span>
                  </div>
                </div>
              </button>
            ) : !widthTransitionPanels.script.mountExpandedContent ? null : (
            <div
              style={{
                opacity: widthTransitionPanels.script.opacity,
                visibility: widthTransitionPanels.script.hidden ? 'hidden' : 'visible',
                pointerEvents:
                  widthTransitionPanels.script.opacity < 1 || widthTransitionPanels.script.hidden
                    ? 'none'
                    : undefined,
                transition:
                  widthTransitionPanels.script.fadeDurationMs > 0
                    ? `opacity ${widthTransitionPanels.script.fadeDurationMs}ms ease-out`
                    : undefined,
                ...(widthTransitionPanels.script.frozenWidth != null
                  ? {
                      width: `${widthTransitionPanels.script.frozenWidth}px`,
                      minWidth: `${widthTransitionPanels.script.frozenWidth}px`,
                      maxWidth: `${widthTransitionPanels.script.frozenWidth}px`,
                      flexShrink: 0,
                    }
                  : {}),
              }}
              className="flex flex-col h-full w-full min-h-0 overflow-hidden"
            >
            {/* 上卡片: 菜单与工具栏面板 */}
            <div
              className="shrink-0 relative z-0 border-b border-gray-300/80 dark:border-white/[0.04]"
              onPointerDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Direct Top Tabs Header */}
              <div className="pl-[22px] pr-3.5 pt-3 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <BookText className="w-4 h-4" />
                    <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">剧本正文</span>
                  </div>
                </div>

                {/* Right action: Collapse / Minimize button */}
                <button
                  type="button"
                  onClick={() => {
                    setHoveredMiniPanel((prev) => (prev === 'script' ? null : prev));
                    applyDockTransition({ scriptExpanded: false });
                  }}
                  aria-label="收起剧本正文面板"
                  data-agent-target="script.collapse"
                  data-agent-actions="mouse.move mouse.click mouse.hover"
                  className="p-1.5 rounded-xl corner-squircle text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="缩小剧本正文面板"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Secondary Menu */}
              {activeTab === 'script' && (
                <div className="px-3.5 pb-2.5 pt-0.5">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {/* Subordinate: 目录 Button */}
                        <button
                          ref={tocButtonRef}
                          type="button"
                          data-agent-target="script.toc.open"
                          data-agent-actions="mouse.move mouse.click mouse.hover"
                          data-agent-badge={tocItems.length > 0 ? String(tocItems.length) : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTocOpenChange(!isTocOpen);
                          }}
                          title="剧本目录 / 场景章节快速跳转"
                          aria-expanded={isTocOpen}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg corner-squircle text-xs font-semibold transition-colors ${
                            isTocOpen
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {isInferringToc ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>目录</span>
                          )}
                          {!isInferringToc && tocItems.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full corner-squircle text-[10px] bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium">
                              {tocItems.length}
                            </span>
                          )}
                        </button>

                        {/* Search & Batch Replace Button */}
                        <button
                          type="button"
                          data-agent-target="script.search.open"
                          data-agent-actions="mouse.move mouse.click mouse.hover"
                          onClick={() => setIsSearchOpen(prev => !prev)}
                          title="搜索正文与批量替换 (Ctrl+F)"
                          aria-expanded={isSearchOpen}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg corner-squircle text-xs font-semibold transition-colors ${
                            isSearchOpen
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <span>搜索替换</span>
                        </button>

                        {/* Version History Button */}
                        <button
                          type="button"
                          data-agent-target="script.version.open"
                          data-agent-actions="mouse.move mouse.click mouse.hover"
                          title="剧本版本历史与快照管理"
                          onClick={() => setIsVersionOpen(prev => !prev)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg corner-squircle text-xs font-semibold transition-colors ${isVersionOpen ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"}`}
                        >
                          <span>版本管理</span>
                        </button>

                        <div className="h-4 w-px bg-gray-200 dark:bg-neutral-700 ml-1 shrink-0" aria-hidden="true" />
                      </div>
                      
                      <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center gap-2 pr-1.5 select-none min-w-0 flex-1 justify-end">
                        <span data-agent-target="script.scene.indicator" title={currentSceneIndicator} className="max-w-[120px] sm:max-w-[200px] truncate px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                          {currentSceneIndicator}
                        </span>
                        <span className="shrink-0">·</span>
                        <span data-agent-target="script.version.status" className="truncate shrink-0" title={versionStatus}>
                          {versionStatus}
                        </span>
                      </div>
                    </div>

                    {/* Search & Batch Replace Panel: 直接融入菜单浅蓝背景中，无多余卡片嵌套 */}
                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div
                          data-agent-target="script.search.panel"
                          data-agent-actions="mouse.move mouse.hover"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                              height: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                              opacity: { duration: 0.14, ease: 'easeOut' },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: { duration: 0.14, ease: [0.32, 0, 0.67, 0] },
                              opacity: { duration: 0.1, ease: 'easeIn' },
                            },
                          }}
                          className="overflow-hidden shrink-0"
                        >
                          <div className="px-1.5 pb-1.5 pt-1.5 grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5 items-center text-xs border-t border-gray-100 dark:border-neutral-700/80 mt-1">
                            {/* Row 1, Col 1: Search input */}
                            <div className="relative flex items-center min-w-0">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                              <input
                                ref={searchInputRef}
                                type="text"
                                data-agent-target="script.search.input"
                                data-agent-actions="mouse.move mouse.click mouse.type mouse.keyPress"
                                data-agent-badge={searchText ? (searchMatches.length > 0 ? `${safeMatchIndex + 1}/${searchMatches.length}` : '0') : undefined}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (e.shiftKey) handlePrevMatch();
                                    else handleNextMatch();
                                  } else if (e.key === 'Escape') {
                                    setIsSearchOpen(false);
                                  }
                                }}
                                placeholder="搜索正文文本 (Enter 下一个，Shift+Enter 上一个)..."
                                className="w-full pl-8 pr-20 h-7.5 rounded-lg corner-squircle bg-[#f9fafb] dark:bg-neutral-850 border border-gray-200/90 dark:border-[#404040] text-gray-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-neutral-500"
                              />
                              {/* Counter */}
                              <div className="absolute right-2 text-[10px] font-mono select-none flex items-center">
                                {searchText ? (
                                  searchMatches.length > 0 ? (
                                    <span
                                      data-agent-target="script.search.counter"
                                      data-agent-actions="mouse.hover"
                                      data-agent-badge={searchMatches.length}
                                      aria-label={`搜索结果: ${safeMatchIndex + 1}/${searchMatches.length}`}
                                      className="text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-700/80 px-1.5 py-0.5 rounded corner-squircle font-medium"
                                    >
                                      {safeMatchIndex + 1}/{searchMatches.length}
                                    </span>
                                  ) : (
                                    <span
                                      data-agent-target="script.search.counter"
                                      data-agent-actions="mouse.hover"
                                      data-agent-badge="0"
                                      aria-label="搜索结果: 无匹配"
                                      className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded corner-squircle font-medium"
                                    >
                                      无匹配
                                    </span>
                                  )
                                ) : null}
                              </div>
                            </div>

                            {/* Row 1, Col 2: Search controls */}
                            <div className="flex items-center justify-end gap-1 shrink-0">
                              {/* Case Sensitive */}
                              <button
                                type="button"
                                data-agent-target="script.search.case"
                                data-agent-actions="mouse.move mouse.click mouse.hover"
                                aria-pressed={isCaseSensitive}
                                onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                                title={isCaseSensitive ? '区分大小写: 开' : '区分大小写: 关'}
                                className={`w-7.5 h-7.5 px-2 rounded-lg corner-squircle font-mono text-xs flex items-center justify-center transition-all ${
                                  isCaseSensitive
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'bg-[#f9fafb] dark:bg-neutral-850 border border-gray-200/90 dark:border-[#404040] text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
                                }`}
                              >
                                Aa
                              </button>
                              {/* Prev Match */}
                              <button
                                type="button"
                                data-agent-target="script.search.prev"
                                data-agent-actions="mouse.move mouse.click mouse.hover"
                                disabled={searchMatches.length === 0}
                                onClick={handlePrevMatch}
                                title="上一个匹配项 (Shift+Enter)"
                                className="w-7.5 h-7.5 rounded-lg corner-squircle bg-[#f9fafb] dark:bg-neutral-850 border border-gray-200/90 dark:border-[#404040] hover:bg-gray-100 dark:hover:bg-neutral-750 disabled:opacity-30 disabled:pointer-events-none text-gray-600 dark:text-neutral-300 flex items-center justify-center transition-all"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              {/* Next Match */}
                              <button
                                type="button"
                                data-agent-target="script.search.next"
                                data-agent-actions="mouse.move mouse.click mouse.hover"
                                disabled={searchMatches.length === 0}
                                onClick={handleNextMatch}
                                title="下一个匹配项 (Enter)"
                                className="w-7.5 h-7.5 rounded-lg corner-squircle bg-[#f9fafb] dark:bg-neutral-850 border border-gray-200/90 dark:border-[#404040] hover:bg-gray-100 dark:hover:bg-neutral-750 disabled:opacity-30 disabled:pointer-events-none text-gray-600 dark:text-neutral-300 flex items-center justify-center transition-all"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Row 2, Col 1: Replace input */}
                            <div className="relative flex items-center min-w-0">
                              <Replace className="w-3.5 h-3.5 absolute left-2.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                              <input
                                type="text"
                                data-agent-target="script.replace.input"
                                data-agent-actions="mouse.move mouse.click mouse.type mouse.keyPress"
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleReplaceCurrent();
                                  }
                                }}
                                placeholder="替换为..."
                                className="w-full pl-8 pr-3 h-7.5 rounded-lg corner-squircle bg-[#f9fafb] dark:bg-neutral-850 border border-gray-200/90 dark:border-[#404040] text-gray-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-neutral-500"
                              />
                            </div>

                            {/* Row 2, Col 2: Replace actions */}
                            <div className="flex items-center justify-end gap-1 shrink-0">
                              {/* Replace Single */}
                              <button
                                type="button"
                                data-agent-target="script.replace.single"
                                data-agent-actions="mouse.move mouse.click mouse.hover"
                                disabled={searchMatches.length === 0}
                                onClick={handleReplaceCurrent}
                                title="替换当前选中的匹配项"
                                className="h-7.5 px-2.5 rounded-lg corner-squircle bg-[#f9fafb] dark:bg-neutral-850 border border-gray-200/90 dark:border-[#404040] hover:bg-gray-100 dark:hover:bg-neutral-750 disabled:opacity-30 disabled:pointer-events-none text-gray-700 dark:text-neutral-200 font-medium text-xs transition-all whitespace-nowrap"
                              >
                                替换
                              </button>
                              {/* Replace All (批量替换) */}
                              <button
                                type="button"
                                data-agent-target="script.replace.all"
                                data-agent-actions="mouse.move mouse.click mouse.hover"
                                disabled={searchMatches.length === 0}
                                data-agent-badge={searchMatches.length}
                                onClick={handleReplaceAll}
                                title="批量替换全文中的所有匹配项"
                                className="h-7.5 px-2.5 rounded-lg corner-squircle bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none text-white font-medium text-xs shadow-xs transition-all whitespace-nowrap flex items-center gap-1.5"
                              >
                                <span>全部替换</span>
                                {searchMatches.length > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full corner-squircle text-[10px] bg-blue-500 text-white font-bold font-mono">
                                    {searchMatches.length}
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Feedback message if any */}
                            {replaceFeedback && (
                              <div
                                role="alert"
                                data-agent-target="script.replace.feedback"
                                data-agent-actions="mouse.hover"
                                className="col-span-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-0.5"
                              >
                                <Check className="w-3 h-3" />
                                <span>{replaceFeedback}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isVersionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                              height: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                              opacity: { duration: 0.14, ease: 'easeOut' },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: { duration: 0.14, ease: [0.32, 0, 0.67, 0] },
                              opacity: { duration: 0.1, ease: 'easeIn' },
                            },
                          }}
                          className="overflow-hidden shrink-0"
                        >
                          <div className="px-1.5 pb-1.5 pt-1.5 flex flex-col gap-0.5 border-t border-gray-100 dark:border-neutral-700/80 mt-1 max-h-[300px] overflow-y-auto">
                            <div className="flex items-center justify-between mb-1 px-1">
                               <div className="flex items-center gap-3">
                                   <h4 className="text-[11px] font-semibold text-gray-500 dark:text-neutral-500">版本历史</h4>
                                   <label className="flex items-center gap-1.5 cursor-pointer" title="开启后，将在您停止输入3秒后自动检测并记录版本">
                                       <div className={`w-6 h-3.5 rounded-full relative transition-colors ${autoSaveEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-neutral-600'}`}>
                                           <div className={`absolute top-[2px] left-[2px] bg-white w-2.5 h-2.5 rounded-full shadow-sm transition-transform ${autoSaveEnabled ? 'translate-x-2.5' : 'translate-x-0'}`}></div>
                                       </div>
                                       <input type="checkbox" className="sr-only" checked={autoSaveEnabled} onChange={(e) => setAutoSaveEnabled(e.target.checked)} />
                                       <span className="text-[10px] text-gray-500 dark:text-neutral-400 select-none">自动保存改动</span>
                                   </label>
                               </div>
                               <button 
                                  onClick={() => {
                                      if (scriptDraft === lastAssessedTextRef.current) {
                                          setVersionStatus('内容未改变');
                                          setTimeout(() => setVersionStatus('已同步'), 2000);
                                      } else {
                                          triggerAssessChange(scriptDraft, currentSceneIndicator, editorRef.current?.getSelection().start || 0);
                                      }
                                  }}
                                  className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded corner-squircle hover:bg-blue-500/20 transition-colors">
                                  + 保存改动
                               </button>
                            </div>
                            {versions.length === 0 ? (
                              <div className="text-center py-3 text-[11px] text-gray-400">暂无版本记录，稍后的改动将自动沉淀。</div>
                            ) : (
                              versions.map((ver, idx) => (
                                <div
                                  key={ver.id}
                                  data-agent-target={`script.version.item.${ver.id}`}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg corner-squircle transition-colors flex items-center justify-between group ${
                                    idx === 0 
                                      ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                      : previewVersionId === ver.id
                                        ? 'bg-blue-50/30 dark:bg-blue-900/10 text-blue-500'
                                        : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0 flex items-center gap-2">
                                      {idx === 0 ? (
                                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500" />
                                      ) : (
                                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gray-300 dark:bg-neutral-600" />
                                      )}
                                      <span className="font-medium truncate text-[12px] leading-tight" title={ver.summary}>
                                        {ver.summary}
                                      </span>
                                      {idx === 0 && (
                                        <span className="px-1 py-0.5 rounded text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold ml-1 flex-shrink-0">
                                          当前
                                        </span>
                                      )}
                                  </div>
                                  <div className="relative flex items-center justify-end shrink-0 min-w-[90px]">
                                      <div className={`flex items-center gap-2 transition-opacity duration-150 ${idx === 0 ? 'text-blue-400/70' : 'text-gray-400 group-hover:opacity-0'}`}>
                                          <span className="text-[10px] font-mono flex-shrink-0">
                                            {new Date(ver.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </span>
                                          <span className="text-[10px] w-12 text-right truncate" title={ver.scene}>
                                             {ver.scene}
                                          </span>
                                      </div>
                                      
                                      {idx === 0 ? null : (
                                        <div className="absolute inset-y-0 right-0 flex items-center justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
                                            <button 
                                                onClick={() => {
                                                    if (previewVersionId === ver.id) {
                                                        setPreviewVersionId(null);
                                                    } else {
                                                        setPreviewVersionId(ver.id);
                                                        
                                                        // Attempt to find diff to highlight and scroll
                                                        const getVersionText = () => {
                                                            let targetText = ver.scriptText;
                                                            if (ver.scale === 'scene_edit' && ver.affectedScenes && ver.affectedScenes[ver.scene] && ver.scene !== '全局' && tocItems.length > 0) {
                                                                let rebuiltText = '';
                                                                for (let i = 0; i < tocItems.length; i++) {
                                                                    if (tocItems[i].title === ver.scene) {
                                                                        const start = tocItems[i].charIndex;
                                                                        const end = i < tocItems.length - 1 ? tocItems[i+1].charIndex : scriptDraft.length;
                                                                        rebuiltText = scriptDraft.slice(0, start) + ver.affectedScenes[ver.scene] + scriptDraft.slice(end);
                                                                        break;
                                                                    }
                                                                }
                                                                if (rebuiltText) targetText = rebuiltText;
                                                            }
                                                            return targetText;
                                                        };
                                                        
                                                        const pText = getVersionText();
                                                        let diffStart = 0;
                                                        
                                                        if (ver.scale === 'scene_edit' && ver.scene && ver.scene !== '全局') {
                                                            // Find the scene heading in the text
                                                            const sceneIdx = pText.indexOf(ver.scene);
                                                            if (sceneIdx !== -1) {
                                                                diffStart = sceneIdx;
                                                            }
                                                        } else {
                                                            // For global edits, diff against the PREVIOUS version to find what changed then
                                                            const prevVer = versions[idx + 1];
                                                            if (prevVer) {
                                                                const oText = prevVer.scriptText;
                                                                while (diffStart < oText.length && diffStart < pText.length && oText[diffStart] === pText[diffStart]) {
                                                                    diffStart++;
                                                                }
                                                            }
                                                        }
                                                        
                                                        // Select in preview editor
                                                        setTimeout(() => {
                                                            editorRef.current?.scrollToOffset(diffStart, {
                                                                center: true,
                                                                behavior: 'smooth',
                                                                select: true,
                                                                selectLength: 0,
                                                            });
                                                            editorRef.current?.focus();
                                                        }, 50);
                                                    }
                                                }}
                                                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${previewVersionId === ver.id ? 'bg-blue-500 text-white' : 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}
                                            >
                                                {previewVersionId === ver.id ? '退出' : '预览'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    let targetText = ver.scriptText;
                                                    if (ver.scale === 'scene_edit' && ver.affectedScenes && ver.affectedScenes[ver.scene] && ver.scene !== '全局' && tocItems.length > 0) {
                                                        let rebuiltText = '';
                                                        for (let i = 0; i < tocItems.length; i++) {
                                                            if (tocItems[i].title === ver.scene) {
                                                                const start = tocItems[i].charIndex;
                                                                const end = i < tocItems.length - 1 ? tocItems[i+1].charIndex : scriptDraft.length;
                                                                rebuiltText = scriptDraft.slice(0, start) + ver.affectedScenes[ver.scene] + scriptDraft.slice(end);
                                                                break;
                                                            }
                                                        }
                                                        if (rebuiltText) targetText = rebuiltText;
                                                    }
                                                    setScriptDraft(targetText);
                                                    onUpdateProject({ scriptText: targetText });
                                                    setVersionStatus('已恢复');
                                                    setPreviewVersionId(null);
                                                    
                                                    setVersions(prev => {
                                                        const newVersions = [{
                                                            id: Date.now().toString(),
                                                            timestamp: Date.now(),
                                                            summary: `恢复至: ${ver.summary}`,
                                                            scale: 'structural',
                                                            scene: '全局',
                                                            affectedScenes: { '全局': targetText },
                                                            globalOrderSnapshot: ['全局'],
                                                            scriptText: targetText
                                                        }, ...prev].slice(0, 50);
                                                        try { localStorage.setItem(`script_versions_${currentProject.id}`, JSON.stringify(newVersions)); } catch {}
                                                        return newVersions;
                                                    });
                                                }}
                                                className="text-[10px] text-gray-500 hover:text-gray-900 dark:hover:text-neutral-200"
                                            >
                                                恢复
                                            </button>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
              )}

            {/* Secondary Menu for Assets */}
            {activeTab === 'assets' && (
              <div className="px-2.5 pb-2">
                <div className="bg-gray-100/70 dark:bg-neutral-850 rounded-xl p-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        data-agent-target="assets.filter.all"
                        onClick={() => setAssetFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                          assetFilter === 'all'
                            ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                            : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        全部 {totalAssets > 0 && `(${totalAssets})`}
                      </button>

                      <button
                        type="button"
                        data-agent-target="assets.filter.characters"
                        onClick={() => setAssetFilter('characters')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                          assetFilter === 'characters'
                            ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                            : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        角色 {(currentProject.characters?.length || 0) > 0 && `(${(currentProject.characters?.length || 0)})`}
                      </button>

                      <button
                        type="button"
                        data-agent-target="assets.filter.locations"
                        onClick={() => setAssetFilter('locations')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                          assetFilter === 'locations'
                            ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                            : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        场景 {(currentProject.locations?.length || 0) > 0 && `(${(currentProject.locations?.length || 0)})`}
                      </button>

                      <button
                        type="button"
                        data-agent-target="assets.filter.props"
                        onClick={() => setAssetFilter('props')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                          assetFilter === 'props'
                            ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                            : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        道具 {(currentProject.props?.length || 0) > 0 && `(${(currentProject.props?.length || 0)})`}
                      </button>
                    </div>

                  {/* Right: Actions (only batch delete when selected) */}
                  
                </div>
              </div>
            )}
          </div>

          {/* 下卡片: 正文与内容展示卡片 */}
          <div
            ref={scriptCardRef}
            className="flex-1 flex flex-col min-h-0 overflow-hidden pointer-events-auto relative z-10"
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {activeTab === 'script' ? (
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                {/* 左栏: 剧本正文（保持现有组件逻辑与样式 100% 不变） */}
                <div className="flex-1 flex flex-col min-h-0 relative min-w-0">
                  {/* Floating candidate provenance badges vertically aligned with right side clicked asset item */}
                  <AnimatePresence>
                    {visualDock.scriptExpanded && activeAssetHighlight && (
                      <CandidateMatchesOverlay
                        key={activeAssetHighlight.id}
                        yTop={activeAssetHighlight.yTop || 120}
                        cardHeight={activeAssetHighlight.cardHeight || 600}
                        matchesCount={activeAssetMatches.length}
                        activeAssetMatches={activeAssetMatches}
                        activeAssetMatchIndex={activeAssetMatchIndex}
                        provenanceStatus={activeProvenanceStatus}
                        onTriggerVerify={
                          onRequestVerifyAssetProvenance && liveHighlightedAsset
                            ? () => onRequestVerifyAssetProvenance(activeAssetHighlight.category, liveHighlightedAsset)
                            : undefined
                        }
                        onSelectMatch={(idx, m) => {
                          setActiveAssetMatchIndex(idx);
                          jumpToAssetMatch(m);
                        }}
                        onExpandedChange={setIsCandidateOverlayExpanded}
                      />
                    )}
                  </AnimatePresence>

                  {/* Floating Quick-Exit Capsule for Provenance Highlights: 布拉姆 (41处) [退出高亮 ✕] */}
                  <AnimatePresence>
                    {activeMultiHighlightSpans.length > 0 && activeAssetHighlight && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className={`absolute top-3 z-30 flex items-center shadow-lg bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border border-blue-200/80 dark:border-blue-900/50 rounded-full pl-3 pr-1.5 py-1 text-xs select-none pointer-events-auto transition-all duration-200 ${
                          isTocOpen ? 'left-[300px]' : 'left-5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mr-2">
                          <span className="font-semibold text-gray-800 dark:text-neutral-100 max-w-[130px] truncate">
                            {activeAssetHighlight.name}
                          </span>
                          <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                            ({activeMultiHighlightSpans.length}处)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDismissProvenanceHighlights}
                          title="退出出处高亮模式 (快捷键: Esc)"
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white bg-blue-50/80 hover:bg-blue-100 dark:bg-neutral-700/80 dark:hover:bg-neutral-700 transition-colors cursor-pointer group"
                        >
                          <span>退出高亮</span>
                          <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:text-neutral-400 dark:group-hover:text-white transition-colors" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isAnimationSettled && isScriptExpandSettled ? (
                    <div className="relative flex-1 flex flex-col min-h-0 w-full h-full overflow-hidden">
                      <ScriptCodeEditor
                        key={`script-${currentProject.id}`}
                        ref={editorRef}
                        value={previewVersionId ? getPreviewText() : scriptDraft}
                        readOnly={!!previewVersionId}
                        onChange={handleScriptTextChange}
                        onEditorReady={handleScriptEditorReady}
                        placeholder="在此直接输入或粘贴剧本正文...&#10;&#10;例如：&#10;【场 1】内景. 房间 - 夜&#10;主角坐在桌前，窗外微风拂过...&#10;&#10;【场 2】外景. 街道 - 日&#10;阳光穿透树梢，洒在人行道上..."
                        annotations={editorAnnotations}
                        onEscape={handleDismissProvenanceHighlights}
                        onCursorMove={(cursorOffset) => {
                          updateSceneIndicator(scriptDraft, cursorOffset);
                          if (activeMultiHighlightSpans.length > 0) {
                            const hit = activeMultiHighlightSpans.find(
                              sp => cursorOffset >= sp.charIndex && cursorOffset <= sp.endCharIndex
                            );
                            if (hit && hit.charIndex !== activeProvenanceTargetChar) {
                              setActiveProvenanceTargetChar(hit.charIndex);
                            }
                          }
                        }}
                        onSelectionChange={(selection) => {
                          if (selection) {
                            updateSceneIndicator(scriptDraft, selection.start);
                            onSelectionChange(selection);
                            if (activeMultiHighlightSpans.length > 0) {
                              const hit = activeMultiHighlightSpans.find(
                                sp => selection.start >= sp.charIndex && selection.start <= sp.endCharIndex
                              );
                              if (hit && hit.charIndex !== activeProvenanceTargetChar) {
                                setActiveProvenanceTargetChar(hit.charIndex);
                              }
                            }
                          } else {
                            onSelectionChange(null);
                          }
                        }}
                        onScroll={handleScriptScroll}
                        className={`transition-opacity duration-150 ease-out ${
                          isPositionReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex-1 h-full" />
                  )}

                  {/* Bottom Right Floating Stats */}
                  <div className={`absolute bottom-4 right-5 pointer-events-none select-none flex items-center gap-1.5 text-[11px] font-medium tabular-nums text-gray-400 dark:text-neutral-500 whitespace-nowrap transition-opacity duration-200 ${
                    isCandidateOverlayExpanded ? 'opacity-30' : 'opacity-65'
                  }`}>
                    <span>{(scriptDraft || '').length} 字</span>
                    <span className="opacity-60">·</span>
                    <span>{scriptDraft ? scriptDraft.split('\n').length : 0} 行</span>
                  </div>

                  {/* 目录打开后的列表卡片: 范围限制在正文卡片内 */}
                  <AnimatePresence>
                    {isTocOpen && (
                      <motion.div
                        ref={tocCardRef}
                        initial={{ opacity: 0, x: -10, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-2.5 top-2.5 bottom-2.5 w-72 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border border-gray-200/90 dark:border-[#404040] rounded-2xl corner-squircle shadow-xl z-30 flex flex-col overflow-hidden text-xs"
                      >
                        <div
                          ref={tocListRef}
                          data-agent-target="script.toc.list"
                          data-agent-actions="mouse.move mouse.hover mouse.scroll"
                          onScroll={handleTocListScroll}
                          className="flex-1 overflow-y-auto p-1.5 space-y-0.5"
                        >
                          {isInferringToc ? (
                            <div className="py-8 text-center text-blue-500 dark:text-blue-400 space-y-2">
                              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-[11px] font-medium">AI 正在智能解析目录结构...</p>
                              <p className="text-[10px] opacity-70 text-gray-500 dark:text-neutral-400">
                                首次提取可能需要几秒钟
                              </p>
                            </div>
                          ) : tocItems.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 dark:text-neutral-500 space-y-1">
                              <BookText className="w-5 h-5 mx-auto opacity-40 mb-1" />
                              <p className="text-[11px]">正文中暂无集数或章节标识</p>
                              <p className="text-[10px] opacity-70">
                                剧本包含分集内容后将自动解析
                              </p>
                            </div>
                          ) : (
                            tocItems.map((item) => {
                              const isScene = item.type === 'scene';
                              const isEpisode = item.type === 'episode' || item.type === 'chapter';
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  data-agent-target={`script.toc.item.${item.id}`}
                                  data-agent-actions="mouse.move mouse.click mouse.hover"
                                  onClick={() => handleJumpToToc(item)}
                                  className={`w-full text-left py-2 rounded-xl corner-squircle hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-start gap-2 group ${
                                    isScene ? 'pl-6 pr-2.5' : 'px-2.5'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className={`truncate leading-tight ${isEpisode ? 'font-bold text-gray-900 dark:text-white text-[12.5px]' : 'font-medium text-gray-700 dark:text-neutral-300 text-[12px]'}`}>
                                      {item.title}
                                    </div>
                                    {item.subTitle && (
                                      <div className="text-[11px] text-gray-400 dark:text-neutral-500 truncate mt-0.5">
                                        {item.subTitle}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5 shrink-0 whitespace-nowrap">
                                    第 {item.lineNumber} 行
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div
                ref={assetListContainerRef}
                onScroll={() => setAssetContextMenu(null)}
                onMouseDown={(e) => handleContainerMouseDown(e, assetListContainerRef)}
                className="flex-1 overflow-y-auto p-3 space-y-3 relative"
              >
                {boxSelection && boxSelection.isDragging && (
                  <div
                    className="absolute pointer-events-none z-50 bg-blue-500/15 border border-blue-500/50 rounded-lg"
                    style={{
                      left: Math.min(boxSelection.startX, boxSelection.currentX),
                      top: Math.min(boxSelection.startY, boxSelection.currentY),
                      width: Math.abs(boxSelection.currentX - boxSelection.startX),
                      height: Math.abs(boxSelection.currentY - boxSelection.startY),
                    }}
                  />
                )}
                {/* TAB 2: ASSETS OUTLINE */}
                {activeTab === 'assets' && (
                <div className="flex flex-col gap-2">
                  {/* Extraction Feedback Banner */}
                  {extractionFeedback && (
                    <div role="alert" className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-[11px] font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                      <span>{extractionFeedback}</span>
                    </div>
                  )}

                  {/* Asset Cards List or Empty State */}
                  {(currentProject.characters?.length || 0) === 0 &&
                  (currentProject.locations?.length || 0) === 0 &&
                  (currentProject.props?.length || 0) === 0 ? (
                    <div
                      className="py-16 px-4 flex flex-col items-center justify-center text-center"
                      data-agent-target="assets.empty.state"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 flex items-center justify-center mb-3">
                        <Box className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-700 dark:text-neutral-200">
                        暂无资产条目
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-neutral-500 max-w-xs mt-1 mb-4 leading-relaxed">
                        在「剧本正文」中输入或粘贴剧本后，点击下方按钮一键提取角色、场景与核心道具实体，也可以手动新建。
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAddAsset('character')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>新建资产</span>
                        </button>
                        <button
                          onClick={handleExtractAssets}
                          disabled={isExtractingAssets}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {isExtractingAssets ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>一键提取全部资产</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                      <div className="flex flex-col gap-1.5">
                      {/* Characters */}
                      {(assetFilter === 'all' || assetFilter === 'characters') && displayCharacters.map((char) => {
                        const prompt = `Cinematic character portrait of ${char.name}, ${char.role}, ${char.age}. ${char.appearance}. Style: ${currentProject.universe.artStyle}, ${currentProject.universe.colorTone}, 35mm photograph, hyperdetailed master film still.`;
                        const isSelected = selectedAssetIds.has(char.id);
                        const isHighlightActive = activeAssetHighlight?.id === char.id && !activeAssetHighlight?.isVersion;
                        const charTargetId = buildAssetAgentTargetId('character', char.id);
                        const isAgentFocused = isTargetAgentFocused(charTargetId);
                        const charBorderMode = resolveSelectionBorderMode({
                          isUserSelected: isSelected || isHighlightActive,
                          isAgentFocused,
                        });
                        const identText = getAssetIdentificationText('character', char);
                        const versions: ScriptAssetVersion[] = Array.isArray(char.versions) ? char.versions : [];
                        const hasMultipleVersions = versions.length > 1;
                        const isCollapsed = collapsedMultiVersionIds.has(char.id);
                        return (
                          <div key={char.id} className="flex flex-col">
                            <div
                              data-asset-item="true"
                              data-asset-version="false"
                              data-asset-id={char.id}
                              data-agent-target={charTargetId}
                              data-selection-border-mode={charBorderMode}
                              onClick={(e) => handleAssetRowClick(char.id, 'character', char, e)}
                              onContextMenu={(e) => {
                                handleOpenAssetContextMenu(e, 'character', char);
                              }}
                              className={`w-full relative px-3 py-2.5 rounded-xl corner-squircle transition-all duration-150 select-none active:scale-[0.985] active:brightness-95 cursor-pointer group flex items-center justify-between gap-3 ${getAssetRowBorderClasses(charBorderMode, false)}`}
                            >
                              {renderAssetRowSelectionBorderOverlay(charBorderMode, false)}
                              <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 pr-1">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  
                                    <div className="text-blue-500 flex items-center justify-center">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                      </svg>
                                    </div>
                                  
                                </div>
                                <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 whitespace-nowrap shrink-0 max-w-[200px] truncate" title={char.name}>{char.name}</span>
                                <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={identText}>
                                  {identText}
                                </span>
                                {hasMultipleVersions && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleMultiVersionCollapse(char.id, e)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 shrink-0 transition-colors"
                                    title={isCollapsed ? '展开多版本二级列表' : '收起多版本二级列表'}
                                  >
                                    <span>{versions.length}版本</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                  </button>
                                )}
                                </div>
                            </div>
                            {hasMultipleVersions && !isCollapsed && (
                              <div className="ml-5 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                {versions.map((ver) => {
                                  const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                  const verTargetId = buildAssetAgentTargetId('character', ver.id, char.id);
                                  const verFocused = isTargetAgentFocused(verTargetId);
                                  const verBorderMode = resolveSelectionBorderMode({
                                    isUserSelected: verHighlight,
                                    isAgentFocused: verFocused,
                                  });
                                  const verIdent = getVersionIdentificationText('character', ver);
                                  return (
                                    <div
                                      key={ver.id}
                                      data-asset-item="true"
                                      data-asset-version="true"
                                      data-asset-id={ver.id}
                                      data-agent-target={verTargetId}
                                      data-selection-border-mode={verBorderMode}
                                      onClick={(e) => handleAssetRowClick(ver.id, 'character', ver, e, false, char.name)}
                                      onContextMenu={(e) => {
                                        handleOpenAssetContextMenu(e, 'character', ver, char);
                                      }}
                                      className={`w-full relative px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${getAssetRowBorderClasses(verBorderMode, true)}`}
                                    >
                                      {renderAssetRowSelectionBorderOverlay(verBorderMode, true)}
                                      <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 shrink-0" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 shrink-0 whitespace-nowrap" title={ver.name}>
                                          {ver.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={verIdent}>
                                          {verIdent}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Locations */}
                      {(assetFilter === 'all' || assetFilter === 'locations') && displayLocations.map((loc) => {
                        const prompt = `Cinematic wide environment establishing shot of ${loc.name}, ${loc.type}, ${loc.timeOfDay}. Atmosphere: ${loc.atmosphere}. Details: ${loc.visualDetails}. Style: ${currentProject.universe.artStyle}, ${currentProject.universe.cinematography}, film still.`;
                        const isSelected = selectedAssetIds.has(loc.id);
                        const isHighlightActive = activeAssetHighlight?.id === loc.id && !activeAssetHighlight?.isVersion;
                        const locTargetId = buildAssetAgentTargetId('location', loc.id);
                        const isAgentFocused = isTargetAgentFocused(locTargetId);
                        const locBorderMode = resolveSelectionBorderMode({
                          isUserSelected: isSelected || isHighlightActive,
                          isAgentFocused,
                        });
                        const identText = getAssetIdentificationText('location', loc);
                        const versions: ScriptAssetVersion[] = Array.isArray(loc.versions) ? loc.versions : [];
                        const hasMultipleVersions = versions.length > 1;
                        const isCollapsed = collapsedMultiVersionIds.has(loc.id);
                        return (
                          <div key={loc.id} className="flex flex-col">
                            <div
                              data-asset-item="true"
                              data-asset-version="false"
                              data-asset-id={loc.id}
                              data-agent-target={locTargetId}
                              data-selection-border-mode={locBorderMode}
                              onClick={(e) => handleAssetRowClick(loc.id, 'location', loc, e)}
                              onContextMenu={(e) => {
                                handleOpenAssetContextMenu(e, 'location', loc);
                              }}
                              className={`w-full relative px-3 py-2.5 rounded-xl corner-squircle transition-all duration-150 select-none active:scale-[0.985] active:brightness-95 cursor-pointer group flex items-center justify-between gap-3 ${getAssetRowBorderClasses(locBorderMode, false)}`}
                            >
                              {renderAssetRowSelectionBorderOverlay(locBorderMode, false)}
                              <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 pr-1">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  
                                    <div className="text-emerald-500 flex items-center justify-center">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                      </svg>
                                    </div>
                                  
                                </div>
                                <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 whitespace-nowrap shrink-0 max-w-[200px] truncate" title={loc.name}>{loc.name}</span>
                                <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={identText}>
                                  {identText}
                                </span>
                                {hasMultipleVersions && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleMultiVersionCollapse(loc.id, e)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 shrink-0 transition-colors"
                                    title={isCollapsed ? '展开日景/夜景版本列表' : '收起日景/夜景版本列表'}
                                  >
                                    <span>{versions.length}版本</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                  </button>
                                )}
                            </div>
                            </div>
                            {hasMultipleVersions && !isCollapsed && (
                              <div className="ml-5 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                {versions.map((ver) => {
                                  const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                  const verTargetId = buildAssetAgentTargetId('location', ver.id, loc.id);
                                  const verFocused = isTargetAgentFocused(verTargetId);
                                  const verBorderMode = resolveSelectionBorderMode({
                                    isUserSelected: verHighlight,
                                    isAgentFocused: verFocused,
                                  });
                                  const verIdent = getVersionIdentificationText('location', ver);
                                  return (
                                    <div
                                      key={ver.id}
                                      data-asset-item="true"
                                      data-asset-version="true"
                                      data-asset-id={ver.id}
                                      data-agent-target={verTargetId}
                                      data-selection-border-mode={verBorderMode}
                                      onClick={(e) => handleAssetRowClick(ver.id, 'location', ver, e, false, loc.name)}
                                      onContextMenu={(e) => {
                                        handleOpenAssetContextMenu(e, 'location', ver, loc);
                                      }}
                                      className={`w-full relative px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${getAssetRowBorderClasses(verBorderMode, true)}`}
                                    >
                                      {renderAssetRowSelectionBorderOverlay(verBorderMode, true)}
                                      <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 shrink-0 whitespace-nowrap" title={ver.name}>
                                          {ver.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={verIdent}>
                                          {verIdent}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Props */}
                      {(assetFilter === 'all' || assetFilter === 'props') && displayProps.map((prop) => {
                        const prompt = `Close-up studio cinematography shot of ${prop.name}. Material and state: ${prop.materialAndState}. Significant story object. Style: ${currentProject.universe.artStyle}, ${currentProject.universe.colorTone}, pristine high detail.`;
                        const isSelected = selectedAssetIds.has(prop.id);
                        const isHighlightActive = activeAssetHighlight?.id === prop.id && !activeAssetHighlight?.isVersion;
                        const propTargetId = buildAssetAgentTargetId('prop', prop.id);
                        const isAgentFocused = isTargetAgentFocused(propTargetId);
                        const propBorderMode = resolveSelectionBorderMode({
                          isUserSelected: isSelected || isHighlightActive,
                          isAgentFocused,
                        });
                        const identText = getAssetIdentificationText('prop', prop);
                        const versions: ScriptAssetVersion[] = Array.isArray(prop.versions) ? prop.versions : [];
                        const hasMultipleVersions = versions.length > 1;
                        const isCollapsed = collapsedMultiVersionIds.has(prop.id);
                        return (
                          <div key={prop.id} className="flex flex-col">
                            <div
                              data-asset-item="true"
                              data-asset-version="false"
                              data-asset-id={prop.id}
                              data-agent-target={propTargetId}
                              data-selection-border-mode={propBorderMode}
                              onClick={(e) => handleAssetRowClick(prop.id, 'prop', prop, e)}
                              onContextMenu={(e) => {
                                handleOpenAssetContextMenu(e, 'prop', prop);
                              }}
                              className={`w-full relative px-3 py-2.5 rounded-xl corner-squircle transition-all duration-150 select-none active:scale-[0.985] active:brightness-95 cursor-pointer group flex items-center justify-between gap-3 ${getAssetRowBorderClasses(propBorderMode, false)}`}
                            >
                              {renderAssetRowSelectionBorderOverlay(propBorderMode, false)}
                              <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 pr-1">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  
                                    <div className="text-amber-500 flex items-center justify-center">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85 17.96 7.5 12 4.15zM5 15.91l6 3.38v-6.72L5 9.19v6.72zm14 0v-6.72l-6 3.38v6.72l6-3.38z"/>
                                      </svg>
                                    </div>
                                  
                                </div>
                                <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 whitespace-nowrap shrink-0 max-w-[200px] truncate" title={prop.name}>{prop.name}</span>
                                <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={identText}>
                                  {identText}
                                </span>
                                {hasMultipleVersions && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleMultiVersionCollapse(prop.id, e)}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 shrink-0 transition-colors"
                                    title={isCollapsed ? '展开多版本二级列表' : '收起多版本二级列表'}
                                  >
                                    <span>{versions.length}版本</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                  </button>
                                )}
                            </div>
                            </div>
                            {hasMultipleVersions && !isCollapsed && (
                              <div className="ml-5 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                {versions.map((ver) => {
                                  const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                  const verTargetId = buildAssetAgentTargetId('prop', ver.id, prop.id);
                                  const verFocused = isTargetAgentFocused(verTargetId);
                                  const verBorderMode = resolveSelectionBorderMode({
                                    isUserSelected: verHighlight,
                                    isAgentFocused: verFocused,
                                  });
                                  const verIdent = getVersionIdentificationText('prop', ver);
                                  return (
                                    <div
                                      key={ver.id}
                                      data-asset-item="true"
                                      data-asset-version="true"
                                      data-asset-id={ver.id}
                                      data-agent-target={verTargetId}
                                      data-selection-border-mode={verBorderMode}
                                      onClick={(e) => handleAssetRowClick(ver.id, 'prop', ver, e, false, prop.name)}
                                      onContextMenu={(e) => {
                                        handleOpenAssetContextMenu(e, 'prop', ver, prop);
                                      }}
                                      className={`w-full relative px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${getAssetRowBorderClasses(verBorderMode, true)}`}
                                    >
                                      {renderAssetRowSelectionBorderOverlay(verBorderMode, true)}
                                      <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 shrink-0 whitespace-nowrap" title={ver.name}>
                                          {ver.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={verIdent}>
                                          {verIdent}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: UNIVERSE AESTHETICS */}
              {activeTab === 'universe' && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl corner-squircle border border-gray-200/60 dark:border-[#404040] space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                      <Palette className="w-4 h-4 text-blue-500" />
                      色彩与影调体系
                    </div>
                    <div className="flex items-center gap-2">
                      {currentProject.universe.colorHexes.map((hex, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-8 rounded-lg corner-squircle shadow-sm border border-black/10 flex items-center justify-center text-[10px] font-mono text-white/90"
                          style={{ backgroundColor: hex }}
                        >
                          {hex.slice(1, 4)}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
                      {currentProject.universe.colorTone}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3.5 bg-white dark:bg-neutral-800 rounded-2xl corner-squircle border border-gray-200/60 dark:border-[#404040] space-y-1 shadow-2xs">
                      <div className="text-[11px] font-semibold text-gray-400">时代背景与纪元</div>
                      <div className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                        {currentProject.universe.era}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-neutral-800 rounded-2xl corner-squircle border border-gray-200/60 dark:border-[#404040] space-y-1 shadow-2xs">
                      <div className="text-[11px] font-semibold text-gray-400">视觉艺术风格</div>
                      <div className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                        {currentProject.universe.artStyle}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-neutral-800 rounded-2xl corner-squircle border border-gray-200/60 dark:border-[#404040] space-y-1 shadow-2xs">
                      <div className="text-[11px] font-semibold text-gray-400">摄影与光学语言</div>
                      <div className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                        {currentProject.universe.cinematography}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CARDS MANAGEMENT */}
              {activeTab === 'cards' && (
                <div className="flex flex-col gap-4">
                  {/* Total Cards Metric Banner */}
                  <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl corner-squircle border border-gray-200/60 dark:border-[#404040] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl corner-squircle bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-gray-900 dark:text-white">卡片总数</h3>
                          <p className="text-[11px] text-gray-400">当前项目画布中的所有卡片统计</p>
                        </div>
                      </div>
                      <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                        {cards?.length || 0}
                      </div>
                    </div>

                    {/* Sub-metrics breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-[#333333]">
                      <div className="p-2 bg-gray-50 dark:bg-neutral-900/60 rounded-xl corner-squircle flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-emerald-500" /> 生图卡片
                        </span>
                        <span className="text-sm font-bold font-mono text-gray-800 dark:text-neutral-200">
                          {cards?.filter(c => !c.isVideo).length || 0}
                        </span>
                      </div>

                      <div className="p-2 bg-gray-50 dark:bg-neutral-900/60 rounded-xl corner-squircle flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Video className="w-3 h-3 text-purple-500" /> 视频卡片
                        </span>
                        <span className="text-sm font-bold font-mono text-gray-800 dark:text-neutral-200">
                          {cards?.filter(c => c.isVideo).length || 0}
                        </span>
                      </div>

                      <div className="p-2 bg-gray-50 dark:bg-neutral-900/60 rounded-xl corner-squircle flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-500" /> 已就绪
                        </span>
                        <span className="text-sm font-bold font-mono text-gray-800 dark:text-neutral-200">
                          {cards?.filter(c => c.state === 'completed' || Boolean(c.imageUrl)).length || 0}
                        </span>
                      </div>

                      <div className="p-2 bg-gray-50 dark:bg-neutral-900/60 rounded-xl corner-squircle flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> 草稿待生
                        </span>
                        <span className="text-sm font-bold font-mono text-gray-800 dark:text-neutral-200">
                          {cards?.filter(c => c.state === 'draft' && !c.imageUrl).length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cards Overview List */}
                  {cards && cards.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-[11px] font-semibold text-gray-400 px-1">卡片概览清单</div>
                      <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1">
                        {cards.map((card, index) => (
                          <div
                            key={card.id}
                            className="p-2.5 bg-white dark:bg-neutral-800 rounded-xl corner-squircle border border-gray-200/60 dark:border-[#404040] flex items-center justify-between gap-3 shadow-2xs hover:border-blue-400/50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="w-5 text-center text-[10px] font-mono text-gray-400">#{index + 1}</span>
                              <div className="w-9 h-9 rounded-lg corner-squircle overflow-hidden bg-gray-100 dark:bg-neutral-900 shrink-0 border border-black/5 flex items-center justify-center">
                                {card.thumbnailUrl || card.imageUrl ? (
                                  <img src={card.thumbnailUrl || card.imageUrl!} alt="" className="w-full h-full object-cover" />
                                ) : card.isVideo ? (
                                  <Video className="w-4 h-4 text-purple-400" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200 truncate">
                                    {card.prompt || (card.isVideo ? '未命名生视频卡片' : '未命名生图卡片')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                  <span className="font-mono">{card.ratio || '3:4'}</span>
                                  <span>·</span>
                                  <span className="font-mono">{card.res || '2K'}</span>
                                  <span>·</span>
                                  <span>{card.isVideo ? '视频' : '图像'}</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap ${
                              card.state === 'completed' || card.imageUrl
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                : card.state === 'generating'
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400'
                            }`}>
                              {card.state === 'completed' || card.imageUrl ? '已就绪' : card.state === 'generating' ? '生成中' : '草稿'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-white dark:bg-neutral-800 rounded-2xl corner-squircle border border-gray-200/60 dark:border-[#404040] text-center space-y-2 shadow-2xs">
                      <LayoutGrid className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto" />
                      <p className="text-xs font-medium text-gray-600 dark:text-neutral-300">当前项目暂无卡片</p>
                      <p className="text-[11px] text-gray-400">可在画布上空白处右键新建卡片</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
            </div>
            )}
      </motion.div>

        {/* 卡片二: 独立侧边栏面板 Card (单一实体容器，打开时左侧卡片先出右侧后出，关闭时右侧卡片先消失左侧后收回) */}
        {activeTab === 'script' && (
          <motion.div
            variants={rightCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            data-dock-card="true"
            data-prevent-canvas-wheel="true"
            data-agent-target={visualDock.sidePanel !== null ? 'assets.panel.container' : 'assets.collapsed'}
            onMouseEnter={() => {
              if (visualDock.sidePanel === null) handleMiniCardMouseEnter('assets');
            }}
            onMouseMove={(e) => {
              if (visualDock.sidePanel === null) handleMiniCardMouseMove(e, 'assets');
            }}
            onMouseLeave={() => {
              if (visualDock.sidePanel === null) handleMiniCardMouseLeave('assets');
            }}
            style={{
              left: `${dockLayout.assets.left}px`,
              width: `${dockLayout.assets.width}px`,
              zIndex: dockLayout.assets.zIndex,
              transitionProperty: 'left, width, height, box-shadow',
              transitionDuration: `${WIDTH_TRANSITION_TIMINGS.shellResizeMs}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              ...(dockLayout.assets.expanded
                ? { maxWidth: `${dockLayout.assets.maxWidth}px` }
                : { height: `${dockLayout.assets.height ?? 112}px` }),
            }}
            className={`fixed top-[58px] flex select-none pointer-events-auto transform-gpu bg-[#f3f4f6] dark:bg-[#1C1C1E] border border-gray-300 dark:border-white/10 corner-squircle overflow-hidden ${
              visualDock.sidePanel !== null
                ? 'bottom-4 rounded-[24px] shadow-2xl flex-col select-text cursor-default'
                : `rounded-[20px] group ${
                    hoveredMiniPanel === 'assets'
                      ? 'shadow-xl border-blue-500/60'
                      : 'shadow-md'
                  }`
            }`}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {visualDock.sidePanel === null ? (
              /* 折叠状态: 0.5倍微缩实心卡片内部 */
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredMiniPanel((prev) => (prev === 'assets' ? null : prev));
                  const lastOpen = (currentProject?.id ? localStorage.getItem(`script_bible_last_open_side_panel_${currentProject.id}`) : null) ||
                                   localStorage.getItem('script_bible_last_open_side_panel');
                  const panelToOpen = (lastOpen === 'assets' || lastOpen === 'universe' || lastOpen === 'cards') ? (lastOpen as 'assets' | 'universe' | 'cards') : 'assets';
                  applyDockTransition({ sidePanel: panelToOpen });
                }}
                aria-label="展开资产清单面板"
                title="放大资产清单面板"
                style={{
                  opacity: widthTransitionPanels.assets.miniOpacity,
                  visibility: widthTransitionPanels.assets.miniHidden ? 'hidden' : 'visible',
                  pointerEvents:
                    widthTransitionPanels.assets.miniOpacity < 1 || widthTransitionPanels.assets.miniHidden
                      ? 'none'
                      : undefined,
                  transition:
                    widthTransitionPanels.assets.fadeDurationMs > 0
                      ? `opacity ${widthTransitionPanels.assets.fadeDurationMs}ms ease-out`
                      : undefined,
                }}
                className={`w-full h-full flex flex-col justify-center py-2.5 select-none overflow-hidden cursor-pointer ${
                  dockLayout.assets.miniAlign === 'right'
                    ? 'items-end pr-2 pl-1'
                    : dockLayout.assets.miniAlign === 'left'
                      ? 'items-start pl-2 pr-1'
                      : 'items-center px-1.5'
                }`}
              >
                {/* 放大图标 + 资产图标 + 粗体竖排标题 “资产” */}
                <div className="flex flex-col items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/80 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-400/50 transition-colors shadow-2xs shrink-0">
                    <Maximize2 className="w-3 h-3" />
                  </span>
                  <div className="flex flex-col items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="[writing-mode:vertical-lr] tracking-[0.2em] text-xs font-black text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                      资产
                    </span>
                  </div>
                </div>
              </button>
            ) : !widthTransitionPanels.assets.mountExpandedContent ? null : (
              /* 展开状态: 完整独立大卡片内部 */
              <div
                style={{
                  opacity: widthTransitionPanels.assets.opacity,
                  visibility: widthTransitionPanels.assets.hidden ? 'hidden' : 'visible',
                  pointerEvents:
                    widthTransitionPanels.assets.opacity < 1 || widthTransitionPanels.assets.hidden
                      ? 'none'
                      : undefined,
                  transition:
                    widthTransitionPanels.assets.fadeDurationMs > 0
                      ? `opacity ${widthTransitionPanels.assets.fadeDurationMs}ms ease-out`
                      : undefined,
                  ...(widthTransitionPanels.assets.frozenWidth != null
                    ? {
                        width: `${widthTransitionPanels.assets.frozenWidth}px`,
                        minWidth: `${widthTransitionPanels.assets.frozenWidth}px`,
                        maxWidth: `${widthTransitionPanels.assets.frozenWidth}px`,
                        flexShrink: 0,
                      }
                    : {}),
                }}
                className="flex flex-col h-full w-full select-text overflow-hidden"
              >
              {/* 上卡片: 标题与工具栏面板 */}
              <div
                className="shrink-0 relative z-0 border-b border-gray-300/80 dark:border-white/[0.04]"
                onPointerDown={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
              >
                {/* 一级顶栏 */}
                <div className="pl-[22px] pr-3.5 pt-3 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Box className="w-4 h-4" />
                      <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">资产清单</span>
                      {totalAssets > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                          {totalAssets}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 右侧缩小按钮 */}
                  <button
                    type="button"
                    onClick={handleCloseSidePanel}
                    aria-label="收起资产清单面板"
                    className="p-1.5 rounded-xl corner-squircle text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="缩小资产清单面板"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 二级工具栏 */}
                <div className="px-3.5 pb-2.5 pt-0.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">

                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                          <button
                            type="button"
                            data-agent-target="assets.filter.all"
                            onClick={() => setAssetFilter('all')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                              assetFilter === 'all'
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            全部 {totalAssets > 0 && `(${totalAssets})`}
                          </button>
                          <button
                            type="button"
                            data-agent-target="assets.filter.characters"
                            onClick={() => setAssetFilter('characters')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                              assetFilter === 'characters'
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            角色
                          </button>
                          <button
                            type="button"
                            data-agent-target="assets.filter.locations"
                            onClick={() => setAssetFilter('locations')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                              assetFilter === 'locations'
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            场景
                          </button>
                          <button
                            type="button"
                            data-agent-target="assets.filter.props"
                            onClick={() => setAssetFilter('props')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                              assetFilter === 'props'
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            道具
                          </button>
                        </div>
                      </div>

                      
                    </div>
                </div>
              </div>

              {/* 侧栏主体内容 */}
              <div
                ref={sidePanelContentRef}
                data-agent-target={visualDock.sidePanel === 'assets' ? 'assets.panel' : visualDock.sidePanel === 'universe' ? 'universe.panel' : 'cards.panel'}
                onScroll={handleSidePanelScroll}
                onMouseDown={(e) => handleContainerMouseDown(e, sidePanelContentRef)}
                style={{ overflowAnchor: 'none' }}
                className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 relative"
              >
                {boxSelection && boxSelection.isDragging && (
                  <div
                    className="absolute pointer-events-none z-50 bg-blue-500/15 border border-blue-500/50 rounded-lg"
                    style={{
                      left: Math.min(boxSelection.startX, boxSelection.currentX),
                      top: Math.min(boxSelection.startY, boxSelection.currentY),
                      width: Math.abs(boxSelection.currentX - boxSelection.startX),
                      height: Math.abs(boxSelection.currentY - boxSelection.startY),
                    }}
                  />
                )}
                {visualDock.sidePanel === 'assets' && (
                  <div className="flex flex-col gap-2">
                    {extractionFeedback && (
                      <div role="alert" className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-[11px] font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                        <span>{extractionFeedback}</span>
                      </div>
                    )}

                    {(currentProject.characters?.length || 0) === 0 &&
                    (currentProject.locations?.length || 0) === 0 &&
                    (currentProject.props?.length || 0) === 0 ? (
                      <div className="py-12 px-4 flex flex-col items-center justify-center text-center" data-agent-target="assets.empty.state">
                        <Box className="w-8 h-8 text-gray-300 dark:text-neutral-600 mb-2" />
                        <p className="text-xs font-bold text-gray-700 dark:text-neutral-200">暂无资产条目</p>
                        <p className="text-[11px] text-gray-400 mt-1 mb-3">左侧正文输入后，点击提取或手动新建。</p>
                        <button
                          onClick={handleExtractAssets}
                          disabled={isExtractingAssets}
                          className="px-3 py-1 rounded-xl bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-700 transition-colors"
                        >
                          一键提取资产
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {(assetFilter === 'all' || assetFilter === 'characters') && displayCharacters.map((char) => {
                          const isSelected = selectedAssetIds.has(char.id);
                          const isHighlightActive = activeAssetHighlight?.id === char.id && !activeAssetHighlight?.isVersion;
                          const charTargetId = buildAssetAgentTargetId('character', char.id);
                          const isAgentFocused = isTargetAgentFocused(charTargetId);
                          const charBorderMode = resolveSelectionBorderMode({
                            isUserSelected: isSelected || isHighlightActive,
                            isAgentFocused,
                          });
                          const identText = getAssetIdentificationText('character', char);
                          const versions: ScriptAssetVersion[] = Array.isArray(char.versions) ? char.versions : [];
                          const hasMultipleVersions = versions.length > 1;
                          const isCollapsed = collapsedMultiVersionIds.has(char.id);
                          return (
                            <div key={char.id} className="flex flex-col">
                              <div
                                data-asset-item="true"
                                data-asset-version="false"
                                data-asset-id={char.id}
                                data-agent-target={charTargetId}
                                data-selection-border-mode={charBorderMode}
                                onClick={(e) => handleAssetRowClick(char.id, 'character', char, e)}
                                onContextMenu={(e) => {
                                  handleOpenAssetContextMenu(e, 'character', char);
                                }}
                                className={`w-full relative px-2.5 py-2.5 rounded-xl corner-squircle transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none active:scale-[0.985] active:brightness-95 ${getAssetRowBorderClasses(charBorderMode, false)}`}
                              >
                                {renderAssetRowSelectionBorderOverlay(charBorderMode, false)}
                                <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    
                                      <div className="text-blue-500 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                      </div>
                                    
                                  </div>
                                  <span className="text-xs font-bold shrink-0 max-w-[180px] truncate" title={char.name}>{char.name}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={identText}>{identText}</span>
                                  {renderAssetThumbBadge('character', char)}
                                  {hasMultipleVersions && (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleMultiVersionCollapse(char.id, e)}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 shrink-0 transition-colors"
                                      title={isCollapsed ? '展开多版本二级列表' : '收起多版本二级列表'}
                                    >
                                      <span>{versions.length}版本</span>
                                      <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {hasMultipleVersions && !isCollapsed && (
                                <div className="ml-4 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                  {versions.map((ver) => {
                                    const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                    const verTargetId = buildAssetAgentTargetId('character', ver.id, char.id);
                                    const verFocused = isTargetAgentFocused(verTargetId);
                                    const verBorderMode = resolveSelectionBorderMode({
                                      isUserSelected: verHighlight,
                                      isAgentFocused: verFocused,
                                    });
                                    const verIdent = getVersionIdentificationText('character', ver);
                                    return (
                                      <div
                                        key={ver.id}
                                        data-asset-item="true"
                                      data-asset-version="true"
                                      data-asset-id={ver.id}
                                      data-agent-target={verTargetId}
                                      data-selection-border-mode={verBorderMode}
                                      onClick={(e) => handleAssetRowClick(ver.id, 'character', ver, e, false, char.name)}
                                      onContextMenu={(e) => {
                                          handleOpenAssetContextMenu(e, 'character', ver, char);
                                        }}
                                        className={`w-full relative px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${getAssetRowBorderClasses(verBorderMode, true)}`}
                                      >
                                        {renderAssetRowSelectionBorderOverlay(verBorderMode, true)}
                                        <div className="flex items-center gap-1.5 min-w-0 w-full flex-1 pr-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 shrink-0" />
                                          <span className="text-[11px] font-bold shrink-0 truncate max-w-[120px]" title={ver.name}>{ver.name}</span>
                                          <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={verIdent}>{verIdent}</span>
                                          {renderAssetThumbBadge('character', ver, char)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {(assetFilter === 'all' || assetFilter === 'locations') && displayLocations.map((loc) => {
                          const isSelected = selectedAssetIds.has(loc.id);
                          const isHighlightActive = activeAssetHighlight?.id === loc.id && !activeAssetHighlight?.isVersion;
                          const locTargetId = buildAssetAgentTargetId('location', loc.id);
                          const isAgentFocused = isTargetAgentFocused(locTargetId);
                          const locBorderMode = resolveSelectionBorderMode({
                            isUserSelected: isSelected || isHighlightActive,
                            isAgentFocused,
                          });
                          const identText = getAssetIdentificationText('location', loc);
                          const versions: ScriptAssetVersion[] = Array.isArray(loc.versions) ? loc.versions : [];
                          const hasMultipleVersions = versions.length > 1;
                          const isCollapsed = collapsedMultiVersionIds.has(loc.id);
                          return (
                            <div key={loc.id} className="flex flex-col">
                              <div
                                data-asset-item="true"
                                data-asset-version="false"
                                data-asset-id={loc.id}
                                data-agent-target={locTargetId}
                                data-selection-border-mode={locBorderMode}
                                onClick={(e) => handleAssetRowClick(loc.id, 'location', loc, e)}
                                onContextMenu={(e) => {
                                  handleOpenAssetContextMenu(e, 'location', loc);
                                }}
                                className={`w-full relative px-2.5 py-2.5 rounded-xl corner-squircle transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none active:scale-[0.985] active:brightness-95 ${getAssetRowBorderClasses(locBorderMode, false)}`}
                              >
                                {renderAssetRowSelectionBorderOverlay(locBorderMode, false)}
                                <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    
                                      <div className="text-emerald-500 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                      </div>
                                    
                                  </div>
                                  <span className="text-xs font-bold shrink-0 max-w-[180px] truncate" title={loc.name}>{loc.name}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={identText}>{identText}</span>
                                  {renderAssetThumbBadge('location', loc)}
                                  {hasMultipleVersions && (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleMultiVersionCollapse(loc.id, e)}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 shrink-0 transition-colors"
                                      title={isCollapsed ? '展开日景/夜景版本列表' : '收起日景/夜景版本列表'}
                                    >
                                      <span>{versions.length}版本</span>
                                      <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {hasMultipleVersions && !isCollapsed && (
                                <div className="ml-4 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                  {versions.map((ver) => {
                                    const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                    const verTargetId = buildAssetAgentTargetId('location', ver.id, loc.id);
                                    const verFocused = isTargetAgentFocused(verTargetId);
                                    const verBorderMode = resolveSelectionBorderMode({
                                      isUserSelected: verHighlight,
                                      isAgentFocused: verFocused,
                                    });
                                    const verIdent = getVersionIdentificationText('location', ver);
                                    return (
                                      <div
                                        key={ver.id}
                                        data-asset-item="true"
                                      data-asset-version="true"
                                      data-asset-id={ver.id}
                                      data-agent-target={verTargetId}
                                      data-selection-border-mode={verBorderMode}
                                      onClick={(e) => handleAssetRowClick(ver.id, 'location', ver, e, false, loc.name)}
                                      onContextMenu={(e) => {
                                          handleOpenAssetContextMenu(e, 'location', ver, loc);
                                        }}
                                        className={`w-full relative px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${getAssetRowBorderClasses(verBorderMode, true)}`}
                                      >
                                        {renderAssetRowSelectionBorderOverlay(verBorderMode, true)}
                                        <div className="flex items-center gap-1.5 min-w-0 w-full flex-1 pr-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                                          <span className="text-[11px] font-bold shrink-0 truncate max-w-[120px]" title={ver.name}>{ver.name}</span>
                                          <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={verIdent}>{verIdent}</span>
                                          {renderAssetThumbBadge('location', ver, loc)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {(assetFilter === 'all' || assetFilter === 'props') && displayProps.map((prop) => {
                          const isSelected = selectedAssetIds.has(prop.id);
                          const isHighlightActive = activeAssetHighlight?.id === prop.id && !activeAssetHighlight?.isVersion;
                          const propTargetId = buildAssetAgentTargetId('prop', prop.id);
                          const isAgentFocused = isTargetAgentFocused(propTargetId);
                          const propBorderMode = resolveSelectionBorderMode({
                            isUserSelected: isSelected || isHighlightActive,
                            isAgentFocused,
                          });
                          const identText = getAssetIdentificationText('prop', prop);
                          const versions: ScriptAssetVersion[] = Array.isArray(prop.versions) ? prop.versions : [];
                          const hasMultipleVersions = versions.length > 1;
                          const isCollapsed = collapsedMultiVersionIds.has(prop.id);
                          return (
                            <div key={prop.id} className="flex flex-col">
                              <div
                                data-asset-item="true"
                                data-asset-version="false"
                                data-asset-id={prop.id}
                                data-agent-target={propTargetId}
                                data-selection-border-mode={propBorderMode}
                                onClick={(e) => handleAssetRowClick(prop.id, 'prop', prop, e)}
                                onContextMenu={(e) => {
                                  handleOpenAssetContextMenu(e, 'prop', prop);
                                }}
                                className={`w-full relative px-2.5 py-2.5 rounded-xl corner-squircle transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none active:scale-[0.985] active:brightness-95 ${getAssetRowBorderClasses(propBorderMode, false)}`}
                              >
                                {renderAssetRowSelectionBorderOverlay(propBorderMode, false)}
                                <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    
                                      <div className="text-amber-500 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85 17.96 7.5 12 4.15zM5 15.91l6 3.38v-6.72L5 9.19v6.72zm14 0v-6.72l-6 3.38v6.72l6-3.38z"/>
                                        </svg>
                                      </div>
                                    
                                  </div>
                                  <span className="text-xs font-bold shrink-0 max-w-[180px] truncate" title={prop.name}>{prop.name}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={identText}>{identText}</span>
                                  {renderAssetThumbBadge('prop', prop)}
                                  {hasMultipleVersions && (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleMultiVersionCollapse(prop.id, e)}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 shrink-0 transition-colors"
                                      title={isCollapsed ? '展开多版本二级列表' : '收起多版本二级列表'}
                                    >
                                      <span>{versions.length}版本</span>
                                      <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {hasMultipleVersions && !isCollapsed && (
                                <div className="ml-4 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                  {versions.map((ver) => {
                                    const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                    const verTargetId = buildAssetAgentTargetId('prop', ver.id, prop.id);
                                    const verFocused = isTargetAgentFocused(verTargetId);
                                    const verBorderMode = resolveSelectionBorderMode({
                                      isUserSelected: verHighlight,
                                      isAgentFocused: verFocused,
                                    });
                                    const verIdent = getVersionIdentificationText('prop', ver);
                                    return (
                                      <div
                                        key={ver.id}
                                        data-asset-item="true"
                                      data-asset-version="true"
                                      data-asset-id={ver.id}
                                      data-agent-target={verTargetId}
                                      data-selection-border-mode={verBorderMode}
                                      onClick={(e) => handleAssetRowClick(ver.id, 'prop', ver, e, false, prop.name)}
                                      onContextMenu={(e) => {
                                          handleOpenAssetContextMenu(e, 'prop', ver, prop);
                                        }}
                                        className={`w-full relative px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${getAssetRowBorderClasses(verBorderMode, true)}`}
                                      >
                                        {renderAssetRowSelectionBorderOverlay(verBorderMode, true)}
                                        <div className="flex items-center gap-1.5 min-w-0 w-full flex-1 pr-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                                          <span className="text-[11px] font-bold shrink-0 truncate max-w-[120px]" title={ver.name}>{ver.name}</span>
                                          <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={verIdent}>{verIdent}</span>
                                          {renderAssetThumbBadge('prop', ver, prop)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {visualDock.sidePanel === 'universe' && (
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200/60 dark:border-[#404040] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                            <Palette className="w-4 h-4 text-purple-500" /> 色彩与影调体系
                          </div>
                          <div className="flex items-center gap-1.5">
                            {currentProject.universe.colorHexes.map((hex, idx) => (
                              <div key={idx} className="w-8 h-6 rounded border border-black/10 flex items-center justify-center text-[9px] font-mono text-white/90" style={{ backgroundColor: hex }}>
                                {hex.slice(1, 4)}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">{currentProject.universe.colorTone}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200/60 dark:border-[#404040] space-y-1">
                          <div className="text-[11px] font-semibold text-gray-400">视觉艺术风格</div>
                          <div className="text-xs font-medium text-gray-800 dark:text-neutral-200">{currentProject.universe.artStyle}</div>
                        </div>
                      </div>
                    )}

                    {visualDock.sidePanel === 'cards' && (
                      <div className="flex flex-col gap-2">
                        <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200/60 dark:border-[#404040] flex items-center justify-between">
                          <span className="text-xs font-bold">卡片总数</span>
                          <span className="text-lg font-bold font-mono text-cyan-500">{cards?.length || 0}</span>
                        </div>
                        {cards && cards.length > 0 ? (
                          <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto">
                            {cards.map((card, index) => (
                              <div key={card.id} className="p-2 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200/60 flex items-center justify-between text-xs">
                                <span className="font-mono text-[10px] text-gray-400">#{index + 1}</span>
                                <span className="truncate flex-1 px-2 font-medium">{card.prompt || '卡片'}</span>
                                <span className="text-[10px] text-gray-400">{card.state === 'completed' || card.imageUrl ? '已就绪' : '草稿'}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-center py-4 text-gray-400">暂无卡片数据</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 卡片三: 右侧图片面板 Card */}
          {activeTab === 'script' && (
            <AssetImageFeedPanel
              projectId={currentProject?.id}
              layout={dockLayout.images}
              sections={imageFeed.sections}
              timelineCards={imageFeed.timelineCards}
              totalBoundImages={imageFeed.totalBoundImages}
              isCardsLoading={isCardsLoading}
              activeAssetId={activeAssetHighlight?.id ?? null}
              activeAssetIsVersion={Boolean(activeAssetHighlight?.isVersion)}
              activeCategory={activeAssetHighlight?.category ?? null}
              isHovered={hoveredMiniPanel === 'images'}
              onMiniMouseEnter={() => handleMiniCardMouseEnter('images')}
              onMiniMouseMove={(e) => handleMiniCardMouseMove(e, 'images')}
              onMiniMouseLeave={() => handleMiniCardMouseLeave('images')}
              onExpand={() => {
                setHoveredMiniPanel((prev) => (prev === 'images' ? null : prev));
                applyDockTransition({ imagesExpanded: true });
              }}
              onCollapse={() => {
                setHoveredMiniPanel((prev) => (prev === 'images' ? null : prev));
                applyDockTransition({ imagesExpanded: false });
              }}
              isWideMode={visualDock.imagesWide}
              onToggleWideMode={handleToggleImagesWide}
              widthTransition={widthTransitionPanels.images}
              onSelectSection={handleSelectFeedSection}
              onStartCanvasBind={onStartCanvasAssetBind ? handleStartCanvasBindFromSection : undefined}
              onOpenBindModal={handleOpenBindModalFromSection}
              onRequestAgentGenerate={handleRequestGenerateFromSection}
              onSetPrimaryImage={handleSetPrimaryFeedImage}
              onUnbindImage={handleUnbindFeedImage}
              onFocusCanvasCard={onFocusCanvasCard ? handleFocusCanvasCardFromFeed : undefined}
              agentFocusedTargetId={agentFocusedTargetId}
              agentFocusedTargetIds={agentFocusedTargetIds}
              onDropLocalFile={(section, file) => {
                void handleDropLocalFileOnFeedSection(section, file);
              }}
              focusFeedAssetKey={focusFeedAssetKey}
              verifyingOrGeneratingAssetIds={[...verifyingAssetIds, ...generatingAssetIds]}
            />
          )}
          </>
        )}
      </AnimatePresence>
      {/* Asset Detail Modal */}
      {liveViewingAsset && liveViewingAsset.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onPointerDown={e => e.stopPropagation()}>
          <div className="bg-white dark:bg-neutral-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-full max-w-md p-4 space-y-3.5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-750">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  liveViewingAsset.category === 'character' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' :
                  liveViewingAsset.category === 'location' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                }`}>
                  {liveViewingAsset.category === 'character' ? '角色' : liveViewingAsset.category === 'location' ? '场景' : '道具'}
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100">
                  {liveViewingAsset.parentName ? `${liveViewingAsset.parentName} · ${liveViewingAsset.item.name}` : liveViewingAsset.item.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAsset(null)}
                aria-label="关闭资产详情"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Content */}
            <div className="space-y-3 text-xs">
              {/* Bound Images Strip */}
              {(() => {
                const boundImgs = resolveAssetImageEntries(liveViewingAsset.item, cardsById);
                return (
                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                        资产图（{boundImgs.length}）
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        {onStartCanvasAssetBind && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetInfo = buildAssetBindPickerTarget({
                                category: liveViewingAsset.category,
                                item: liveViewingAsset.item,
                                parentItem: liveViewingAsset.parentItem,
                              });
                              setViewingAsset(null);
                              onStartCanvasAssetBind(targetInfo);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 cursor-pointer"
                          >
                            <MousePointerClick className="w-3 h-3" />
                            <span>从画布绑定</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setBindImageModalTarget({
                              category: liveViewingAsset.category,
                              item: liveViewingAsset.item,
                              parentItem: liveViewingAsset.parentItem,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 cursor-pointer"
                        >
                          <ImagePlus className="w-3 h-3" />
                          <span>列表或本地上传绑定</span>
                        </button>
                        {onRequestGenerateAssetImage && (
                          <button
                            type="button"
                            onClick={() => {
                              applyDockTransition({ imagesExpanded: true });
                              onRequestGenerateAssetImage(
                                liveViewingAsset.category,
                                liveViewingAsset.item,
                                liveViewingAsset.parentItem
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-600 text-white hover:bg-purple-500 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>生成绑定</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {boundImgs.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {boundImgs.map((img) => {
                          const src = img.originalImageUrl || img.imageUrl || img.thumbnailUrl;
                          const assetFullTitle = liveViewingAsset.parentName
                            ? `${liveViewingAsset.parentName} · ${liveViewingAsset.item.name}`
                            : liveViewingAsset.item.name;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              data-lightbox-source-id={`detail:${img.id}`}
                              onClick={(e) => {
                                if (src) {
                                  const imgEl = e.currentTarget.querySelector('img') as HTMLImageElement | null;
                                  const rectSource = (imgEl || e.currentTarget).getBoundingClientRect();
                                  const naturalRatio =
                                    imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0
                                      ? imgEl.naturalWidth / imgEl.naturalHeight
                                      : rectSource.width > 0 && rectSource.height > 0
                                        ? rectSource.width / rectSource.height
                                        : undefined;
                                  setDetailModalLightboxImage({
                                    src,
                                    title: img.label || assetFullTitle,
                                    subtitle: img.ratio ? `${assetFullTitle} · ${img.ratio}` : assetFullTitle,
                                    originRect: {
                                      left: rectSource.left,
                                      top: rectSource.top,
                                      width: rectSource.width,
                                      height: rectSource.height,
                                    },
                                    aspectRatio: naturalRatio,
                                    cardBorderRadius: 8,
                                    sourceId: `detail:${img.id}`,
                                  });
                                }
                              }}
                              aria-label={`全屏查看 ${img.label || assetFullTitle}`}
                              className={`relative rounded-lg overflow-hidden border bg-white dark:bg-neutral-900 cursor-pointer group ${
                                img.isPrimary ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-gray-200 dark:border-neutral-700'
                              }`}
                            >
                              <div className="h-16 w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-900 overflow-hidden">
                                {src ? (
                                  <img src={src} alt={img.label || liveViewingAsset.item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              {img.isPrimary && (
                                <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                                  主图
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 dark:text-neutral-500">
                        暂未绑定资产图
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Identification Description */}
              <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  资产识别描述（首次出场 · 归属 · 防混淆特征）
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-neutral-200 leading-relaxed">
                  {liveViewingAsset.parentName
                    ? getVersionIdentificationText(liveViewingAsset.category, liveViewingAsset.item) || '未填写版本识别描述'
                    : getAssetIdentificationText(liveViewingAsset.category, liveViewingAsset.item) || '未填写资产识别描述'}
                </div>
              </div>

              {/* Subtitle / Role / Type */}
              <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  {liveViewingAsset.category === 'character' ? '角色身份与设定' : liveViewingAsset.category === 'location' ? '场景类型与时段' : '持有者/所属人'}
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                  {liveViewingAsset.category === 'character' ? (liveViewingAsset.item.role || '主要角色') :
                   liveViewingAsset.category === 'location' ? `${liveViewingAsset.item.type || 'INT'} · ${liveViewingAsset.item.timeOfDay || '日'}` :
                   (liveViewingAsset.item.owner || '未知')}
                </div>
              </div>

              {/* Main Description */}
              <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  {liveViewingAsset.category === 'character' ? '外貌与衣着特征' : liveViewingAsset.category === 'location' ? '空间氛围与光影影调' : '材质与物理状态'}
                </div>
                <div className="text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
                  {liveViewingAsset.category === 'character' ? (liveViewingAsset.item.appearance || '无具体特征描述') :
                   liveViewingAsset.category === 'location' ? (liveViewingAsset.item.atmosphere || '无空间氛围描述') :
                   (liveViewingAsset.item.materialAndState || '无材质说明')}
                </div>
              </div>

              {/* Versions list if present */}
              {Array.isArray(liveViewingAsset.item.versions) && liveViewingAsset.item.versions.length > 0 && (
                <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    多版本列表（{liveViewingAsset.item.versions.length} 个版本）
                  </div>
                  <div className="flex flex-col gap-1">
                    {liveViewingAsset.item.versions.map((ver: ScriptAssetVersion) => (
                      <div key={ver.id} className="text-xs flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                        <span className="font-bold text-gray-900 dark:text-neutral-100 shrink-0">{ver.name}</span>
                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate">
                          {getVersionIdentificationText(liveViewingAsset.category, ver)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Details if present */}
              {(liveViewingAsset.item.age || liveViewingAsset.item.visualDetails || liveViewingAsset.item.storySignificance) && (
                <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    {liveViewingAsset.category === 'character' ? '年龄与附加说明' : liveViewingAsset.category === 'location' ? '建筑与环境细节' : '剧情关键因素'}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-neutral-300">
                    {liveViewingAsset.item.age || liveViewingAsset.item.visualDetails || liveViewingAsset.item.storySignificance}
                  </div>
                </div>
              )}

              {/* AI Prompt Section */}
              <div className="p-2.5 bg-neutral-900 rounded-xl space-y-1.5 text-neutral-200">
                <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400">
                  <span>AI 视觉 Prompt 提示词</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(getViewingAssetPrompt, liveViewingAsset.item.id)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    {copiedId === liveViewingAsset.item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === liveViewingAsset.item.id ? '已复制' : '复制提示词'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono leading-relaxed text-neutral-300 break-words opacity-90">
                  {getViewingAssetPrompt}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-750">
              <button
                type="button"
                onClick={() => {
                  const { category, item, parentItem } = liveViewingAsset;
                  setViewingAsset(null);
                  handleOpenEditAsset(category, item, parentItem);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>编辑资产</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingAsset(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Asset Modal */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onPointerDown={e => e.stopPropagation()}>
          <div className="bg-white dark:bg-neutral-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-full max-w-md p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-750">
              <h3 className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                {assetForm.parentId
                  ? assetForm.isEditing
                    ? `编辑【${assetForm.parentName}】的版本`
                    : `为【${assetForm.parentName}】新增版本`
                  : assetForm.isEditing
                    ? '编辑资产条目'
                    : '新建资产条目'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAssetOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category selector if creating new top-level asset */}
            {!assetForm.isEditing && !assetForm.parentId && (
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddCategory('character')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    addCategory === 'character' ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-400 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  角色
                </button>
                <button
                  type="button"
                  onClick={() => setAddCategory('location')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    addCategory === 'location' ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-purple-400 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  场景
                </button>
                <button
                  type="button"
                  onClick={() => setAddCategory('prop')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    addCategory === 'prop' ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-2xs' : 'text-gray-500'
                  }`}
                >
                  道具
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-neutral-400 mb-1">
                  {assetForm.parentId
                    ? addCategory === 'character'
                      ? '服装/造型版本名称'
                      : addCategory === 'location'
                        ? '日景/夜景版本名称'
                        : '道具状态版本名称'
                    : addCategory === 'character'
                      ? '角色姓名'
                      : addCategory === 'location'
                        ? '场景名称'
                        : '道具名称'}
                </label>
                <input
                  type="text"
                  value={assetForm.name}
                  onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={
                    assetForm.parentId
                      ? addCategory === 'character'
                        ? '例如: 晚礼服版 / 睡衣版'
                        : addCategory === 'location'
                          ? '例如: 日景 / 夜景'
                          : '例如: 破损态 / 开启态'
                      : addCategory === 'character'
                        ? '例如: 戴安娜'
                        : addCategory === 'location'
                          ? '例如: 伯爵宅邸大厅'
                          : '例如: 画（生日蛋糕）'
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-neutral-400 mb-1">
                  资产识别浅色描述（防混淆：首次出场、谁的、区分特征）
                </label>
                <input
                  type="text"
                  value={assetForm.identificationDesc}
                  onChange={e => setAssetForm(f => ({ ...f, identificationDesc: e.target.value }))}
                  placeholder={
                    addCategory === 'prop'
                      ? '例: 第17集17-1首现 · 戴安娜画给爸爸的生日蛋糕画，区别于第8集铁链门画'
                      : addCategory === 'location'
                        ? '例: 第1集1-1首现 · 伯爵宅邸核心主厅，区分日景与夜景两个版本'
                        : '例: 第1集1-1首现 · 伯爵幼女/娜塔莉亚妹妹，按视觉上的不同造型区分版本'
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-neutral-400 mb-1">
                  {addCategory === 'character' ? '身份/设定' : addCategory === 'location' ? '内外景与时段 (例: INT · 日景 / INT · 夜景)' : '持有者/所属人'}
                </label>
                <input
                  type="text"
                  value={assetForm.subtitle}
                  onChange={e => setAssetForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder={addCategory === 'character' ? '例如: 伯爵幼女 / 娜塔莉亚妹妹' : addCategory === 'location' ? '例如: INT · 夜景' : '例如: 戴安娜'}
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-neutral-400 mb-1">
                  {addCategory === 'character' ? '外貌与衣着特征' : addCategory === 'location' ? '空间氛围与光影影调' : '材质与物理状态'}
                </label>
                <textarea
                  rows={3}
                  value={assetForm.description}
                  onChange={e => setAssetForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="详细特征与表现形式..."
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-neutral-400 mb-1">
                  {addCategory === 'character' ? '年龄/附加标记 (选填)' : addCategory === 'location' ? '建筑细节 (选填)' : '剧情关键 (选填)'}
                </label>
                <input
                  type="text"
                  value={assetForm.detail}
                  onChange={e => setAssetForm(f => ({ ...f, detail: e.target.value }))}
                  placeholder="可选说明..."
                  className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-750">
              <button
                type="button"
                onClick={() => setIsAddAssetOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveAssetForm}
                disabled={!assetForm.name.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 shadow-2xs"
              >
                保存资产
              </button>
            </div>
          </div>
        </div>
      )}

      {assetContextMenu && (
        <AssetItemContextMenu
          isOpen={assetContextMenu.isOpen}
          x={assetContextMenu.x}
          y={assetContextMenu.y}
          category={assetContextMenu.category}
          itemName={assetContextMenu.item?.name}
          parentName={assetContextMenu.parentItem?.name}
          isVersion={Boolean(assetContextMenu.parentItem)}
          cascadeBelowAgentHud={!isAgentSleeping}
          onAction={(action: AssetContextMenuActionId) => {
            const { category, item, parentItem } = assetContextMenu;
            if (action === 'add-version' && !parentItem) {
              handleOpenAddAsset(category, item);
            } else if (action === 'view') {
              handleViewAssetDetails(category, item, parentItem?.name);
            } else if (action === 'edit') {
              handleOpenEditAsset(category, item, parentItem);
            } else if (action === 'bind-image') {
              setBindImageModalTarget({ category, item, parentItem });
            } else if (action === 'agent-generate-image') {
              applyDockTransition({ imagesExpanded: true });
              onRequestGenerateAssetImage?.(category, item, parentItem);
            } else if (action === 'delete') {
              handleDeleteSingleAsset(category, item.id, parentItem?.id);
            }
          }}
          onClose={handleCloseAssetContextMenu}
        />
      )}

      {liveBindImageModalTarget && (
        <div data-image-bind-modal="true">
          <AssetBindImageModal
            isOpen={Boolean(liveBindImageModalTarget)}
            target={liveBindImageModalTarget}
            cards={cards || []}
            onClose={() => setBindImageModalTarget(null)}
            onBindCanvasCard={(params) => {
              handleBindCanvasCardToSection(
                liveBindImageModalTarget.category,
                liveBindImageModalTarget.item.id,
                liveBindImageModalTarget.parentItem?.id,
                params
              );
            }}
            onBindUploadedImage={(params) => {
              handleBindUploadedImageToSection(
                liveBindImageModalTarget.category,
                liveBindImageModalTarget.item.id,
                liveBindImageModalTarget.parentItem?.id,
                params
              );
            }}
          />
        </div>
      )}
      <FullscreenImageLightbox
        image={detailModalLightboxImage}
        onClose={() => setDetailModalLightboxImage(null)}
      />
    </>
  );
});
