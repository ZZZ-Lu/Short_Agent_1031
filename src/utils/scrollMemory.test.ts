import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SCRIPT_SCROLL_POSITIONS_KEY,
  buildLegacyImagesScrollStorageKey,
  buildScrollScopeKey,
  computeImagesScrollAnchorFromLayout,
  evaluateScrollRestoreStep,
  isUserScrollKey,
  normalizeImagesScrollAnchor,
  readImagesScrollAnchorFromStorage,
  readScriptScrollAnchorFromStorage,
  readScrollOffsetFromStorage,
  resolveCodeMirrorTargetTopFromBlock,
  resolveImagesTargetTopFromAnchor,
  resolveInitialPositionReady,
  resolveProjectScopedRawValue,
  shouldPersistPanelScroll,
  writeImagesScrollAnchorToStorage,
  writeProjectScopedRawValue,
  writeScriptScrollAnchorToStorage,
  writeScrollOffsetToStorage,
} from './scrollMemory';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    dump: () => Object.fromEntries(store.entries()),
  };
}

test('buildScrollScopeKey produces distinct isolated keys per panel, project, and sub-view', () => {
  assert.equal(buildScrollScopeKey({ kind: 'script', projectId: 'p1' }), 'script:p1');
  assert.equal(buildScrollScopeKey({ kind: 'script', projectId: 'p2' }), 'script:p2');
  assert.equal(
    buildScrollScopeKey({ kind: 'sidePanel', projectId: 'p1', subKey: 'assets' }),
    'sidePanel:p1:assets'
  );
  assert.equal(
    buildScrollScopeKey({ kind: 'sidePanel', projectId: 'p1', subKey: 'universe' }),
    'sidePanel:p1:universe'
  );
  assert.equal(
    buildScrollScopeKey({ kind: 'images', projectId: 'p1', viewMode: 'sections' }),
    'images:p1:sections'
  );
  assert.equal(
    buildScrollScopeKey({ kind: 'images', projectId: 'p1', viewMode: 'timeline' }),
    'images:p1:timeline'
  );
});

test('read/write scroll offsets keep script projects isolated and support legacy image fallback', () => {
  const storage = createMemoryStorage({
    [buildLegacyImagesScrollStorageKey('p1', 'sections')]: '410',
  });

  // Legacy image key fallback works before first new write
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'images', projectId: 'p1', viewMode: 'sections' }),
    410
  );

  // Script scroll map keeps p1 and p2 completely isolated
  writeScrollOffsetToStorage(storage, { kind: 'script', projectId: 'p1' }, 825);
  writeScrollOffsetToStorage(storage, { kind: 'script', projectId: 'p2' }, 140);
  assert.equal(readScrollOffsetFromStorage(storage, { kind: 'script', projectId: 'p1' }), 825);
  assert.equal(readScrollOffsetToVerify(storage, 'p2'), 140);
  assert.equal(readScrollOffsetFromStorage(storage, { kind: 'script', projectId: 'p3' }), 0);

  // Side panel offsets isolate subKeys and projects
  writeScrollOffsetToStorage(
    storage,
    { kind: 'sidePanel', projectId: 'p1', subKey: 'assets' },
    530
  );
  writeScrollOffsetToStorage(
    storage,
    { kind: 'sidePanel', projectId: 'p1', subKey: 'universe' },
    95
  );
  writeScrollOffsetToStorage(
    storage,
    { kind: 'sidePanel', projectId: 'p2', subKey: 'assets' },
    260
  );
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'sidePanel', projectId: 'p1', subKey: 'assets' }),
    530
  );
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'sidePanel', projectId: 'p1', subKey: 'universe' }),
    95
  );
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'sidePanel', projectId: 'p2', subKey: 'assets' }),
    260
  );

  // Images offsets isolate viewModes and projects
  writeScrollOffsetToStorage(
    storage,
    { kind: 'images', projectId: 'p1', viewMode: 'sections' },
    640
  );
  writeScrollOffsetToStorage(
    storage,
    { kind: 'images', projectId: 'p1', viewMode: 'timeline' },
    310
  );
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'images', projectId: 'p1', viewMode: 'sections' }),
    640
  );
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'images', projectId: 'p1', viewMode: 'timeline' }),
    310
  );

  // Negative / invalid inputs normalize cleanly to 0
  storage.setItem(SCRIPT_SCROLL_POSITIONS_KEY, JSON.stringify({ p1: -20, p2: 'NaN' }));
  assert.equal(readScrollOffsetFromStorage(storage, { kind: 'script', projectId: 'p1' }), 0);
  assert.equal(readScrollOffsetFromStorage(storage, { kind: 'script', projectId: 'p2' }), 0);
});

