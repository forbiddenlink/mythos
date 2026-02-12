'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  BookOpen,
  Skull,
  Gem,
  MapPin,
  Clock,
  TrendingUp,
  X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  searchAll,
  getPopularSearches,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  getResultUrl,
  type SearchResult,
  type ContentType,
} from '@/lib/search';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';

interface SmartSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Icons for each content type
const typeIcons: Record<ContentType, typeof Sparkles> = {
  deity: Sparkles,
  story: BookOpen,
  creature: Skull,
  artifact: Gem,
  location: MapPin,
};

// Colors for each content type
const typeColors: Record<ContentType, string> = {
  deity: 'text-amber-500',
  story: 'text-blue-500',
  creature: 'text-red-500',
  artifact: 'text-purple-500',
  location: 'text-emerald-500',
};

// Group labels for each content type
const typeLabels: Record<ContentType, string> = {
  deity: 'Deities',
  story: 'Stories',
  creature: 'Creatures',
  artifact: 'Artifacts',
  location: 'Locations',
};

export function SmartSearch({ open, onOpenChange }: SmartSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [open]);

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return [];
    }
    return searchAll(debouncedQuery, 15);
  }, [debouncedQuery]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<ContentType, SearchResult[]> = {
      deity: [],
      story: [],
      creature: [],
      artifact: [],
      location: [],
    };

    for (const result of results) {
      groups[result.type].push(result);
    }

    // Filter out empty groups and sort by number of results
    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .sort((a, b) => b[1].length - a[1].length) as [ContentType, SearchResult[]][];
  }, [results]);

  const popularSearches = useMemo(() => getPopularSearches().slice(0, 6), []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(result.title);
      setRecentSearches(getRecentSearches());
      onOpenChange(false);
      setQuery('');
      router.push(getResultUrl(result));
    },
    [router, onOpenChange]
  );

  const handleQuickSearch = useCallback(
    (term: string) => {
      setQuery(term);
    },
    []
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const showSuggestions = !debouncedQuery || debouncedQuery.length < 2;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search deities, stories, creatures..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {showSuggestions ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="sr-only">Recent Searches</span>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.slice(0, 5).map((term) => (
                  <CommandItem
                    key={`recent-${term}`}
                    value={`recent-${term}`}
                    onSelect={() => handleQuickSearch(term)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{term}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentSearches.length > 0 && <CommandSeparator />}

            {/* Popular Searches */}
            <CommandGroup heading="Popular Searches">
              {popularSearches.map((term) => (
                <CommandItem
                  key={`popular-${term}`}
                  value={`popular-${term}`}
                  onSelect={() => handleQuickSearch(term)}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : (
          <>
            {/* Search Results */}
            {groupedResults.length === 0 && (
              <CommandEmpty>
                No results found for &quot;{debouncedQuery}&quot;
              </CommandEmpty>
            )}

            {groupedResults.map(([type, items]) => {
              const Icon = typeIcons[type];
              const colorClass = typeColors[type];

              return (
                <CommandGroup key={type} heading={typeLabels[type]}>
                  {items.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.type}-${result.id}-${result.title}`}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3"
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${colorClass}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">{result.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        )}
      </CommandList>

      {/* Footer with keyboard hints */}
      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
              Enter
            </kbd>
            <span>Select</span>
          </span>
        </div>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
            Esc
          </kbd>
          <span>Close</span>
        </span>
      </div>
    </CommandDialog>
  );
}
