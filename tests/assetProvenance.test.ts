import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAssetProvenance,
  extractSectionsFromScript,
  groupSectionsByEpisode,
} from '../src/utils/assetProvenance';

test('extractSectionsFromScript correctly identifies episodes and scenes', () => {
  const script = `【第1集】 暴风雨夜
第1场 内景 客厅 日
塞莱斯特坐在沙发上。
第2场 内景 厨房 日
戴安娜正在煮咖啡。
【第2集】 迷雾
第1场 外景 花园 夜
戴安娜走在小径上。
`;
  const sections = extractSectionsFromScript(script);
  assert.equal(sections.length, 5);
  assert.equal(sections[0].type, 'episode');
  assert.equal(sections[0].title, '第1集');
  assert.equal(sections[1].type, 'scene');
  assert.equal(sections[3].type, 'episode');
  assert.equal(sections[3].title, '第2集');
});

test('groupSectionsByEpisode groups child scenes under their parent episode', () => {
  const script = `第1集 序幕
第1场 客厅
塞莱斯特
第2场 厨房
戴安娜
`;
  const groups = groupSectionsByEpisode(script);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].episode?.title, '第1集 序幕');
  assert.equal(groups[0].scenes.length, 2);
  assert.equal(groups[0].scenes[0].title, '第1场 客厅');
  assert.equal(groups[0].scenes[1].title, '第2场 厨房');
});

test('calculateAssetProvenance folds into episode when asset appears in ALL scenes of that episode', () => {
  const script = `第1集 序幕
第1场 客厅
塞莱斯特在喝茶。
第2场 厨房
塞莱斯特走了进来，拿了一块饼干。
`;
  const items = calculateAssetProvenance(script, undefined, '塞莱斯特');
  assert.equal(items.length, 1);
  assert.equal(items[0].type, 'episode');
  assert.equal(items[0].isFullEpisode, true);
  assert.equal(items[0].displayLabel, '1集');
  assert.equal(items[0].sceneCount, 2);
  assert.equal(items[0].matchedSceneCount, 2);
});

test('calculateAssetProvenance emits specific scenes when asset appears in specific scenes', () => {
  const script = `第1集 序幕
第1场 客厅
塞莱斯特在喝茶。塞莱斯特站起身。塞莱斯特望向窗外。
第2场 厨房
戴安娜在煮咖啡。
第3场 书房
塞莱斯特在看书。
`;
  const items = calculateAssetProvenance(script, undefined, '塞莱斯特');
  assert.equal(items.length, 2);
  assert.equal(items[0].type, 'scene');
  assert.equal(items[0].displayLabel, '第1场 客厅');
  assert.equal(items[1].type, 'scene');
  assert.equal(items[1].displayLabel, '第3场 书房');

  assert.ok(items[0].firstMatchCharIndex > 0);
});

test('calculateAssetProvenance folds into episode when all scenes match with TOC items', () => {
  const script = `Episode 1
Scene 1
Hero arrives.
Scene 2
Hero fights.
`;
  const tocItems = [
    { id: '1', title: 'Episode 1', lineNumber: 1, charIndex: 0, type: 'episode' },
    { id: '2', title: 'Scene 1', lineNumber: 2, charIndex: 10, type: 'scene' },
    { id: '3', title: 'Scene 2', lineNumber: 4, charIndex: 26, type: 'scene' },
  ];
  const items = calculateAssetProvenance(script, tocItems, 'Hero');
  assert.equal(items.length, 1);
  assert.equal(items[0].displayLabel, 'Episode 1');
  assert.equal(items[0].isFullEpisode, true);
});

test('calculateAssetProvenance handles standalone scenes without episodes', () => {
  const script = `第1场 客厅
小猫在玩球。
第2场 院子
大狗在奔跑。
第3场 客厅
小猫在睡觉。
`;
  const items = calculateAssetProvenance(script, undefined, '小猫');
  assert.equal(items.length, 2);
  assert.equal(items[0].displayLabel, '第1场 客厅');
  assert.equal(items[1].displayLabel, '第3场 客厅');
});
