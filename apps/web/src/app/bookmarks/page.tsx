'use client';

import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES, GET_STORIES } from '@/lib/queries';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { Progress } from '@/components/ui/progress';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Heart, Sparkles, ScrollText, BookOpen, Compass } from 'lucide-react';
import Link from 'next/link';
import type { BookmarkType } from '@/providers/bookmarks-provider';

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  description: string | null;
  importanceRank: number | null;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  themes: string[];
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookmarksPage() {
  const { getBookmarks, getReadingProgress } = useBookmarks();

  const deityBookmarks = getBookmarks('deity');
  const storyBookmarks = getBookmarks('story');
  const pantheonBookmarks = getBookmarks('pantheon');
  const allBookmarks = getBookmarks();

  const { data: deitiesData } = useQuery<{ deities: Deity[] }>({
    queryKey: ['deities'],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
    enabled: deityBookmarks.length > 0,
  });

  const { data: storiesData } = useQuery<{ stories: Story[] }>({
    queryKey: ['stories'],
    queryFn: async () => graphqlClient.request(GET_STORIES),
    enabled: storyBookmarks.length > 0,
  });

  const bookmarkedDeities = deitiesData?.deities.filter((d) =>
    deityBookmarks.some((b) => b.id === d.id)
  ) ?? [];

  const bookmarkedStories = storiesData?.stories.filter((s) =>
    storyBookmarks.some((b) => b.id === s.id)
  ) ?? [];

  const isEmpty = allBookmarks.length === 0;

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Heart className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Your Collection
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Bookmarks
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            {isEmpty
              ? 'Save your favorite deities, stories, and pantheons'
              : `${allBookmarks.length} saved item${allBookmarks.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Breadcrumbs />

        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="mt-8 space-y-12">
            {/* Bookmarked Deities */}
            {deityBookmarks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                    <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Deities
                  </h2>
                  <Badge variant="secondary" className="bg-gold/10 text-gold border border-gold/20">
                    {deityBookmarks.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedDeities.map((deity) => {
                    const bookmark = deityBookmarks.find((b) => b.id === deity.id);
                    return (
                      <BookmarkCard
                        key={deity.id}
                        type="deity"
                        id={deity.id}
                        href={`/deities/${deity.slug}`}
                        title={deity.name}
                        description={deity.description}
                        tags={deity.domain?.slice(0, 3)}
                        timestamp={bookmark?.timestamp ?? 0}
                        icon={<Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Bookmarked Stories */}
            {storyBookmarks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                    <ScrollText className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Stories
                  </h2>
                  <Badge variant="secondary" className="bg-gold/10 text-gold border border-gold/20">
                    {storyBookmarks.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedStories.map((story) => {
                    const bookmark = storyBookmarks.find((b) => b.id === story.id);
                    const progress = getReadingProgress(story.id);
                    return (
                      <BookmarkCard
                        key={story.id}
                        type="story"
                        id={story.id}
                        href={`/stories/${story.slug}`}
                        title={story.title}
                        description={story.summary}
                        tags={story.themes?.slice(0, 3)}
                        timestamp={bookmark?.timestamp ?? 0}
                        readingProgress={progress}
                        icon={<ScrollText className="h-5 w-5 text-gold" strokeWidth={1.5} />}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Bookmarked Pantheons */}
            {pantheonBookmarks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                    <BookOpen className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Pantheons
                  </h2>
                  <Badge variant="secondary" className="bg-gold/10 text-gold border border-gold/20">
                    {pantheonBookmarks.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pantheonBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      type="pantheon"
                      id={bookmark.id}
                      href={`/pantheons`}
                      title={bookmark.id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      description={null}
                      timestamp={bookmark.timestamp}
                      icon={<BookOpen className="h-5 w-5 text-gold" strokeWidth={1.5} />}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookmarkCard({
  type,
  id,
  href,
  title,
  description,
  tags,
  timestamp,
  readingProgress,
  icon,
}: {
  type: BookmarkType;
  id: string;
  href: string;
  title: string;
  description: string | null;
  tags?: string[];
  timestamp: number;
  readingProgress?: number;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="group h-full cursor-pointer card-elevated bg-card hover:scale-[1.01]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300">
              {icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(timestamp)}
              </span>
              <BookmarkButton type={type} id={id} size="sm" />
            </div>
          </div>
          <CardTitle className="text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-gold/10 text-gold border border-gold/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {readingProgress !== undefined && readingProgress > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Reading progress</span>
                <span>{Math.round(readingProgress)}%</span>
              </div>
              <Progress value={readingProgress} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-muted border border-border mb-6">
        <Heart className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-serif font-semibold mb-3 text-foreground">
        No bookmarks yet
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        Start exploring ancient mythology and save your favorite deities,
        stories, and pantheons to revisit them later.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/deities"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Explore Deities
        </Link>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold transition-colors"
        >
          <ScrollText className="h-4 w-4" />
          Read Stories
        </Link>
        <Link
          href="/pantheons"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold transition-colors"
        >
          <Compass className="h-4 w-4" />
          Browse Pantheons
        </Link>
      </div>
    </div>
  );
}
