import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { executeProjectReadTool, executeProjectAssetMutation, type ProjectData } from './projectTools';
import { readScriptStructured, RECOMMENDED_BATCH_MAX_CHARS } from './scriptTools';
import { resolveVerifiedProvenance } from '../utils/assetProvenance';
import { getAssetIdentificationText, getVersionIdentificationText, mergeMultiVersionAssetList } from '../utils/assetVersions';
import { refreshTaskCardContext } from './cardContextBuilder';

const project: ProjectData = { id: 'p1', scriptText: '第1集 开始\n你好\n第2集 继续\n再见', characters: [{ id: 'c1', name: 'Vivian', role: '主角', appearance: '长裙' }], locations: [{ id: 'l1', name: '车厢' }], props: [] };

test('后台剧本工具读取目录、分页正文和搜索结果', () => {
  const directory = executeProjectReadTool('script.directory', { limit: 1 }, project);
  assert.equal(directory.projectId, 'p1');
  assert.equal(directory.total, 2);
  assert.equal(directory.nextOffset, 1);
  const ep1 = (directory.entries as any[])[0];
  assert.equal(ep1.id, 'episode-1');
  assert.equal(ep1.title, '第1集 开始');
  const pageFromLine1 = executeProjectReadTool('script.read', { offset: 1, limit: 2 }, project);
  assert.equal(pageFromLine1.content, '第1集 开始\n你好');
  assert.equal(pageFromLine1.nextOffset, 3);
  const pageFromLine2 = executeProjectReadTool('script.read', { offset: 2, limit: 2 }, project);
  assert.equal(pageFromLine2.content, '你好\n第2集 继续');
  assert.equal(pageFromLine2.nextOffset, 4);
  assert.deepEqual(executeProjectReadTool('script.search', { query: '再见', episode: 'all' }, project).matches?.map(m => m.index), [1]);
  assert.throws(() => executeProjectReadTool('script.search', { query: '', episode: 1 }, project));
  assert.throws(() => executeProjectReadTool('script.search', { query: '再见' }, project), /episode/);

  const multiEpProject: ProjectData = {
    id: 'p_scope',
    scriptText: [
      '第一集',
      '1-1 日 内 客厅',
      '▲布拉姆走进客厅。',
      '1-5 日 外 庄园',
      '布拉姆：欢迎来到庄园。',
      '第二集',
      '2-1 夜 内 书房',
      '布拉姆：加强庄园守卫，任何人都不许出去！',
    ].join('\n'),
    characters: [],
    locations: [],
    props: [],
  };

  const allMatches = executeProjectReadTool('script.search', { query: '布拉姆', episode: 'all' }, multiEpProject);
  assert.deepEqual(allMatches.matches?.map(m => m.index), [1, 2, 3]);

  // 按 episode="第一集" 或 episode=1 限定搜索，并且连续序号从 1..N 编号
  const ep1ByCn = executeProjectReadTool('script.search', { query: '布拉姆', episode: '第一集' }, multiEpProject);
  assert.deepEqual(ep1ByCn.matches?.map(m => m.index), [1, 2]);
  assert.deepEqual(ep1ByCn.scope, { episode: '第一集' });

  const ep1ByNum = executeProjectReadTool('script.search', { query: '布拉姆', episode: 1 }, multiEpProject);
  assert.deepEqual(ep1ByNum.matches?.map(m => m.index), [1, 2]);

  // 按场次编号（如 "1-5"）限定搜索
  const sceneRes = executeProjectReadTool('script.search', { query: '布拉姆', episode: '1-5' }, multiEpProject);
  assert.deepEqual(sceneRes.matches?.map(m => m.index), [1]);
});

test('资产工具按项目、类型和页码读取，并拒绝无效类型', () => {
  const result = executeProjectReadTool('asset.list', { type: 'characters', limit: 1 }, project);
  assert.equal(result.projectId, 'p1');
  assert.deepEqual(result.items, [{ id: 'c1', name: 'Vivian', role: '主角', appearance: '长裙' }]);
  assert.equal(result.nextOffset, null);
  assert.throws(() => executeProjectReadTool('asset.list', { type: 'invalid' }, project));

  // Query filter
  const queryMatch = executeProjectReadTool('asset.list', { type: 'characters', query: 'vivian' }, project);
  assert.equal(queryMatch.items.length, 1);
  const queryNoMatch = executeProjectReadTool('asset.list', { type: 'characters', query: 'nonexistent' }, project);
  assert.equal(queryNoMatch.items.length, 0);
});

test('资产工具增删改 (CRUD) 操作测试', () => {
  let currentProj = { ...project, characters: [...project.characters], locations: [...project.locations], props: [...project.props] };

  // 1. asset.create (单个新增角色)
  const createRes1 = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: 'Mia',
    role: '配角',
    appearance: '黑色皮衣'
  }, currentProj);
  assert.equal(createRes1.output.success, true);
  assert.equal(createRes1.output.createdCount, 1);
  const newChar = (createRes1.output.items as any[])[0];
  assert.equal(newChar.name, 'Mia');
  assert.ok(newChar.id.startsWith('char_'));
  currentProj = { ...currentProj, ...createRes1.updatedProject };
  assert.equal(currentProj.characters.length, 2);

  // 2. asset.create (批量新增道具)
  const createProps = executeProjectAssetMutation('asset.create', {
    type: 'props',
    items: [
      { name: '车长钥匙', materialAndState: '黄铜质感' },
      { name: '登记册', materialAndState: '皮质封皮' }
    ]
  }, currentProj);
  assert.equal(createProps.output.success, true);
  assert.equal(createProps.output.createdCount, 2);
  currentProj = { ...currentProj, ...createProps.updatedProject };
  assert.equal(currentProj.props.length, 2);

  // 3. asset.update (修改资产)
  const updateRes = executeProjectAssetMutation('asset.update', {
    id: newChar.id,
    updates: {
      appearance: '短发，换上战术教官服'
    },
    sourceScenes: ['第1集', '第2集']
  }, currentProj);
  assert.equal(updateRes.output.success, true);
  assert.equal((updateRes.output.item as any).appearance, '短发，换上战术教官服');
  assert.deepEqual((updateRes.output.item as any).sourceScenes, ['第1集', '第2集']);
  currentProj = { ...currentProj, ...updateRes.updatedProject };
  const updatedChar = currentProj.characters.find(c => c.id === newChar.id);
  assert.equal(updatedChar.appearance, '短发，换上战术教官服');
  assert.deepEqual(updatedChar.sourceScenes, ['第1集', '第2集']);

  // 4. asset.delete (删除资产)
  const deleteRes = executeProjectAssetMutation('asset.delete', {
    id: newChar.id
  }, currentProj);
  assert.equal(deleteRes.output.success, true);
  assert.equal(deleteRes.output.deletedCount, 1);
  currentProj = { ...currentProj, ...deleteRes.updatedProject };
  assert.equal(currentProj.characters.some(c => c.id === newChar.id), false);
  assert.equal(currentProj.characters.length, 1);
});

test('资产出处核验闭环：多别名检索候选 -> 模型逐条过滤 -> 提交指纹锚点与抗偏移解析', () => {
  const scriptWithAmbiguousKeys = [
    '第5集 停车场',
    '老张拔下汽车钥匙扔在引擎盖上。',
    '第9集 审讯室',
    '“信任才是打开心门的钥匙。”警长缓缓说道。',
    '第13集 地下室门口',
    '娜塔莉亚从贴身口袋摸出那把沉甸甸的钥匙，温润的纯金光泽在暗处闪烁。',
    '第24集 密室',
    '娜塔莉亚将纯金钥匙插入锁孔，轻轻转动。',
  ].join('\n');

  let keyProj: ProjectData = {
    id: 'p_key',
    scriptText: scriptWithAmbiguousKeys,
    characters: [],
    locations: [],
    props: [
      {
        id: 'prop_gold_key',
        name: '纯金钥匙',
        owner: '娜塔莉亚',
        materialAndState: '纯金打造，沉手，光泽温润',
      },
    ],
  };

  // Step 1: Agent 推断出别名 ["纯金钥匙", "金钥匙", "钥匙"] 并检索全部候选
  const searchRes = executeProjectReadTool('asset.searchProvenanceCandidates', {
    id: 'prop_gold_key',
    aliases: ['纯金钥匙', '金钥匙', '钥匙'],
  }, keyProj) as any;

  assert.equal(searchRes.totalCandidates, 4);
  assert.equal(searchRes.candidates[0].sceneTitle, '第5集 停车场');
  assert.equal(searchRes.candidates[1].sceneTitle, '第9集 审讯室');
  assert.equal(searchRes.candidates[2].sceneTitle, '第13集 地下室门口');
  assert.equal(searchRes.candidates[2].matchedTerm, '钥匙');
  assert.equal(searchRes.candidates[3].sceneTitle, '第24集 密室');
  assert.equal(searchRes.candidates[3].matchedTerm, '纯金钥匙');

  // Step 2: 模型逐一鉴别后，排除 cand_0 (汽车钥匙) 与 cand_1 (台词比喻)，仅提交 cand_2 与 cand_3
  const commitRes = executeProjectAssetMutation('asset.commitProvenance', {
    id: 'prop_gold_key',
    aliases: ['钥匙', '金钥匙'],
    verifiedCandidateIds: ['cand_2', 'cand_3'],
    summary: '排除第5集车钥匙与第9集比喻，确认第13集与第24集为娜塔莉亚的纯金钥匙。',
  }, keyProj);

  assert.equal(commitRes.output.success, true);
  assert.equal(commitRes.output.verifiedCount, 2);
  assert.deepEqual(commitRes.output.sourceScenes, ['第13集 地下室门口', '第24集 密室']);

  keyProj = { ...keyProj, ...commitRes.updatedProject };
  const verifiedProp = keyProj.props[0];
  assert.equal(verifiedProp.provenanceStatus, 'verified');
  assert.equal(verifiedProp.verifiedProvenance.length, 2);

  // Step 3: 即使第5集前面新增了大段文字，resolveVerifiedProvenance 依然通过 anchorText 0ms 精确还原偏移量与命中别名
  const editedScript = '【序章 新增三百字铺垫……】\n这里插入了很长一段新剧情文本。\n' + scriptWithAmbiguousKeys;
  const resolvedMatches = resolveVerifiedProvenance(editedScript, undefined, verifiedProp.verifiedProvenance);
  assert.equal(resolvedMatches.length, 2);
  assert.equal(resolvedMatches[0].matchedTerm, '钥匙');
  assert.equal(
    editedScript.slice(resolvedMatches[0].firstMatchCharIndex, resolvedMatches[0].firstMatchCharIndex + (resolvedMatches[0].matchedTerm?.length || 0)),
    '钥匙'
  );
  assert.equal(resolvedMatches[1].matchedTerm, '纯金钥匙');
  assert.equal(
    editedScript.slice(resolvedMatches[1].firstMatchCharIndex, resolvedMatches[1].firstMatchCharIndex + (resolvedMatches[1].matchedTerm?.length || 0)),
    '纯金钥匙'
  );
});

