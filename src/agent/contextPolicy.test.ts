import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AgentRuntime } from './runtime';
import { cleanToolOutputForPrompt, initialAgentContext, mergeTaskNotes, resolveContext, validateSelection } from './contextPolicy';

test('首轮仅注入系统控制工具，后续按选择和设置过滤，且1级不注入sys.endTask', () => {
  const enabled = ['script.read', 'asset.list', 'sys.endTask', 'user.ask'];
  const initial = resolveContext(initialAgentContext(), enabled);
  assert.equal(initial.level, 0);
  assert(!initial.tools.includes('script.read'));
  assert(initial.tools.includes('sys.selectContext'));
  assert(initial.tools.includes('sys.endTask'));

  const selection = validateSelection({ level: 1, tools: ['script.read'], prompts: ['script'] }, enabled);
  const resolvedLevel1 = resolveContext(selection, enabled);
  assert.equal(resolvedLevel1.level, 1);
  assert(resolvedLevel1.tools.includes('script.read'));
  assert(!resolvedLevel1.tools.includes('sys.endTask'));

  const backToLevel0 = validateSelection({ level: 0 }, enabled);
  const resolvedBack0 = resolveContext(backToLevel0, enabled);
  assert.equal(resolvedBack0.level, 0);
  assert.deepEqual(resolvedBack0.tools, ['sys.selectContext', 'sys.endTask', 'user.ask']);

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
});

test('mergeTaskNotes 按行去重并在进入具体任务后剔除开场占位笔记', () => {
  const existing = '- 用户尚未明确具体任务，等待用户选择从剧本、资产、生图或视频中哪一步开始。\n- 用户关心项目中女主角的身份信息；需从剧本与资产数据中查找确认。';
  const incoming = '- 用户尚未提供具体创作任务，当前仅关心项目中女主角身份。\n- 用户关心项目中女主角的身份信息；需从剧本与资产数据中查找确认。\n- 女主娜塔莉亚：22岁心理医生，玛莉的亲妹妹。';
  const merged = mergeTaskNotes(existing, incoming, 'append');
  assert.equal(
    merged,
    '- 用户关心项目中女主角的身份信息；需从剧本与资产数据中查找确认。\n- 女主娜塔莉亚：22岁心理医生，玛莉的亲妹妹。'
  );
});

test('cleanToolOutputForPrompt 裁剪 verifiedProvenance 内部锚点字段与 verifiedScriptHash', () => {
  const rawOutput = {
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
            sceneTitle: '第一集 1-2',
            matchedTerm: '▲娜塔莉亚死死握着书信，眼泪落在照片上。',
            evidenceText: '▲娜塔莉亚死死握着书信，眼泪落在照片上。',
            anchorText: 'is hellhole!)\n▲娜塔莉亚死死握着书信，眼泪落在照片上。\n娜塔莉亚（悲痛）',
            offsetInAnchor: 14,
            fallbackCharIndex: 526,
            lineNumber: 14,
          },
        ],
      },
    ],
  };

  const cleaned = cleanToolOutputForPrompt(rawOutput) as any;
  assert.equal(cleaned.items[0].verifiedScriptHash, undefined);
  assert.deepEqual(cleaned.items[0].verifiedProvenance, [
    {
      sceneTitle: '第一集 1-2',
      evidenceText: '▲娜塔莉亚死死握着书信，眼泪落在照片上。',
    },
  ]);
});

