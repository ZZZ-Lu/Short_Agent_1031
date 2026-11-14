import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AgentRuntime } from './runtime';
import { cleanToolOutputForPrompt, initialAgentContext, mergeTaskNotes, resolveContext, summarizeToolOutputForStateNode, validateSelection } from './contextPolicy';

test('首轮仅注入系统控制工具（含0级专属experience.search），后续按选择和设置过滤，且1级不注入sys.endTask与experience.search', () => {
  const enabled = ['script.read', 'asset.list', 'sys.endTask', 'user.ask', 'experience.search'];
  const initial = resolveContext(initialAgentContext(), enabled);
  assert.equal(initial.level, 0);
  assert(!initial.tools.includes('script.read'));
  assert(initial.tools.includes('sys.selectContext'));
  assert(initial.tools.includes('experience.search'));
  assert(initial.tools.includes('sys.endTask'));

  const selection = validateSelection({ level: 1, tools: ['script.read'], prompts: ['script'] }, enabled);
  const resolvedLevel1 = resolveContext(selection, enabled);
  assert.equal(resolvedLevel1.level, 1);
  assert(resolvedLevel1.tools.includes('script.read'));
  assert(!resolvedLevel1.tools.includes('sys.endTask'));
  assert(!resolvedLevel1.tools.includes('experience.search'));

  const backToLevel0 = validateSelection({ level: 0 }, enabled);
  const resolvedBack0 = resolveContext(backToLevel0, enabled);
  assert.equal(resolvedBack0.level, 0);
  assert.deepEqual(resolvedBack0.tools, ['sys.selectContext', 'sys.endTask', 'user.ask', 'experience.search']);

  assert(!resolveContext(selection, []).tools.includes('script.read'));
  assert.throws(() => validateSelection({ level: 1, tools: ['unknown'], prompts: [] }, enabled));
  assert.throws(() => validateSelection({ level: 1, tools: [], prompts: ['unknown'] }, enabled));
});

test('上下文选择在下一轮生效，并可回到全局层级结束任务', async () => {
  const seen: number[] = [];
  const runtime = new AgentRuntime({
    enabledTools: () => ['script.read'],
    requestTurn: async task => {
      seen.push(task.context.level);
      if (task.turn === 1) return { narration: [], complete: false, toolCalls: [{ id: 'a', name: 'sys.selectContext', arguments: { level: 1, tools: ['script.read'], prompts: ['script'] } }] };
      if (task.turn === 2) {
        assert.deepEqual(task.context.tools, ['script.read']);
        return { narration: [], complete: false, toolCalls: [{ id: 'b', name: 'sys.selectContext', arguments: { level: 0 } }] };
      }
      return { narration: [], complete: false, toolCalls: [{ id: 'c', name: 'sys.endTask', arguments: { success: true } }] };
    },
    executeTool: async () => { throw new Error('系统选择不应进入业务执行器'); },
  });
  const task = runtime.createTask({ id: 't', sessionId: 'p', goal: '读取剧本' });
  const result = await runtime.wake(task.id);
  assert.deepEqual(seen, [0, 1, 0]);
  assert.equal(result.status, 'completed');
  assert(result.events.some(event => event.toolName === 'sys.selectContext' && event.status === 'succeeded'));
});

