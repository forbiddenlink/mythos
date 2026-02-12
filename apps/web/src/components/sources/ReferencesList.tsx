'use client';

import { useState } from 'react';
import { Book, Scroll, Pen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import sourcesData from '@/data/sources.json';

export interface FurtherReadingReference {
  sourceId: string;
  note?: string;
}

interface Source {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  type: 'ancient-text' | 'academic' | 'translation';
  language?: string;
  description?: string;
  externalUrl?: string;
  translators?: Array<{ name: string; year: number }>;
}

interface ReferencesListProps {
  references: FurtherReadingReference[];
  title?: string;
  className?: string;
  showDescriptions?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const typeConfig = {
  'ancient-text': {
    label: 'Ancient Texts',
    icon: Scroll,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  academic: {
    label: 'Academic References',
    icon: Book,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
  translation: {
    label: 'Translations & Retellings',
    icon: Pen,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
};

export function ReferencesList({
  references,
  title = 'Further Reading',
  className,
  showDescriptions = false,
  collapsible = false,
  defaultExpanded = true,
}: ReferencesListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!references || references.length === 0) {
    return null;
  }

  // Type for resolved references
  type ResolvedRef = Source & { note?: string };

  // Resolve references to full source objects and group by type
  const resolvedRefs: ResolvedRef[] = [];
  for (const ref of references) {
    const source = (sourcesData as Source[]).find(s => s.id === ref.sourceId);
    if (source) {
      resolvedRefs.push({ ...source, note: ref.note });
    }
  }

  // Group by type
  const groupedRefs = resolvedRefs.reduce(
    (acc, ref) => {
      const type = ref.type || 'academic';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(ref);
      return acc;
    },
    {} as Record<string, ResolvedRef[]>
  );

  // Order: ancient-text, translation, academic
  const typeOrder: Array<'ancient-text' | 'translation' | 'academic'> = [
    'ancient-text',
    'translation',
    'academic',
  ];

  const headerContent = (
    <div className="flex items-center gap-2">
      <Book className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
      <h3 className="font-serif text-lg font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {collapsible && (
        <span className="ml-auto text-slate-500 dark:text-slate-400">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden',
        className
      )}
    >
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="references-content"
        >
          {headerContent}
        </button>
      ) : (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          {headerContent}
        </div>
      )}

      <div
        id="references-content"
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 pt-0 space-y-6">
          {typeOrder.map(type => {
            const refs = groupedRefs[type];
            if (!refs || refs.length === 0) return null;

            const config = typeConfig[type];
            const Icon = config.icon;

            return (
              <section key={type} aria-labelledby={`ref-type-${type}`}>
                <h4
                  id={`ref-type-${type}`}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium mb-3',
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {config.label}
                </h4>
                <ul className="space-y-3" role="list">
                  {refs.map(ref => (
                    <ReferenceItem
                      key={ref.id}
                      source={ref}
                      note={ref.note}
                      showDescription={showDescriptions}
                      typeConfig={config}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ReferenceItemProps {
  source: Source & { note?: string };
  note?: string;
  showDescription?: boolean;
  typeConfig: (typeof typeConfig)['ancient-text'];
}

function ReferenceItem({ source, note, showDescription, typeConfig }: ReferenceItemProps) {
  return (
    <li
      className={cn(
        'p-3 rounded-lg border transition-colors',
        typeConfig.bgColor,
        typeConfig.borderColor,
        'hover:shadow-sm'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Title and Author */}
          <p className="font-medium text-slate-800 dark:text-slate-200">
            <cite className="not-italic">{source.title}</cite>
            {source.author && (
              <span className="text-slate-600 dark:text-slate-400 font-normal">
                {' '}
                by {source.author}
              </span>
            )}
          </p>

          {/* Year and Language */}
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
            {source.year}
            {source.language && (
              <>
                <span className="mx-1.5">·</span>
                <span className="italic">{source.language}</span>
              </>
            )}
          </p>

          {/* Note from reference */}
          {note && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
              {note}
            </p>
          )}

          {/* Description */}
          {showDescription && source.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
              {source.description}
            </p>
          )}

          {/* Recommended Translations */}
          {source.translators && source.translators.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              <span className="font-medium">Recommended translations:</span>{' '}
              {source.translators.slice(0, 2).map((t, i) => (
                <span key={t.name}>
                  {i > 0 && ', '}
                  {t.name} ({t.year})
                </span>
              ))}
            </p>
          )}
        </div>

        {/* External Link */}
        {source.externalUrl && (
          <a
            href={source.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
              'text-teal-600 dark:text-teal-400',
              'hover:bg-teal-100 dark:hover:bg-teal-900/50'
            )}
            aria-label={`Read ${source.title} online (opens in new tab)`}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Read</span>
          </a>
        )}
      </div>
    </li>
  );
}

// Standalone bibliography component for pages that want to show all sources
interface BibliographyProps {
  sourceIds?: string[];
  className?: string;
}

export function Bibliography({ sourceIds, className }: BibliographyProps) {
  const sources = sourceIds
    ? (sourcesData as Source[]).filter(s => sourceIds.includes(s.id))
    : (sourcesData as Source[]);

  const groupedSources = sources.reduce(
    (acc, source) => {
      const type = source.type || 'academic';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(source);
      return acc;
    },
    {} as Record<string, Source[]>
  );

  const typeOrder: Array<'ancient-text' | 'translation' | 'academic'> = [
    'ancient-text',
    'translation',
    'academic',
  ];

  return (
    <div className={cn('space-y-8', className)}>
      {typeOrder.map(type => {
        const typeSources = groupedSources[type];
        if (!typeSources || typeSources.length === 0) return null;

        const config = typeConfig[type];
        const Icon = config.icon;

        return (
          <section key={type} aria-labelledby={`bib-${type}`}>
            <h3
              id={`bib-${type}`}
              className={cn(
                'flex items-center gap-2 text-xl font-serif font-semibold mb-4',
                config.color
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {config.label}
            </h3>
            <ul className="space-y-3" role="list">
              {typeSources.map(source => (
                <li
                  key={source.id}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    <cite className="not-italic">{source.title}</cite>
                  </p>
                  {source.author && (
                    <p className="text-slate-600 dark:text-slate-400">{source.author}</p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    {source.year}
                    {source.language && ` · ${source.language}`}
                  </p>
                  {source.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {source.description}
                    </p>
                  )}
                  {source.externalUrl && (
                    <a
                      href={source.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Access online
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
