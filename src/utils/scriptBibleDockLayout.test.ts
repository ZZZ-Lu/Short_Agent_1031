import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDockTransitionPhase1,
  buildDockTransitionPhase2,
  buildDockTransitionPhase3Prepare,
  buildDockTransitionPhase3Reveal,
  buildDockTransitionPlan,
  buildImagesScrollStorageKey,
  buildSidePanelScrollStorageKey,
  buildWidthTransitionPlan,
  computeProgressiveBatchCount,
  computeScriptBibleDockLayout,
  computeUncoveredCanvasFocusTransform,
  createIdleWidthTransitionPanels,
  normalizeScrollOffset,
  PANEL_OPEN_SETTLE_DELAY_MS,
  parseScriptScrollPositionsMap,
  resolveDockOccupiedRightEdge,
  shouldForceExpandScriptOnRequestedViewChange,
  shouldMountScriptBiblePanelBody,
  shouldPersistImagesFeedScroll,
  shouldReapplyPendingImageScroll,
} from './scriptBibleDockLayout';

test('computeScriptBibleDockLayout arranges all 3 expanded columns with identical width and no overlap at 1440px and 1600px', () => {
  for (const viewportWidth of [1440, 1600]) {
    const layout = computeScriptBibleDockLayout({
      isScriptExpanded: true,
      isAssetsExpanded: true,
      isImagesExpanded: true,
      viewportWidth,
      viewportHeight: 900,
    });

    assert.equal(layout.script.left, 16);
    assert.equal(layout.script.width, layout.assets.width);
    assert.equal(layout.assets.width, layout.images.width);
    assert.equal(layout.script.height, 826);
    assert.equal(layout.assets.height, 826);
    assert.equal(layout.images.height, 826);
    assert.ok(layout.assets.left >= layout.script.left + layout.script.width + 10);
    assert.ok(layout.images.left >= layout.assets.left + layout.assets.width + 10);
    assert.ok(layout.images.left + layout.images.width <= viewportWidth - 16);
  }
});

test('computeScriptBibleDockLayout stacks collapsed mini-cards with partial overlap and tucks behind adjacent expanded cards', () => {
  // Script collapsed behind Assets + Images expanded
  const scriptCollapsed = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    viewportWidth: 1440,
  });
  assert.equal(scriptCollapsed.script.width, 60);
  assert.equal(scriptCollapsed.script.height, 112);
  assert.equal(scriptCollapsed.script.left, 16);
  assert.equal(scriptCollapsed.script.miniAlign, 'left');
  // Assets overlaps right 22px of Script and sits on top (zIndex 50 > 42)
  assert.equal(scriptCollapsed.assets.left, 16 + 38);
  assert.ok(scriptCollapsed.assets.zIndex > scriptCollapsed.script.zIndex);
  assert.ok(scriptCollapsed.images.left > scriptCollapsed.assets.left + scriptCollapsed.assets.width);

  // All 3 collapsed cascade left-to-right with 22px overlap and descending zIndex
  const allCollapsed = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: false,
    viewportWidth: 1440,
  });
  assert.equal(allCollapsed.script.left, 16);
  assert.equal(allCollapsed.assets.left, 16 + 38);
  assert.equal(allCollapsed.images.left, 16 + 38 + 38);
  assert.ok(allCollapsed.script.zIndex > allCollapsed.assets.zIndex);
  assert.ok(allCollapsed.assets.zIndex > allCollapsed.images.zIndex);

  // Expanded Script + Assets with Images tucked behind Assets' right edge
  const imagesCollapsed = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: false,
    viewportWidth: 1440,
  });
  assert.ok(imagesCollapsed.images.left < imagesCollapsed.assets.left + imagesCollapsed.assets.width);
  assert.ok(imagesCollapsed.images.left + imagesCollapsed.images.width > imagesCollapsed.assets.left + imagesCollapsed.assets.width);
  assert.ok(imagesCollapsed.assets.zIndex > imagesCollapsed.images.zIndex);
  assert.equal(imagesCollapsed.images.miniAlign, 'right');
});

test('computeScriptBibleDockLayout slides mini-card outward and elevates zIndex on hover', () => {
  const idle = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: false,
    viewportWidth: 1440,
    hoveredMiniPanel: null,
  });
  const hovered = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: false,
    viewportWidth: 1440,
    hoveredMiniPanel: 'images',
  });
  assert.ok(hovered.images.left > idle.images.left);
  assert.ok(hovered.images.zIndex > idle.images.zIndex);
});

