export const QIQI_TRI = "M29.53 21.45A1.00 1.00 0 0 0 27.85 22.14L25.78 69.68A1.00 1.00 0 0 0 27.43 70.48L43.21 56.85L64.01 55.33A1.00 1.00 0 0 0 64.61 53.60Z";
export const QIQI_VIEWBOX = "0 0 92 92";
export const QIQI_BODY = "#a45cf8";
export const QIQI_PIVOT_SWING = "27.95 20.00";
export const QIQI_PIVOT = QIQI_PIVOT_SWING;
export const QIQI_PIVOT_SCALE = "39.05 46.82";
export const QIQI_PIVOT_THINK = "41.57 46.00";
export const QIQI_EASE = "0.4 0 0.6 1";
export const QIQI_EYES = {
  left: { cx: 36.952, cy: 45.6, rx: 2.83, ry: 2.83 },
  right: { cx: 46.182, cy: 46.4, rx: 2.23, ry: 2.23 },
} as const;

export const QIQI_STROKE_LIGHT = "#4c127e";
export const QIQI_STROKE_DARK = "#d8b6fe";

export function getQiqiStrokeColor(isDarkMode: boolean = false): string {
  return isDarkMode ? QIQI_STROKE_DARK : QIQI_STROKE_LIGHT;
}

export interface QiqiStateSpec {
  state: 'idle' | 'think' | 'sleep' | 'ask';
}

export const QIQI_STATES: Record<'idle' | 'think' | 'sleep' | 'ask' | string, QiqiStateSpec> = {
  idle: { state: 'idle' },
  think: { state: 'think' },
  sleep: { state: 'sleep' },
  ask: { state: 'ask' },
};

export function buildQiqiBodyPathsMarkup(
  bodyColor: string,
  isDarkMode: boolean = false
): string {
  const strokeColor = getQiqiStrokeColor(isDarkMode);
  return `<path d="${QIQI_TRI}" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"/>`;
}

