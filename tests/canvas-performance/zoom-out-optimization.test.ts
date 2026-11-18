import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLodUnmountQuota,
  pickZoomOutUnmountBatch,
  shouldUseNanoCanvasThumbOnly,
  shouldSimplifyNanoCanvasCard,
  quantizeCardScaleTier,
  computeGridDisplaySpacing,
  shouldDeferNanoColdFallback,
  shouldUseNanoGestureSnapshot,
  formatZoomHudState,
  formatFpsHudBadge,
  shouldPreserveCardCanvasBackingStore,
  type CardBounds,
} from '../../src/utils/viewportCulling';
import {
  setCameraZoomingOut,
  isCameraZoomingOut,
  setCameraTweenZooming,
  isCameraTweenZooming,
  setCanvasLoadingMode,
  canUpgradeCardDuringGesture,
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

test('computeGridDisplaySpacing keeps normal zooms exact and doubles sparse spacing when zoomed out', () => {
  assert.equal(computeGridDisplaySpacing(1.0), 48);
  assert.equal(computeGridDisplaySpacing(0.5), 24);
  assert.equal(computeGridDisplaySpacing(0.15), 48 * 0.15 * 4);
  assert.ok(computeGridDisplaySpacing(0.1) >= 16);
});

test('shouldDeferNanoColdFallback skips uncached raw images only during active zoom-out', () => {
  assert.equal(shouldDeferNanoColdFallback(false, true, true), true);
  assert.equal(shouldDeferNanoColdFallback(true, true, true), false);
  assert.equal(shouldDeferNanoColdFallback(false, false, true), false);
  assert.equal(shouldDeferNanoColdFallback(false, true, false), false);
});

test('shouldUseNanoGestureSnapshot activates during multi-card < 0.40 active gestures only', () => {
  assert.equal(shouldUseNanoGestureSnapshot(0.25, 80, true, true, false, false), true);
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

