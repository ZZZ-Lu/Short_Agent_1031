export const USER_SELECTION_COLOR = '#3b82f6';
export const AGENT_FOCUS_COLOR = '#a45cf8';
export const DUAL_SELECTION_GRADIENT =
  'linear-gradient(135deg, #3b82f6 0%, #3b82f6 44%, #a45cf8 56%, #a45cf8 100%)';

export type SelectionBorderMode = 'none' | 'user' | 'agent' | 'dual';

export interface SelectionBorderStateInput {
  isUserSelected: boolean;
  isAgentFocused: boolean;
}

/**
 * Resolves the unified visual selection border mode shared across canvas cards,
 * script asset list rows, and asset image feed tiles:
 * - User-only -> blue (#3b82f6)
 * - Agent-only -> purple (#a45cf8)
 * - Both active -> 135deg dual blue+purple diagonal gradient
 */
export function resolveSelectionBorderMode(
  input: SelectionBorderStateInput
): SelectionBorderMode {
  const user = Boolean(input.isUserSelected);
  const agent = Boolean(input.isAgentFocused);
  if (user && agent) return 'dual';
  if (agent) return 'agent';
  if (user) return 'user';
  return 'none';
}

export interface DualSelectionOverlayStyle {
  border?: string;
  padding?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundClip?: string;
  WebkitMask: string;
  WebkitMaskComposite: string;
  mask: string;
  maskComposite: string;
}

export type SelectionOverlayStyle = DualSelectionOverlayStyle;

export function resolveSelectionBorderBackground(
  mode: Exclude<SelectionBorderMode, 'none'>
): string {
  if (mode === 'dual') return DUAL_SELECTION_GRADIENT;
  if (mode === 'agent') return AGENT_FOCUS_COLOR;
  return USER_SELECTION_COLOR;
}

/**
 * Generates an identical hollow inset border mask overlay for all active states
 * ('user' blue, 'agent' purple, 'dual' diagonal blue-to-purple gradient), changing
 * only the border fill color/gradient so geometry and corner curvature never drift.
 */
export function getSelectionOverlayStyle(
  mode: Exclude<SelectionBorderMode, 'none'>,
  borderWidthCss: string = '2px'
): SelectionOverlayStyle {
  const bg = resolveSelectionBorderBackground(mode);
  const isGradient = bg.includes('gradient');
  return {
    border: `${borderWidthCss} solid transparent`,
    ...(isGradient ? { backgroundImage: bg } : { backgroundColor: bg }),
    backgroundClip: 'border-box',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
  };
}

/**
 * Generates the exact 135deg blue/purple hollow border mask style used on GenerationCard.
 */
export function getDualSelectionOverlayStyle(
  borderWidthCss: string = '2px'
): DualSelectionOverlayStyle {
  return getSelectionOverlayStyle('dual', borderWidthCss);
}
