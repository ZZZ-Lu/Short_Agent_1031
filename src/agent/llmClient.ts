import { GoogleGenAI, ThinkingLevel, type Content, type Part } from '@google/genai';
import { applyThinkingPayload, type ModelConfig } from './modelConfig';
import { normalizeTokenUsage, type PromptCacheUsageStats } from './promptCache';

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant' | string;
  content: any;
}

export interface ChatCompletionResult {
  content: string;
  reasoning_content?: string;
  usage?: PromptCacheUsageStats;
}

export function extractUpstreamErrorMessage(rawBodyText: string, status: number): string {
  const trimmed = (rawBodyText || '').trim();
  if (!trimmed) return `HTTP ${status}`;

  try {
    const parsed = JSON.parse(trimmed);
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    if (first && typeof first === 'object') {
      if (typeof first.error?.message === 'string' && first.error.message.trim()) {
        return first.error.message.trim();
      }
      if (typeof first.error === 'string' && first.error.trim()) {
        return first.error.trim();
      }
      if (typeof first.message === 'string' && first.message.trim()) {
        return first.message.trim();
      }
      if (typeof first.msg === 'string' && first.msg.trim()) {
        return first.msg.trim();
      }
      if (typeof first.detail === 'string' && first.detail.trim()) {
        return first.detail.trim();
      }
    }
  } catch {
    // Not valid JSON; return clean raw text snippet
  }

  return trimmed.slice(0, 400);
}

export function sanitizeImageUrlsForLlm(urls: string[]): string[] {
  return urls.filter((url, idx, arr) => {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || arr.indexOf(url) !== idx) return false;
    if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(trimmed)) {
      return true;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
}

function parseDataImageUrl(url: string): { mimeType: string; data: string } | null {
  const match = url.match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const data = match[2].replace(/\s+/g, '');
  if (!data) return null;
  return { mimeType, data };
}

export async function buildGeminiRequestFromMessages(
  messages: ChatMessageInput[],
  options: { textOnly?: boolean } = {}
): Promise<{ systemInstruction?: string; contents: Content[] }> {
  const systemParts: string[] = [];
  const contents: Content[] = [];

  for (const msg of messages) {
    if (!msg) continue;
    if (msg.role === 'system') {
      const sysText = typeof msg.content === 'string' ? msg.content.trim() : '';
      if (sysText) systemParts.push(sysText);
      continue;
    }

    const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
    const parts: Part[] = [];

    if (typeof msg.content === 'string') {
      if (msg.content.trim()) {
        parts.push({ text: msg.content });
      }
    } else if (Array.isArray(msg.content)) {
      for (const item of msg.content) {
        if (!item || typeof item !== 'object') continue;
        if (item.type === 'text' && typeof item.text === 'string' && item.text.length > 0) {
          parts.push({ text: item.text });
        } else if (!options.textOnly && item.type === 'image_url' && typeof item.image_url?.url === 'string') {
          const imgUrl = item.image_url.url.trim();
          const inline = parseDataImageUrl(imgUrl);
          if (inline) {
            parts.push({ inlineData: inline });
          } else if (/^https?:\/\//i.test(imgUrl)) {
            try {
              const parsedUrl = new URL(imgUrl);
              const host = parsedUrl.hostname.toLowerCase();
              if (host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
                const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
                if (imgRes.ok) {
                  const contentType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
                  if (contentType.startsWith('image/')) {
                    const buf = Buffer.from(await imgRes.arrayBuffer());
                    parts.push({
                      inlineData: {
                        mimeType: contentType,
                        data: buf.toString('base64'),
                      },
                    });
                  }
                }
              }
            } catch {
              // Skip unfetchable remote image URL so it never triggers an upstream 400
            }
          }
        }
      }
    }

    if (parts.length > 0) {
      contents.push({ role: geminiRole, parts });
    }
  }

  return {
    ...(systemParts.length > 0 ? { systemInstruction: systemParts.join('\n\n') } : {}),
    contents,
  };
}

function mapGeminiUsage(usageMetadata: any): PromptCacheUsageStats | undefined {
  if (!usageMetadata || typeof usageMetadata !== 'object') return undefined;
  return normalizeTokenUsage({
    prompt_tokens: usageMetadata.promptTokenCount,
    completion_tokens: usageMetadata.candidatesTokenCount,
    total_tokens: usageMetadata.totalTokenCount,
    cached_tokens: usageMetadata.cachedContentTokenCount,
  });
}

function extractGeminiResponseErrorStatus(err: any): number | undefined {
  if (typeof err?.status === 'number') return err.status;
  if (typeof err?.code === 'number') return err.code;
  const msg = String(err?.message || '');
  const statusMatch = msg.match(/\b(4\d\d|5\d\d)\b/);
  return statusMatch ? Number(statusMatch[1]) : undefined;
}

async function callGeminiSdk(options: {
  modelConfig: ModelConfig;
  messages: ChatMessageInput[];
  jsonMode?: boolean;
  stream?: boolean;
}): Promise<ChatCompletionResult> {
  const { modelConfig, messages, jsonMode, stream } = options;
  const ai = new GoogleGenAI({
    apiKey: modelConfig.apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const modelName = modelConfig.actualModel || 'gemini-4-hydrogen';
  const isGemini3Or4 = modelName.includes('gemini-4') || modelName.includes('gemini-3');

  const runGenerate = async (textOnly: boolean): Promise<ChatCompletionResult> => {
    const { systemInstruction, contents } = await buildGeminiRequestFromMessages(messages, { textOnly });
    const config: Record<string, any> = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }
    if (isGemini3Or4) {
      const thinkingLevel = modelConfig.enableThinking
        ? (modelConfig.reasoningEffort === 'low' ? ThinkingLevel.LOW : ThinkingLevel.HIGH)
        : ThinkingLevel.LOW;
      config.thinkingConfig = { thinkingLevel };
    }

    if (stream) {
      const streamRes = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config,
      });
      let fullText = '';
      let fullReasoning = '';
      let latestUsage: PromptCacheUsageStats | undefined;

      for await (const chunk of streamRes) {
        const parts = chunk?.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts)) {
          for (const part of parts as Array<{ text?: string; thought?: boolean }>) {
            if (typeof part?.text === 'string' && part.text.length > 0) {
              if (part.thought) {
                fullReasoning += part.text;
              } else {
                fullText += part.text;
              }
            }
          }
        } else if (typeof chunk?.text === 'string' && chunk.text.length > 0) {
          fullText += chunk.text;
        }
        if (chunk?.usageMetadata) {
          latestUsage = mapGeminiUsage(chunk.usageMetadata) || latestUsage;
        }
      }

      return {
        content: fullText,
        ...(fullReasoning ? { reasoning_content: fullReasoning } : {}),
        ...(latestUsage ? { usage: latestUsage } : {}),
      };
    }

    const res = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    let fullText = '';
    let fullReasoning = '';
    const parts = res?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      for (const part of parts as Array<{ text?: string; thought?: boolean }>) {
        if (typeof part?.text === 'string' && part.text.length > 0) {
          if (part.thought) {
            fullReasoning += part.text;
          } else {
            fullText += part.text;
          }
        }
      }
    }
    if (!fullText && typeof res?.text === 'string') {
      fullText = res.text;
    }

    return {
      content: fullText,
      ...(fullReasoning ? { reasoning_content: fullReasoning } : {}),
      ...(res?.usageMetadata ? { usage: mapGeminiUsage(res.usageMetadata) } : {}),
    };
  };

  const hasMultimodal = messages.some(m => Array.isArray(m.content) && m.content.some((p: any) => p?.type === 'image_url'));
  try {
    return await runGenerate(false);
  } catch (err: any) {
    if (hasMultimodal) {
      const status = extractGeminiResponseErrorStatus(err);
      const msg = String(err?.message || '');
      if (!status || status === 400 || /image|inline|multimodal|media|unsupported|INVALID_ARGUMENT/i.test(msg)) {
        console.warn(`Gemini multimodal request failed (${msg}), retrying with text-only payload`);
        return await runGenerate(true);
      }
    }
    throw err;
  }
}

