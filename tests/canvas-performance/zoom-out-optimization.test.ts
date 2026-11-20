import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLodUnmountQuota,
  pickZoomOutUnmountBatch,
  shouldUseNanoCanvasThumbOnly,
  shouldSimplifyNanoCanvasCard,
  quantizeCardScaleTier,
  computeGridDisplaySpacing,
  computeGridPatternSpec,
  shouldDeferNanoColdFallback,
  shouldUseNanoGestureSnapshot,
  formatZoomHudState,
  formatFpsHudBadge,
  shouldPreserveCardCanvasBackingStore,
  shouldDeferOriginalTierDowngrade,
  shouldDeferOffscreenOriginalDowngrade,
  shouldSkipCardCanvasGestureRedraw,
  shouldSyncOutlineWidth,
  computeNanoCanvasRenderQuality,
  areStringArraysEqual,
  computeCardCanvasTargetDpr,
  getCardDimensions,
  type CardBounds,
} from '../../src/utils/viewportCulling';
import {
  hasCardMedia,
  shouldShowGenerationPromptPanel,
} from '../../src/utils/cardLayout';
import {
  setCameraZoomingOut,
  isCameraZoomingOut,
  setCameraTweenZooming,
  isCameraTweenZooming,
  setCanvasLoadingMode,
  canUpgradeCardDuringGesture,
  canRunHybridSurface,
  setHybridProximityProvider,
} from '../../src/utils/canvasPerformance';

function makeCard(id: string, x: number, y: number): CardBounds {
  return { id, x, y, ratio: '1:1' };
}

test('pickZoomOutUnmountBatch evicts missing and perimeter cards before center cards', () => {
  const centerCard = makeCard('center', 900, 400);
  const midCard = makeCard('mid', 1500, 400);
  const farCard = makeCard('far', 3500, 2200);
  const cardsById = new Map<string, CardBounds>([
    [centerCard.id, centerCard],
    [midCard.id, midCard],
    [farCard.id, farCard],
  ]);

  const batch = pickZoomOutUnmountBatch(
    ['center', 'mid', 'far', 'stale-missing'],
    cardsById,
    { x: 1000, y: 500 },
    2
  );

  assert.deepEqual(batch, ['stale-missing', 'far']);
});

test('pickZoomOutUnmountBatch returns all ids when quota >= remaining count and empty when quota <= 0', () => {
  const cardsById = new Map<string, CardBounds>([
    ['a', makeCard('a', 0, 0)],
    ['b', makeCard('b', 500, 500)],
  ]);

  assert.deepEqual(pickZoomOutUnmountBatch(['a', 'b'], cardsById, { x: 0, y: 0 }, 0), []);
  assert.deepEqual(pickZoomOutUnmountBatch(['a', 'b'], cardsById, { x: 0, y: 0 }, 5), ['a', 'b']);
});

test('getLodUnmountQuota budgets remaining unmounts across 200ms and flushes when elapsed >= target', () => {
  assert.equal(getLodUnmountQuota(0, 0), 0);
  const firstQuota = getLodUnmountQuota(24, 0, 200);
  assert.ok(firstQuota >= 1 && firstQuota < 24);
  assert.equal(getLodUnmountQuota(24, 200, 200), 24);
});

test('shouldUseNanoCanvasThumbOnly prefers thumbnails during gesture, zoom-out, or scale < 0.6', () => {
  assert.equal(shouldUseNanoCanvasThumbOnly(0.35, false, false), true);
  assert.equal(shouldUseNanoCanvasThumbOnly(0.8, true, false), true);
  assert.equal(shouldUseNanoCanvasThumbOnly(0.8, false, true), true);
  assert.equal(shouldUseNanoCanvasThumbOnly(0.8, false, false), false);
});

