import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AgentRuntime } from './runtime';

test('runtime context delivery and observation persistence', async () => {
  const runtime = new AgentRuntime({
    requestTurn: async task => {
      if (task.turn === 1) {
        assert.equal(task.history.length, 0);
        return { narration: [], progress: '正在核实起始集数', plan: [{ id: 'verify', title: '核实首集' }], toolCalls: [{ id: 'one', name: 'page.inspect', arguments: {} }], complete: false };
      }
      if (task.turn === 2) {
        assert.equal(task.progress, '正在核实起始集数');
        assert.equal(task.plan[0].id, 'verify');
        assert.equal(task.history.length, 0);
        assert.equal(task.observations.length, 1);
        return { narration: [], progress: '仍需核实首集', failureSummaries: ['此前观察未显示首集'], toolCalls: [{ id: 'two', name: 'page.inspect', arguments: {} }], complete: false };
      }
      assert.equal(task.observations.length, 1);
      assert.equal((task.observations[0].content as { callId: string }).callId, 'two');
      assert.equal(task.history.length, 1);
      assert.equal(task.progress, '仍需核实首集');
      return { narration: [], toolCalls: [], complete: true, response: '已核实' };
    },
    executeTool: async call => ({ observation: call.id }),
  });
  const task = runtime.createTask({ id: 'test', sessionId: 'test', goal: '核实集数' });
  const result = await runtime.wake(task.id);
  assert.equal(result.status, 'completed');
  assert.equal(result.turn, 3);
  assert.equal(result.history.length, 1);
  assert.equal(result.observations.length, 0);
});

test('multi-turn user.ask suspends to waiting_user, preserves prior observations, and resumes same task across multiple rounds', async () => {
  const executedTools: string[] = [];
  const runtime = new AgentRuntime({
    requestTurn: async task => {
      if (task.turn === 1) {
        return {
          narration: ['先读取候选片段'],
          toolCalls: [{ id: 'call_search', name: 'asset.searchProvenanceCandidates', arguments: { id: 'prop_1' } }],
          complete: false,
        };
      }
      if (task.turn === 2) {
        // Turn 2 sees the search candidates from Turn 1 and asks the user a question
        assert.equal(task.observations.length, 1);
        assert.equal((task.observations[0].content as any).name, 'asset.searchProvenanceCandidates');
        return {
          narration: ['发现第8集是铁链门，第17、18集是生日蛋糕画，先向用户确认'],
          speak: '仅保留17、18集可以吗？',
          response: '我核对了剧本，第8集是铁链门，只有第17、18集是生日蛋糕画，仅保留17、18集可以吗？',
          toolCalls: [
            { id: 'call_ask_1', name: 'user.ask', arguments: { question: '请确认是否只保留第17、18集？' } },
            { id: 'call_should_not_run', name: 'asset.commitProvenance', arguments: {} },
          ],
          complete: false,
        };
      }
      if (task.turn === 3) {
        // Turn 3 must receive BOTH the preserved search candidates AND the user.ask answer!
        const obsNames = task.observations.map(o => (o.content as any).name);
        assert.deepEqual(obsNames, ['asset.searchProvenanceCandidates', 'user.ask']);
        const askObs = (task.observations[1].content as any).output;
        assert.equal(askObs.answer, '是的，只保留17和18集');
        assert.ok(String(askObs.question).includes('17、18集'));
        // Ask a second follow-up question in Turn 3
        return {
          narration: ['再确认一下别名是否加上生日蛋糕画'],
          speak: '别名加上“生日蛋糕画”好吗？',
          toolCalls: [{ id: 'call_ask_2', name: 'user.ask', arguments: { question: '是否将“生日蛋糕画”加入别名？' } }],
          complete: false,
        };
      }
      if (task.turn === 4) {
        // Turn 4 still preserves the non-ask observation and has the latest user.ask answer
        const obsNames = task.observations.map(o => (o.content as any).name);
        assert.deepEqual(obsNames, ['asset.searchProvenanceCandidates', 'user.ask']);
        const askObs = (task.observations[1].content as any).output;
        assert.equal(askObs.answer, '好的，加上吧');
        return {
          narration: ['用户已完成两轮确认，正式提交出处'],
          speak: '已按确认提交17、18集出处',
          toolCalls: [
            { id: 'call_commit', name: 'asset.commitProvenance', arguments: { id: 'prop_1' } },
            { id: 'call_end', name: 'sys.endTask', arguments: { success: true } },
          ],
          complete: false,
        };
      }
      throw new Error(`Unexpected turn ${task.turn}`);
    },
    executeTool: async call => {
      executedTools.push(call.name);
      if (call.name === 'asset.searchProvenanceCandidates') {
        return { candidates: ['cand_17', 'cand_18'] };
      }
      if (call.name === 'user.ask') {
        return { question: call.arguments.question, status: 'waiting_user' };
      }
      return { ok: true };
    },
  });

  const task = runtime.createTask({ id: 'task_multi_ask', sessionId: 'proj_1', goal: '核验画（生日蛋糕）的剧本出处' });
  assert.equal(task.initialGoal, '核验画（生日蛋糕）的剧本出处');

  // First wake runs Turn 1 (search) -> Turn 2 (user.ask #1) and pauses at waiting_user
  const afterAsk1 = await runtime.wake(task.id);
  assert.equal(afterAsk1.id, 'task_multi_ask');
  assert.equal(afterAsk1.status, 'waiting_user');
  assert.equal(afterAsk1.turn, 2);
  assert.equal(afterAsk1.pendingAskCallId, 'call_ask_1');
  // Ensure the tool after user.ask in Turn 2 was NOT executed
  assert.deepEqual(executedTools, ['asset.searchProvenanceCandidates', 'user.ask']);

  // User replies to Ask #1 (even with cardContext attached)
  runtime.addUserInput(task.id, '是的，只保留17和18集', undefined, { cardId: 'card_1' });
  assert.equal(task.pendingAskCallId, undefined);
  assert.equal(task.status, 'planning');

  // Second wake runs Turn 3 (user.ask #2) and pauses at waiting_user again
  const afterAsk2 = await runtime.wake(task.id);
  assert.equal(afterAsk2.id, 'task_multi_ask');
  assert.equal(afterAsk2.status, 'waiting_user');
  assert.equal(afterAsk2.turn, 3);
  assert.equal(afterAsk2.pendingAskCallId, 'call_ask_2');

  // User replies to Ask #2
  runtime.addUserInput(task.id, '好的，加上吧');
  const finalTask = await runtime.wake(task.id);
  assert.equal(finalTask.id, 'task_multi_ask');
  assert.equal(finalTask.status, 'completed');
  assert.equal(finalTask.turn, 4);
  assert.equal(finalTask.initialGoal, '核验画（生日蛋糕）的剧本出处');
  assert.equal(finalTask.negotiationLog.filter(l => l.role === 'user').length, 3);
  assert.equal(finalTask.negotiationLog.filter(l => l.role === 'agent').length, 2);
});

