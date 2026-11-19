export const RIGHT_CLICK_CHARGE_DELAY_MS = 110;
export const RIGHT_CLICK_LONG_PRESS_MS = 380;
export const RIGHT_CLICK_MOVE_TOLERANCE_PX = 8;
export const QIQI_CALLOUT_HOLD_AFTER_TRIGGER_MS = 960;

export type RightClickGesturePhase =
  | 'idle'
  | 'pressing'
  | 'charging'
  | 'long_pressed'
  | 'cancelled';

export interface RightClickPoint {
  x: number;
  y: number;
}

export interface QiqiCalloutPositionInput {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  calloutWidth?: number;
  calloutHeight?: number;
  margin?: number;
}

export interface QiqiCalloutPosition {
  left: number;
  top: number;
  flippedBelow: boolean;
}

/**
 * Computes the screen-space anchor for the "呼喊七七" callout at the top-right
 * of the user's cursor while clamping cleanly inside the viewport.
 */
export function computeQiqiCalloutPosition({
  x,
  y,
  viewportWidth,
  viewportHeight,
  calloutWidth = 104,
  calloutHeight = 36,
  margin = 10,
}: QiqiCalloutPositionInput): QiqiCalloutPosition {
  const safeW = Math.max(margin * 2 + 1, viewportWidth);
  const safeH = Math.max(margin * 2 + 1, viewportHeight);

  const idealLeft = x + 12;
  const maxLeft = Math.max(margin, safeW - calloutWidth - margin);
  const left = Math.max(margin, Math.min(idealLeft, maxLeft));

  const idealTop = y - calloutHeight - 8;
  const flippedBelow = idealTop < margin;
  const rawTop = flippedBelow ? y + 14 : idealTop;
  const maxTop = Math.max(margin, safeH - calloutHeight - margin);
  const top = Math.max(margin, Math.min(rawTop, maxTop));

  return {
    left: Math.round(left),
    top: Math.round(top),
    flippedBelow,
  };
}

export interface RightClickGestureCallbacks<TTarget = unknown> {
  onChargeStart?: (payload: { x: number; y: number; target: TTarget }) => void;
  onChargeCancel?: () => void;
  onLongPress: (payload: {
    x: number;
    y: number;
    isTrusted: boolean;
    target: TTarget;
  }) => void;
  onShortClick: (payload: {
    x: number;
    y: number;
    isTrusted: boolean;
    target: TTarget;
  }) => void;
}

export interface RightClickGestureTimerApi {
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (handle: ReturnType<typeof setTimeout>) => void;
}

export interface RightClickGestureControllerOptions<TTarget = unknown> {
  chargeDelayMs?: number;
  longPressMs?: number;
  moveTolerancePx?: number;
  timers?: RightClickGestureTimerApi;
  callbacks: RightClickGestureCallbacks<TTarget>;
}

export interface RightClickGestureController<TTarget = unknown> {
  getPhase: () => RightClickGesturePhase;
  handlePointerDown: (input: {
    button: number;
    x: number;
    y: number;
    isTrusted: boolean;
    target: TTarget;
  }) => void;
  handlePointerMove: (input: { x: number; y: number }) => void;
  handlePointerUp: (input: {
    button: number;
    x: number;
    y: number;
    isTrusted: boolean;
    target?: TTarget;
  }) => void;
  cancel: () => void;
  dispose: () => void;
}

/**
 * Pure, DOM-free state machine separating right-click short-press (triggered strictly
 * on pointer release) from right-click long-press (triggered after holding without dragging).
 *
 * Guarantees:
 * - Short right-click NEVER fires on press; it fires ONLY on release when held < longPressMs
 *   and pointer movement stayed within moveTolerancePx.
 * - Long-press fires at longPressMs while held, and subsequent release NEVER fires short-click.
 * - Moving past moveTolerancePx or calling cancel() aborts both long-press and short-click.
 */