test('两步漏斗：0级选categories先展开候选工具简表，再传具体tools切入1级精确装载', () => {
  const enabled = ['script.directory', 'script.read', 'script.search', 'asset.create', 'asset.delete', 'sys.endTask', 'user.ask'];

  // 第一步：仅传 categories 时保持在 0 级，并展开 candidateTools 供下一轮挑选
  const step1 = validateSelection({ level: 0, categories: ['script', 'asset'] }, enabled);
  assert.equal(step1.level, 0);
  assert.deepEqual(step1.tools, []);
  assert.deepEqual(step1.categories, ['script', 'asset']);
  const resolvedStep1 = resolveContext(step1, enabled);
  assert.equal(resolvedStep1.level, 0);
  assert.deepEqual(
    resolvedStep1.candidateTools.map(t => t.id),
    ['script.directory', 'script.read', 'script.search', 'asset.create', 'asset.delete']
  );

  // 第二步：从候选中挑选具体 tools 切入 1 级，仅注入所选的 3 个工具，不注入未选的 script.search / asset.delete 和 sys.endTask
  const step2 = validateSelection({ level: 1, tools: ['script.directory', 'script.read', 'asset.create'] }, enabled);
  assert.equal(step2.level, 1);
  assert.deepEqual(step2.tools, ['script.directory', 'script.read', 'asset.create']);
  const resolvedStep2 = resolveContext(step2, enabled);
  assert.equal(resolvedStep2.level, 1);
  assert.deepEqual(resolvedStep2.tools, ['sys.selectContext', 'script.directory', 'script.read', 'asset.create', 'user.ask']);

  // 自然阶段流转（省略 level 参数）：传 categories 保持 0 级，传 tools 自动进入 1 级执行，无参调用自动退回 0 级计划阶段
  const autoExpand = validateSelection({ categories: ['script'] }, enabled);
  assert.equal(autoExpand.level, 0);
  assert.deepEqual(autoExpand.categories, ['script']);

  const autoExecute = validateSelection({ tools: ['script.read'] }, enabled);
  assert.equal(autoExecute.level, 1);
  assert.deepEqual(autoExecute.tools, ['script.read']);

  const autoExit = validateSelection({}, enabled);
  assert.equal(autoExit.level, 0);
  assert.deepEqual(autoExit.tools, []);

  // 工具箱展开记忆机制：传入已展开分类 previousCategories 时，进出局部执行阶段后自动保留已展开分类及候选工具简表
  const enterExecWithMemory = validateSelection({ tools: ['script.read'] }, enabled, ['script', 'asset']);
  assert.equal(enterExecWithMemory.level, 1);
  assert.deepEqual(enterExecWithMemory.categories, ['script', 'asset']);

  const exitExecWithMemory = validateSelection({}, enabled, enterExecWithMemory.categories);
  assert.equal(exitExecWithMemory.level, 0);
  assert.deepEqual(exitExecWithMemory.categories, ['script', 'asset']);
  const resolvedAfterExit = resolveContext(exitExecWithMemory, enabled);
  assert.deepEqual(
    resolvedAfterExit.candidateTools.map(t => t.id),
    ['script.directory', 'script.read', 'script.search', 'asset.create', 'asset.delete']
  );

  // 1 级执行阶段补充装载工具：保留已装载的业务工具并合并新选工具，避免卸载旧工具引发乒乓重装
  const supplementInLevel1 = validateSelection(
    { tools: ['script.read'] },
    enabled,
    ['script', 'asset'],
    ['asset.create', 'asset.delete']
  );
  assert.equal(supplementInLevel1.level, 1);
  assert.deepEqual(supplementInLevel1.tools, ['asset.create', 'asset.delete', 'script.read']);

  // 切入 1 级时若同时传 categories: ['asset'] 与 tools: ['script.read']（漏列具体 asset 写入工具 ID），自动配齐已启用的 asset.create / asset.update
  const autoPairAssetSuite = validateSelection(
    { categories: ['asset'], tools: ['script.read'] },
    [...enabled, 'asset.update']
  );
  assert.equal(autoPairAssetSuite.level, 1);
  assert.deepEqual(autoPairAssetSuite.tools, ['script.read', 'asset.create', 'asset.update']);

  // 切入 1 级时若传 tools: ['asset.create', 'asset.update'] 漏列 script.read，自动配齐已启用的 script.read
  const autoPairScriptRead = validateSelection(
    { tools: ['asset.create', 'asset.update'] },
    [...enabled, 'asset.update'],
    ['script', 'asset']
  );
  assert.equal(autoPairScriptRead.level, 1);
  assert.deepEqual(autoPairScriptRead.tools, ['asset.create', 'asset.update', 'script.read']);
});