test('computeScriptBibleDockLayout widens images panel when isImagesWide is true without overlapping or overflowing', () => {
  const defaultSolo = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    isImagesWide: false,
    viewportWidth: 1440,
  });
  const wideSolo = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    isImagesWide: true,
    viewportWidth: 1440,
  });
  assert.equal(defaultSolo.images.width, 480);
  assert.equal(wideSolo.images.width, 880);
  assert.ok(wideSolo.images.left + wideSolo.images.width <= 1440 - 16);

  const wideAllOpen = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    isImagesWide: true,
    viewportWidth: 1440,
  });
  assert.ok(wideAllOpen.images.width > wideAllOpen.script.width);
  assert.ok(wideAllOpen.assets.left >= wideAllOpen.script.left + wideAllOpen.script.width + 10);
  assert.ok(wideAllOpen.images.left >= wideAllOpen.assets.left + wideAllOpen.assets.width + 10);
  assert.ok(wideAllOpen.images.left + wideAllOpen.images.width <= 1440 - 16);
});

test('buildWidthTransitionPlan freezes only width-changing expanded panels and orders staggered reveal', () => {
  // Only images expanded at 1440px -> collapsed siblings remain unaffected
  const soloPrev = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    isImagesWide: false,
    viewportWidth: 1440,
  });
  const soloNext = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    isImagesWide: true,
    viewportWidth: 1440,
  });
  const soloPlan = buildWidthTransitionPlan({ prevLayout: soloPrev, nextLayout: soloNext });
  assert.equal(soloPlan.hasAnyAffected, true);
  assert.deepEqual(soloPlan.affectedPanels, { script: false, assets: false, images: true });
  assert.deepEqual(soloPlan.frozenWidths, { script: null, assets: null, images: 480 });
  assert.deepEqual(soloPlan.revealOrder, ['images']);

  // All 3 expanded at 1440px -> all 3 change width, ordered images -> assets -> script
  const allPrev = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    isImagesWide: false,
    viewportWidth: 1440,
  });
  const allNext = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    isImagesWide: true,
    viewportWidth: 1440,
  });
  const allPlan = buildWidthTransitionPlan({ prevLayout: allPrev, nextLayout: allNext });
  assert.equal(allPlan.hasAnyAffected, true);
  assert.deepEqual(allPlan.affectedPanels, { script: true, assets: true, images: true });
  assert.equal(allPlan.frozenWidths.script, allPrev.script.width);
  assert.equal(allPlan.frozenWidths.assets, allPrev.assets.width);
  assert.equal(allPlan.frozenWidths.images, allPrev.images.width);
  assert.deepEqual(allPlan.revealOrder, ['images', 'assets', 'script']);

  // Ultra-wide viewport (2000px) -> siblings keep 480px width, only images panel freezes & reveals
  const ultraPrev = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    isImagesWide: false,
    viewportWidth: 2000,
  });
  const ultraNext = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    isImagesWide: true,
    viewportWidth: 2000,
  });
  const ultraPlan = buildWidthTransitionPlan({ prevLayout: ultraPrev, nextLayout: ultraNext });
  assert.deepEqual(ultraPlan.affectedPanels, { script: false, assets: false, images: true });
  assert.deepEqual(ultraPlan.revealOrder, ['images']);

  // Idle helper returns serializable default visibility
  const idle = createIdleWidthTransitionPanels();
  assert.equal(JSON.parse(JSON.stringify(idle)).images.opacity, 1);
  assert.equal(idle.script.hidden, false);
  assert.equal(idle.script.mountExpandedContent, true);
});

