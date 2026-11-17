import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areInitialFeedImagesSettled,
  bindImageToAssetItem,
  buildAssetImageFeed,
  buildAssetImagePrompt,
  buildCardSnapshotMap,
  collectInitialFeedImageUrls,
  distributeMasonryColumns,
  filterAndOrderBindCandidateCards,
  getCardBindPreviewUrl,
  resolveAssetImageEntries,
  resolveFeedTileDisplayMeta,
  resolveMediaResolutionTag,
  sanitizeDetachedAssetImageUrl,
  setPrimaryAssetImageOnItem,
  stripMediaFileExtension,
  unbindImageFromAssetItem,
} from './assetImages';
import type { ScriptCharacter } from '../types/script';

test('bindImageToAssetItem binds canvas card, resolves live preview, and manages primary selection cleanly', () => {
  const cards = [
    {
      id: 'card_1',
      fileName: '焦恩初稿',
      prompt: '贫民窟木屋门口的中年男人',
      state: 'completed',
      imageUrl: 'https://example.com/jiaoen-full.png',
      thumbnailUrl: 'https://example.com/jiaoen-thumb.png',
      ratio: '3:4',
    },
    {
      id: 'card_2',
      fileName: '焦恩二版',
      prompt: '身穿旧夹克的温和养父',
      state: 'generating',
      imageUrl: null,
      ratio: '3:4',
    },
  ];
  const cardsById = buildCardSnapshotMap(cards);

  const baseChar: ScriptCharacter = {
    id: 'char_jiaoen',
    name: '焦恩',
    role: '养父',
    appearance: '粗布旧衣的中年男子',
    performanceNotes: '',
  };

  // First bind auto-sets primary and syncs referenceImage
  const firstBind = bindImageToAssetItem(
    baseChar,
    { cardId: 'card_1', source: 'canvas', createdAt: 1000 },
    cardsById
  );
  assert.equal(firstBind.updatedItem.images?.length, 1);
  assert.equal(firstBind.updatedItem.images?.[0]?.isPrimary, true);
  assert.equal(firstBind.updatedItem.referenceImage, 'https://example.com/jiaoen-full.png');

  // Second bind without setPrimary prepends candidate without overwriting primary
  const secondBind = bindImageToAssetItem(
    firstBind.updatedItem,
    { cardId: 'card_2', source: 'agent', createdAt: 2000 },
    cardsById
  );
  assert.equal(secondBind.updatedItem.images?.length, 2);
  const resolved = resolveAssetImageEntries(secondBind.updatedItem, cardsById);
  assert.equal(resolved[0].cardState, 'generating');
  assert.equal(resolved[0].isPrimary, false);
  assert.equal(resolved[1].isPrimary, true);
  assert.equal(resolved[1].thumbnailUrl, 'https://example.com/jiaoen-thumb.png');

  // Promote second image to primary
  const promoted = setPrimaryAssetImageOnItem(
    secondBind.updatedItem,
    secondBind.boundImage.id,
    cardsById
  );
  assert.equal(promoted.images?.find(i => i.id === secondBind.boundImage.id)?.isPrimary, true);
  assert.equal(promoted.images?.find(i => i.id === firstBind.boundImage.id)?.isPrimary, false);

  // Unbind promoted image falls back to remaining image as primary
  const afterUnbind = unbindImageFromAssetItem(promoted, secondBind.boundImage.id, cardsById);
  assert.equal(afterUnbind.images?.length, 1);
  assert.equal(afterUnbind.images?.[0]?.isPrimary, true);
  assert.equal(afterUnbind.referenceImage, 'https://example.com/jiaoen-full.png');

  // Unbind last clears referenceImage
  const empty = unbindImageFromAssetItem(afterUnbind, firstBind.boundImage.id, cardsById);
  assert.equal(empty.images?.length, 0);
  assert.equal(empty.referenceImage, undefined);
});

