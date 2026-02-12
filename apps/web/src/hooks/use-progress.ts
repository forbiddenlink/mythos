'use client';

import { useContext } from 'react';
import { ProgressContext, type ProgressContextValue } from '@/providers/progress-provider';

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
