import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSelectionToolbarPosition,
  deleteScriptAnnotation,
  reconcileAnnotationsAfterTextChange,
  upsertScriptAnnotation,
} from './scriptAnnotations';

test('computeSelectionToolbarPosition places toolbar centered above selection when headroom is sufficient', () => {
  const pos = computeSelectionToolbarPosition({
    anchorRect: { left: 200, right: 320, top: 240, bottom: 262 },
    viewportWidth: 1440,
    viewportHeight: 900,
    toolbarWidth: 140,
    toolbarHeight: 40,
  });
  assert.equal(pos.placement, 'above');
  assert.equal(pos.x, 260);
  assert.equal(pos.y, 232);
});

test('computeSelectionToolbarPosition flips below selection near top edge and clamps horizontally', () => {
  const pos = computeSelectionToolbarPosition({
    anchorRect: { left: 10, right: 40, top: 20, bottom: 42 },
    viewportWidth: 1440,
    viewportHeight: 900,
    toolbarWidth: 140,
    toolbarHeight: 40,
    margin: 12,
  });
  assert.equal(pos.placement, 'below');
  assert.equal(pos.x, 82); // clamped to toolbarWidth/2 + margin
  assert.equal(pos.y, 50); // bottom + gap
});

test('upsertScriptAnnotation creates and updates immutably with 100% JSON serializability', () => {
  const createdList = upsertScriptAnnotation([], {
    from: 10,
    to: 22,
    selectedText: '林深缓缓放下怀表',
    noteText: '时间线关键伏笔',
    badgeText: '伏笔',
    now: 1700000000000,
  });

  assert.equal(createdList.length, 1);
  assert.equal(createdList[0].category, 'annotation');
  assert.equal(createdList[0].badgeText, '伏笔');
  assert.equal(createdList[0].meta?.noteText, '时间线关键伏笔');
  assert.equal(createdList[0].onClick, undefined);

  // Round-trip serializability check
  const roundTripped = JSON.parse(JSON.stringify(createdList));
  assert.deepEqual(roundTripped, createdList);

  const updatedList = upsertScriptAnnotation(createdList, {
    id: createdList[0].id,
    from: 10,
    to: 22,
    selectedText: '林深缓缓放下怀表',
    noteText: '已修改备注',
    badgeText: '重点',
    now: 1700000005000,
  });

  assert.equal(updatedList.length, 1);
  assert.equal(updatedList[0].badgeText, '重点');
  assert.equal(updatedList[0].meta?.noteText, '已修改备注');
  // Original list untouched (immutability)
  assert.equal(createdList[0].badgeText, '伏笔');

  const afterDelete = deleteScriptAnnotation(updatedList, createdList[0].id);
  assert.equal(afterDelete.length, 0);
});

test('reconcileAnnotationsAfterTextChange shifts offsets cleanly when text is inserted before annotation', () => {
  const originalDoc = '第一行\n林深缓缓放下怀表。\n第三行';
  const target = '林深缓缓放下怀表';
  const from = originalDoc.indexOf(target);
  const to = from + target.length;

  const list = upsertScriptAnnotation([], {
    from,
    to,
    selectedText: target,
    noteText: '道具特写',
    badgeText: '道具',
    now: 1700000000000,
  });

  const prefix = '新增开场描述\n';
  const editedDoc = prefix + originalDoc;
  const reconciled = reconcileAnnotationsAfterTextChange(list, editedDoc);

  assert.ok(reconciled);
  assert.equal(reconciled[0].from, from + prefix.length);
  assert.equal(reconciled[0].to, to + prefix.length);
  assert.equal(editedDoc.slice(reconciled[0].from, reconciled[0].to), target);

  // No-op when offsets already match
  assert.equal(reconcileAnnotationsAfterTextChange(reconciled, editedDoc), null);
});
