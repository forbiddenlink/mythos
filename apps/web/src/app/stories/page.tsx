"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { GET_STORIES } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, BookOpen, Gamepad2, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { StoryFilters } from "@/components/stories/StoryFilters";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { GridSkeleton, FiltersSkeleton } from "@/components/ui/skeleton-cards";
import { BranchingStory, getDiscoveredEndings } from "@/lib/branching-story";
import branchingStoriesData from "@/data/branching-stories.json";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PageHero } from "@/components/layout/page-hero";

const branchingStories = branchingStoriesData as unknown as BranchingStory[];

// Interactive Story Card Component
function InteractiveStoryCard({ story }: Readonly<{ story: BranchingStory }>) {
  const [discoveredCount, setDiscoveredCount] = useState(0);

  useEffect(() => {
    const discovered = getDiscoveredEndings(story.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate discovered count from localStorage
    setDiscoveredCount(discovered.length);
  }, [story.id]);

  const remaining = story.totalEndings - discoveredCount;
  const endingLabel = remaining > 1 ? "endings" : "ending";
  const progressText =
    discoveredCount === story.totalEndings
      ? "All endings discovered!"
      : `${remaining} ${endingLabel} remaining`;

  return (
    <Link href={`/stories/interactive/${story.slug}`} className="group">
      <Card
        asArticle
        className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden relative"
      >
        {/* Interactive badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gold/20 text-amber-900 dark:text-amber-100 border-gold/30 gap-1">
            <Gamepad2 className="h-3 w-3" />
            Interactive
          </Badge>
        </div>

        {/* Gradient top border */}
        <div className="h-1 bg-linear-to-r from-gold via-amber-400 to-gold"></div>

        <CardHeader className="relative">
          <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Gamepad2 className="h-24 w-24 text-gold" />
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gold-dark via-gold to-amber-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
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
                <span className="text-gold">
                  {discoveredCount}/{story.totalEndings}
                </span>
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
                  className="h-full bg-linear-to-r from-gold-dark to-gold transition-all duration-300"
                  style={{
                    width: `${(discoveredCount / story.totalEndings) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gold/70">{progressText}</p>
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
    queryKey: ["stories"],
    queryFn: async () => graphqlClient.request(GET_STORIES),
    select: (data) => ({
      stories: data.stories.map((story) => ({
        ...story,
        category: story.themes?.[0] || "other",
        moralThemes: story.themes || [],
      })),
    }),
  });

  const displayStories =
    filteredStories.length > 0 ? filteredStories : data?.stories || [];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero placeholder */}
        <div className="relative h-[50vh] min-h-100 flex items-center justify-center overflow-hidden bg-linear-to-b from-midnight/70 via-midnight/60 to-midnight/80" />

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
          <h2 className="text-2xl font-bold text-destructive">
            Error loading stories
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Mythological Stories"
        description="Epic tales and legends from ancient civilizations across 13 pantheons"
        url="/stories"
        numberOfItems={data?.stories?.length}
      />
      <PageHero
        icon={<ScrollText />}
        tagline="Epic Tales"
        title="Mythological Stories"
        description="Epic tales and legends from ancient civilizations"
        backgroundImage="/stories-hero.png"
        colorScheme="gold"
      />

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
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Interactive Stories
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose your own adventure through mythology
                </p>
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
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Epic Tales
            </h2>
            <p className="text-sm text-muted-foreground">
              Classic mythology narratives
            </p>
          </div>
        </div>

        {data?.stories && (
          <div className="mb-6">
            <StoryFilters
              stories={data.stories}
              onFilteredChange={setFilteredStories}
            />
          </div>
        )}

        {displayStories.length > 0 ? (
          <PaginatedStoryGrid stories={displayStories} />
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-muted border border-border mb-6">
              <ScrollText
                className="h-10 w-10 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2 text-foreground">
              No stories yet
            </h2>
            <p className="text-muted-foreground">
              Check back later for mythological tales and legends
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStoryGradient(index: number): string {
  if (index % 3 === 0) return "from-gold-dark to-bronze";
  if (index % 3 === 1) return "from-midnight-light to-midnight";
  return "from-patina to-[oklch(0.45_0.10_170)]";
}

function PaginatedStoryGrid({ stories }: Readonly<{ stories: Story[] }>) {
  const pagination = usePagination(stories, 24);

  // Reset to first page when filtered data changes
  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories.length]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {pagination.paginatedData.map((story, index) => (
          <Link
            key={story.id}
            href={`/stories/${story.slug}`}
            className="group"
          >
            <Card
              asArticle
              className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden"
            >
              {/* Subtle Top Border */}
              <div className="h-0.5 bg-linear-to-r from-gold-dark via-gold to-gold-dark"></div>

              <CardHeader className="relative">
                <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <BookOpen className="h-24 w-24 text-gold" />
                </div>
                <div className="flex items-start gap-3 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${getStoryGradient(index)} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}
                  >
                    <ScrollText
                      className="h-6 w-6 text-white/90"
                      strokeWidth={1.5}
                    />
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
                          className="text-xs bg-gold/20 text-amber-900 dark:text-amber-100 border border-gold/30"
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

      {pagination.totalPages > 1 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onPageChange={pagination.setPage}
          onNextPage={pagination.nextPage}
          onPreviousPage={pagination.previousPage}
          onFirstPage={pagination.firstPage}
          onLastPage={pagination.lastPage}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          totalItems={pagination.totalItems}
          className="mt-8"
        />
      )}
    </>
  );
}