test('出处核验防错位回归测试：检索与提交时 aliases 增减不会导致候选下标漂移误伤后续集数', () => {
  const cakePaintingScript = [
    '第八集',
    '娜塔莉亚画了一扇缠着铁链的门。',
    '第十七集',
    '戴安娜：快来看我画的画！',
    '▲戴安娜举着画，画上画着一个生日蛋糕。',
    '戴安娜：以前都是妈妈亲手做的蛋糕。',
    '第十八集',
    '▲戴安娜指着画上的蛋糕。',
    '▲娜塔莉亚的目光落在了戴安娜手中的画上。',
    '小玛莉：以后姐姐给你买个真正的生日蛋糕！',
    '▲娜塔莉亚看着画，又低头看着熟睡的戴安娜。',
    '第三十集',
    '30-1 夜 内 画室',
  ].join('\n');

  const cakeProj: ProjectData = {
    id: 'p_cake',
    scriptText: cakePaintingScript,
    characters: [],
    locations: [],
    props: [
      {
        id: 'prop_cake_drawing',
        name: '画（生日蛋糕）',
        owner: '戴安娜',
        materialAndState: '画着生日蛋糕的儿童画',
      },
    ],
  };

  // Round 1: 传入 4 个词（含“蛋糕”）
  const searchRes = executeProjectReadTool('asset.searchProvenanceCandidates', {
    id: 'prop_cake_drawing',
    aliases: ['画（生日蛋糕）', '生日蛋糕', '蛋糕', '画'],
  }, cakeProj) as any;

  // 验证同行密集命中（第5行“▲戴安娜举着画，画上画着一个生日蛋糕。”）已合并为单条最具体的“生日蛋糕”，且 ID 为确定性坐标格式
  const line5Hits = searchRes.candidates.filter((c: any) => c.lineNumber === 5);
  assert.equal(line5Hits.length, 1);
  assert.equal(line5Hits[0].matchedTerm, '生日蛋糕');

  // 排除第2行（第8集铁链门画）、第6行（妈妈亲手做的蛋糕）、第10行（小玛莉买真正的生日蛋糕）、第13行（第30集画室）
  const ep17And18Valid = searchRes.candidates.filter(
    (c: any) => [4, 5, 8, 9, 11].includes(c.lineNumber)
  );
  assert.equal(ep17And18Valid.length, 5);
  assert.ok(ep17And18Valid.every((c: any) => /^cand_L\d+_\d+$/.test(c.candidateId)));

  // Round 2A: 提交时故意少传“蛋糕”一词，使用 candidateId 提交，验证不会发生下标漂移把“第三十集（画室）”或“小玛莉台词”误算入内
  const commitRes = executeProjectAssetMutation('asset.commitProvenance', {
    id: 'prop_cake_drawing',
    aliases: ['画（生日蛋糕）', '生日蛋糕', '画'],
    verifiedCandidateIds: ep17And18Valid.map((c: any) => c.candidateId),
  }, cakeProj);

  assert.equal(commitRes.output.success, true);
  assert.equal(commitRes.output.verifiedCount, 5);
  assert.deepEqual(commitRes.output.sourceScenes, ['第十七集', '第十八集']);

  // Round 2B: 即使模型按旧习惯传了 cand_<序号> 且同时删减了 aliases（去掉了“蛋糕”），快照缓存也能保证序号绝不漂移到第三十集
  const validOrdinalIds = searchRes.candidates
    .map((c: any, idx: number) => ([4, 5, 8, 9, 11].includes(c.lineNumber) ? `cand_${idx}` : null))
    .filter(Boolean);
  const commitOrdinalRes = executeProjectAssetMutation('asset.commitProvenance', {
    id: 'prop_cake_drawing',
    aliases: ['画（生日蛋糕）', '生日蛋糕', '画'],
    verifiedCandidateIds: validOrdinalIds,
  }, cakeProj);

  assert.equal(commitOrdinalRes.output.success, true);
  assert.equal(commitOrdinalRes.output.verifiedCount, 5);
  assert.deepEqual(commitOrdinalRes.output.sourceScenes, ['第十七集', '第十八集']);
});

test('资产识别描述（description）与多版本二级列表（versions）测试：日夜景场景拆分、角色多服装版本与单条目消歧保护', () => {
  let multiProj: ProjectData = {
    id: 'p_multi',
    scriptText: [
      '第1集 日 内 伯爵大厅',
      '▲阳光透过落地窗洒满伯爵大厅，戴安娜穿着白色蕾丝常服跑过。',
      '第5集 夜 内 伯爵大厅',
      '▲深夜的伯爵大厅烛火摇曳，戴安娜换上粉色睡衣站在楼梯口。',
    ].join('\n'),
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 创建带显式 versions 二级列表的角色（不同服装区分版本）
  const createCharRes = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '戴安娜',
    description: '第1集首现 · 伯爵幼女、娜塔莉亚妹妹，按常服与睡衣区分版本',
    role: '伯爵幼女',
    appearance: '金发小女孩',
    versions: [
      {
        id: 'ver_diana_day',
        name: '白色蕾丝常服版',
        description: '第1集日景首现 · 白色蕾丝连衣裙常服造型',
        appearance: '身穿白色蕾丝连衣裙，头戴蓝色发箍',
      },
      {
        id: 'ver_diana_night',
        name: '粉色睡衣版',
        description: '第5集夜景首现 · 夜间卧室与走廊粉色睡衣造型',
        appearance: '身穿宽松粉色丝绸睡衣，散发明亮金发',
      },
    ],
  }, multiProj);

  multiProj = { ...multiProj, ...createCharRes.updatedProject };
  assert.equal(multiProj.characters.length, 1);
  assert.equal(multiProj.characters[0].versions.length, 2);
  assert.equal(
    getAssetIdentificationText('character', multiProj.characters[0]),
    '第1集首现 · 伯爵幼女、娜塔莉亚妹妹，按常服与睡衣区分版本'
  );
  assert.equal(
    getVersionIdentificationText('character', multiProj.characters[0].versions[0]),
    '第1集日景首现 · 白色蕾丝连衣裙常服造型'
  );

  // 2. 批量创建场景的日景版与夜景版（同名带括号后缀），自动聚合为单个多版本资产（二级列表），且保护独立带括号的道具“画（生日蛋糕）”不被误拆
  const createLocsRes = executeProjectAssetMutation('asset.create', {
    type: 'locations',
    items: [
      {
        id: 'loc_hall_day',
        name: '伯爵大厅（日景）',
        description: '第1集首现 · 阳光穿透高耸落地窗的日间大厅',
        locationType: 'INT',
        timeOfDay: '日景',
        atmosphere: '明亮通透',
      },
      {
        id: 'loc_hall_night',
        name: '伯爵大厅（夜景）',
        description: '第5集首现 · 烛火摇曳幽暗压抑的夜间大厅',
        locationType: 'INT',
        timeOfDay: '夜景',
        atmosphere: '幽暗深邃',
      },
    ],
  }, multiProj);
  multiProj = { ...multiProj, ...createLocsRes.updatedProject };
  assert.equal(multiProj.locations.length, 1);
  assert.equal(multiProj.locations[0].name, '伯爵大厅');
  assert.equal(multiProj.locations[0].versions.length, 2);
  assert.equal(multiProj.locations[0].versions[0].name, '日景');
  assert.equal(multiProj.locations[0].versions[1].name, '夜景');

  // 单条目带括号消歧名称“画（生日蛋糕）”必须保持单层，不得拆成“画”+“生日蛋糕”版本
  const createSingleProp = executeProjectAssetMutation('asset.create', {
    type: 'props',
    name: '画（生日蛋糕）',
    description: '第17集17-1首现 · 戴安娜画给爸爸的生日蛋糕画作，区别于第8集铁链门画',
    owner: '戴安娜',
    materialAndState: '画着生日蛋糕的儿童画',
  }, multiProj);
  multiProj = { ...multiProj, ...createSingleProp.updatedProject };
  assert.equal(multiProj.props.length, 1);
  assert.equal(multiProj.props[0].name, '画（生日蛋糕）');
  assert.equal(multiProj.props[0].versions, undefined);
  assert.equal(
    getAssetIdentificationText('prop', multiProj.props[0]),
    '第17集17-1首现 · 戴安娜画给爸爸的生日蛋糕画作，区别于第8集铁链门画'
  );

  // 3. 针对二级版本（loc_hall_night 夜景版）直接执行出处检索与核验提交
  const verSearch = executeProjectReadTool('asset.searchProvenanceCandidates', {
    id: 'loc_hall_night',
  }, multiProj) as any;
  assert.equal(verSearch.assetName, '伯爵大厅（夜景）');
  assert.equal(verSearch.totalCandidates, 4);

  const nightCandidate = verSearch.candidates.find((c: any) => c.sceneTitle.includes('第5集'));
  assert.ok(nightCandidate);

  const verCommit = executeProjectAssetMutation('asset.commitProvenance', {
    id: 'loc_hall_night',
    verifiedCandidateIds: [nightCandidate.candidateId],
  }, multiProj);
  assert.equal(verCommit.output.success, true);
  multiProj = { ...multiProj, ...verCommit.updatedProject };
  assert.equal(multiProj.locations[0].versions[1].provenanceStatus, 'verified');
  assert.deepEqual(multiProj.locations[0].versions[1].sourceScenes, ['第5集 夜 内 伯爵大厅']);

  // 4. 修改与删除二级版本
  const updateVerRes = executeProjectAssetMutation('asset.update', {
    id: 'ver_diana_night',
    description: '第5集夜景首现 · 粉色丝绸睡衣配毛绒拖鞋',
  }, multiProj);
  multiProj = { ...multiProj, ...updateVerRes.updatedProject };
  assert.equal(
    multiProj.characters[0].versions[1].description,
    '第5集夜景首现 · 粉色丝绸睡衣配毛绒拖鞋'
  );

  const deleteVerRes = executeProjectAssetMutation('asset.delete', {
    id: 'ver_diana_night',
  }, multiProj);
  multiProj = { ...multiProj, ...deleteVerRes.updatedProject };
  assert.equal(multiProj.characters[0].versions.length, 1);
  assert.equal(multiProj.characters[0].versions[0].id, 'ver_diana_day');

  // 5. 道具版本功能测试：向无版本的独立道具“画（生日蛋糕）”通过 parentId 追加“破损态”版本
  const addPropVersionRes = executeProjectAssetMutation('asset.create', {
    type: 'props',
    parentId: multiProj.props[0].id,
    name: '破损态',
    description: '第24集首现 · 画角被撕碎且沾有雨水的破损状态',
  }, multiProj);
  multiProj = { ...multiProj, ...addPropVersionRes.updatedProject };
  assert.equal(multiProj.props.length, 1);
  assert.equal(multiProj.props[0].versions.length, 2);
  assert.equal(multiProj.props[0].versions[0].name, '初始态');
  assert.equal(multiProj.props[0].versions[1].name, '破损态');
  assert.equal(
    getVersionIdentificationText('prop', multiProj.props[0].versions[1]),
    '第24集首现 · 画角被撕碎且沾有雨水的破损状态'
  );
});

