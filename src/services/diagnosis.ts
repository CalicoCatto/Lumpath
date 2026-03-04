import type {
  WorkItem,
  WorkLog,
  DiagnosisResult,
  TaskAnalysis,
  AIEnablementLevel,
  Difficulty,
} from '../types';
import { callLLM, extractJSON } from './llm';
import type { UserSettings } from '../types';

const VALID_LEVELS: AIEnablementLevel[] = [
  'fully_automatable',
  'major_efficiency',
  'assisted_enhancement',
  'not_replaceable',
];

function validateLevel(v: string): AIEnablementLevel {
  if (VALID_LEVELS.includes(v as AIEnablementLevel)) return v as AIEnablementLevel;
  return 'assisted_enhancement';
}

export const DIAGNOSIS_SYSTEM_PROMPT = `你是"悟径 Lumpath"的AI工作效率诊断师。你的任务是分析用户的日常工作记录，评估每项任务的AI提效潜力。

## 分析要求

对于用户提交的每一项工作任务，你需要：

1. **判断AI赋能等级**：
   - "fully_automatable" (🟢完全自动化): AI可以独立完成90%以上的工作，人只需审核
   - "major_efficiency" (🔵大幅提效): AI可以将效率提升50%以上
   - "assisted_enhancement" (🟡辅助增强): AI可以提供辅助，提效20-50%
   - "not_replaceable" (🔴暂不可替代): 该任务目前AI难以替代

2. **估算时间节省**：给出使用AI工具后预计花费的时间（分钟）

3. **推荐具体工具**：推荐1-3个具体的AI工具，说明用哪个功能、给出示例提示词

4. **给出操作步骤**：简短的step-by-step指导

## 输出格式

你必须严格按照以下JSON格式输出，不要包含任何JSON之外的文字：

{
  "tasks": [
    {
      "taskName": "任务名称",
      "currentMinutes": 60,
      "aiAssistedMinutes": 15,
      "savedMinutes": 45,
      "enablementLevel": "fully_automatable",
      "reasoning": "为什么给出这个评级的简短解释",
      "tools": [
        {
          "toolName": "工具名称（如ChatGPT、Claude、Cursor、Midjourney等）",
          "feature": "具体使用哪个功能",
          "examplePrompt": "用户可以直接复制使用的示例提示词"
        }
      ],
      "stepByStepGuide": "第一步：...\\n第二步：...\\n第三步：..."
    }
  ],
  "overallSummary": "对用户今日工作的整体AI提效评价，鼓励性语气，150字以内"
}

## 注意事项
- 推荐的工具必须是真实存在的、用户可以立即使用的
- 时间估算要合理，不要过于乐观
- 示例提示词要具体、可直接使用
- 优先推荐免费或低成本的工具
- 对"暂不可替代"的任务也要给出未来可能的AI方向`;

const DIFFICULTY_MAP: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export function buildUserMessage(items: WorkItem[]): string {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. 任务: ${item.task}\n   耗时: ${item.durationMinutes}分钟\n   难度: ${DIFFICULTY_MAP[item.difficulty]}`,
  );
  return `以下是我今天的工作记录，请分析每项任务的AI提效潜力：\n\n${lines.join('\n\n')}`;
}

export function parseDiagnosisResponse(
  raw: string,
  workLog: WorkLog,
  modelUsed: string,
  tokenUsage: { input: number; output: number },
): DiagnosisResult {
  const jsonStr = extractJSON(raw);
  const parsed = JSON.parse(jsonStr);

  const tasks: TaskAnalysis[] = (parsed.tasks || []).map((t: Record<string, unknown>) => ({
    taskName: String(t.taskName || '未命名任务'),
    currentMinutes: Number(t.currentMinutes) || 0,
    aiAssistedMinutes: Number(t.aiAssistedMinutes) || 0,
    savedMinutes: Number(t.savedMinutes) || 0,
    enablementLevel: validateLevel(String(t.enablementLevel || '')),
    reasoning: String(t.reasoning || ''),
    tools: (Array.isArray(t.tools) ? t.tools : []).map((tool: Record<string, unknown>) => ({
      toolName: String(tool.toolName || ''),
      feature: String(tool.feature || ''),
      examplePrompt: tool.examplePrompt ? String(tool.examplePrompt) : undefined,
    })),
    stepByStepGuide: String(t.stepByStepGuide || ''),
  }));

  const totalCurrent = tasks.reduce((sum, t) => sum + t.currentMinutes, 0);
  const totalAiAssisted = tasks.reduce((sum, t) => sum + t.aiAssistedMinutes, 0);
  const totalSaved = totalCurrent - totalAiAssisted;

  return {
    id: crypto.randomUUID(),
    workLogId: workLog.id,
    date: workLog.date,
    tasks,
    totalCurrentMinutes: totalCurrent,
    totalAiAssistedMinutes: totalAiAssisted,
    totalSavedMinutes: totalSaved,
    savingsPercentage: totalCurrent > 0 ? Math.round((totalSaved / totalCurrent) * 100) : 0,
    overallSummary: String(parsed.overallSummary || ''),
    modelUsed,
    tokenUsage,
    createdAt: Date.now(),
  };
}

export async function runDiagnosis(
  settings: UserSettings,
  workLog: WorkLog,
): Promise<DiagnosisResult> {
  const response = await callLLM(settings, {
    systemPrompt: DIAGNOSIS_SYSTEM_PROMPT,
    userMessage: buildUserMessage(workLog.items),
    maxTokens: 4096,
  });

  return parseDiagnosisResponse(response.text, workLog, settings.modelId, {
    input: response.inputTokens,
    output: response.outputTokens,
  });
}
