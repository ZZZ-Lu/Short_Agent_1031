import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAssetProvenance,
  extractSectionsFromScript,
  groupSectionsByEpisode,
  buildVerifiedProvenanceFromEvidence,
} from '../src/utils/assetProvenance';
import {
  readScriptDirectory,
  readScriptStructured,
  searchScriptWithScope,
} from '../src/agent/scriptTools';
import { executeProjectAssetMutation, type ProjectData } from '../src/agent/projectTools';

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

test('scriptTools ignores stale precomputedScenes without startLine/paragraphs and preserves paragraph index on slice', () => {
  const script = `第一集
1-1
夜 内 地下室
人物 玛莉
▲玛莉跪在地上。
1-2
日 内 医院办公室
人物 娜塔莉亚
（转场说明）
▲娜塔莉亚坐在办公椅上翻看资料。
娜塔莉亚：我一定会查明真相。
1-3 贫民窟门口 日 外
人物 小娜塔莉亚 养父
▲小娜塔莉亚站在街道上。
▲小娜塔莉亚挥手告别。
`;
  const stalePrecomputedScenes = [
    { index: 1, id: 'legacy-ep-1', title: '第一集', rawText: script },
  ] as any;

  const dir = readScriptDirectory(script, {
    query: '娜塔莉亚',
    precomputedScenes: stalePrecomputedScenes,
  });
  assert.equal(dir.length, 1);
  assert.equal(dir[0].sceneCount, 3);

  const searchRes = searchScriptWithScope(script, '娜塔莉亚', {
    episode: '第一集',
    precomputedScenes: stalePrecomputedScenes,
  });
  assert.ok((searchRes.scenesSummary?.length ?? 0) >= 2);
  assert.ok(searchRes.matches.some(m => m.sceneTitle?.includes('1-2') && m.paragraphIndex === 2));

  const slicedRead = readScriptStructured(script, {
    episode: '第一集',
    scene: '1-2',
    paragraph: [2, 3],
    precomputedScenes: stalePrecomputedScenes,
  });
  const scene12Paras = slicedRead.episodes[0]?.scenes?.[0]?.paragraphs || [];
  assert.equal(scene12Paras.length, 2);
  assert.equal(scene12Paras[0].index, 2);
  assert.equal(scene12Paras[1].index, 3);
});

test('buildVerifiedProvenanceFromEvidence does not broadcast episode-only sceneTitle indices across multiple sub-scenes', () => {
  const script = `第一集
1-1
夜 内 地下室
人物 玛莉
▲玛莉在房间里。
1-2
日 内 医院办公室
人物 娜塔莉亚
▲娜塔莉亚坐在办公椅上。
娜塔莉亚：我准备出发了。
1-3 贫民窟门口 日 外
人物 小娜塔莉亚
▲小娜塔莉亚站在门口。
▲小娜塔莉亚转身离开。
`;
  const anchors = buildVerifiedProvenanceFromEvidence(
    script,
    undefined,
    [{ sceneTitle: '第一集', paragraphIndices: [7, 8] }],
    'char_1',
    '娜塔莉亚'
  );
  assert.equal(anchors.length, 2);
  assert.ok(anchors.every(a => a.sceneTitle.includes('1-2')));
});

