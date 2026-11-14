import test from 'node:test';
import assert from 'node:assert/strict';
import { applyThinkingPayload, resolveAgentTurnMaxTokens, resolveModelConfig } from './modelConfig';

test('resolveModelConfig maps deepseek-v4-flash non-thinking and thinking tiers correctly', () => {
  const env = { DEEPSEEK_API_KEY: 'sk-ds-test' };

  const base = resolveModelConfig('deepseek-v4-flash', undefined, env);
  assert.equal(base.endpoint, 'https://api.deepseek.com/chat/completions');
  assert.equal(base.actualModel, 'deepseek-flash');
  assert.equal(base.enableThinking, false);

  const low = resolveModelConfig('deepseek-v4-flash-low', undefined, env);
  assert.equal(low.endpoint, 'https://api.deepseek.com/chat/completions');
  assert.equal(low.actualModel, 'deepseek-flash');
  assert.equal(low.enableThinking, true);
  assert.equal(low.reasoningEffort, 'low');

  const high = resolveModelConfig('deepseek-v4-flash-high', undefined, env);
  assert.equal(high.endpoint, 'https://api.deepseek.com/chat/completions');
  assert.equal(high.actualModel, 'deepseek-flash');
  assert.equal(high.enableThinking, true);
  assert.equal(high.reasoningEffort, 'high');

  const thinkingAlias = resolveModelConfig('deepseek-v4-flash-thinking', undefined, env);
  assert.equal(thinkingAlias.actualModel, 'deepseek-flash');
  assert.equal(thinkingAlias.enableThinking, true);
  assert.equal(thinkingAlias.reasoningEffort, 'high');
});

test('applyThinkingPayload configures DeepSeek thinking vs disabled parameters cleanly', () => {
  const dsEnabled = applyThinkingPayload(
    { model: 'deepseek-flash' },
    { endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: true, reasoningEffort: 'low', includeTemperatureWhenDisabled: 0.2 }
  );
  assert.deepEqual(dsEnabled.thinking, { type: 'enabled' });
  assert.equal(dsEnabled.reasoning_effort, 'low');
  assert.equal('temperature' in dsEnabled, false);
  assert.equal('enable_thinking' in dsEnabled, false);

  const dsDisabled = applyThinkingPayload(
    { model: 'deepseek-flash' },
    { endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: false, reasoningEffort: 'low', includeTemperatureWhenDisabled: 0.2 }
  );
  assert.deepEqual(dsDisabled.thinking, { type: 'disabled' });
  assert.equal(dsDisabled.reasoning_effort, 'none');
  assert.equal(dsDisabled.temperature, 0.2);

  const dashEnabled = applyThinkingPayload(
    { model: 'ZHIPU/GLM-5.3-Flash' },
    { endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', enableThinking: true, reasoningEffort: 'high' }
  );
  assert.equal(dashEnabled.enable_thinking, true);
  assert.equal(dashEnabled.reasoning_effort, 'high');
});

test('resolveAgentTurnMaxTokens raises ceiling for DeepSeek thinking mode', () => {
  assert.equal(
    resolveAgentTurnMaxTokens({ endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: false }),
    4096
  );
  assert.equal(
    resolveAgentTurnMaxTokens({ endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: true, reasoningEffort: 'low' }),
    65536
  );
  assert.equal(
    resolveAgentTurnMaxTokens({ endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: true, reasoningEffort: 'high' }),
    65536
  );
  assert.equal(
    resolveAgentTurnMaxTokens({ endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: true, reasoningEffort: 'max' }),
    131072
  );
  assert.equal(
    resolveAgentTurnMaxTokens({ endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', enableThinking: true, reasoningEffort: 'high' }),
    16384
  );
});