test('buildDockTransitionPlan & phase builders choreograph expand and collapse without mounting heavy DOM during shell resize', () => {
  // Collapse Script when all 3 expanded at 1440px (assets & images widen 460 -> 480)
  const expanded3 = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    viewportWidth: 1440,
  });
  const scriptCollapsed = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    viewportWidth: 1440,
  });

  const collapsePlan = buildDockTransitionPlan({ prevLayout: expanded3, nextLayout: scriptCollapsed });
  assert.deepEqual(collapsePlan.actions, { script: 'collapse', assets: 'resize', images: 'resize' });
  assert.equal(collapsePlan.frozenWidths.script, expanded3.script.width);
  assert.equal(collapsePlan.frozenWidths.assets, expanded3.assets.width);
  assert.equal(collapsePlan.frozenWidths.images, expanded3.images.width);

  // Phase 1: collapsing script & resizing siblings fade out with frozen widths
  const cPhase1 = buildDockTransitionPhase1(collapsePlan);
  assert.equal(cPhase1.script.opacity, 0);
  assert.equal(cPhase1.script.frozenWidth, expanded3.script.width);
  assert.equal(cPhase1.script.mountExpandedContent, true);
  assert.equal(cPhase1.assets.opacity, 0);

  // Phase 2: collapsing script unmounts expanded DOM & hides mini-card; siblings hide expanded DOM while shells resize
  const cPhase2 = buildDockTransitionPhase2(cPhase1, collapsePlan);
  assert.equal(cPhase2.script.mountExpandedContent, false);
  assert.equal(cPhase2.script.miniHidden, true);
  assert.equal(cPhase2.script.miniOpacity, 0);
  assert.equal(cPhase2.assets.hidden, true);
  assert.equal(cPhase2.assets.mountExpandedContent, true);

  // Phase 3: collapsing script reveals mini-card cleanly
  const cPhase3Prep = buildDockTransitionPhase3Prepare(cPhase2, 'script', 'collapse');
  assert.equal(cPhase3Prep.script.miniHidden, false);
  assert.equal(cPhase3Prep.script.miniOpacity, 0);
  const cPhase3Rev = buildDockTransitionPhase3Reveal(cPhase3Prep, 'script', 'collapse');
  assert.equal(cPhase3Rev.script.miniOpacity, 1);

  // Expand Script back when Assets & Images are already expanded -> siblings resize 480 -> 460
  const expandPlan = buildDockTransitionPlan({ prevLayout: scriptCollapsed, nextLayout: expanded3 });
  assert.deepEqual(expandPlan.actions, { script: 'expand', assets: 'resize', images: 'resize' });

  // Phase 1: mini-card fades out, expanded siblings freeze & fade out
  const ePhase1 = buildDockTransitionPhase1(expandPlan);
  assert.equal(ePhase1.script.miniOpacity, 0);
  assert.equal(ePhase1.script.mountExpandedContent, false);
  assert.equal(ePhase1.assets.opacity, 0);
  assert.equal(ePhase1.assets.frozenWidth, 480);

  // Phase 2: expanding Script keeps heavy expanded DOM unmounted while shell grows from 60x112 -> 460x826
  const ePhase2 = buildDockTransitionPhase2(ePhase1, expandPlan);
  assert.equal(ePhase2.script.mountExpandedContent, false);
  assert.equal(ePhase2.script.hidden, true);
  assert.equal(ePhase2.assets.hidden, true);

  // Phase 3: mount expanding Script content at opacity 0 (allowing pre-paint scroll restore), then fade in
  const ePhase3Prep = buildDockTransitionPhase3Prepare(ePhase2, 'script', 'expand');
  assert.equal(ePhase3Prep.script.mountExpandedContent, true);
  assert.equal(ePhase3Prep.script.hidden, false);
  assert.equal(ePhase3Prep.script.opacity, 0);
  const ePhase3Rev = buildDockTransitionPhase3Reveal(ePhase3Prep, 'script', 'expand');
  assert.equal(ePhase3Rev.script.opacity, 1);

  // Expanding Script at 2000px ultra-wide while Images stays 480px (just shifts left) -> Images unaffected!
  const ultraCollapsed = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    viewportWidth: 2000,
  });
  const ultraExpanded = computeScriptBibleDockLayout({
    isScriptExpanded: true,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    viewportWidth: 2000,
  });
  const ultraExpandPlan = buildDockTransitionPlan({ prevLayout: ultraCollapsed, nextLayout: ultraExpanded });
  assert.deepEqual(ultraExpandPlan.actions, { script: 'expand', assets: 'none', images: 'none' });
  assert.deepEqual(ultraExpandPlan.revealOrder, ['script']);

  // Expanding Images in wide mode unmounts expanded feed during shell resize and reveals only after reaching final 880px width
  const imgCollapsed = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: false,
    isImagesWide: true,
    viewportWidth: 1440,
  });
  const imgWideExpanded = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: false,
    isImagesExpanded: true,
    isImagesWide: true,
    viewportWidth: 1440,
  });
  const imgExpandPlan = buildDockTransitionPlan({ prevLayout: imgCollapsed, nextLayout: imgWideExpanded });
  assert.deepEqual(imgExpandPlan.actions, { script: 'none', assets: 'none', images: 'expand' });
  assert.deepEqual(imgExpandPlan.revealOrder, ['images']);

  const imgP1 = buildDockTransitionPhase1(imgExpandPlan);
  assert.equal(imgP1.images.miniOpacity, 0);
  assert.equal(imgP1.images.mountExpandedContent, false);

  const imgP2 = buildDockTransitionPhase2(imgP1, imgExpandPlan);
  assert.equal(imgP2.images.mountExpandedContent, false);
  assert.equal(imgP2.images.hidden, true);
  assert.equal(imgP2.images.miniHidden, true);

  const imgP3Prep = buildDockTransitionPhase3Prepare(imgP2, 'images', 'expand');
  assert.equal(imgP3Prep.images.mountExpandedContent, true);
  assert.equal(imgP3Prep.images.hidden, false);
  assert.equal(imgP3Prep.images.opacity, 0);
  assert.equal(imgP3Prep.images.frozenWidth, null);

  const imgP3Rev = buildDockTransitionPhase3Reveal(imgP3Prep, 'images', 'expand');
  assert.equal(imgP3Rev.images.opacity, 1);

  // Collapsing wide Images freezes width first, hides mini-card during shrink, then fades mini-card in
  const imgCollapsePlan = buildDockTransitionPlan({ prevLayout: imgWideExpanded, nextLayout: imgCollapsed });
  assert.deepEqual(imgCollapsePlan.actions, { script: 'none', assets: 'none', images: 'collapse' });
  assert.equal(imgCollapsePlan.frozenWidths.images, 880);
  const imgColP1 = buildDockTransitionPhase1(imgCollapsePlan);
  assert.equal(imgColP1.images.frozenWidth, 880);
  assert.equal(imgColP1.images.opacity, 0);
  assert.equal(imgColP1.images.mountExpandedContent, true);
  const imgColP2 = buildDockTransitionPhase2(imgColP1, imgCollapsePlan);
  assert.equal(imgColP2.images.mountExpandedContent, false);
  assert.equal(imgColP2.images.miniHidden, true);
  const imgColP3Prep = buildDockTransitionPhase3Prepare(imgColP2, 'images', 'collapse');
  assert.equal(imgColP3Prep.images.miniHidden, false);
  assert.equal(imgColP3Prep.images.miniOpacity, 0);
  const imgColP3Rev = buildDockTransitionPhase3Reveal(imgColP3Prep, 'images', 'collapse');
  assert.equal(imgColP3Rev.images.miniOpacity, 1);
});

