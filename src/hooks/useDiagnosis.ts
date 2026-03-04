import { useState, useCallback } from 'react';
import type { UserSettings, WorkLog, DiagnosisResult } from '../types';
import { runDiagnosis } from '../services/diagnosis';
import { storage } from '../services/storage';

export function useDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const diagnose = useCallback(async (settings: UserSettings, workLog: WorkLog) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const diagnosis = await runDiagnosis(settings, workLog);
      storage.saveDiagnosis(diagnosis);
      setResult(diagnosis);
      return diagnosis;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, diagnose, setResult, setError };
}
