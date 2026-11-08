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

test('updateStateNode 在本轮工具（如 sys.selectContext）执行完成后才运行，且 1 级必须回到 0 级才能调用 sys.endTask 结束任务', async () => {
  const seenInStateNode: Array<{ turn: number; level: number; toolStatus: string | undefined }> = [];
  const runtime = new AgentRuntime({
    enabledTools: () => ['script.directory', 'script.read', 'asset.create', 'sys.endTask', 'user.ask'],
    requestTurn: async task => {
      if (task.turn === 1) {
        return {
          narration: ['第1轮：0级展开script和asset候选分类'],
          toolCalls: [{ id: 'sel_cat', name: 'sys.selectContext', arguments: { level: 0, categories: ['script', 'asset'] } }],
          complete: false,
        };
      }
      if (task.turn === 2) {
        assert.equal(task.context.level, 0);
        assert.deepEqual(task.context.categories, ['script', 'asset']);
        return {
          narration: ['第2轮：挑选具体工具切入1级'],
          toolCalls: [{ id: 'sel_tools', name: 'sys.selectContext', arguments: { level: 1, tools: ['script.directory', 'script.read', 'asset.create'] } }],
          complete: false,
        };
      }
      if (task.turn === 3) {
        assert.equal(task.context.level, 1);
        assert.deepEqual(task.context.tools, ['script.directory', 'script.read', 'asset.create']);
        // 模拟模型在 1 级违规尝试直接调用 sys.endTask，应被 Runtime 拦截报错而不会结束任务
        return {
          narration: ['第3轮：尝试在1级直接结束任务（应被拦截）'],
          toolCalls: [{ id: 'illegal_end', name: 'sys.endTask', arguments: { success: true } }],
          complete: false,
        };
      }
      if (task.turn === 4) {
        assert.equal(task.context.level, 1);
        assert.equal((task.observations[0].content as any).status, 'failed');
        assert.ok(String((task.observations[0].content as any).error).includes('局部执行阶段，不可直接调用 sys.endTask'));
        return {
          narration: ['第4轮：无参调用 sys.selectContext 返回全局计划阶段'],
          toolCalls: [{ id: 'back_0', name: 'sys.selectContext', arguments: {} }],
          complete: false,
        };
      }
      // 第 5 轮回到 0 级后，正式调用 sys.endTask 成功结束
      assert.equal(task.context.level, 0);
      assert.deepEqual(task.context.tools, []);
      return {
        narration: ['第5轮：0级验收通过，结束任务'],
        toolCalls: [{ id: 'end_ok', name: 'sys.endTask', arguments: { success: true } }],
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
    },
    executeTool: async () => ({ ok: true }),
  });

  const task = runtime.createTask({ id: 'task_order', sessionId: 'proj_1', goal: '提取角色布拉姆' });
  const finished = await runtime.wake(task.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.turn, 5);
  assert.deepEqual(seenInStateNode[0], { turn: 1, level: 0, toolStatus: 'succeeded' });
  assert.deepEqual(seenInStateNode[1], { turn: 2, level: 1, toolStatus: 'succeeded' });
  assert.deepEqual(seenInStateNode[2], { turn: 3, level: 1, toolStatus: 'failed' });
  assert.deepEqual(seenInStateNode[3], { turn: 4, level: 0, toolStatus: 'succeeded' });
});

test('跨阶段观察保持与工具箱展开记忆：调用 sys.selectContext 切换阶段时保留上一阶段读取的业务数据与已展开分类', async () => {
  const runtime = new AgentRuntime({
    enabledTools: () => ['script.read', 'asset.create', 'sys.endTask', 'user.ask'],
    requestTurn: async task => {
      if (task.turn === 1) {
        return {
          narration: ['展开 script 和 asset 分类'],
          toolCalls: [{ id: 'c1', name: 'sys.selectContext', arguments: { categories: ['script', 'asset'] } }],
          complete: false,
        };
      }
      if (task.turn === 2) {
        assert.deepEqual(task.context.categories, ['script', 'asset']);
        return {
          narration: ['先装载 script.read 进入执行阶段读取剧本'],
          toolCalls: [{ id: 'c2', name: 'sys.selectContext', arguments: { tools: ['script.read'] } }],
          complete: false,
        };
      }
      if (task.turn === 3) {
        assert.equal(task.context.level, 1);
        return {
          narration: ['调用 script.read 读取第一集'],
          toolCalls: [{ id: 'c3', name: 'script.read', arguments: { offset: 52, limit: 35 } }],
          complete: false,
        };
      }
      if (task.turn === 4) {
        // 第4轮看到 script.read 结果后，退出局部执行返回计划阶段准备切换 asset.create
        assert.equal(task.observations.some(o => (o.content as any).name === 'script.read'), true);
        return {
          narration: ['读取完毕，返回计划阶段切换 asset.create'],
          toolCalls: [{ id: 'c4', name: 'sys.selectContext', arguments: {} }],
          complete: false,
        };
      }
      if (task.turn === 5) {
        // 关键验证1：返回全局计划阶段后，第1轮展开的 ['script', 'asset'] 分类依然保留，无需再次展开分类！
        assert.equal(task.context.level, 0);
        assert.deepEqual(task.context.categories, ['script', 'asset']);
        // 关键验证2：第3轮读取的 script.read 观察结果在跨阶段切换后依然保留！
        assert.equal(task.observations.some(o => (o.content as any).name === 'script.read'), true);
        return {
          narration: ['直接从已展开的候选简表装载 asset.create 进入执行阶段'],
          toolCalls: [{ id: 'c5', name: 'sys.selectContext', arguments: { tools: ['asset.create'] } }],
          complete: false,
        };
      }
      if (task.turn === 6) {
        // 关键验证3：进入 asset.create 执行阶段时，script.read 的原文观察结果依然在当前视野中，无需盲写！
        assert.equal(task.context.level, 1);
        assert.equal(task.observations.some(o => (o.content as any).name === 'script.read'), true);
        return {
          narration: ['对照原文直接调用 asset.create'],
          toolCalls: [{ id: 'c6', name: 'asset.create', arguments: { type: 'characters', name: '布拉姆' } }],
          complete: false,
        };
      }
      if (task.turn === 7) {
        // 调用业务工具 asset.create 后，旧的 script.read 已被消费替换，当前观察为 asset.create
        const obsNames = task.observations.map(o => (o.content as any).name);
        assert.deepEqual(obsNames, ['asset.create']);
        return {
          narration: ['创建完成，返回全局计划阶段'],
          toolCalls: [{ id: 'c7', name: 'sys.selectContext', arguments: {} }],
          complete: false,
        };
      }
      // 第8轮全局计划阶段依然能直接看到 asset.create 的执行结果并结案
      assert.equal(task.observations.some(o => (o.content as any).name === 'asset.create'), true);
      return {
        narration: ['全局验收通过，结案'],
        toolCalls: [{ id: 'c8', name: 'sys.endTask', arguments: { success: true } }],
        complete: false,
      };
    },
    executeTool: async call => {
      if (call.name === 'script.read') return { offset: 52, total: 100, content: '▲布拉姆打量着娜塔莉亚。' };
      if (call.name === 'asset.create') return { success: true, createdCount: 1 };
      return { ok: true };
    },
  });

  const task = runtime.createTask({ id: 'task_cross_stage', sessionId: 'proj_1', goal: '提取角色布拉姆' });
  const finished = await runtime.wake(task.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.turn, 8);
});

test('执行阶段持续推进：script.read 读取剧本后若先调用 asset.list 查重，未消费的 script.read 原文观察自动保留至 asset.create', async () => {
  const runtime = new AgentRuntime({
    enabledTools: () => ['script.read', 'asset.list', 'asset.create', 'sys.endTask', 'user.ask'],
    requestTurn: async task => {
      if (task.turn === 1) {
        return {
          narration: ['展开分类并制定计划'],
          plan: [
            { id: 's1', title: '读取第一集剧本并核查娜塔莉亚出场段落' },
            { id: 's2', title: '查重并创建娜塔莉亚角色资产' },
          ],
          toolCalls: [{ id: 'c1', name: 'sys.selectContext', arguments: { categories: ['script', 'asset'], tools: ['script.read', 'asset.list', 'asset.create'] } }],
          complete: false,
        };
      }
      if (task.turn === 2) {
        assert.equal(task.context.level, 1);
        assert.equal(task.plan.length, 2);
        return {
          narration: ['读取第一集结构化剧本'],
          toolCalls: [{ id: 'c2', name: 'script.read', arguments: { episode: 1 } }],
          complete: false,
        };
      }
      if (task.turn === 3) {
        // 第3轮：看到 script.read 结果后，在执行阶段调用 asset.list 检查是否已存在同名资产
        assert.equal(task.observations.some(o => (o.content as any).name === 'script.read'), true);
        return {
          narration: ['先调用 asset.list 检查娜塔莉亚是否已存在'],
          toolCalls: [{ id: 'c3', name: 'asset.list', arguments: { type: 'characters', query: '娜塔莉亚' } }],
          complete: false,
        };
      }
      if (task.turn === 4) {
        // 关键验证：即使第3轮调用了 asset.list，尚未被写入消费的 script.read 结构化原文依然保留在 task.observations 中！
        const obsNames = task.observations.map(o => (o.content as any).name);
        assert.deepEqual(obsNames, ['script.read', 'asset.list']);
        return {
          narration: ['对照保留的 script.read 原文段落直接创建娜塔莉亚资产'],
          toolCalls: [{ id: 'c4', name: 'asset.create', arguments: { type: 'characters', name: '娜塔莉亚' } }],
          complete: false,
        };
      }
      if (task.turn === 5) {
        // asset.create 执行后，之前的只读观察被消费替换，当前观察为 asset.create
        const obsNames = task.observations.map(o => (o.content as any).name);
        assert.deepEqual(obsNames, ['asset.create']);
        return {
          narration: ['计划步骤全部完成，返回0级结案'],
          toolCalls: [{ id: 'c5', name: 'sys.selectContext', arguments: {} }],
          complete: false,
        };
      }
      return {
        narration: ['验收通过，结束任务'],
        toolCalls: [{ id: 'c6', name: 'sys.endTask', arguments: { success: true } }],
        complete: false,
      };
    },
    executeTool: async call => {
      if (call.name === 'script.read') return { totalEpisodes: 1, totalScenes: 1, totalParagraphs: 1, episodes: [] };
      if (call.name === 'asset.list') return { total: 0, items: [] };
      if (call.name === 'asset.create') return { success: true, createdCount: 1 };
      return { ok: true };
    },
  });

  const task = runtime.createTask({ id: 'task_keep_script_obs', sessionId: 'proj_1', goal: '提取娜塔莉亚角色' });
  const finished = await runtime.wake(task.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.turn, 6);
});

test('短剧多项数据自适应分步操作与数据量预警全链路测试：0级宏观探查 -> 1级数据量预警 -> 0级动态重规划 -> 1级分场执行 -> 0级完结', async () => {
  const recordedPlans: string[][] = [];

  const runtime = new AgentRuntime({
    enabledTools: () => ['script.search', 'script.read', 'asset.create', 'asset.update', 'sys.endTask', 'user.ask'],
    requestTurn: async task => {
      // 记录当前轮次的计划标题
      recordedPlans.push((task.plan || []).map(p => p.title));

      if (task.turn === 1) {
        // 第1轮：0级全局规划，建立宏观探查计划
        return {
          narration: ['制定宏观探查计划，先下探剧本检索数据'],
          plan: [
            { id: 'step_1', title: '探查剧本数据', status: 'pending' },
            { id: 'step_2', title: '提取资产', status: 'pending' },
            { id: 'step_3', title: '全局核验', status: 'pending' },
          ],
          toolCalls: [{ id: 'c1', name: 'sys.selectContext', arguments: { tools: ['script.search'] } }],
          complete: false,
        };
      }

      if (task.turn === 2) {
        // 第2轮：1级执行阶段，调用 script.search 进行探查
        assert.equal(task.plan[0].title, '探查剧本数据');
        return {
          narration: ['搜索剧本中娜塔莉亚的相关段落'],
          toolCalls: [{ id: 'c2', name: 'script.search', arguments: { query: '娜塔莉亚' } }],
          complete: false,
        };
      }

      if (task.turn === 3) {
        // 第3轮：由于工具 script.search 触发预警，Runtime 已自动直接切回 0 级全局规划！
        assert.equal(task.context?.level, 0, '工具预警后 Runtime 必须已自动切回 0 级全局规划');
        assert.equal(task.thinkingLevel, 0, 'thinkingLevel 必须已同步为 0');
        const searchObs = task.observations.find(o => (o.content as any).name === 'script.search')?.content as any;
        assert.equal(searchObs.output.hasVolumeWarning, true);
        assert.equal(searchObs.output.autoReturnedToLevel0, true, '输出中必须标记 autoReturnedToLevel0 为 true');
        assert.equal(searchObs.output.scenesSummary.length, 2);

        // 0级直接基于 scenesSummary 进行按场次动态重规划，省去多余的一轮 sys.selectContext 往返
        return {
          narration: ['检测到系统因数据量预警自动切回0级，根据场景分布概览细化拆解计划为按场次执行与增量提交'],
          plan: [
            { id: 'step_1', title: '探查剧本数据 (已完成，发现跨2场共18处)', status: 'completed' },
            { id: 'step_2', title: '提取第1-1场娜塔莉亚信息并创建资产', status: 'pending' },
            { id: 'step_3', title: '提取第1-2场娜塔莉亚信息并增量更新资产', status: 'pending' },
            { id: 'step_4', title: '全局核验并结束', status: 'pending' },
          ],
          toolCalls: [{ id: 'c3', name: 'sys.selectContext', arguments: { tools: ['asset.create', 'asset.update'] } }],
          complete: false,
        };
      }

      if (task.turn === 4) {
        // 第4轮：1级执行第1-1场
        return {
          narration: ['执行第1-1场娜塔莉亚提取并创建资产'],
          toolCalls: [{ id: 'c4', name: 'asset.create', arguments: { type: 'characters', name: '娜塔莉亚' } }],
          complete: false,
        };
      }

      if (task.turn === 5) {
        // 第5轮：1级分场执行中调用 script.read（如读取 1-5 匹配到 2 个同名场次返回 hasVolumeWarning: true），
        // 由于此前已完成预警拆解并已进入分步执行，不应再次强制踢回 0 级
        return {
          narration: ['读取第1-2场剧本正文'],
          toolCalls: [
            { id: 'c5_0', name: 'script.read', arguments: { scene: '1-5' } },
          ],
          complete: false,
        };
      }

      if (task.turn === 6) {
        // 第6轮：验证上一轮 script.read 未被强制踢回 0 级，仍保持在 1 级直接执行 asset.update
        assert.equal(task.context?.level, 1, '已进入分步执行阶段后，script.read 不应重复强制踢回 0 级');
        assert.equal(task.thinkingLevel, 1, 'thinkingLevel 应保持在 1 级');
        const readObs = task.observations.find(o => (o.content as any).name === 'script.read')?.content as any;
        assert.equal(Boolean(readObs.output.autoReturnedToLevel0), false, '不应标记 autoReturnedToLevel0');
        return {
          narration: ['执行第1-2场娜塔莉亚提取并增量追加'],
          toolCalls: [
            { id: 'c5_1', name: 'asset.update', arguments: { id: 'char_nat', mode: 'append' } },
            { id: 'c5_2', name: 'sys.selectContext', arguments: {} },
          ],
          complete: false,
        };
      }

      if (task.turn === 7) {
        // 第7轮：0级全局核验，完结任务
        return {
          narration: ['核验完成，结束任务'],
          plan: [
            { id: 'step_1', title: '探查剧本数据 (已完成，发现跨2场共18处)', status: 'completed' },
            { id: 'step_2', title: '提取第1-1场娜塔莉亚信息并创建资产', status: 'completed' },
            { id: 'step_3', title: '提取第1-2场娜塔莉亚信息并增量更新资产', status: 'completed' },
            { id: 'step_4', title: '全局核验并结束', status: 'completed' },
          ],
          toolCalls: [{ id: 'c6', name: 'sys.endTask', arguments: { success: true } }],
          complete: false,
        };
      }

      throw new Error(`Unexpected turn ${task.turn}`);
    },
    executeTool: async call => {
      if (call.name === 'script.search') {
        return {
          total: 18,
          hasVolumeWarning: true,
          warning: '⚠️ 检测到检索结果数据量较大（共 18 项，跨 2 个场次）。',
          scenesSummary: [
            { sceneNumber: '1-1', sceneTitle: '1-1 夜 内 储藏室', matchCount: 8, lineRange: [3, 8], matchIndices: [1, 2, 3, 4, 5, 6, 7, 8] },
            { sceneNumber: '1-2', sceneTitle: '1-2 日 内 客厅', matchCount: 10, lineRange: [10, 18], matchIndices: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
          ],
          results: [],
        };
      }
      if (call.name === 'script.read') {
        return {
          sceneCount: 2,
          paragraphCount: 42,
          hasVolumeWarning: true,
          warning: '匹配到 2 个场次共 42 个段落',
          episodes: [],
        };
      }
      if (call.name === 'asset.create') return { success: true, createdId: 'char_nat' };
      if (call.name === 'asset.update') return { success: true, updatedId: 'char_nat' };
      return { ok: true };
    },
  });

  const task = runtime.createTask({ id: 'task_adaptive_replanning', sessionId: 'proj_adapt', goal: '提取娜塔莉亚角色' });
  const finished = await runtime.wake(task.id);
  assert.equal(finished.status, 'completed');
  assert.equal(finished.turn, 7);
  // 验证计划动态细化生效：第1轮提交宏观计划后第2轮持有3项，第3轮重规划后第4轮细化为4项且包含场次分步
  assert.equal(recordedPlans[1].length, 3);
  assert.equal(recordedPlans[3].length, 4);
  assert.ok(recordedPlans[3][1].includes('第1-1场'));
  assert.ok(recordedPlans[3][2].includes('第1-2场'));
});




