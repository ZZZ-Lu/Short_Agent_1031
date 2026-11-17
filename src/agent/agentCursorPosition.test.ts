import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toScreenPoint,
  toCanvasPoint,
  resolveAgentCursorStoragePoint,
  isPointInAnyRect,
} from './agentCursorPosition';

test('screen-space point stays invariant when canvas camera pans or zooms', () => {
  const pt = { x: 420, y: 310, coordinateSpace: 'screen' as const };
  const s1 = toScreenPoint(pt, { tx: 0, ty: 0, scale: 1 });
  const s2 = toScreenPoint(pt, { tx: -350, ty: 180, scale: 0.65 });
  const s3 = toScreenPoint(pt, { tx: 600, ty: -240, scale: 1.8 });

  assert.deepEqual(s1, { x: 420, y: 310 });
  assert.deepEqual(s2, { x: 420, y: 310 });
  assert.deepEqual(s3, { x: 420, y: 310 });
});

test('canvas-space point transforms with camera pan and zoom', () => {
  const pt = { x: 200, y: 100, coordinateSpace: 'canvas' as const };
  assert.deepEqual(toScreenPoint(pt, { tx: 50, ty: -20, scale: 2 }), { x: 450, y: 180 });
  assert.deepEqual(toScreenPoint({ x: 200, y: 100 }, { tx: 50, ty: -20, scale: 2 }), { x: 450, y: 180 });
});

test('toCanvasPoint converts screen coordinates back to canvas world space accurately', () => {
  const pt = { x: 450, y: 180, coordinateSpace: 'screen' as const };
  assert.deepEqual(toCanvasPoint(pt, { tx: 50, ty: -20, scale: 2 }), { x: 200, y: 100 });
  assert.deepEqual(
    toCanvasPoint({ x: 200, y: 100, coordinateSpace: 'canvas' }, { tx: 50, ty: -20, scale: 2 }),
    { x: 200, y: 100 }
  );
});

test('resolveAgentCursorStoragePoint selects screen space inside dock cards and canvas space outside', () => {
  const inside = resolveAgentCursorStoragePoint(512, 340, 230, 190, true);
  assert.deepEqual(inside, { x: 512, y: 340, coordinateSpace: 'screen' });

  const outside = resolveAgentCursorStoragePoint(980, 420, 740, 280, false);
  assert.deepEqual(outside, { x: 740, y: 280, coordinateSpace: 'canvas' });
});

test('isPointInAnyRect checks dock card bounding rects and ignores zero-sized rects', () => {
  const rects = [
    { left: 16, top: 58, right: 416, bottom: 884, width: 400, height: 826 },
    { left: 428, top: 58, right: 788, bottom: 884, width: 360, height: 826 },
    { left: 800, top: 58, right: 1160, bottom: 884, width: 360, height: 826 },
    { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 },
  ];

  assert.equal(isPointInAnyRect(100, 200, rects), true); // Script card
  assert.equal(isPointInAnyRect(550, 400, rects), true); // Assets card
  assert.equal(isPointInAnyRect(900, 500, rects), true); // Images card
  assert.equal(isPointInAnyRect(1200, 500, rects), false); // Open canvas
  assert.equal(isPointInAnyRect(422, 200, rects), false); // Gap between cards
  assert.equal(isPointInAnyRect(0, 0, rects), false); // Zero-sized rect ignored
});
