"use client";

import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Progress } from "@/components/ui/progress";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Heart, Sparkles, ScrollText, BookOpen, Compass } from "lucide-react";
import Link from "next/link";
import type { BookmarkType } from "@/providers/bookmarks-provider";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import pantheonsData from "@/data/pantheons.json";

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

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookmarksPage() {
  const { getBookmarks, getReadingProgress } = useBookmarks();

  const deityBookmarks = getBookmarks("deity");
  const storyBookmarks = getBookmarks("story");
  const pantheonBookmarks = getBookmarks("pantheon");
  const allBookmarks = getBookmarks();
  const deities = deitiesData as Deity[];
  const stories = storiesData as Story[];
  const pantheons = pantheonsData as Pantheon[];

  const bookmarkedDeities =
    deities.filter((d) => deityBookmarks.some((b) => b.id === d.id)) ?? [];

  const bookmarkedStories =
    stories.filter((s) => storyBookmarks.some((b) => b.id === s.id)) ?? [];

  const isEmpty = allBookmarks.length === 0;

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-75 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-gold/10 to-transparent" />
              <Heart
                className="relative h-10 w-10 text-gold"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Your Collection
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Bookmarks
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            {isEmpty
              ? "Save your favorite deities, stories, and pantheons"
              : `${allBookmarks.length} saved item${allBookmarks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Breadcrumbs />

        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold mb-3">
            Build a Personal Mythology Reading List
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Bookmarks turn Mythos Atlas into a working study shelf. Save deity
            profiles you want to compare later, keep long stories in progress,
            and collect pantheons that deserve a deeper read once you finish a
            first pass through the encyclopedia.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            This page is especially useful when you are moving between quizzes,
            stories, and reference entries. Instead of losing track of the
            threads you want to follow, you can return here and pick up where
            you left off across multiple traditions.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            A good workflow is to bookmark one deity, one story, and one
            pantheon at the same time. That creates a compact study cluster you
            can revisit later when you want a quick refresher or a deeper
            comparative reading session.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Over time this page becomes a record of what you are actively
            studying. Instead of scrolling the whole encyclopedia to relocate a
            thread, you can use bookmarks as a curated shortlist of unfinished
            myths, reference targets, and cross-cultural comparisons.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            The saved list is also useful for deliberate review. Revisit older
            bookmarks after a quiz or reading session and you can see which
            names, symbols, and stories still need reinforcement before they
            become part of your long-term mythology map.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            If you are building a cross-cultural reading plan, this page works
            best when you mix one reference page with one narrative page. That
            pairing keeps your saved list balanced between fast factual review
            and the longer story context that gives those facts meaning.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Bookmarks also work well as a revision queue. Save entries after a
            quiz or comparison session, then return here to review the exact
            deities, symbols, or stories that caused hesitation. That turns a
            generic save feature into a deliberate study workflow.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            If you are exploring a new pantheon, start by saving a few anchor
            entries rather than everything at once. A compact list is easier to
            revisit, and it gives you a clearer sense of what still needs
            context, source checking, or deeper narrative reading.
          </p>
        </section>

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
                  <Badge
                    variant="secondary"
                    className="bg-gold/20 text-amber-900 dark:text-amber-100 border border-gold/30"
                  >
                    {deityBookmarks.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedDeities.map((deity) => {
                    const bookmark = deityBookmarks.find(
                      (b) => b.id === deity.id,
                    );
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
                        icon={
                          <Sparkles
                            className="h-5 w-5 text-gold"
                            strokeWidth={1.5}
                          />
                        }
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
                    <ScrollText
                      className="h-5 w-5 text-gold"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Stories
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-gold/20 text-amber-900 dark:text-amber-100 border border-gold/30"
                  >
                    {storyBookmarks.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedStories.map((story) => {
                    const bookmark = storyBookmarks.find(
                      (b) => b.id === story.id,
                    );
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
                        icon={
                          <ScrollText
                            className="h-5 w-5 text-gold"
                            strokeWidth={1.5}
                          />
                        }
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
                  <Badge
                    variant="secondary"
                    className="bg-gold/20 text-amber-900 dark:text-amber-100 border border-gold/30"
                  >
                    {pantheonBookmarks.length}
                  </Badge>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pantheonBookmarks.map((bookmark) => {
                    const pantheon = pantheons.find(
                      (item) => item.id === bookmark.id,
                    );
                    const slug =
                      pantheon?.slug ?? bookmark.id.replace("-pantheon", "");
                    return (
                      <BookmarkCard
                        key={bookmark.id}
                        type="pantheon"
                        id={bookmark.id}
                        href={`/pantheons/${slug}`}
                        title={
                          pantheon?.name ??
                          bookmark.id
                            .replaceAll("-", " ")
                            .replaceAll(/\b\w/g, (c) => c.toUpperCase())
                        }
                        description={pantheon?.description ?? null}
                        timestamp={bookmark.timestamp}
                        icon={
                          <BookOpen
                            className="h-5 w-5 text-gold"
                            strokeWidth={1.5}
                          />
                        }
                      />
                    );
                  })}
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
                  className="text-xs bg-gold/20 text-amber-900 dark:text-amber-100 border border-gold/30"
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold/40 hover:border-gold/50 rounded-lg text-amber-900 dark:text-amber-100 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Explore Deities
        </Link>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold/40 hover:border-gold/50 rounded-lg text-amber-900 dark:text-amber-100 transition-colors"
        >
          <ScrollText className="h-4 w-4" />
          Read Stories
        </Link>
        <Link
          href="/pantheons"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold/40 hover:border-gold/50 rounded-lg text-amber-900 dark:text-amber-100 transition-colors"
        >
          <Compass className="h-4 w-4" />
          Browse Pantheons
        </Link>
      </div>
    </div>
  );
}