function readScrollOffsetToVerify(storage: ReturnType<typeof createMemoryStorage>, pid: string) {
  return readScrollOffsetFromStorage(storage, { kind: 'script', projectId: pid });
}

test('project-scoped raw storage helpers never cross-clobber between projects', () => {
  const storage = createMemoryStorage({
    script_bible_script_expanded_p1: 'false',
    script_bible_script_expanded_p2: 'true',
    script_bible_script_expanded: 'false',
  });

  assert.equal(
    resolveProjectScopedRawValue({
      storage,
      projectId: 'p1',
      projectKeyPrefix: 'script_bible_script_expanded_',
      fallbackGlobalKey: 'script_bible_script_expanded',
    }),
    'false'
  );
  assert.equal(
    resolveProjectScopedRawValue({
      storage,
      projectId: 'p2',
      projectKeyPrefix: 'script_bible_script_expanded_',
      fallbackGlobalKey: 'script_bible_script_expanded',
    }),
    'true'
  );

  writeProjectScopedRawValue({
    storage,
    projectId: 'p2',
    projectKeyPrefix: 'script_bible_script_expanded_',
    value: 'false',
    globalKey: 'script_bible_script_expanded',
  });
  assert.equal(storage.getItem('script_bible_script_expanded_p2'), 'false');
  assert.equal(storage.getItem('script_bible_script_expanded_p1'), 'false');

  // New/unvisited project with projectId must NOT inherit another project's or legacy global state
  assert.equal(
    resolveProjectScopedRawValue({
      storage,
      projectId: 'p3',
      projectKeyPrefix: 'script_bible_script_expanded_',
      fallbackGlobalKey: 'script_bible_script_expanded',
    }),
    null
  );

  // Undefined projectId uses globalKey fallback cleanly
  assert.equal(
    resolveProjectScopedRawValue({
      storage,
      projectId: undefined,
      projectKeyPrefix: 'script_bible_script_expanded_',
      fallbackGlobalKey: 'script_bible_script_expanded',
    }),
    'false'
  );
});

test('shouldPersistPanelScroll blocks writes during transitions, restores, filters, and clamping', () => {
  const base = {
    isActiveAndVisible: true,
    isTransitioning: false,
    isRestoring: false,
    isFilteredView: false,
    hasPendingRestore: false,
    pendingTargetTop: null as number | null,
    currentScrollTop: 500,
    maxScrollTop: 1400,
  };

  assert.equal(shouldPersistPanelScroll(base), true);
  assert.equal(shouldPersistPanelScroll({ ...base, isActiveAndVisible: false }), false);
  assert.equal(shouldPersistPanelScroll({ ...base, isTransitioning: true }), false);
  assert.equal(shouldPersistPanelScroll({ ...base, isRestoring: true }), false);
  assert.equal(shouldPersistPanelScroll({ ...base, isFilteredView: true }), false);

  // Pending restore target 800 clamped at 200 while IndexedDB/images haven't expanded maxScrollTop yet
  assert.equal(
    shouldPersistPanelScroll({
      ...base,
      hasPendingRestore: true,
      pendingTargetTop: 800,
      currentScrollTop: 200,
      maxScrollTop: 200,
    }),
    false
  );

  // Once maxScrollTop expands past pendingTargetTop, persistence is allowed
  assert.equal(
    shouldPersistPanelScroll({
      ...base,
      hasPendingRestore: true,
      pendingTargetTop: 800,
      currentScrollTop: 800,
      maxScrollTop: 1500,
    }),
    true
  );
});

