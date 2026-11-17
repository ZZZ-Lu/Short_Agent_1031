export interface TargetClosestLike {
  id?: string;
  closest(selector: string): unknown;
}

const CANVAS_OVERLAY_CONTROL_SELECTOR =
  'button, input, textarea, select, form, aside, [role="dialog"], [role="menu"], [data-prevent-canvas-wheel]';

const DIALOG_SELECTOR = '[role="dialog"], [data-modal="true"]';
const CANVAS_CARD_SELECTOR = '#canvas-workspace [data-card-id]';

export function isElementLike(target: unknown): target is TargetClosestLike {
  return Boolean(
    target &&
    typeof target === 'object' &&
    typeof (target as TargetClosestLike).closest === 'function'
  );
}

export function isCanvasOverlayControlTarget(target: unknown): boolean {
  if (!isElementLike(target)) return false;
  return Boolean(target.closest(CANVAS_OVERLAY_CONTROL_SELECTOR));
}

/**
 * Determines whether a middle-button press (e.button === 1) over `target`
 * should bypass card sub-elements (buttons, textareas, video controls, toolbars)
 * and pass straight through to canvas panning.
 *
 * Returns true ONLY for elements inside a canvas card (`#canvas-workspace [data-card-id]`),
 * excluding modal dialogs, so external HUD overlays (Script Bible drawer, Mira chat aside,
 * top/bottom floating bars, Agent quick input) preserve their normal behavior.
 */
export function shouldPassThroughCanvasCardMiddleButton(
  button: number,
  target: unknown
): boolean {
  if (button !== 1) return false;
  if (!isElementLike(target)) return false;
  if (target.closest(DIALOG_SELECTOR)) return false;
  return Boolean(target.closest(CANVAS_CARD_SELECTOR));
}
