import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { executeProjectReadTool, executeProjectAssetMutation, type ProjectData } from './projectTools';
import { resolveVerifiedProvenance } from '../utils/assetProvenance';
import { getAssetIdentificationText, getVersionIdentificationText, mergeMultiVersionAssetList } from '../utils/assetVersions';

const project: ProjectData = { id: 'p1', scriptText: '第1集 开始\n你好\n第2集 继续\n再见', characters: [{ id: 'c1', name: 'Vivian', role: '主角', appearance: '长裙' }], locations: [{ id: 'l1', name: '车厢' }], props: [] };

test('后台剧本工具读取目录、分页正文和搜索结果', () => {
  const directory = executeProjectReadTool('script.directory', { limit: 1 }, project);
  assert.equal(directory.projectId, 'p1');
  assert.equal(directory.total, 2);
  assert.equal(directory.nextOffset, 1);
  const page = executeProjectReadTool('script.read', { offset: 1, limit: 2 }, project);
  assert.equal(page.content, '你好\n第2集 继续');
  assert.equal(page.nextOffset, 3);
  assert.deepEqual(executeProjectReadTool('script.search', { query: '再见' }, project).matches?.map(m => m.lineNumber), [4]);
  assert.throws(() => executeProjectReadTool('script.search', { query: '' }, project));
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