test('阅读即锚定与具体内容高亮测试：支持代词指代原句锚定、自动排除人物表名单行并整句高亮具体剧情描写', () => {
  const bramScript = [
    '第一集',
    '1-1 夜 内 宴会厅',
    '人物 布拉姆 宾客若干',
    '▲布拉姆身着剪裁考究的华丽西装礼服站在水晶灯下。',
    '第十三集',
    '13-1 夜 内 地下室',
    '人物 娜塔莉亚 布拉姆 安保若干',
    '▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。',
    '▲他换上一身深蓝色丝绸睡衣，慢条斯理地晃动着手中的红酒杯。',
    '娜塔莉亚OS：布拉姆并不相信我们的说辞，掩饰不如直接承认一部分！',
  ].join('\n');

  let bramProj: ProjectData = {
    id: 'p_bram',
    scriptText: bramScript,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 阅读即锚定：创建“布拉姆”及多版本时，直接传入 provenances 原句（其中睡衣版原句使用代词“他”，不含“布拉姆”三字）
  const createBram = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '布拉姆',
    description: '第1集首现 · 反派/宅邸主人，含华丽西装与睡衣版本',
    versions: [
      {
        id: 'ver_bram_suit',
        name: '华丽西装/礼服',
        description: '第一集首现 · 宴会厅西装礼服造型',
        provenances: [
          { sceneTitle: '第一集', evidenceText: '▲布拉姆身着剪裁考究的华丽西装礼服站在水晶灯下。' },
        ],
      },
      {
        id: 'ver_bram_pajamas',
        name: '睡衣',
        description: '第十三集首现 · 地下室深蓝色丝绸睡衣造型',
        provenances: [
          // 原文仅用代词“他”指代，不含“布拉姆”关键词，直接通过原句锚定
          '▲他换上一身深蓝色丝绸睡衣，慢条斯理地晃动着手中的红酒杯。',
        ],
      },
    ],
  }, bramProj);

  bramProj = { ...bramProj, ...createBram.updatedProject };
  const pajamasVer = bramProj.characters[0].versions[1];
  assert.equal(pajamasVer.provenanceStatus, 'verified');
  assert.equal(pajamasVer.verifiedProvenance.length, 1);

  // 解析“睡衣”版本的出处：高亮文本必须是具体的穿睡衣动作描写整句，绝非“人物 娜塔莉亚 布拉姆”
  const resolvedPajamas = resolveVerifiedProvenance(bramScript, undefined, pajamasVer.verifiedProvenance);
  assert.equal(resolvedPajamas.length, 1);
  assert.equal(
    resolvedPajamas[0].highlightText,
    '▲他换上一身深蓝色丝绸睡衣，慢条斯理地晃动着手中的红酒杯。'
  );
  assert.equal(
    bramScript.slice(
      resolvedPajamas[0].highlightCharIndex!,
      resolvedPajamas[0].highlightCharIndex! + resolvedPajamas[0].highlightText!.length
    ),
    '▲他换上一身深蓝色丝绸睡衣，慢条斯理地晃动着手中的红酒杯。'
  );

  // 2. 检索候选时自动过滤顶部的“人物 娜塔莉亚 布拉姆 安保若干”名单行
  const searchBram = executeProjectReadTool('asset.searchProvenanceCandidates', {
    id: bramProj.characters[0].id,
  }, bramProj) as any;
  const hasRosterLineCandidate = searchBram.candidates.some((c: any) =>
    c.evidenceText?.startsWith('人物 ')
  );
  assert.equal(hasRosterLineCandidate, false);

  // 3. 兼容旧数据保护：即便历史已保存的 verifiedProvenance 锚点落在了“人物 娜塔莉亚 布拉姆 安保若干”名单行上，
  // resolveVerifiedProvenance 也会自动将其升级到该场第一句具体动作描写行进行整句高亮
  const rosterIndex = bramScript.indexOf('布拉姆 安保若干');
  const legacyRosterAnchor = [
    {
      id: 'legacy_vp_1',
      sceneTitle: '第十三集',
      matchedTerm: '布拉姆',
      anchorText: bramScript.slice(rosterIndex - 6, rosterIndex + 9),
      offsetInAnchor: 6,
      fallbackCharIndex: rosterIndex,
    },
  ];
  const upgradedResolved = resolveVerifiedProvenance(bramScript, undefined, legacyRosterAnchor);
  assert.equal(upgradedResolved.length, 1);
  assert.equal(
    upgradedResolved[0].highlightText,
    '▲布拉姆审视着娜塔莉亚的表情，娜塔莉亚看着安保人员端着的枪，忍不住紧张。'
  );
});

test('集-场二级目录解析与多场次出处智能折叠及多处同时高亮测试（如第22集 22—1 与 22-2）', () => {
  const ep22Script = [
    '第二十二集',
    '22—1日 内 布拉姆房间',
    '人物 塞莱特斯 宾客若干 莱恩 伊丽莎白 布拉姆 娜塔莉亚',
    '▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。',
    '塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）',
    '▲娜塔莉亚对视塞莱特斯摇了摇头。',
    '【闪回】',
    '22-2',
    '日 内 布拉姆房间',
    '人物 布拉姆 娜塔莉亚',
    '▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。',
    '▲突然，外面传来了敲门声。',
  ].join('\n');

  const ep22Proj: ProjectData = {
    id: 'p_ep22',
    scriptText: ep22Script,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 验证 script.directory 返回集-场二级结构，准确识别同行场次头(22—1)与跨行场次头(22-2 + 日 内 布拉姆房间)及人物表
  const dirRes = executeProjectReadTool('script.directory', {}, ep22Proj) as any;
  assert.equal(dirRes.total, 1);
  assert.equal(dirRes.entries[0].title, '第二十二集');
  assert.equal(dirRes.entries[0].sceneCount, 2);
  assert.equal(dirRes.entries[0].scenes[0].sceneNumber, '22-1');
  assert.equal(dirRes.entries[0].scenes[0].timeOfDay, '日');
  assert.equal(dirRes.entries[0].scenes[0].type, 'INT');
  assert.equal(dirRes.entries[0].scenes[0].locationName, '布拉姆房间');
  assert.ok(dirRes.entries[0].scenes[0].characterNames.includes('布拉姆'));
  assert.equal(dirRes.entries[0].scenes[1].sceneNumber, '22-2');
  assert.equal(dirRes.entries[0].scenes[1].timeOfDay, '日');
  assert.equal(dirRes.entries[0].scenes[1].type, 'INT');
  assert.equal(dirRes.entries[0].scenes[1].locationName, '布拉姆房间');

  // 2. 验证仅在 22—1 出场的“塞莱特斯”不会折叠为“二十二集”，而是精准展示为“22-1”
  const createCeleste = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '塞莱特斯',
    provenances: ['塞莱特斯（惊讶）：怎么会这样？（Wait... what is this?）'],
  }, ep22Proj);
  const celesteChar = createCeleste.updatedProject.characters[0];
  const resolvedCeleste = resolveVerifiedProvenance(ep22Script, undefined, celesteChar.verifiedProvenance, {
    assetName: '塞莱特斯',
  });
  assert.equal(resolvedCeleste.length, 1);
  assert.equal(resolvedCeleste[0].type, 'scene');
  assert.equal(resolvedCeleste[0].displayLabel, '22-1');

  // 3. 验证在 22—1 与 22-2 均由 Agent 提交出场的“布拉姆”自动折叠为“二十二集”，且 highlights 严格聚合 Agent 提交的两处出场内容
  const createBram = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '布拉姆',
    provenances: [
      { sceneTitle: '22—1', evidenceText: '▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。' },
      { sceneTitle: '22-2', evidenceText: '▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。' },
    ],
  }, ep22Proj);
  const bramChar = createBram.updatedProject.characters[0];
  const resolvedBram = resolveVerifiedProvenance(ep22Script, undefined, bramChar.verifiedProvenance, {
    assetName: '布拉姆',
  });
  assert.equal(resolvedBram.length, 1);
  assert.equal(resolvedBram[0].type, 'episode');
  assert.equal(resolvedBram[0].displayLabel, '二十二集');
  assert.equal(resolvedBram[0].isFullEpisode, true);
  assert.ok(Array.isArray(resolvedBram[0].highlights));
  assert.equal(resolvedBram[0].highlights!.length, 2);
  assert.equal(
    resolvedBram[0].highlights![0].text,
    '▲众人齐刷刷地看着屋内，只见布拉姆穿着衬衣站在屋内，娜塔莉亚拿着戴安娜的分析报告站在屋内。'
  );
  assert.equal(
    resolvedBram[0].highlights![1].text,
    '▲布拉姆一把捏住了娜塔莉亚的下巴，准备吻上去。'
  );
});

