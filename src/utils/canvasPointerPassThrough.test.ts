import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isCanvasOverlayControlTarget,
  shouldPassThroughCanvasCardMiddleButton,
  TargetClosestLike,
} from './canvasPointerPassThrough';

function mockTarget(matchedSelectors: string[], id = ''): TargetClosestLike {
  const matched = new Set(matchedSelectors);
  return {
    id,
    closest(selector: string) {
      return selector
        .split(',')
        .map(part => part.trim())
        .some(part => matched.has(part))
        ? {}
        : null;
    },
  };
}

test('passes through middle-click inside any canvas card sub-element', () => {
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(1, mockTarget(['#canvas-workspace [data-card-id]'])),
    true
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(
      1,
      mockTarget(['#canvas-workspace [data-card-id]', 'button'])
    ),
    true
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(
      1,
      mockTarget(['#canvas-workspace [data-card-id]', 'textarea'])
    ),
    true
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(
      1,
      mockTarget(['#canvas-workspace [data-card-id]', 'input'])
    ),
    true
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(
      1,
      mockTarget(['#canvas-workspace [data-card-id]', '[role="menu"]'])
    ),
    true
  );
});

test('never intercepts left or right clicks on cards', () => {
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(0, mockTarget(['#canvas-workspace [data-card-id]', 'button'])),
    false
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(2, mockTarget(['#canvas-workspace [data-card-id]'])),
    false
  );
});

test('never hijacks modal dialogs or external HUD overlays', () => {
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(
      1,
      mockTarget(['#canvas-workspace [data-card-id]', '[role="dialog"]'])
    ),
    false
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(
      1,
      mockTarget(['aside', '[data-prevent-canvas-wheel]'])
    ),
    false
  );
  assert.equal(
    shouldPassThroughCanvasCardMiddleButton(1, mockTarget(['button'])),
    false
  );
  assert.equal(shouldPassThroughCanvasCardMiddleButton(1, null), false);
});

test('isCanvasOverlayControlTarget identifies interactive overlay controls', () => {
  assert.equal(isCanvasOverlayControlTarget(mockTarget(['button'])), true);
  assert.equal(isCanvasOverlayControlTarget(mockTarget(['textarea'])), true);
  assert.equal(isCanvasOverlayControlTarget(mockTarget(['aside'])), true);
  assert.equal(isCanvasOverlayControlTarget(mockTarget(['[data-prevent-canvas-wheel]'])), true);
  assert.equal(isCanvasOverlayControlTarget(mockTarget([])), false);
});
