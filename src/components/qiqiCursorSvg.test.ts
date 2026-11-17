import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QIQI_TRI,
  QIQI_VIEWBOX,
  QIQI_PIVOT,
  QIQI_PIVOT_SCALE,
  QIQI_PIVOT_THINK,
  QIQI_EYES,
  QIQI_STROKE_LIGHT,
  QIQI_STROKE_DARK,
  getQiqiStrokeColor,
  buildQiqiBodyPathsMarkup,
  mkQiqiSvg,
} from './qiqiCursorSvg';

const V3_SPEC_PATH = "M29.53 21.45A1.00 1.00 0 0 0 27.85 22.14L25.78 69.68A1.00 1.00 0 0 0 27.43 70.48L43.21 56.85L64.01 55.33A1.00 1.00 0 0 0 64.61 53.60Z";

test('light mode uses a dark same-hue purple stroke (not black or white)', () => {
  const stroke = getQiqiStrokeColor(false);
  assert.equal(stroke, QIQI_STROKE_LIGHT);
});

test('dark mode uses a light same-hue purple stroke (not white or black)', () => {
  const stroke = getQiqiStrokeColor(true);
  assert.equal(stroke, QIQI_STROKE_DARK);
});

test('geometry matches SPEC-qiqi-pointer v3.0 path, 92x92 viewBox, and pivots', () => {
  assert.equal(QIQI_TRI, V3_SPEC_PATH);
  assert.equal(QIQI_VIEWBOX, '0 0 92 92');
  assert.equal(QIQI_PIVOT, '27.95 20.00');
  assert.equal(QIQI_PIVOT_SCALE, '39.05 46.82');
  assert.equal(QIQI_PIVOT_THINK, '41.57 46.00');
});

test('eyes are rendered with current stroke color (QIQI_STROKE_LIGHT / QIQI_STROKE_DARK) and exact coordinates', () => {
  assert.equal(QIQI_EYES.left.cx, 36.952);
  assert.equal(QIQI_EYES.left.cy, 45.6);
  assert.equal(QIQI_EYES.left.rx, 2.83);
  assert.equal(QIQI_EYES.right.cx, 46.182);
  assert.equal(QIQI_EYES.right.cy, 46.4);
  assert.equal(QIQI_EYES.right.rx, 2.23);

  const idleSvg = mkQiqiSvg('idle', 57.6, undefined, false, 'currentColor', false);
  assert.ok(idleSvg.includes('viewBox="0 0 92 92"'));
  assert.ok(idleSvg.includes(`fill="${QIQI_STROKE_LIGHT}"`));
  assert.ok(!idleSvg.includes('<mask'));

  const thinkSvg = mkQiqiSvg('think', 57.6, undefined, false, 'currentColor', true);
  assert.ok(thinkSvg.includes(`fill="${QIQI_STROKE_DARK}"`));
  assert.ok(!thinkSvg.includes('<mask'));

  const sleepSvg = mkQiqiSvg('sleep', 57.6, undefined, false, 'currentColor', false);
  assert.ok(sleepSvg.includes(`stroke="${QIQI_STROKE_LIGHT}"`));
  assert.ok(!sleepSvg.includes('<mask'));
});

test('body SVG markup preserves chromatic stroke with paint-order="stroke fill"', () => {
  const lightBody = buildQiqiBodyPathsMarkup('currentColor', false);
  assert.ok(lightBody.includes(`stroke="${QIQI_STROKE_LIGHT}"`));
  assert.ok(lightBody.includes('stroke-width="6"'));
  assert.ok(lightBody.includes('paint-order="stroke fill"'));
});

test('SMIL channels render correctly for idle, think, and sleep states', () => {
  const idleSvg = mkQiqiSvg('idle', 48, undefined, false, 'currentColor', false);
  assert.ok(idleSvg.includes('dur="3.2s"'));
  assert.ok(idleSvg.includes('dur="7.6s"'));
  assert.ok(idleSvg.includes('dur="5.6s"'));
  assert.ok(idleSvg.includes('dur="5.2s"'));

  const thinkSvg = mkQiqiSvg('think', 48, undefined, false, 'currentColor', true);
  assert.ok(thinkSvg.includes('values="0 41.57 46.00;360 41.57 46.00"'));
  assert.ok(thinkSvg.includes('dur="1.9s"'));
  assert.ok(thinkSvg.includes('dur="3.2s"'));

  const sleepSvg = mkQiqiSvg('sleep', 48, undefined, false, 'currentColor', false);
  assert.ok(sleepSvg.includes('data-eye-state="closed"'));

  const askSvg = mkQiqiSvg('ask', 48, undefined, false, 'currentColor', false);
  assert.ok(askSvg.includes('data-eye-state="ask"'));
  assert.ok(askSvg.includes('dur="2.6s"'));
  assert.ok(askSvg.includes('values="0 27.95 20.00;0.85 27.95 20.00'));
  assert.ok(askSvg.includes('<g transform="translate(39.05 46.82)"><g><animateTransform attributeName="transform" type="scale"'));
});

