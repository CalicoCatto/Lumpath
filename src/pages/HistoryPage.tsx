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
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <Inbox size={28} className="text-stone-300" />
          </div>
          <p className="text-sm text-stone-400">还没有诊断记录</p>
          <p className="text-xs text-stone-300 mt-1">去「记录」页添加工作项并诊断</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="诊断历史">
      <div className="space-y-3">
        {diagnoses.map(d => (
          <button
            key={d.id}
            onClick={() => navigate(`/diagnosis/${d.id}`)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:bg-stone-50 transition-colors"
          >
            {/* Savings badge */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-rose-400 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
              <span className="text-lg font-bold leading-none">{d.savingsPercentage}</span>
              <span className="text-[9px] opacity-80">%</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-800">{d.date}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-stone-400">{d.tasks.length} 项任务</span>
                <span className="text-xs text-stone-300">·</span>
                <span className="flex items-center gap-0.5 text-xs text-primary-600">
                  <Clock size={11} /> 省 {formatMinutes(d.totalSavedMinutes)}
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="text-stone-300 shrink-0" />
          </button>
        ))}
      </div>
    </PageContainer>
  );
}