test('shouldSimplifyNanoCanvasCard activates only during active zoom-out or low-scale gesture', () => {
  assert.equal(shouldSimplifyNanoCanvasCard(0.8, true, true), true);
  assert.equal(shouldSimplifyNanoCanvasCard(0.35, true, false), true);
  assert.equal(shouldSimplifyNanoCanvasCard(0.8, true, false), false);
  assert.equal(shouldSimplifyNanoCanvasCard(0.35, false, true), false);
});

test('quantizeCardScaleTier keeps < 1.0 constant while preserving high-scale breakpoints', () => {
  assert.equal(quantizeCardScaleTier(0.15), 0.9);
  assert.equal(quantizeCardScaleTier(0.45), 0.9);
  assert.equal(quantizeCardScaleTier(0.99), 0.9);
  assert.equal(quantizeCardScaleTier(1.0), 1.25);
  assert.equal(quantizeCardScaleTier(1.6), 1.75);
  assert.equal(quantizeCardScaleTier(1.9), 1.9);
  assert.equal(quantizeCardScaleTier(2.2), 2.25);
  assert.equal(quantizeCardScaleTier(3.0), 3.0);
  assert.equal(quantizeCardScaleTier(4.2), 4.0);
});

test('computeGridDisplaySpacing scales dot spacing monotonically with canvas zoom', () => {
  assert.equal(computeGridDisplaySpacing(5.0), 240);
  assert.equal(computeGridDisplaySpacing(1.0), 48);
  assert.equal(computeGridDisplaySpacing(0.5), 24);
  assert.ok(Math.abs(computeGridDisplaySpacing(0.15) - 7.2) < 1e-6);
  assert.ok(Math.abs(computeGridDisplaySpacing(0.1) - 4.8) < 1e-6);
});

test('computeGridPatternSpec keeps rendered screen dot radius invariant at 1.76px from 10% to 500% zoom', () => {
  for (const s of [0.1, 0.25, 0.5, 1.0, 2.0, 5.0]) {
    for (const dpr of [1, 1.5]) {
      const spec = computeGridPatternSpec(s, dpr, 48);
      const renderedRadiusCss = spec.dotRadiusTile * (spec.spacing / spec.tileSize);
      assert.ok(Math.abs(renderedRadiusCss - 1.76) < 1e-6, `Expected 1.76px radius at scale=${s}, dpr=${dpr}, got ${renderedRadiusCss}`);
      assert.ok(spec.dotRadiusTile < spec.tileSize * 0.49, `Dot must stay inside tile bounds at scale=${s}`);
    }
  }
});

test('shouldDeferNanoColdFallback skips uncached raw images only during active zoom-out', () => {
  assert.equal(shouldDeferNanoColdFallback(false, true, true), true);
  assert.equal(shouldDeferNanoColdFallback(true, true, true), false);
  assert.equal(shouldDeferNanoColdFallback(false, false, true), false);
  assert.equal(shouldDeferNanoColdFallback(false, true, false), false);
});

test('shouldUseNanoGestureSnapshot remains disabled so 10% canvas dragging keeps crisp card images', () => {
  assert.equal(shouldUseNanoGestureSnapshot(0.10, 80, true, false, false, false), false);
  assert.equal(shouldUseNanoGestureSnapshot(0.25, 80, true, true, false, false), false);
  assert.equal(shouldUseNanoGestureSnapshot(0.45, 80, true, true, false, false), false);
  assert.equal(shouldUseNanoGestureSnapshot(0.25, 4, true, true, false, false), false);
  assert.equal(shouldUseNanoGestureSnapshot(0.25, 80, false, true, false, false), false);
  assert.equal(shouldUseNanoGestureSnapshot(0.25, 80, true, true, true, false), false);
  assert.equal(shouldUseNanoGestureSnapshot(0.25, 80, true, true, false, true), false);
});

