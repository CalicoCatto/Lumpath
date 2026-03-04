// ── Provider & Model Configuration ──

export type ProviderID = 'moonshot' | 'siliconflow';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderID;
  inputPrice: number;   // USD per million tokens
  outputPrice: number;
  isReasoningModel: boolean;
}

export interface ProviderConfig {
  id: ProviderID;
  name: string;
  baseUrl: string;
}

export interface UserSettings {
  provider: ProviderID;
  modelId: string;
  apiKey: string;
}

// ── Work Log ──

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface WorkItem {
  id: string;
  task: string;
  durationMinutes: number;
  difficulty: Difficulty;
}

export interface WorkLog {
  id: string;
  date: string;
  items: WorkItem[];
  createdAt: number;
}

// ── AI Diagnosis ──

export type AIEnablementLevel =
  | 'fully_automatable'
  | 'major_efficiency'
  | 'assisted_enhancement'
  | 'not_replaceable';

export interface ToolRecommendation {
  toolName: string;
  feature: string;
  examplePrompt?: string;
}

export interface TaskAnalysis {
  taskName: string;
  currentMinutes: number;
  aiAssistedMinutes: number;
  savedMinutes: number;
  enablementLevel: AIEnablementLevel;
  reasoning: string;
  tools: ToolRecommendation[];
  stepByStepGuide: string;
}

export interface DiagnosisResult {
  id: string;
  workLogId: string;
  date: string;
  tasks: TaskAnalysis[];
  totalCurrentMinutes: number;
  totalAiAssistedMinutes: number;
  totalSavedMinutes: number;
  savingsPercentage: number;
  overallSummary: string;
  modelUsed: string;
  tokenUsage: { input: number; output: number };
  createdAt: number;
}

// ── LLM ──

export interface LLMRequest {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}
