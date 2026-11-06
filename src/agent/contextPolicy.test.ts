import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AgentRuntime } from './runtime';
import { cleanToolOutputForPrompt, initialAgentContext, mergeTaskNotes, resolveContext, validateSelection } from './contextPolicy';

test('首轮仅注入系统控制工具，后续按选择和设置过滤', () => {
  const enabled = ['script.read', 'asset.list', 'sys.endTask', 'user.ask'];
  const initial = resolveContext(initialAgentContext(), enabled);
  assert.equal(initial.level, 0);
  assert(!initial.tools.includes('script.read'));
  assert(initial.tools.includes('sys.selectContext'));
  const selection = validateSelection({ level: 1, tools: ['script.read'], prompts: ['script'] }, enabled);
  assert(resolveContext(selection, enabled).tools.includes('script.read'));
  assert(!resolveContext(selection, []).tools.includes('script.read'));
  assert.throws(() => validateSelection({ level: 1, tools: ['unknown'], prompts: [] }, enabled));
  assert.throws(() => validateSelection({ level: 1, tools: [], prompts: ['unknown'] }, enabled));
});

test('上下文选择在下一轮生效，并可回到全局层级', async () => {
  const seen: number[] = [];
  const runtime = new AgentRuntime({
    enabledTools: () => ['script.read'],
    requestTurn: async task => {
      seen.push(task.context.level);
      if (task.turn === 1) return { narration: [], complete: false, toolCalls: [{ id: 'a', name: 'sys.selectContext', arguments: { level: 1, tools: ['script.read'], prompts: ['script'] } }] };
      if (task.turn === 2) {
        assert.deepEqual(task.context.tools, ['script.read']);
        return { narration: [], complete: false, toolCalls: [{ id: 'b', name: 'sys.selectContext', arguments: { level: 0, tools: [], prompts: [] } }] };
      }
      return { narration: [], complete: true, toolCalls: [] };
    },
    executeTool: async () => { throw new Error('系统选择不应进入业务执行器'); },
  });
  const task = runtime.createTask({ id: 't', sessionId: 'p', goal: '读取剧本' });
  const result = await runtime.wake(task.id);
  assert.deepEqual(seen, [0, 1, 0]);
  assert.equal(result.status, 'completed');
  assert(result.events.some(event => event.toolName === 'sys.selectContext' && event.status === 'succeeded'));
});

test('按工具分类 categories 装载时自动展开具体工具并自动关联领域提示词，无需手动传 prompts', () => {
  const enabled = ['script.directory', 'script.read', 'asset.create', 'sys.endTask', 'user.ask'];
  const sel = validateSelection({ level: 1, categories: ['script', 'asset'] }, enabled);
  assert.equal(sel.level, 1);
  assert.deepEqual(sel.tools, ['script.directory', 'script.read', 'asset.create']);
  assert.deepEqual(sel.prompts, ['script', 'assets']);

  // Also compatible when model passes category names inside tools array
  const selCompat = validateSelection({ level: 1, tools: ['script', 'assets'] }, enabled);
  assert.deepEqual(selCompat.tools, ['script.directory', 'script.read', 'asset.create']);
  assert.deepEqual(selCompat.prompts, ['script', 'assets']);
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
      lineNumber: 14,
      evidenceText: '▲娜塔莉亚死死握着书信，眼泪落在照片上。',
    },
  ]);
});