test('buildAssetImageFeed expands multi-version assets matching middle list order and sorts timeline newest first', () => {
  const feed = buildAssetImageFeed({
    characters: [
      {
        id: 'char_nat',
        name: '娜塔莉亚',
        role: '心理医生',
        appearance: '棕发',
        performanceNotes: '',
        versions: [
          {
            id: 'char_nat_v1',
            name: '常服',
            images: [
              { id: 'img_v1', imageUrl: 'https://example.com/v1.png', source: 'upload', isPrimary: true, createdAt: 100 },
            ],
          },
          {
            id: 'char_nat_v2',
            name: '职业装',
            images: [
              { id: 'img_v2', imageUrl: 'https://example.com/v2.png', source: 'agent', isPrimary: true, createdAt: 300 },
            ],
          },
        ],
      },
      {
        id: 'char_bram',
        name: '布拉姆',
        role: '教父',
        appearance: '华丽西装',
        performanceNotes: '',
      },
    ],
    locations: [
      {
        id: 'loc_1',
        name: '布莱克伍德庄园',
        type: 'EXT',
        timeOfDay: '日景',
        atmosphere: '阴郁奢华',
        visualDetails: '铁门与喷泉',
        referenceImage: 'https://example.com/manor.png',
      },
    ],
    props: [],
    assetFilter: 'all',
    cards: [],
  });

  assert.equal(feed.sections.length, 4);
  assert.deepEqual(
    feed.sections.map(s => [s.parentName || '', s.name, s.isVersion, s.images.length]),
    [
      ['娜塔莉亚', '常服', true, 1],
      ['娜塔莉亚', '职业装', true, 1],
      ['', '布拉姆', false, 0],
      ['', '布莱克伍德庄园', false, 1],
    ]
  );

  // Legacy referenceImage without images[] is automatically resolved
  assert.equal(feed.sections[3].images[0].imageUrl, 'https://example.com/manor.png');

  // Timeline sorted descending by createdAt
  assert.equal(feed.totalBoundImages, 3);
  assert.deepEqual(
    feed.timelineCards.map(c => c.image.id),
    ['img_v2', 'img_v1', 'legacy_ref_loc_1']
  );
});

test('buildAssetImagePrompt builds descriptive generation prompts per category', () => {
  const prompt = buildAssetImagePrompt({
    category: 'character',
    item: { id: 'v2', name: '职业装+黑框眼镜', appearance: '白色职业套裙，黑框眼镜' },
    parentItem: { id: 'c1', name: '娜塔莉亚', role: '心理医生' },
    artStyle: '电影写实风格',
  });
  assert.match(prompt, /娜塔莉亚（职业装\+黑框眼镜）/);
  assert.match(prompt, /心理医生/);
  assert.match(prompt, /白色职业套裙，黑框眼镜/);
  assert.match(prompt, /电影写实风格/);
});

test('resolveAssetImageEntries falls back to closeupThumbnailUrl and videoPosterUrl on live cards', () => {
  const cardsById = buildCardSnapshotMap([
    {
      id: 'card_closeup',
      state: 'completed',
      ratio: '3:4',
      imageUrl: null,
      closeupThumbnailUrl: 'https://example.com/closeup.png',
    },
    {
      id: 'card_video',
      state: 'completed',
      ratio: '16:9',
      isVideo: true,
      imageUrl: null,
      videoPosterUrl: 'https://example.com/poster.jpg',
    },
  ]);

  const resolved = resolveAssetImageEntries(
    {
      id: 'c_mary',
      images: [
        { id: 'img_1', cardId: 'card_closeup', source: 'agent', isPrimary: true, createdAt: 10 },
        { id: 'img_2', cardId: 'card_video', source: 'canvas', isPrimary: false, createdAt: 20 },
      ],
    },
    cardsById
  );

  assert.equal(resolved[0].thumbnailUrl, 'https://example.com/closeup.png');
  assert.equal(resolved[0].imageUrl, 'https://example.com/closeup.png');
  assert.equal(resolved[1].thumbnailUrl, 'https://example.com/poster.jpg');
  assert.equal(resolved[1].imageUrl, 'https://example.com/poster.jpg');
});

