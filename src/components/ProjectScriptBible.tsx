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
  Eye
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
import { ScriptView } from '../agent/scriptTools';
import { CardData } from './GenerationCard';

type TocItemType = 'episode' | 'scene' | 'chapter' | 'heading' | 'segment';

interface ProjectScriptBibleProps {
  currentProject: ScriptProject;
  projects: ScriptProject[];
  cards?: CardData[];
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
  agentFocusedTargetId?: string | null;
  agentFocusedTargetIds?: string[];
  verifyingAssetIds?: string[];
  onRequestVerifyAssetProvenance?: (category: 'character' | 'location' | 'prop', item: any) => void;
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

export function ProjectScriptBible({
  currentProject,
  projects,
  cards = [],
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
  agentFocusedTargetId,
  agentFocusedTargetIds = [],
  verifyingAssetIds = [],
  onRequestVerifyAssetProvenance
}: ProjectScriptBibleProps) {
  const isTargetAgentFocused = useCallback((targetId: string) => {
    return agentFocusedTargetId === targetId || agentFocusedTargetIds.includes(targetId);
  }, [agentFocusedTargetId, agentFocusedTargetIds]);
  // Navigation & filtering states inside drawer
  const [activeTab, setActiveTab] = useState<TabType>('script');
  const [activeSidePanel, setActiveSidePanel] = useState<'assets' | 'universe' | 'cards' | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = (currentProject?.id ? localStorage.getItem(`script_bible_active_side_panel_${currentProject.id}`) : null) ||
                    localStorage.getItem('script_bible_active_side_panel');
      if (saved === 'null' || saved === 'closed') return null;
      if (saved === 'assets' || saved === 'universe' || saved === 'cards') return saved;
    }
    return 'assets';
  });

  useEffect(() => {
    try {
      const val = activeSidePanel === null ? 'null' : activeSidePanel;
      localStorage.setItem('script_bible_active_side_panel', val);
      if (currentProject?.id) {
        localStorage.setItem(`script_bible_active_side_panel_${currentProject.id}`, val);
      }
      if (activeSidePanel !== null) {
        localStorage.setItem('script_bible_last_open_side_panel', activeSidePanel);
        if (currentProject?.id) {
          localStorage.setItem(`script_bible_last_open_side_panel_${currentProject.id}`, activeSidePanel);
        }
      }
    } catch {}
  }, [activeSidePanel, currentProject?.id]);

  useEffect(() => {
    if (currentProject?.id && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`script_bible_active_side_panel_${currentProject.id}`);
      if (saved !== null) {
        if (saved === 'null' || saved === 'closed') {
          setActiveSidePanel(null);
        } else if (saved === 'assets' || saved === 'universe' || saved === 'cards') {
          setActiveSidePanel(saved);
        }
      }
    }
  }, [currentProject?.id]);

  const [isMiniCardHovered, setIsMiniCardHovered] = useState(false);
  const [miniCardLeft, setMiniCardLeft] = useState(500);

  const handleMiniCardMouseEnter = useCallback(() => {
    setIsMiniCardHovered(true);
    // 鼠标悬停时平移滑出，无需放大
    setMiniCardLeft(526);
  }, []);

  const handleMiniCardMouseMove = useCallback((e: React.MouseEvent) => {
    setIsMiniCardHovered(true);
    // 鼠标在水平方向平移跟踪，最左保持在 524px (确保平移滑出)，最右延伸不超过 546px，仅平移不放大
    const targetLeft = Math.min(546, Math.max(524, e.clientX - 30));
    setMiniCardLeft(targetLeft);
  }, []);

  const handleMiniCardMouseLeave = useCallback(() => {
    setIsMiniCardHovered(false);
    setMiniCardLeft(500);
  }, []);

  const handleCloseSidePanel = useCallback(() => {
    setIsMiniCardHovered(false);
    setMiniCardLeft(500);
    setActiveSidePanel(null);
  }, []);

  useEffect(() => {
    if (activeSidePanel === null) {
      setIsMiniCardHovered(false);
      setMiniCardLeft(500);
    }
  }, [activeSidePanel]);

  const changeActiveTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    onViewChange(tab);
  }, [onViewChange]);

  const [assetFilter, setAssetFilter] = useState<AssetFilterType>(() => {
    if (typeof window !== 'undefined') {
      const saved = (currentProject?.id ? localStorage.getItem(`script_bible_asset_filter_${currentProject.id}`) : null) ||
                    localStorage.getItem('script_bible_asset_filter');
      if (saved === 'all' || saved === 'characters' || saved === 'locations' || saved === 'props') {
        return saved;
      }
    }
    return 'all';
  });

  useEffect(() => {
    try {
      localStorage.setItem('script_bible_asset_filter', assetFilter);
      if (currentProject?.id) {
        localStorage.setItem(`script_bible_asset_filter_${currentProject.id}`, assetFilter);
      }
    } catch {}
  }, [assetFilter, currentProject?.id]);

  useEffect(() => {
    if (currentProject?.id && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`script_bible_asset_filter_${currentProject.id}`);
      if (saved === 'all' || saved === 'characters' || saved === 'locations' || saved === 'props') {
        setAssetFilter(saved);
      }
    }
  }, [currentProject?.id]);

  const sidePanelContentRef = useRef<HTMLDivElement>(null);

  const handleSidePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (currentProject?.id && activeSidePanel) {
      try {
        localStorage.setItem(`script_side_panel_scroll_${currentProject.id}_${activeSidePanel}`, String(top));
      } catch {}
    }
    setActiveAssetHighlight(prev => {
      if (!prev || !scriptCardRef.current) return prev;
      const el = document.querySelector(`[data-agent-target$=".${prev.id}"]`) as HTMLElement | null;
      if (!el) return prev;
      const rowRect = el.getBoundingClientRect();
      const cardRect = scriptCardRef.current.getBoundingClientRect();
      const newY = rowRect.top - cardRect.top + rowRect.height / 2;
      return { ...prev, yTop: newY, cardHeight: cardRect.height || prev.cardHeight };
    });
  }, [currentProject?.id, activeSidePanel]);

  useEffect(() => {
    if (activeSidePanel && currentProject?.id && sidePanelContentRef.current) {
      try {
        const stored = localStorage.getItem(`script_side_panel_scroll_${currentProject.id}_${activeSidePanel}`);
        if (stored) {
          const top = parseFloat(stored) || 0;
          requestAnimationFrame(() => {
            if (sidePanelContentRef.current) {
              sidePanelContentRef.current.scrollTop = top;
            }
          });
        }
      } catch {}
    }
  }, [activeSidePanel, currentProject?.id]);
  const [scriptDraft, setScriptDraft] = useState(currentProject?.scriptText || '');
  const [currentSceneIndicator, setCurrentSceneIndicator] = useState('全局');
  const [versionStatus, setVersionStatus] = useState('已同步');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAssessedTextRef = useRef(currentProject?.scriptText || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAnimationSettled, setIsAnimationSettled] = useState(false);
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [isExtractingAssets, setIsExtractingAssets] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);

  // Asset Management state (Batch Selection, Add & Edit, Multi-version collapse)
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
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
    () => mergeMultiVersionAssetList('characters', currentProject.characters || []),
    [currentProject.characters]
  );
  const displayLocations = useMemo(
    () => mergeMultiVersionAssetList('locations', currentProject.locations || []),
    [currentProject.locations]
  );
  const displayProps = useMemo(
    () => mergeMultiVersionAssetList('props', currentProject.props || []),
    [currentProject.props]
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
    parentName?: string
  ) => {
    const isVersionClick = Boolean(parentName);
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
      if (e?.currentTarget) {
        const rowRect = e.currentTarget.getBoundingClientRect();
        if (scriptCardRef.current) {
          const cardRect = scriptCardRef.current.getBoundingClientRect();
          cardH = cardRect.height || 600;
          rawY = rowRect.top - cardRect.top + rowRect.height / 2;
        }
      } else {
        const el = document.querySelector(`[data-agent-target$=".${item.id}"]`) as HTMLElement | null;
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
      setActiveAssetMatchIndex(null);
      setActiveMultiHighlightSpans([]);
      setActiveProvenanceTargetChar(null);
    }
  }, [activeAssetHighlight]);

  // Synchronize asset highlight when Agent focuses an asset item via drag or right-click
  useEffect(() => {
    if (!agentFocusedTargetId || !agentFocusedTargetId.startsWith('assets.item.')) return;
    const findInList = (list: any[], id: string): { item: any; parentName?: string } | null => {
      for (const entry of list || []) {
        if (entry.id === id) return { item: entry };
        if (Array.isArray(entry.versions)) {
          const ver = entry.versions.find((v: any) => v.id === id);
          if (ver) return { item: ver, parentName: entry.name };
        }
      }
      return null;
    };

    if (agentFocusedTargetId.startsWith('assets.item.character.')) {
      const id = agentFocusedTargetId.replace('assets.item.character.', '');
      const hit = findInList(displayCharacters, id);
      if (hit && activeAssetHighlight?.id !== hit.item.id) {
        handleSelectAssetHighlight('character', hit.item, undefined, true, hit.parentName);
      }
    } else if (agentFocusedTargetId.startsWith('assets.item.location.')) {
      const id = agentFocusedTargetId.replace('assets.item.location.', '');
      const hit = findInList(displayLocations, id);
      if (hit && activeAssetHighlight?.id !== hit.item.id) {
        handleSelectAssetHighlight('location', hit.item, undefined, true, hit.parentName);
      }
    } else if (agentFocusedTargetId.startsWith('assets.item.prop.')) {
      const id = agentFocusedTargetId.replace('assets.item.prop.', '');
      const hit = findInList(displayProps, id);
      if (hit && activeAssetHighlight?.id !== hit.item.id) {
        handleSelectAssetHighlight('prop', hit.item, undefined, true, hit.parentName);
      }
    }
  }, [agentFocusedTargetId, displayCharacters, displayLocations, displayProps, activeAssetHighlight?.id, handleSelectAssetHighlight]);

  // Cancel asset highlight when clicking on blank space (outside asset items and provenance overlay)
  useEffect(() => {
    if (!activeAssetHighlight) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Keep selection if clicking inside an asset item, inside CandidateMatchesOverlay, or inside the script card (editor, text, toolbar)
      if (
        target.closest('[data-asset-item]') ||
        target.closest('[data-provenance-overlay]') ||
        (scriptCardRef.current && scriptCardRef.current.contains(target))
      ) {
        return;
      }

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
  }, [activeAssetHighlight]);



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

  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allAssetIds = useMemo(() => {
    const ids: string[] = [];
    if (assetFilter === 'all' || assetFilter === 'characters') {
      displayCharacters.forEach(c => ids.push(c.id));
    }
    if (assetFilter === 'all' || assetFilter === 'locations') {
      displayLocations.forEach(l => ids.push(l.id));
    }
    if (assetFilter === 'all' || assetFilter === 'props') {
      displayProps.forEach(p => ids.push(p.id));
    }
    return ids;
  }, [displayCharacters, displayLocations, displayProps, assetFilter]);

  const isAllSelected = allAssetIds.length > 0 && allAssetIds.every(id => selectedAssetIds.has(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAssetIds(prev => {
        const next = new Set(prev);
        allAssetIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedAssetIds(prev => {
        const next = new Set(prev);
        allAssetIds.forEach(id => next.add(id));
        return next;
      });
    }
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
    setActiveSidePanel('assets');
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


  // Position memory for each project's script reading location
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('script_scroll_positions');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      const cleaned: Record<string, number> = {};
      for (const k in parsed) {
        cleaned[k] = typeof parsed[k] === 'number' ? parsed[k] : (parsed[k]?.top || 0);
      }
      return cleaned;
    } catch {
      return {};
    }
  });
  const scrollPositionsRef = useRef<Record<string, number>>({});
  scrollPositionsRef.current = scrollPositions;
  const isRestoringScrollRef = useRef(false);
  const inferenceAttemptedRef = useRef<Set<string>>(new Set());
  const editorRef = useRef<ScriptCodeEditorRef | null>(null);

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

  useEffect(() => {
    if (requestedView === 'directory') {
      setActiveTab('script');
      onTocOpenChange(true);
      return;
    }
    setActiveTab(requestedView);
  }, [requestedView, onTocOpenChange]);

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
      editorRef.current?.scrollToOffset(jumpChar, { center: true, behavior: 'smooth' });
    });
  }, [activeAssetHighlight, activeTab, changeActiveTab, scriptDraft]);

  const handleJumpToToc = (item: TocItem) => {
    onTocOpenChange(false);
    if (activeTab !== 'script') {
      changeActiveTab('script');
    }

    const performJump = () => {
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

  // Sync script draft when currentProject changes
  useEffect(() => {
    setScriptDraft(currentProject?.scriptText || '');
    setActiveMultiHighlightSpans([]);
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

  // Separate Card animation from textarea rendering
  useEffect(() => {
    if (isOpen) {
      setIsAnimationSettled(false);
      setIsPositionReady(false);
      // Wait exactly for card scale/opacity animation (200ms) to settle completely
      const timer = setTimeout(() => {
        setIsAnimationSettled(true);
      }, 210);
      return () => clearTimeout(timer);
    } else {
      setIsAnimationSettled(false);
      setIsPositionReady(false);
    }
  }, [isOpen]);

  // Synchronously restore scroll position upon CodeMirror mount
  useEffect(() => {
    if (isAnimationSettled && isOpen) {
      const targetScroll = scrollPositionsRef.current[currentProject.id] || 0;
      isRestoringScrollRef.current = true;
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.scrollToTop(targetScroll);
        }
        requestAnimationFrame(() => {
          setIsPositionReady(true);
          setTimeout(() => {
            isRestoringScrollRef.current = false;
          }, 100);
        });
      });
    } else {
      setIsPositionReady(false);
    }
  }, [isAnimationSettled, isOpen, currentProject.id]);

  const saveScrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleScriptScroll = useCallback((top: number) => {
    if (isRestoringScrollRef.current || !isPositionReady) return;
    scrollPositionsRef.current[currentProject.id] = top;

    if (saveScrollDebounceRef.current) {
      clearTimeout(saveScrollDebounceRef.current);
    }
    saveScrollDebounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem('script_scroll_positions', JSON.stringify(scrollPositionsRef.current));
      } catch {}
    }, 300);
  }, [currentProject.id, isPositionReady]);

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
        className="fixed top-4 left-4 z-40 flex items-center gap-1.5" 
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
            data-prevent-canvas-wheel="true"
            data-agent-target="script.panel"
            className={`fixed top-[58px] bottom-4 left-4 w-[520px] max-w-[calc(100vw-32px)] z-50 flex flex-col select-text pointer-events-auto transform-gpu bg-[#f3f4f6] dark:bg-[#1C1C1E] border rounded-[24px] corner-squircle shadow-2xl overflow-hidden transition-shadow duration-200 ${
              agentFocusedTargetId === 'script.text' || agentFocusedTargetId === 'script.panel'
                ? 'border-purple-500/80 ring-2 ring-purple-500/50'
                : 'border-gray-300 dark:border-white/10'
            }`}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
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

                {/* Right action: Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  data-agent-target="script.close"
                  data-agent-actions="mouse.move mouse.click mouse.hover"
                  className="p-1.5 rounded-xl corner-squircle text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="收起剧本面板"
                >
                  <X className="w-4 h-4" />
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
                        onClick={() => {
                          setIsMultiSelectMode(prev => !prev);
                          if (isMultiSelectMode) {
                            setSelectedAssetIds(new Set());
                          }
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isMultiSelectMode
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white bg-white/80 dark:bg-neutral-800'
                        }`}
                        title="切换多选模式"
                      >
                        <Check className={`w-3.5 h-3.5 ${isMultiSelectMode ? 'text-white' : 'text-gray-400'}`} />
                        <span>多选</span>
                      </button>

                      {isMultiSelectMode && (
                        <>
                          <div className="h-4 w-px bg-gray-200 dark:bg-neutral-700 mx-1 shrink-0" />
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg font-semibold text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
                            title="全选/取消全选"
                          >
                            <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors ${isAllSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'}`}>
                              {isAllSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span>全选</span>
                          </button>
                        </>
                      )}
                      <div className="h-4 w-px bg-gray-200 dark:bg-neutral-700 mx-1 shrink-0" />

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

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedAssetIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleBatchDeleteAssets}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-2xs"
                        title="删除所有选中的资产"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除({selectedAssetIds.size})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenAddAsset(assetFilter === 'all' ? 'character' : assetFilter as any)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-2xs"
                      title="手动新建资产"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新建资产</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExtractAssets}
                      disabled={isExtractingAssets}
                      data-agent-target="assets.extract.all"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                      title="基于当前剧本正文全文执行实体提取与消歧"
                    >
                      {isExtractingAssets ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>提取全部</span>
                    </button>
                  </div>
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
                    {activeAssetHighlight && (
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

                  {isAnimationSettled ? (
                    <div className="relative flex-1 flex flex-col min-h-0 w-full h-full overflow-hidden">
                      <ScriptCodeEditor
                        key={`script-${currentProject.id}`}
                        ref={editorRef}
                        value={previewVersionId ? getPreviewText() : scriptDraft}
                        readOnly={!!previewVersionId}
                        onChange={handleScriptTextChange}
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
                        className={`transition-all duration-150 ease-out ${
                          isPositionReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex-1 h-full" />
                  )}

                  {/* Bottom Right Floating Stats */}
                  <div className={`absolute bottom-5 right-6 pointer-events-none select-none flex items-center gap-2.5 text-gray-400 dark:text-neutral-500 transition-all duration-200 ${
                    isCandidateOverlayExpanded ? 'opacity-30 blur-none' : 'opacity-60 blur-none'
                  }`}>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-medium tabular-nums leading-none">{(scriptDraft || '').length}</span>
                      <span className="text-[10px] leading-none mt-1.5">字</span>
                    </div>
                    <span className="text-[12px] leading-none mt-3.5 opacity-60">·</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-medium tabular-nums leading-none">{scriptDraft ? scriptDraft.split('\n').length : 0}</span>
                      <span className="text-[10px] leading-none mt-1.5">行</span>
                    </div>
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
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
                        const isAgentFocused = isTargetAgentFocused(`assets.item.character.${char.id}`);
                        const identText = getAssetIdentificationText('character', char);
                        const versions: ScriptAssetVersion[] = Array.isArray(char.versions) ? char.versions : [];
                        const hasMultipleVersions = versions.length > 1;
                        const isCollapsed = collapsedMultiVersionIds.has(char.id);
                        return (
                          <div key={char.id} className="flex flex-col">
                            <div
                              data-asset-item="true"
                              data-agent-target={`assets.item.character.${char.id}`}
                              onClick={(e) => {
                                if (isMultiSelectMode) {
                                  toggleSelectAsset(char.id);
                                } else {
                                  handleSelectAssetHighlight('character', char, e);
                                }
                              }}
                              onContextMenu={(e) => {
                                handleSelectAssetHighlight('character', char, e, true);
                              }}
                              className={`w-full relative px-3 py-2.5 rounded-xl corner-squircle transition-all duration-150 select-none active:scale-[0.985] active:brightness-95 cursor-pointer group flex items-center justify-between gap-3 ${
                                isAgentFocused
                                  ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/70'
                                  : isSelected || isHighlightActive
                                    ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 active:bg-blue-200/90 dark:active:bg-blue-800/80'
                                    : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 pr-1">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  {isMultiSelectMode ? (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelectAsset(char.id);
                                      }}
                                      className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                  ) : (
                                    <div className="text-blue-500 flex items-center justify-center">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                      </svg>
                                    </div>
                                  )}
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
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAddAsset('character', char);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="新增服装/造型版本"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAssetDetails('character', char);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="查看资产详情"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyText(prompt, char.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="复制出图提示词"
                                >
                                  {copiedId === char.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditAsset('character', char);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="编辑角色资产"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSingleAsset('character', char.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                  title="删除资产"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {hasMultipleVersions && !isCollapsed && (
                              <div className="ml-5 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                {versions.map((ver) => {
                                  const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                  const verFocused = isTargetAgentFocused(`assets.item.character.${ver.id}`);
                                  const verIdent = getVersionIdentificationText('character', ver);
                                  return (
                                    <div
                                      key={ver.id}
                                      data-asset-item="true"
                                      data-agent-target={`assets.item.character.${ver.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectAssetHighlight('character', ver, e, false, char.name);
                                      }}
                                      onContextMenu={(e) => {
                                        e.stopPropagation();
                                        handleSelectAssetHighlight('character', ver, e, true, char.name);
                                      }}
                                      className={`w-full relative px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${
                                        verFocused
                                          ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60'
                                          : verHighlight
                                            ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                                            : 'hover:bg-blue-50/80 dark:hover:bg-neutral-800/70 text-gray-600 dark:text-neutral-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 shrink-0" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 shrink-0 whitespace-nowrap" title={ver.name}>
                                          {ver.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={verIdent}>
                                          {verIdent}
                                        </span>
                                      </div>
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewAssetDetails('character', ver, char.name);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                                          title="查看版本详情"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditAsset('character', ver, char);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                                          title="编辑版本"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSingleAsset('character', ver.id, char.id);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                                          title="删除版本"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
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
                        const isAgentFocused = isTargetAgentFocused(`assets.item.location.${loc.id}`);
                        const identText = getAssetIdentificationText('location', loc);
                        const versions: ScriptAssetVersion[] = Array.isArray(loc.versions) ? loc.versions : [];
                        const hasMultipleVersions = versions.length > 1;
                        const isCollapsed = collapsedMultiVersionIds.has(loc.id);
                        return (
                          <div key={loc.id} className="flex flex-col">
                            <div
                              data-asset-item="true"
                              data-agent-target={`assets.item.location.${loc.id}`}
                              onClick={(e) => {
                                if (isMultiSelectMode) {
                                  toggleSelectAsset(loc.id);
                                } else {
                                  handleSelectAssetHighlight('location', loc, e);
                                }
                              }}
                              onContextMenu={(e) => {
                                handleSelectAssetHighlight('location', loc, e, true);
                              }}
                              className={`w-full relative px-3 py-2.5 rounded-xl corner-squircle transition-all duration-150 select-none active:scale-[0.985] active:brightness-95 cursor-pointer group flex items-center justify-between gap-3 ${
                                isAgentFocused
                                  ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/70'
                                  : isSelected || isHighlightActive
                                    ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 active:bg-blue-200/90 dark:active:bg-blue-800/80'
                                    : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 pr-1">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  {isMultiSelectMode ? (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelectAsset(loc.id);
                                      }}
                                      className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                  ) : (
                                    <div className="text-emerald-500 flex items-center justify-center">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                      </svg>
                                    </div>
                                  )}
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
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAddAsset('location', loc);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="新增日景/夜景版本"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAssetDetails('location', loc);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="查看资产详情"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyText(prompt, loc.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="复制出图提示词"
                                >
                                  {copiedId === loc.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditAsset('location', loc);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="编辑场景资产"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSingleAsset('location', loc.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                  title="删除资产"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {hasMultipleVersions && !isCollapsed && (
                              <div className="ml-5 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                {versions.map((ver) => {
                                  const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                  const verFocused = isTargetAgentFocused(`assets.item.location.${ver.id}`);
                                  const verIdent = getVersionIdentificationText('location', ver);
                                  return (
                                    <div
                                      key={ver.id}
                                      data-asset-item="true"
                                      data-agent-target={`assets.item.location.${ver.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectAssetHighlight('location', ver, e, false, loc.name);
                                      }}
                                      onContextMenu={(e) => {
                                        e.stopPropagation();
                                        handleSelectAssetHighlight('location', ver, e, true, loc.name);
                                      }}
                                      className={`w-full relative px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${
                                        verFocused
                                          ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60'
                                          : verHighlight
                                            ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                                            : 'hover:bg-blue-50/80 dark:hover:bg-neutral-800/70 text-gray-600 dark:text-neutral-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 shrink-0 whitespace-nowrap" title={ver.name}>
                                          {ver.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={verIdent}>
                                          {verIdent}
                                        </span>
                                      </div>
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewAssetDetails('location', ver, loc.name);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                                          title="查看版本详情"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditAsset('location', ver, loc);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                                          title="编辑版本"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSingleAsset('location', ver.id, loc.id);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                                          title="删除版本"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
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
                        const isAgentFocused = isTargetAgentFocused(`assets.item.prop.${prop.id}`);
                        const identText = getAssetIdentificationText('prop', prop);
                        const versions: ScriptAssetVersion[] = Array.isArray(prop.versions) ? prop.versions : [];
                        const hasMultipleVersions = versions.length > 1;
                        const isCollapsed = collapsedMultiVersionIds.has(prop.id);
                        return (
                          <div key={prop.id} className="flex flex-col">
                            <div
                              data-asset-item="true"
                              data-agent-target={`assets.item.prop.${prop.id}`}
                              onClick={(e) => {
                                if (isMultiSelectMode) {
                                  toggleSelectAsset(prop.id);
                                } else {
                                  handleSelectAssetHighlight('prop', prop, e);
                                }
                              }}
                              onContextMenu={(e) => {
                                handleSelectAssetHighlight('prop', prop, e, true);
                              }}
                              className={`w-full relative px-3 py-2.5 rounded-xl corner-squircle transition-all duration-150 select-none active:scale-[0.985] active:brightness-95 cursor-pointer group flex items-center justify-between gap-3 ${
                                isAgentFocused
                                  ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/70'
                                  : isSelected || isHighlightActive
                                    ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 active:bg-blue-200/90 dark:active:bg-blue-800/80'
                                    : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 w-full flex-1 pr-1">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  {isMultiSelectMode ? (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelectAsset(prop.id);
                                      }}
                                      className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                  ) : (
                                    <div className="text-amber-500 flex items-center justify-center">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85 17.96 7.5 12 4.15zM5 15.91l6 3.38v-6.72L5 9.19v6.72zm14 0v-6.72l-6 3.38v6.72l6-3.38z"/>
                                      </svg>
                                    </div>
                                  )}
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
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAddAsset('prop', prop);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="新增道具状态版本"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAssetDetails('prop', prop);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="查看资产详情"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyText(prompt, prop.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="复制出图提示词"
                                >
                                  {copiedId === prop.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditAsset('prop', prop);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                                  title="编辑道具资产"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSingleAsset('prop', prop.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                  title="删除资产"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {hasMultipleVersions && !isCollapsed && (
                              <div className="ml-5 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                {versions.map((ver) => {
                                  const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                  const verFocused = isTargetAgentFocused(`assets.item.prop.${ver.id}`);
                                  const verIdent = getVersionIdentificationText('prop', ver);
                                  return (
                                    <div
                                      key={ver.id}
                                      data-asset-item="true"
                                      data-agent-target={`assets.item.prop.${ver.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectAssetHighlight('prop', ver, e, false, prop.name);
                                      }}
                                      onContextMenu={(e) => {
                                        e.stopPropagation();
                                        handleSelectAssetHighlight('prop', ver, e, true, prop.name);
                                      }}
                                      className={`w-full relative px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${
                                        verFocused
                                          ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60'
                                          : verHighlight
                                            ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                                            : 'hover:bg-blue-50/80 dark:hover:bg-neutral-800/70 text-gray-600 dark:text-neutral-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-200 shrink-0 whitespace-nowrap" title={ver.name}>
                                          {ver.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate flex-1 min-w-0" title={verIdent}>
                                          {verIdent}
                                        </span>
                                      </div>
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewAssetDetails('prop', ver, prop.name);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                                          title="查看版本详情"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditAsset('prop', ver, prop);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                                          title="编辑版本"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSingleAsset('prop', ver.id, prop.id);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                                          title="删除版本"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
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
      </motion.div>

        {/* 卡片二: 独立侧边栏面板 Card (单一实体容器，打开时左侧卡片先出右侧后出，关闭时右侧卡片先消失左侧后收回) */}
        {activeTab === 'script' && (
          <motion.div
            variants={rightCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            transition={{
              layout: { duration: 0.22, ease: scriptBibleCardEase },
            }}
            data-prevent-canvas-wheel="true"
            onClick={() => {
              if (activeSidePanel === null) {
                const lastOpen = (currentProject?.id ? localStorage.getItem(`script_bible_last_open_side_panel_${currentProject.id}`) : null) ||
                                 localStorage.getItem('script_bible_last_open_side_panel');
                const panelToOpen = (lastOpen === 'assets' || lastOpen === 'universe' || lastOpen === 'cards') ? (lastOpen as 'assets' | 'universe' | 'cards') : 'assets';
                setActiveSidePanel(panelToOpen);
              }
            }}
            onMouseEnter={() => {
              if (activeSidePanel === null) handleMiniCardMouseEnter();
            }}
            onMouseMove={(e) => {
              if (activeSidePanel === null) handleMiniCardMouseMove(e);
            }}
            onMouseLeave={() => {
              if (activeSidePanel === null) handleMiniCardMouseLeave();
            }}
            style={{ left: `${activeSidePanel !== null ? 552 : miniCardLeft}px` }}
            className={`fixed top-[58px] z-40 flex select-none pointer-events-auto transform-gpu bg-[#f3f4f6] dark:bg-[#1C1C1E] border border-gray-300 dark:border-white/10 corner-squircle overflow-hidden ${
              activeSidePanel !== null
                ? 'bottom-4 w-[520px] max-w-[calc(100vw-568px)] z-50 rounded-[24px] shadow-2xl flex-col select-text cursor-default'
                : `w-[60px] h-[92px] rounded-[20px] cursor-pointer transition-shadow duration-200 group ${
                    isMiniCardHovered
                      ? 'shadow-xl border-blue-500/60'
                      : 'shadow-sm'
                  }`
            }`}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            title={activeSidePanel === null ? '点击展开资产清单' : undefined}
          >
            {activeSidePanel === null ? (
              /* 折叠状态: 0.5倍微缩实心卡片内部 */
              <div
                className="w-full h-full flex flex-col items-end justify-center pr-2.5 pl-1 py-2 select-none overflow-hidden"
              >
                {/* 资产图标 + 粗体竖排标题 “资产”：加上 0.22s 延迟淡入，与大卡片图标保持一致 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22, duration: 0.15 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <Box className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="[writing-mode:vertical-lr] tracking-[0.2em] text-xs font-black text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                    资产
                  </span>
                </motion.div>
              </div>
            ) : (
              /* 展开状态: 完整独立大卡片内部 */
              <div className="flex flex-col h-full w-full select-text overflow-hidden">
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

                  {/* 右侧关闭按钮 */}
                  <button
                    type="button"
                    onClick={handleCloseSidePanel}
                    className="p-1.5 rounded-xl corner-squircle text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="收起资产面板"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 二级工具栏 */}
                <div className="px-3.5 pb-2.5 pt-0.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">

                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMultiSelectMode(prev => !prev);
                              if (isMultiSelectMode) {
                                setSelectedAssetIds(new Set());
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
                              isMultiSelectMode
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white bg-white/80 dark:bg-neutral-800'
                            }`}
                            title="切换多选模式"
                          >
                            <Check className={`w-3.5 h-3.5 ${isMultiSelectMode ? 'text-white' : 'text-gray-400'}`} />
                            <span>多选</span>
                          </button>

                          {isMultiSelectMode && (
                            <>
                              <div className="h-4 w-px bg-gray-200 dark:bg-neutral-700 mx-1 shrink-0" />
                              <button
                                type="button"
                                onClick={handleToggleSelectAll}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg font-semibold text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
                                title="全选/取消全选"
                              >
                                <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors ${isAllSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'}`}>
                                  {isAllSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span>全选</span>
                              </button>
                            </>
                          )}
                          <div className="h-4 w-px bg-gray-200 dark:bg-neutral-700 mx-1 shrink-0" />

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

                      <div className="flex items-center gap-1.5 shrink-0">
                        {selectedAssetIds.size > 0 && (
                          <button
                            type="button"
                            onClick={handleBatchDeleteAssets}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-2xs"
                            title="删除选中的资产"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>删除({selectedAssetIds.size})</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenAddAsset(assetFilter === 'all' ? 'character' : (assetFilter as any))}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-2xs"
                          title="手动新建资产"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>新建资产</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleExtractAssets}
                          disabled={isExtractingAssets}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                          title="一键提取剧本实体"
                        >
                          {isExtractingAssets ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>提取全部</span>
                        </button>
                      </div>
                    </div>
                </div>
              </div>

              {/* 侧栏主体内容 */}
              <div
                ref={sidePanelContentRef}
                data-agent-target={activeSidePanel === 'assets' ? 'assets.panel' : activeSidePanel === 'universe' ? 'universe.panel' : 'cards.panel'}
                onScroll={handleSidePanelScroll}
                className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
              >
                {activeSidePanel === 'assets' && (
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
                          const isAgentFocused = isTargetAgentFocused(`assets.item.character.${char.id}`);
                          const identText = getAssetIdentificationText('character', char);
                          const versions: ScriptAssetVersion[] = Array.isArray(char.versions) ? char.versions : [];
                          const hasMultipleVersions = versions.length > 1;
                          const isCollapsed = collapsedMultiVersionIds.has(char.id);
                          return (
                            <div key={char.id} className="flex flex-col">
                              <div
                                data-asset-item="true"
                                data-agent-target={`assets.item.character.${char.id}`}
                                onClick={(e) => {
                                  if (isMultiSelectMode) {
                                    toggleSelectAsset(char.id);
                                  } else {
                                    handleSelectAssetHighlight('character', char, e);
                                  }
                                }}
                                onContextMenu={(e) => {
                                  handleSelectAssetHighlight('character', char, e, true);
                                }}
                                className={`w-full relative px-2.5 py-2.5 rounded-xl corner-squircle transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none active:scale-[0.985] active:brightness-95 ${
                                  isAgentFocused
                                    ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/70'
                                    : isSelected || isHighlightActive
                                      ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 active:bg-blue-200/90 dark:active:bg-blue-800/80'
                                      : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    {isMultiSelectMode ? (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSelectAsset(char.id);
                                        }}
                                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    ) : (
                                      <div className="text-blue-500 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs font-bold shrink-0 max-w-[180px] truncate" title={char.name}>{char.name}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={identText}>{identText}</span>
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
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1.5 py-0.5 rounded-lg border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenAddAsset('character', char); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="新增服装/造型版本"><Plus className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleViewAssetDetails('character', char); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="查看资产详情"><Eye className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenEditAsset('character', char); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="编辑资产"><Edit3 className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSingleAsset('character', char.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded" title="删除资产"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                              {hasMultipleVersions && !isCollapsed && (
                                <div className="ml-4 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                  {versions.map((ver) => {
                                    const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                    const verFocused = isTargetAgentFocused(`assets.item.character.${ver.id}`);
                                    const verIdent = getVersionIdentificationText('character', ver);
                                    return (
                                      <div
                                        key={ver.id}
                                        data-asset-item="true"
                                        data-agent-target={`assets.item.character.${ver.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectAssetHighlight('character', ver, e, false, char.name);
                                        }}
                                        onContextMenu={(e) => {
                                          e.stopPropagation();
                                          handleSelectAssetHighlight('character', ver, e, true, char.name);
                                        }}
                                        className={`w-full relative px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${
                                          verFocused
                                            ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60'
                                            : verHighlight
                                              ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40'
                                              : 'hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-gray-600 dark:text-neutral-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 w-full flex-1 pr-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 shrink-0" />
                                          <span className="text-[11px] font-bold shrink-0 truncate max-w-[120px]" title={ver.name}>{ver.name}</span>
                                          <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={verIdent}>{verIdent}</span>
                                        </div>
                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1 py-0.5 rounded-md border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                          <button onClick={(e) => { e.stopPropagation(); handleViewAssetDetails('character', ver, char.name); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="查看版本详情"><Eye className="w-3 h-3" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditAsset('character', ver, char); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="编辑版本"><Edit3 className="w-2.5 h-2.5" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSingleAsset('character', ver.id, char.id); }} className="p-0.5 text-gray-400 hover:text-red-500 rounded" title="删除版本"><Trash2 className="w-2.5 h-2.5" /></button>
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
                          const isAgentFocused = isTargetAgentFocused(`assets.item.location.${loc.id}`);
                          const identText = getAssetIdentificationText('location', loc);
                          const versions: ScriptAssetVersion[] = Array.isArray(loc.versions) ? loc.versions : [];
                          const hasMultipleVersions = versions.length > 1;
                          const isCollapsed = collapsedMultiVersionIds.has(loc.id);
                          return (
                            <div key={loc.id} className="flex flex-col">
                              <div
                                data-asset-item="true"
                                data-agent-target={`assets.item.location.${loc.id}`}
                                onClick={(e) => {
                                  if (isMultiSelectMode) {
                                    toggleSelectAsset(loc.id);
                                  } else {
                                    handleSelectAssetHighlight('location', loc, e);
                                  }
                                }}
                                onContextMenu={(e) => {
                                  handleSelectAssetHighlight('location', loc, e, true);
                                }}
                                className={`w-full relative px-2.5 py-2.5 rounded-xl corner-squircle transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none active:scale-[0.985] active:brightness-95 ${
                                  isAgentFocused
                                    ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/70'
                                    : isSelected || isHighlightActive
                                      ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 active:bg-blue-200/90 dark:active:bg-blue-800/80'
                                      : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    {isMultiSelectMode ? (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSelectAsset(loc.id);
                                        }}
                                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    ) : (
                                      <div className="text-emerald-500 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs font-bold shrink-0 max-w-[180px] truncate" title={loc.name}>{loc.name}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={identText}>{identText}</span>
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
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1.5 py-0.5 rounded-lg border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenAddAsset('location', loc); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="新增日景/夜景版本"><Plus className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleViewAssetDetails('location', loc); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="查看资产详情"><Eye className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenEditAsset('location', loc); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="编辑资产"><Edit3 className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSingleAsset('location', loc.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded" title="删除资产"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                              {hasMultipleVersions && !isCollapsed && (
                                <div className="ml-4 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                  {versions.map((ver) => {
                                    const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                    const verFocused = isTargetAgentFocused(`assets.item.location.${ver.id}`);
                                    const verIdent = getVersionIdentificationText('location', ver);
                                    return (
                                      <div
                                        key={ver.id}
                                        data-asset-item="true"
                                        data-agent-target={`assets.item.location.${ver.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectAssetHighlight('location', ver, e, false, loc.name);
                                        }}
                                        onContextMenu={(e) => {
                                          e.stopPropagation();
                                          handleSelectAssetHighlight('location', ver, e, true, loc.name);
                                        }}
                                        className={`w-full relative px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${
                                          verFocused
                                            ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60'
                                            : verHighlight
                                              ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40'
                                              : 'hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-gray-600 dark:text-neutral-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 w-full flex-1 pr-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                                          <span className="text-[11px] font-bold shrink-0 truncate max-w-[120px]" title={ver.name}>{ver.name}</span>
                                          <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={verIdent}>{verIdent}</span>
                                        </div>
                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1 py-0.5 rounded-md border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                          <button onClick={(e) => { e.stopPropagation(); handleViewAssetDetails('location', ver, loc.name); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="查看版本详情"><Eye className="w-3 h-3" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditAsset('location', ver, loc); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="编辑版本"><Edit3 className="w-2.5 h-2.5" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSingleAsset('location', ver.id, loc.id); }} className="p-0.5 text-gray-400 hover:text-red-500 rounded" title="删除版本"><Trash2 className="w-2.5 h-2.5" /></button>
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
                          const isAgentFocused = isTargetAgentFocused(`assets.item.prop.${prop.id}`);
                          const identText = getAssetIdentificationText('prop', prop);
                          const versions: ScriptAssetVersion[] = Array.isArray(prop.versions) ? prop.versions : [];
                          const hasMultipleVersions = versions.length > 1;
                          const isCollapsed = collapsedMultiVersionIds.has(prop.id);
                          return (
                            <div key={prop.id} className="flex flex-col">
                              <div
                                data-asset-item="true"
                                data-agent-target={`assets.item.prop.${prop.id}`}
                                onClick={(e) => {
                                  if (isMultiSelectMode) {
                                    toggleSelectAsset(prop.id);
                                  } else {
                                    handleSelectAssetHighlight('prop', prop, e);
                                  }
                                }}
                                onContextMenu={(e) => {
                                  handleSelectAssetHighlight('prop', prop, e, true);
                                }}
                                className={`w-full relative px-2.5 py-2.5 rounded-xl corner-squircle transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none active:scale-[0.985] active:brightness-95 ${
                                  isAgentFocused
                                    ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/70'
                                    : isSelected || isHighlightActive
                                      ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 active:bg-blue-200/90 dark:active:bg-blue-800/80'
                                      : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-gray-700 dark:text-neutral-200 hover:text-blue-700 dark:hover:text-blue-300 active:bg-blue-100/70 dark:active:bg-blue-900/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 w-full flex-1 pr-1">
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    {isMultiSelectMode ? (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSelectAsset(prop.id);
                                        }}
                                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200/80 dark:bg-neutral-700/80 text-transparent'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    ) : (
                                      <div className="text-amber-500 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85 17.96 7.5 12 4.15zM5 15.91l6 3.38v-6.72L5 9.19v6.72zm14 0v-6.72l-6 3.38v6.72l6-3.38z"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs font-bold shrink-0 max-w-[180px] truncate" title={prop.name}>{prop.name}</span>
                                  <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={identText}>{identText}</span>
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
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1.5 py-0.5 rounded-lg border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenAddAsset('prop', prop); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="新增道具状态版本"><Plus className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleViewAssetDetails('prop', prop); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="查看资产详情"><Eye className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenEditAsset('prop', prop); }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="编辑资产"><Edit3 className="w-3 h-3" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSingleAsset('prop', prop.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded" title="删除资产"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                              {hasMultipleVersions && !isCollapsed && (
                                <div className="ml-4 pl-2.5 border-l border-gray-200/80 dark:border-neutral-700/80 flex flex-col gap-1 mt-1 mb-1.5">
                                  {versions.map((ver) => {
                                    const verHighlight = activeAssetHighlight?.id === ver.id && Boolean(activeAssetHighlight?.isVersion);
                                    const verFocused = isTargetAgentFocused(`assets.item.prop.${ver.id}`);
                                    const verIdent = getVersionIdentificationText('prop', ver);
                                    return (
                                      <div
                                        key={ver.id}
                                        data-asset-item="true"
                                        data-agent-target={`assets.item.prop.${ver.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectAssetHighlight('prop', ver, e, false, prop.name);
                                        }}
                                        onContextMenu={(e) => {
                                          e.stopPropagation();
                                          handleSelectAssetHighlight('prop', ver, e, true, prop.name);
                                        }}
                                        className={`w-full relative px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer group flex items-center justify-between gap-2 select-none ${
                                          verFocused
                                            ? 'bg-purple-100/90 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 ring-1 ring-purple-500/60'
                                            : verHighlight
                                              ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40'
                                              : 'hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-gray-600 dark:text-neutral-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 w-full flex-1 pr-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                                          <span className="text-[11px] font-bold shrink-0 truncate max-w-[120px]" title={ver.name}>{ver.name}</span>
                                          <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate min-w-0 flex-1" title={verIdent}>{verIdent}</span>
                                        </div>
                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xs px-1 py-0.5 rounded-md border border-gray-200/80 dark:border-neutral-700/80 shadow-xs z-10">
                                          <button onClick={(e) => { e.stopPropagation(); handleViewAssetDetails('prop', ver, prop.name); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="查看版本详情"><Eye className="w-3 h-3" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditAsset('prop', ver, prop); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="编辑版本"><Edit3 className="w-2.5 h-2.5" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSingleAsset('prop', ver.id, prop.id); }} className="p-0.5 text-gray-400 hover:text-red-500 rounded" title="删除版本"><Trash2 className="w-2.5 h-2.5" /></button>
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

                {activeSidePanel === 'universe' && (
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

                    {activeSidePanel === 'cards' && (
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
          </>
        )}
      </AnimatePresence>
      {/* Asset Detail Modal */}
      {viewingAsset && viewingAsset.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onPointerDown={e => e.stopPropagation()}>
          <div className="bg-white dark:bg-neutral-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-full max-w-md p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-750">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  viewingAsset.category === 'character' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' :
                  viewingAsset.category === 'location' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                }`}>
                  {viewingAsset.category === 'character' ? '角色' : viewingAsset.category === 'location' ? '场景' : '道具'}
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100">
                  {viewingAsset.parentName ? `${viewingAsset.parentName} · ${viewingAsset.item.name}` : viewingAsset.item.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAsset(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Content */}
            <div className="space-y-3 text-xs">
              {/* Identification Description */}
              <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  资产识别描述（首次出场 · 归属 · 防混淆特征）
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-neutral-200 leading-relaxed">
                  {viewingAsset.parentName
                    ? getVersionIdentificationText(viewingAsset.category, viewingAsset.item) || '未填写版本识别描述'
                    : getAssetIdentificationText(viewingAsset.category, viewingAsset.item) || '未填写资产识别描述'}
                </div>
              </div>

              {/* Subtitle / Role / Type */}
              <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  {viewingAsset.category === 'character' ? '角色身份与设定' : viewingAsset.category === 'location' ? '场景类型与时段' : '持有者/所属人'}
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                  {viewingAsset.category === 'character' ? (viewingAsset.item.role || '主要角色') :
                   viewingAsset.category === 'location' ? `${viewingAsset.item.type || 'INT'} · ${viewingAsset.item.timeOfDay || '日'}` :
                   (viewingAsset.item.owner || '未知')}
                </div>
              </div>

              {/* Main Description */}
              <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                  {viewingAsset.category === 'character' ? '外貌与衣着特征' : viewingAsset.category === 'location' ? '空间氛围与光影影调' : '材质与物理状态'}
                </div>
                <div className="text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
                  {viewingAsset.category === 'character' ? (viewingAsset.item.appearance || '无具体特征描述') :
                   viewingAsset.category === 'location' ? (viewingAsset.item.atmosphere || '无空间氛围描述') :
                   (viewingAsset.item.materialAndState || '无材质说明')}
                </div>
              </div>

              {/* Versions list if present */}
              {Array.isArray(viewingAsset.item.versions) && viewingAsset.item.versions.length > 0 && (
                <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    多版本列表（{viewingAsset.item.versions.length} 个版本）
                  </div>
                  <div className="flex flex-col gap-1">
                    {viewingAsset.item.versions.map((ver: ScriptAssetVersion) => (
                      <div key={ver.id} className="text-xs flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                        <span className="font-bold text-gray-900 dark:text-neutral-100 shrink-0">{ver.name}</span>
                        <span className="text-[11px] text-gray-400 dark:text-neutral-400 truncate">
                          {getVersionIdentificationText(viewingAsset.category, ver)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Details if present */}
              {(viewingAsset.item.age || viewingAsset.item.visualDetails || viewingAsset.item.storySignificance) && (
                <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-1">
                  <div className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                    {viewingAsset.category === 'character' ? '年龄与附加说明' : viewingAsset.category === 'location' ? '建筑与环境细节' : '剧情关键因素'}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-neutral-300">
                    {viewingAsset.item.age || viewingAsset.item.visualDetails || viewingAsset.item.storySignificance}
                  </div>
                </div>
              )}

              {/* AI Prompt Section */}
              <div className="p-2.5 bg-neutral-900 rounded-xl space-y-1.5 text-neutral-200">
                <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400">
                  <span>AI 视觉 Prompt 提示词</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(getViewingAssetPrompt, viewingAsset.item.id)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {copiedId === viewingAsset.item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === viewingAsset.item.id ? '已复制' : '复制提示词'}</span>
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
                  const { category, item } = viewingAsset;
                  setViewingAsset(null);
                  handleOpenEditAsset(category, item);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>编辑资产</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingAsset(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
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
    </>
  );
}
