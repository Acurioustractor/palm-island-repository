'use client';

import { useState, useCallback } from 'react';

interface UndoEntry {
  field: string;
  id: string;
  previousValue: any;
  newValue: any;
  timestamp: number;
}

const MAX_ENTRIES = 20;

export function useUndoStack() {
  const [stack, setStack] = useState<UndoEntry[]>([]);

  const push = useCallback((entry: Omit<UndoEntry, 'timestamp'>) => {
    setStack(prev => {
      const updated = [...prev, { ...entry, timestamp: Date.now() }];
      return updated.slice(-MAX_ENTRIES);
    });
  }, []);

  const pop = useCallback((): UndoEntry | undefined => {
    let entry: UndoEntry | undefined;
    setStack(prev => {
      if (prev.length === 0) return prev;
      entry = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return entry;
  }, []);

  const peek = stack.length > 0 ? stack[stack.length - 1] : undefined;

  return { stack, push, pop, peek, canUndo: stack.length > 0 };
}
