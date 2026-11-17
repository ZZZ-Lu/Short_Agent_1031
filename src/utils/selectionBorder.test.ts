import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGENT_FOCUS_COLOR,
  DUAL_SELECTION_GRADIENT,
  USER_SELECTION_COLOR,
  getDualSelectionOverlayStyle,
  getSelectionOverlayStyle,
  resolveSelectionBorderMode,
} from './selectionBorder';

test('resolveSelectionBorderMode handles all four selection/focus combinations', () => {
  assert.equal(
    resolveSelectionBorderMode({ isUserSelected: false, isAgentFocused: false }),
    'none'
  );
  assert.equal(
    resolveSelectionBorderMode({ isUserSelected: true, isAgentFocused: false }),
    'user'
  );
  assert.equal(
    resolveSelectionBorderMode({ isUserSelected: false, isAgentFocused: true }),
    'agent'
  );
  assert.equal(
    resolveSelectionBorderMode({ isUserSelected: true, isAgentFocused: true }),
    'dual'
  );
});

test('getDualSelectionOverlayStyle matches GenerationCard diagonal blue-to-purple gradient and hollow mask', () => {
  const style = getDualSelectionOverlayStyle();
  assert.equal(style.border, '2px solid transparent');
  assert.equal(style.backgroundImage, DUAL_SELECTION_GRADIENT);
  assert.ok(style.backgroundImage!.includes(USER_SELECTION_COLOR));
  assert.ok(style.backgroundImage!.includes(AGENT_FOCUS_COLOR));
  assert.equal(style.maskComposite, 'exclude');
  assert.equal(style.WebkitMaskComposite, 'xor');

  const scaled = getDualSelectionOverlayStyle('calc(2px / var(--selection-scale, 1))');
  assert.equal(scaled.border, 'calc(2px / var(--selection-scale, 1)) solid transparent');
});

test('getSelectionOverlayStyle shares identical mask geometry and swaps only color across states', () => {
  const userStyle = getSelectionOverlayStyle('user', '2px');
  const agentStyle = getSelectionOverlayStyle('agent', '2px');
  const dualStyle = getSelectionOverlayStyle('dual', '2px');

  assert.equal(userStyle.backgroundColor, USER_SELECTION_COLOR);
  assert.equal(agentStyle.backgroundColor, AGENT_FOCUS_COLOR);
  assert.equal(dualStyle.backgroundImage, DUAL_SELECTION_GRADIENT);

  for (const style of [userStyle, agentStyle, dualStyle]) {
    assert.equal(style.border, '2px solid transparent');
    assert.equal(style.maskComposite, 'exclude');
    assert.equal(style.WebkitMaskComposite, 'xor');
  }
});