test('resolveAssetImageEntries resolves high-res originalImageUrl and preserves true aspect ratio metadata', () => {
  const cardsById = buildCardSnapshotMap([
    {
      id: 'card_portrait',
      state: 'completed',
      ratio: '3:4',
      nativeWidth: 1500,
      nativeHeight: 2000,
      imageUrl: 'https://example.com/proxy-1200.jpg',
      originalImageUrl: 'https://example.com/original-2000.png',
      thumbnailUrl: 'https://example.com/thumb-256.jpg',
    },
    {
      id: 'card_ratio_only',
      state: 'completed',
      ratio: '16:9',
      imageUrl: 'https://example.com/ai-16x9.png',
      thumbnailUrl: 'https://example.com/ai-thumb.jpg',
    },
    {
      id: 'card_video_live',
      state: 'completed',
      ratio: '9:16',
      isVideo: true,
      nativeWidth: 720,
      nativeHeight: 1280,
      imageUrl: 'https://example.com/clip.mp4',
      videoPosterUrl: 'https://example.com/video-poster.jpg',
      thumbnailUrl: 'https://example.com/video-thumb.jpg',
    },
  ]);

  const resolved = resolveAssetImageEntries(
    {
      id: 'char_natalie',
      images: [
        { id: 'i1', cardId: 'card_portrait', source: 'canvas', isPrimary: true, createdAt: 10 },
        { id: 'i2', cardId: 'card_ratio_only', source: 'agent', isPrimary: false, createdAt: 20 },
        { id: 'i3', cardId: 'card_video_live', source: 'canvas', isPrimary: false, createdAt: 30 },
      ],
    },
    cardsById
  );

  assert.equal(resolved[0].originalImageUrl, 'https://example.com/original-2000.png');
  assert.equal(resolved[0].imageUrl, 'https://example.com/proxy-1200.jpg');
  assert.equal(resolved[0].thumbnailUrl, 'https://example.com/thumb-256.jpg');
  assert.equal(resolved[0].nativeWidth, 1500);
  assert.equal(resolved[0].nativeHeight, 2000);
  assert.equal(resolved[0].aspectRatio, '1500 / 2000');

  assert.equal(resolved[1].originalImageUrl, 'https://example.com/ai-16x9.png');
  assert.equal(resolved[1].imageUrl, 'https://example.com/ai-16x9.png');
  assert.equal(resolved[1].aspectRatio, '16 / 9');

  // Video card must resolve still poster instead of .mp4 stream for <img> display
  assert.equal(resolved[2].originalImageUrl, 'https://example.com/video-poster.jpg');
  assert.equal(resolved[2].imageUrl, 'https://example.com/video-poster.jpg');
  assert.equal(resolved[2].aspectRatio, '720 / 1280');
});

