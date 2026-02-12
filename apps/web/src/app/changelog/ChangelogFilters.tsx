'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bug, BookOpen, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChangelogType } from '@/components/changelog/ChangelogEntry';

interface ChangelogFiltersProps {
  activeFilter?: ChangelogType;
}

const filters = [
  { type: undefined, label: 'All', icon: LayoutGrid },
  { type: 'feature' as const, label: 'Features', icon: Sparkles },
  { type: 'fix' as const, label: 'Fixes', icon: Bug },
  { type: 'content' as const, label: 'Content', icon: BookOpen },
];

export function ChangelogFilters({ activeFilter }: ChangelogFiltersProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter changelog entries">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.type;
        const Icon = filter.icon;
        const href = filter.type ? `${pathname}?type=${filter.type}` : pathname;

        return (
          <Link
            key={filter.label}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              'border border-border/60 hover:border-gold/40',
              isActive
                ? 'bg-gold/20 text-gold border-gold/40'
                : 'bg-midnight-light/50 text-parchment/70 hover:text-parchment hover:bg-midnight-light'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