test('camera zoom state setters update cleanly and remain idempotent', () => {
  setCameraZoomingOut(false);
  assert.equal(isCameraZoomingOut(), false);
  setCameraZoomingOut(true);
  setCameraZoomingOut(true);
  assert.equal(isCameraZoomingOut(), true);
  setCameraZoomingOut(false);
  assert.equal(isCameraZoomingOut(), false);

  setCameraTweenZooming(false);
  setCameraTweenZooming(true);
  assert.equal(isCameraTweenZooming(), true);
  setCameraTweenZooming(false);
  assert.equal(isCameraTweenZooming(), false);
});

test('formatZoomHudState formats range labels, percentages, and max-zoom disable cleanly', () => {
  assert.deepEqual(formatZoomHudState(0.25), {
    pct: 25,
    label: '远景',
    colorClass: 'text-blue-500 dark:text-blue-400',
    zoomInDisabled: false,
  });
  assert.deepEqual(formatZoomHudState(0.62), {
    pct: 62,
    label: '中景',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    zoomInDisabled: false,
  });
  assert.equal(formatZoomHudState(1.2).label, '近景');
  assert.equal(formatZoomHudState(2.4).label, '特写');
  assert.equal(formatZoomHudState(5.0).zoomInDisabled, true);
});

test('formatFpsHudBadge selects matching indicator colors for FPS buckets', () => {
  assert.equal(formatFpsHudBadge(60).text, '60');
  assert.ok(formatFpsHudBadge(60).dotClassName.includes('bg-emerald-500'));
  assert.ok(formatFpsHudBadge(50).dotClassName.includes('bg-teal-500'));
  assert.ok(formatFpsHudBadge(35).dotClassName.includes('bg-amber-500'));
  assert.ok(formatFpsHudBadge(20).dotClassName.includes('bg-red-500'));
});

test('shouldPreserveCardCanvasBackingStore preserves mildly larger backing stores on zoom-out', () => {
  assert.equal(shouldPreserveCardCanvasBackingStore(800, 1200, 600, 900, false, false), true);
  assert.equal(shouldPreserveCardCanvasBackingStore(500, 750, 600, 900, false, false), false);
  assert.equal(shouldPreserveCardCanvasBackingStore(2000, 3000, 600, 900, false, false), false);
  assert.equal(shouldPreserveCardCanvasBackingStore(800, 1200, 600, 900, true, false), false);
  assert.equal(shouldPreserveCardCanvasBackingStore(800, 1200, 600, 900, false, true), false);
});

test('shouldUseNanoCanvasThumbOnly upgrades during zoom-in when allowGestureUpgrade is true, but stays thumbOnly during zoom-out', () => {
  // Zoom-in gesture at scale 0.8 with allowGestureUpgrade = true -> full preview allowed (false)
  assert.equal(shouldUseNanoCanvasThumbOnly(0.8, true, false, true), false);
  // Zoom-out gesture at scale 0.8 even with allowGestureUpgrade = true -> thumbOnly (true)
  assert.equal(shouldUseNanoCanvasThumbOnly(0.8, true, true, true), true);
  // Zoom-in gesture at scale 0.35 (< 0.6) -> still thumbOnly (true)
  assert.equal(shouldUseNanoCanvasThumbOnly(0.35, true, false, true), true);
});