test('filterAndOrderBindCandidateCards prioritizes image cards with crisp URLs and balances masonry columns', () => {
  const cards = [
    { id: 'draft_1', state: 'draft', ratio: '3:4', imageUrl: null, prompt: '空草稿' },
    {
      id: 'portrait_1',
      state: 'completed',
      ratio: '3:4',
      nativeWidth: 900,
      nativeHeight: 1200,
      imageUrl: 'https://example.com/portrait-1200.jpg',
      thumbnailUrl: 'https://example.com/portrait-256.jpg',
      prompt: '娜塔莉亚常服立绘',
    },
    { id: 'vid_1', isVideo: true, imageUrl: 'https://example.com/clip.mp4', prompt: '视频' },
    {
      id: 'landscape_1',
      state: 'completed',
      ratio: '16:9',
      nativeWidth: 1600,
      nativeHeight: 900,
      imageUrl: 'https://example.com/landscape-1200.jpg',
      thumbnailUrl: 'https://example.com/landscape-256.jpg',
      prompt: '娜塔莉亚幼年',
    },
    {
      id: 'landscape_2',
      state: 'completed',
      ratio: '16:9',
      imageUrl: 'https://example.com/landscape-2.jpg',
      prompt: '庄园客厅',
    },
  ];

  // Excludes video cards and moves non-empty image cards ahead of blank drafts
  const ordered = filterAndOrderBindCandidateCards(cards, '');
  assert.deepEqual(ordered.map((c) => c.id), ['portrait_1', 'landscape_1', 'landscape_2', 'draft_1']);

  // Prefers crisp imageUrl over blurry thumbnailUrl
  assert.equal(getCardBindPreviewUrl(ordered[0]), 'https://example.com/portrait-1200.jpg');
  assert.equal(getCardBindPreviewUrl(ordered[3]), undefined);

  // Masonry distributes items to shortest height column (1 portrait + 2 landscapes + 1 draft across 3 cols)
  const cols = distributeMasonryColumns(ordered, 3);
  assert.equal(cols.length, 3);
  assert.deepEqual(cols[0].map((c) => c.id), ['portrait_1']);
  assert.deepEqual(cols[1].map((c) => c.id), ['landscape_1', 'draft_1']);
  assert.deepEqual(cols[2].map((c) => c.id), ['landscape_2']);
});

test('resolveMediaResolutionTag and resolveFeedTileDisplayMeta match canvas card tag semantics', () => {
  assert.equal(resolveMediaResolutionTag({ width: 4096, height: 2304 }), '4K+');
  assert.equal(resolveMediaResolutionTag({ width: 3840, height: 2160 }), '4K');
  assert.equal(resolveMediaResolutionTag({ width: 2048, height: 1536 }), '2K');
  assert.equal(resolveMediaResolutionTag({ width: 1440, height: 2560 }), '2K');
  assert.equal(resolveMediaResolutionTag({ width: 1024, height: 1024 }), '1K');
  assert.equal(resolveMediaResolutionTag({ width: 1920, height: 1080, isVideo: true }), '1080p');
  assert.equal(resolveMediaResolutionTag({ width: 1920, height: 1080, hasMedia: false }), '');
  assert.equal(stripMediaFileExtension('娜塔莉亚_设定图.png'), '娜塔莉亚_设定图');

  // Standalone single / timeline shows asset · version name with inline primary star
  const singleMeta = resolveFeedTileDisplayMeta({
    section: { name: '8岁幼年', parentName: '娜塔莉亚' },
    img: {
      isPrimary: true,
      cardTitle: '幼年三视图.png',
      nativeWidth: 2560,
      nativeHeight: 1440,
    },
    isStandaloneSingle: true,
    showSectionTitle: false,
  });
  assert.equal(singleMeta.leftTagText, '娜塔莉亚 · 8岁幼年');
  assert.equal(singleMeta.showPrimaryStar, true);
  assert.equal(singleMeta.resolutionTag, '2K');
  assert.equal(singleMeta.rightTagReservedPx, 46);
  assert.equal(singleMeta.leftTagMaxRightCss, 'calc(12px + 46px + 10px)');

  // Multi-image group tile prioritizes custom label, then cleaned canvas cardTitle, without star on secondary
  const groupSecondary = resolveFeedTileDisplayMeta({
    section: { name: '常服', parentName: '娜塔莉亚' },
    img: {
      isPrimary: false,
      cardTitle: 'side_view_draft.webp',
    },
    isStandaloneSingle: false,
    showSectionTitle: false,
    loadedDimensions: { width: 4096, height: 4096 },
  });
  assert.equal(groupSecondary.leftTagText, 'side_view_draft');
  assert.equal(groupSecondary.showPrimaryStar, false);
  assert.equal(groupSecondary.resolutionTag, '4K+');
  assert.equal(groupSecondary.rightTagReservedPx, 46);

  const videoTile = resolveFeedTileDisplayMeta({
    section: { name: '追逐片段' },
    img: {
      isPrimary: false,
      isVideo: true,
      nativeWidth: 1920,
      nativeHeight: 1080,
    },
    isStandaloneSingle: true,
    showSectionTitle: false,
  });
  assert.equal(videoTile.resolutionTag, '1080p');
  assert.equal(videoTile.rightTagReservedPx, 58);

  // Timeline view always shows asset/version display name and clears right reservation when dimensions unavailable
  const timelineNoDim = resolveFeedTileDisplayMeta({
    section: { name: '布拉姆' },
    img: {
      isPrimary: true,
      label: '手绘草稿',
    },
    isStandaloneSingle: false,
    showSectionTitle: true,
  });
  assert.equal(timelineNoDim.leftTagText, '布拉姆');
  assert.equal(timelineNoDim.showPrimaryStar, true);
  assert.equal(timelineNoDim.resolutionTag, '');
  assert.equal(timelineNoDim.leftTagMaxRightCss, '12px');
});

