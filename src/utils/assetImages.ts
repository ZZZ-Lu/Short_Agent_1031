import type {
  AssetImageBinding,
  AssetImageSource,
  ScriptAssetVersion,
  ScriptCharacter,
  ScriptLocation,
  ScriptProp,
} from '../types/script';

export type AssetCategory = 'character' | 'location' | 'prop';

export interface LiveCardSnapshot {
  id: string;
  name?: string;
  fileName?: string;
  prompt?: string;
  state?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string;
  closeupThumbnailUrl?: string;
  fullDetailThumbnailUrl?: string;
  microLodThumbnailUrl?: string;
  videoPosterUrl?: string;
  originalImageUrl?: string | null;
  trueOriginalImageUrl?: string | null;
  ratio?: string;
  nativeWidth?: number;
  nativeHeight?: number;
  customWidth?: number;
  customHeight?: number;
  isVideo?: boolean;
  isText?: boolean;
}

export interface ResolvedAssetImageEntry {
  id: string;
  cardId?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  thumbnailUrl?: string;
  label?: string;
  prompt?: string;
  source: AssetImageSource;
  isPrimary: boolean;
  createdAt: number;
  cardState?: string;
  cardMissing?: boolean;
  cardTitle?: string;
  ratio?: string;
  nativeWidth?: number;
  nativeHeight?: number;
  aspectRatio?: string;
  isVideo?: boolean;
}

export interface AssetImageFeedSection {
  key: string;
  assetId: string;
  parentId?: string;
  parentName?: string;
  name: string;
  category: AssetCategory;
  isVersion: boolean;
  subtitle: string;
  images: ResolvedAssetImageEntry[];
}

export interface AssetImageFeedCard {
  key: string;
  image: ResolvedAssetImageEntry;
  assetId: string;
  parentId?: string;
  parentName?: string;
  assetName: string;
  category: AssetCategory;
  isVersion: boolean;
}

export interface BindAssetImageInput {
  id?: string;
  cardId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  label?: string;
  prompt?: string;
  source: AssetImageSource;
  setPrimary?: boolean;
  createdAt?: number;
}

export function resolveCardAspectRatioCss(card?: LiveCardSnapshot | null): string | undefined {
  if (!card) return undefined;
  if (
    typeof card.nativeWidth === 'number' &&
    card.nativeWidth > 0 &&
    typeof card.nativeHeight === 'number' &&
    card.nativeHeight > 0
  ) {
    return `${card.nativeWidth} / ${card.nativeHeight}`;
  }
  if (
    typeof card.customWidth === 'number' &&
    card.customWidth > 0 &&
    typeof card.customHeight === 'number' &&
    card.customHeight > 0
  ) {
    return `${card.customWidth} / ${card.customHeight}`;
  }
  if (typeof card.ratio === 'string' && card.ratio.includes(':')) {
    const [wRaw, hRaw] = card.ratio.split(':').map((part) => Number(part.trim()));
    if (Number.isFinite(wRaw) && wRaw > 0 && Number.isFinite(hRaw) && hRaw > 0) {
      return `${wRaw} / ${hRaw}`;
    }
  }
  return undefined;
}

export function resolveCardAspectRatioNumber(card?: LiveCardSnapshot | null): number {
  if (!card) return 1;
  if (
    typeof card.nativeWidth === 'number' &&
    card.nativeWidth > 0 &&
    typeof card.nativeHeight === 'number' &&
    card.nativeHeight > 0
  ) {
    return card.nativeWidth / card.nativeHeight;
  }
  if (
    typeof card.customWidth === 'number' &&
    card.customWidth > 0 &&
    typeof card.customHeight === 'number' &&
    card.customHeight > 0
  ) {
    return card.customWidth / card.customHeight;
  }
  if (typeof card.ratio === 'string' && card.ratio.includes(':')) {
    const [wRaw, hRaw] = card.ratio.split(':').map((part) => Number(part.trim()));
    if (Number.isFinite(wRaw) && wRaw > 0 && Number.isFinite(hRaw) && hRaw > 0) {
      return wRaw / hRaw;
    }
  }
  return 1;
}

export function getCardBindPreviewUrl(card?: LiveCardSnapshot | null): string | undefined {
  if (!card) return undefined;
  if (card.isVideo) {
    return card.videoPosterUrl || card.closeupThumbnailUrl || card.thumbnailUrl || undefined;
  }
  return (
    card.imageUrl ||
    card.originalImageUrl ||
    card.trueOriginalImageUrl ||
    card.closeupThumbnailUrl ||
    card.thumbnailUrl ||
    undefined
  );
}

