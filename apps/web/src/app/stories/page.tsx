'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_STORIES } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { StoryFilters } from '@/components/stories/StoryFilters';
import { BookmarkButton } from '@/components/ui/bookmark-button';

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
      <div className="container mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
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
        
        {data?.stories && (
          <div className="mt-6">
            <StoryFilters stories={data.stories} onFilteredChange={setFilteredStories} />
          </div>
        )}
        
        {displayStories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {displayStories.map((story, index) => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <Card className="group h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden">
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