import {
  buildAssetBindPickerTarget,
  computeVerticalAlignedScrollTop,
  isCanvasCardEligibleForAssetBind,
  resolveAssetThumbFeedFocusTarget,
  toggleCanvasBindPickedCardId,
} from './assetImages';

test('canvas bind picker pure helpers validate eligible image cards and toggle selection cleanly', () => {
  const imageCard = { id: 'card-1', imageUrl: 'https://example.com/a.png' };
  const videoCard = { id: 'card-v', isVideo: true, imageUrl: 'https://example.com/v.mp4' };
  const emptyCard = { id: 'card-empty' };

  assert.equal(isCanvasCardEligibleForAssetBind(imageCard), true);
  assert.equal(isCanvasCardEligibleForAssetBind(videoCard), false);
  assert.equal(isCanvasCardEligibleForAssetBind(emptyCard), false);

  let picked: string[] = [];
  picked = toggleCanvasBindPickedCardId(picked, videoCard);
  picked = toggleCanvasBindPickedCardId(picked, emptyCard);
  assert.deepEqual(picked, []);

  picked = toggleCanvasBindPickedCardId(picked, imageCard);
  assert.deepEqual(picked, ['card-1']);

  picked = toggleCanvasBindPickedCardId(picked, imageCard);
  assert.deepEqual(picked, []);

  const target = buildAssetBindPickerTarget({
    category: 'character',
    parentItem: { id: 'char-parent', name: '娜塔莉亚' },
    item: {
      id: 'ver-casual',
      name: '常服',
      images: [
        { id: 'img-1', cardId: 'card-old', source: 'canvas', createdAt: 1 },
        { id: 'img-2', cardId: 'card-old', source: 'canvas', createdAt: 2 },
      ],
    },
  });
  assert.equal(target.displayName, '娜塔莉亚 · 常服');
  assert.equal(target.parentId, 'char-parent');
  assert.deepEqual(target.alreadyBoundCardIds, ['card-old']);
});

