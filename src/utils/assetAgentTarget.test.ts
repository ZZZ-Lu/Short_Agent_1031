import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssetAgentTargetId,
  findAssetItemByIdInProject,
  isAssetSectionAgentFocused,
  parseAssetAgentTargetId,
  resolveAllAssetTargetIds,
  resolveAssetItemFromProject,
} from './assetAgentTarget';

test('buildAssetAgentTargetId produces distinct target IDs even when versions[0].id === parent.id', () => {
  const parentTarget = buildAssetAgentTargetId('character', 'char_natasha');
  const defaultVerTarget = buildAssetAgentTargetId('character', 'char_natasha', 'char_natasha');
  const variantVerTarget = buildAssetAgentTargetId('character', 'ver_childhood', 'char_natasha');

  assert.equal(parentTarget, 'assets.item.character.char_natasha');
  assert.equal(defaultVerTarget, 'assets.item.character.char_natasha.version.char_natasha');
  assert.equal(variantVerTarget, 'assets.item.character.char_natasha.version.ver_childhood');
  assert.notEqual(parentTarget, defaultVerTarget);
});

test('parseAssetAgentTargetId parses parent, version, and dotted IDs cleanly', () => {
  assert.deepEqual(parseAssetAgentTargetId('assets.item.character.char_1'), {
    category: 'character',
    itemId: 'char_1',
    isVersion: false,
  });

  assert.deepEqual(parseAssetAgentTargetId('assets.item.character.char_1.version.char_1'), {
    category: 'character',
    parentId: 'char_1',
    itemId: 'char_1',
    isVersion: true,
  });

  assert.deepEqual(parseAssetAgentTargetId('assets.item.location.loc.hall.version.loc.hall'), {
    category: 'location',
    parentId: 'loc.hall',
    itemId: 'loc.hall',
    isVersion: true,
  });

  assert.equal(parseAssetAgentTargetId('assets.panel'), null);
});

test('resolveAssetItemFromProject resolves parent vs promoted default version (常服/日景/初始态) without collision', () => {
  const project = {
    characters: [
      {
        id: 'char_natasha',
        name: '娜塔莎',
        description: '主资产描述',
        versions: [
          { id: 'char_natasha', name: '常服', description: '日常服装造型' },
          { id: 'ver_evening', name: '晚礼服', description: '宴会晚礼服造型' },
        ],
      },
    ],
    locations: [
      {
        id: 'loc_hall',
        name: '大厅',
        versions: [
          { id: 'loc_hall', name: '日景' },
          { id: 'ver_night', name: '夜景' },
        ],
      },
    ],
    props: [
      {
        id: 'prop_box',
        name: '木盒',
        versions: [
          { id: 'prop_box', name: '初始态' },
          { id: 'ver_open', name: '打开态' },
        ],
      },
    ],
  };

  // Targeting parent row resolves parent only
  const parentHit = resolveAssetItemFromProject(project, 'assets.item.character.char_natasha');
  assert.equal(parentHit?.isVersion, false);
  assert.equal(parentHit?.parentItem, undefined);
  assert.equal(parentHit?.item?.name, '娜塔莎');

  // Targeting promoted versions[0] ("常服") resolves the version + its parent, NOT top-level parent
  const defaultVerHit = resolveAssetItemFromProject(
    project,
    'assets.item.character.char_natasha.version.char_natasha'
  );
  assert.equal(defaultVerHit?.isVersion, true);
  assert.equal(defaultVerHit?.parentItem?.id, 'char_natasha');
  assert.equal(defaultVerHit?.item?.name, '常服');
  assert.equal(defaultVerHit?.item?.description, '日常服装造型');

  // Same for location "日景" and prop "初始态"
  const locDayHit = resolveAssetItemFromProject(
    project,
    'assets.item.location.loc_hall.version.loc_hall'
  );
  assert.equal(locDayHit?.isVersion, true);
  assert.equal(locDayHit?.item?.name, '日景');

  const propInitHit = resolveAssetItemFromProject(
    project,
    'assets.item.prop.prop_box.version.prop_box'
  );
  assert.equal(propInitHit?.isVersion, true);
  assert.equal(propInitHit?.item?.name, '初始态');

  // Legacy un-prefixed distinct version ID still falls back cleanly
  const legacyVerHit = resolveAssetItemFromProject(project, 'assets.item.character.ver_evening');
  assert.equal(legacyVerHit?.isVersion, true);
  assert.equal(legacyVerHit?.item?.name, '晚礼服');
  assert.equal(legacyVerHit?.parentItem?.name, '娜塔莎');
});

