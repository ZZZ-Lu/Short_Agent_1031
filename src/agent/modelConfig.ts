export interface ModelConfig {
  endpoint: string;
  actualModel: string;
  apiKey: string;
  stream?: boolean;
  enableThinking?: boolean;
  reasoningEffort?: 'low' | 'high' | 'max';
}

export function resolveModelConfig(
  modelType: string,
  userKey?: string,
  env: Record<string, string | undefined> = process.env
): ModelConfig {
  const normalized = (modelType || '').trim();
  const lower = normalized.toLowerCase();

  let endpoint = 'https://api.deepseek.com/chat/completions';
  let actualModel = 'deepseek-flash';
  let apiKey =
    userKey ||
    env.GEMINI_API_KEY ||
    env.DEEPSEEK_API_KEY ||
    env.DASHSCOPE_API_KEY ||
    env.ARK_API_KEY ||
    env.VOLCENGINE_API_KEY ||
    env.ZHIPU_API_KEY ||
    env.SILICONFLOW_API_KEY;
  let stream = true;
  let enableThinking = false;
  let reasoningEffort: 'low' | 'high' | 'max' = 'low';

  if (lower.includes('gemini') || normalized === 'gemini-2.5-flash' || normalized === 'gemini-2.5-pro') {
    endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    actualModel = lower.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    apiKey = userKey || env.GEMINI_API_KEY || env.DEEPSEEK_API_KEY;
    stream = true;
  } else if (normalized === 'deepseek-v4-pro' || lower.startsWith('deepseek-v4-pro')) {
    actualModel = 'deepseek-v4-pro';
    enableThinking = lower.includes('-thinking') || lower.includes('-low') || lower.includes('-high') || lower.includes('-max');
    reasoningEffort = lower.includes('-max') ? 'max' : lower.includes('-high') ? 'high' : 'low';
    stream = true;
  } else if (
    lower.startsWith('deepseek-v4-flash-') ||
    lower.startsWith('deepseek-flash-')
  ) {
    actualModel = 'deepseek-flash';
    enableThinking =
      lower.includes('-low') ||
      lower.includes('-high') ||
      lower.includes('-max') ||
      lower.includes('-thinking');
    if (lower.includes('-max')) {
      reasoningEffort = 'max';
    } else if (lower.includes('-high') || lower.includes('-thinking')) {
      reasoningEffort = 'high';
    } else {
      reasoningEffort = 'low';
    }
    stream = true;
  } else if (
    normalized === 'deepseek-v4-flash' ||
    normalized === 'deepseek-v4.1-flash-expires-on-0910' ||
    normalized === 'deepseek-flash' ||
    normalized === 'deepseek' ||
    normalized === 'auto'
  ) {
    if (
      (normalized === 'auto' || normalized === 'deepseek-v4-flash') &&
      env.GEMINI_API_KEY &&
      !env.DEEPSEEK_API_KEY &&
      !userKey
    ) {
      endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      actualModel = 'gemini-2.5-flash';
      apiKey = env.GEMINI_API_KEY;
      enableThinking = false;
      stream = true;
    } else {
      actualModel = 'deepseek-flash';
      enableThinking = false;
      stream = true;
    }
  } else if (normalized === 'qwen3.8-flash') {
    endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    actualModel = 'qwen3.8-flash';
    apiKey = userKey || env.DASHSCOPE_API_KEY || env.GEMINI_API_KEY || env.DEEPSEEK_API_KEY;
    stream = true;
  } else if (
    normalized === 'qwen3-vl-plus' ||
    normalized === 'qwen-vl-plus' ||
    lower.includes('qwen3-vl') ||
    lower.includes('vl-plus')
  ) {
    endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    actualModel = 'qwen3-vl-plus';
    apiKey = userKey || env.DASHSCOPE_API_KEY || env.GEMINI_API_KEY || env.DEEPSEEK_API_KEY;
    stream = true;
  } else if (
    normalized === 'doubao-seed-2-1-pro-260915' ||
    normalized === 'doubao-seed-2.1-pro' ||
    normalized === 'doubao-seed-2-1-pro' ||
    lower.includes('doubao') ||
    lower.includes('seed-2-1') ||
    lower.includes('seed-2.1') ||
    lower.includes('volces') ||
    lower.includes('ark')
  ) {
    endpoint = env.ARK_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    actualModel = env.ARK_MODEL_NAME || 'doubao-seed-2-1-pro-260915';
    apiKey = userKey || env.ARK_API_KEY || env.VOLCENGINE_API_KEY || env.GEMINI_API_KEY || env.DASHSCOPE_API_KEY || env.DEEPSEEK_API_KEY;
    stream = true;
    enableThinking = false;
  } else if (
    lower.includes('5.3-flash') ||
    lower.includes('glm-5.3')
  ) {
    endpoint = env.GLM_API_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    actualModel = env.GLM_MODEL_NAME || env.ZHIPU_MODEL_NAME || 'ZHIPU/GLM-5.3-Flash';
    apiKey = userKey || env.DASHSCOPE_API_KEY || env.ZHIPU_API_KEY || env.GEMINI_API_KEY || env.DEEPSEEK_API_KEY;
    stream = true;
    enableThinking = true;

    if (lower.endsWith('-low') || lower.includes('low')) {
      reasoningEffort = 'low';
    } else if (lower.endsWith('-high') || lower.includes('high')) {
      reasoningEffort = 'high';
    } else {
      reasoningEffort = 'max';
    }
  }

  if (!apiKey) {
    throw new Error('未配置 API Key。请在 Settings > Secrets 面板中配置 GEMINI_API_KEY 或相关 API 密钥。');
  }

  return { endpoint, actualModel, apiKey, stream, enableThinking, reasoningEffort };
}

export function applyThinkingPayload(
  requestPayload: Record<string, unknown>,
  options: {
    endpoint: string;
    enableThinking?: boolean;
    reasoningEffort?: 'low' | 'high' | 'max';
    includeTemperatureWhenDisabled?: number;
  }
): Record<string, unknown> {
  const isDeepSeekEndpoint = options.endpoint.includes('deepseek.com');
  const effort = options.reasoningEffort || 'low';

  if (options.enableThinking) {
    requestPayload.thinking = { type: 'enabled' };
    requestPayload.reasoning_effort = effort;
    if (!isDeepSeekEndpoint) {
      requestPayload.enable_thinking = true;
    }
    requestPayload.extra_body = {
      ...(isDeepSeekEndpoint ? {} : { enable_thinking: true }),
      reasoning_effort: effort,
      thinking: { type: 'enabled' },
    };
  } else {
    if (typeof options.includeTemperatureWhenDisabled === 'number') {
      requestPayload.temperature = options.includeTemperatureWhenDisabled;
    }
    requestPayload.thinking = { type: 'disabled' };
    if (isDeepSeekEndpoint) {
      requestPayload.reasoning_effort = 'none';
    }
    requestPayload.extra_body = {
      thinking: { type: 'disabled' },
      ...(isDeepSeekEndpoint ? { reasoning_effort: 'none' } : {}),
    };
  }

  return requestPayload;
}

export function resolveAgentTurnMaxTokens(options: {
  endpoint: string;
  enableThinking?: boolean;
  reasoningEffort?: 'low' | 'high' | 'max';
}): number {
  if (!options.enableThinking) {
    return 4096;
  }
  if (options.endpoint.includes('deepseek.com')) {
    return options.reasoningEffort === 'max' ? 131072 : 65536;
  }
  return 16384;
}