test('evaluateScrollRestoreStep waits through width transitions, async height growth, and 3 stable passes', () => {
  // Zero target finishes immediately
  assert.deepEqual(
    evaluateScrollRestoreStep({
      targetTop: 0,
      currentScrollTop: 0,
      maxScrollTop: 1000,
      elapsedMs: 0,
      maxWaitMs: 2600,
      stablePasses: 0,
      isTransitioning: false,
    }),
    { action: 'done', reason: 'zero_target' }
  );

  // During 260ms expand/wide shell transition, keep applying & reset stability counter
  assert.deepEqual(
    evaluateScrollRestoreStep({
      targetTop: 720,
      currentScrollTop: 720,
      maxScrollTop: 1400,
      elapsedMs: 120,
      maxWaitMs: 2600,
      stablePasses: 2,
      isTransitioning: true,
    }),
    {
      action: 'apply_and_wait',
      nextScrollTop: 720,
      nextStablePasses: 0,
      reason: 'transitioning',
    }
  );

  // Waiting for IndexedDB cards or lazy image decode to grow maxScrollTop past targetTop
  assert.deepEqual(
    evaluateScrollRestoreStep({
      targetTop: 720,
      currentScrollTop: 250,
      maxScrollTop: 250,
      elapsedMs: 350,
      maxWaitMs: 2600,
      stablePasses: 0,
      isTransitioning: false,
    }),
    {
      action: 'apply_and_wait',
      nextScrollTop: 720,
      nextStablePasses: 0,
      reason: 'waiting_for_height',
    }
  );

  // Height grew to >= 720, but currentScrollTop hasn't aligned yet
  assert.deepEqual(
    evaluateScrollRestoreStep({
      targetTop: 720,
      currentScrollTop: 250,
      maxScrollTop: 1500,
      elapsedMs: 400,
      maxWaitMs: 2600,
      stablePasses: 0,
      isTransitioning: false,
    }),
    {
      action: 'apply_and_wait',
      nextScrollTop: 720,
      nextStablePasses: 0,
      reason: 'stabilizing',
    }
  );

  // Aligned pass 1 -> wait; pass 2 -> wait; pass 3 -> done!
  const step1 = evaluateScrollRestoreStep({
    targetTop: 720,
    currentScrollTop: 720,
    maxScrollTop: 1500,
    elapsedMs: 420,
    maxWaitMs: 2600,
    stablePasses: 0,
    isTransitioning: false,
  });
  assert.deepEqual(step1, {
    action: 'apply_and_wait',
    nextScrollTop: 720,
    nextStablePasses: 1,
    reason: 'stabilizing',
  });

  const step2 = evaluateScrollRestoreStep({
    targetTop: 720,
    currentScrollTop: 720,
    maxScrollTop: 1500,
    elapsedMs: 436,
    maxWaitMs: 2600,
    stablePasses: 1,
    isTransitioning: false,
  });
  assert.deepEqual(step2, {
    action: 'apply_and_wait',
    nextScrollTop: 720,
    nextStablePasses: 2,
    reason: 'stabilizing',
  });

  const step3 = evaluateScrollRestoreStep({
    targetTop: 720,
    currentScrollTop: 720,
    maxScrollTop: 1500,
    elapsedMs: 452,
    maxWaitMs: 2600,
    stablePasses: 2,
    isTransitioning: false,
  });
  assert.deepEqual(step3, { action: 'done', reason: 'reached_and_stable' });

  // Timeout gracefully settles if content was shortened permanently
  assert.deepEqual(
    evaluateScrollRestoreStep({
      targetTop: 2000,
      currentScrollTop: 500,
      maxScrollTop: 500,
      elapsedMs: 2600,
      maxWaitMs: 2600,
      stablePasses: 0,
      isTransitioning: false,
    }),
    { action: 'done', reason: 'timeout' }
  );
});

