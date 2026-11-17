import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssetContextMenuItems,
  clampAssetContextMenuPosition,
  getAssetContextMenuHeaderLabel,
  resolveAssetContextMenuAnchorY,
} from './assetContextMenu';

test('buildAssetContextMenuItems returns 6 actions for top-level assets including image binding and Agent generation', () => {
  const charItems = buildAssetContextMenuItems({ category: 'character', isVersion: false });
  assert.deepEqual(
    charItems.map(i => [i.id, i.label, Boolean(i.destructive)]),
    [
      ['add-version', '新增服装/造型版本', false],
      ['view', '查看资产详情', false],
      ['edit', '编辑资产', false],
      ['bind-image', '手动绑定图像', false],
      ['agent-generate-image', 'Agent 生成资产图', false],
      ['delete', '删除资产', true],
    ]
  );

  const locItems = buildAssetContextMenuItems({ category: 'location', isVersion: false });
  assert.equal(locItems[0]?.label, '新增日景/夜景版本');
  assert.equal(locItems.length, 6);

  const propItems = buildAssetContextMenuItems({ category: 'prop', isVersion: false });
  assert.equal(propItems[0]?.label, '新增道具状态版本');
  assert.equal(propItems.length, 6);
});

test('buildAssetContextMenuItems returns 5 version actions for sub-version items', () => {
  const verItems = buildAssetContextMenuItems({ category: 'character', isVersion: true });
  assert.deepEqual(
    verItems.map(i => [i.id, i.label, Boolean(i.destructive)]),
    [
      ['view', '查看版本详情', false],
      ['edit', '编辑版本', false],
      ['bind-image', '手动绑定图像', false],
      ['agent-generate-image', 'Agent 生成资产图', false],
      ['delete', '删除版本', true],
    ]
  );
});

test('clampAssetContextMenuPosition keeps menu inside viewport edges', () => {
  assert.deepEqual(
    clampAssetContextMenuPosition({
      x: 300,
      y: 250,
      viewportWidth: 1440,
      viewportHeight: 900,
      menuWidth: 184,
      menuHeight: 188,
      margin: 12,
    }),
    { left: 300, top: 250 }
  );

  // Near bottom-right corner
  assert.deepEqual(
    clampAssetContextMenuPosition({
      x: 1420,
      y: 880,
      viewportWidth: 1440,
      viewportHeight: 900,
      menuWidth: 184,
      menuHeight: 188,
      margin: 12,
    }),
    { left: 1244, top: 700 }
  );

  // Near top-left corner (negative coords)
  assert.deepEqual(
    clampAssetContextMenuPosition({
      x: -10,
      y: 2,
      viewportWidth: 1440,
      viewportHeight: 900,
      menuWidth: 184,
      menuHeight: 188,
      margin: 12,
    }),
    { left: 12, top: 12 }
  );
});

test('resolveAssetContextMenuAnchorY cascades below Agent HUD and flips above near bottom', () => {
  assert.equal(
    resolveAssetContextMenuAnchorY({
      clientY: 220,
      viewportHeight: 900,
      menuHeight: 264,
      hudHeight: 80,
      margin: 12,
      cascadeBelowAgentHud: false,
    }),
    220
  );

  assert.equal(
    resolveAssetContextMenuAnchorY({
      clientY: 220,
      viewportHeight: 900,
      menuHeight: 264,
      hudHeight: 80,
      margin: 12,
      cascadeBelowAgentHud: true,
    }),
    300
  );

  // Near bottom edge: flip above clientY to avoid covering the Agent HUD
  assert.equal(
    resolveAssetContextMenuAnchorY({
      clientY: 740,
      viewportHeight: 900,
      menuHeight: 264,
      hudHeight: 80,
      margin: 12,
      cascadeBelowAgentHud: true,
    }),
    464
  );
});

test('getAssetContextMenuHeaderLabel formats parent and item names cleanly', () => {
  assert.equal(getAssetContextMenuHeaderLabel({ itemName: '焦恩' }), '焦恩');
  assert.equal(
    getAssetContextMenuHeaderLabel({ parentName: '玛莉', itemName: '13岁贫民窟少女' }),
    '玛莉 · 13岁贫民窟少女'
  );
  assert.equal(getAssetContextMenuHeaderLabel({}), '资产操作');
});
