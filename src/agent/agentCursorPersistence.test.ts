import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAgentCursorStorageKey,
  buildDefaultAgentCursorState,
  buildPersistedAgentCursorSnapshot,
  hydrateAgentCursorRuntimeState,
  isTransientAgentSpeak,
  normalizePersistedAgentCursorState,
  readPersistedAgentCursorState,
  removePersistedAgentCursorState,
  writePersistedAgentCursorState,
} from './agentCursorPersistence';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

test('buildPersistedAgentCursorSnapshot strips transient runtime states and preserves resting state', () => {
  // Sleeping state clears HUD, target, speak, and cursorMode
  const sleeping = buildPersistedAgentCursorSnapshot({
    agentState: {
      x: 412.345,
      y: 288.678,
      coordinateSpace: 'canvas',
      visible: true,
      isSleeping: true,
      speak: '正在思考...',
      cursorMode: 'working',
    },
    quickInput: {
      isOpen: true,
      targetId: 'card_1',
      targetIds: ['card_1'],
    },
  });
  assert.deepEqual(sleeping, {
    x: 412.35,
    y: 288.68,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: true,
    quickInputOpen: false,
    targetId: null,
    targetIds: [],
    cursorMode: 'default',
  });

  // Awake inspect state over a card preserves targetIds, resting speak, and inspect cursorMode
  const inspecting = buildPersistedAgentCursorSnapshot({
    agentState: {
      x: 640,
      y: 320,
      coordinateSpace: 'canvas',
      visible: true,
      isSleeping: false,
      speak: '选了【女主定妆照】，需要我做什么？',
      cursorMode: 'inspect',
    },
    quickInput: {
      isOpen: true,
      targetId: 'card_a',
      targetIds: ['card_a', 'card_b', 'card_a'],
    },
  });
  assert.deepEqual(inspecting, {
    x: 640,
    y: 320,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: false,
    quickInputOpen: true,
    targetId: 'card_a',
    targetIds: ['card_a', 'card_b'],
    speak: '选了【女主定妆照】，需要我做什么？',
    cursorMode: 'inspect',
  });

  // Transient working/thinking phrases never leak into persisted storage
  const midTask = buildPersistedAgentCursorSnapshot({
    agentState: {
      x: 310,
      y: 190,
      coordinateSpace: 'screen',
      visible: true,
      isSleeping: false,
      speak: '正在思考...',
      cursorMode: 'working',
    },
    quickInput: {
      isOpen: true,
      targetId: 'assets.item.character.c1',
      targetIds: ['assets.item.character.c1'],
    },
  });
  assert.equal(midTask.speak, undefined);
  assert.equal(midTask.cursorMode, 'inspect');
  assert.equal(midTask.coordinateSpace, 'screen');
});

test('isTransientAgentSpeak identifies only transient execution phrases', () => {
  assert.equal(isTransientAgentSpeak('正在思考...'), true);
  assert.equal(isTransientAgentSpeak('正在操作...'), true);
  assert.equal(isTransientAgentSpeak('正在生成资产图'), true);
  assert.equal(isTransientAgentSpeak('...'), true);
  assert.equal(isTransientAgentSpeak('选了【小玛丽】，需要我做什么？'), false);
  assert.equal(isTransientAgentSpeak('需要我做什么？'), false);
  assert.equal(isTransientAgentSpeak('已完成角色资产更新'), false);
});

