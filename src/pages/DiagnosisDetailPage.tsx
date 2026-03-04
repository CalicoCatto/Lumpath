import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { DiagnosisResult, AIEnablementLevel } from '../types';
import { storage } from '../services/storage';

const LEVEL_CONFIG: Record<
  AIEnablementLevel,
  { emoji: string; label: string; color: string; bg: string }
> = {
  fully_automatable: { emoji: '🟢', label: '完全自动化', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  major_efficiency: { emoji: '🔵', label: '大幅提效', color: 'text-blue-700', bg: 'bg-blue-50' },
  assisted_enhancement: { emoji: '🟡', label: '辅助增强', color: 'text-amber-700', bg: 'bg-amber-50' },
  not_replaceable: { emoji: '🔴', label: '暂不可替代', color: 'text-red-700', bg: 'bg-red-50' },
};

function formatMinutes(m: number): string {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}小时${r}分钟` : `${h}小时`;
  }
  return `${m}分钟`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="text-stone-400 hover:text-primary-500 active:text-primary-500 shrink-0 transition-colors">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function DiagnosisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DiagnosisResult | null>(null);
  const [expandedGuides, setExpandedGuides] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (id) {
      const d = storage.getDiagnosisById(id);
      if (d) setData(d);
    }
  }, [id]);

  const toggleGuide = (idx: number) => {
    setExpandedGuides(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-stone-400 text-sm">诊断记录未找到</p>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-8 md:pb-12">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm px-4 md:px-8 lg:px-12 py-3 md:py-4">
        <div className="md:max-w-4xl md:mx-auto">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-stone-600 text-sm font-medium transition-colors hover:text-stone-800 group"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" /> 返回
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12 md:max-w-4xl md:mx-auto">
        {/* Summary Hero */}
        <div className="bg-gradient-to-br from-primary-500 via-rose-500 to-pink-500 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white mb-5 md:mb-8 shadow-lg shadow-primary-500/15">
          <div className="text-sm md:text-base opacity-80">{data.date} 诊断报告</div>
          <div className="mt-3 md:mt-5 flex items-end gap-3">
            <div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight">{formatMinutes(data.totalSavedMinutes)}</div>
              <div className="text-sm md:text-base opacity-80 mt-1">预计可节省</div>
            </div>
            {/* Circular percentage */}
            <div className="ml-auto relative w-16 h-16 md:w-20 md:h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray={`${data.savingsPercentage}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm md:text-base font-bold">
                {data.savingsPercentage}%
              </div>
            </div>
          </div>
          <div className="mt-3 md:mt-4 text-xs md:text-sm opacity-60">
            模型: {data.modelUsed} · tokens: {data.tokenUsage.input + data.tokenUsage.output}
          </div>
        </div>

        {/* Task Cards — grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {data.tasks.map((task, idx) => {
            const level = LEVEL_CONFIG[task.enablementLevel];
            const barWidth = task.currentMinutes > 0
              ? Math.round((task.aiAssistedMinutes / task.currentMinutes) * 100)
              : 100;

            return (
              <div key={idx} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:translate-y-[-1px]">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm md:text-base font-semibold text-stone-800 flex-1">{task.taskName}</h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${level.bg} ${level.color}`}>
                    {level.emoji} {level.label}
                  </span>
                </div>

                {/* Reasoning */}
                <p className="text-xs md:text-sm text-stone-500 mb-3 leading-relaxed">{task.reasoning}</p>

                {/* Time comparison */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                    <span>当前 {formatMinutes(task.currentMinutes)}</span>
                    <span className="text-primary-600 font-medium">
                      AI后 {formatMinutes(task.aiAssistedMinutes)} · 省{formatMinutes(task.savedMinutes)}
                    </span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Tool Recommendations */}
                {task.tools.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <div className="text-xs font-medium text-stone-600">推荐工具</div>
                    {task.tools.map((tool, ti) => (
                      <div key={ti} className="bg-stone-50 rounded-xl p-3">
                        <div className="text-sm font-medium text-stone-800">{tool.toolName}</div>
                        <div className="text-xs text-stone-500 mt-0.5">{tool.feature}</div>
                        {tool.examplePrompt && (
                          <div className="mt-2 flex items-start gap-2 bg-white rounded-lg p-2.5 border border-stone-100">
                            <p className="text-xs text-stone-600 flex-1 font-mono leading-relaxed">
                              {tool.examplePrompt}
                            </p>
                            <CopyButton text={tool.examplePrompt} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Step by step guide (collapsible) */}
                {task.stepByStepGuide && (
                  <div>
                    <button
                      onClick={() => toggleGuide(idx)}
                      className="flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors"
                    >
                      操作指南
                      {expandedGuides.has(idx) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedGuides.has(idx) && (
                      <div className="mt-2 bg-primary-50 rounded-xl p-3 text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                        {task.stepByStepGuide}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Overall Summary — spans full width on desktop */}
          {data.overallSummary && (
            <div className="md:col-span-2 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-5 md:p-6 border border-stone-200">
              <div className="text-xs md:text-sm font-medium text-stone-500 mb-2">AI 总评</div>
              <p className="text-sm md:text-base text-stone-700 leading-relaxed">{data.overallSummary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