test('computeVerticalAlignedScrollTop aligns card near anchorClientY while preserving full image visibility', () => {
  // 1. Mid-panel anchor: card center aligns cleanly to anchorClientY
  // Container [100..900] (H=800), card height=240 currently at targetTop=1200, scrollTop=400, maxScrollTop=2000
  // Anchor at 500 -> desiredTop = 500 - 120 = 380 (within [112, 648]) -> delta = 1200 - 380 = 820 -> scrollTop = 1220
  assert.equal(
    computeVerticalAlignedScrollTop({
      containerTop: 100,
      containerHeight: 800,
      targetTop: 1200,
      targetHeight: 240,
      anchorClientY: 500,
      currentScrollTop: 400,
      maxScrollTop: 2000,
      padding: 12,
    }),
    1220
  );

  // 2. Top-edge anchor (left row near top at 140): card top clamps to containerTop + padding (112) so top stays unclipped
  // desiredTop = max(112, 140 - 120 = 20) = 112 -> delta = 1200 - 112 = 1088 -> scrollTop = 1488
  assert.equal(
    computeVerticalAlignedScrollTop({
      containerTop: 100,
      containerHeight: 800,
      targetTop: 1200,
      targetHeight: 240,
      anchorClientY: 140,
      currentScrollTop: 400,
      maxScrollTop: 2000,
      padding: 12,
    }),
    1488
  );

  // 3. Bottom-edge anchor (left row near bottom at 860): card top clamps to 900 - 12 - 240 = 648 so bottom stays unclipped
  // desiredTop = min(648, 860 - 120 = 740) = 648 -> delta = 1200 - 648 = 552 -> scrollTop = 952
  assert.equal(
    computeVerticalAlignedScrollTop({
      containerTop: 100,
      containerHeight: 800,
      targetTop: 1200,
      targetHeight: 240,
      anchorClientY: 860,
      currentScrollTop: 400,
      maxScrollTop: 2000,
      padding: 12,
    }),
    952
  );

  // 4. Ultra-tall image taller than container (targetHeight=920 > 800-24): pins top to containerTop + padding (112)
  assert.equal(
    computeVerticalAlignedScrollTop({
      containerTop: 100,
      containerHeight: 800,
      targetTop: 500,
      targetHeight: 920,
      anchorClientY: 220,
      currentScrollTop: 300,
      maxScrollTop: 2000,
      padding: 12,
    }),
    688
  );

  // 5. Clamps final scrollTop within [0, maxScrollTop]
  assert.equal(
    computeVerticalAlignedScrollTop({
      containerTop: 100,
      containerHeight: 800,
      targetTop: 150,
      targetHeight: 240,
      anchorClientY: 600,
      currentScrollTop: 100,
      maxScrollTop: 1000,
      padding: 12,
    }),
    0
  );
});

test('resolveAssetThumbFeedFocusTarget maps single assets, child versions, and multi-version parent primary thumbnails', () => {
  // Single asset with multiple images resolves to primary image ID
  const singleTarget = resolveAssetThumbFeedFocusTarget({
    category: 'character',
    item: {
      id: 'char_bram',
      images: [
        { id: 'img_secondary', imageUrl: 'https://example.com/b.png', isPrimary: false, source: 'canvas', createdAt: 2 },
        { id: 'img_primary', cardId: 'card_bram', imageUrl: 'https://example.com/a.png', isPrimary: true, source: 'canvas', createdAt: 1 },
      ],
    },
  });
  assert.deepEqual(singleTarget, {
    key: 'character:char_bram',
    imageId: 'img_primary',
    cardId: 'card_bram',
  });

  // Multi-version parent row resolves down to the child version owning the parent's displayed thumbnail
  const parentTarget = resolveAssetThumbFeedFocusTarget({
    category: 'character',
    item: {
      id: 'char_nat',
      referenceImage: 'https://example.com/nat-child.png',
      versions: [
        {
          id: 'ver_casual',
          name: '常服',
          images: [{ id: 'img_casual', imageUrl: 'https://example.com/nat-casual.png', isPrimary: true, source: 'upload', createdAt: 10 }],
        },
        {
          id: 'ver_young',
          name: '8岁幼年',
          images: [{ id: 'img_young', cardId: 'card_young', imageUrl: 'https://example.com/nat-child.png', isPrimary: true, source: 'agent', createdAt: 20 }],
        },
      ],
    },
  });
  assert.deepEqual(parentTarget, {
    key: 'character:ver_young',
    imageId: 'img_young',
    cardId: 'card_young',
  });

  // Child version row directly resolves to its own version section & primary image
  const childTarget = resolveAssetThumbFeedFocusTarget({
    category: 'character',
    item: {
      id: 'ver_casual',
      name: '常服',
      images: [{ id: 'img_casual', imageUrl: 'https://example.com/nat-casual.png', isPrimary: true, source: 'upload', createdAt: 10 }],
    },
  });
  assert.deepEqual(childTarget, {
    key: 'character:ver_casual',
    imageId: 'img_casual',
  });
});

