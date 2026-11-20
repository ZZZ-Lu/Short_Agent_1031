import { NANO_LOD_THRESHOLD } from './cardLodAppearance';
export type LodFrame = { scale: number; tx: number; ty: number };

// A queued callback from a previous camera/LOD cannot retire the current DOM.
export function canRetireDomForNano(frame: LodFrame, camera: LodFrame) {
  return frame.scale < NANO_LOD_THRESHOLD && camera.scale < NANO_LOD_THRESHOLD &&
    frame.scale === camera.scale && frame.tx === camera.tx && frame.ty === camera.ty;
}

export interface DomCardVisibilityInput {
  scale: number;
  threshold?: number;
  domCardsActive: boolean;
  domNanoRetired: boolean;
  isGestureActive?: boolean;
  isMounted: boolean;
  isPainted: boolean;
  panelReady: boolean;
}

/**
 * Determines whether a card is currently visibly rendered by the DOM layer,
 * allowing NanoLodCanvas to skip drawing it without creating gaps.
 *
 * - Below threshold (`scale < threshold`), NanoLodCanvas always draws the card so it can
 *   atomically retire heavy DOM GPU layers via `data-nano-retired="true"` on frame 1.
 * - Above threshold (`scale >= threshold`), if DOM is inactive or hidden via
 *   `data-nano-retired="true"` (e.g. during a rapid lazy-mode zoom-in before idle restore),
 *   DOM is NOT visible, so NanoLodCanvas MUST continue rendering the card.
 */
export function isDomCardVisibleForHandoff(input: DomCardVisibilityInput): boolean {
  const threshold = input.threshold ?? NANO_LOD_THRESHOLD;
  if (input.scale < threshold) return false;
  if (!input.domCardsActive || input.domNanoRetired) return false;
  return Boolean(input.isMounted && input.isPainted && input.panelReady);
}

export interface NanoCardHandoffInput {
  scale: number;
  threshold?: number;
  domCardsActive: boolean;
  domNanoRetired: boolean;
  isDomCardMountedAndPainted: boolean;
  isTextCard: boolean;
  hasMedia: boolean;
  isGenerating: boolean;
  hasReadyImageSource: boolean;
  isImagePendingOrDeferred: boolean;
}

/**
 * Blocks Nano-LOD DOM retirement for a visible DOM media card when NanoLodCanvas
 * lacks a decoded image source (still loading or cold-fallback deferred), preventing
 * a gray-box flash over an already-painted DOM card.
 */
export function shouldBlockNanoHandoffForCard(input: NanoCardHandoffInput): boolean {
  const threshold = input.threshold ?? NANO_LOD_THRESHOLD;
  if (input.scale >= threshold) return false;
  if (!input.domCardsActive || input.domNanoRetired) return false;
  if (!input.isDomCardMountedAndPainted) return false;
  if (input.isTextCard || !input.hasMedia || input.isGenerating) return false;
  if (input.hasReadyImageSource) return false;
  return input.isImagePendingOrDeferred;
}

export type NanoReadyRetirementAction = 'none' | 'css-retire' | 'progressive-unmount';

/**
 * Resolves how DOM cards should be retired once NanoLodCanvas presents a complete frame
 * below the Nano-LOD threshold:
 * - During an active zoom/tween gesture, immediately hide DOM via `data-nano-retired="true"`
 *   so heavy DOM compositor layers drop to zero GPU cost while zooming out.
 * - At rest, begin progressive DOM unmounting.
 */
export function resolveNanoReadyAction(input: {
  frame: LodFrame;
  camera: LodFrame;
  isActiveZoomOrTween: boolean;
}): NanoReadyRetirementAction {
  if (!canRetireDomForNano(input.frame, input.camera)) return 'none';
  return input.isActiveZoomOrTween ? 'css-retire' : 'progressive-unmount';
}

export interface LodHandoffState {
  cardId: string;
  underlayUrl: string;
  targetUrl: string;
  startTime: number;
  durationMs: number;
  isReady: boolean;
}

const activeHandoffs = new Map<string, LodHandoffState>();

export function startLodHandoff(cardId: string, underlayUrl: string, targetUrl: string, durationMs: number = 150): LodHandoffState {
  const state: LodHandoffState = {
    cardId,
    underlayUrl,
    targetUrl,
    startTime: performance.now(),
    durationMs,
    isReady: false,
  };
  activeHandoffs.set(cardId, state);
  return state;
}

export function markLodHandoffReady(cardId: string) {
  const existing = activeHandoffs.get(cardId);
  if (existing) {
    existing.isReady = true;
  }
}

export function getLodHandoffState(cardId: string): LodHandoffState | undefined {
  return activeHandoffs.get(cardId);
}

export function completeLodHandoff(cardId: string) {
  activeHandoffs.delete(cardId);
}