export function createRightClickGestureController<TTarget = unknown>(
  options: RightClickGestureControllerOptions<TTarget>
): RightClickGestureController<TTarget> {
  const chargeDelayMs = options.chargeDelayMs ?? RIGHT_CLICK_CHARGE_DELAY_MS;
  const longPressMs = options.longPressMs ?? RIGHT_CLICK_LONG_PRESS_MS;
  const moveTolerancePx = options.moveTolerancePx ?? RIGHT_CLICK_MOVE_TOLERANCE_PX;
  const timers: RightClickGestureTimerApi = options.timers ?? {
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (handle) => clearTimeout(handle),
  };
  const { callbacks } = options;

  let phase: RightClickGesturePhase = 'idle';
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let pressIsTrusted = true;
  let pressTarget: TTarget | undefined;
  let chargeTimer: ReturnType<typeof setTimeout> | null = null;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = () => {
    if (chargeTimer !== null) {
      timers.clearTimeout(chargeTimer);
      chargeTimer = null;
    }
    if (longPressTimer !== null) {
      timers.clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const cancel = () => {
    const wasCharging = phase === 'charging';
    clearTimers();
    if (phase === 'pressing' || phase === 'charging') {
      phase = 'cancelled';
    } else {
      phase = 'idle';
    }
    if (wasCharging) {
      callbacks.onChargeCancel?.();
    }
  };

  const handlePointerDown: RightClickGestureController<TTarget>['handlePointerDown'] = ({
    button,
    x,
    y,
    isTrusted,
    target,
  }) => {
    if (button !== 2) {
      if (phase === 'pressing' || phase === 'charging') {
        cancel();
      }
      return;
    }

    clearTimers();
    if (phase === 'charging') {
      callbacks.onChargeCancel?.();
    }

    phase = 'pressing';
    startX = x;
    startY = y;
    currentX = x;
    currentY = y;
    pressIsTrusted = isTrusted;
    pressTarget = target;

    if (chargeDelayMs >= 0 && chargeDelayMs < longPressMs) {
      chargeTimer = timers.setTimeout(() => {
        chargeTimer = null;
        if (phase !== 'pressing') return;
        phase = 'charging';
        callbacks.onChargeStart?.({
          x: currentX,
          y: currentY,
          target: pressTarget as TTarget,
        });
      }, chargeDelayMs);
    }

    longPressTimer = timers.setTimeout(() => {
      longPressTimer = null;
      if (phase !== 'pressing' && phase !== 'charging') return;
      phase = 'long_pressed';
      callbacks.onLongPress({
        x: currentX,
        y: currentY,
        isTrusted: pressIsTrusted,
        target: pressTarget as TTarget,
      });
    }, longPressMs);
  };

  const handlePointerMove: RightClickGestureController<TTarget>['handlePointerMove'] = ({
    x,
    y,
  }) => {
    if (phase !== 'pressing' && phase !== 'charging') return;
    currentX = x;
    currentY = y;
    const dist = Math.hypot(x - startX, y - startY);
    if (dist > moveTolerancePx) {
      cancel();
    }
  };

  const handlePointerUp: RightClickGestureController<TTarget>['handlePointerUp'] = ({
    button,
    x,
    y,
    isTrusted,
    target,
  }) => {
    if (button !== 2) return;

    const prevPhase = phase;
    clearTimers();
    phase = 'idle';

    if (prevPhase === 'charging') {
      callbacks.onChargeCancel?.();
    }

    if (prevPhase === 'pressing' || prevPhase === 'charging') {
      const dist = Math.hypot(x - startX, y - startY);
      if (dist <= moveTolerancePx) {
        callbacks.onShortClick({
          x,
          y,
          isTrusted,
          target: (target !== undefined ? target : pressTarget) as TTarget,
        });
      }
    }

    pressTarget = undefined;
  };

  const dispose = () => {
    clearTimers();
    phase = 'idle';
    pressTarget = undefined;
  };

  return {
    getPhase: () => phase,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancel,
    dispose,
  };
}