test('isAssetSectionAgentFocused matches exact version, parent-to-child sections, and bound canvas cards without sibling bleed', () => {
  const defaultVerSection = {
    category: 'character' as const,
    assetId: 'char_natasha',
    parentId: 'char_natasha',
    isVersion: true,
  };
  const variantVerSection = {
    category: 'character' as const,
    assetId: 'ver_evening',
    parentId: 'char_natasha',
    isVersion: true,
  };
  const singleLocSection = {
    category: 'location' as const,
    assetId: 'loc_hall',
    isVersion: false,
  };

  // Targeting specific version (including promoted versions[0] where assetId === parentId) matches only that version
  const defaultVerTarget = buildAssetAgentTargetId('character', 'char_natasha', 'char_natasha');
  assert.equal(isAssetSectionAgentFocused(defaultVerSection, [defaultVerTarget]), true);
  assert.equal(isAssetSectionAgentFocused(variantVerSection, [defaultVerTarget]), false);

  // Targeting parent asset matches child version sections in feed (consistent with isSectionActive)
  const parentTarget = buildAssetAgentTargetId('character', 'char_natasha');
  assert.equal(isAssetSectionAgentFocused(defaultVerSection, [parentTarget]), true);
  assert.equal(isAssetSectionAgentFocused(variantVerSection, [parentTarget]), true);
  assert.equal(isAssetSectionAgentFocused(singleLocSection, [parentTarget]), false);

  // Targeting bound canvas card ID matches only the section/tile bound to that card
  assert.equal(
    isAssetSectionAgentFocused(variantVerSection, ['card-bound-1'], ['card-bound-1']),
    true
  );
  assert.equal(
    isAssetSectionAgentFocused(defaultVerSection, ['card-bound-1'], ['card-other']),
    false
  );

  // Non-asset container target does not match any section
  assert.equal(isAssetSectionAgentFocused(defaultVerSection, ['images.feed.scroll']), false);
  assert.equal(isAssetSectionAgentFocused(singleLocSection, [null, undefined]), false);
});

test('findAssetItemByIdInProject and resolveAllAssetTargetIds resolve targets for multi-selection', () => {
  const project = {
    characters: [
      { id: 'c1', name: 'Char1', versions: [{ id: 'v1', name: 'Ver1' }] },
      { id: 'c2', name: 'Char2' },
    ],
    locations: [{ id: 'l1', name: 'Loc1' }],
    props: [{ id: 'p1', name: 'Prop1' }],
  };

  const hit1 = findAssetItemByIdInProject(project, 'c1');
  assert.equal(hit1?.category, 'character');
  assert.equal(hit1?.item.name, 'Char1');

  const hit2 = findAssetItemByIdInProject(project, 'v1');
  assert.equal(hit2?.category, 'character');
  assert.equal(hit2?.item.name, 'Ver1');
  assert.equal(hit2?.parentItem?.id, 'c1');

  const allTargets = resolveAllAssetTargetIds(project, ['c1', 'l1', 'p1'], 'assets.item.character.c1');
  assert.deepEqual(allTargets, [
    'assets.item.character.c1',
    'assets.item.location.l1',
    'assets.item.prop.p1',
  ]);
});