test('出处防误判与严格锚点还原：Agent提交3处出处时界面绝不擅自搜词扩充为10处，且不包含未锚定场次', () => {
  const ep1Script = [
    '第一集',
    '1-1',
    '日 外 布莱克伍德庄园',
    '人物 娜塔莉亚 布拉姆 管家 塞莱特斯',
    '▲庄园的门被打开，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。',
    '▲布拉姆冷冷地扫视全场应聘者。',
    '▲布拉姆收起枪打量娜塔莉亚。',
    '布拉姆：哦？你就不怕沦为野兽的口粮吗？',
    '▲娜塔莉亚缓缓抬头看向布拉姆。',
    '布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。',
    '▲布拉姆起身离开座位，管家跟在布拉姆身后。',
    '1-5',
    '日 内 娜塔莉亚家',
    '人物 娜塔莉亚 焦恩',
    '▲娜塔莉亚在收拾皮包，将衣物放进去。',
    '焦恩（摁住娜塔莉亚的肩膀）：娜塔莉亚，布拉姆是一个手段狠辣的教父，布莱克伍德庄园守卫森严，（打量娜塔莉亚，担心）而是你只是个刚刚毕业的心理医生，你太柔弱了，斗不过他的！【字幕：焦恩 娜塔莉亚养父】',
    '娜塔莉亚：爸爸，我必须去。',
  ].join('\n');

  let ep1Proj: ProjectData = {
    id: 'p_ep1',
    scriptText: ep1Script,
    characters: [],
    locations: [],
    props: [],
  };

  // Agent 仅提交 3 处出处
  const createRes = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '布拉姆',
    role: '布莱克伍德家主 / 教父',
    provenances: [
      {
        sceneTitle: '1-1',
        evidenceText: '▲庄园的门被打开，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。',
      },
      {
        sceneTitle: '1-1',
        evidenceText: '布拉姆：哦？你就不怕沦为野兽的口粮吗？',
      },
      {
        sceneTitle: '1-1',
        evidenceText: '布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。',
      },
    ],
  }, ep1Proj);

  ep1Proj = { ...ep1Proj, ...createRes.updatedProject };
  const bramAsset = ep1Proj.characters[0];
  assert.equal(bramAsset.verifiedProvenance.length, 3);

  // 1. 验证检索工具正常工作：全文客观检出词频命中候选（包含 1-1 与 1-5 处命中）
  const searchCandidates = executeProjectReadTool('asset.searchProvenanceCandidates', {
    id: bramAsset.id,
  }, ep1Proj) as any;
  const candScenes = searchCandidates.candidates.map((c: any) => c.sceneTitle);
  assert.ok(candScenes.some((s: string) => s.includes('1-1')));
  assert.ok(candScenes.some((s: string) => s.includes('1-5')));

  // 2. 验证出处解析与展示：Agent 提交了 3 个出处，resolveVerifiedProvenance 必须严格只返回这 3 个高亮（绝不自动搜词扩充成 7~10 个，也绝不包含 1-5 场）
  const resolved = resolveVerifiedProvenance(ep1Script, undefined, bramAsset.verifiedProvenance, {
    assetName: '布拉姆',
  });
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].displayLabel, '1-1');
  assert.equal(resolved[0].highlights?.length, 3, '高亮数量必须严格等于 Agent 提交的 3 处，严禁脚本自行搜词扩充');
  const allHighlightedTexts = (resolved[0].highlights || []).map(h => h.text);
  assert.deepEqual(allHighlightedTexts, [
    '▲庄园的门被打开，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。',
    '布拉姆：哦？你就不怕沦为野兽的口粮吗？',
    '布拉姆（打量）：你的长相，（指尖掠过娜塔莉亚的脸颊）让我想起了一位故人。',
  ]);
});

test('asset.commitProvenance 跨集增量补充与重设测试：补充第二集出处时默认保留第一集出处，显式传 mode="overwrite" 时才全量替换', () => {
  const multiEpScript = [
    '第一集',
    '1-5',
    '日 外 布莱克伍德庄园',
    '人物 娜塔莉亚 布拉姆 管家 塞莱特斯',
    '▲庄园的门被打开，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。',
    '布拉姆：哦？你就不怕沦为野兽的口粮吗？',
    '第二集',
    '2-1',
    '日 外 布莱克伍德庄园',
    '人物 娜塔莉亚 布拉姆 塞莱特斯 戴安娜',
    '▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。',
    '▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。',
    '▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。',
  ].join('\n');

  let proj: ProjectData = {
    id: 'p_multi_ep',
    scriptText: multiEpScript,
    characters: [],
    locations: [],
    props: [],
  };

  // 第一步：提取第一集出处（2处）
  const createRes = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '布拉姆',
    role: '布莱克伍德家主 / 教父',
    provenances: [
      { sceneTitle: '1-5', evidenceText: '▲庄园的门被打开，打量着坐在主位的男人【布莱克伍德家主：布拉姆】，布拉姆衣着华丽，随意把玩着手中的手枪。' },
      { sceneTitle: '1-5', evidenceText: '布拉姆：哦？你就不怕沦为野兽的口粮吗？' },
    ],
  }, proj);
  proj = { ...proj, ...createRes.updatedProject };
  const bramId = proj.characters[0].id;
  assert.equal(proj.characters[0].verifiedProvenance.length, 2);

  // 第二步：调用 asset.commitProvenance 补充第二集出处（3处），不传 mode（默认 append）
  const commitEp2 = executeProjectAssetMutation('asset.commitProvenance', {
    id: bramId,
    type: 'characters',
    provenances: [
      { sceneTitle: '第二集 2-1', evidenceText: '▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。' },
      { sceneTitle: '第二集 2-1', evidenceText: '▲布拉姆一下子站了起来，佣人们齐刷刷地低下头去，他冷眼看着塞莱特斯。' },
      { sceneTitle: '第二集 2-1', evidenceText: '▲娜塔莉亚被打得侧着脸，布拉姆立刻拦住了塞莱特斯。' },
    ],
    summary: '补充第二集2-1布莱克伍德庄园中布拉姆的出场出处',
  }, proj);
  proj = { ...proj, ...commitEp2.updatedProject };

  const updatedBram = proj.characters[0];
  assert.equal((commitEp2.output as any).mode, 'append');
  assert.equal((commitEp2.output as any).submittedCount, 3);
  assert.equal(updatedBram.verifiedProvenance.length, 5, '第一集2处 + 第二集3处，共应保留5处出处');
  assert.ok(updatedBram.sourceScenes.some((s: string) => s.includes('1-5')), '必须保留第一集场次');
  assert.ok(updatedBram.sourceScenes.some((s: string) => s.includes('2-1')), '必须包含第二集场次');

  // 第三步：若显式传入 mode: "overwrite"，则仅保留本次提交的锚点
  const overwriteRes = executeProjectAssetMutation('asset.commitProvenance', {
    id: bramId,
    type: 'characters',
    mode: 'overwrite',
    provenances: [
      { sceneTitle: '第二集 2-1', evidenceText: '▲布拉姆看到塞莱特斯，眼神平静又带着几分冷漠。' },
    ],
  }, proj);
  proj = { ...proj, ...overwriteRes.updatedProject };
  assert.equal((overwriteRes.output as any).mode, 'overwrite');
  assert.equal(proj.characters[0].verifiedProvenance.length, 1);
});

test('refreshTaskCardContext：asset.create / asset.update 后动态刷新聚焦目标数量与属性摘要', () => {
  let proj: ProjectData = {
    id: 'p_refresh_ctx',
    scriptText: '第一集\n1-5 日 内 布莱克伍德庄园\n▲布拉姆坐在主位。',
    characters: [],
    locations: [],
    props: [],
  };

  let panelCardContext: Record<string, any> | undefined = {
    targetId: 'assets.panel',
    title: '资产清单面板',
    markdownSummary: [
      '【当前聚焦目标：资产清单面板 (assets.panel)】',
      '- 角色数量: 0',
      '- 场景数量: 0',
      '- 道具数量: 0',
    ].join('\n'),
  };

  const createRes = executeProjectAssetMutation('asset.create', {
    type: 'characters',
    name: '布拉姆',
    description: '布莱克伍德家族家主',
  }, proj);
  proj = { ...proj, ...createRes.updatedProject };

  panelCardContext = refreshTaskCardContext(panelCardContext, proj as any);
  assert.ok(panelCardContext?.markdownSummary.includes('- 角色数量: 1'), 'asset.create 后应同步刷新角色数量为 1');
  assert.ok(panelCardContext?.markdownSummary.includes('- 场景数量: 0'));
  assert.ok(panelCardContext?.markdownSummary.includes('- 道具数量: 0'));

  const bramId = proj.characters[0].id;
  let itemCardContext: Record<string, any> | undefined = refreshTaskCardContext(
    { targetId: `assets.item.character.${bramId}` },
    proj as any
  );
  assert.ok(itemCardContext?.markdownSummary.includes('- 角色名: 布拉姆'));
  assert.ok(itemCardContext?.markdownSummary.includes('- 资产识别描述: 布莱克伍德家族家主'));

  const updateRes = executeProjectAssetMutation('asset.update', {
    id: bramId,
    type: 'characters',
    description: '布莱克伍德家族家主，娜塔莉亚的教父',
  }, proj);
  proj = { ...proj, ...updateRes.updatedProject };

  itemCardContext = refreshTaskCardContext(itemCardContext, proj as any);
  assert.ok(itemCardContext?.markdownSummary.includes('娜塔莉亚的教父'), 'asset.update 后应同步刷新聚焦资产描述');
});