test('canUpgradeCardDuringGesture differentiates immediate, hybrid, and lazy during zoom-in while keeping zoom-out lazy', () => {
  const prevDoc = (globalThis as any).document;
  const prevWin = (globalThis as any).window;
  const attrs = new Map<string, string>([['data-zooming', 'true']]);
  (globalThis as any).document = {
    getElementById: (id: string) =>
      id === 'canvas-workspace'
        ? { getAttribute: (name: string) => attrs.get(name) ?? null }
        : null,
  };
  (globalThis as any).window = { dispatchEvent: () => true };

  const cleanupProximity = setHybridProximityProvider((id) => id === 'near');

  try {
    // Zoom-in (cameraZoomingOut = false, tweenZooming = false)
    setCameraZoomingOut(false);
    setCameraTweenZooming(false);

    setCanvasLoadingMode('lazy');
    assert.equal(canUpgradeCardDuringGesture('near'), false);
    assert.equal(canUpgradeCardDuringGesture('far'), false);

    setCanvasLoadingMode('immediate');
    assert.equal(canUpgradeCardDuringGesture('near'), true);
    assert.equal(canUpgradeCardDuringGesture('far'), true);

    setCanvasLoadingMode('hybrid');
    assert.equal(canUpgradeCardDuringGesture('near'), true);
    assert.equal(canUpgradeCardDuringGesture('far'), false);

    // Zoom-out (cameraZoomingOut = true) forces lazy deferral across all 3 modes
    setCameraZoomingOut(true);
    setCanvasLoadingMode('immediate');
    assert.equal(canUpgradeCardDuringGesture('near'), false);
    setCanvasLoadingMode('hybrid');
    assert.equal(canUpgradeCardDuringGesture('near'), false);
    setCanvasLoadingMode('lazy');
    assert.equal(canUpgradeCardDuringGesture('near'), false);
  } finally {
    cleanupProximity();
    setCameraZoomingOut(false);
    setCameraTweenZooming(false);
    (globalThis as any).document = prevDoc;
    (globalThis as any).window = prevWin;
  }
});

test('computeCardCanvasTargetDpr uses 1200px proxy below 200%, native original resolution for <4K originals, and 4K (4096px) for >=4K originals', () => {
  // 1. Below 200% (effectiveShowOriginal = false): 480x480 card capped to 1200px proxy (dpr = 2.5)
  const proxyDpr = computeCardCanvasTargetDpr(480, 480, 1, 2.25, false, 4096, 4096);
  assert.equal(Math.round(480 * proxyDpr), 1080);
  const maxProxyDpr = computeCardCanvasTargetDpr(480, 480, 1, 4.0, false, 4096, 4096);
  assert.equal(Math.round(480 * maxProxyDpr), 1200);

  // 2. >= 200% (effectiveShowOriginal = true) with < 4K original (2048x2048): renders exact native 2048x2048
  const native2kDpr = computeCardCanvasTargetDpr(480, 480, 1, 2.25, true, 2048, 2048);
  assert.equal(Math.round(480 * native2kDpr), 2048);

  // 3. >= 200% (effectiveShowOriginal = true) with = 4K original (3840x2160 on 640x360 card): renders exact 4K 3840x2160
  const uhd4kDpr = computeCardCanvasTargetDpr(640, 360, 1, 2.25, true, 3840, 2160);
  assert.equal(Math.round(640 * uhd4kDpr), 3840);
  assert.equal(Math.round(360 * uhd4kDpr), 2160);

  // 4. >= 200% (effectiveShowOriginal = true) with > 4K original (6000x6000 on 480x480 card): capped at 4K 4096x4096
  const capped4kDpr = computeCardCanvasTargetDpr(480, 480, 1, 2.25, true, 6000, 6000);
  assert.equal(Math.round(480 * capped4kDpr), 4096);
});

test('hasCardMedia detects completed media fields while treating blank drafts as empty', () => {
  assert.equal(hasCardMedia({}), false);
  assert.equal(hasCardMedia({ imageUrl: 'blob:http://localhost/1' }), true);
  assert.equal(hasCardMedia({ originalImageUrl: 'blob:http://localhost/2' }), true);
  assert.equal(hasCardMedia({ trueOriginalImageUrl: 'blob:http://localhost/3' }), true);
  assert.equal(hasCardMedia({ thumbnailUrl: 'data:image/jpeg;base64,abc' }), true);
  assert.equal(hasCardMedia({ isVideo: true }), true);
});

