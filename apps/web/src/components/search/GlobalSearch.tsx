
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  Users,
  BookOpen,
  Network,
  Globe,
  Sparkles,
  MapPin,
  Map as MapIcon,
  Skull,
  Gem
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { SEARCH } from '@/lib/queries';
import { CommandPalette, SearchGroup } from '@/components/command-palette/CommandPalette'; // Ensure exports exist
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists

/*
   We keep the interfaces aligned with GraphQL return types
*/
interface SearchResult {
  deities: Array<{
    id: string;
    name: string;
    slug: string;
    pantheon?: { name: string };
    description: string;
    imageUrl: string;
  }>;
  creatures: Array<{
    id: string;
    name: string;
    slug: string;
    habitat: string; // Keeping habitat as it's used in subtitle
    description: string;
  }>;
  artifacts: Array<{
    id: string;
    name: string;
    slug: string;
    type: string; // Keeping type as it's used in subtitle
    description: string;
  }>;
  pantheons: Array<{
    id: string;
    name: string;
    slug: string;
    culture: string; // Keeping culture as it's used in subtitle
  }>;
  stories: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
  }>;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // We use useDebounce to avoid hammering the API
  // ...
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, error } = useQuery<{ search: SearchResult }>({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        return { search: { deities: [], creatures: [], artifacts: [], pantheons: [], stories: [] } };
      }
      console.log('Fetching search for:', debouncedSearch);
      try {
        const res = await graphqlClient.request(SEARCH, { query: debouncedSearch, limit: 5 });
        console.log('Search response:', res);
        return res as { search: SearchResult };
      } catch (err) {
        console.error('Search error:', err);
        throw err;
      }
    },
    enabled: true,
  });

  const results = data?.search;
  // Log results to debug
  useEffect(() => {
    if (results) console.log('Parsed Search Results:', results);
  }, [results]);

  // ─── Transform Data to Generic Groups ─────────────────────────────────
  const searchGroups: SearchGroup[] = [];

  // 1. Navigation (Always present or filtered? Let's keep it static for now or filter)
  // For this implementing, we'll keep it simple: if search is empty, show nav, else show results

  if (!debouncedSearch || debouncedSearch.length < 2) { // Show navigation if search is empty or too short
    searchGroups.push({
      heading: 'Navigation',
      items: [
        { id: 'nav-home', title: 'Home', href: '/', icon: Home, iconColor: 'text-teal-600' },
        { id: 'nav-deities', title: 'All Deities', href: '/deities', icon: Users, iconColor: 'text-teal-600' },
        { id: 'nav-creatures', title: 'Creatures', href: '/creatures', icon: Skull, iconColor: 'text-red-500' },
        { id: 'nav-artifacts', title: 'Artifacts', href: '/artifacts', icon: Gem, iconColor: 'text-purple-500' },
        { id: 'nav-stories', title: 'Stories', href: '/stories', icon: BookOpen, iconColor: 'text-amber-600' },
        { id: 'nav-family', title: 'Family Tree', href: '/family-tree', icon: Network, iconColor: 'text-emerald-600' },
        { id: 'nav-map', title: 'Locations', href: '/locations', icon: MapIcon, iconColor: 'text-indigo-500' },
        { id: 'nav-pantheons', title: 'Pantheons', href: '/pantheons', icon: Globe, iconColor: 'text-slate-600' },
      ]
    });
  }

  if (results && debouncedSearch.length >= 2) { // Only show search results if there's a valid search query
    if (results.deities.length > 0) {
      searchGroups.push({
        heading: 'Deities',
        items: results.deities.map((d: any) => ({
          id: d.id,
          title: d.name,
          subtitle: d.pantheon?.name,
          href: `/ deities / ${d.slug} `,
          icon: Sparkles,
          iconColor: 'text-teal-600'
        }))
      });
    }

    if (results.creatures.length > 0) {
      searchGroups.push({
        heading: 'Creatures',
        items: results.creatures.map((c: any) => ({
          id: c.id,
          title: c.name,
          subtitle: c.habitat,
          href: `/ creatures / ${c.slug} `,
          icon: Skull,
          iconColor: 'text-red-600' // slightly darker than nav
        }))
      });
    }

    if (results.artifacts.length > 0) {
      searchGroups.push({
        heading: 'Artifacts',
        items: results.artifacts.map((a: any) => ({
          id: a.id,
          title: a.name,
          subtitle: a.type,
          href: `/ artifacts / ${a.slug} `,
          icon: Gem,
          iconColor: 'text-purple-600'
        }))
      });
    }

    if (results.stories.length > 0) {
      searchGroups.push({
        heading: 'Stories',
        items: results.stories.map((s: any) => ({
          id: s.id,
          title: s.title,
          subtitle: s.summary?.substring(0, 50) + '...',
          href: `/stories/${s.slug}`,
          icon: BookOpen,
          iconColor: 'text-amber-600'
        }))
      });
    }

    if (results.pantheons.length > 0) {
      searchGroups.push({
        heading: 'Pantheons',
        items: results.pantheons.map((p: any) => ({
          id: p.id,
          title: p.name,
          subtitle: p.culture, // Added culture as subtitle
          href: `/pantheons/${p.slug}`,
          icon: Globe,
          iconColor: 'text-slate-600'
        }))
      });
    }
  }

  // Handle keyboard shortcuts for opening the command palette
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

  // Callback for when an item is selected
  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

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

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={searchGroups}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        isLoading={isLoading}
      />
    </>
  );
}