test('script.read 集数-场次-段落三层结构化输出与按换行划分段落标准测试', () => {
  const nataliaScript = [
    '第一集',
    '1-1 日 内 黑暗房间',
    '人物 玛莉',
    '▲黑暗的房间里，玛莉缩在墙角写信。',
    '玛莉OS：娜塔莉亚，千万别来这里！',
    '1-2',
    '日 内 医院办公室',
    '人物 娜塔莉亚 焦恩',
    '▲医院办公室里，娜塔莉亚死死握着姐姐寄来的书信，眼泪落在照片上。',
    '娜塔莉亚（悲痛）：姐姐，我一定会查明真相！',
    '焦恩（担心）：娜塔莉亚，那里太危险了。',
    '第二集',
    '2-1 夜 外 庄园大门',
    '人物 娜塔莉亚 管家',
    '▲娜塔莉亚撑着黑伞站在暴雨中的庄园大门前。',
  ].join('\n');

  const natProj: ProjectData = {
    id: 'p_natalia_3tier',
    scriptText: nataliaScript,
    characters: [
      {
        id: 'char_bram',
        name: '布拉姆',
        role: '庄园家主',
        description: '第一集首现 · 审视娜塔莉亚的庄园家主',
      },
    ],
    locations: [],
    props: [],
  };

  // 1. script.directory 场次摘要包含 paragraphCount 与 paragraphs
  const dirRes = executeProjectReadTool('script.directory', {}, natProj) as any;
  assert.equal(dirRes.total, 2);
  assert.equal(dirRes.entries[0].sceneCount, 2);
  assert.equal(dirRes.entries[0].scenes[0].sceneNumber, '1-1');
  assert.equal(dirRes.entries[0].scenes[0].paragraphCount, 2, '1-1 除去场次头和人物表后应有 2 个正文段落');
  assert.equal(dirRes.entries[0].scenes[1].sceneNumber, '1-2');
  assert.equal(dirRes.entries[0].scenes[1].paragraphCount, 3, '1-2 除去跨行场次头和人物表后应有 3 个正文段落');

  // 2. script.read 按 episode=1 读取，返回 集 -> 场 -> 段落 三层结构（场次头与人物表已收敛到场次属性）
  const readEp1 = executeProjectReadTool('script.read', { episode: 1 }, natProj) as any;
  assert.equal(readEp1.episodeCount, 1);
  assert.equal(readEp1.sceneCount, 2);
  assert.equal(readEp1.paragraphCount, 5);
  const ep1 = readEp1.episodes[0];
  assert.equal(ep1.title, '第一集');
  assert.equal(ep1.scenes.length, 2);
  assert.equal(ep1.scenes[0].sceneNumber, '1-1');
  assert.deepEqual(
    ep1.scenes[0].paragraphs.map((p: any) => ({ index: p.index, text: p.text })),
    [
      { index: 1, text: '▲黑暗的房间里，玛莉缩在墙角写信。' },
      { index: 2, text: '玛莉OS：娜塔莉亚，千万别来这里！' },
    ]
  );
  assert.equal(ep1.scenes[1].sceneNumber, '1-2');
  assert.deepEqual(
    ep1.scenes[1].paragraphs.map((p: any) => ({ index: p.index, text: p.text })),
    [
      { index: 1, text: '▲医院办公室里，娜塔莉亚死死握着姐姐寄来的书信，眼泪落在照片上。' },
      { index: 2, text: '娜塔莉亚（悲痛）：姐姐，我一定会查明真相！' },
      { index: 3, text: '焦恩（担心）：娜塔莉亚，那里太危险了。' },
    ]
  );

  // 3. script.read 支持直接按 scene="1-2" 与 paragraph=1 精确定位单段
  const readScene12Para1 = executeProjectReadTool('script.read', { scene: '1-2', paragraph: 1 }, natProj) as any;
  assert.equal(readScene12Para1.sceneCount, 1);
  assert.equal(readScene12Para1.paragraphCount, 1);
  assert.equal(
    readScene12Para1.episodes[0].scenes[0].paragraphs[0].text,
    '▲医院办公室里，娜塔莉亚死死握着姐姐寄来的书信，眼泪落在照片上。'
  );

  // 4. asset.list 的 query 仅匹配资产主标识（name/role/aliases），不会因为布拉姆 description 提及“娜塔莉亚”而误命中
  const searchNataliaAsset = executeProjectReadTool('asset.list', { type: 'characters', query: '娜塔莉亚' }, natProj) as any;
  assert.equal(searchNataliaAsset.total, 0);
  const searchBramAsset = executeProjectReadTool('asset.list', { type: 'characters', query: '布拉姆' }, natProj) as any;
  assert.equal(searchBramAsset.total, 1);
});