test('resolveAssetImageEntries strips stale detached blob URLs before IndexedDB cards finish loading, while preserving live card blob URLs and remote URLs', () => {
  const emptyCardsById = buildCardSnapshotMap([]);
  const itemWithDetachedBlob = {
    id: 'char_nat',
    images: [
      {
        id: 'img_detached_card',
        cardId: 'card_123',
        imageUrl: 'blob:https://app.local/stale-uuid-1',
        thumbnailUrl: 'blob:https://app.local/stale-thumb-1',
        source: 'canvas' as const,
        isPrimary: true,
        createdAt: 100,
      },
      {
        id: 'img_remote',
        cardId: 'card_456',
        imageUrl: 'https://example.com/persisted.png',
        thumbnailUrl: 'https://example.com/persisted-thumb.png',
        source: 'upload' as const,
        isPrimary: false,
        createdAt: 200,
      },
    ],
  };

  // While cards are still loading from IndexedDB (emptyCardsById), detached blob: URLs are stripped so broken alt strips never render
  const beforeLoad = resolveAssetImageEntries(itemWithDetachedBlob, emptyCardsById);
  assert.equal(beforeLoad[0].imageUrl, undefined);
  assert.equal(beforeLoad[0].thumbnailUrl, undefined);
  assert.equal(beforeLoad[1].imageUrl, 'https://example.com/persisted.png');
  assert.equal(beforeLoad[1].thumbnailUrl, 'https://example.com/persisted-thumb.png');

  // Once IndexedDB cards finish loading with fresh live blob URLs, they resolve normally
  const loadedCardsById = buildCardSnapshotMap([
    {
      id: 'card_123',
      state: 'completed',
      imageUrl: 'blob:https://app.local/fresh-live-uuid',
      thumbnailUrl: 'blob:https://app.local/fresh-live-thumb',
    },
  ]);
  const afterLoad = resolveAssetImageEntries(itemWithDetachedBlob, loadedCardsById);
  assert.equal(afterLoad[0].imageUrl, 'blob:https://app.local/fresh-live-uuid');
  assert.equal(afterLoad[0].thumbnailUrl, 'blob:https://app.local/fresh-live-thumb');
  assert.equal(sanitizeDetachedAssetImageUrl('blob:https://app.local/stale', true), undefined);
  assert.equal(sanitizeDetachedAssetImageUrl('blob:https://app.local/live', false), 'blob:https://app.local/live');
});

test('collectInitialFeedImageUrls and areInitialFeedImagesSettled gate initial feed reveal until visible images settle', () => {
  const feed = buildAssetImageFeed({
    characters: [
      {
        id: 'char_1',
        name: '养父',
        role: '配角',
        appearance: '',
        performanceNotes: '',
        images: [
          { id: 'i1', imageUrl: 'https://example.com/father-1.png', isPrimary: true, source: 'canvas', createdAt: 10 },
          { id: 'i2', imageUrl: 'https://example.com/father-2.png', isPrimary: false, source: 'canvas', createdAt: 20 },
        ],
      },
    ],
    locations: [],
    props: [],
    assetFilter: 'all',
    cards: [],
  });

  const urls = collectInitialFeedImageUrls({
    viewMode: 'sections',
    sections: feed.sections,
    timelineCards: feed.timelineCards,
  });
  assert.deepEqual(urls, ['https://example.com/father-1.png', 'https://example.com/father-2.png']);
  assert.equal(areInitialFeedImagesSettled(urls, {}), false);
  assert.equal(areInitialFeedImagesSettled(urls, { 'https://example.com/father-1.png': 'loaded' }), false);
  assert.equal(
    areInitialFeedImagesSettled(urls, {
      'https://example.com/father-1.png': 'loaded',
      'https://example.com/father-2.png': 'error',
    }),
    true
  );
});


