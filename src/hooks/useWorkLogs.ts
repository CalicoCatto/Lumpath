import { useState, useCallback } from 'react';
import type { WorkItem, Difficulty } from '../types';

export function useWorkItems() {
  const [items, setItems] = useState<WorkItem[]>([]);

  const addItem = useCallback((task: string, durationMinutes: number, difficulty: Difficulty) => {
    setItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), task, durationMinutes, difficulty },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearItems = useCallback(() => setItems([]), []);

  return { items, addItem, removeItem, clearItems };
}
