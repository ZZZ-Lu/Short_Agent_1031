import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeQiqiCalloutPosition,
  createRightClickGestureController,
  type RightClickGestureTimerApi,
} from './rightClickGesture';

function createFakeTimers() {
  let now = 0;
  let nextId = 1;
  const tasks = new Map<number, { due: number; fn: () => void }>();

  const timers: RightClickGestureTimerApi = {
    setTimeout: (fn, ms) => {
      const id = nextId++;
      tasks.set(id, { due: now + ms, fn });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: (handle) => {
      tasks.delete(handle as unknown as number);
    },
  };

  const advance = (ms: number) => {
    const target = now + ms;
    while (true) {
      let earliestId: number | null = null;
      let earliestDue = Infinity;
      for (const [id, task] of tasks.entries()) {
        if (task.due <= target && task.due < earliestDue) {
          earliestDue = task.due;
          earliestId = id;
        }
      }
      if (earliestId === null) break;
      const task = tasks.get(earliestId)!;
      tasks.delete(earliestId);
      now = task.due;
      task.fn();
    }
    now = target;
  };

  return { timers, advance };
}

test('short right-click fires strictly on pointer release and never on press', () => {
  const { timers, advance } = createFakeTimers();
  const events: string[] = [];

  const ctrl = createRightClickGestureController<string>({
    chargeDelayMs: 110,
    longPressMs: 380,
    timers,
    callbacks: {
      onChargeStart: ({ x, y }) => events.push(`charge:${x},${y}`),
      onChargeCancel: () => events.push('charge_cancel'),
      onLongPress: ({ x, y }) => events.push(`long:${x},${y}`),
      onShortClick: ({ x, y, target }) => events.push(`short:${x},${y}:${target}`),
    },
  });

  ctrl.handlePointerDown({ button: 2, x: 300, y: 200, isTrusted: true, target: 'canvas' });
  assert.equal(ctrl.getPhase(), 'pressing');
  assert.deepEqual(events, []);

  advance(80);
  assert.deepEqual(events, []);

  ctrl.handlePointerUp({ button: 2, x: 302, y: 201, isTrusted: true, target: 'canvas' });
  assert.equal(ctrl.getPhase(), 'idle');
  assert.deepEqual(events, ['short:302,201:canvas']);

  // Advancing further must not fire any stale timers
  advance(500);
  assert.deepEqual(events, ['short:302,201:canvas']);
});

test('releasing during charging phase cancels callout charge and still triggers short-click on release', () => {
  const { timers, advance } = createFakeTimers();
  const events: string[] = [];

  const ctrl = createRightClickGestureController<string>({
    chargeDelayMs: 110,
    longPressMs: 380,
    timers,
    callbacks: {
      onChargeStart: () => events.push('charge'),
      onChargeCancel: () => events.push('charge_cancel'),
      onLongPress: () => events.push('long'),
      onShortClick: () => events.push('short'),
    },
  });

  ctrl.handlePointerDown({ button: 2, x: 400, y: 260, isTrusted: true, target: 'asset' });
  advance(150);
  assert.equal(ctrl.getPhase(), 'charging');
  assert.deepEqual(events, ['charge']);

  ctrl.handlePointerUp({ button: 2, x: 400, y: 260, isTrusted: true, target: 'asset' });
  assert.equal(ctrl.getPhase(), 'idle');
  assert.deepEqual(events, ['charge', 'charge_cancel', 'short']);

  advance(400);
  assert.deepEqual(events, ['charge', 'charge_cancel', 'short']);
});

test('long-press right-click triggers Agent summon at threshold and suppresses short-click on release', () => {
  const { timers, advance } = createFakeTimers();
  const events: string[] = [];

  const ctrl = createRightClickGestureController<string>({
    chargeDelayMs: 110,
    longPressMs: 380,
    timers,
    callbacks: {
      onChargeStart: ({ x, y }) => events.push(`charge:${x},${y}`),
      onChargeCancel: () => events.push('charge_cancel'),
      onLongPress: ({ x, y, target }) => events.push(`long:${x},${y}:${target}`),
      onShortClick: () => events.push('short'),
    },
  });

  ctrl.handlePointerDown({ button: 2, x: 520, y: 340, isTrusted: true, target: 'card_1' });
  advance(110);
  assert.equal(ctrl.getPhase(), 'charging');
  assert.deepEqual(events, ['charge:520,340']);

  advance(270);
  assert.equal(ctrl.getPhase(), 'long_pressed');
  assert.deepEqual(events, ['charge:520,340', 'long:520,340:card_1']);

  // Releasing after long-press MUST NOT trigger short-click or charge_cancel
  ctrl.handlePointerUp({ button: 2, x: 520, y: 340, isTrusted: true, target: 'card_1' });
  assert.equal(ctrl.getPhase(), 'idle');
  assert.deepEqual(events, ['charge:520,340', 'long:520,340:card_1']);
});

test('dragging beyond tolerance cancels both long-press and short-click', () => {
  const { timers, advance } = createFakeTimers();
  const events: string[] = [];

  const ctrl = createRightClickGestureController<string>({
    chargeDelayMs: 110,
    longPressMs: 380,
    moveTolerancePx: 8,
    timers,
    callbacks: {
      onChargeStart: () => events.push('charge'),
      onChargeCancel: () => events.push('charge_cancel'),
      onLongPress: () => events.push('long'),
      onShortClick: () => events.push('short'),
    },
  });

  ctrl.handlePointerDown({ button: 2, x: 200, y: 200, isTrusted: true, target: 'canvas' });
  advance(130);
  assert.equal(ctrl.getPhase(), 'charging');

  ctrl.handlePointerMove({ x: 215, y: 200 });
  assert.equal(ctrl.getPhase(), 'cancelled');
  assert.deepEqual(events, ['charge', 'charge_cancel']);

  advance(400);
  ctrl.handlePointerUp({ button: 2, x: 215, y: 200, isTrusted: true, target: 'canvas' });
  assert.equal(ctrl.getPhase(), 'idle');
  assert.deepEqual(events, ['charge', 'charge_cancel']);
});

test('cancel or non-right button press aborts active right-click hold cleanly', () => {
  const { timers, advance } = createFakeTimers();
  const events: string[] = [];

  const ctrl = createRightClickGestureController<string>({
    chargeDelayMs: 110,
    longPressMs: 380,
    timers,
    callbacks: {
      onChargeStart: () => events.push('charge'),
      onChargeCancel: () => events.push('charge_cancel'),
      onLongPress: () => events.push('long'),
      onShortClick: () => events.push('short'),
    },
  });

  ctrl.handlePointerDown({ button: 2, x: 100, y: 100, isTrusted: true, target: 'canvas' });
  advance(120);
  ctrl.handlePointerDown({ button: 0, x: 100, y: 100, isTrusted: true, target: 'canvas' });
  assert.equal(ctrl.getPhase(), 'cancelled');
  advance(400);
  ctrl.handlePointerUp({ button: 2, x: 100, y: 100, isTrusted: true, target: 'canvas' });
  assert.deepEqual(events, ['charge', 'charge_cancel']);
});

test('computeQiqiCalloutPosition places callout at top-right of cursor and clamps near viewport edges', () => {
  const center = computeQiqiCalloutPosition({
    x: 600,
    y: 400,
    viewportWidth: 1440,
    viewportHeight: 900,
  });
  assert.equal(center.left, 612);
  assert.equal(center.top, 356);
  assert.equal(center.flippedBelow, false);

  const nearTopRight = computeQiqiCalloutPosition({
    x: 1430,
    y: 12,
    viewportWidth: 1440,
    viewportHeight: 900,
  });
  assert.equal(nearTopRight.flippedBelow, true);
  assert.ok(nearTopRight.left <= 1440 - 104 - 10);
  assert.ok(nearTopRight.top >= 10);
});
