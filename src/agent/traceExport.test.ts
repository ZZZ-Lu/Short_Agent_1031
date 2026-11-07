import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRuntimeTraceExport,
  getPresetExportOptions,
  truncateDeepValue,
} from './traceExport';
import type { AgentRuntimeTrace } from './debugTrace';

const mockTrace: AgentRuntimeTrace = {
  id: 'trace_1',
  taskId: 'task_1',
  goal: '提取第一集布拉姆的角色资产',
  createdAt: 1793870000000,
  updatedAt: 1793870008000,
  task: {
    id: 'task_1',
    sessionId: 'sess_1',
    summary: '提取完成',
    title: '布拉姆资产提取',
    goal: '提取第一集布拉姆的角色资产',
    subGoal: '完成角色创建',
    progress: '已完成',
    status: 'completed',
    turn: 2,
    plan: [{ id: '1', title: '读取剧本并创建资产', status: 'completed' }],
    notes: '第一集1-5登场',
    history: [],
    observations: [],
    pendingCallIds: [],
    negotiationLog: [],
    lastGoalUpdatedAt: 0,
    lastUserInputAt: 0,
    context: { level: 1, tools: ['script.read', 'asset.create'], prompts: ['script', 'assets'] },
    events: [
      {
        id: 'ev_1',
        taskId: 'task_1',
        turnId: 'turn_1',
        type: 'tool',
        toolName: 'sys.selectContext',
        text: '调用 sys.selectContext',
        status: 'succeeded',
        createdAt: 1793870002000,
        input: { level: 1, tools: ['script.read', 'asset.create'], prompts: ['script', 'assets'] },
        output: { level: 1, tools: ['script.read', 'asset.create'], prompts: ['script', 'assets'] },
      },
      {
        id: 'ev_2',
        taskId: 'task_1',
        turnId: 'turn_2',
        type: 'tool',
        toolName: 'asset.create',
        text: '调用 asset.create',
        status: 'succeeded',
        createdAt: 1793870007000,
        input: {
          type: 'characters',
          name: '布拉姆',
          provenances: [{ sceneTitle: '1-5', evidenceText: '▲布拉姆衣着华丽，随意把玩着手中的手枪。' }],
        },
        output: {
          success: true,
          createdCount: 1,
          longScriptContent: 'A'.repeat(1200),
        },
      },
    ],
  },
  turns: [
    {
      id: 'turn_1',
      turn: 1,
      requireTool: false,
      startedAt: 1793870000000,
      completedAt: 1793870003000,
      taskBefore: {} as any,
      transport: {
        request: {
          model: 'deepseek-v4-flash',
          tools: [],
          context: { level: 0, tools: ['sys.selectContext'], prompts: [] },
          messages: [{ role: 'user', content: '# 系统提示词第1轮全文' }],
        },
        response: {
          toolCalls: [],
          content: '状态检查：\n{需注入工具}\n思考：\n先注入剧本与资产工具。\n工具调用：\n{{调用 sys.selectContext, {"level": 1, "tools": ["script.read", "asset.create"], "prompts": ["script", "assets"]}}}',
        },
      },
    },
    {
      id: 'turn_2',
      turn: 2,
      requireTool: false,
      startedAt: 1793870003500,
      completedAt: 1793870008000,
      taskBefore: {} as any,
      transport: {
        request: {
          model: 'deepseek-v4-flash',
          tools: [],
          context: { level: 1, tools: ['script.read', 'asset.create'], prompts: ['script', 'assets'] },
          messages: [{ role: 'user', content: '# 系统提示词第2轮全文' }],
        },
        response: {
          toolCalls: [],
          content: '状态检查：\n{已读取剧本}\n思考：\n创建布拉姆资产。\n工具调用：\n{{调用 asset.create, {"type": "characters", "name": "布拉姆"}}}',
        },
      },
      stateNodeTrace: {
        prompt: '状态提取节点输入',
        response: { taskTitle: '布拉姆资产提取' },
      },
    },
  ],
};

test('diagnostic preset exports all turns with model output and tool inputs/outputs while omitting repetitive full prompts', () => {
  const opts = getPresetExportOptions('diagnostic', 'markdown');
  const md = formatRuntimeTraceExport(mockTrace, opts);

  assert.ok(md.includes('# 任务运行追踪明细（共 2 轮）：布拉姆资产提取'));
  assert.ok(md.includes('## 第 1 轮'));
  assert.ok(md.includes('## 第 2 轮'));
  assert.ok(md.includes('sys.selectContext'));
  assert.ok(md.includes('asset.create'));
  assert.ok(md.includes('▲布拉姆衣着华丽，随意把玩着手中的手枪。'));
  assert.equal(md.includes('# 系统提示词第1轮全文'), false, '诊断预设默认不重复展开完整系统Prompt');
});

test('io_only preset exports full prompt and model raw output while omitting tool execution blocks', () => {
  const opts = getPresetExportOptions('io_only', 'markdown');
  const md = formatRuntimeTraceExport(mockTrace, opts);

  assert.ok(md.includes('# 系统提示词第1轮全文'));
  assert.ok(md.includes('# 系统提示词第2轮全文'));
  assert.ok(md.includes('[第 1 轮] 模型原始输出'));
  assert.equal(md.includes('工具调用记录'), false);
});

test('smart truncation folds overly long string fields in tool output when enabled', () => {
  const opts = {
    ...getPresetExportOptions('diagnostic', 'markdown'),
    truncateLongToolOutput: true,
    maxToolOutputChars: 300,
  };
  const md = formatRuntimeTraceExport(mockTrace, opts);
  assert.ok(md.includes('已折叠中间'));

  const folded = truncateDeepValue('X'.repeat(1000), 300) as string;
  assert.ok(folded.length < 450);
  assert.ok(folded.includes('总长 1000 字符'));
});

test('single-turn filter exports only the specified turn', () => {
  const opts = getPresetExportOptions('full', 'markdown');
  const md = formatRuntimeTraceExport(mockTrace, opts, 'turn_2');

  assert.ok(md.includes('单轮运行追踪（第 2 轮）'));
  assert.ok(md.includes('## 第 2 轮'));
  assert.equal(md.includes('## 第 1 轮'), false);
  assert.ok(md.includes('状态提取节点输入'));
});

test('resolves final goal from trace.task.goal when top-level trace.goal was initially empty', () => {
  const traceWithEmptyInitialGoal: AgentRuntimeTrace = {
    ...mockTrace,
    goal: '',
  };
  const opts = getPresetExportOptions('diagnostic', 'markdown');
  const md = formatRuntimeTraceExport(traceWithEmptyInitialGoal, opts);
  assert.ok(md.includes('- **最终目标**：提取第一集布拉姆的角色资产'));
});

