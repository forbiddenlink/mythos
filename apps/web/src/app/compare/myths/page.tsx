'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_PANTHEONS } from '@/lib/queries';
import { Loader2, BookOpen, Sparkles, Share2, Check, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MythComparisonView } from '@/components/compare/MythComparisonView';
import {
  type Story,
  type MythComparison,
  compareMythVersions,
  PRESET_MYTH_COMPARISONS,
  getAvailableCategories,
  searchStories,
} from '@/lib/myth-comparison';
import storiesData from '@/data/stories.json';

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

export default function CompareMythsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPantheon, setSelectedPantheon] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Cast stories data
  const allStories = storiesData as Story[];

  // Fetch pantheons
  const { data: pantheonsData } = useQuery<{ pantheons: Pantheon[] }>({
    queryKey: ['pantheons'],
    queryFn: async () => graphqlClient.request(GET_PANTHEONS),
  });

  const pantheons = pantheonsData?.pantheons || [];

  // Create pantheon map for display
  const pantheonMap = useMemo(() => {
    const map = new Map<string, string>();
    pantheons.forEach(p => {
      map.set(p.id, p.name.replace(' Pantheon', ''));
    });
    return map;
  }, [pantheons]);

  // Create story map for quick lookup
  const storyMap = useMemo(() => {
    const map = new Map<string, Story>();
    allStories.forEach(s => {
      map.set(s.id, s);
      map.set(s.slug, s);
    });
    return map;
  }, [allStories]);

  // Get available categories
  const categories = useMemo(() => getAvailableCategories(allStories), [allStories]);

  // Compute comparison result
  const comparison = useMemo<MythComparison | null>(() => {
    if (selectedStories.length < 2) return null;
    return compareMythVersions(
      selectedStories.map(s => s.id),
      allStories
    );
  }, [selectedStories, allStories]);

  // Filter stories for dropdown
  const filteredStories = useMemo(() => {
    const selectedIds = new Set(selectedStories.map(s => s.id));

    return allStories.filter(story => {
      // Exclude selected
      if (selectedIds.has(story.id)) return false;

      // Filter by category
      if (selectedCategory && story.category !== selectedCategory) return false;

      // Filter by pantheon
      if (selectedPantheon && story.pantheonId !== selectedPantheon) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = story.title.toLowerCase().includes(query);
        const matchesTheme = story.moralThemes.some(t =>
          t.toLowerCase().includes(query)
        );
        const matchesSummary = story.summary.toLowerCase().includes(query);
        return matchesTitle || matchesTheme || matchesSummary;
      }

      return true;
    });
  }, [allStories, selectedStories, selectedCategory, selectedPantheon, searchQuery]);

  // Initialize from URL params
  useEffect(() => {
    const storiesParam = searchParams.get('stories');
    if (storiesParam && allStories.length > 0) {
      const storyIds = storiesParam.split(',').map(s => s.trim());
      const foundStories = storyIds
        .map(id => storyMap.get(id))
        .filter((s): s is Story => s !== undefined)
        .slice(0, 3);

      if (foundStories.length > 0) {
        setSelectedStories(foundStories);
      }
    }
  }, [searchParams, allStories, storyMap]);

  // Update URL when selection changes
  const updateUrl = useCallback(
    (stories: Story[]) => {
      if (stories.length > 0) {
        const params = new URLSearchParams();
        params.set('stories', stories.map(s => s.slug).join(','));
        router.replace(`/compare/myths?${params.toString()}`, { scroll: false });
      } else {
        router.replace('/compare/myths', { scroll: false });
      }
    },
    [router]
  );

  const handleSelect = useCallback(
    (story: Story) => {
      setSelectedStories(prev => {
        if (prev.length >= 3) return prev;
        if (prev.some(s => s.id === story.id)) return prev;
        const newStories = [...prev, story];
        updateUrl(newStories);
        return newStories;
      });
      setSearchQuery('');
      setIsDropdownOpen(false);
    },
    [updateUrl]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setSelectedStories(prev => {
        const newStories = prev.filter(s => s.id !== id);
        updateUrl(newStories);
        return newStories;
      });
    },
    [updateUrl]
  );

  const handlePresetComparison = useCallback(
    (storyIds: string[]) => {
      const foundStories = storyIds
        .map(id => storyMap.get(id))
        .filter((s): s is Story => s !== undefined)
        .slice(0, 3);

      if (foundStories.length > 0) {
        setSelectedStories(foundStories);
        updateUrl(foundStories);
      }
    },
    [storyMap, updateUrl]
  );

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const formatPantheonName = (pantheonId: string) => {
    return (
      pantheonMap.get(pantheonId) ||
      pantheonId
        .replace('-pantheon', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/deities-list-hero.png"
            alt="Compare Myths"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <BookOpen className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Comparative Mythology
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Compare Myths
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Discover common themes and unique perspectives in myths from different cultures
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16 bg-mythic">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Breadcrumbs />
            <Link href="/compare">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Deity Comparison
              </Button>
            </Link>
          </div>
          {selectedStories.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share Comparison
                </>
              )}
            </Button>
          )}
        </div>

        {/* Story Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-serif font-semibold mb-4">
            Select Myths to Compare
          </h2>

          {/* Selected Stories Chips */}
          {selectedStories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedStories.map(story => (
                <Badge
                  key={story.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 border-primary/20"
                >
                  {story.title}
                  <button
                    onClick={() => handleRemove(story.id)}
                    className="hover:text-destructive transition-colors"
                    aria-label={`Remove ${story.title}`}
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </Badge>
              ))}
              {selectedStories.length < 3 && (
                <span className="text-sm text-muted-foreground self-center">
                  Select up to {3 - selectedStories.length} more
                </span>
              )}
            </div>
          )}

          {/* Filters */}
          {selectedStories.length < 3 && (
            <div className="space-y-4">
              {/* Category and Pantheon Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {categories.slice(0, 8).map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPantheon === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPantheon(null)}
                >
                  All Cultures
                </Button>
                {pantheons.map(pantheon => (
                  <Button
                    key={pantheon.id}
                    variant={selectedPantheon === pantheon.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPantheon(pantheon.id)}
                  >
                    {pantheon.name.replace(' Pantheon', '')}
                  </Button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search myths by title, theme, or content..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-4"
                />
              </div>

              {/* Dropdown Results */}
              {isDropdownOpen && (searchQuery || selectedCategory || selectedPantheon) && (
                <div className="border rounded-lg bg-card shadow-lg max-h-80 overflow-y-auto">
                  {filteredStories.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No myths found
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {filteredStories.slice(0, 15).map(story => (
                        <li key={story.id}>
                          <button
                            onClick={() => handleSelect(story)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">{story.title}</span>
                                <span className="text-muted-foreground text-sm ml-2">
                                  ({formatPantheonName(story.pantheonId)})
                                </span>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {story.summary}
                                </p>
                                <div className="flex gap-1 mt-1.5">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {story.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Predefined Comparisons */}
        {selectedStories.length === 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-serif font-semibold mb-4">
              Suggested Comparisons
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PRESET_MYTH_COMPARISONS.map(preset => {
                // Check how many stories are available
                const availableStories = preset.storyIds.filter(id => storyMap.has(id));
                if (availableStories.length < 2) return null;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetComparison(availableStories)}
                    className="p-4 rounded-lg border border-border/60 bg-card hover:border-gold/50 hover:bg-gold/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-gold" />
                      <h3 className="font-serif font-semibold group-hover:text-gold transition-colors">
                        {preset.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {preset.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {availableStories
                        .slice(0, 3)
                        .map(id => storyMap.get(id)?.title || id)
                        .join(', ')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison View */}
        <MythComparisonView
          stories={selectedStories}
          comparison={comparison}
          onRemove={handleRemove}
          pantheonMap={pantheonMap}
        />
      </div>
    </div>
  );
}
