'use client';

import { useState } from 'react';
import { Sparkles, Bug, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ChangelogType = 'feature' | 'fix' | 'content';

export interface ChangelogEntryData {
  id: string;
  date: string;
  version: string;
  title: string;
  description: string;
  changes: string[];
  type: ChangelogType;
}

interface ChangelogEntryProps {
  entry: ChangelogEntryData;
  isLast?: boolean;
}

const typeConfig = {
  feature: {
    icon: Sparkles,
    label: 'Feature',
    badgeClass: 'bg-gold/20 text-gold border-gold/30',
    iconClass: 'text-gold',
    dotClass: 'bg-gold',
  },
  fix: {
    icon: Bug,
    label: 'Fix',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    iconClass: 'text-rose-400',
    dotClass: 'bg-rose-400',
  },
  content: {
    icon: BookOpen,
    label: 'Content',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iconClass: 'text-emerald-400',
    dotClass: 'bg-emerald-400',
  },
};

export function ChangelogEntry({ entry, isLast = false }: ChangelogEntryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative flex gap-4 md:gap-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] md:left-[23px] top-12 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
      )}

      {/* Timeline dot */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
            'bg-midnight-light/80 border-2 border-border/60',
            'shadow-lg'
          )}
        >
          <Icon className={cn('h-5 w-5 md:h-6 md:w-6', config.iconClass)} />
        </div>
      </div>

      {/* Content card */}
      <Card className="flex-1 border-border/40 bg-midnight-light/50 mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn('font-mono text-xs', config.badgeClass)}
            >
              v{entry.version}
            </Badge>
            <Badge variant="outline" className={config.badgeClass}>
              {config.label}
            </Badge>
            <span className="text-sm text-muted-foreground ml-auto">
              {formattedDate}
            </span>
          </div>
          <CardTitle className="text-parchment text-xl md:text-2xl">
            {entry.title}
          </CardTitle>
          <CardDescription className="text-parchment/70 text-base">
            {entry.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors mb-3"
            aria-expanded={isExpanded}
            aria-controls={`changes-${entry.id}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide changes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {entry.changes.length} changes
              </>
            )}
          </button>

          {isExpanded && (
            <ul
              id={`changes-${entry.id}`}
              className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {entry.changes.map((change, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-parchment/80"
                >
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-2 shrink-0',
                      config.dotClass
                    )}
                  />
                  <span className="text-sm leading-relaxed">{change}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