test('scroll memory helpers normalize and parse persisted scroll maps cleanly', () => {
  assert.equal(normalizeScrollOffset(420), 420);
  assert.equal(normalizeScrollOffset('185.5'), 185.5);
  assert.equal(normalizeScrollOffset(-10), 0);
  assert.equal(normalizeScrollOffset('NaN'), 0);
  assert.equal(normalizeScrollOffset(null), 0);

  assert.equal(buildImagesScrollStorageKey('proj-1', 'sections'), 'script_images_panel_scroll_proj-1_sections');
  assert.equal(buildImagesScrollStorageKey('proj-1', 'timeline'), 'script_images_panel_scroll_proj-1_timeline');
  assert.equal(buildSidePanelScrollStorageKey('proj-1', 'assets'), 'script_side_panel_scroll_proj-1_assets');

  assert.deepEqual(
    parseScriptScrollPositionsMap(JSON.stringify({ p1: 320, p2: { top: 640 }, bad: -5, str: 'abc' })),
    { p1: 320, p2: 640, bad: 0, str: 0 }
  );
  assert.deepEqual(parseScriptScrollPositionsMap('invalid-json{'), {});

  assert.equal(
    shouldPersistImagesFeedScroll({
      isRestoringScroll: false,
      isProgrammaticScroll: false,
      isTransitionHidden: false,
      shouldMountExpandedContent: true,
      onlyShowActiveAsset: false,
    }),
    true
  );
  assert.equal(
    shouldPersistImagesFeedScroll({
      isRestoringScroll: false,
      isProgrammaticScroll: true,
      isTransitionHidden: false,
      shouldMountExpandedContent: true,
      onlyShowActiveAsset: false,
    }),
    false
  );
  assert.equal(
    shouldPersistImagesFeedScroll({
      isRestoringScroll: false,
      isProgrammaticScroll: false,
      isTransitionHidden: false,
      shouldMountExpandedContent: true,
      onlyShowActiveAsset: true,
    }),
    false
  );

  assert.equal(
    shouldReapplyPendingImageScroll({
      pendingKey: 'script_images_panel_scroll_p1_sections',
      currentKey: 'script_images_panel_scroll_p1_sections',
      targetTop: 480,
      nowMs: 500,
      expiresAtMs: 1200,
      onlyShowActiveAsset: false,
    }),
    true
  );
  assert.equal(
    shouldReapplyPendingImageScroll({
      pendingKey: 'script_images_panel_scroll_p1_sections',
      currentKey: 'script_images_panel_scroll_p1_sections',
      targetTop: 480,
      nowMs: 1300,
      expiresAtMs: 1200,
      onlyShowActiveAsset: false,
    }),
    false
  );
  assert.equal(
    shouldReapplyPendingImageScroll({
      pendingKey: 'script_images_panel_scroll_p1_sections',
      currentKey: 'script_images_panel_scroll_p1_sections',
      targetTop: 480,
      nowMs: 500,
      expiresAtMs: 1200,
      onlyShowActiveAsset: true,
    }),
    false
  );

  // When a pending restore target is 600px, but async cards/images haven't expanded maxScrollTop yet (e.g. maxScrollTop = 120px),
  // a browser-clamped scrollTop of 120px must NOT overwrite the persisted 600px target.
  assert.equal(
    shouldPersistImagesFeedScroll({
      isRestoringScroll: false,
      isProgrammaticScroll: false,
      isTransitionHidden: false,
      shouldMountExpandedContent: true,
      onlyShowActiveAsset: false,
      pendingTargetTop: 600,
      currentScrollTop: 120,
      maxScrollTop: 120,
    }),
    false
  );

  // Once maxScrollTop has grown to >= 600px, normal scroll persistence is allowed.
  assert.equal(
    shouldPersistImagesFeedScroll({
      isRestoringScroll: false,
      isProgrammaticScroll: false,
      isTransitionHidden: false,
      shouldMountExpandedContent: true,
      onlyShowActiveAsset: false,
      pendingTargetTop: 600,
      currentScrollTop: 600,
      maxScrollTop: 1400,
    }),
    true
  );

  // Initial mount with requestedView='script' must NOT force-expand a user-collapsed Script panel
  assert.equal(
    shouldForceExpandScriptOnRequestedViewChange({
      prevRequestedView: 'script',
      nextRequestedView: 'script',
      isInitialMount: true,
    }),
    false
  );
  assert.equal(
    shouldForceExpandScriptOnRequestedViewChange({
      prevRequestedView: 'script',
      nextRequestedView: 'script',
      isInitialMount: false,
    }),
    false
  );
  assert.equal(
    shouldForceExpandScriptOnRequestedViewChange({
      prevRequestedView: 'assets',
      nextRequestedView: 'script',
      isInitialMount: false,
    }),
    true
  );
  assert.equal(
    shouldForceExpandScriptOnRequestedViewChange({
      prevRequestedView: 'script',
      nextRequestedView: 'directory',
      isInitialMount: true,
    }),
    true
  );
});

