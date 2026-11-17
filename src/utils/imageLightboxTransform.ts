export interface LightboxCameraTransform {
  x: number;
  y: number;
  scale: number;
}

export const LIGHTBOX_MIN_SCALE = 0.2;
export const LIGHTBOX_MAX_SCALE = 12;

export function clampLightboxScale(
  scale: number,
  minScale: number = LIGHTBOX_MIN_SCALE,
  maxScale: number = LIGHTBOX_MAX_SCALE
): number {
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(Math.max(scale, minScale), maxScale);
}

/**
 * Computes the next camera transform when zooming toward a cursor position
 * relative to the viewport center `(centerX, centerY)`.
 *
 * The image is centered in the viewport at `(x = 0, y = 0, scale = 1)` with
 * CSS `transform-origin: center center`. A point at cursor offset
 * `offset = (cursorX - centerX, cursorY - centerY)` maps to image-local
 * coordinate `(offset - prev.translation) / prev.scale`. Keeping that exact
 * image point stationary under the cursor after scaling to `nextScale` yields:
 *
 *   `next.x = offsetX - (offsetX - prev.x) * (nextScale / prev.scale)`
 *   `next.y = offsetY - (offsetY - prev.y) * (nextScale / prev.scale)`
 */
export function computeCursorCenteredZoomTransform(params: {
  prev: LightboxCameraTransform;
  nextScale: number;
  cursorX: number;
  cursorY: number;
  viewportLeft?: number;
  viewportTop?: number;
  viewportWidth: number;
  viewportHeight: number;
  minScale?: number;
  maxScale?: number;
}): LightboxCameraTransform {
  const {
    prev,
    nextScale,
    cursorX,
    cursorY,
    viewportLeft = 0,
    viewportTop = 0,
    viewportWidth,
    viewportHeight,
    minScale = LIGHTBOX_MIN_SCALE,
    maxScale = LIGHTBOX_MAX_SCALE,
  } = params;

  const clampedScale = clampLightboxScale(nextScale, minScale, maxScale);
  const safePrevScale = prev.scale > 0 ? prev.scale : 1;
  const scaleRatio = clampedScale / safePrevScale;

  const centerX = viewportLeft + viewportWidth / 2;
  const centerY = viewportTop + viewportHeight / 2;
  const offsetX = cursorX - centerX;
  const offsetY = cursorY - centerY;

  const nextX = offsetX - (offsetX - prev.x) * scaleRatio;
  const nextY = offsetY - (offsetY - prev.y) * scaleRatio;

  return {
    x: nextX,
    y: nextY,
    scale: clampedScale,
  };
}

/**
 * Computes a smooth exponential zoom target from a wheel delta (`deltaY`).
 * Uses continuous exponential scaling `prevScale * Math.exp(-deltaY * sensitivity)`
 * rather than fixed stepped increments.
 */
export function computeWheelZoomTransform(params: {
  prev: LightboxCameraTransform;
  deltaY: number;
  cursorX: number;
  cursorY: number;
  viewportLeft?: number;
  viewportTop?: number;
  viewportWidth: number;
  viewportHeight: number;
  minScale?: number;
  maxScale?: number;
}): { nextTarget: LightboxCameraTransform; isDiscreteWheel: boolean } {
  const { deltaY, prev } = params;
  const isDiscreteWheel = Math.abs(deltaY) >= 20;
  const sensitivity = isDiscreteWheel ? 0.0022 : 0.0042;
  const clampedDelta = Math.max(-240, Math.min(240, deltaY));
  const rawNextScale = prev.scale * Math.exp(-clampedDelta * sensitivity);

  const nextTarget = computeCursorCenteredZoomTransform({
    ...params,
    nextScale: rawNextScale,
  });

  return {
    nextTarget,
    isDiscreteWheel,
  };
}

export function computePannedTransform(
  prev: LightboxCameraTransform,
  deltaX: number,
  deltaY: number
): LightboxCameraTransform {
  return {
    x: prev.x + deltaX,
    y: prev.y + deltaY,
    scale: prev.scale,
  };
}

