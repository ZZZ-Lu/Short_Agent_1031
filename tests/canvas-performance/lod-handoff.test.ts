import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canRetireDomForNano,
  isDomCardVisibleForHandoff,
  shouldBlockNanoHandoffForCard,
  resolveNanoReadyAction,
} from '../../src/utils/lodHandoff';

test('isDomCardVisibleForHandoff returns false when data-nano-retired hides DOM during lazy zoom-in >= 0.40', () => {
  // Regression for intermittent card disappearance on rapid < 0.40 -> >= 0.40 zoom in lazy mode:
  // even when DOM cards are still mounted and painted, data-nano-retired="true" hides them via CSS,
  // so NanoLodCanvas MUST keep drawing them until idle restore removes data-nano-retired.
  assert.equal(
    isDomCardVisibleForHandoff({
      scale: 0.65,
      domCardsActive: true,
      domNanoRetired: true,
      isGestureActive: true,
      isMounted: true,
      isPainted: true,
      panelReady: true,
    }),
    false
  );

  // Once idle restore clears data-nano-retired, DOM is visibly rendered and Canvas skips it.
  assert.equal(
    isDomCardVisibleForHandoff({
      scale: 0.65,
      domCardsActive: true,
      domNanoRetired: false,
      isGestureActive: false,
      isMounted: true,
      isPainted: true,
      panelReady: true,
    }),
    true
  );
});

test('isDomCardVisibleForHandoff always hands off below 0.40 so NanoLodCanvas can retire DOM layers immediately on zoom-out', () => {
  // Below threshold during active zoom-out, NanoLodCanvas must draw all cards so DOM GPU layers
  // can be retired via data-nano-retired="true" on frame 1 instead of double-rendering DOM + Canvas.
  assert.equal(
    isDomCardVisibleForHandoff({
      scale: 0.28,
      domCardsActive: true,
      domNanoRetired: false,
      isGestureActive: true,
      isMounted: true,
      isPainted: true,
      panelReady: true,
    }),
    false
  );

  assert.equal(
    isDomCardVisibleForHandoff({
      scale: 0.28,
      domCardsActive: true,
      domNanoRetired: false,
      isGestureActive: false,
      isMounted: true,
      isPainted: true,
      panelReady: true,
    }),
    false
  );
});

test('shouldBlockNanoHandoffForCard prevents gray-box DOM retirement when media image is still pending or cold-deferred', () => {
  const base = {
    scale: 0.3,
    domCardsActive: true,
    domNanoRetired: false,
    isDomCardMountedAndPainted: true,
    isTextCard: false,
    hasMedia: true,
    isGenerating: false,
    hasReadyImageSource: false,
    isImagePendingOrDeferred: true,
  };

  assert.equal(shouldBlockNanoHandoffForCard(base), true);
  // Once decoded image source is ready, handoff is allowed
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, hasReadyImageSource: true }), false);
  // Permanently failed / non-pending image does not deadlock handoff
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, isImagePendingOrDeferred: false }), false);
  // Text cards, blank drafts, and generating cards never block handoff
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, isTextCard: true }), false);
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, hasMedia: false }), false);
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, isGenerating: true }), false);
  // Above threshold or when DOM is already retired, no handoff block needed
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, scale: 0.5 }), false);
  assert.equal(shouldBlockNanoHandoffForCard({ ...base, domNanoRetired: true }), false);
});

test('resolveNanoReadyAction retires DOM via CSS immediately during zoom-out and progressively unmounts at rest', () => {
  const low = { scale: 0.3, tx: 10, ty: 20 };
  assert.equal(canRetireDomForNano(low, { ...low }), true);
  assert.equal(
    resolveNanoReadyAction({ frame: low, camera: { ...low }, isActiveZoomOrTween: true }),
    'css-retire'
  );
  assert.equal(
    resolveNanoReadyAction({ frame: low, camera: { ...low }, isActiveZoomOrTween: false }),
    'progressive-unmount'
  );
  // Stale frame or camera above threshold must not retire DOM
  assert.equal(
    resolveNanoReadyAction({ frame: low, camera: { ...low, scale: 0.45 }, isActiveZoomOrTween: true }),
    'none'
  );
  assert.equal(
    resolveNanoReadyAction({ frame: low, camera: { ...low, tx: 99 }, isActiveZoomOrTween: true }),
    'none'
  );
});
