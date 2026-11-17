import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFocusCardCameraTransform,
  computeUnobstructedViewportRegion,
} from './canvasCameraFocus';

test('computeUnobstructedViewportRegion centers in remaining space to the right of left dock cards', () => {
  // Typical screenshot setup on 1920x1080: collapsed script + expanded assets + expanded images ending at x=1040
  const region = computeUnobstructedViewportRegion({
    viewportWidth: 1920,
    viewportHeight: 1080,
    dockRects: [
      { left: 16, top: 58, right: 76, bottom: 170, width: 60, height: 112 },
      { left: 54, top: 58, right: 534, bottom: 1064, width: 480, height: 1006 },
      { left: 548, top: 58, right: 1028, bottom: 1064, width: 480, height: 1006 },
    ],
  });

  assert.equal(region.occupiedRight, 1028);
  assert.equal(region.openWidth, 1920 - 1028);
  assert.equal(region.centerX, (1028 + 1920) / 2);
  assert.equal(region.centerY, 540);
  assert.equal(region.usedFallbackCenter, false);
});

test('computeUnobstructedViewportRegion centers in full viewport when no dock cards are visible', () => {
  const region = computeUnobstructedViewportRegion({
    viewportWidth: 1440,
    viewportHeight: 900,
    dockRects: [],
  });

  assert.equal(region.occupiedRight, 0);
  assert.equal(region.openWidth, 1440);
  assert.equal(region.centerX, 720);
  assert.equal(region.centerY, 450);
  assert.equal(region.usedFallbackCenter, false);
});

test('computeUnobstructedViewportRegion ignores hidden zero-sized dock rects and falls back when panels cover almost whole width', () => {
  const ignoredHidden = computeUnobstructedViewportRegion({
    viewportWidth: 1440,
    viewportHeight: 900,
    dockRects: [
      { left: 16, top: 58, right: 900, bottom: 800, width: 0, height: 0 },
      { left: 16, top: 58, right: 496, bottom: 884, width: 480, height: 826 },
    ],
  });
  assert.equal(ignoredHidden.occupiedRight, 496);
  assert.equal(ignoredHidden.centerX, (496 + 1440) / 2);

  const narrowFallback = computeUnobstructedViewportRegion({
    viewportWidth: 1440,
    viewportHeight: 900,
    dockRects: [
      { left: 16, top: 58, right: 1360, bottom: 884, width: 1344, height: 826 },
    ],
  });
  assert.equal(narrowFallback.openWidth, 80);
  assert.equal(narrowFallback.centerX, 720);
  assert.equal(narrowFallback.usedFallbackCenter, true);
});

test('computeFocusCardCameraTransform always scales to 100% and aligns card center with unobstructed viewport center', () => {
  const result = computeFocusCardCameraTransform({
    cardX: 2000,
    cardY: -300,
    cardW: 320,
    cardH: 426,
    viewportWidth: 1600,
    viewportHeight: 900,
    dockRects: [
      { left: 16, top: 58, right: 496, bottom: 884, width: 480, height: 826 },
      { left: 510, top: 58, right: 990, bottom: 884, width: 480, height: 826 },
    ],
  });

  // Unobstructed area is x in [990, 1600] -> centerX = 1295, centerY = 450
  // Card world center = (2160, -87)
  // At scale 1.0: cardCenter * 1 + tx = centerX => tx = 1295 - 2160 = -865
  assert.equal(result.scale, 1);
  assert.equal(result.centerX, 1295);
  assert.equal(result.centerY, 450);
  assert.equal(result.x, 1295 - (2000 + 160));
  assert.equal(result.y, 450 - (-300 + 213));

  // Verify JSON serializability of transform output
  const roundTrip = JSON.parse(JSON.stringify({ x: result.x, y: result.y, scale: result.scale }));
  assert.deepEqual(roundTrip, { x: -865, y: 537, scale: 1 });
});
