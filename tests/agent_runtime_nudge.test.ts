import assert from 'node:assert/strict';
import test from 'node:test';
import { AgentRuntime } from '../src/agent/runtime';
import type { AgentTurnResult } from '../src/agent/protocol';

test('AgentRuntime: Ongoing multi-step task with missing toolCalls triggers nudge and self-corrects', async () => {
  let requireToolPassedTurn2 = false;
  let nudgeObservationSeenTurn2 = false;

  const runtime = new AgentRuntime({
    requestTurn: async (task, requireTool) => {
      if (task.turn === 1) {
        // Turn 1: Model creates a plan with pending items and runs an initial inspection
        return {
          narration: ['分析需求并建立计划'],
          plan: [
            { id: '1', title: '查看剧本资产', status: 'completed' },
            { id: '2', title: '更新道具归属', status: 'pending' },
          ],
          toolCalls: [{ id: 'c1', name: 'asset.list', arguments: { type: 'props' } }],
          complete: false,
        };
      }

      if (task.turn === 2) {
        // Turn 2: The model thinks and plans to update props, but forgets to output {{调用 ...}}
        requireToolPassedTurn2 = requireTool;
        // Check that sys.nudge observation was injected
        const nudgeObs = task.observations.find(obs => (obs.content as any)?.name === 'sys.nudge');
        nudgeObservationSeenTurn2 = Boolean(nudgeObs);

        return {
          narration: ['单条更新成功了！现在逐条修正剩余道具。先确认下道具列表拿到ID再更新。'],
          speak: '单条更新成功，正逐条修正其余道具归属～',
          toolCalls: [], // Missing tool calls!
          complete: false,
        };
      }

      if (task.turn === 3) {
        // Turn 3: Model receives the nudge, self-corrects, and calls sys.endTask or tool
        assert.equal(requireTool, true, 'Turn 3 must have requireTool=true due to recoveryCount > 0');
        const nudgeObs = task.observations.find(obs => (obs.content as any)?.name === 'sys.nudge');
        assert.ok(nudgeObs, 'Turn 3 must receive sys.nudge observation');

        return {
          narration: ['收到系统提示，继续执行道具更新并结束任务'],
          toolCalls: [{ id: 'c2', name: 'sys.endTask', arguments: { finalResponse: '道具归属已全部更新完毕。' } }],
          complete: false,
        };
      }

      throw new Error(`Unexpected turn ${task.turn}`);
    },
    executeTool: async call => ({ success: true, callId: call.id }),
  });

  const task = runtime.createTask({
    id: 'test_nudge_task',
    sessionId: 'session_1',
    goal: '提取第一集剧本中的资产并更新归属',
  });

  const result = await runtime.wake(task.id);

  assert.equal(result.status, 'completed', 'Task should eventually complete via sys.endTask');
  assert.equal(result.turn, 3, 'Task should have completed in turn 3 after nudging');
  assert.ok(result.events.some(e => e.type === 'system' && e.text.includes('系统干预')), 'Should have system intervention event');
});

test('AgentRuntime: Exhausting retries on missing toolCalls transitions to waiting_user, NEVER false completed', async () => {
  const runtime = new AgentRuntime({
    requestTurn: async (task, requireTool) => {
      if (task.turn === 1) {
        return {
          narration: ['规划任务'],
          plan: [{ id: 'step_1', title: '必须完成的步骤', status: 'pending' }],
          toolCalls: [{ id: 'init', name: 'asset.list', arguments: {} }],
          complete: false,
        };
      }

      // Subsequent turns keep returning empty toolCalls despite nudges
      return {
        narration: ['一直在思考，但始终没有输出调用'],
        speak: '我正在思考中...',
        toolCalls: [],
        complete: false,
      };
    },
    executeTool: async call => ({ success: true, callId: call.id }),
  });

  const task = runtime.createTask({
    id: 'test_exhaust_task',
    sessionId: 'session_2',
    goal: '未完成的任务',
  });

  const result = await runtime.wake(task.id);

  // Must NOT be marked completed!
  assert.notEqual(result.status, 'completed', 'Unfinished task must NEVER be marked completed on empty toolCalls');
  assert.equal(result.status, 'waiting_user', 'Task should safely pause in waiting_user');
  assert.ok(result.summary.includes('任务已暂停') || result.summary.includes('等待用户'), 'Summary should explain task paused for user guidance');
});

test('AgentRuntime: Single-turn conversational query without plan completes immediately', async () => {
  let turnsCount = 0;
  const runtime = new AgentRuntime({
    requestTurn: async () => {
      turnsCount++;
      return {
        narration: ['回答用户关于分镜的提问'],
        speak: '分镜卡片是影视制作中将剧本视听化的最小单元。',
        toolCalls: [],
        complete: false,
      };
    },
    executeTool: async () => ({}),
  });

  const task = runtime.createTask({
    id: 'test_chat_task',
    sessionId: 'session_3',
    goal: '什么是分镜卡片？',
  });

  const result = await runtime.wake(task.id);

  assert.equal(result.status, 'completed', 'Single-turn direct answer should complete');
  assert.equal(turnsCount, 1, 'Should complete in a single turn without nudging');
  assert.equal(result.summary, '分镜卡片是影视制作中将剧本视听化的最小单元。');
});