test('resolveDockOccupiedRightEdge returns rightmost dock edge and computeUncoveredCanvasFocusTransform centers card in uncovered canvas area at 100% scale', () => {
  // Case 1: Script collapsed, Assets + Images expanded on a 1920x1080 viewport
  const layoutCEE = computeScriptBibleDockLayout({
    isScriptExpanded: false,
    isAssetsExpanded: true,
    isImagesExpanded: true,
    viewportWidth: 1920,
    viewportHeight: 1080,
  });

  const occupiedRight = resolveDockOccupiedRightEdge(layoutCEE, true);
  assert.equal(occupiedRight, layoutCEE.images.left + layoutCEE.images.width);
  assert.ok(occupiedRight > 900 && occupiedRight < 1920);

  // Target card at (200, 300) with size 300x400
  const focusTransform = computeUncoveredCanvasFocusTransform({
    cardX: 200,
    cardY: 300,
    cardWidth: 300,
    cardHeight: 400,
    viewportWidth: 1920,
    viewportHeight: 1080,
    occupiedLeftWidth: occupiedRight,
  });

  assert.equal(focusTransform.scale, 1);
  assert.equal(focusTransform.centerScreenX, (occupiedRight + 1920) / 2);
  assert.equal(focusTransform.centerScreenY, 540);

  // Verify the card's center in screen coordinates lands exactly at (centerScreenX, centerScreenY)
  const cardCenterWorldX = 200 + 300 / 2;
  const cardCenterWorldY = 300 + 400 / 2;
  assert.equal(cardCenterWorldX * focusTransform.scale + focusTransform.x, (occupiedRight + 1920) / 2);
  assert.equal(cardCenterWorldY * focusTransform.scale + focusTransform.y, 540);

  // Case 2: Fallback to full viewport center when occupiedLeftWidth is omitted or >= viewportWidth
  const fallbackTransform = computeUncoveredCanvasFocusTransform({
    cardX: 100,
    cardY: 100,
    cardWidth: 200,
    cardHeight: 200,
    viewportWidth: 1440,
    viewportHeight: 900,
  });
  assert.equal(fallbackTransform.scale, 1);
  assert.equal(fallbackTransform.centerScreenX, 720);
  assert.equal(fallbackTransform.centerScreenY, 450);
  assert.equal(200 * fallbackTransform.scale + fallbackTransform.x, 720);
  assert.equal(200 * fallbackTransform.scale + fallbackTransform.y, 450);
});