test('shouldShowGenerationPromptPanel enforces default-hidden completed cards with explicit whitelist', () => {
  // Asset cards never show prompt panel even if selected or blank
  assert.equal(
    shouldShowGenerationPromptPanel({ isAssetCard: true, isSelected: true, selectedCount: 1, hasMedia: false }),
    false
  );

  // Completed unselected generation card stays hidden
  assert.equal(
    shouldShowGenerationPromptPanel({ isAssetCard: false, isSelected: false, hasMedia: true, state: 'completed' }),
    false
  );

  // Single-selected completed card shows prompt panel
  assert.equal(
    shouldShowGenerationPromptPanel({ isAssetCard: false, isSelected: true, selectedCount: 1, hasMedia: true, state: 'completed' }),
    true
  );

  // Multi-select hides prompt panels to avoid clutter
  assert.equal(
    shouldShowGenerationPromptPanel({ isAssetCard: false, isSelected: true, selectedCount: 2, hasMedia: true, state: 'completed' }),
    false
  );

  // Blank draft, generating, error, agent target, picker target, and active edit stay visible
  assert.equal(shouldShowGenerationPromptPanel({ isAssetCard: false, hasMedia: false }), true);
  assert.equal(shouldShowGenerationPromptPanel({ isAssetCard: false, hasMedia: true, state: 'generating' }), true);
  assert.equal(shouldShowGenerationPromptPanel({ isAssetCard: false, hasMedia: true, hasError: true }), true);
  assert.equal(shouldShowGenerationPromptPanel({ isAssetCard: false, hasMedia: true, isAgentTarget: true }), true);
  assert.equal(shouldShowGenerationPromptPanel({ isAssetCard: false, hasMedia: true, isPickerTarget: true }), true);
  assert.equal(shouldShowGenerationPromptPanel({ isAssetCard: false, hasMedia: true, isEditingOrInteractive: true }), true);
});

test('getCardDimensions omits bottom panel height for completed cards while preserving panel height for blank drafts', () => {
  const blankCard: CardBounds = { id: 'blank', x: 0, y: 0, ratio: '1:1' };
  const blankDims = getCardDimensions(blankCard);
  assert.equal(blankDims.width, 480);
  assert.ok(blankDims.height > 480);

  const completedCard: CardBounds = {
    id: 'done',
    x: 0,
    y: 0,
    ratio: '16:9',
    imageUrl: 'blob:http://localhost/done',
    state: 'completed',
  };
  const completedDims = getCardDimensions(completedCard);
  assert.deepEqual(completedDims, { width: 640, height: 360 });
});

test('shouldDeferOriginalTierDowngrade preserves 4K textures during active gesture/zoom-out/tween below 200%', () => {
  assert.equal(shouldDeferOriginalTierDowngrade(2.5, true, true, true), false);
  assert.equal(shouldDeferOriginalTierDowngrade(1.5, true, false, false), true);
  assert.equal(shouldDeferOriginalTierDowngrade(1.0, false, true, false), true);
  assert.equal(shouldDeferOriginalTierDowngrade(1.0, false, false, true), true);
  assert.equal(shouldDeferOriginalTierDowngrade(1.0, false, false, false), false);
});

test('computeNanoCanvasRenderQuality lowers DPR and smoothing during gesture/zoom-out and restores at rest', () => {
  assert.deepEqual(computeNanoCanvasRenderQuality(true, false, false), {
    dprCap: 1,
    imageSmoothingQuality: 'low',
  });
  assert.deepEqual(computeNanoCanvasRenderQuality(false, true, false), {
    dprCap: 1,
    imageSmoothingQuality: 'low',
  });
  assert.deepEqual(computeNanoCanvasRenderQuality(false, false, true), {
    dprCap: 1,
    imageSmoothingQuality: 'low',
  });
  assert.deepEqual(computeNanoCanvasRenderQuality(false, false, false), {
    dprCap: 1.5,
    imageSmoothingQuality: 'high',
  });
});

