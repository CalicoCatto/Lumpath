import { useState, useCallback } from 'react';
import type { UserSettings } from '../types';
import { storage } from '../services/storage';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(() => storage.getSettings());

  const save = useCallback((s: UserSettings) => {
    storage.saveSettings(s);
    setSettings(s);
  }, []);

  const isConfigured = Boolean(settings?.provider && settings?.modelId && settings?.apiKey);

  return { settings, save, isConfigured };
}
