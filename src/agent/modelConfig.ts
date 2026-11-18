export type ModelProvider = 'gemini' | 'deepseek' | 'dashscope' | 'ark';

export interface ModelConfig {
  provider?: ModelProvider;
  endpoint: string;
  actualModel: string;
  apiKey: string;
  stream?: boolean;
  enableThinking?: boolean;
  reasoningEffort?: 'low' | 'high' | 'max';
}

const GEMINI_OPENAI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const DEFAULT_GEMINI_MODEL = 'gemini-4-hydrogen';

function cleanKey(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveGeminiTargetModel(normalized: string, lower: string): string {
  // Preserve explicit full versioned/preview Gemini model identifiers if provided
  if (
    lower.startsWith('gemini-') &&
    lower !== 'gemini-flash' &&
    lower !== 'gemini-pro' &&
    !lower.includes('1.5') &&
    !lower.includes('2.0')
  ) {
    return normalized;
  }
  return DEFAULT_GEMINI_MODEL;
}

export function resolveModelConfig(
  modelType: string,
  userKey?: string,
  env: Record<string, string | undefined> = process.env
): ModelConfig {
  const normalized = (modelType || '').trim();
  const lower = normalized.toLowerCase();
  const explicitUserKey = cleanKey(userKey);
  const geminiEnvKey = cleanKey(env.GEMINI_API_KEY);
  const deepseekEnvKey = cleanKey(env.DEEPSEEK_API_KEY);
  const dashscopeEnvKey = cleanKey(env.DASHSCOPE_API_KEY);
  const arkEnvKey = cleanKey(env.ARK_API_KEY) || cleanKey(env.VOLCENGINE_API_KEY);
  const zhipuEnvKey = cleanKey(env.ZHIPU_API_KEY);
  const siliconflowEnvKey = cleanKey(env.SILICONFLOW_API_KEY);

  let provider: ModelProvider = 'deepseek';
  let endpoint = 'https://api.deepseek.com/chat/completions';
  let actualModel = 'deepseek-flash';
  let apiKey =
    explicitUserKey ||
    deepseekEnvKey ||
    dashscopeEnvKey ||
    arkEnvKey ||
    zhipuEnvKey ||
    siliconflowEnvKey ||
    geminiEnvKey ||
    '';
  let stream = true;
  let enableThinking = false;
  let reasoningEffort: 'low' | 'high' | 'max' = 'low';

  if (lower.includes('gemini')) {
    provider = 'gemini';
    endpoint = GEMINI_OPENAI_ENDPOINT;
    actualModel = resolveGeminiTargetModel(normalized, lower);
    apiKey = explicitUserKey || geminiEnvKey || '';
    enableThinking = lower.includes('-thinking') || lower.includes('-low') || lower.includes('-high') || lower.includes('-max');
    reasoningEffort = lower.includes('-max') ? 'max' : (lower.includes('-high') || lower.includes('-thinking')) ? 'high' : 'low';
    stream = true;
  } else if (normalized === 'deepseek-v4-pro' || lower.startsWith('deepseek-v4-pro')) {
    enableThinking = lower.includes('-thinking') || lower.includes('-low') || lower.includes('-high') || lower.includes('-max');
    reasoningEffort = lower.includes('-max') ? 'max' : lower.includes('-high') ? 'high' : 'low';
    if (!explicitUserKey && !deepseekEnvKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
    } else {
      provider = 'deepseek';
      actualModel = 'deepseek-v4-pro';
      apiKey = explicitUserKey || deepseekEnvKey || '';
    }
    stream = true;
  } else if (
    lower.startsWith('deepseek-v4-flash-') ||
    lower.startsWith('deepseek-flash-')
  ) {
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
    if (!explicitUserKey && !deepseekEnvKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
    } else {
      provider = 'deepseek';
      actualModel = 'deepseek-flash';
      apiKey = explicitUserKey || deepseekEnvKey || '';
    }
    stream = true;
  } else if (
    normalized === 'deepseek-v4-flash' ||
    normalized === 'deepseek-v4.1-flash-expires-on-0910' ||
    normalized === 'deepseek-flash' ||
    normalized === 'deepseek' ||
    normalized === 'auto' ||
    !normalized
  ) {
    if (!explicitUserKey && !deepseekEnvKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
      enableThinking = false;
      stream = true;
    } else {
      provider = 'deepseek';
      actualModel = 'deepseek-flash';
      apiKey = explicitUserKey || deepseekEnvKey || '';
      enableThinking = false;
      stream = true;
    }
  } else if (normalized === 'qwen3.8-flash') {
    const dashKey = explicitUserKey || dashscopeEnvKey;
    if (!dashKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
    } else {
      provider = 'dashscope';
      endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      actualModel = 'qwen3.8-flash';
      apiKey = dashKey || deepseekEnvKey || '';
    }
    stream = true;
  } else if (
    normalized === 'qwen3-vl-plus' ||
    normalized === 'qwen-vl-plus' ||
    lower.includes('qwen3-vl') ||
    lower.includes('vl-plus')
  ) {
    const dashKey = explicitUserKey || dashscopeEnvKey;
    if (!dashKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
    } else {
      provider = 'dashscope';
      endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      actualModel = 'qwen3-vl-plus';
      apiKey = dashKey || deepseekEnvKey || '';
    }
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
    const arkKey = explicitUserKey || arkEnvKey;
    if (!arkKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
    } else {
      provider = 'ark';
      endpoint = env.ARK_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
      actualModel = env.ARK_MODEL_NAME || 'doubao-seed-2-1-pro-260915';
      apiKey = arkKey || dashscopeEnvKey || deepseekEnvKey || '';
    }
    stream = true;
    enableThinking = false;
  } else if (
    lower.includes('5.3-flash') ||
    lower.includes('glm-5.3')
  ) {
    const glmKey = explicitUserKey || dashscopeEnvKey || zhipuEnvKey;
    enableThinking = true;
    if (lower.endsWith('-low') || lower.includes('low')) {
      reasoningEffort = 'low';
    } else if (lower.endsWith('-high') || lower.includes('high')) {
      reasoningEffort = 'high';
    } else {
      reasoningEffort = 'max';
    }
    if (!glmKey && geminiEnvKey) {
      provider = 'gemini';
      endpoint = GEMINI_OPENAI_ENDPOINT;
      actualModel = DEFAULT_GEMINI_MODEL;
      apiKey = geminiEnvKey;
    } else {
      provider = 'dashscope';
      endpoint = env.GLM_API_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      actualModel = env.GLM_MODEL_NAME || env.ZHIPU_MODEL_NAME || 'ZHIPU/GLM-5.3-Flash';
      apiKey = glmKey || deepseekEnvKey || '';
    }
    stream = true;
  } else if (!explicitUserKey && !deepseekEnvKey && geminiEnvKey) {
    provider = 'gemini';
    endpoint = GEMINI_OPENAI_ENDPOINT;
    actualModel = DEFAULT_GEMINI_MODEL;
    apiKey = geminiEnvKey;
    stream = true;
  }

  if (!apiKey) {
    throw new Error('未配置 API Key。请在 Settings > Secrets 面板中配置 GEMINI_API_KEY 或相关 API 密钥。');
  }

  return { provider, endpoint, actualModel, apiKey, stream, enableThinking, reasoningEffort };
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
  const isGeminiEndpoint = options.endpoint.includes('generativelanguage.googleapis.com');
  const isDashScopeEndpoint = options.endpoint.includes('dashscope.aliyuncs.com');
  const isArkEndpoint = options.endpoint.includes('volces.com');
  const effort = options.reasoningEffort || 'low';

  if (isGeminiEndpoint) {
    // Gemini OpenAI-compat rejects non-standard fields like `thinking`, `enable_thinking`, and `extra_body` with HTTP 400
    if (options.enableThinking) {
      requestPayload.reasoning_effort = effort === 'max' ? 'high' : effort;
    } else if (typeof options.includeTemperatureWhenDisabled === 'number') {
      requestPayload.temperature = options.includeTemperatureWhenDisabled;
    }
    return requestPayload;
  }

  if (isDeepSeekEndpoint) {
    if (options.enableThinking) {
      requestPayload.thinking = { type: 'enabled' };
      requestPayload.reasoning_effort = effort;
    } else {
      if (typeof options.includeTemperatureWhenDisabled === 'number') {
        requestPayload.temperature = options.includeTemperatureWhenDisabled;
      }
      requestPayload.thinking = { type: 'disabled' };
      requestPayload.reasoning_effort = 'none';
    }
    return requestPayload;
  }

  if (isDashScopeEndpoint) {
    if (options.enableThinking) {
      requestPayload.enable_thinking = true;
      requestPayload.reasoning_effort = effort;
    } else {
      if (typeof options.includeTemperatureWhenDisabled === 'number') {
        requestPayload.temperature = options.includeTemperatureWhenDisabled;
      }
      requestPayload.enable_thinking = false;
    }
    return requestPayload;
  }

  if (isArkEndpoint) {
    if (options.enableThinking) {
      requestPayload.thinking = { type: 'enabled' };
    } else {
      if (typeof options.includeTemperatureWhenDisabled === 'number') {
        requestPayload.temperature = options.includeTemperatureWhenDisabled;
      }
      requestPayload.thinking = { type: 'disabled' };
    }
    return requestPayload;
  }

  // Generic OpenAI-compatible proxy: send only standard fields
  if (options.enableThinking) {
    requestPayload.reasoning_effort = effort === 'max' ? 'high' : effort;
  } else if (typeof options.includeTemperatureWhenDisabled === 'number') {
    requestPayload.temperature = options.includeTemperatureWhenDisabled;
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
