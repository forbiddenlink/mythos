'use client';

import { useState } from 'react';
import { Quote, Languages, Book, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import sourcesData from '@/data/sources.json';

export interface PrimarySourceExcerpt {
  text: string;
  translation: string;
  source: string;
  sourceId?: string;
  lineNumbers?: string;
  translator?: string;
  originalLanguage?: string;
}

interface SourceExcerptProps {
  excerpt: PrimarySourceExcerpt;
  className?: string;
  variant?: 'default' | 'compact';
}

interface Source {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  externalUrl?: string;
}

export function SourceExcerpt({ excerpt, className, variant = 'default' }: SourceExcerptProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  // Find the linked source if available
  const linkedSource = excerpt.sourceId
    ? (sourcesData as Source[]).find(s => s.id === excerpt.sourceId)
    : null;

  const isCompact = variant === 'compact';

  return (
    <figure
      className={cn(
        'relative',
        isCompact ? 'p-4' : 'p-6',
        'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60',
        'border-l-4 border-teal-500/70 dark:border-teal-400/70',
        'rounded-r-lg shadow-sm',
        className
      )}
    >
      {/* Quote Icon */}
      <Quote
        className={cn(
          'absolute text-teal-500/20 dark:text-teal-400/20',
          isCompact ? 'h-8 w-8 top-2 right-2' : 'h-12 w-12 top-4 right-4'
        )}
        aria-hidden="true"
      />

      {/* Original Language Toggle */}
      {excerpt.originalLanguage && excerpt.text !== excerpt.translation && (
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className={cn(
            'absolute flex items-center gap-1.5 px-2.5 py-1 rounded-md',
            'text-xs font-medium transition-colors',
            'border border-slate-200 dark:border-slate-700',
            showOriginal
              ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/30',
            isCompact ? 'top-2 right-12' : 'top-4 right-20'
          )}
          aria-pressed={showOriginal}
          aria-label={showOriginal ? 'Show translation' : 'Show original language'}
        >
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{showOriginal ? 'Translation' : excerpt.originalLanguage}</span>
        </button>
      )}

      {/* Quote Text */}
      <blockquote className={cn('relative', isCompact ? 'pr-16' : 'pr-20')}>
        <p
          className={cn(
            'font-serif italic leading-relaxed',
            showOriginal
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-700 dark:text-slate-300',
            isCompact ? 'text-base' : 'text-lg'
          )}
          lang={showOriginal && excerpt.originalLanguage ? getLanguageCode(excerpt.originalLanguage) : 'en'}
        >
          &ldquo;{showOriginal ? excerpt.text : excerpt.translation}&rdquo;
        </p>
      </blockquote>

      {/* Citation Footer */}
      <figcaption className={cn('mt-4 flex flex-wrap items-center gap-x-3 gap-y-1', isCompact ? 'text-xs' : 'text-sm')}>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Book className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <cite className="not-italic font-medium">
            {excerpt.source}
            {excerpt.lineNumbers && (
              <span className="text-slate-500 dark:text-slate-500 font-normal">
                , {excerpt.lineNumbers}
              </span>
            )}
          </cite>
        </div>

        {excerpt.translator && (
          <span className="text-slate-500 dark:text-slate-500">
            trans. {excerpt.translator}
          </span>
        )}

        {linkedSource?.externalUrl && (
          <a
            href={linkedSource.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            aria-label={`Read ${linkedSource.title} (opens in new tab)`}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Read source</span>
          </a>
        )}
      </figcaption>
    </figure>
  );
}

// Helper to convert language names to ISO codes for the lang attribute
function getLanguageCode(language: string): string {
  const codes: Record<string, string> = {
    'Ancient Greek': 'grc',
    'Old Norse': 'non',
    'Sanskrit': 'sa',
    'Latin': 'la',
    'Ancient Egyptian': 'egy',
    'Ancient Egyptian (Hieroglyphic)': 'egy',
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

// Export a list component for multiple excerpts
interface SourceExcerptsListProps {
  excerpts: PrimarySourceExcerpt[];
  className?: string;
  variant?: 'default' | 'compact';
}

export function SourceExcerptsList({ excerpts, className, variant = 'default' }: SourceExcerptsListProps) {
  if (!excerpts || excerpts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {excerpts.map((excerpt, index) => (
        <SourceExcerpt
          key={`${excerpt.sourceId || excerpt.source}-${index}`}
          excerpt={excerpt}
          variant={variant}
        />
      ))}
    </div>
  );
}
