'use client';

import { useState } from 'react';
import { Languages, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OriginalLanguageNameData {
  text: string;
  language: string;
  transliteration?: string;
  meaning?: string;
}

interface OriginalLanguageNameProps {
  data: OriginalLanguageNameData;
  className?: string;
  variant?: 'inline' | 'block';
}

export function OriginalLanguageName({
  data,
  className,
  variant = 'inline',
}: OriginalLanguageNameProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!data || !data.text) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400',
          className
        )}
      >
        <span className="font-serif text-lg" lang={getLanguageCode(data.language)}>
          {data.text}
        </span>
        {data.transliteration && (
          <span className="text-sm text-slate-500 dark:text-slate-500">
            ({data.transliteration})
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {data.language}
            </span>
          </div>
          <p
            className="font-serif text-2xl text-slate-800 dark:text-slate-200"
            lang={getLanguageCode(data.language)}
          >
            {data.text}
          </p>
          {data.transliteration && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 italic">
              {data.transliteration}
            </p>
          )}
        </div>

        {data.meaning && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showDetails
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
            )}
            aria-pressed={showDetails}
            aria-label={showDetails ? 'Hide etymology' : 'Show etymology'}
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {data.meaning && showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Etymology:</span>{' '}
            {data.meaning}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to convert language names to ISO codes
function getLanguageCode(language: string): string {
  const codes: Record<string, string> = {
    'Ancient Greek': 'grc',
    'Old Norse': 'non',
    'Sanskrit': 'sa',
    'Latin': 'la',
    'Ancient Egyptian': 'egy',
    'Old Japanese': 'ojp',
    'Japanese': 'ja',
    'K\'iche\' Maya': 'quc',
    'Akkadian': 'akk',
    'Sumerian': 'sux',
    'Vedic Sanskrit': 'sa',
    'Classical Chinese': 'lzh',
  };
  return codes[language] || 'und';
}
