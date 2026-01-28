'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Globe, ScrollText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { SEARCH } from '@/lib/queries';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchResult {
  deities: Array<{
    id: string;
    name: string;
    slug: string;
    domain: string[];
    description: string | null;
  }>;
  pantheons: Array<{
    id: string;
    name: string;
    slug: string;
    culture: string;
    description: string | null;
  }>;
  stories: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
  }>;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { data, isLoading } = useQuery<{ search: SearchResult }>({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) {
        return { search: { deities: [], pantheons: [], stories: [] } };
      }
      return graphqlClient.request(SEARCH, { query: searchQuery, limit: 5 });
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  const results = data?.search;
  const hasResults = results && (results.deities.length > 0 || results.pantheons.length > 0 || results.stories.length > 0);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-64"
      >
        <Search className="h-4 w-4 text-slate-500" />
        <span className="text-sm text-slate-500 flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-xs text-slate-600 dark:text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for deities, pantheons, or stories..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && searchQuery.length >= 2 && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          )}

          {!isLoading && searchQuery.length >= 2 && !hasResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {!isLoading && results && results.deities.length > 0 && (
            <CommandGroup heading="Deities">
              {results.deities.map((deity) => (
                <CommandItem
                  key={deity.id}
                  value={deity.name}
                  onSelect={() => handleSelect(() => router.push(`/deities/${deity.slug}`))}
                  className="cursor-pointer"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                  <div className="flex-1">
                    <div className="font-medium">{deity.name}</div>
                    {deity.domain && deity.domain.length > 0 && (
                      <div className="text-xs text-slate-500">
                        {deity.domain.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!isLoading && results && results.pantheons.length > 0 && (
            <CommandGroup heading="Pantheons">
              {results.pantheons.map((pantheon) => (
                <CommandItem
                  key={pantheon.id}
                  value={pantheon.name}
                  onSelect={() => handleSelect(() => router.push(`/pantheons/${pantheon.slug}`))}
                  className="cursor-pointer"
                >
                  <Globe className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">{pantheon.name}</div>
                    <div className="text-xs text-slate-500">{pantheon.culture}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!isLoading && results && results.stories.length > 0 && (
            <CommandGroup heading="Stories">
              {results.stories.map((story) => (
                <CommandItem
                  key={story.id}
                  value={story.title}
                  onSelect={() => handleSelect(() => router.push(`/stories/${story.slug}`))}
                  className="cursor-pointer"
                >
                  <ScrollText className="mr-2 h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <div className="font-medium">{story.title}</div>
                    {story.summary && (
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {story.summary.substring(0, 80)}...
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