export function filterAndOrderBindCandidateCards<T extends LiveCardSnapshot>(
  cards: T[],
  searchQuery: string
): T[] {
  const q = searchQuery.trim().toLowerCase();
  const matched = cards
    .filter((c) => !c.isVideo)
    .filter((c) => {
      if (!q) return true;
      const text = `${c.fileName || ''} ${c.name || ''} ${c.prompt || ''}`.toLowerCase();
      return text.includes(q);
    });

  // Show cards with actual images first, followed by empty draft/text cards
  const withImage: T[] = [];
  const withoutImage: T[] = [];
  for (const card of matched) {
    if (getCardBindPreviewUrl(card)) {
      withImage.push(card);
    } else {
      withoutImage.push(card);
    }
  }
  return [...withImage, ...withoutImage];
}

export function distributeMasonryColumns<T extends LiveCardSnapshot>(
  items: T[],
  columnCount: number
): T[][] {
  const safeCount = Math.max(1, Math.floor(columnCount));
  const columns: T[][] = Array.from({ length: safeCount }, () => []);
  const heights = new Array<number>(safeCount).fill(0);

  for (const item of items) {
    let targetCol = 0;
    for (let i = 1; i < safeCount; i++) {
      if (heights[i] < heights[targetCol]) {
        targetCol = i;
      }
    }
    columns[targetCol].push(item);
    const hasImg = Boolean(getCardBindPreviewUrl(item));
    const ratio = resolveCardAspectRatioNumber(item);
    // Relative height contribution (width = 1) + metadata footer height estimate
    const imageHeight = hasImg ? Math.min(Math.max(1 / ratio, 0.35), 2.4) : 0.42;
    heights[targetCol] += imageHeight + 0.25;
  }

  return columns;
}

export function buildCardSnapshotMap(cards: LiveCardSnapshot[] = []): Map<string, LiveCardSnapshot> {
  const map = new Map<string, LiveCardSnapshot>();
  for (const card of cards) {
    if (card && typeof card.id === 'string' && card.id) {
      map.set(card.id, card);
    }
  }
  return map;
}

export function resolveAssetImageEntries(
  item: {
    id: string;
    images?: AssetImageBinding[];
    referenceImage?: string;
  } | null | undefined,
  cardsById?: Map<string, LiveCardSnapshot>
): ResolvedAssetImageEntry[] {
  if (!item) return [];

  const rawList = Array.isArray(item.images) ? item.images : [];
  if (rawList.length > 0) {
    const hasExplicitPrimary = rawList.some(entry => Boolean(entry?.isPrimary));
    return rawList
      .filter((entry): entry is AssetImageBinding => Boolean(entry && typeof entry === 'object'))
      .map((entry, idx) => {
        const linkedCard = entry.cardId && cardsById ? cardsById.get(entry.cardId) : undefined;
        const isDetachedCardEntry = Boolean(entry.cardId && !linkedCard);
        const safeEntryImageUrl = sanitizeDetachedAssetImageUrl(entry.imageUrl, isDetachedCardEntry);
        const safeEntryThumbUrl = sanitizeDetachedAssetImageUrl(entry.thumbnailUrl, isDetachedCardEntry);
        const isVideoCard = Boolean(linkedCard?.isVideo);
        const resolvedThumb =
          linkedCard?.thumbnailUrl ||
          linkedCard?.closeupThumbnailUrl ||
          linkedCard?.fullDetailThumbnailUrl ||
          linkedCard?.videoPosterUrl ||
          (isVideoCard ? undefined : linkedCard?.imageUrl) ||
          (isVideoCard ? undefined : linkedCard?.originalImageUrl) ||
          (isVideoCard ? undefined : linkedCard?.trueOriginalImageUrl) ||
          linkedCard?.microLodThumbnailUrl ||
          safeEntryThumbUrl ||
          safeEntryImageUrl;
        const resolvedOriginalUrl = isVideoCard
          ? linkedCard?.videoPosterUrl || undefined
          : linkedCard?.trueOriginalImageUrl ||
            linkedCard?.originalImageUrl ||
            linkedCard?.imageUrl ||
            safeEntryImageUrl ||
            undefined;
        const resolvedUrl = isVideoCard
          ? linkedCard?.videoPosterUrl ||
            linkedCard?.closeupThumbnailUrl ||
            linkedCard?.thumbnailUrl ||
            safeEntryImageUrl ||
            safeEntryThumbUrl
          : linkedCard?.imageUrl ||
            linkedCard?.originalImageUrl ||
            linkedCard?.trueOriginalImageUrl ||
            linkedCard?.videoPosterUrl ||
            linkedCard?.closeupThumbnailUrl ||
            linkedCard?.thumbnailUrl ||
            safeEntryImageUrl ||
            safeEntryThumbUrl;
        const nativeWidth =
          typeof linkedCard?.nativeWidth === 'number' && linkedCard.nativeWidth > 0
            ? linkedCard.nativeWidth
            : typeof linkedCard?.customWidth === 'number' && linkedCard.customWidth > 0
              ? linkedCard.customWidth
              : undefined;
        const nativeHeight =
          typeof linkedCard?.nativeHeight === 'number' && linkedCard.nativeHeight > 0
            ? linkedCard.nativeHeight
            : typeof linkedCard?.customHeight === 'number' && linkedCard.customHeight > 0
              ? linkedCard.customHeight
              : undefined;
        return {
          id: entry.id,
          cardId: entry.cardId,
          imageUrl: resolvedUrl || undefined,
          originalImageUrl: resolvedOriginalUrl,
          thumbnailUrl: resolvedThumb || undefined,
          label: entry.label,
          prompt: entry.prompt || linkedCard?.prompt,
          source: entry.source || 'canvas',
          isPrimary: hasExplicitPrimary ? Boolean(entry.isPrimary) : idx === 0,
          createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : 0,
          cardState: linkedCard?.state,
          cardMissing: Boolean(entry.cardId && cardsById && !linkedCard),
          cardTitle: linkedCard?.fileName || linkedCard?.name,
          ratio: linkedCard?.ratio,
          nativeWidth,
          nativeHeight,
          aspectRatio: resolveCardAspectRatioCss(linkedCard),
          isVideo: isVideoCard || undefined,
        };
      });
  }

  if (typeof item.referenceImage === 'string' && item.referenceImage.trim()) {
    return [
      {
        id: `legacy_ref_${item.id}`,
        imageUrl: item.referenceImage.trim(),
        thumbnailUrl: item.referenceImage.trim(),
        source: 'upload',
        isPrimary: true,
        createdAt: 0,
      },
    ];
  }

  return [];
}

