import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { executeProjectReadTool, executeProjectAssetMutation, type ProjectData } from './projectTools';
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
  assert.equal(ep1.startLine, 1);
  assert.equal(ep1.endLine, 2);
  const pageFromLine1 = executeProjectReadTool('script.read', { offset: ep1.startLine, limit: 2 }, project);
  assert.equal(pageFromLine1.content, '第1集 开始\n你好');
  assert.equal(pageFromLine1.startLine, 1);
  assert.equal(pageFromLine1.endLine, 2);
  assert.equal(pageFromLine1.nextOffset, 3);
  const pageFromLine2 = executeProjectReadTool('script.read', { offset: 2, limit: 2 }, project);
  assert.equal(pageFromLine2.content, '你好\n第2集 继续');
  assert.equal(pageFromLine2.nextOffset, 4);
  assert.deepEqual(executeProjectReadTool('script.search', { query: '再见' }, project).matches?.map(m => m.lineNumber), [4]);
  assert.throws(() => executeProjectReadTool('script.search', { query: '' }, project));

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

  // 全文搜索返回第 3、5、8 行，且连续序号为 1, 2, 3
  const allMatches = executeProjectReadTool('script.search', { query: '布拉姆' }, multiEpProject);
  assert.deepEqual(allMatches.matches?.map(m => m.lineNumber), [3, 5, 8]);
  assert.deepEqual(allMatches.matches?.map(m => m.index), [1, 2, 3]);

  // 按 episode="第一集" 或 episode=1 限定搜索，严格排除第二集第 8 行，且连续序号从 1..N 编号
  const ep1ByCn = executeProjectReadTool('script.search', { query: '布拉姆', episode: '第一集' }, multiEpProject);
  assert.deepEqual(ep1ByCn.matches?.map(m => m.lineNumber), [3, 5]);
  assert.deepEqual(ep1ByCn.matches?.map(m => m.index), [1, 2]);
  assert.deepEqual(ep1ByCn.scope, { episode: '第一集', startLine: 1, endLine: 5 });

  const ep1ByNum = executeProjectReadTool('script.search', { query: '布拉姆', episode: 1 }, multiEpProject);
  assert.deepEqual(ep1ByNum.matches?.map(m => m.lineNumber), [3, 5]);
  assert.deepEqual(ep1ByNum.matches?.map(m => m.index), [1, 2]);

  // 按 startLine / endLine 限定搜索范围
  const lineRangeRes = executeProjectReadTool('script.search', { query: '布拉姆', startLine: 4, endLine: 5 }, multiEpProject);
  assert.deepEqual(lineRangeRes.matches?.map(m => m.lineNumber), [5]);
  assert.deepEqual(lineRangeRes.matches?.map(m => m.index), [1]);
  assert.deepEqual(lineRangeRes.scope, { startLine: 4, endLine: 5 });

  // 按场次编号（如 "1-5"）限定搜索
  const sceneRes = executeProjectReadTool('script.search', { query: '布拉姆', episode: '1-5' }, multiEpProject);
  assert.deepEqual(sceneRes.matches?.map(m => m.lineNumber), [5]);
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