test('isUserScrollKey identifies keyboard scroll triggers only', () => {
  assert.equal(isUserScrollKey('ArrowDown'), true);
  assert.equal(isUserScrollKey('PageDown'), true);
  assert.equal(isUserScrollKey(' '), true);
  assert.equal(isUserScrollKey('Escape'), false);
  assert.equal(isUserScrollKey('a'), false);
});

test('ScriptScrollAnchor storage keeps backward compatibility and per-project isolation', () => {
  const storage = createMemoryStorage({
    [SCRIPT_SCROLL_POSITIONS_KEY]: JSON.stringify({ legacyProj: 1600 }),
  });

  // Legacy numeric entry reads cleanly as top with undefined anchorPos
  assert.deepEqual(readScriptScrollAnchorFromStorage(storage, 'legacyProj'), { top: 1600 });

  // Anchor object persists rich metadata while remaining readable by readScrollOffsetFromStorage
  writeScriptScrollAnchorToStorage(storage, 'p1', {
    top: 2600,
    anchorPos: 3980,
    offsetFromBlockTop: 60,
    lineHeight: 160,
  });
  assert.deepEqual(readScriptScrollAnchorFromStorage(storage, 'p1'), {
    top: 2600,
    anchorPos: 3980,
    offsetFromBlockTop: 60,
    lineHeight: 160,
  });
  assert.equal(readScrollOffsetFromStorage(storage, { kind: 'script', projectId: 'p1' }), 2600);
  assert.equal(readScrollOffsetFromStorage(storage, { kind: 'script', projectId: 'legacyProj' }), 1600);

  // Zeroing resets cleanly
  writeScriptScrollAnchorToStorage(storage, 'p1', {
    top: 0,
    anchorPos: 0,
    offsetFromBlockTop: 0,
    lineHeight: 24,
  });
  assert.deepEqual(readScriptScrollAnchorFromStorage(storage, 'p1'), { top: 0 });
});

test('resolveCodeMirrorTargetTopFromBlock preserves exact paragraph offset across estimated vs measured heights', () => {
  // Same width: unmeasured above paragraphs changed block.top from 2540 -> 1520; pixel offset inside paragraph stays exact!
  assert.equal(
    resolveCodeMirrorTargetTopFromBlock({
      blockTop: 1520,
      blockHeight: 160,
      offsetFromBlockTop: 60,
      savedLineHeight: 160,
      fallbackTop: 2600,
    }),
    1580
  );

  // Top padding scroll (within 16px) does not scale when width changes
  assert.equal(
    resolveCodeMirrorTargetTopFromBlock({
      blockTop: 0,
      blockHeight: 240,
      offsetFromBlockTop: 10,
      savedLineHeight: 160,
      fallbackTop: 10,
    }),
    10
  );

  // Width narrowed (lineHeight grew 160 -> 320): scales scrolled portion past top padding proportionally
  assert.equal(
    resolveCodeMirrorTargetTopFromBlock({
      blockTop: 3000,
      blockHeight: 320,
      offsetFromBlockTop: 96, // 16 + 80 (50% through 160px paragraph)
      savedLineHeight: 160,
      fallbackTop: 2600,
    }),
    3176 // 3000 + 16 + 160 (50% through 320px paragraph)
  );

  // Missing offsetFromBlockTop falls back cleanly to fallbackTop
  assert.equal(
    resolveCodeMirrorTargetTopFromBlock({
      blockTop: 1520,
      blockHeight: 160,
      fallbackTop: 2600,
    }),
    2600
  );
});