export async function parseOpenAiChatCompletionResponse(
  response: Response,
  isStream: boolean
): Promise<ChatCompletionResult> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/event-stream') && !isStream) {
    const data = await response.json();
    const message = data.choices?.[0]?.message || {};
    return {
      content: message.content || '',
      reasoning_content: message.reasoning_content || message.reasoning || '',
      usage: normalizeTokenUsage(data.usage),
    };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      const message = data.choices?.[0]?.message || {};
      return {
        content: message.content || '',
        reasoning_content: message.reasoning_content || '',
        usage: normalizeTokenUsage(data.usage),
      };
    } catch {
      throw new Error('无法读取响应流内容');
    }
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let fullReasoning = '';
  let latestUsage: PromptCacheUsageStats | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const chunk = JSON.parse(jsonStr);
          if (chunk.usage) {
            const parsedUsage = normalizeTokenUsage(chunk.usage);
            if (parsedUsage) latestUsage = parsedUsage;
          }
          const delta = chunk.choices?.[0]?.delta;
          if (delta) {
            if (delta.content) {
              fullContent += delta.content;
            }
            if (delta.reasoning_content) {
              fullReasoning += delta.reasoning_content;
            } else if (delta.reasoning) {
              fullReasoning += delta.reasoning;
            }
          }
        } catch {
          // ignore incomplete JSON chunks
        }
      }
    }
  }

  if (buffer.trim().startsWith('data: ') && buffer.trim() !== 'data: [DONE]') {
    try {
      const chunk = JSON.parse(buffer.trim().slice(6));
      if (chunk.usage) {
        const parsedUsage = normalizeTokenUsage(chunk.usage);
        if (parsedUsage) latestUsage = parsedUsage;
      }
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) fullContent += delta.content;
      if (delta?.reasoning_content) fullReasoning += delta.reasoning_content;
      else if (delta?.reasoning) fullReasoning += delta.reasoning;
    } catch {}
  }

  return { content: fullContent, reasoning_content: fullReasoning, usage: latestUsage };
}