test('短剧多项数据自适应分步操作与数据量预警机制测试：script.search 与 script.read 跨场次高密度预警', () => {
  // 构建一个跨 3 个场次、包含 18 处“娜塔莉亚”与 28 个段落的短剧剧本
  const multiSceneScript = [
    '第一集',
    '1-1 夜 内 储藏室',
    '▲黑暗中，玛莉急促呼吸。',
    '玛莉：娜塔莉亚，你在哪？',
    '▲娜塔莉亚推开铁门，快步走入。',
    '娜塔莉亚：我在这里，玛莉。',
    '玛莉：娜塔莉亚，你看这个盒子。',
    '娜塔莉亚：这是母亲留下的。',
    '1-2 日 内 客厅',
    '▲阳光洒在客厅地毯上，娜塔莉亚端着茶杯沉思。',
    '管家：娜塔莉亚小姐，霍克先生来了。',
    '霍克：娜塔莉亚，好久不见。',
    '娜塔莉亚：霍克叔叔，请坐。',
    '霍克：听说你在找布拉姆？',
    '娜塔莉亚（警惕）：布拉姆是我的管家。',
    '霍克：娜塔莉亚，你不知道他的过去。',
    '娜塔莉亚：无论他过去是谁，他现在效忠于我。',
    '1-3 夜 外 庄园后山',
    '▲暴雨倾盆，娜塔莉亚撑着黑伞站在泥泞中。',
    '▲布拉姆一身黑衣，从树林中走出。',
    '布拉姆：小姐，这里危险。',
    '娜塔莉亚：布拉姆，你隐瞒了我什么？',
    '布拉姆：我只为保护娜塔莉亚小姐。',
    '娜塔莉亚：保护我？还是监视我？',
    '布拉姆：小姐以后自会明白。',
    '▲娜塔莉亚转身离去，风雨交加。',
    '▲布拉姆注视着娜塔莉亚的背影，眼神复杂。',
    '娜塔莉亚OS：我一定会查清一切。',
  ].join('\n');

  const testProj: ProjectData = {
    id: 'p_multiscene',
    scriptText: multiSceneScript,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 搜索第一集“娜塔莉亚”：共命中 19 次，跨 3 个场次，应当触发 hasVolumeWarning: true 并返回 scenesSummary
  const searchResult = executeProjectReadTool('script.search', { query: '娜塔莉亚', episode: '第一集' }, testProj) as any;
  assert.equal(searchResult.total, 19);
  assert.equal(searchResult.hasVolumeWarning, true);
  assert.ok(typeof (searchResult.notice || searchResult.warning) === 'string' && (searchResult.notice || searchResult.warning).includes('3 个场次'));
  assert.equal(searchResult.scenesSummary.length, 3);
  assert.equal(searchResult.scenesSummary[0].sceneNumber, '1-1');
  assert.equal(searchResult.scenesSummary[0].matchCount, 5);
  assert.equal(searchResult.scenesSummary[1].sceneNumber, '1-2');
  assert.equal(searchResult.scenesSummary[1].matchCount, 7);
  assert.equal(searchResult.scenesSummary[2].sceneNumber, '1-3');
  assert.equal(searchResult.scenesSummary[2].matchCount, 7);

  // 2. 局部单场搜索“娜塔莉亚”（指定 episode: "第一集", scene: "1-1"）：仅 5 处命中，不应触发预警
  const scopedSearchResult = executeProjectReadTool('script.search', { query: '娜塔莉亚', episode: '第一集', scene: '1-1' }, testProj) as any;
  assert.equal(scopedSearchResult.total, 5);
  assert.equal(scopedSearchResult.hasVolumeWarning, false);
  assert.equal(scopedSearchResult.scenesSummary.length, 1);
  assert.equal(scopedSearchResult.scenesSummary[0].sceneNumber, '1-1');

  // 3. 全局读取剧本：总计 24 个段落跨 3 场，触发 hasVolumeWarning: true 与场景分布概览
  const readResult = executeProjectReadTool('script.read', {}, testProj) as any;
  assert.equal(readResult.paragraphCount, 24); // 非空段落总数
  assert.equal(readResult.hasVolumeWarning, true);
  assert.ok(typeof (readResult.notice || readResult.warning) === 'string' && (readResult.notice || readResult.warning).includes('24 个段落'));
  assert.equal(readResult.scenesSummary.length, 3);

  // 4. 按单场读取（scene: "1-1"）：不触发大体积预警
  const scopedReadResult = executeProjectReadTool('script.read', { scene: '1-1' }, testProj) as any;
  assert.equal(scopedReadResult.hasVolumeWarning, false);
});

test('多场次自适应分步机制与版本追加保护：script.directory 数据量预警、歧义场次多场预警与 asset.update 版本增量合并', () => {
  const multiSceneScript = [
    '第一集',
    '1-1 日 内 储藏室',
    '▲阳光斜照。',
    '1-2 日 内 客厅',
    '▲沙发整洁。',
    '1-5 日 内 娜塔莉亚家',
    '▲娜塔莉亚坐在书桌前。',
    '娜塔莉亚：这是我的日记。',
    '1-5 夜 外 庄园',
    '▲暴雨倾盆。',
    '布拉姆：小姐，快回去。',
    '娜塔莉亚：我不走。',
  ].join('\n');

  const testProj: ProjectData = {
    id: 'p_test_multi',
    scriptText: multiSceneScript,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. script.directory 数据量预警
  const dirRes = executeProjectReadTool('script.directory', {}, testProj) as any;
  assert.equal(dirRes.hasVolumeWarning, true);
  assert.equal(dirRes.totalScenes, 4);
  assert.ok(Array.isArray(dirRes.scenesSummary) && dirRes.scenesSummary.length === 4);
  assert.ok((dirRes.notice || dirRes.warning).includes('4 个场次'));

  // 2. 歧义场次匹配（scene: "1-5" 匹配到 "1-5 日 内 娜塔莉亚家" 与 "1-5 夜 外 庄园" 两场）触发预警
  const ambigRead = executeProjectReadTool('script.read', { scene: '1-5' }, testProj) as any;
  assert.equal(ambigRead.hasVolumeWarning, true);
  assert.equal(ambigRead.sceneCount, 2);
  assert.ok((ambigRead.notice || ambigRead.warning).includes('匹配到 2 个场次'));

  // 3. asset.update 增量追加版本：已有“幼年形态”，传入“成年形态”，两者共存且已有出处不被清空
  const projWithChar: ProjectData = {
    ...testProj,
    characters: [
      {
        id: 'char_nat',
        name: '娜塔莉亚',
        role: '女主角',
        versions: [
          {
            id: 'ver_child',
            name: '幼年形态',
            description: '10岁的小女孩',
            verifiedProvenance: [
              { lineNumber: 7, text: '▲娜塔莉亚坐在书桌前。' } as any,
            ],
          },
        ],
      },
    ],
  };

  const updateRes = executeProjectAssetMutation(
    'asset.update',
    {
      id: 'char_nat',
      updates: {
        versions: [
          {
            name: '成年形态',
            description: '20岁的成熟千金',
            provenances: [
              { lineNumber: 12, evidenceText: '娜塔莉亚：我不走。' },
            ],
          },
        ],
      },
    },
    projWithChar
  );

  assert.equal(updateRes.output.success, true);
  const updatedChar = updateRes.updatedProject.characters[0];
  assert.equal(updatedChar.versions.length, 2);
  assert.equal(updatedChar.versions[0].name, '幼年形态');
  assert.equal(updatedChar.versions[0].description, '10岁的小女孩');
  assert.equal(updatedChar.versions[1].name, '成年形态');
  assert.equal(updatedChar.versions[1].description, '20岁的成熟千金');
});

test('段落序号 (paragraphIndices / paragraphIndex) 自动映射物理行号与原文出处测试', () => {
  const scriptText = [
    '【第1集】',
    '1-1 夜 内 宅邸',
    '人物 娜塔莉亚 布拉姆',
    '▲娜塔莉亚紧张地握紧了简历。',
    '娜塔莉亚OS：布莱克伍德家族，我来了。',
    '▲布拉姆冰冷地靠在讲台上，端着红酒杯。',
  ].join('\n');

  const project: ProjectData = {
    id: 'proj_para_test',
    scriptText,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 通过 paragraphIndices 直接创建资产出处
  const createRes = executeProjectAssetMutation(
    'asset.create',
    {
      type: 'characters',
      name: '娜塔莉亚',
      role: '女主角',
      provenances: [
        { sceneTitle: '1-1', paragraphIndices: [1, 2] },
      ],
    },
    project
  );

  assert.equal(createRes.output.success, true);
  const charItem = createRes.updatedProject.characters![0];
  assert.equal(charItem.provenanceStatus, 'verified');
  assert.equal(charItem.verifiedProvenance.length, 2);
  assert.equal(charItem.verifiedProvenance[0].lineNumber, 4);
  assert.equal(charItem.verifiedProvenance[0].evidenceText, '▲娜塔莉亚紧张地握紧了简历。');
  assert.equal(charItem.verifiedProvenance[1].lineNumber, 5);
  assert.equal(charItem.verifiedProvenance[1].evidenceText, '娜塔莉亚OS：布莱克伍德家族，我来了。');

  // 2. 通过 top-level paragraphIndices 提交出处锚点
  const updatedProject = { ...project, characters: createRes.updatedProject.characters! };
  const commitRes = executeProjectAssetMutation(
    'asset.commitProvenance',
    {
      id: charItem.id,
      sceneTitle: '1-1',
      paragraphIndices: [3],
    },
    updatedProject
  );

  assert.equal(commitRes.output.success, true);
  const updatedCharItem = commitRes.updatedProject.characters![0];
  assert.equal(updatedCharItem.verifiedProvenance.length, 3);
  assert.equal(updatedCharItem.verifiedProvenance[2].lineNumber, 6);
  assert.equal(updatedCharItem.verifiedProvenance[2].evidenceText, '▲布拉姆冰冷地靠在讲台上，端着红酒杯。');
});

test('跨行场次副标题匹配、同集重名场次(1-5内外景)隔离、跨集子串防误匹配(1-2 vs 21-2/31-2)与禁止全剧兜底污染回归测试', () => {
  const dramaScript = [
    '第一集',
    '1-1',
    '日 内 黑暗房间',
    '人物 玛莉',
    '▲黑暗的房间里，玛莉缩在墙角（此行物理行号为第5行）。',
    '玛莉：救命！',
    '1-2',
    '日 内 医院办公室',
    '人物 娜塔莉亚 院长',
    '▲医院的门被推开，院长看着手机上的信息。',
    '▲画面一转，娜塔莉亚穿着白大褂正在整理桌上的病历。',
    '院长：娜塔莉亚，你姐姐出事了。',
    '▲娜塔莉亚闻言一怔，手中的病历滑落。',
    '娜塔莉亚（震惊）：你说什么？！',
    '1-5',
    '日 内 娜塔莉亚家',
    '人物 娜塔莉亚 焦恩',
    '▲娜塔莉亚在收拾皮包。',
    '焦恩：太危险了。',
    '娜塔莉亚：我必须去。',
    '1-5',
    '日 外 布莱克伍德庄园',
    '人物 娜塔莉亚 布拉姆',
    '▲庄园大门缓缓打开。',
    '▲娜塔莉亚走进庄园大厅。',
    '布拉姆：欢迎来到庄园。',
    '第二十一集',
    '21-2',
    '夜 内 书房',
    '人物 布拉姆 莱恩',
    '▲书房内灯火通明。',
    '布拉姆：把文件拿过来。',
    '第三十一集',
    '31-2',
    '日 内 走廊',
    '人物 塞莱特斯',
    '▲塞莱特斯快步走过走廊。',
    '塞莱特斯：快走！',
  ].join('\n');

  let proj: ProjectData = {
    id: 'p_natalia_regression',
    scriptText: dramaScript,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 传入 script.directory / script.read 形态的完整标题（如 "1-2 日 内 医院办公室" 及两个不同的 "1-5 ..."），
  // 必须精准匹配各自场次，绝不触发全剧广播兜底，且两个 1-5 内外景场次互不串台
  const createRes = executeProjectAssetMutation(
    'asset.create',
    {
      type: 'characters',
      name: '娜塔莉亚',
      role: '女主角',
      provenances: [
        { sceneTitle: '1-2 日 内 医院办公室', paragraphIndices: [2, 4, 5] },
        { sceneTitle: '1-5 日 内 娜塔莉亚家', paragraphIndices: [1, 3] },
        { sceneTitle: '1-5 日 外 布莱克伍德庄园', paragraphIndices: [2] },
      ],
    },
    proj
  );

  proj = { ...proj, ...createRes.updatedProject };
  const natalia = proj.characters[0];
  assert.equal(natalia.verifiedProvenance.length, 6, '应仅精准提取 3+2+1=6 条出处，严禁全剧广播污染');
  assert.deepEqual(
    natalia.verifiedProvenance.map((vp: any) => vp.evidenceText),
    [
      '▲画面一转，娜塔莉亚穿着白大褂正在整理桌上的病历。',
      '▲娜塔莉亚闻言一怔，手中的病历滑落。',
      '娜塔莉亚（震惊）：你说什么？！',
      '▲娜塔莉亚在收拾皮包。',
      '娜塔莉亚：我必须去。',
      '▲娜塔莉亚走进庄园大厅。',
    ]
  );

  // 验证 1-1 第 5 行（玛莉的段落，物理行号=5，段落序号=1）绝不会被 paragraphIndices: [2, 4, 5] 中的 5 误命中
  assert.equal(
    natalia.verifiedProvenance.some((vp: any) => vp.evidenceText.includes('玛莉')),
    false
  );

  // 2. 传入短场次号 "1-2" 重设时，必须严格按数字边界匹配 1-2，绝不误命中 "21-2" 或 "31-2"
  const commitShortRes = executeProjectAssetMutation(
    'asset.commitProvenance',
    {
      id: natalia.id,
      mode: 'overwrite',
      sceneTitle: '1-2',
      paragraphIndices: [2, 4, 5],
    },
    proj
  );
  proj = { ...proj, ...commitShortRes.updatedProject };
  const afterShort = proj.characters[0];
  assert.equal(afterShort.verifiedProvenance.length, 3);
  assert.equal(
    afterShort.verifiedProvenance.some((vp: any) => vp.sceneTitle.includes('21-2') || vp.sceneTitle.includes('31-2')),
    false,
    '"1-2" 绝不能子串误匹配 "21-2" 或 "31-2"'
  );

  // 3. 传入不存在的场次名时，应返回 0 处匹配，绝不退化为全剧所有场次广播
  const commitInvalidScene = executeProjectAssetMutation(
    'asset.commitProvenance',
    {
      id: natalia.id,
      mode: 'overwrite',
      sceneTitle: '99-9 不存在的场次',
      paragraphIndices: [1, 2],
    },
    proj
  );
  assert.equal((commitInvalidScene.output as any).submittedCount, 0);
  assert.equal((commitInvalidScene.output as any).verifiedCount, 0);

  // 4. 传入内外景一字之差的 "1-5 日 内 布莱克伍德庄园"（原文为 "1-5 日 外 布莱克伍德庄园"）时，按地点核心词容错命中庄园场次
  const commitTypoScene = executeProjectAssetMutation(
    'asset.commitProvenance',
    {
      id: natalia.id,
      mode: 'overwrite',
      sceneTitle: '1-5 日 内 布莱克伍德庄园',
      paragraphIndices: [2, 3],
    },
    proj
  );
  assert.equal((commitTypoScene.output as any).verifiedCount, 2);

  // 5. script.read 传入连写无空格的 scene: "1-5布莱克伍德庄园" 能精准命中，且 content 仅包含该场次而非全剧
  const readConcatScene = executeProjectReadTool('script.read', { episode: '第一集', scene: '1-5布莱克伍德庄园' }, proj) as any;
  assert.equal(readConcatScene.sceneCount, 1);
  assert.equal(readConcatScene.episodes[0].scenes[0].locationName, '布莱克伍德庄园');
  assert.equal(readConcatScene.content.includes('第三十一集'), false, 'content 不应包含未命中的其它分集全文');

  // 6. provenances 传入拆分字段 { scene: "1-5", location: "娜塔莉亚家", paragraphs: [1, 3] } 时能自动组合地点精确命中
  const updateSplitSceneRes = executeProjectAssetMutation(
    'asset.update',
    {
      id: natalia.id,
      mode: 'overwrite',
      provenances: [{ scene: '1-5', location: '娜塔莉亚家', paragraphs: [1, 3] }],
    },
    proj
  );
  assert.equal((updateSplitSceneRes.output as any).verifiedCount, 2);
  proj = { ...proj, ...updateSplitSceneRes.updatedProject };

  // 7. 向原本无 versions 的单版本主资产通过 asset.update 追加单个变体版本（如 "小娜塔莉亚/8岁"）时，
  // 必须自动将原主资产转为初始版本 versions[0]（"常服"），确保 versions.length === 2 从而前端正常展示二级列表；
  // 后续对主资产调用 asset.update 追加成年场次出处时，同步更新 versions[0] 且不污染 versions[1]，verifiedCount 汇总全部版本真实出场数
  const addChildViaUpdateRes = executeProjectAssetMutation(
    'asset.update',
    {
      id: natalia.id,
      description: '1-2首现 · 心理医生，含成年与8岁幼年（小娜塔莉亚）两个时期造型',
      versions: [
        {
          name: '小娜塔莉亚/8岁',
          role: '幼年时期的娜塔莉亚',
          appearance: '8岁小女孩造型',
          provenances: [{ sceneTitle: '1-5 日 外 布莱克伍德庄园', paragraphIndices: [2] }],
        },
      ],
    },
    proj
  );
  proj = { ...proj, ...addChildViaUpdateRes.updatedProject };
  assert.equal(proj.characters[0].versions.length, 2, '向单版本资产追加变体版本后 versions 长度必须为 2');
  assert.equal(proj.characters[0].versions[0].id, natalia.id);
  assert.equal(proj.characters[0].versions[0].name, '常服');
  assert.equal(proj.characters[0].versions[1].name, '小娜塔莉亚/8岁');
  assert.equal((addChildViaUpdateRes.output as any).verifiedCount, 3, '成年 2 处 + 幼年 1 处应汇总为 3 处');

  const appendParentRes = executeProjectAssetMutation(
    'asset.update',
    {
      id: natalia.id,
      mode: 'append',
      provenances: [{ sceneTitle: '1-2 日 内 医院办公室', paragraphIndices: [2, 4, 5] }],
    },
    proj
  );
  proj = { ...proj, ...appendParentRes.updatedProject };
  assert.equal((appendParentRes.output as any).verifiedCount, 6, '成年 5 处 + 幼年 1 处应汇总为 6 处');
  assert.equal(
    proj.characters[0].versions[0].verifiedProvenance.length,
    proj.characters[0].verifiedProvenance.length,
    '主资产更新出处后，默认版本 versions[0] 的 verifiedProvenance 应保持同步（仅含成年场次 5 处）'
  );
  assert.equal(
    proj.characters[0].versions[1].verifiedProvenance.length,
    1,
    '幼年版本 versions[1] 的 verifiedProvenance 应保持独立（仅含幼年场次 1 处）'
  );

  // 8. 历史单元素 versions 存档兼容保护：mergeMultiVersionAssetList 自动将带有独立父级出处的单变体条目补齐为 2 个版本
  const legacySingleVerItem = {
    ...proj.characters[0],
    versions: [proj.characters[0].versions[1]], // 模拟旧存档仅含 1 个 "小娜塔莉亚/8岁" 版本
  };
  const repairedList = mergeMultiVersionAssetList('characters', [legacySingleVerItem]);
  assert.equal(repairedList[0].versions.length, 2);
  assert.equal(repairedList[0].versions[0].name, '常服');
  assert.equal(repairedList[0].versions[1].name, '小娜塔莉亚/8岁');

  // 9. script.read 与 provenances 传入 "1-5内" / "1-5外" / "1-5日内" 等场次号+内外景简写时，能精准区分同名 1-5 的内外景子场次
  const readIntExt = executeProjectReadTool('script.read', {
    episode: 1,
    scene: ['1-5内', '1-5外'],
  }, proj) as any;
  assert.equal(readIntExt.sceneCount, 2, '"1-5内" 与 "1-5外" 应分别命中 1-5 内景与 1-5 外景共 2 个场次');
  assert.equal(readIntExt.episodes[0].scenes[0].locationName, '娜塔莉亚家');
  assert.equal(readIntExt.episodes[0].scenes[1].locationName, '布莱克伍德庄园');

  // 10. script.directory 传入 episode: 1 时，仅返回第 1 集目录与场次，不带出第 31 集等其它分集
  const dirEp1 = executeProjectReadTool('script.directory', { episode: 1 }, proj) as any;
  assert.equal(dirEp1.total, 1);
  assert.equal(dirEp1.entries.length, 1);
  assert.equal(dirEp1.entries[0].title, '第一集');
});

test('script.read 与 script.search 支持剥离前缀的场次 ID（如 "52-2776"）、括号标题，且未命中时抛错并列出可选场次', () => {
  const precomputedProj: ProjectData = {
    id: 'p_id_suffix',
    scriptText: [
      '第一集',
      '1-4 日 内 医院办公室',
      '医生查看病历。',
      '1-5 日 内 娜塔莉亚家',
      '娜塔莉亚在房间整理资料。',
      '1-5 日 外 布莱克伍德庄园',
      '布拉姆把玩着手枪，目光冰冷。',
    ].join('\n'),
    scenes: [
      { id: 'scene-28-1373', title: '1-4 日 内 医院办公室', sceneNumber: '1-4', episodeTitle: '第一集', locationName: '医院办公室', startLine: 2, endLine: 3, paragraphs: [{ index: 1, lineNumber: 3, text: '医生查看病历。' }] },
      { id: 'scene-39-1953', title: '1-5 日 内 娜塔莉亚家', sceneNumber: '1-5', episodeTitle: '第一集', locationName: '娜塔莉亚家', startLine: 4, endLine: 5, paragraphs: [{ index: 1, lineNumber: 5, text: '娜塔莉亚在房间整理资料。' }] },
      { id: 'scene-52-2776', title: '1-5 日 外 布莱克伍德庄园', sceneNumber: '1-5', episodeTitle: '第一集', locationName: '布莱克伍德庄园', startLine: 6, endLine: 7, paragraphs: [{ index: 1, lineNumber: 7, text: '布拉姆把玩着手枪，目光冰冷。' }] },
    ],
    characters: [],
    locations: [],
    props: [],
  };

  // 1. 传入剥离了 "scene-" 前缀的 ID "52-2776" 应精准命中 scene-52-2776（区分两个 1-5）
  const readBySuffix = executeProjectReadTool('script.read', {
    episode: '第一集',
    scene: '52-2776',
  }, precomputedProj) as any;
  assert.equal(readBySuffix.sceneCount, 1);
  assert.equal(readBySuffix.episodes[0].scenes[0].id, 'scene-52-2776');
  assert.equal(readBySuffix.episodes[0].scenes[0].locationName, '布莱克伍德庄园');

  // 2. script.search 传入 scene: "52-2776" 同样精准限定在 scene-52-2776
  const searchBySuffix = executeProjectReadTool('script.search', {
    query: '手枪',
    episode: '第一集',
    scene: '52-2776',
  }, precomputedProj) as any;
  assert.equal(searchBySuffix.total, 1);
  assert.equal(searchBySuffix.matches[0].sceneTitle, '1-5 日 外 布莱克伍德庄园');

  // 3. 传入带括号后缀的 "1-5（布莱克伍德庄园）" 也能容错命中
  const readWithParens = executeProjectReadTool('script.read', {
    episode: '第一集',
    scene: '1-5（布莱克伍德庄园）',
  }, precomputedProj) as any;
  assert.equal(readWithParens.sceneCount, 1);
  assert.equal(readWithParens.episodes[0].scenes[0].id, 'scene-52-2776');

  // 4. 传入不存在的场次编号（如 "1-6"）时，readScriptStructured 返回 notFound 与可选场次，executeProjectReadTool 明确抛错（绝不静默返回 {}）
  const missStructured = readScriptStructured(precomputedProj.scriptText, {
    episode: '第一集',
    scene: '1-6',
    precomputedScenes: precomputedProj.scenes,
  }) as any;
  assert.equal(missStructured.notFound, true);
  assert.equal(missStructured.availableScenes.length, 3);
  assert.throws(
    () => executeProjectReadTool('script.read', { episode: '第一集', scene: '1-6' }, precomputedProj),
    /未匹配到符合条件.*scene-52-2776/
  );

  // 5. 传入不存在的集数（如 "第99集"）时同样明确抛错并提示可选范围
  assert.throws(
    () => executeProjectReadTool('script.read', { episode: '第99集' }, precomputedProj),
    /未匹配到符合条件.*第99集/
  );
});

test('只读工具返回各集/场次字数 charCount 及每轮建议上限 recommendedBatchMaxChars (2500字)，并在超限合批时触发预警', () => {
  const mkLine = (tag: string, len: number) => `${tag}${'甲'.repeat(Math.max(1, len - tag.length))}`;
  // 构造第一集：2 个场次（总段落仅 12 段 < 20，但正文字数 1-1 约 900 字 + 1-2 约 2100 字 = 3000 字 > 2500 字）
  const s1Lines = [
    mkLine('▲娜塔莉亚站在客厅里查看文件。', 225),
    mkLine('娜塔莉亚：第一段对白。', 225),
    mkLine('▲她把文件放进皮包。', 225),
    mkLine('焦恩：注意安全。', 225),
  ];
  const s2Lines = [
    mkLine('▲庄园大门缓缓打开，娜塔莉亚走入广场。', 260),
    mkLine('娜塔莉亚OS：这里守卫森严。', 260),
    mkLine('▲布拉姆站在主位审视众人。', 260),
    mkLine('布拉姆：谁敢接下这份工作？', 260),
    mkLine('▲众人后退一步。', 260),
    mkLine('娜塔莉亚：我愿意一试。', 260),
    mkLine('▲布拉姆收起手枪打量娜塔莉亚。', 260),
    mkLine('布拉姆：有点意思。', 280),
  ];
  const s1Chars = s1Lines.reduce((acc, s) => acc + s.length, 0); // 900
  const s2Chars = s2Lines.reduce((acc, s) => acc + s.length, 0); // 2100
  const totalEp1Chars = s1Chars + s2Chars; // 3000

  const charProj: ProjectData = {
    id: 'p_char_budget',
    scriptText: [
      '第一集',
      '1-1 日 内 娜塔莉亚家',
      ...s1Lines,
      '1-2 日 外 布莱克伍德庄园',
      ...s2Lines,
    ].join('\n'),
    characters: [{ id: 'char_n', name: '娜塔莉亚', role: '主角' }],
    locations: [],
    props: [],
  };

  // 1. script.directory 返回每集与每场的 charCount、totalChars 与 recommendedBatchMaxChars=2500，且超过 2500 字时触发预警
  const dirRes = executeProjectReadTool('script.directory', { episode: '第一集' }, charProj) as any;
  assert.equal(RECOMMENDED_BATCH_MAX_CHARS, 2500);
  assert.equal(dirRes.recommendedBatchMaxChars, 2500);
  assert.equal(dirRes.totalChars, totalEp1Chars);
  assert.equal(dirRes.entries[0].charCount, totalEp1Chars);
  assert.equal(dirRes.entries[0].scenes[0].charCount, s1Chars);
  assert.equal(dirRes.entries[0].scenes[1].charCount, s2Chars);
  assert.equal(dirRes.hasVolumeWarning, true, '虽然只有 2 场 12 段，但正文字数 3000 > 2500 应触发预警');
  assert.ok(String(dirRes.notice).includes('2500 字') && String(dirRes.notice).includes(String(totalEp1Chars)));

  // 2. script.read 单场读取 1-2（2100 字 <= 2500 且 8 段 <= 30）：不触发预警，且返回准确 charCount
  const readSingle = executeProjectReadTool('script.read', { episode: '第一集', scene: '1-2' }, charProj) as any;
  assert.equal(readSingle.charCount, s2Chars);
  assert.equal(readSingle.recommendedBatchMaxChars, 2500);
  assert.equal(readSingle.episodes[0].charCount, s2Chars);
  assert.equal(readSingle.episodes[0].scenes[0].charCount, s2Chars);
  assert.equal(readSingle.hasVolumeWarning, false, '单场 2100 字 / 8 段属于舒适区间，不应触发预警');

  // 3. script.read 显式合批读取 ['1-1', '1-2']（共 12 段 <= 30，但 3000 字 > 2500）：应触发字数超限预警
  const readOverBatch = executeProjectReadTool('script.read', { episode: '第一集', scene: ['1-1', '1-2'] }, charProj) as any;
  assert.equal(readOverBatch.charCount, totalEp1Chars);
  assert.equal(readOverBatch.recommendedBatchMaxChars, 2500);
  assert.equal(readOverBatch.hasVolumeWarning, true, '合批总字数 3000 > 2500 即使只有 12 段也应触发超限预警');
  assert.ok(String(readOverBatch.notice).includes('2500 字'));

  // 4. script.search 返回命中场次各自总字数 charCount、totalChars 与 recommendedBatchMaxChars=2500
  const searchRes = executeProjectReadTool('script.search', { query: '娜塔莉亚', episode: '第一集' }, charProj) as any;
  assert.equal(searchRes.recommendedBatchMaxChars, 2500);
  assert.equal(searchRes.totalChars, totalEp1Chars);
  assert.equal(searchRes.scenesSummary[0].charCount, s1Chars);
  assert.equal(searchRes.scenesSummary[0].paragraphCount, 4);
  assert.equal(searchRes.scenesSummary[1].charCount, s2Chars);
  assert.equal(searchRes.scenesSummary[1].paragraphCount, 8);
  assert.equal(searchRes.hasVolumeWarning, true, '涉及场次正文 3000 字 > 2500 即使仅 5 条命中也应给出分批字数建议');
  assert.ok(String(searchRes.warning).includes('2500 字'));

  // 5. asset.searchProvenanceCandidates 同样附带各场次 charCount、totalChars 与 recommendedBatchMaxChars=2500
  const candRes = executeProjectReadTool('asset.searchProvenanceCandidates', { id: 'char_n' }, charProj) as any;
  assert.equal(candRes.recommendedBatchMaxChars, 2500);
  assert.equal(candRes.totalChars, totalEp1Chars);
  assert.equal(candRes.scenesSummary[0].charCount, s1Chars);
  assert.equal(candRes.scenesSummary[1].charCount, s2Chars);
  assert.equal(candRes.hasVolumeWarning, true);
  assert.ok(String(candRes.notice).includes('2500 字'));
});

test('多版本默认造型升格：asset.create / asset.update 一次传入 >= 2 个变体版本时同样自动将主卡初始造型升格为 versions[0]，不丢失也不重复', () => {
  const script = [
    '第一集',
    '1-2 日 内 医院办公室',
    '▲娜塔莉亚坐在办公室椅子上看照片。',
    '1-3 日 外 贫民窟门口',
    '▲小娜塔莉亚穿着破烂站在街道上。',
    '1-4 日 内 医院办公室',
    '▲娜塔莉亚继续翻照片。',
    '1-5 日 内 娜塔莉亚家',
    '▲娜塔莉亚收拾皮包。',
    '1-5 日 外 布莱克伍德庄园',
    '▲娜塔莉亚穿着职业装、戴黑框眼镜站在庄园广场。',
  ].join('\n');

  const emptyProj: ProjectData = {
    id: 'p_multi_ver_promo',
    scriptText: script,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. asset.create 顶层传 provenances（成年便装）+ versions 一次传 2 个新造型（8岁 + 职业装）
  const createRes = executeProjectAssetMutation(
    'asset.create',
    {
      type: 'characters',
      name: '娜塔莉亚',
      role: '心理医生',
      appearance: '22岁女性，黑长发，常服为便装',
      provenances: [
        { sceneTitle: '1-2 日 内 医院办公室', paragraphIndices: [1] },
        { sceneTitle: '1-4 日 内 医院办公室', paragraphIndices: [1] },
        { sceneTitle: '1-5 日 内 娜塔莉亚家', paragraphIndices: [1] },
      ],
      versions: [
        {
          name: '8岁小娜塔莉亚',
          appearance: '8岁小女孩，穿着破烂衣衫',
          provenances: [{ sceneTitle: '1-3 日 外 贫民窟门口', paragraphIndices: [1] }],
        },
        {
          name: '职业装应聘造型',
          appearance: '22岁女性，职业装、黑框眼镜',
          provenances: [{ sceneTitle: '1-5 日 外 布莱克伍德庄园', paragraphIndices: [1] }],
        },
      ],
    },
    emptyProj
  );

  const createdProj: ProjectData = { ...emptyProj, ...createRes.updatedProject };
  const charItem = createdProj.characters[0];
  assert.equal(charItem.versions.length, 3, '应自动将主卡初始造型升格为 versions[0]，共保留 3 个并列版本');
  assert.equal(charItem.versions[0].id, charItem.id);
  assert.equal(charItem.versions[0].name, '常服');
  assert.equal(charItem.versions[0].verifiedProvenance.length, 3);
  assert.equal(charItem.versions[0].sourceScenes.length, 3, '默认版本 sourceScenes 只应包含便装对应的 3 个场次');
  assert.equal(charItem.versions[1].name, '8岁小娜塔莉亚');
  assert.equal(charItem.versions[1].verifiedProvenance.length, 1);
  assert.equal(charItem.versions[2].name, '职业装应聘造型');
  assert.equal(charItem.versions[2].verifiedProvenance.length, 1);
  assert.equal(charItem.sourceScenes.length, 5, '父级 sourceScenes 应汇总全部 5 个场次');

  // 2. 若调用方已在 versions 中显式传入 "常服"，不应重复生成第二个 "常服"
  const explicitDefaultRes = executeProjectAssetMutation(
    'asset.create',
    {
      type: 'characters',
      name: '娜塔莉亚',
      provenances: [{ sceneTitle: '1-2 日 内 医院办公室', paragraphIndices: [1] }],
      versions: [
        {
          name: '常服',
          provenances: [{ sceneTitle: '1-2 日 内 医院办公室', paragraphIndices: [1] }],
        },
        {
          name: '8岁小娜塔莉亚',
          provenances: [{ sceneTitle: '1-3 日 外 贫民窟门口', paragraphIndices: [1] }],
        },
      ],
    },
    emptyProj
  );
  assert.equal(explicitDefaultRes.updatedProject.characters![0].versions.length, 2);

  // 3. 单版本主卡先建立，随后通过 asset.update 一次传入 2 个新版本时，也应自动升格原主卡为 "常服" -> 共 3 个版本
  const singleFirst = executeProjectAssetMutation(
    'asset.create',
    {
      type: 'characters',
      name: '娜塔莉亚',
      appearance: '22岁便装',
      provenances: [{ sceneTitle: '1-2 日 内 医院办公室', paragraphIndices: [1] }],
    },
    emptyProj
  );
  let projStep: ProjectData = { ...emptyProj, ...singleFirst.updatedProject };
  const parentId = projStep.characters[0].id;

  const updateTwoAtOnce = executeProjectAssetMutation(
    'asset.update',
    {
      id: parentId,
      mode: 'append',
      versions: [
        {
          name: '8岁小娜塔莉亚',
          provenances: [{ sceneTitle: '1-3 日 外 贫民窟门口', paragraphIndices: [1] }],
        },
        {
          name: '职业装应聘造型',
          provenances: [{ sceneTitle: '1-5 日 外 布莱克伍德庄园', paragraphIndices: [1] }],
        },
      ],
    },
    projStep
  );
  projStep = { ...projStep, ...updateTwoAtOnce.updatedProject };
  assert.equal(projStep.characters[0].versions.length, 3);
  assert.equal(projStep.characters[0].versions[0].name, '常服');
  assert.equal(projStep.characters[0].versions[0].verifiedProvenance.length, 1);
  assert.equal(projStep.characters[0].versions[1].name, '8岁小娜塔莉亚');
  assert.equal(projStep.characters[0].versions[2].name, '职业装应聘造型');
  assert.equal((updateTwoAtOnce.output as any).verifiedCount, 3);

  // 4. 旧数据兼容：仅有 2 个变体版本但父级含独立 verifiedProvenance 时，mergeMultiVersionAssetList 自动补全第 3 个初始版本
  const unpromotedLegacy = {
    ...charItem,
    versions: charItem.versions.slice(1), // 仅留 8岁 + 职业装
  };
  const repaired = mergeMultiVersionAssetList('characters', [unpromotedLegacy]);
  assert.equal(repaired[0].versions.length, 3);
  assert.equal(repaired[0].versions[0].name, '常服');
  assert.equal(repaired[0].versions[0].verifiedProvenance.length, 3);
});

test('同名场次（如两个 1-5）在 script.directory 中自动标出唯一 id，且 script.read 因重名误拉超限（>2500字）时拦截并提示改用 id', () => {
  const padLine = (prefix: string, len: number) => `${prefix}${'文'.repeat(Math.max(1, len - prefix.length))}`;
  const script = [
    '第一集',
    '1-2 日 内 医院办公室',
    padLine('▲娜塔莉亚翻看照片。', 490),
    '1-5 日 内 娜塔莉亚家',
    padLine('▲娜塔莉亚在家收拾行李准备出门。', 780),
    '1-5 日 外 布莱克伍德庄园',
    padLine('▲娜塔莉亚穿职业装站在庄园广场。', 1200),
    padLine('▲布拉姆坐在主位打量着众人。', 1150),
  ].join('\n');

  const proj: ProjectData = {
    id: 'p_dup_1_5',
    scriptText: script,
    characters: [],
    locations: [],
    props: [],
  };

  // 1. script.directory 识别 duplicateSceneNumbers=['1-5'] 并在 scenesSummary 中展示各自唯一 id
  const dirRes = executeProjectReadTool('script.directory', { episode: 1 }, proj) as any;
  assert.deepEqual(dirRes.duplicateSceneNumbers, ['1-5']);
  const dupSummaries = (dirRes.scenesSummary as string[]).filter(s => s.includes('1-5'));
  assert.equal(dupSummaries.length, 2);
  assert.ok(dupSummaries.every(s => /\[id: scene-/.test(s)), '重名场次摘要必须附带 [id: scene-...]');
  assert.ok(String(dirRes.notice).includes('重名场次编号'));

  const houseSceneId = dirRes.entries[0].scenes.find((s: any) => s.locationName === '娜塔莉亚家').id as string;
  const manorSceneId = dirRes.entries[0].scenes.find((s: any) => s.locationName === '布莱克伍德庄园').id as string;

  // 2. script.read 若传模糊的 "1-5" 与 "1-2" 导致同时拉出两个 1-5 且总字数 > 2500，应抛错阻断并给出唯一 id 提示
  assert.throws(
    () => executeProjectReadTool('script.read', { episode: 1, scene: ['1-2', '1-5'] }, proj),
    err =>
      err instanceof Error &&
      err.message.includes('读取超限') &&
      err.message.includes(houseSceneId) &&
      err.message.includes(manorSceneId)
  );

  // 3. 改传唯一场次 ID 读取两批，各自 <= 2500 字且精准命中对应单个场次
  const batch1 = executeProjectReadTool('script.read', { episode: 1, scene: ['1-2', houseSceneId] }, proj) as any;
  assert.equal(batch1.sceneCount, 2);
  assert.equal(batch1.episodes[0].scenes[1].id, houseSceneId);
  assert.ok(batch1.charCount <= 2500);

  const batch2 = executeProjectReadTool('script.read', { episode: 1, scene: manorSceneId }, proj) as any;
  assert.equal(batch2.sceneCount, 1);
  assert.equal(batch2.episodes[0].scenes[0].id, manorSceneId);
  assert.ok(batch2.charCount <= 2500);
});