export function getPrimaryAssetImageEntry(
  item: {
    id: string;
    images?: AssetImageBinding[];
    referenceImage?: string;
  } | null | undefined,
  cardsById?: Map<string, LiveCardSnapshot>
): ResolvedAssetImageEntry | null {
  const list = resolveAssetImageEntries(item, cardsById);
  if (list.length === 0) return null;
  return list.find(entry => entry.isPrimary) || list[0] || null;
}

export function bindImageToAssetItem<
  T extends {
    id: string;
    images?: AssetImageBinding[];
    referenceImage?: string;
  }
>(
  item: T,
  input: BindAssetImageInput,
  cardsById?: Map<string, LiveCardSnapshot>
): { updatedItem: T; boundImage: AssetImageBinding } {
  const existingEntries: AssetImageBinding[] = Array.isArray(item.images)
    ? item.images.map(entry => ({ ...entry }))
    : typeof item.referenceImage === 'string' && item.referenceImage.trim()
      ? [
          {
            id: `legacy_ref_${item.id}`,
            imageUrl: item.referenceImage.trim(),
            thumbnailUrl: item.referenceImage.trim(),
            source: 'upload',
            isPrimary: true,
            createdAt: 0,
          },
        ]
      : [];

  const linkedCard = input.cardId && cardsById ? cardsById.get(input.cardId) : undefined;
  const resolvedUrl =
    input.imageUrl ||
    linkedCard?.imageUrl ||
    linkedCard?.originalImageUrl ||
    undefined;
  const resolvedThumb =
    input.thumbnailUrl ||
    linkedCard?.thumbnailUrl ||
    resolvedUrl;

  const existingIndex = input.cardId
    ? existingEntries.findIndex(e => e.cardId === input.cardId)
    : input.id
      ? existingEntries.findIndex(e => e.id === input.id)
      : -1;

  const shouldSetPrimary =
    typeof input.setPrimary === 'boolean'
      ? input.setPrimary
      : existingEntries.length === 0;

  let nextEntries: AssetImageBinding[];
  let boundImage: AssetImageBinding;

  if (existingIndex !== -1) {
    const prev = existingEntries[existingIndex];
    boundImage = {
      ...prev,
      cardId: input.cardId ?? prev.cardId,
      imageUrl: resolvedUrl ?? prev.imageUrl,
      thumbnailUrl: resolvedThumb ?? prev.thumbnailUrl,
      label: input.label !== undefined ? input.label : prev.label,
      prompt: input.prompt !== undefined ? input.prompt : prev.prompt,
      source: input.source || prev.source,
      isPrimary: shouldSetPrimary ? true : prev.isPrimary,
    };
    nextEntries = existingEntries.map((entry, idx) => {
      if (idx === existingIndex) return boundImage;
      return shouldSetPrimary ? { ...entry, isPrimary: false } : entry;
    });
  } else {
    const newId =
      input.id ||
      `aimg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    boundImage = {
      id: newId,
      ...(input.cardId ? { cardId: input.cardId } : {}),
      ...(resolvedUrl ? { imageUrl: resolvedUrl } : {}),
      ...(resolvedThumb ? { thumbnailUrl: resolvedThumb } : {}),
      ...(input.label ? { label: input.label } : {}),
      ...(input.prompt ? { prompt: input.prompt } : {}),
      source: input.source,
      isPrimary: shouldSetPrimary,
      createdAt: typeof input.createdAt === 'number' ? input.createdAt : Date.now(),
    };
    const normalizedPrev = shouldSetPrimary
      ? existingEntries.map(entry => ({ ...entry, isPrimary: false }))
      : existingEntries;
    nextEntries = [boundImage, ...normalizedPrev];
  }

  // Ensure at least one primary exists
  if (nextEntries.length > 0 && !nextEntries.some(e => e.isPrimary)) {
    nextEntries[0] = { ...nextEntries[0], isPrimary: true };
  }

  const primaryEntry = nextEntries.find(e => e.isPrimary) || nextEntries[0];
  const primaryLiveCard = primaryEntry?.cardId && cardsById ? cardsById.get(primaryEntry.cardId) : undefined;
  const primaryRefUrl =
    primaryLiveCard?.imageUrl ||
    primaryLiveCard?.thumbnailUrl ||
    primaryEntry?.imageUrl ||
    primaryEntry?.thumbnailUrl ||
    undefined;

  return {
    updatedItem: {
      ...item,
      images: nextEntries,
      referenceImage: primaryRefUrl,
    },
    boundImage,
  };
}

export function setPrimaryAssetImageOnItem<
  T extends {
    id: string;
    images?: AssetImageBinding[];
    referenceImage?: string;
  }
>(
  item: T,
  imageId: string,
  cardsById?: Map<string, LiveCardSnapshot>
): T {
  const existingEntries: AssetImageBinding[] = Array.isArray(item.images)
    ? item.images.map(entry => ({ ...entry }))
    : [];
  if (existingEntries.length === 0) return item;

  const hasTarget = existingEntries.some(e => e.id === imageId);
  if (!hasTarget) return item;

  const nextEntries = existingEntries.map(entry => ({
    ...entry,
    isPrimary: entry.id === imageId,
  }));
  const primaryEntry = nextEntries.find(e => e.isPrimary) || nextEntries[0];
  const primaryLiveCard = primaryEntry?.cardId && cardsById ? cardsById.get(primaryEntry.cardId) : undefined;
  const primaryRefUrl =
    primaryLiveCard?.imageUrl ||
    primaryLiveCard?.thumbnailUrl ||
    primaryEntry?.imageUrl ||
    primaryEntry?.thumbnailUrl ||
    undefined;

  return {
    ...item,
    images: nextEntries,
    referenceImage: primaryRefUrl,
  };
}

export function unbindImageFromAssetItem<
  T extends {
    id: string;
    images?: AssetImageBinding[];
    referenceImage?: string;
  }
>(
  item: T,
  imageId: string,
  cardsById?: Map<string, LiveCardSnapshot>
): T {
  if (imageId === `legacy_ref_${item.id}`) {
    return {
      ...item,
      images: [],
      referenceImage: undefined,
    };
  }
  const existingEntries: AssetImageBinding[] = Array.isArray(item.images)
    ? item.images
    : [];
  const remaining = existingEntries
    .filter(e => e.id !== imageId)
    .map(e => ({ ...e }));

  if (remaining.length > 0 && !remaining.some(e => e.isPrimary)) {
    remaining[0] = { ...remaining[0], isPrimary: true };
  }

  const primaryEntry = remaining.find(e => e.isPrimary) || remaining[0];
  const primaryLiveCard = primaryEntry?.cardId && cardsById ? cardsById.get(primaryEntry.cardId) : undefined;
  const primaryRefUrl =
    primaryLiveCard?.imageUrl ||
    primaryLiveCard?.thumbnailUrl ||
    primaryEntry?.imageUrl ||
    primaryEntry?.thumbnailUrl ||
    undefined;

  return {
    ...item,
    images: remaining,
    referenceImage: primaryRefUrl,
  };
}

export function buildAssetImageFeed({
  characters = [],
  locations = [],
  props = [],
  assetFilter = 'all',
  cards = [],
}: {
  characters?: ScriptCharacter[];
  locations?: ScriptLocation[];
  props?: ScriptProp[];
  assetFilter?: 'all' | 'characters' | 'locations' | 'props';
  cards?: LiveCardSnapshot[];
}): {
  sections: AssetImageFeedSection[];
  timelineCards: AssetImageFeedCard[];
  totalBoundImages: number;
} {
  const cardsById = buildCardSnapshotMap(cards);
  const sections: AssetImageFeedSection[] = [];
  const timelineCards: AssetImageFeedCard[] = [];

  const pushSection = (
    category: AssetCategory,
    item: Record<string, any> | null | undefined,
    parentItem?: Record<string, any> | null
  ) => {
    if (!item || typeof item !== 'object' || !item.id) return;
    const itemName = String(item.name || '').trim() || '未命名资产';
    const parentName = parentItem?.name ? String(parentItem.name) : undefined;
    const images = resolveAssetImageEntries(item as any, cardsById);
    const isVersion = Boolean(parentItem);
    const sectionKey = `${category}:${item.id}`;
    const subtitle =
      category === 'character'
        ? String(item.appearance || item.role || item.description || '').trim()
        : category === 'location'
          ? String(item.atmosphere || item.visualDetails || item.description || '').trim()
          : String(item.materialAndState || item.storySignificance || item.description || '').trim();

    sections.push({
      key: sectionKey,
      assetId: item.id,
      parentId: parentItem?.id,
      parentName,
      name: itemName,
      category,
      isVersion,
      subtitle,
      images,
    });

    for (const img of images) {
      timelineCards.push({
        key: `${sectionKey}:${img.id}`,
        image: img,
        assetId: item.id,
        parentId: parentItem?.id,
        parentName,
        assetName: itemName,
        category,
        isVersion,
      });
    }
  };

  if (assetFilter === 'all' || assetFilter === 'characters') {
    for (const char of characters) {
      if (!char || !char.id) continue;
      const versions: ScriptAssetVersion[] = Array.isArray(char.versions)
        ? char.versions.filter((v): v is ScriptAssetVersion => Boolean(v && v.id))
        : [];
      if (versions.length > 1) {
        for (const ver of versions) {
          pushSection('character', ver, char);
        }
      } else {
        pushSection('character', char);
      }
    }
  }

  if (assetFilter === 'all' || assetFilter === 'locations') {
    for (const loc of locations) {
      if (!loc || !loc.id) continue;
      const versions: ScriptAssetVersion[] = Array.isArray(loc.versions)
        ? loc.versions.filter((v): v is ScriptAssetVersion => Boolean(v && v.id))
        : [];
      if (versions.length > 1) {
        for (const ver of versions) {
          pushSection('location', ver, loc);
        }
      } else {
        pushSection('location', loc);
      }
    }
  }

  if (assetFilter === 'all' || assetFilter === 'props') {
    for (const prop of props) {
      if (!prop || !prop.id) continue;
      const versions: ScriptAssetVersion[] = Array.isArray(prop.versions)
        ? prop.versions.filter((v): v is ScriptAssetVersion => Boolean(v && v.id))
        : [];
      if (versions.length > 1) {
        for (const ver of versions) {
          pushSection('prop', ver, prop);
        }
      } else {
        pushSection('prop', prop);
      }
    }
  }

  timelineCards.sort((a, b) => (b.image.createdAt || 0) - (a.image.createdAt || 0));

  return {
    sections,
    timelineCards,
    totalBoundImages: timelineCards.length,
  };
}

export function buildAssetImagePrompt({
  category,
  item,
  parentItem,
  artStyle,
}: {
  category: AssetCategory;
  item: Record<string, any>;
  parentItem?: Record<string, any> | null;
  artStyle?: string;
}): string {
  const fullName = parentItem?.name ? `${parentItem.name}（${item.name}）` : item.name;
  const parts: string[] = [];

  if (category === 'character') {
    parts.push(`角色资产图：${fullName}`);
    if (item.role || parentItem?.role) parts.push(`身份设定：${item.role || parentItem?.role}`);
    if (item.age) parts.push(`年龄：${item.age}`);
    if (item.appearance) parts.push(`外貌与服饰细节：${item.appearance}`);
    if (item.description) parts.push(item.description);
    parts.push('单人居中立绘/半身资产图，服装细节清晰，面部特征明确，干净中性背景');
  } else if (category === 'location') {
    parts.push(`场景概念参考图：${fullName}`);
    const locType = item.type || parentItem?.type;
    if (locType) parts.push(locType === 'EXT' ? '外景' : '内景');
    if (item.timeOfDay) parts.push(`时段：${item.timeOfDay}`);
    if (item.atmosphere) parts.push(`空间氛围与光影：${item.atmosphere}`);
    if (item.visualDetails) parts.push(`建筑与环境细节：${item.visualDetails}`);
    if (item.description) parts.push(item.description);
    parts.push('电影级场景概念设计，构图稳定，光影层次清晰');
  } else {
    parts.push(`道具设定参考图：${fullName}`);
    if (item.owner || parentItem?.owner) parts.push(`所属人：${item.owner || parentItem?.owner}`);
    if (item.materialAndState) parts.push(`材质与状态：${item.materialAndState}`);
    if (item.storySignificance) parts.push(`特征描述：${item.storySignificance}`);
    if (item.description) parts.push(item.description);
    parts.push('道具独立特写展示，结构与材质细节清晰，干净展示背景');
  }

  if (artStyle && artStyle.trim()) {
    parts.push(`美术风格：${artStyle.trim()}`);
  }

  return parts.filter(Boolean).join('，');
}

export interface FeedTileDisplayMeta {
  displayName: string;
  leftTagText: string;
  showPrimaryStar: boolean;
  resolutionTag: string;
  rightTagReservedPx: number;
  leftTagMaxRightCss: string;
}

export function stripMediaFileExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '').trim();
}

export function resolveMediaResolutionTag({
  width,
  height,
  isVideo = false,
  hasMedia = true,
}: {
  width?: number | null;
  height?: number | null;
  isVideo?: boolean;
  hasMedia?: boolean;
}): string {
  if (!hasMedia) return '';
  if (
    typeof width !== 'number' ||
    !Number.isFinite(width) ||
    width <= 0 ||
    typeof height !== 'number' ||
    !Number.isFinite(height) ||
    height <= 0
  ) {
    return '';
  }

  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);
  if (isVideo) {
    if (minDim >= 2160 || maxDim >= 3840) return '4K';
    if (minDim >= 1080 || maxDim >= 1920) return '1080p';
    if (minDim >= 720 || maxDim >= 1280) return '720p';
    return '480p';
  }
  if (maxDim >= 4000) return '4K+';
  if (maxDim >= 3840 || minDim >= 2160) return '4K';
  if (maxDim >= 2048 || minDim >= 1440) return '2K';
  return '1K';
}

export function resolveFeedTileDisplayMeta({
  section,
  img,
  isStandaloneSingle,
  showSectionTitle,
  loadedDimensions,
  hasRenderableImage = true,
}: {
  section: Pick<AssetImageFeedSection, 'name' | 'parentName'>;
  img: Pick<
    ResolvedAssetImageEntry,
    'label' | 'cardTitle' | 'isPrimary' | 'nativeWidth' | 'nativeHeight' | 'isVideo'
  >;
  isStandaloneSingle: boolean;
  showSectionTitle: boolean;
  loadedDimensions?: { width: number; height: number } | null;
  hasRenderableImage?: boolean;
}): FeedTileDisplayMeta {
  const displayName = section.parentName
    ? `${section.parentName} · ${section.name}`
    : section.name;

  const cleanedLabel = typeof img.label === 'string' ? img.label.trim() : '';
  const cleanedCardTitle =
    typeof img.cardTitle === 'string' ? stripMediaFileExtension(img.cardTitle) : '';

  const leftTagText =
    isStandaloneSingle || showSectionTitle
      ? displayName
      : cleanedLabel || cleanedCardTitle || displayName;

  const effWidth =
    loadedDimensions && loadedDimensions.width > 0
      ? loadedDimensions.width
      : img.nativeWidth;
  const effHeight =
    loadedDimensions && loadedDimensions.height > 0
      ? loadedDimensions.height
      : img.nativeHeight;

  const resolutionTag = resolveMediaResolutionTag({
    width: effWidth,
    height: effHeight,
    isVideo: Boolean(img.isVideo),
    hasMedia: hasRenderableImage,
  });

  const rightTagReservedPx = resolutionTag
    ? resolutionTag.length > 3
      ? 58
      : 46
    : 0;
  const leftTagMaxRightCss =
    rightTagReservedPx > 0 ? `calc(12px + ${rightTagReservedPx}px + 10px)` : '12px';

  return {
    displayName,
    leftTagText,
    showPrimaryStar: Boolean(img.isPrimary),
    resolutionTag,
    rightTagReservedPx,
    leftTagMaxRightCss,
  };
}

export interface AssetBindPickerTarget {
  category: AssetCategory;
  assetId: string;
  parentId?: string;
  displayName: string;
  alreadyBoundCardIds: string[];
}

export function isCanvasCardEligibleForAssetBind(
  card?: LiveCardSnapshot | null
): boolean {
  if (!card || card.isVideo || card.isText) return false;
  return Boolean(getCardBindPreviewUrl(card));
}

export function buildAssetBindPickerTarget(params: {
  category: AssetCategory;
  item: {
    id: string;
    name?: string;
    images?: AssetImageBinding[];
  };
  parentItem?: {
    id: string;
    name?: string;
  } | null;
}): AssetBindPickerTarget {
  const rawImages = Array.isArray(params.item?.images) ? params.item.images : [];
  const alreadyBoundCardIds = Array.from(
    new Set(
      rawImages
        .map((entry) => entry?.cardId)
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    )
  );
  const itemName = String(params.item?.name || '').trim() || '未命名资产';
  const parentName = String(params.parentItem?.name || '').trim();
  const displayName = parentName ? `${parentName} · ${itemName}` : itemName;

  return {
    category: params.category,
    assetId: params.item.id,
    ...(params.parentItem?.id ? { parentId: params.parentItem.id } : {}),
    displayName,
    alreadyBoundCardIds,
  };
}

export function toggleCanvasBindPickedCardId(
  pickedCardIds: string[],
  card?: LiveCardSnapshot | null
): string[] {
  if (!card || !card.id || !isCanvasCardEligibleForAssetBind(card)) {
    return pickedCardIds;
  }
  if (pickedCardIds.includes(card.id)) {
    return pickedCardIds.filter((id) => id !== card.id);
  }
  return [...pickedCardIds, card.id];
}

export interface FeedFocusTargetRequest {
  key: string;
  imageId?: string;
  cardId?: string;
  anchorClientY?: number;
  alignMode?: 'vertical-anchor' | 'nearest';
  nonce: number;
}

export interface VerticalAlignmentScrollParams {
  containerTop: number;
  containerHeight: number;
  targetTop: number;
  targetHeight: number;
  anchorClientY: number;
  currentScrollTop: number;
  maxScrollTop: number;
  padding?: number;
}

/**
 * Pure vertical alignment solver:
 * Places the target image card as close as possible to the clicked left row's vertical center
 * (`anchorClientY`) while guaranteeing the entire image card fits cleanly inside the visible
 * scroll container viewport without clipping top/bottom edges (or top-pinning ultra-tall cards).
 */
export function computeVerticalAlignedScrollTop({
  containerTop,
  containerHeight,
  targetTop,
  targetHeight,
  anchorClientY,
  currentScrollTop,
  maxScrollTop,
  padding = 12,
}: VerticalAlignmentScrollParams): number {
  if (
    !Number.isFinite(containerTop) ||
    !Number.isFinite(containerHeight) ||
    containerHeight <= 0 ||
    !Number.isFinite(targetTop) ||
    !Number.isFinite(targetHeight) ||
    targetHeight <= 0 ||
    !Number.isFinite(anchorClientY) ||
    !Number.isFinite(currentScrollTop)
  ) {
    return Math.max(0, Number.isFinite(currentScrollTop) ? currentScrollTop : 0);
  }

  const safeMaxScroll = Math.max(0, Number.isFinite(maxScrollTop) ? maxScrollTop : 0);
  const pad = Math.max(0, Math.min(padding, Math.floor(containerHeight / 4)));
  const availableHeight = Math.max(0, containerHeight - pad * 2);

  let desiredTop: number;
  if (targetHeight <= availableHeight) {
    const idealTop = anchorClientY - targetHeight / 2;
    const minAllowedTop = containerTop + pad;
    const maxAllowedTop = containerTop + containerHeight - pad - targetHeight;
    desiredTop = Math.min(maxAllowedTop, Math.max(minAllowedTop, idealTop));
  } else {
    // Ultra-tall image taller than the panel viewport: anchor top inside safe padding
    // so the card header tag & upper subject remain unclipped and visible.
    desiredTop = containerTop + pad;
  }

  const deltaScroll = targetTop - desiredTop;
  const rawScrollTop = currentScrollTop + deltaScroll;
  return Math.max(0, Math.min(safeMaxScroll, rawScrollTop));
}

/**
 * Resolves the exact right-panel feed section & primary image ID for a clicked left-panel
 * asset thumbnail badge, seamlessly mapping multi-version parent items down to the child
 * version section that owns the displayed thumbnail.
 */
export function resolveAssetThumbFeedFocusTarget({
  category,
  item,
  cardsById,
}: {
  category: AssetCategory;
  item: Record<string, any> | null | undefined;
  cardsById?: Map<string, LiveCardSnapshot>;
}): { key: string; imageId?: string; cardId?: string } | null {
  if (!item || !item.id) return null;

  const versions: ScriptAssetVersion[] = Array.isArray(item.versions)
    ? item.versions.filter((v): v is ScriptAssetVersion => Boolean(v && v.id))
    : [];

  if (versions.length > 1) {
    const parentPrimary = getPrimaryAssetImageEntry(item as any, cardsById);

    if (parentPrimary) {
      for (const ver of versions) {
        const verEntries = resolveAssetImageEntries(ver as any, cardsById);
        const matched = verEntries.find(
          (entry) =>
            entry.id === parentPrimary.id ||
            Boolean(parentPrimary.cardId && entry.cardId && entry.cardId === parentPrimary.cardId) ||
            Boolean(parentPrimary.imageUrl && entry.imageUrl && entry.imageUrl === parentPrimary.imageUrl)
        );
        if (matched) {
          return {
            key: `${category}:${ver.id}`,
            imageId: matched.id,
            cardId: matched.cardId,
          };
        }
      }
    }

    for (const ver of versions) {
      const verPrimary = getPrimaryAssetImageEntry(ver as any, cardsById);
      if (verPrimary) {
        return {
          key: `${category}:${ver.id}`,
          imageId: verPrimary.id,
          cardId: verPrimary.cardId,
        };
      }
    }

    return { key: `${category}:${versions[0].id}` };
  }

  const primary = getPrimaryAssetImageEntry(item as any, cardsById);
  return {
    key: `${category}:${item.id}`,
    ...(primary?.id ? { imageId: primary.id } : {}),
    ...(primary?.cardId ? { cardId: primary.cardId } : {}),
  };
}

/**
 * Strips session-ephemeral `blob:` URLs from card-backed asset bindings when the linked
 * canvas card has not yet been loaded from IndexedDB (`!linkedCard`), preventing broken
 * `<img>` flashes on initial page load while preserving self-contained `data:` and `http(s):` URLs.
 */
export function sanitizeDetachedAssetImageUrl(
  url: string | undefined,
  isDetachedCardEntry: boolean
): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (isDetachedCardEntry && trimmed.startsWith('blob:')) {
    return undefined;
  }
  return trimmed;
}

export function resolveEntryPreviewSrc(
  img: Pick<ResolvedAssetImageEntry, 'originalImageUrl' | 'imageUrl' | 'thumbnailUrl'> | null | undefined
): string | undefined {
  if (!img) return undefined;
  return img.originalImageUrl || img.imageUrl || img.thumbnailUrl || undefined;
}

export function collectInitialFeedImageUrls(params: {
  viewMode: 'sections' | 'timeline';
  sections: AssetImageFeedSection[];
  timelineCards: AssetImageFeedCard[];
  maxCount?: number;
}): string[] {
  const limit = Math.max(1, params.maxCount ?? 12);
  const seen = new Set<string>();
  const urls: string[] = [];

  if (params.viewMode === 'sections') {
    for (const section of params.sections) {
      for (const img of section.images) {
        if (img.cardState === 'generating') continue;
        const src = resolveEntryPreviewSrc(img);
        if (src && !seen.has(src)) {
          seen.add(src);
          urls.push(src);
          if (urls.length >= limit) return urls;
        }
      }
    }
  } else {
    for (const card of params.timelineCards) {
      if (card.image.cardState === 'generating') continue;
      const src = resolveEntryPreviewSrc(card.image);
      if (src && !seen.has(src)) {
        seen.add(src);
        urls.push(src);
        if (urls.length >= limit) return urls;
      }
    }
  }

  return urls;
}

export function areInitialFeedImagesSettled(
  requiredUrls: string[],
  loadStateByUrl: Record<string, 'loaded' | 'error'>
): boolean {
  if (requiredUrls.length === 0) return true;
  for (const url of requiredUrls) {
    const state = loadStateByUrl[url];
    if (state !== 'loaded' && state !== 'error') {
      return false;
    }
  }
  return true;
}

