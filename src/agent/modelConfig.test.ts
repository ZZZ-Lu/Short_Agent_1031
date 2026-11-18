import test from 'node:test';
import assert from 'node:assert/strict';
import { applyThinkingPayload, resolveAgentTurnMaxTokens, resolveModelConfig } from './modelConfig';

test('resolveModelConfig maps deepseek-v4-flash non-thinking and thinking tiers correctly', () => {
  const env = { DEEPSEEK_API_KEY: 'sk-ds-test' };

  const base = resolveModelConfig('deepseek-v4-flash', undefined, env);
  assert.equal(base.provider, 'deepseek');
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

test('resolveModelConfig routes to gemini-4-hydrogen when only GEMINI_API_KEY is available', () => {
  const geminiOnlyEnv = { GEMINI_API_KEY: 'AIza-test-key' };

  const base = resolveModelConfig('deepseek-v4-flash', '   ', geminiOnlyEnv);
  assert.equal(base.provider, 'gemini');
  assert.equal(base.actualModel, 'gemini-4-hydrogen');
  assert.equal(base.apiKey, 'AIza-test-key');
  assert.equal(base.enableThinking, false);

  const low = resolveModelConfig('deepseek-v4-flash-low', undefined, geminiOnlyEnv);
  assert.equal(low.provider, 'gemini');
  assert.equal(low.actualModel, 'gemini-4-hydrogen');
  assert.equal(low.enableThinking, true);
  assert.equal(low.reasoningEffort, 'low');

  const explicitGemini = resolveModelConfig('gemini', undefined, geminiOnlyEnv);
  assert.equal(explicitGemini.provider, 'gemini');
  assert.equal(explicitGemini.actualModel, 'gemini-4-hydrogen');
});

test('applyThinkingPayload configures DeepSeek, DashScope, and Gemini parameters without invalid fields', () => {
  const dsEnabled = applyThinkingPayload(
    { model: 'deepseek-flash' },
    { endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: true, reasoningEffort: 'low', includeTemperatureWhenDisabled: 0.2 }
  );
  assert.deepEqual(dsEnabled.thinking, { type: 'enabled' });
  assert.equal(dsEnabled.reasoning_effort, 'low');
  assert.equal('temperature' in dsEnabled, false);
  assert.equal('enable_thinking' in dsEnabled, false);
  assert.equal('extra_body' in dsEnabled, false);

  const dsDisabled = applyThinkingPayload(
    { model: 'deepseek-flash' },
    { endpoint: 'https://api.deepseek.com/chat/completions', enableThinking: false, reasoningEffort: 'low', includeTemperatureWhenDisabled: 0.2 }
  );
  assert.deepEqual(dsDisabled.thinking, { type: 'disabled' });
  assert.equal(dsDisabled.reasoning_effort, 'none');
  assert.equal(dsDisabled.temperature, 0.2);
  assert.equal('extra_body' in dsDisabled, false);

  const dashEnabled = applyThinkingPayload(
    { model: 'ZHIPU/GLM-5.3-Flash' },
    { endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', enableThinking: true, reasoningEffort: 'high' }
  );
  assert.equal(dashEnabled.enable_thinking, true);
  assert.equal(dashEnabled.reasoning_effort, 'high');
  assert.equal('extra_body' in dashEnabled, false);

  const geminiDisabled = applyThinkingPayload(
    { model: 'gemini-4-hydrogen' },
    { endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', enableThinking: false, includeTemperatureWhenDisabled: 0.2 }
  );
  assert.equal('thinking' in geminiDisabled, false);
  assert.equal('enable_thinking' in geminiDisabled, false);
  assert.equal('extra_body' in geminiDisabled, false);
  assert.equal('reasoning_effort' in geminiDisabled, false);

  const geminiEnabledMax = applyThinkingPayload(
    { model: 'gemini-4-hydrogen' },
    { endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', enableThinking: true, reasoningEffort: 'max' }
  );
  assert.equal(geminiEnabledMax.reasoning_effort, 'high');
  assert.equal('thinking' in geminiEnabledMax, false);
  assert.equal('extra_body' in geminiEnabledMax, false);
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
