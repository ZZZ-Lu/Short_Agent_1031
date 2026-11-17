import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampLightboxScale,
  computeCursorCenteredZoomTransform,
  computeOriginTransitionTransform,
  computePannedTransform,
  computeWheelZoomTransform,
  interpolateLightboxTransition,
} from './imageLightboxTransform';

test('computeOriginTransitionTransform maps card center and scale to fullscreen center accurately', () => {
  const origin = computeOriginTransitionTransform({
    originRect: { left: 960, top: 180, width: 432, height: 576 },
    viewportWidth: 1440,
    viewportHeight: 900,
    imageAspectRatio: 3 / 4,
  });

  // Card center is (960 + 216 = 1176, 180 + 288 = 468); viewport center is (720, 450)
  assert.equal(origin.x, 1176 - 720);
  assert.equal(origin.y, 468 - 450);
  // Fitted fullscreen height is 900 * 0.84 = 756, fitted width is 756 * 0.75 = 567
  // Scale is 432 / 567 = 0.7619...
  assert.ok(Math.abs(origin.scale - 432 / 567) < 1e-6);

  // When exact rendered image dimensions are smaller than 88vw/84vh, scale uses exact renderedWidth/renderedHeight
  const exactOrigin = computeOriginTransitionTransform({
    originRect: { left: 960, top: 180, width: 432, height: 576 },
    viewportWidth: 1440,
    viewportHeight: 900,
    renderedWidth: 540,
    renderedHeight: 720,
  });
  assert.ok(Math.abs(exactOrigin.scale - 432 / 540) < 1e-6);
});

test('computeCursorCenteredZoomTransform keeps the image point under cursor invariant across scale changes', () => {
  const viewportWidth = 1440;
  const viewportHeight = 900;
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  const initial = { x: 0, y: 0, scale: 1 };
  const cursorX = 960; // +240px right of center
  const cursorY = 300; // -150px above center

  const zoomed = computeCursorCenteredZoomTransform({
    prev: initial,
    nextScale: 2.5,
    cursorX,
    cursorY,
    viewportWidth,
    viewportHeight,
  });

  assert.equal(zoomed.scale, 2.5);
  // Local image point before zoom: (offset - prev.translation) / prev.scale
  const localXBefore = (cursorX - centerX - initial.x) / initial.scale;
  const localYBefore = (cursorY - centerY - initial.y) / initial.scale;
  // Local image point after zoom: (offset - zoomed.translation) / zoomed.scale
  const localXAfter = (cursorX - centerX - zoomed.x) / zoomed.scale;
  const localYAfter = (cursorY - centerY - zoomed.y) / zoomed.scale;

  assert.ok(Math.abs(localXBefore - localXAfter) < 1e-9);
  assert.ok(Math.abs(localYBefore - localYAfter) < 1e-9);

  // Subsequent zoom at a different cursor position after panning also preserves anchor point
  const panned = computePannedTransform(zoomed, -80, 45);
  const secondCursorX = 420;
  const secondCursorY = 660;
  const localX2Before = (secondCursorX - centerX - panned.x) / panned.scale;
  const localY2Before = (secondCursorY - centerY - panned.y) / panned.scale;

  const zoomed2 = computeCursorCenteredZoomTransform({
    prev: panned,
    nextScale: 4.2,
    cursorX: secondCursorX,
    cursorY: secondCursorY,
    viewportWidth,
    viewportHeight,
  });

  const localX2After = (secondCursorX - centerX - zoomed2.x) / zoomed2.scale;
  const localY2After = (secondCursorY - centerY - zoomed2.y) / zoomed2.scale;

  assert.ok(Math.abs(localX2Before - localX2After) < 1e-9);
  assert.ok(Math.abs(localY2Before - localY2After) < 1e-9);
});

test('computeWheelZoomTransform scales exponentially and clamps within min/max bounds', () => {
  const base = { x: 0, y: 0, scale: 1 };
  const zoomIn = computeWheelZoomTransform({
    prev: base,
    deltaY: -100,
    cursorX: 720,
    cursorY: 450,
    viewportWidth: 1440,
    viewportHeight: 900,
  });
  assert.equal(zoomIn.isDiscreteWheel, true);
  assert.ok(zoomIn.nextTarget.scale > 1.2 && zoomIn.nextTarget.scale < 1.3);

  const zoomOut = computeWheelZoomTransform({
    prev: base,
    deltaY: 100,
    cursorX: 720,
    cursorY: 450,
    viewportWidth: 1440,
    viewportHeight: 900,
  });
  assert.ok(zoomOut.nextTarget.scale < 0.85 && zoomOut.nextTarget.scale > 0.75);

  assert.equal(clampLightboxScale(0.01), 0.2);
  assert.equal(clampLightboxScale(99), 12);
});

test('interpolateLightboxTransition moves image points along a straight projective ray from high zoom', () => {
  const from = { x: -2000, y: 1200, scale: 8 };
  const to = { x: 350, y: -120, scale: 0.25 };

  const start = interpolateLightboxTransition({ from, to, progress: 0 });
  assert.deepEqual(start, from);

  const end = interpolateLightboxTransition({ from, to, progress: 1 });
  assert.deepEqual(end, to);

  // Midpoint scale is geometric mean sqrt(8 * 0.25) = sqrt(2)
  const mid = interpolateLightboxTransition({ from, to, progress: 0.5 });
  assert.ok(Math.abs(mid.scale - Math.SQRT2) < 1e-9);

  // Every image-local corner (e.g. +200, -300) moves collinearly from start to end screen position
  const localPt = { x: 200, y: -300 };
  const p0x = start.x + start.scale * localPt.x;
  const p0y = start.y + start.scale * localPt.y;
  const pMidX = mid.x + mid.scale * localPt.x;
  const pMidY = mid.y + mid.scale * localPt.y;
  const p1x = end.x + end.scale * localPt.x;
  const p1y = end.y + end.scale * localPt.y;

  const tx = (pMidX - p0x) / (p1x - p0x);
  const ty = (pMidY - p0y) / (p1y - p0y);
  assert.ok(Math.abs(tx - ty) < 1e-9);
  assert.ok(tx > 0.8 && tx < 0.9);
});

