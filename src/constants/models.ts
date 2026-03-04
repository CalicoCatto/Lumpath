import type { ProviderConfig, ModelInfo, ProviderID } from '../types';

export const PROVIDERS: Record<ProviderID, ProviderConfig> = {
  moonshot: {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    baseUrl: 'https://api.moonshot.cn/v1',
  },
  siliconflow: {
    id: 'siliconflow',
    name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
  },
};

export const MODELS: ModelInfo[] = [
  // Moonshot
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5 (推理模型)',
    provider: 'moonshot',
    inputPrice: 0.6,
    outputPrice: 3.0,
    isReasoningModel: true,
  },
  {
    id: 'kimi-k2-0905-preview',
    name: 'Kimi K2',
    provider: 'moonshot',
    inputPrice: 0.6,
    outputPrice: 2.5,
    isReasoningModel: false,
  },
  // SiliconFlow
  {
    id: 'Pro/MiniMaxAI/MiniMax-M2.5',
    name: 'MiniMax M2.5',
    provider: 'siliconflow',
    inputPrice: 2.1,
    outputPrice: 8.4,
    isReasoningModel: false,
  },
  {
    id: 'Pro/zai-org/GLM-4.7',
    name: 'GLM-4.7',
    provider: 'siliconflow',
    inputPrice: 4.0,
    outputPrice: 16.0,
    isReasoningModel: false,
  },
  {
    id: 'Pro/deepseek-ai/DeepSeek-V3.2',
    name: 'DeepSeek V3.2',
    provider: 'siliconflow',
    inputPrice: 2.0,
    outputPrice: 3.0,
    isReasoningModel: false,
  },
  {
    id: 'Pro/deepseek-ai/DeepSeek-V3.1-Terminus',
    name: 'DeepSeek V3.1 Terminus',
    provider: 'siliconflow',
    inputPrice: 4.0,
    outputPrice: 12.0,
    isReasoningModel: false,
  },
  {
    id: 'stepfun-ai/Step-3.5-Flash',
    name: 'Step 3.5 Flash',
    provider: 'siliconflow',
    inputPrice: 0.7,
    outputPrice: 2.1,
    isReasoningModel: false,
  },
  {
    id: 'Pro/zai-org/GLM-5',
    name: 'GLM-5',
    provider: 'siliconflow',
    inputPrice: 4.0,
    outputPrice: 22.0,
    isReasoningModel: false,
  },
];

export function getModelsByProvider(provider: ProviderID): ModelInfo[] {
  return MODELS.filter(m => m.provider === provider);
}

export function getModelById(id: string): ModelInfo | undefined {
  return MODELS.find(m => m.id === id);
}
