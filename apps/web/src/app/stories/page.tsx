'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_STORIES } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, BookOpen, Gamepad2, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { StoryFilters } from '@/components/stories/StoryFilters';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { GridSkeleton, FiltersSkeleton } from '@/components/ui/skeleton-cards';
import { BranchingStory, getDiscoveredEndings } from '@/lib/branching-story';
import branchingStoriesData from '@/data/branching-stories.json';

const branchingStories = branchingStoriesData as unknown as BranchingStory[];

// Interactive Story Card Component
function InteractiveStoryCard({ story }: { story: BranchingStory }) {
  const [discoveredCount, setDiscoveredCount] = useState(0);

  useEffect(() => {
    const discovered = getDiscoveredEndings(story.id);
    setDiscoveredCount(discovered.length);
  }, [story.id]);

  return (
    <Link href={`/stories/interactive/${story.slug}`} className="group">
      <Card asArticle className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden relative">
        {/* Interactive badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gold/20 text-gold border-gold/30 gap-1">
            <Gamepad2 className="h-3 w-3" />
            Interactive
          </Badge>
        </div>

        {/* Gradient top border */}
        <div className="h-1 bg-gradient-to-r from-gold via-amber-400 to-gold"></div>

        <CardHeader className="relative">
          <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Gamepad2 className="h-24 w-24 text-gold" />
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-dark via-gold to-amber-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Gamepad2 className="h-6 w-6 text-midnight" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0 pr-16">
              <CardTitle className="text-lg group-hover:text-gold transition-colors duration-300 line-clamp-2">
                {story.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Play as {story.protagonist}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {story.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {story.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              {discoveredCount > 0 ? (
                <span className="text-gold">{discoveredCount}/{story.totalEndings}</span>
              ) : (
                <span>{story.totalEndings} endings</span>
              )}
            </span>
          </div>

          {/* Progress bar if started */}
          {discoveredCount > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 bg-midnight rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-300"
                  style={{ width: `${(discoveredCount / story.totalEndings) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gold/70">
                {discoveredCount === story.totalEndings
                  ? 'All endings discovered!'
                  : `${story.totalEndings - discoveredCount} ending${story.totalEndings - discoveredCount > 1 ? 's' : ''} remaining`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string | null;
  fullNarrative: string | null;
  themes: string[];
  culturalSignificance: string | null;
  imageUrl: string | null;
  category?: string;
  moralThemes?: string[];
}

export default function StoriesPage() {
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  
  const { data, isLoading, error } = useQuery<{ stories: Story[] }>({
    queryKey: ['stories'],
    queryFn: async () => graphqlClient.request(GET_STORIES),
    select: (data) => ({
      stories: data.stories.map(story => ({
        ...story,
        category: story.themes?.[0] || 'other',
        moralThemes: story.themes || [],
      })),
    }),
  });

  const displayStories = filteredStories.length > 0 ? filteredStories : (data?.stories || []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero placeholder */}
        <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80" />

        {/* Content Section */}
        <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
          <div className="h-5 w-32 bg-muted rounded animate-pulse mb-6" />
          <FiltersSkeleton />
          <GridSkeleton count={6} columns={3} type="story" className="mt-6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading stories</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/stories-hero.png"
            alt="Ancient Manuscripts"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={85}
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
              <ScrollText className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Epic Tales
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Mythological Stories
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Epic tales and legends from ancient civilizations
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        {/* Interactive Stories Section */}
        {branchingStories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                <Gamepad2 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-semibold text-foreground">Interactive Stories</h2>
                <p className="text-sm text-muted-foreground">Choose your own adventure through mythology</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {branchingStories.map((story) => (
                <InteractiveStoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Stories */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <BookOpen className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground">Epic Tales</h2>
            <p className="text-sm text-muted-foreground">Classic mythology narratives</p>
          </div>
        </div>

        {data?.stories && (
          <div className="mb-6">
            <StoryFilters stories={data.stories} onFilteredChange={setFilteredStories} />
          </div>
        )}

        {displayStories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {displayStories.map((story, index) => (
              <Link key={story.id} href={`/stories/${story.slug}`} className="group">
                <Card asArticle className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden">
                  {/* Subtle Top Border */}
                  <div className="h-0.5 bg-gradient-to-r from-gold-dark via-gold to-gold-dark"></div>

                  <CardHeader className="relative">
                    <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      <BookOpen className="h-24 w-24 text-gold" />
                    </div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${index % 3 === 0 ? 'from-gold-dark to-bronze' :
                          index % 3 === 1 ? 'from-midnight-light to-midnight' :
                            'from-patina to-[oklch(0.45_0.10_170)]'
                        } flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                        <ScrollText className="h-6 w-6 text-white/90" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-gold transition-colors duration-300 line-clamp-2">
                          {story.title}
                        </CardTitle>
                      </div>
                      <BookmarkButton type="story" id={story.id} size="sm" />
                    </div>
                  </CardHeader>

                  {story.summary && (
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {story.summary}
                      </p>
                      {story.themes && story.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.themes.slice(0, 3).map((theme) => (
                            <Badge
                              key={theme}
                              variant="secondary"
                              className="text-xs bg-gold/10 text-gold border border-gold/20"
                            >
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-muted border border-border mb-6">
              <ScrollText className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2 text-foreground">No stories yet</h2>
            <p className="text-muted-foreground">
              Check back later for mythological tales and legends
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