test('asset.update append mode prevents version ID collision and merges refinement of auto-promoted initial version', () => {
  const script = `第一集
1-2
日 内 医院办公室
人物 娜塔莉亚
▲娜塔莉亚穿着职业装坐在椅子上。
1-3 贫民窟门口 日 外
人物 小娜塔莉亚
▲小娜塔莉亚穿着旧衣服站在街角。
1-5
日 外 布莱克伍德庄园
人物 娜塔莉亚
▲娜塔莉亚穿着职业装递交简历。
`;
  let project: ProjectData = {
    id: 'proj_test',
    scriptText: script,
    characters: [],
    locations: [],
    props: [],
  };

  // Step 1: Create parent character with 1-2 provenance
  const createRes = executeProjectAssetMutation(
    'asset.create',
    {
      type: 'characters',
      items: [
        {
          name: '娜塔莉亚',
          role: '心理医生',
          age: '22岁（回忆中8岁）',
          appearance: '22岁时盘发，戴着黑框眼镜，身穿职业装',
          provenances: [{ sceneTitle: '1-2', paragraphIndices: [1] }],
        },
      ],
    },
    project
  );
  project = { ...project, ...createRes.updatedProject };
  const charId = project.characters[0].id;

  // Step 2: Append 8-year-old version
  const update1 = executeProjectAssetMutation(
    'asset.update',
    {
      id: charId,
      mode: 'append',
      versions: [
        {
          name: '8岁娜塔莉亚',
          appearance: '8岁小女孩，穿着旧衣服',
          provenances: [{ sceneTitle: '1-3', paragraphIndices: [1] }],
        },
      ],
    },
    project
  );
  project = { ...project, ...update1.updatedProject };
  assert.equal(project.characters[0].versions.length, 2);

  // Step 3: Append 22-year-old version (without id); should refine versions[0] and NOT overwrite 8岁娜塔莉亚
  const update2 = executeProjectAssetMutation(
    'asset.update',
    {
      id: charId,
      mode: 'append',
      versions: [
        {
          name: '22岁娜塔莉亚',
          appearance: '22岁，盘发，戴着黑框眼镜，身穿职业装',
          provenances: [{ sceneTitle: '1-5', paragraphIndices: [1] }],
        },
      ],
    },
    project
  );
  project = { ...project, ...update2.updatedProject };
  const finalVersions = project.characters[0].versions;
  assert.equal(finalVersions.length, 2);
  assert.equal(finalVersions[0].name, '22岁娜塔莉亚');
  assert.equal(finalVersions[0].verifiedProvenance.length, 2);
  assert.equal(finalVersions[1].name, '8岁娜塔莉亚');
  assert.equal(finalVersions[1].verifiedProvenance.length, 1);
  assert.equal((project.characters[0] as any).mode, undefined);
});

test('structural meta filtering, roster parentheses parsing, startLine/endLine in readScriptStructured, and search non-paragraph deduplication', () => {
  const script = `第一集
1-2
日 内 医院办公室
人物 娜塔莉亚
（to制作：照片定格转场）
▲娜塔莉亚坐在办公椅上翻看资料。
【闪回】
1-3
日 外 贫民窟门口
人物  小娜塔莉亚 8岁 小玛莉（姐姐 13岁）  养父  养母
▲小娜塔莉亚站在街道上。
▲切镜。
▲小玛莉回头看着小娜塔莉亚。
【闪回结束】
`;

  // 1. Batch read scenes 1-2 and 1-3 in one call, verify startLine/endLine and roster parsing
  const batchRead = readScriptStructured(script, {
    episode: '第一集',
    scene: ['1-2', '1-3'],
  });
  assert.equal(batchRead.sceneCount, 2);
  assert.equal(batchRead.hasVolumeWarning, false);
  assert.ok(batchRead.startLine >= 2);
  assert.ok(batchRead.endLine >= batchRead.startLine);

  const scene13 = batchRead.episodes[0].scenes[1];
  assert.deepEqual(scene13.characterNames, [
    '小娜塔莉亚（8岁）',
    '小玛莉（姐姐 13岁）',
    '养父',
    '养母',
  ]);

  // 2. Search "娜塔莉亚" should exclude "人物 娜塔莉亚" roster lines because both scenes have paragraph hits
  const searchRes = searchScriptWithScope(script, '娜塔莉亚', { episode: '第一集' });
  assert.equal(searchRes.totalMatches, 3);
  assert.ok(searchRes.matches.every(m => typeof m.paragraphIndex === 'number'));
  assert.deepEqual(searchRes.matches.map(m => m.index), [1, 2, 3]);

  // 3. Provenance resolution should skip 【闪回】, 【闪回结束】, ▲切镜。, and （to制作：...）
  const anchors12 = buildVerifiedProvenanceFromEvidence(
    script,
    undefined,
    [{ sceneTitle: '1-2', paragraphIndices: [1, 2, 3] }],
    'char_nat',
    '娜塔莉亚'
  );
  assert.equal(anchors12.length, 1);
  assert.ok(anchors12[0].evidenceText?.includes('娜塔莉亚坐在办公椅上'));

  const anchors13 = buildVerifiedProvenanceFromEvidence(
    script,
    undefined,
    [{ sceneTitle: '1-3', paragraphIndices: [1, 2, 3, 4] }],
    'char_nat_8',
    '小娜塔莉亚'
  );
  assert.equal(anchors13.length, 2);
  assert.ok(anchors13.every(a => !a.evidenceText?.includes('切镜') && !a.evidenceText?.includes('闪回')));
});


