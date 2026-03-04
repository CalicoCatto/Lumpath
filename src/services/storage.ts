import type { UserSettings, WorkLog, DiagnosisResult } from '../types';

const KEYS = {
  settings: 'lumpath_settings',
  workLogs: 'lumpath_worklogs',
  diagnoses: 'lumpath_diagnoses',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getSettings(): UserSettings | null {
    return read<UserSettings | null>(KEYS.settings, null);
  },
  saveSettings(s: UserSettings): void {
    write(KEYS.settings, s);
  },

  getWorkLogs(): WorkLog[] {
    return read<WorkLog[]>(KEYS.workLogs, []).sort((a, b) => b.createdAt - a.createdAt);
  },
  saveWorkLog(log: WorkLog): void {
    const logs = read<WorkLog[]>(KEYS.workLogs, []);
    logs.push(log);
    write(KEYS.workLogs, logs);
  },
  deleteWorkLog(id: string): void {
    const logs = read<WorkLog[]>(KEYS.workLogs, []).filter(l => l.id !== id);
    write(KEYS.workLogs, logs);
  },

  getDiagnoses(): DiagnosisResult[] {
    return read<DiagnosisResult[]>(KEYS.diagnoses, []).sort((a, b) => b.createdAt - a.createdAt);
  },
  saveDiagnosis(d: DiagnosisResult): void {
    const list = read<DiagnosisResult[]>(KEYS.diagnoses, []);
    list.push(d);
    write(KEYS.diagnoses, list);
  },
  getDiagnosisById(id: string): DiagnosisResult | undefined {
    return read<DiagnosisResult[]>(KEYS.diagnoses, []).find(d => d.id === id);
  },
  deleteDiagnosis(id: string): void {
    const list = read<DiagnosisResult[]>(KEYS.diagnoses, []).filter(d => d.id !== id);
    write(KEYS.diagnoses, list);
  },
};