test('per-project read/write/remove keeps projects strictly isolated and clamps screen-space coordinates to viewport', () => {
  const storage = createMemoryStorage();

  writePersistedAgentCursorState(storage, 'proj_a', {
    x: 520,
    y: 310,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: true,
    quickInputOpen: false,
    targetId: null,
    targetIds: [],
    cursorMode: 'default',
  });

  writePersistedAgentCursorState(storage, 'proj_b', {
    x: 2200,
    y: 1300,
    coordinateSpace: 'screen',
    visible: true,
    isSleeping: false,
    quickInputOpen: true,
    targetId: 'script.text',
    targetIds: ['script.text'],
    speak: '聚焦剧本正文',
    cursorMode: 'inspect',
  });

  // Project A stays sleeping at canvas (520, 310)
  const restoredA = readPersistedAgentCursorState(storage, 'proj_a', { width: 1280, height: 720 });
  assert.deepEqual(restoredA, {
    x: 520,
    y: 310,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: true,
    quickInputOpen: false,
    targetId: null,
    targetIds: [],
    cursorMode: 'default',
  });

  // Project B's screen-space coordinates clamp safely to smaller 1280x720 viewport while preserving canvas coords untouched
  const restoredB = readPersistedAgentCursorState(storage, 'proj_b', { width: 1280, height: 720 });
  assert.deepEqual(restoredB, {
    x: 1256,
    y: 696,
    coordinateSpace: 'screen',
    visible: true,
    isSleeping: false,
    quickInputOpen: true,
    targetId: 'script.text',
    targetIds: ['script.text'],
    speak: '聚焦剧本正文',
    cursorMode: 'inspect',
  });

  // Unvisited Project C returns null (so hydration uses clean default)
  assert.equal(readPersistedAgentCursorState(storage, 'proj_c', { width: 1280, height: 720 }), null);

  // Removing Project A cleans only Project A
  removePersistedAgentCursorState(storage, 'proj_a');
  assert.equal(storage.getItem(buildAgentCursorStorageKey('proj_a')), null);
  assert.notEqual(storage.getItem(buildAgentCursorStorageKey('proj_b')), null);

  // Corrupt JSON returns null gracefully
  storage.setItem(buildAgentCursorStorageKey('proj_corrupt'), '{bad json');
  assert.equal(readPersistedAgentCursorState(storage, 'proj_corrupt'), null);
  assert.equal(normalizePersistedAgentCursorState({ x: 'NaN', y: 10 }), null);

  // Legacy default greeting copy normalizes seamlessly to the new copy
  const migratedGreeting = normalizePersistedAgentCursorState({
    x: 100,
    y: 120,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: false,
    quickInputOpen: true,
    targetId: null,
    targetIds: [],
    speak: '我能帮什么忙？',
    cursorMode: 'default',
  });
  assert.equal(migratedGreeting?.speak, '需要我做什么？');
});

test('hydrateAgentCursorRuntimeState reconstructs awake, sleeping, inspect, and default runtime states', () => {
  // Default (no persisted record)
  const defaultRuntime = hydrateAgentCursorRuntimeState(null, { width: 1440, height: 900 });
  const expectedDefault = buildDefaultAgentCursorState({ width: 1440, height: 900 });
  assert.equal(defaultRuntime.agentState.x, expectedDefault.x);
  assert.equal(defaultRuntime.agentState.y, expectedDefault.y);
  assert.equal(defaultRuntime.agentState.isSleeping, false);
  assert.equal(defaultRuntime.agentQuickInput?.isOpen, true);
  assert.equal(defaultRuntime.focusTarget, null);

  // Sleeping persisted record -> quickInput null, focusTarget null
  const sleepingRuntime = hydrateAgentCursorRuntimeState({
    x: 300,
    y: 250,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: true,
    quickInputOpen: false,
    targetId: null,
    targetIds: [],
    cursorMode: 'default',
  });
  assert.equal(sleepingRuntime.agentState.isSleeping, true);
  assert.equal(sleepingRuntime.agentQuickInput, null);
  assert.equal(sleepingRuntime.focusTarget, null);

  // Inspect persisted record with multi-target -> restores quickInput and focusTarget cleanly
  const inspectRuntime = hydrateAgentCursorRuntimeState({
    x: 780,
    y: 410,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: false,
    quickInputOpen: true,
    targetId: 'card_1',
    targetIds: ['card_1', 'card_2'],
    speak: '选了 2 张图片，需要我做什么？',
    cursorMode: 'inspect',
  });
  assert.equal(inspectRuntime.agentState.cursorMode, 'inspect');
  assert.equal(inspectRuntime.agentState.speak, '选了 2 张图片，需要我做什么？');
  assert.deepEqual(inspectRuntime.agentQuickInput, {
    isOpen: true,
    targetId: 'card_1',
    targetIds: ['card_1', 'card_2'],
    placeholder: '输入你的想法...',
  });
  assert.deepEqual(inspectRuntime.focusTarget, {
    primary: 'card_1',
    references: ['card_2'],
  });
});