test('resolveInitialPositionReady never marks inactive scopes ready and prevents mount flash when target > 0', () => {
  // While panel entrance/expand animation is still running, never ready
  assert.equal(
    resolveInitialPositionReady({
      isActiveAndVisible: false,
      isFilteredView: false,
      hasScopeMatch: true,
      scopeReady: true,
      persistedTargetTop: 2600,
    }),
    false
  );

  // When panel just became active and persisted target > 0 (not yet settled), MUST start hidden (false)
  assert.equal(
    resolveInitialPositionReady({
      isActiveAndVisible: true,
      isFilteredView: false,
      hasScopeMatch: false,
      scopeReady: false,
      persistedTargetTop: 2600,
    }),
    false
  );
  assert.equal(
    resolveInitialPositionReady({
      isActiveAndVisible: true,
      isFilteredView: false,
      hasScopeMatch: true,
      scopeReady: false,
      persistedTargetTop: 2600,
    }),
    false
  );

  // Only becomes true once current scope has finished restoring OR persisted offset is 0
  assert.equal(
    resolveInitialPositionReady({
      isActiveAndVisible: true,
      isFilteredView: false,
      hasScopeMatch: true,
      scopeReady: true,
      persistedTargetTop: 2600,
    }),
    true
  );
  assert.equal(
    resolveInitialPositionReady({
      isActiveAndVisible: true,
      isFilteredView: false,
      hasScopeMatch: true,
      scopeReady: false,
      persistedTargetTop: 0,
    }),
    true
  );

  // Filtered/preview view remains visible
  assert.equal(
    resolveInitialPositionReady({
      isActiveAndVisible: true,
      isFilteredView: true,
      hasScopeMatch: true,
      scopeReady: false,
      persistedTargetTop: 2600,
    }),
    true
  );
});

test('ImagesScrollAnchor storage supports legacy numeric values, JSON anchors, and viewMode isolation', () => {
  const storage = createMemoryStorage({
    [buildLegacyImagesScrollStorageKey('p1', 'sections')]: '520',
  });

  // Legacy numeric fallback works seamlessly
  assert.deepEqual(readImagesScrollAnchorFromStorage(storage, 'p1', 'sections'), { top: 520 });
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'images', projectId: 'p1', viewMode: 'sections' }),
    520
  );

  // Rich JSON anchor persists cleanly and stays readable via readScrollOffsetFromStorage
  writeImagesScrollAnchorToStorage(storage, 'p1', 'sections', {
    top: 1000,
    anchorKey: 'tile:character:c3:img3',
    offsetRatio: 0.25,
    offsetPx: 114,
    savedItemHeight: 456,
    scrollRatio: 0.42,
  });
  assert.deepEqual(readImagesScrollAnchorFromStorage(storage, 'p1', 'sections'), {
    top: 1000,
    anchorKey: 'tile:character:c3:img3',
    offsetRatio: 0.25,
    offsetPx: 114,
    savedItemHeight: 456,
    scrollRatio: 0.42,
  });
  assert.equal(
    readScrollOffsetFromStorage(storage, { kind: 'images', projectId: 'p1', viewMode: 'sections' }),
    1000
  );

  // Timeline mode stays isolated from sections mode
  assert.deepEqual(readImagesScrollAnchorFromStorage(storage, 'p1', 'timeline'), { top: 0 });
  writeImagesScrollAnchorToStorage(storage, 'p1', 'timeline', {
    top: 640,
    anchorKey: 'tile:location:l1:img1',
    offsetRatio: 0.5,
    offsetPx: 150,
    savedItemHeight: 300,
  });
  assert.equal(
    readImagesScrollAnchorFromStorage(storage, 'p1', 'timeline').anchorKey,
    'tile:location:l1:img1'
  );
  assert.equal(
    readImagesScrollAnchorFromStorage(storage, 'p1', 'sections').anchorKey,
    'tile:character:c3:img3'
  );

  // Malformed / negative values normalize safely
  assert.deepEqual(normalizeImagesScrollAnchor({ top: -10, offsetRatio: 2, savedItemHeight: -5 }), {
    top: 0,
    offsetRatio: 1,
  });
});

