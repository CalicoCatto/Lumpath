import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Zap, Clock, AlertCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useSettings } from '../hooks/useSettings';
import { useWorkItems } from '../hooks/useWorkLogs';
import { useDiagnosis } from '../hooks/useDiagnosis';
import { storage } from '../services/storage';
import type { Difficulty, WorkLog } from '../types';

const DURATION_OPTIONS = [
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },
  { label: '2小时', value: 120 },
  { label: '4小时', value: 240 },
];

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty }[] = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' },
];

export default function LogPage() {
  const navigate = useNavigate();
  const { settings, isConfigured } = useSettings();
  const { items, addItem, removeItem, clearItems } = useWorkItems();
  const { loading, error, diagnose, setError } = useDiagnosis();

  const [task, setTask] = useState('');
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleAddItem = () => {
    if (!task.trim()) return;
    addItem(task.trim(), duration, difficulty);
    setTask('');
    setDuration(30);
    setDifficulty('medium');
  };

  const handleDiagnose = async () => {
    if (!isConfigured || !settings) {
      setError('请先在设置页配置模型和 API Key');
      return;
    }
    if (items.length === 0) {
      setError('请至少添加一条工作记录');
      return;
    }

    const workLog: WorkLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      items: [...items],
      createdAt: Date.now(),
    };

    storage.saveWorkLog(workLog);
    const result = await diagnose(settings, workLog);
    if (result) {
      clearItems();
      navigate(`/diagnosis/${result.id}`);
    }
  };

  const totalMinutes = items.reduce((s, i) => s + i.durationMinutes, 0);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">悟径</h1>
        <p className="text-sm md:text-base text-stone-400 mt-1.5">记录今天的工作，让 AI 帮你找到提效空间</p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left column: Input Form */}
        <div>
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm md:shadow-md md:shadow-stone-200/50 transition-shadow duration-300 mb-4 lg:mb-0">
            <textarea
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="你做了什么？例如：写项目周报、整理客户数据..."
              rows={3}
              className="w-full text-sm md:text-base text-stone-800 placeholder:text-stone-300 outline-none resize-none rounded-lg p-2 -m-2 transition-all focus:bg-primary-50/30 focus:ring-2 focus:ring-primary-200"
            />

            {/* Duration */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2.5">
                <Clock size={13} /> 花了多久
              </div>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      duration === opt.value
                        ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mt-4">
              <div className="text-xs text-stone-500 mb-2.5">难度</div>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`flex-1 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      difficulty === opt.value
                        ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={handleAddItem}
              disabled={!task.trim()}
              className="mt-5 w-full flex items-center justify-center gap-1.5 bg-stone-800 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-30 transition-all duration-200 active:scale-[0.98] hover:bg-stone-700 hover:shadow-md"
            >
              <Plus size={16} /> 添加工作项
            </button>
          </div>
        </div>

        {/* Right column: Work Items List */}
        <div>
          {items.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs md:text-sm text-stone-500 font-medium">
                  已记录 {items.length} 项 · 共 {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}小时${totalMinutes % 60 ? `${totalMinutes % 60}分钟` : ''}` : `${totalMinutes}分钟`}
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl px-4 py-3.5 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-800 truncate">{item.task}</div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {item.durationMinutes}分钟 ·{' '}
                        {item.difficulty === 'easy' ? '简单' : item.difficulty === 'medium' ? '中等' : '困难'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-3 text-stone-300 hover:text-red-400 active:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="hidden lg:flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <ClipboardListIcon className="text-stone-300" />
              </div>
              <p className="text-sm text-stone-400">添加工作项后将显示在这里</p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Not configured hint */}
      {!isConfigured && (
        <div className="mt-4 mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700">
            请先前往「设置」页面配置模型和 API Key
          </p>
        </div>
      )}

      {/* Diagnose Button */}
      <div className="mt-6 md:max-w-md md:mx-auto">
        <button
          onClick={handleDiagnose}
          disabled={loading || items.length === 0}
          className="w-full bg-gradient-to-r from-primary-500 to-rose-500 text-white font-semibold rounded-2xl py-4 text-base disabled:opacity-50 transition-all duration-300 active:scale-[0.98] hover:shadow-xl hover:shadow-primary-500/20 hover:brightness-105 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI 分析中...
            </>
          ) : (
            <>
              <Zap size={20} /> 开始诊断
            </>
          )}
        </button>
      </div>
    </PageContainer>
  );
}

/** Inline icon for empty state — avoids extra import */
function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" /><path d="M12 16h4" />
      <path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
  );
}