test('mergeTaskNotes 按行去重并在进入具体任务后剔除开场占位笔记与冗余元信息，保留客观锚点与认知体感', () => {
  const existing = '- 用户尚未明确具体任务，等待用户选择从剧本、资产、生图或视频中哪一步开始。\n- 用户关心项目中女主角的身份信息；需从剧本与资产数据中查找确认。';
  const incoming = '- 用户尚未提供具体创作任务，当前仅关心项目中女主角身份。\n- 用户关心项目中女主角的身份信息；需从剧本与资产数据中查找确认。\n- 女主娜塔莉亚：22岁心理医生，玛莉的亲妹妹。';
  const merged = mergeTaskNotes(existing, incoming, 'append');
  assert.equal(
    merged,
    '- 用户关心项目中女主角的身份信息；需从剧本与资产数据中查找确认。\n- 女主娜塔莉亚：22岁心理医生，玛莉的亲妹妹。'
  );

  const cognitiveNotes = [
    '- 最终目标：从第一集提取娜塔莉亚',
    '- 实体锚点：娜塔莉亚主卡 ID char_1，已落盘常服版本；1-3场8岁童年线索待核验',
    '- 任务新理解：第一集通过现实受托与童年闪回交织展现其潜入庄园动机，需按视觉造型区分版本',
    '- 本轮经验：1-5存在内景家中与外景庄园两个同名子场次，读取时一次返回两场',
    '- 主观感受与提醒：下一场庄园32段群戏密集，逐段核验时须紧盯是否必须出现在画面中',
  ].join('\n');
  const mergedCognitive = mergeTaskNotes(undefined, cognitiveNotes, 'overwrite');
  assert.equal(
    mergedCognitive,
    [
      '- 实体锚点：娜塔莉亚主卡 ID char_1，已落盘常服版本；1-3场8岁童年线索待核验',
      '- 任务新理解：第一集通过现实受托与童年闪回交织展现其潜入庄园动机，需按视觉造型区分版本',
      '- 本轮经验：1-5存在内景家中与外景庄园两个同名子场次，读取时一次返回两场',
      '- 主观感受与提醒：下一场庄园32段群戏密集，逐段核验时须紧盯是否必须出现在画面中',
    ].join('\n')
  );
});

test('cleanToolOutputForPrompt 按场次聚合 verifiedProvenance 并对多版本主卡去重，消除冗长双语全文膨胀', () => {
  const singleVersionOutput = {
    projectId: 'proj_1',
    items: [
      {
        id: 'char_1',
        name: '娜塔莉亚',
        verifiedScriptHash: '82127:1mmekap',
        verifiedProvenance: [
          {
            id: 'vp_char_1_ev_0',
            sceneId: 'sc-7-151',
            sceneTitle: '第一集 1-2 日 内 医院办公室',
            matchedTerm: '▲娜塔莉亚死死握着书信，眼泪落在照片上。',
            evidenceText: '▲娜塔莉亚死死握着书信，眼泪落在照片上。',
            anchorText: 'is hellhole!)\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）',
            offsetInAnchor: 14,
            fallbackCharIndex: 526,
            lineNumber: 14,
          },
          {
            id: 'vp_char_1_ev_1',
            sceneId: 'sc-7-151',
            sceneTitle: '第一集 1-2 日 内 医院办公室',
            evidenceText: '娜塔莉亚（悲痛）：我等待了多年的姐妹重逢...',
            lineNumber: 15,
          },
        ],
      },
    ],
  };

  const cleanedSingle = cleanToolOutputForPrompt(singleVersionOutput) as any;
  assert.equal(cleanedSingle.items[0].verifiedScriptHash, undefined);
  assert.deepEqual(cleanedSingle.items[0].verifiedProvenance, [
    {
      sceneId: 'sc-7-151',
      sceneTitle: '第一集 1-2 日 内 医院办公室',
      count: 2,
      lines: [14, 15],
    },
  ]);

  const multiVersionOutput = {
    item: {
      id: 'char_1',
      name: '娜塔莉亚',
      verifiedProvenance: [
        { sceneId: 'sc-51-2776', sceneTitle: '第一集 1-5 日 外 布莱克伍德庄园', evidenceText: '长文本1', lineNumber: 55 },
        { sceneId: 'sc-16-679', sceneTitle: '第一集 1-3 贫民窟门口', evidenceText: '长文本2', lineNumber: 19 },
      ],
      versions: [
        {
          id: 'char_1',
          name: '常服',
          verifiedProvenance: [
            { sceneId: 'sc-51-2776', sceneTitle: '第一集 1-5 日 外 布莱克伍德庄园', evidenceText: '长文本1', lineNumber: 55 },
          ],
        },
        {
          id: 'char_1_v2',
          name: '小娜塔莉亚（8岁）',
          verifiedProvenance: [
            { sceneId: 'sc-16-679', sceneTitle: '第一集 1-3 贫民窟门口', evidenceText: '长文本2', lineNumber: 19 },
          ],
        },
      ],
    },
  };

  const cleanedMulti = cleanToolOutputForPrompt(multiVersionOutput) as any;
  assert.equal(cleanedMulti.item.verifiedProvenance, undefined);
  assert.equal(cleanedMulti.item.verifiedProvenanceCount, 2);
  assert.deepEqual(cleanedMulti.item.versions[0].verifiedProvenance, [
    { sceneId: 'sc-51-2776', sceneTitle: '第一集 1-5 日 外 布莱克伍德庄园', count: 1, lines: [55] },
  ]);
  assert.deepEqual(cleanedMulti.item.versions[1].verifiedProvenance, [
    { sceneId: 'sc-16-679', sceneTitle: '第一集 1-3 贫民窟门口', count: 1, lines: [19] },
  ]);

  // 当主卡顶层 verifiedProvenance 仅同步了默认版本（常服）的出处子集时，
  // verifiedProvenanceCount 仍须汇总主卡与全部 versions 的去重总出处数（避免结案汇总误报为单版本出处数）
  const parentSubsetMultiVersionOutput = {
    item: {
      id: 'char_1',
      name: '娜塔莉亚',
      verifiedProvenance: [
        { sceneId: 'sc-5-261', sceneTitle: '第一集 1-2 夜 内 病房', evidenceText: '文本A', lineNumber: 6 },
      ],
      versions: [
        {
          id: 'char_1',
          name: '常服',
          verifiedProvenance: [
            { sceneId: 'sc-5-261', sceneTitle: '第一集 1-2 夜 内 病房', evidenceText: '文本A', lineNumber: 6 },
          ],
        },
        {
          id: 'char_1_v2',
          name: '小娜塔莉亚（8岁）',
          verifiedProvenance: [
            { sceneId: 'sc-16-679', sceneTitle: '第一集 1-3 贫民窟门口', evidenceText: '文本B', lineNumber: 19 },
          ],
        },
        {
          id: 'char_1_v3',
          name: '应聘职业装',
          verifiedProvenance: [
            { sceneId: 'sc-51-2776', sceneTitle: '第一集 1-5 日 外 布莱克伍德庄园', evidenceText: '文本C', lineNumber: 55 },
          ],
        },
      ],
    },
  };
  const cleanedSubsetMulti = cleanToolOutputForPrompt(parentSubsetMultiVersionOutput) as any;
  assert.equal(cleanedSubsetMulti.item.verifiedProvenanceCount, 3);
});

