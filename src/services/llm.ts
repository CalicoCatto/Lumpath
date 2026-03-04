import type { UserSettings, LLMRequest, LLMResponse } from '../types';
import { PROVIDERS, getModelById } from '../constants/models';

const RETRYABLE_CODES = new Set([429, 502, 503, 504]);
const MAX_RETRIES = 3;
const TIMEOUT_MS = 180_000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callLLM(
  settings: UserSettings,
  request: LLMRequest,
): Promise<LLMResponse> {
  const provider = PROVIDERS[settings.provider];
  const model = getModelById(settings.modelId);
  if (!provider || !model) throw new Error('无效的提供商或模型配置');

  const payload: Record<string, unknown> = {
    model: settings.modelId,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userMessage },
    ],
    max_tokens: request.maxTokens ?? 4096,
  };

  // Kimi K2.5 rejects temperature != 1
  if (!model.isReasoningModel) {
    payload.temperature = 0.7;
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (RETRYABLE_CODES.has(response.status)) {
        if (attempt === MAX_RETRIES - 1) {
          throw new Error(`API 错误 ${response.status}，已重试 ${MAX_RETRIES} 次`);
        }
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 5000 * 2 ** attempt;
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API 错误 ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content ?? '';

      // Strip <think>...</think> blocks from reasoning models
      text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      return {
        text,
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (attempt === MAX_RETRIES - 1) throw new Error('请求超时（180秒）');
        await sleep(5000 * 2 ** attempt);
        continue;
      }
      throw err;
    }
  }
  throw new Error('已达到最大重试次数');
}

export async function testConnection(settings: UserSettings): Promise<boolean> {
  const response = await callLLM(settings, {
    systemPrompt: '你是一个助手。',
    userMessage: '请回复"连接成功"四个字。',
    maxTokens: 32,
  });
  return response.text.includes('连接成功');
}

/** Extract JSON from LLM response that may contain think tags or code fences */
export function extractJSON(raw: string): string {
  let text = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const jsonStart = text.indexOf('{');
  const jsonArrayStart = text.indexOf('[');
  const start =
    jsonStart === -1 ? jsonArrayStart
    : jsonArrayStart === -1 ? jsonStart
    : Math.min(jsonStart, jsonArrayStart);

  if (start === -1) throw new Error('响应中未找到 JSON 数据');

  const openChar = text[start];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let end = start;
  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    if (text[i] === closeChar) depth--;
    if (depth === 0) { end = i; break; }
  }

  return text.slice(start, end + 1);
}
