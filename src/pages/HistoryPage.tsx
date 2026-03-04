import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Inbox } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import type { DiagnosisResult } from '../types';
import { storage } from '../services/storage';

function formatMinutes(m: number): string {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}h${r}m` : `${h}h`;
  }
  return `${m}m`;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [diagnoses, setDiagnoses] = useState<DiagnosisResult[]>([]);

  useEffect(() => {
    setDiagnoses(storage.getDiagnoses());
  }, []);

  if (diagnoses.length === 0) {
    return (
      <PageContainer title="诊断历史">
        <div className="flex flex-col items-center justify-center pt-24 md:pt-32 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-stone-100 to-stone-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <Inbox size={32} className="text-stone-300" />
          </div>
          <p className="text-sm md:text-base font-medium text-stone-400">还没有诊断记录</p>
          <p className="text-xs md:text-sm text-stone-300 mt-1.5">去「记录」页添加工作项并诊断</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="诊断历史">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {diagnoses.map(d => (
          <button
            key={d.id}
            onClick={() => navigate(`/diagnosis/${d.id}`)}
            className="w-full bg-white rounded-2xl p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 text-left transition-all duration-200 active:bg-stone-50 hover:shadow-lg hover:translate-y-[-2px] group"
          >
            {/* Savings badge */}
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary-500 via-rose-500 to-pink-500 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-md shadow-primary-500/20">
              <span className="text-lg md:text-xl font-bold leading-none">{d.savingsPercentage}</span>
              <span className="text-[9px] md:text-[10px] opacity-80">%</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm md:text-base font-medium text-stone-800">{d.date}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-stone-400">{d.tasks.length} 项任务</span>
                <span className="text-xs text-stone-300">&middot;</span>
                <span className="flex items-center gap-0.5 text-xs text-primary-600 font-medium">
                  <Clock size={11} /> 省 {formatMinutes(d.totalSavedMinutes)}
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="text-stone-300 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-400" />
          </button>
        ))}
      </div>
    </PageContainer>
  );
}