test('1级禁止通过 sys.selectContext 注入 sys.endTask；单独请求 sys.endTask 自动返回 0 级验收阶段', () => {
  const enabled = ['script.read', 'asset.create', 'asset.update', 'sys.endTask', 'user.ask'];

  // 1. 显式强行传 level: 1 + tools: ['sys.endTask'] 应直接报错拒绝
  assert.throws(
    () => validateSelection({ level: 1, tools: ['sys.endTask'] }, enabled, ['script', 'asset'], ['script.read']),
    /仅限全局计划与验收阶段/
  );

  // 2. 在 1 级未传 level，仅传 tools: ['sys.endTask'] 意图结束任务 -> 自动退回 0 级并卸载业务工具
  const autoReturnToPlan = validateSelection(
    { tools: ['sys.endTask'] },
    enabled,
    ['script', 'asset'],
    ['script.read', 'asset.create']
  );
  assert.equal(autoReturnToPlan.level, 0);
  assert.deepEqual(autoReturnToPlan.tools, []);
  assert.deepEqual(autoReturnToPlan.categories, ['script', 'asset']);

  // 3. 混合传入业务工具与 sys.endTask 时，剥离 sys.endTask，绝不将其写入 1 级 tools
  const mixedSelection = validateSelection(
    { tools: ['script.read', 'sys.endTask'] },
    enabled,
    ['script'],
    []
  );
  assert.equal(mixedSelection.level, 1);
  assert.deepEqual(mixedSelection.tools, ['script.read']);
  assert(!resolveContext(mixedSelection, enabled).tools.includes('sys.endTask'));

  // 4. resolveContext 纵深防御：即使历史 context.tools 意外残留 sys.endTask，1 级也绝不注入
  const resolvedPolluted = resolveContext(
    { level: 1, tools: ['script.read', 'sys.endTask'], prompts: ['script'], categories: ['script'] },
    enabled
  );
  assert.equal(resolvedPolluted.level, 1);
  assert(!resolvedPolluted.tools.includes('sys.endTask'));
  assert(resolvedPolluted.tools.includes('script.read'));
});

