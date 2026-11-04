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
          'inline-flex items-center gap-1.5 text-muted-foreground',
          className
        )}
      >
        <span className="font-serif text-lg" lang={getLanguageCode(data.language)}>
          {data.text}
        </span>
        {data.transliteration && (
          <span className="text-sm text-muted-foreground">
            ({data.transliteration})
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-muted/50 border border-border',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <span className="text-sm font-medium text-muted-foreground">
              {data.language}
            </span>
          </div>
          <p
            className="font-serif text-2xl text-foreground"
            lang={getLanguageCode(data.language)}
          >
            {data.text}
          </p>
          {data.transliteration && (
            <p className="text-sm text-muted-foreground mt-1 italic">
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
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
            aria-pressed={showDetails}
            aria-label={showDetails ? 'Hide etymology' : 'Show etymology'}
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {data.meaning && showDetails && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Etymology:</span>{' '}
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