export function buildQiqiInnerMarkup(
  st: string = 'idle',
  noTilt: boolean = false,
  bodyColor: string = QIQI_BODY,
  isDarkMode: boolean = false
): string {
  const state =
    st === 'think'
      ? 'think'
      : st === 'sleep'
        ? 'sleep'
        : st === 'ask'
          ? 'ask'
          : 'idle';

  const eyeColor = getQiqiStrokeColor(isDarkMode);

  let eyesMarkup = '';
  if (state === 'think') {
    eyesMarkup = `<g><animateTransform attributeName="transform" type="rotate" values="0 41.57 46.00;360 41.57 46.00" keyTimes="0;1" dur="3.2s" repeatCount="indefinite" calcMode="linear"/><ellipse cx="36.952" cy="45.600" rx="2.83" ry="2.83" fill="${eyeColor}"/><ellipse cx="46.182" cy="46.400" rx="2.23" ry="2.23" fill="${eyeColor}"/></g>`;
  } else if (state === 'sleep') {
    eyesMarkup = `<g data-eye-state="closed"><path d="M34.12 45.6 Q36.95 47.2 39.78 45.6" fill="none" stroke="${eyeColor}" stroke-width="2.5" stroke-linecap="round"/><path d="M43.95 46.4 Q46.18 48.0 48.41 46.4" fill="none" stroke="${eyeColor}" stroke-width="2.5" stroke-linecap="round"/></g>`;
  } else if (state === 'ask') {
    eyesMarkup =
      `<g data-eye-state="ask">` +
      `<ellipse cx="36.952" cy="45.600" rx="3.05" ry="3.15" fill="${eyeColor}">` +
      `<animate attributeName="cx" values="37.452;38.152;38.152;36.952;37.452" keyTimes="0;0.25;0.6;0.82;1" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>` +
      `<animate attributeName="cy" values="45.250;44.650;44.650;45.600;45.250" keyTimes="0;0.25;0.6;0.82;1" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>` +
      `<animate attributeName="ry" values="3.15;3.15;0.55;3.15;3.15" keyTimes="0;0.84;0.89;0.94;1" dur="3.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>` +
      `</ellipse>` +
      `<ellipse cx="46.182" cy="46.400" rx="2.35" ry="1.82" fill="${eyeColor}">` +
      `<animate attributeName="cx" values="46.682;47.352;47.352;46.182;46.682" keyTimes="0;0.25;0.6;0.82;1" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>` +
      `<animate attributeName="cy" values="46.050;45.450;45.450;46.400;46.050" keyTimes="0;0.25;0.6;0.82;1" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>` +
      `<animate attributeName="ry" values="1.82;2.05;1.82;0.42;1.82" keyTimes="0;0.45;0.84;0.89;1" dur="3.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>` +
      `</ellipse>` +
      `</g>`;
  } else {
    eyesMarkup =
      `<ellipse cx="36.952" cy="45.600" rx="2.83" ry="2.83" fill="${eyeColor}"><animate attributeName="cx" values="37.802;37.802;36.002;36.002;38.002;38.002;36.602;36.602;37.802;37.802" keyTimes="0;0.16;0.18;0.44;0.46;0.68;0.70;0.86;0.88;1" dur="7.6s" repeatCount="indefinite" calcMode="linear"/><animate attributeName="cy" values="44.850;44.850;45.050;45.050;46.050;46.050;46.650;46.650;44.850;44.850" keyTimes="0;0.16;0.18;0.44;0.46;0.68;0.70;0.86;0.88;1" dur="7.6s" repeatCount="indefinite" calcMode="linear"/><animate attributeName="ry" values="2.83;2.83;0.509;0.509;2.83" keyTimes="0;0.88;0.91;0.94;1" dur="3.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></ellipse>` +
      `<ellipse cx="46.182" cy="46.400" rx="2.23" ry="2.23" fill="${eyeColor}"><animate attributeName="cx" values="47.032;47.032;45.232;45.232;47.232;47.232;45.832;45.832;47.032;47.032" keyTimes="0;0.16;0.18;0.44;0.46;0.68;0.70;0.86;0.88;1" dur="7.6s" repeatCount="indefinite" calcMode="linear"/><animate attributeName="cy" values="45.650;45.650;45.850;45.850;46.850;46.850;47.450;47.450;44.850;44.850" keyTimes="0;0.16;0.18;0.44;0.46;0.68;0.70;0.86;0.88;1" dur="7.6s" repeatCount="indefinite" calcMode="linear"/><animate attributeName="ry" values="2.23;2.23;0.401;0.401;2.23" keyTimes="0;0.88;0.91;0.94;1" dur="3.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></ellipse>`;
  }

  const body = buildQiqiBodyPathsMarkup(bodyColor, isDarkMode);
  let finalContent = body + eyesMarkup;

  if (!noTilt) {
    if (state === 'think') {
      const swingRot = `<animateTransform attributeName="transform" type="rotate" values="0 ${QIQI_PIVOT_SWING};1.2 ${QIQI_PIVOT_SWING};1.7 ${QIQI_PIVOT_SWING};1.2 ${QIQI_PIVOT_SWING};0 ${QIQI_PIVOT_SWING};-1.2 ${QIQI_PIVOT_SWING};-1.7 ${QIQI_PIVOT_SWING};-1.2 ${QIQI_PIVOT_SWING};0 ${QIQI_PIVOT_SWING}" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" dur="1.9s" repeatCount="indefinite" calcMode="linear"/>`;
      const scaleBreathe = `<g transform="translate(${QIQI_PIVOT_SCALE})"><g><animateTransform attributeName="transform" type="scale" values="1;0.986;1" keyTimes="0;0.5;1" dur="3.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><g transform="translate(-${QIQI_PIVOT_SCALE.replace(' ', ' -')})">${finalContent}</g></g></g>`;
      finalContent = `<g>${swingRot}${scaleBreathe}</g>`;
    } else if (state === 'ask') {
      const swingRot = `<animateTransform attributeName="transform" type="rotate" values="0 ${QIQI_PIVOT_SWING};0.85 ${QIQI_PIVOT_SWING};1.25 ${QIQI_PIVOT_SWING};0.85 ${QIQI_PIVOT_SWING};0 ${QIQI_PIVOT_SWING};-0.85 ${QIQI_PIVOT_SWING};-1.25 ${QIQI_PIVOT_SWING};-0.85 ${QIQI_PIVOT_SWING};0 ${QIQI_PIVOT_SWING}" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>`;
      const scaleBreathe = `<g transform="translate(${QIQI_PIVOT_SCALE})"><g><animateTransform attributeName="transform" type="scale" values="1;1.028;1" keyTimes="0;0.5;1" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><g transform="translate(-${QIQI_PIVOT_SCALE.replace(' ', ' -')})">${finalContent}</g></g></g>`;
      finalContent = `<g>${swingRot}${scaleBreathe}</g>`;
    } else if (state === 'idle') {
      const swingRot = `<animateTransform attributeName="transform" type="rotate" values="0 ${QIQI_PIVOT_SWING};0.39 ${QIQI_PIVOT_SWING};0.55 ${QIQI_PIVOT_SWING};0.39 ${QIQI_PIVOT_SWING};0 ${QIQI_PIVOT_SWING};-0.39 ${QIQI_PIVOT_SWING};-0.55 ${QIQI_PIVOT_SWING};-0.39 ${QIQI_PIVOT_SWING};0 ${QIQI_PIVOT_SWING}" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" dur="5.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>`;
      const scaleBreathe = `<g transform="translate(${QIQI_PIVOT_SCALE})"><g><animateTransform attributeName="transform" type="scale" values="1;1.025;1;1" keyTimes="0;0.42;0.78;1" dur="5.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/><g transform="translate(-${QIQI_PIVOT_SCALE.replace(' ', ' -')})">${finalContent}</g></g></g>`;
      finalContent = `<g>${swingRot}${scaleBreathe}</g>`;
    }
  }

  return finalContent;
}

export function mkQiqiSvg(
  st: string = 'idle',
  size: number = 92,
  vb?: string,
  noTilt?: boolean,
  bodyColor: string = QIQI_BODY,
  isDarkMode: boolean = false
): string {
  const body = buildQiqiInnerMarkup(st, Boolean(noTilt), bodyColor, isDarkMode);
  return `<svg width="${size}" height="${size}" viewBox="${vb || QIQI_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