function extractTextOnlyMessages(messages: ChatMessageInput[]): ChatMessageInput[] {
  return messages.map((msg) => {
    if (!Array.isArray(msg.content)) return msg;
    const text = msg.content
      .filter((part: any) => part?.type === 'text' && typeof part.text === 'string')
      .map((part: any) => part.text)
      .join('\n');
    return { ...msg, content: text };
  });
}

export class UpstreamHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'UpstreamHttpError';
    this.status = status;
  }
}

export async function executeChatCompletion(options: {
  modelConfig: ModelConfig;
  messages: ChatMessageInput[];
  jsonMode?: boolean;
  stream?: boolean;
  maxTokens?: number;
  includeTemperatureWhenDisabled?: number;
  fallbackSystemKey?: string;
}): Promise<ChatCompletionResult> {
  const {
    modelConfig,
    messages,
    jsonMode = false,
    stream = false,
    maxTokens,
    includeTemperatureWhenDisabled,
    fallbackSystemKey,
  } = options;

  const isGemini =
    modelConfig.provider === 'gemini' ||
    modelConfig.endpoint.includes('generativelanguage.googleapis.com');

  if (isGemini) {
    return await callGeminiSdk({
      modelConfig,
      messages,
      jsonMode,
      stream,
    });
  }

  const requestPayload: Record<string, unknown> = {
    model: modelConfig.actualModel,
    messages,
  };
  if (typeof maxTokens === 'number') {
    requestPayload.max_tokens = maxTokens;
  }
  if (jsonMode) {
    requestPayload.response_format = { type: 'json_object' };
  }
  if (stream) {
    requestPayload.stream = true;
    requestPayload.stream_options = { include_usage: true };
  }

  applyThinkingPayload(requestPayload, {
    endpoint: modelConfig.endpoint,
    enableThinking: modelConfig.enableThinking,
    reasoningEffort: modelConfig.reasoningEffort,
    includeTemperatureWhenDisabled,
  });

  const doFetch = (key: string) =>
    fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(requestPayload),
    });

  let activeKey = modelConfig.apiKey;
  let response = await doFetch(activeKey);

  // Retry 1: Strip optional OpenAI-compat extensions if rejected with HTTP 400
  if (!response.ok && response.status === 400) {
    const errText = await response.clone().text().catch(() => '');
    let shouldRetryMinimal = false;

    if (requestPayload.stream_options && /stream_options|include_usage/i.test(errText)) {
      delete requestPayload.stream_options;
      shouldRetryMinimal = true;
    }
    if (
      (requestPayload.thinking ||
        requestPayload.enable_thinking !== undefined ||
        requestPayload.reasoning_effort !== undefined ||
        requestPayload.extra_body ||
        requestPayload.temperature !== undefined ||
        requestPayload.response_format) &&
      /thinking|enable_thinking|reasoning_effort|extra_body|temperature|response_format|unknown\s+name|unrecognized|unsupported/i.test(errText)
    ) {
      delete requestPayload.thinking;
      delete requestPayload.enable_thinking;
      delete requestPayload.reasoning_effort;
      delete requestPayload.extra_body;
      if (/temperature/i.test(errText)) delete requestPayload.temperature;
      if (/response_format/i.test(errText)) delete requestPayload.response_format;
      shouldRetryMinimal = true;
    }

    if (shouldRetryMinimal) {
      response = await doFetch(activeKey);
    }
  }

  // Retry 2: If multimodal messages were rejected, retry text-only
  const hasMultimodal = messages.some(m => Array.isArray(m.content));
  if (!response.ok && hasMultimodal) {
    console.warn(`Vision payload rejected (${response.status}), retrying with text-only payload`);
    requestPayload.messages = extractTextOnlyMessages(messages);
    response = await doFetch(activeKey);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const rawMsg = extractUpstreamErrorMessage(errText, response.status);
    const isBalanceError = /insufficient\s*balance|quota|402|out\s*of\s*credit|余额不足|欠费/i.test(rawMsg);

    if (isBalanceError && fallbackSystemKey && activeKey !== fallbackSystemKey) {
      console.warn(`User Key insufficient balance (${rawMsg}), retrying with system fallback API key...`);
      const retryRes = await doFetch(fallbackSystemKey);
      if (retryRes.ok) {
        return await parseOpenAiChatCompletionResponse(retryRes, stream);
      }
      throw new UpstreamHttpError(retryRes.status, 'API Key 账户余额不足 (Insufficient Balance)。请在设置页面更新有效的 API Key 或切换模型。');
    }

    throw new UpstreamHttpError(response.status, rawMsg);
  }

  return await parseOpenAiChatCompletionResponse(response, stream);
}