test('ImagesScrollAnchor preserves exact visual item and proportional offset across default <-> wide width reflows', () => {
  // Default width (480px card -> ~456px inner width), gap 12px, top padding 12px
  // Card 1: square (456px), Card 2: portrait 3:4 (608px), Card 3: placeholder h-48 (192px), Card 4: square (456px)
  const defaultItems = [
    { key: 'tile:character:c1:i1', top: 12, height: 456 },
    { key: 'tile:character:c2:i2', top: 480, height: 608 },
    { key: 'placeholder:character:c3', top: 1100, height: 192 },
    { key: 'tile:character:c4:i4', top: 1304, height: 456 },
  ];
  const defaultMaxScroll = 1856 - 760; // 1096

  // Wide width (880px card -> ~856px inner width), gap 12px, top padding 12px
  // Card 1: square (856px), Card 2: portrait 3:4 (1141px), Card 3: placeholder h-60 (240px), Card 4: square (856px)
  const wideItems = [
    { key: 'tile:character:c1:i1', top: 12, height: 856 },
    { key: 'tile:character:c2:i2', top: 880, height: 1141 },
    { key: 'placeholder:character:c3', top: 2033, height: 240 },
    { key: 'tile:character:c4:i4', top: 2285, height: 856 },
  ];
  const wideMaxScroll = 3237 - 760; // 2477

  // Scenario 1: Mid-card scroll on Card 2 (50% through Card 2 -> scrollTop = 480 + 304 = 784)
  const anchorMidCard2 = computeImagesScrollAnchorFromLayout({
    scrollTop: 784,
    maxScrollTop: defaultMaxScroll,
    items: defaultItems,
  });
  assert.equal(anchorMidCard2.anchorKey, 'tile:character:c2:i2');
  assert.equal(anchorMidCard2.offsetPx, 304);
  assert.equal(anchorMidCard2.offsetRatio, 0.5);

  // Switch default -> wide: should land at 50% through wide Card 2 (880 + 570.5 = 1451)
  const wideTarget = resolveImagesTargetTopFromAnchor({
    anchor: anchorMidCard2,
    maxScrollTop: wideMaxScroll,
    items: wideItems,
  });
  assert.equal(wideTarget, 1451);

  // Switch wide -> default using same pristine anchor: exact 0px drift back to 784!
  const restoredDefaultTarget = resolveImagesTargetTopFromAnchor({
    anchor: anchorMidCard2,
    maxScrollTop: defaultMaxScroll,
    items: defaultItems,
  });
  assert.equal(restoredDefaultTarget, 784);

  // Scenario 2: Viewport top sits in fixed 12px gap right above Card 2 (scrollTop = 474, 6px above Card 2)
  const anchorGap = computeImagesScrollAnchorFromLayout({
    scrollTop: 474,
    maxScrollTop: defaultMaxScroll,
    items: defaultItems,
  });
  assert.equal(anchorGap.anchorKey, 'tile:character:c2:i2');
  assert.equal(anchorGap.offsetPx, -6);

  // In wide mode, fixed 6px gap above Card 2 is preserved verbatim (880 - 6 = 874)
  assert.equal(
    resolveImagesTargetTopFromAnchor({
      anchor: anchorGap,
      maxScrollTop: wideMaxScroll,
      items: wideItems,
    }),
    874
  );

  // Scenario 3: Scrolled deep in wide mode (mid Card 4) then narrowed -> clamps cleanly to defaultMaxScroll
  const anchorDeepWide = computeImagesScrollAnchorFromLayout({
    scrollTop: 2450,
    maxScrollTop: wideMaxScroll,
    items: wideItems,
  });
  assert.equal(anchorDeepWide.anchorKey, 'tile:character:c4:i4');
  assert.equal(
    resolveImagesTargetTopFromAnchor({
      anchor: anchorDeepWide,
      maxScrollTop: defaultMaxScroll,
      items: defaultItems,
    }),
    defaultMaxScroll
  );

  // Scenario 4: Anchored card removed -> falls back gracefully to overall scrollRatio
  const removedItems = wideItems.filter((item) => item.key !== 'tile:character:c2:i2');
  const fallbackTarget = resolveImagesTargetTopFromAnchor({
    anchor: anchorMidCard2,
    maxScrollTop: 1500,
    items: removedItems,
  });
  assert.equal(fallbackTarget, Math.round((784 / defaultMaxScroll) * 1500));
});