test('shouldPreserveCardCanvasBackingStore keeps oversized 4K buffer intact during active camera gestures', () => {
  // Without gesture, 4K (3840x2160) shrinks to 1200x675 when effectiveShowOriginal is false (> 2.25x larger)
  assert.equal(shouldPreserveCardCanvasBackingStore(3840, 2160, 1200, 675, false, false, false), false);
  // During gesture, never wipe and shrink mid-animation
  assert.equal(shouldPreserveCardCanvasBackingStore(3840, 2160, 1200, 675, false, false, true), true);
  // Upward resize or generating still resets cleanly
  assert.equal(shouldPreserveCardCanvasBackingStore(800, 450, 1200, 675, false, false, true), false);
  assert.equal(shouldPreserveCardCanvasBackingStore(3840, 2160, 1200, 675, false, true, true), false);
});

test('computeGridPatternSpec locks tileSize to 128px during gestures while preserving 1.76px dot radius across 10%-500%', () => {
  for (const s of [0.1, 0.5, 1.0, 2.0, 5.0]) {
    const gestureSpec = computeGridPatternSpec(s, 1, 48, undefined, true);
    assert.equal(gestureSpec.tileSize, 128);
    const renderedRadiusCss = gestureSpec.dotRadiusTile * (gestureSpec.spacing / gestureSpec.tileSize);
    assert.ok(Math.abs(renderedRadiusCss - 1.76) < 1e-6);
  }
});

test('areStringArraysEqual compares selection ID arrays without false positives', () => {
  const sameRef = ['a', 'b'];
  assert.equal(areStringArraysEqual(sameRef, sameRef), true);
  assert.equal(areStringArraysEqual(['a', 'b'], ['a', 'b']), true);
  assert.equal(areStringArraysEqual(['a', 'b'], ['b', 'a']), false);
  assert.equal(areStringArraysEqual(['a'], ['a', 'b']), false);
});

test('canRunHybridSurface always permits downgrade cleanup jobs regardless of pointer proximity', () => {
  const prevWin = (globalThis as any).window;
  (globalThis as any).window = { dispatchEvent: () => true };
  try {
    setCanvasLoadingMode('hybrid');
    assert.equal(canRunHybridSurface('downgrade:card_123'), true);
  } finally {
    setCanvasLoadingMode('immediate');
    (globalThis as any).window = prevWin;
  }
});

test('shouldDeferOffscreenOriginalDowngrade defers 4K teardown during gesture, zoom-out, or tween', () => {
  assert.equal(shouldDeferOffscreenOriginalDowngrade(true, false, false), true);
  assert.equal(shouldDeferOffscreenOriginalDowngrade(false, true, false), true);
  assert.equal(shouldDeferOffscreenOriginalDowngrade(false, false, true), true);
  assert.equal(shouldDeferOffscreenOriginalDowngrade(false, false, false), false);
});

test('shouldSkipCardCanvasGestureRedraw skips redundant 4K redraws mid-gesture while allowing first paint, media swaps, and upgrades', () => {
  const base = {
    isGestureActive: true,
    hasPaintedFrame: true,
    sameCardAndImage: true,
    sameDimensions: true,
    hasBackingStore: true,
    isGenerating: false,
    hasActiveTransition: false,
    isUpgradingToOriginal: false,
  };

  assert.equal(shouldSkipCardCanvasGestureRedraw(base), true);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, isGestureActive: false }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, hasPaintedFrame: false }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, hasBackingStore: false }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, sameCardAndImage: false }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, sameDimensions: false }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, isGenerating: true }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, hasActiveTransition: true }), false);
  assert.equal(shouldSkipCardCanvasGestureRedraw({ ...base, isUpgradingToOriginal: true }), false);
});

test('shouldSyncOutlineWidth thresholds sub-pixel zoom jitter at >200% while snapping 0 transitions', () => {
  assert.equal(shouldSyncOutlineWidth(null, 0.67), true);
  assert.equal(shouldSyncOutlineWidth(2 / 3.0, 2 / 2.7), false);
  assert.equal(shouldSyncOutlineWidth(2 / 3.0, 2 / 2.0), true);
  assert.equal(shouldSyncOutlineWidth(0.05, 0), true);
  assert.equal(shouldSyncOutlineWidth(0, 0.05), true);
});




