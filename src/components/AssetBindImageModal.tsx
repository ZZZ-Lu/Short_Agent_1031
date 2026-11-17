import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  Link2,
  Maximize2,
  Search,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { compressImageBlob, type CardData } from './GenerationCard';
import {
  distributeMasonryColumns,
  filterAndOrderBindCandidateCards,
  getCardBindPreviewUrl,
  resolveCardAspectRatioCss,
  type AssetCategory,
} from '../utils/assetImages';
import {
  FullscreenImageLightbox,
  type FullscreenImageLightboxData,
} from './FullscreenImageLightbox';

export interface AssetBindTargetInfo {
  category: AssetCategory;
  item: any;
  parentItem?: any;
}

export interface AssetBindImageModalProps {
  isOpen: boolean;
  target: AssetBindTargetInfo | null;
  cards: CardData[];
  onClose: () => void;
  onBindCanvasCard: (params: {
    card: CardData;
    label?: string;
    setPrimary: boolean;
  }) => void;
  onBindUploadedImage: (params: {
    dataUrl: string;
    label?: string;
    setPrimary: boolean;
  }) => void;
}

const CATEGORY_BADGES: Record<AssetCategory, { label: string; className: string }> = {
  character: {
    label: '角色',
    className: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  location: {
    label: '场景',
    className: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  },
  prop: {
    label: '道具',
    className: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  },
};

export function AssetBindImageModal({
  isOpen,
  target,
  cards,
  onClose,
  onBindCanvasCard,
  onBindUploadedImage,
}: AssetBindImageModalProps) {
  const [tab, setTab] = useState<'canvas' | 'upload'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [setPrimary, setSetPrimary] = useState(true);
  const [customLabel, setCustomLabel] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [previewLightbox, setPreviewLightbox] = useState<FullscreenImageLightboxData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const alreadyBoundCardIds = useMemo(() => {
    const ids = new Set<string>();
    const rawImages = Array.isArray(target?.item?.images) ? target.item.images : [];
    for (const entry of rawImages) {
      if (entry?.cardId) ids.add(entry.cardId);
    }
    return ids;
  }, [target]);

  const candidateCards = useMemo(
    () => filterAndOrderBindCandidateCards(cards, searchQuery),
    [cards, searchQuery]
  );

  const masonryColumns4 = useMemo(
    () => distributeMasonryColumns(candidateCards, 4),
    [candidateCards]
  );

  const masonryColumns5 = useMemo(
    () => distributeMasonryColumns(candidateCards, 5),
    [candidateCards]
  );

  const masonryColumns3 = useMemo(
    () => distributeMasonryColumns(candidateCards, 3),
    [candidateCards]
  );

  const masonryColumns2 = useMemo(
    () => distributeMasonryColumns(candidateCards, 2),
    [candidateCards]
  );

  if (!isOpen || !target) return null;

  const badge = CATEGORY_BADGES[target.category];
  const displayName = target.parentItem
    ? `${target.parentItem.name} · ${target.item.name}`
    : target.item.name;

  const handleFilePicked = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择有效的图片文件（PNG / JPG / WebP）。');
      return;
    }
    setUploadError(null);
    setIsProcessingUpload(true);
    try {
      const dataUrl = await compressImageBlob(file, 1280, 0.85);
      setUploadedPreview(dataUrl);
      if (!customLabel.trim()) {
        setCustomLabel(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      setUploadError('读取或压缩图片失败，请换一张图片重试。');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const renderCandidateCard = (card: CardData) => {
    const previewSrc = getCardBindPreviewUrl(card);
    const fullSrc =
      card.trueOriginalImageUrl ||
      card.originalImageUrl ||
      card.imageUrl ||
      previewSrc;
    const cardTitle = card.fileName || card.name || `卡片 #${card.id.slice(-5)}`;
    const isBound = alreadyBoundCardIds.has(card.id);
    const aspectRatio = resolveCardAspectRatioCss(card);

    return (
      <div
        key={card.id}
        data-bind-candidate-card="true"
        className={`group relative flex flex-col rounded-2xl corner-squircle border overflow-hidden transition-[border-color,box-shadow] bg-white dark:bg-[#262629] hover:border-blue-500 hover:shadow-lg ${
          isBound
            ? 'border-blue-500 ring-1 ring-blue-500/35'
            : 'border-gray-200/90 dark:border-neutral-700/80'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onBindCanvasCard({
              card,
              label: customLabel.trim() || undefined,
              setPrimary,
            });
            onClose();
          }}
          className="w-full text-left cursor-pointer focus:outline-none"
          aria-label={`绑定画布卡片 ${cardTitle}`}
        >
          {/* Visual Frame: true natural aspect ratio, zero cropping */}
          <div className="relative w-full bg-gray-100/90 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt={cardTitle}
                data-lightbox-source-id={`bind-modal:${card.id}`}
                width={card.nativeWidth}
                height={card.nativeHeight}
                style={aspectRatio ? { aspectRatio } : undefined}
                loading={previewSrc.startsWith('data:') || previewSrc.startsWith('blob:') ? 'eager' : 'lazy'}
                decoding="sync"
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  const targetImg = e.currentTarget;
                  if (targetImg.naturalWidth > 0 && targetImg.naturalHeight > 0) {
                    targetImg.style.aspectRatio = `${targetImg.naturalWidth} / ${targetImg.naturalHeight}`;
                  }
                }}
                className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-24 flex flex-col items-center justify-center gap-1 text-gray-400">
                <ImageIcon className="w-5 h-5" />
                <span className="text-[10px]">无预览图</span>
              </div>
            )}

            {isBound && (
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white shadow-xs flex items-center gap-0.5 pointer-events-none">
                <Check className="w-2.5 h-2.5" />
                已绑定
              </span>
            )}
          </div>

          {/* Clean Compact Metadata */}
          <div className="px-2.5 py-2 space-y-0.5 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[11px] font-semibold text-gray-900 dark:text-neutral-100 truncate">
                {cardTitle}
              </span>
              {card.ratio && (
                <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 shrink-0 tabular-nums">
                  {card.ratio}
                </span>
              )}
            </div>
            {card.prompt && (
              <div className="text-[10px] text-gray-400 dark:text-neutral-400 line-clamp-1">
                {card.prompt}
              </div>
            )}
          </div>
        </button>

        {/* Quick Fullscreen Inspect Button (without binding on click) */}
        {fullSrc && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const cardEl = e.currentTarget.closest('[data-bind-candidate-card="true"]');
              const imgEl = cardEl?.querySelector('img') as HTMLImageElement | null;
              const rectSource = (imgEl || e.currentTarget).getBoundingClientRect();
              const naturalRatio =
                imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0
                  ? imgEl.naturalWidth / imgEl.naturalHeight
                  : rectSource.width > 0 && rectSource.height > 0
                    ? rectSource.width / rectSource.height
                    : undefined;
              setPreviewLightbox({
                src: fullSrc,
                title: cardTitle,
                subtitle: card.ratio ? `画布卡片 · ${card.ratio}` : '画布卡片',
                originRect: {
                  left: rectSource.left,
                  top: rectSource.top,
                  width: rectSource.width,
                  height: rectSource.height,
                },
                aspectRatio: naturalRatio,
                cardBorderRadius: 16,
                sourceId: `bind-modal:${card.id}`,
              });
            }}
            aria-label={`全屏预览 ${cardTitle}`}
            title="全屏看大图"
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/55 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      data-prevent-canvas-wheel="true"
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 backdrop-blur-xs p-2 sm:p-3"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`为 ${displayName} 手动绑定图像`}
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl corner-squircle shadow-2xl border border-gray-200 dark:border-neutral-700 w-full h-full p-3.5 sm:p-4 gap-3 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Unified Single-Row Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100 dark:border-neutral-700/80 shrink-0">
          {/* Left: Title + Mode Switch */}
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${badge.className}`}>
                {badge.label}
              </span>
              <h3
                className="text-sm font-bold text-gray-900 dark:text-neutral-100 truncate max-w-[200px] xl:max-w-[260px]"
                title={`手动绑定图像 · ${displayName}`}
              >
                手动绑定图像 · {displayName}
              </h3>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-neutral-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setTab('canvas')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tab === 'canvas'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-gray-500 dark:text-neutral-400'
                }`}
              >
                从画布选择 ({candidateCards.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tab === 'upload'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-gray-500 dark:text-neutral-400'
                }`}
              >
                上传本地图像
              </button>
            </div>
          </div>

          {/* Right: Search (canvas mode) + Label + Primary Toggle + Close */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end min-w-0">
            {tab === 'canvas' && (
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="按卡片名称或提示词筛选画布图像..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="备注标签（如：正视图 / 三视图）"
              className="w-44 xl:w-52 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shrink-0"
            />
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-neutral-300 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={setPrimary}
                onChange={(e) => setSetPrimary(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>设为资产主图</span>
            </label>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭绑定图像弹窗"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {tab === 'canvas' ? (
          <div className="flex flex-col gap-3 min-h-0 flex-1">
            {candidateCards.length === 0 ? (
              <div className="py-12 text-center space-y-2 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700">
                <ImageIcon className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto" />
                <p className="text-xs font-medium text-gray-600 dark:text-neutral-300">
                  画布中暂无可选图像卡片
                </p>
                <p className="text-[11px] text-gray-400">
                  可切换到「上传本地图像」直接上传，或在画布先创建/生成图像卡片。
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                {/* 2 columns below sm breakpoint */}
                <div className="grid grid-cols-2 gap-3 items-start sm:hidden">
                  {masonryColumns2.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-3">
                      {col.map(renderCandidateCard)}
                    </div>
                  ))}
                </div>
                {/* 3 columns on sm–md */}
                <div className="hidden sm:grid sm:grid-cols-3 lg:hidden gap-3 items-start">
                  {masonryColumns3.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-3">
                      {col.map(renderCandidateCard)}
                    </div>
                  ))}
                </div>
                {/* 4 columns on lg */}
                <div className="hidden lg:grid lg:grid-cols-4 xl:hidden gap-3 items-start">
                  {masonryColumns4.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-3">
                      {col.map(renderCandidateCard)}
                    </div>
                  ))}
                </div>
                {/* 5 balanced masonry columns on xl+ full-page view */}
                <div className="hidden xl:grid xl:grid-cols-5 gap-3.5 items-start">
                  {masonryColumns5.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-3.5">
                      {col.map(renderCandidateCard)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="选择本地图像文件"
              onChange={(e) => {
                void handleFilePicked(e.target.files?.[0]);
              }}
              className="hidden"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleFilePicked(e.dataTransfer?.files?.[0]);
              }}
              className="flex-1 rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-700 p-6 flex flex-col items-center justify-center gap-3 text-center bg-gray-50/70 dark:bg-neutral-900/50 min-h-0"
            >
              {uploadedPreview ? (
                <img
                  src={uploadedPreview}
                  alt="已上传预览"
                  className="max-h-[68vh] max-w-full w-auto h-auto rounded-xl object-contain border border-black/10"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
              <p className="text-xs text-gray-600 dark:text-neutral-300">
                {isProcessingUpload
                  ? '正在压缩并加载图片...'
                  : uploadedPreview
                    ? '图片已就绪，可重新选择或点击下方确认绑定'
                    : '拖拽图片到此区域，或点击选择本地图像文件'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
              >
                选择本地文件
              </button>
              {uploadError && (
                <p className="text-[11px] text-red-500 font-medium">{uploadError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!uploadedPreview || isProcessingUpload}
                onClick={() => {
                  if (!uploadedPreview) return;
                  onBindUploadedImage({
                    dataUrl: uploadedPreview,
                    label: customLabel.trim() || undefined,
                    setPrimary,
                  });
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white cursor-pointer"
              >
                确认绑定
              </button>
            </div>
          </div>
        )}
      </div>

      <FullscreenImageLightbox
        image={previewLightbox}
        onClose={() => setPreviewLightbox(null)}
      />
    </div>
  );
}

export interface CanvasCardAssetOption {
  key: string;
  category: AssetCategory;
  assetId: string;
  parentId?: string;
  displayName: string;
  subtitle: string;
  boundCount: number;
  alreadyBound: boolean;
}

export interface CanvasCardBindAssetModalProps {
  isOpen: boolean;
  card: CardData | null;
  options: CanvasCardAssetOption[];
  onClose: () => void;
  onSelectAsset: (option: CanvasCardAssetOption, setPrimary: boolean) => void;
}

export function CanvasCardBindAssetModal({
  isOpen,
  card,
  options,
  onClose,
  onSelectAsset,
}: CanvasCardBindAssetModalProps) {
  const [query, setQuery] = useState('');
  const [setPrimary, setSetPrimary] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.displayName.toLowerCase().includes(q) ||
        opt.subtitle.toLowerCase().includes(q)
    );
  }, [options, query]);

  if (!isOpen || !card) return null;

  const cardThumb = getCardBindPreviewUrl(card);
  const cardTitle = card.fileName || card.name || `卡片 #${card.id.slice(-5)}`;

  return (
    <div
      data-prevent-canvas-wheel="true"
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`将 ${cardTitle} 绑定到剧本资产`}
        className="bg-white dark:bg-[#1C1C1E] rounded-2xl corner-squircle shadow-2xl border border-gray-200 dark:border-neutral-700 w-full max-w-md p-4 space-y-3 max-h-[82vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-700/80 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-4 h-4 text-blue-500 shrink-0" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 truncate">
              将画布卡片绑定至剧本资产
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭绑定资产弹窗"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview of card being bound */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200/70 dark:border-neutral-700 shrink-0">
          <div className="max-w-20 max-h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-900 shrink-0 flex items-center justify-center">
            {cardThumb ? (
              <img src={cardThumb} alt={cardTitle} className="max-w-20 max-h-16 w-auto h-auto object-contain" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">
              {cardTitle}
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {card.prompt || '无提示词描述'}
            </div>
          </div>
        </div>

        {/* Search + Primary toggle */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索目标角色 / 场景 / 道具或版本..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-neutral-300 cursor-pointer shrink-0 select-none">
            <input
              type="checkbox"
              checked={setPrimary}
              onChange={(e) => setSetPrimary(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span>设为主图</span>
          </label>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              未找到匹配的剧本资产，请先在「剧本&资产」中创建或提取资产。
            </div>
          ) : (
            filtered.map((opt) => {
              const badge = CATEGORY_BADGES[opt.category];
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onSelectAsset(opt, setPrimary);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-gray-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/70 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors text-left cursor-pointer"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">
                        {opt.displayName}
                      </span>
                    </div>
                    {opt.subtitle && (
                      <p className="text-[11px] text-gray-400 dark:text-neutral-400 truncate">
                        {opt.subtitle}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold shrink-0 ${
                      opt.alreadyBound
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
                    }`}
                  >
                    {opt.alreadyBound ? '已绑定 · 设为主图' : `绑定${opt.boundCount > 0 ? ` (${opt.boundCount})` : ''}`}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