test('shouldMountScriptBiblePanelBody defers heavy body DOM until card open animation settles and loading completes', () => {
  assert.equal(PANEL_OPEN_SETTLE_DELAY_MS.script, 210);
  assert.equal(PANEL_OPEN_SETTLE_DELAY_MS.assets, 300);
  assert.equal(PANEL_OPEN_SETTLE_DELAY_MS.images, 320);

  // During card open animation (isOpenAnimationSettled = false) -> body stays unmounted
  assert.equal(
    shouldMountScriptBiblePanelBody({
      isOpen: true,
      isTabScript: true,
      isOpenAnimationSettled: false,
      isPanelExpanded: true,
      mountExpandedContent: true,
      isCardsLoading: false,
    }),
    false
  );

  // While collapsed, non-script tab, dock width transitioning, or cards loading -> unmounted
  assert.equal(
    shouldMountScriptBiblePanelBody({
      isOpen: true,
      isTabScript: true,
      isOpenAnimationSettled: true,
      isPanelExpanded: false,
      mountExpandedContent: true,
    }),
    false
  );
  assert.equal(
    shouldMountScriptBiblePanelBody({
      isOpen: true,
      isTabScript: true,
      isOpenAnimationSettled: true,
      isPanelExpanded: true,
      mountExpandedContent: false,
    }),
    false
  );
  assert.equal(
    shouldMountScriptBiblePanelBody({
      isOpen: true,
      isTabScript: true,
      isOpenAnimationSettled: true,
      isPanelExpanded: true,
      mountExpandedContent: true,
      isCardsLoading: true,
    }),
    false
  );

  // Settled + expanded + ready -> mounts inner body cleanly
  assert.equal(
    shouldMountScriptBiblePanelBody({
      isOpen: true,
      isTabScript: true,
      isOpenAnimationSettled: true,
      isPanelExpanded: true,
      mountExpandedContent: true,
      isCardsLoading: false,
    }),
    true
  );
});

test('computeProgressiveBatchCount steps smoothly across frames and bypasses batching when forceAll is true', () => {
  assert.equal(computeProgressiveBatchCount({ totalCount: 0, currentCount: 0 }), 0);
  assert.equal(computeProgressiveBatchCount({ totalCount: 25, currentCount: 0, initialBatchSize: 6, batchStep: 8 }), 6);
  assert.equal(computeProgressiveBatchCount({ totalCount: 25, currentCount: 6, initialBatchSize: 6, batchStep: 8 }), 14);
  assert.equal(computeProgressiveBatchCount({ totalCount: 25, currentCount: 14, initialBatchSize: 6, batchStep: 8 }), 22);
  assert.equal(computeProgressiveBatchCount({ totalCount: 25, currentCount: 22, initialBatchSize: 6, batchStep: 8 }), 25);
  assert.equal(computeProgressiveBatchCount({ totalCount: 40, currentCount: 0, forceAll: true }), 40);
});

