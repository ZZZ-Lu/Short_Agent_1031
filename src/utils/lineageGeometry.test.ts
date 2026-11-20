import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLineageSegment,
  isSameLineageSegment,
  resolveLiveCardPosition,
} from './lineageGeometry';

test('resolveLiveCardPosition applies DOM and Nano drag deltas for dragged and co-selected cards', () => {
  const selected = new Set(['a', 'b']);
  const cardA = { id: 'a', x: 100, y: 200 };
  const cardB = { id: 'b', x: 600, y: 200 };
  const cardC = { id: 'c', x: 900, y: 200 };

  // Dragging selected card A moves both A and co-selected B, but not unselected C
  const domDelta = { draggingCardId: 'a', dx: 48, dy: -96 };
  assert.deepEqual(resolveLiveCardPosition(cardA, selected, domDelta, null), { x: 148, y: 104 });
  assert.deepEqual(resolveLiveCardPosition(cardB, selected, domDelta, null), { x: 648, y: 104 });
  assert.deepEqual(resolveLiveCardPosition(cardC, selected, domDelta, null), { x: 900, y: 200 });

  // Dragging unselected card C moves only C
  const unselectedDelta = { draggingCardId: 'c', dx: 20, dy: 30 };
  assert.deepEqual(resolveLiveCardPosition(cardA, selected, unselectedDelta, null), { x: 100, y: 200 });
  assert.deepEqual(resolveLiveCardPosition(cardC, selected, unselectedDelta, null), { x: 920, y: 230 });

  // Nano drag delta fallback works identically
  const nanoDelta = { cardId: 'b', dx: -10, dy: 15 };
  assert.deepEqual(resolveLiveCardPosition(cardA, selected, null, nanoDelta), { x: 90, y: 215 });
  assert.deepEqual(resolveLiveCardPosition(cardB, selected, null, nanoDelta), { x: 590, y: 215 });
});

test('computeLineageSegment computes exact border-to-border endpoints and detects changes', () => {
  const seg1 = computeLineageSegment(
    { x: 0, y: 0, width: 420, height: 560 },
    { x: 620, y: 0, width: 420, height: 560 }
  );
  assert.deepEqual(seg1, { x1: 420, y1: 280, x2: 620, y2: 280 });

  const segMoved = computeLineageSegment(
    { x: 0, y: 0, width: 420, height: 560 },
    { x: 620, y: 96, width: 420, height: 560 }
  );
  assert.equal(isSameLineageSegment(seg1, segMoved), false);
  assert.equal(isSameLineageSegment(segMoved, { ...segMoved }), true);
});