test('summarizeToolOutputForStateNode 为状态节点提供确定性事实摘要，防止把未命中或错读场次误判为已完成', () => {
  // 1. script.read 命中与目标不同的场次（如 1-4 医院办公室）：明确暴露真实 sceneId、标题与段数
  const readHitSummary = summarizeToolOutputForStateNode('script.read', 'succeeded', {
    episodeCount: 1,
    sceneCount: 1,
    paragraphCount: 7,
    episodes: [
      {
        id: 'ep1',
        scenes: [{ id: 'scene-28-1373', title: '1-4 日 内 医院办公室', paragraphCount: 7 }],
      },
    ],
  });
  assert.match(readHitSummary, /实际读取 1 场共 7 段/);
  assert.match(readHitSummary, /scene-28-1373/);
  assert.match(readHitSummary, /1-4 日 内 医院办公室/);

  // 2. script.read 返回 0 段空结果或失败：明确提示未读取到有效正文/失败原因
  const readEmptySummary = summarizeToolOutputForStateNode('script.read', 'succeeded', {
    episodeCount: 0,
    sceneCount: 0,
    paragraphCount: 0,
    episodes: [],
  });
  assert.match(readEmptySummary, /未读取到有效正文/);

  const readFailedSummary = summarizeToolOutputForStateNode('script.read', 'failed', undefined, '未匹配到符合条件');
  assert.match(readFailedSummary, /失败: 未匹配到符合条件/);

  // 3. asset.create / asset.update 返回精确资产与版本 ID、出处数量
  const createSummary = summarizeToolOutputForStateNode('asset.create', 'succeeded', {
    createdCount: 1,
    items: [{ id: 'char_bram_1', name: '布拉姆', versions: [{ id: 'char_bram_1_v2', name: '晚宴礼服' }] }],
  });
  assert.match(createSummary, /char_bram_1/);
  assert.match(createSummary, /晚宴礼服:char_bram_1_v2/);

  const updateSummary = summarizeToolOutputForStateNode('asset.update', 'succeeded', {
    provenanceBoundCount: 8,
    item: { id: 'char_bram_1', name: '布拉姆', versions: [{ id: 'char_bram_1', name: '常服' }, { id: 'char_bram_1_v2', name: '晚宴礼服' }] },
  });
  assert.match(updateSummary, /char_bram_1/);
  assert.match(updateSummary, /出处:8条/);
  assert.match(updateSummary, /版本:2个/);

  // 4. 多版本 asset.update（顶层 verifiedProvenance 仅为默认版本 2 条，全部版本合计 5 条且 verifiedCount=5）与 asset.list 摘要同步全量出处与版本列表
  const multiVersionItem = {
    id: 'char_natalia_1',
    name: '娜塔莉亚',
    verifiedProvenance: [
      { sceneTitle: '1-1 日 内 娜塔莉亚家', lineNumber: 3 },
      { sceneTitle: '1-1 日 内 娜塔莉亚家', lineNumber: 4 },
    ],
    versions: [
      {
        id: 'char_natalia_1',
        name: '常服',
        verifiedProvenance: [
          { sceneTitle: '1-1 日 内 娜塔莉亚家', lineNumber: 3 },
          { sceneTitle: '1-1 日 内 娜塔莉亚家', lineNumber: 4 },
        ],
      },
      {
        id: 'char_natalia_1_v1',
        name: '8岁童年',
        verifiedProvenance: [{ sceneTitle: '1-6 夜 内 卧室（闪回）', lineNumber: 3 }],
      },
      {
        id: 'char_natalia_1_v2',
        name: '应聘职业装',
        verifiedProvenance: [
          { sceneTitle: '1-7 日 内 科尔多瓦家客厅', lineNumber: 4 },
          { sceneTitle: '1-7 日 内 科尔多瓦家客厅', lineNumber: 6 },
        ],
      },
    ],
  };

  const multiVersionUpdateSummary = summarizeToolOutputForStateNode('asset.update', 'succeeded', {
    item: multiVersionItem,
    verifiedCount: 5,
  });
  assert.match(multiVersionUpdateSummary, /出处:5条/);
  assert.match(multiVersionUpdateSummary, /版本:3个\(常服:char_natalia_1,8岁童年:char_natalia_1_v1,应聘职业装:char_natalia_1_v2\)/);

  const listSummary = summarizeToolOutputForStateNode('asset.list', 'succeeded', {
    total: 1,
    items: [multiVersionItem],
  });
  assert.match(listSummary, /出处:5条/);
  assert.match(listSummary, /versions:\[常服:char_natalia_1,8岁童年:char_natalia_1_v1,应聘职业装:char_natalia_1_v2\]/);
});