test('0级首轮日常问候直接回复时，即使状态节点填充了 subGoal 也绝不误触发 sys.nudge 系统干预', async () => {
  const runtime = new AgentRuntime({
    requestTurn: async task => {
      assert.equal(task.turn, 1);
      return {
        narration: ['状态检查：用户打招呼\n思考：直接友好回应'],
        speak: '你好呀～想先从剧本还是生图开始？',
        response: '你好呀！我是 Mira，可以协助你完成从剧本到生图到视频的全流程。',
        toolCalls: [],
        complete: false,
      };
    },
    updateStateNode: async task => {
      task.title = '友好问候开场';
      task.goal = '你好';
      task.subGoal = '友好回应问候并引导用户说明需求';
      task.progress = '已完成开场问候回复';
    },
    executeTool: async () => ({}),
  });

  const task = runtime.createTask({ id: 'task_hello', sessionId: 'proj_1', goal: '你好' });
  const finished = await runtime.wake(task.id);
  assert.equal(finished.turn, 1);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.events.some(e => e.text.includes('系统干预')), false);
});

test('updateStateNode 在本轮工具（如 sys.selectContext）执行完成后才运行，确保下一轮认知状态准确反映工具已生效', async () => {
  const seenInStateNode: Array<{ turn: number; level: number; toolStatus: string | undefined }> = [];
  const runtime = new AgentRuntime({
    enabledTools: () => ['script.directory', 'script.read', 'asset.create', 'sys.endTask', 'user.ask'],
    requestTurn: async task => {
      if (task.turn === 1) {
        return {
          narration: ['切换至1级并装载script和asset'],
          toolCalls: [{ id: 'sel_1', name: 'sys.selectContext', arguments: { level: 1, categories: ['script', 'asset'] } }],
          complete: false,
        };
      }
      // 第 2 轮进入 requestTurn 时，updateStateNode 在第 1 轮工具执行后写入的进度与计划已生效
      assert.equal(task.context.level, 1);
      assert.equal(task.progress, '已切换至 1 级并装载 script, asset');
      return {
        narration: ['已完成'],
        toolCalls: [{ id: 'end_1', name: 'sys.endTask', arguments: { success: true } }],
        complete: false,
      };
    },
    updateStateNode: async task => {
      const turnToolEvent = task.events.find(e => e.turnId === `${task.id}:turn:${task.turn}` && e.type === 'tool');
      seenInStateNode.push({
        turn: task.turn,
        level: task.context.level,
        toolStatus: turnToolEvent?.status,
      });
      if (task.turn === 1) {
        task.progress = `已切换至 ${task.context.level} 级并装载 ${(task.context.categories || []).join(', ')}`;
      }
    },
    executeTool: async () => ({ ok: true }),
  });

  const task = runtime.createTask({ id: 'task_order', sessionId: 'proj_1', goal: '提取角色布拉姆' });
  const finished = await runtime.wake(task.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.turn, 2);
  assert.deepEqual(seenInStateNode[0], {
    turn: 1,
    level: 1,
    toolStatus: 'succeeded',
  });
});


