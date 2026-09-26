"use client";

import { useBookmarks } from "@/hooks/useBookmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  EmptyState,
  primaryLinkClass,
  secondaryLinkClass,
} from "@/components/layout/tool-stage";
import { Sparkles, ScrollText, BookOpen, Heart } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import type { BookmarkType } from "@/providers/bookmarks-provider";

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

interface SourceWork {
  id: string;
  title: string;
  author?: string;
  type: string;
  description: string;
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

interface BookmarksPageClientProps {
  deitiesData: Deity[];
  storiesData: Story[];
  pantheonsData: Pantheon[];
  heroesData: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
  }>;
  sourcesData: SourceWork[];
}

export function BookmarksPageClient({
  deitiesData,
  storiesData,
  pantheonsData,
  heroesData,
  sourcesData,
}: Readonly<BookmarksPageClientProps>) {
  const { getBookmarks, getReadingProgress } = useBookmarks();

  const deityBookmarks = getBookmarks("deity");
  const storyBookmarks = getBookmarks("story");
  const pantheonBookmarks = getBookmarks("pantheon");
  const heroBookmarks = getBookmarks("hero");
  const sourceBookmarks = getBookmarks("source");
  const allBookmarks = getBookmarks();
  const deities = deitiesData as Deity[];
  const stories = storiesData as Story[];
  const pantheons = pantheonsData as Pantheon[];
  const sources = sourcesData as SourceWork[];

  const bookmarkedDeities =
    deities.filter((d) => deityBookmarks.some((b) => b.id === d.id)) ?? [];

  const bookmarkedStories =
    stories.filter((s) => storyBookmarks.some((b) => b.id === s.id)) ?? [];

  const isEmpty = allBookmarks.length === 0;

  const header = (
    <PageHeader
      eyebrow="Your collection"
      mark="favor"
      title="Bookmarks"
      lede={
        isEmpty
          ? "Save favourite deities, heroes, stories, pantheons and sources to come back to."
          : `${allBookmarks.length} saved item${allBookmarks.length !== 1 ? "s" : ""}, kept in this browser.`
      }
    />
  );

  if (isEmpty) {
    return (
      <div className="min-h-screen">
        {header}
        <Container className="section-space-sm">
          <BookmarksEmpty />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {header}

      {/* Content Section */}
      <div className="page-shell">
        {isEmpty ? (
          <BookmarksEmpty />
        ) : (
          <div className="mt-8 space-y-12">
            {heroBookmarks.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                  Heroes
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {heroBookmarks.map((bookmark) => {
                    const hero = heroesData.find(
                      (item) => item.id === bookmark.id,
                    );
                    if (!hero) return null;
                    return (
                      <BookmarkCard
                        key={hero.id}
                        type="hero"
                        id={hero.id}
                        href={`/heroes/${hero.slug}`}
                        title={hero.name}
                        description={hero.description}
                        timestamp={bookmark.timestamp}
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
            {sourceBookmarks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <MythosMark id="scroll" className="h-5 w-5 text-gold" />
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Reading List
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-gold/20 text-amber-900 dark:text-amber-100 border border-gold/30"
                  >
                    {sourceBookmarks.length}
                  </Badge>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sourceBookmarks.map((bookmark) => {
                    const source = sources.find(
                      (item) => item.id === bookmark.id,
                    );
                    if (!source) return null;
                    return (
                      <BookmarkCard
                        key={source.id}
                        type="source"
                        id={source.id}
                        href={`/sources/${source.id}`}
                        title={source.title}
                        description={source.description}
                        tags={[source.author, source.type].filter(
                          (tag): tag is string => Boolean(tag),
                        )}
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
            {/* Bookmarked Deities */}
            {deityBookmarks.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <MythosMark id="laurel" className="h-5 w-5 text-gold" />
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
                  <MythosMark id="scroll" className="h-5 w-5 text-gold" />
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
                  <MythosMark id="codex" className="h-5 w-5 text-gold" />
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
    <Card
      interactive
      className="group relative h-full cursor-pointer parchment-card bg-card transition-transform duration-300 hover:-translate-y-1"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(timestamp)}
            </span>
            <BookmarkButton type={type} id={id} size="sm" className="z-10" />
          </div>
        </div>
        <CardTitle className="text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
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
  );
}

const PREVIEW_ROWS = [
  { name: "Athena", meta: "Deity · Greek", image: "/deities/athena.jpg" },
  { name: "Odin", meta: "Deity · Norse", image: "/deities/odin.jpg" },
  { name: "Isis", meta: "Deity · Egyptian", image: "/deities/isis.jpg" },
];

function BookmarksEmpty() {
  return (
    <EmptyState
      id="bookmarks-empty-title"
      mark="favor"
      eyebrow="Nothing saved yet"
      title="Keep a reading list"
      description="Save a figure, story or source with its heart button. Your saved entries will appear here, ready to open again."
      actions={
        <>
          <Link href="/stories" className={primaryLinkClass}>
            Find a story to save
          </Link>
          <Link href="/deities" className={secondaryLinkClass}>
            Browse figures
          </Link>
        </>
      }
      preview={
        <figure className="mx-auto max-w-md">
          <ul
            aria-hidden="true"
            className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70 bg-card shadow-xl shadow-black/5"
          >
            {PREVIEW_ROWS.map((row) => (
              <li key={row.name} className="flex items-center gap-4 px-5 py-4">
                <span className="relative block size-14 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                  <Image
                    src={row.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg font-semibold text-foreground">
                    {row.name}
                  </span>
                  <span className="block type-meta text-muted-foreground">
                    {row.meta}
                  </span>
                </span>
                <Heart
                  className="size-5 fill-gold text-gold"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
          <figcaption className="mt-4 text-center type-meta text-muted-foreground">
            A sample list. Bookmarks are saved in this browser; export or
            restore them from{" "}
            <Link
              href="/progress"
              className="text-gold-text underline underline-offset-4"
            >
              Your Stats
            </Link>
            .
          </figcaption>
        </figure>
      }
    />
  );
}
