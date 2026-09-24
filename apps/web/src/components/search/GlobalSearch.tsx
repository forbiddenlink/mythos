"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { trackEvent } from "@/lib/analytics/events";
import { useDebounce } from "@/hooks/use-debounce";
import {
  clearRecentSearches,
  getPopularSearches,
  getRecentSearches,
  getResultUrl,
  saveRecentSearch,
  searchAll,
  type ContentType,
  type SearchResult as SearchResultType,
} from "@/lib/search";
import {
  BookOpen,
  Clock,
  Gem,
  Globe,
  Home,
  Map as MapIcon,
  MapPin,
  Network,
  Skull,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PointerEvent,
} from "react";

// Icons for each content type
const typeIcons: Record<ContentType, typeof Sparkles> = {
  deity: Sparkles,
  story: BookOpen,
  creature: Skull,
  artifact: Gem,
  location: MapPin,
  hero: Sparkles,
  source: BookOpen,
};

// Colors for each content type
const typeColors: Record<ContentType, string> = {
  deity: "text-amber-500",
  story: "text-blue-500",
  creature: "text-red-500",
  artifact: "text-bronze",
  location: "text-emerald-500",
  hero: "text-gold",
  source: "text-bronze",
};

// Group labels for each content type
const typeLabels: Record<ContentType, string> = {
  deity: "Deities",
  story: "Stories",
  creature: "Creatures",
  artifact: "Artifacts",
  location: "Locations",
  hero: "Heroes",
  source: "Sources",
};

// Navigation items shown when no search query
const navigationItems = [
  {
    id: "nav-home",
    title: "Home",
    href: "/",
    icon: Home,
    iconColor: "text-teal-600",
  },
  {
    id: "nav-deities",
    title: "All Deities",
    href: "/deities",
    icon: Users,
    iconColor: "text-amber-500",
  },
  {
    id: "nav-creatures",
    title: "Creatures",
    href: "/creatures",
    icon: Skull,
    iconColor: "text-red-500",
  },
  {
    id: "nav-artifacts",
    title: "Artifacts",
    href: "/artifacts",
    icon: Gem,
    iconColor: "text-bronze",
  },
  {
    id: "nav-stories",
    title: "Stories",
    href: "/stories",
    icon: BookOpen,
    iconColor: "text-blue-500",
  },
  {
    id: "nav-family",
    title: "Family Tree",
    href: "/family-tree",
    icon: Network,
    iconColor: "text-emerald-600",
  },
  {
    id: "nav-map",
    title: "Locations",
    href: "/locations",
    icon: MapIcon,
    iconColor: "text-emerald-500",
  },
  {
    id: "nav-pantheons",
    title: "Pantheons",
    href: "/pantheons",
    icon: Globe,
    iconColor: "text-slate-600",
  },
];

export function GlobalSearch({
  open,
  onOpenChange: setOpen,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load recent searches when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate recent searches from localStorage
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Search results using local JSON search
  const results = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      return [];
    }
    return searchAll(debouncedSearch, 15);
  }, [debouncedSearch]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<ContentType, SearchResultType[]> = {
      deity: [],
      story: [],
      creature: [],
      artifact: [],
      location: [],
      hero: [],
      source: [],
    };

    for (const result of results) {
      groups[result.type].push(result);
    }

    // Keep the strongest match first, even when another group has more hits.
    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .sort((a, b) => b[1][0].matchScore - a[1][0].matchScore) as [
      ContentType,
      SearchResultType[],
    ][];
  }, [results]);

  // Zero-result searches name the content gaps worth filling next; the query
  // itself is never sent, only its length.
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return;
    trackEvent("search_performed", {
      queryLength: debouncedSearch.length,
      resultCount: results.length,
    });
  }, [debouncedSearch, results.length]);

  const popularSearches = useMemo(() => getPopularSearches().slice(0, 6), []);

  const navigateAfterClose = useCallback(
    (href: string) => {
      setSearchQuery("");
      setOpen(false);
      // Pointerdown + a tick: Radix dialog teardown otherwise swallows the push.
      window.setTimeout(() => {
        router.push(href);
      }, 50);
    },
    [router, setOpen],
  );

  const pointerSelect = useCallback((action: () => void) => {
    return (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      action();
    };
  }, []);

  const handleSelect = useCallback(
    (result: SearchResultType) => {
      saveRecentSearch(result.title);
      setRecentSearches(getRecentSearches());
      navigateAfterClose(getResultUrl(result));
    },
    [navigateAfterClose],
  );

  const handleNavigationSelect = useCallback(
    (href: string) => {
      navigateAfterClose(href);
    },
    [navigateAfterClose],
  );

  const handleQuickSearch = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset search query when dialog closes
      setSearchQuery("");
    }
  }, [open]);

  const showSuggestions = searchQuery.trim().length < 2;
  // While the query has 2+ chars but debounce hasn't caught up, show a pending
  // state instead of popular/recent suggestions — otherwise Enter selects the
  // wrong item (Home / popular terms) mid-type.
  const showPendingResults =
    searchQuery.trim().length >= 2 &&
    debouncedSearch.trim() !== searchQuery.trim();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search deities, stories, creatures..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {showSuggestions ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
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
                <CommandItem
                  value="clear-recent"
                  onSelect={handleClearRecent}
                  className="text-xs text-muted-foreground"
                >
                  Clear recent searches
                </CommandItem>
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

            <CommandSeparator />

            {/* Quick Navigation */}
            <CommandGroup heading="Quick Navigation">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleNavigationSelect(item.href)}
                    onPointerDown={pointerSelect(() =>
                      handleNavigationSelect(item.href),
                    )}
                    className="flex items-center gap-2"
                  >
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        ) : showPendingResults ? (
          <CommandEmpty>Searching…</CommandEmpty>
        ) : (
          <>
            {/* Search Results */}
            {groupedResults.length === 0 && (
              <CommandEmpty className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No results found for &quot;{debouncedSearch}&quot;
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => handleNavigationSelect("/pantheons")}
                    className="text-xs px-2.5 py-1 rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  >
                    Browse Pantheons
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigationSelect("/deities")}
                    className="text-xs px-2.5 py-1 rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  >
                    All Deities
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigationSelect("/stories")}
                    className="text-xs px-2.5 py-1 rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  >
                    Read Stories
                  </button>
                </div>
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
                      onPointerDown={pointerSelect(() => handleSelect(result))}
                      className="flex items-center gap-3"
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">
                          {result.title}
                        </span>
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