export interface LightboxSourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Computes the initial/exit FLIP camera transform `(x, y, scale)` that maps the
 * centered fullscreen image onto the clicked source card's screen rectangle, so
 * the image smoothly zooms out from the card on open and zooms back into the
 * card on close.
 */
export function computeOriginTransitionTransform(params: {
  originRect?: LightboxSourceRect | null;
  viewportWidth: number;
  viewportHeight: number;
  imageAspectRatio?: number;
  renderedWidth?: number;
  renderedHeight?: number;
}): LightboxCameraTransform {
  const {
    originRect,
    viewportWidth,
    viewportHeight,
    imageAspectRatio,
    renderedWidth,
    renderedHeight,
  } = params;
  if (
    !originRect ||
    !Number.isFinite(originRect.width) ||
    !Number.isFinite(originRect.height) ||
    originRect.width <= 0 ||
    originRect.height <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return { x: 0, y: 0, scale: 0.88 };
  }

  const originCenterX = originRect.left + originRect.width / 2;
  const originCenterY = originRect.top + originRect.height / 2;
  const viewportCenterX = viewportWidth / 2;
  const viewportCenterY = viewportHeight / 2;

  let baseWidth: number;
  let baseHeight: number;

  if (
    typeof renderedWidth === 'number' &&
    renderedWidth > 0 &&
    typeof renderedHeight === 'number' &&
    renderedHeight > 0
  ) {
    baseWidth = renderedWidth;
    baseHeight = renderedHeight;
  } else {
    const maxStageWidth = viewportWidth * 0.88;
    const maxStageHeight = viewportHeight * 0.84;

    const ratio =
      typeof imageAspectRatio === 'number' && Number.isFinite(imageAspectRatio) && imageAspectRatio > 0
        ? imageAspectRatio
        : originRect.width / originRect.height;

    baseWidth = maxStageWidth;
    baseHeight = baseWidth / ratio;
    if (baseHeight > maxStageHeight) {
      baseHeight = maxStageHeight;
      baseWidth = baseHeight * ratio;
    }
  }

  const rawScale = Math.min(
    originRect.width / Math.max(1, baseWidth),
    originRect.height / Math.max(1, baseHeight)
  );
  const scale = Math.min(Math.max(rawScale, 0.05), 2.5);

  return {
    x: originCenterX - viewportCenterX,
    y: originCenterY - viewportCenterY,
    scale,
  };
}

/**
 * Interpolates between two camera transforms along a straight projective ray
 * with exponential perceptual scale interpolation.
 *
 * When exiting from a large zoom scale (e.g. 8x) back into a small card (e.g. 0.25x),
 * linear scale interpolation spends 90% of the duration zoomed far past 1x and whips
 * into the card at the last instant. Exponential scale keeps visual shrink velocity
 * uniform, and coupling (x, y) linearly to scale ensures every point on the image
 * moves along an exact straight line to its target card slot without curving or snapping.
 */
export function interpolateLightboxTransition(params: {
  from: LightboxCameraTransform;
  to: LightboxCameraTransform;
  progress: number;
}): LightboxCameraTransform {
  const { from, to, progress } = params;
  const p = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 1;
  if (p <= 0) return { x: from.x, y: from.y, scale: from.scale };
  if (p >= 1) return { x: to.x, y: to.y, scale: to.scale };

  const validScales =
    Number.isFinite(from.scale) &&
    Number.isFinite(to.scale) &&
    from.scale > 0 &&
    to.scale > 0;

  if (!validScales) {
    return {
      x: from.x + (to.x - from.x) * p,
      y: from.y + (to.y - from.y) * p,
      scale: from.scale + (to.scale - from.scale) * p,
    };
  }

  const scale = from.scale * Math.pow(to.scale / from.scale, p);
  const scaleSpan = to.scale - from.scale;
  const translationRatio =
    Math.abs(scaleSpan) > 1e-4
      ? Math.min(Math.max((scale - from.scale) / scaleSpan, 0), 1)
      : p;

  return {
    x: from.x + (to.x - from.x) * translationRatio,
    y: from.y + (to.y - from.y) * translationRatio,
    scale,
  };
}

