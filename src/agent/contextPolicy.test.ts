import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AgentRuntime } from './runtime';
import { initialAgentContext, resolveContext, validateSelection } from './contextPolicy';

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
