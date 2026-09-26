"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  EntityCard,
  EntityCardSkeleton,
  EntityGrid,
  type EntityCardAspect,
} from "@/components/entities/EntityCard";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/layout/section";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Progress } from "@/components/ui/progress";
import { useBookmarks } from "@/hooks/useBookmarks";
import { getPantheonColor } from "@/lib/pantheon-colors";
import type { BookmarkType } from "@/providers/bookmarks-provider";

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  description: string | null;
  imageUrl: string | null;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
  summary: string | null;
  imageUrl: string | null;
  themes: string[];
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl: string | null;
}

interface Hero {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  description: string;
  imageUrl: string | null;
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
  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Saved today";
  if (diffDays === 1) return "Saved yesterday";
  if (diffDays < 7) return `Saved ${diffDays} days ago`;
  if (diffDays < 30) return `Saved ${Math.floor(diffDays / 7)} weeks ago`;
  return `Saved ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

interface BookmarksPageClientProps {
  deitiesData: Deity[];
  storiesData: Story[];
  pantheonsData: Pantheon[];
  heroesData: Hero[];
  sourcesData: SourceWork[];
  /** Pantheon id → short name ("Greek"). */
  traditionNames: Record<string, string>;
}

interface SavedCard {
  key: string;
  type: BookmarkType;
  id: string;
  href: string;
  title: string;
  description: string | null;
  image?: string | null;
  pantheonId?: string;
  subtitle?: string;
  timestamp: number;
  progress?: number;
}

export function BookmarksPageClient({
  deitiesData,
  storiesData,
  pantheonsData,
  heroesData,
  sourcesData,
  traditionNames,
}: Readonly<BookmarksPageClientProps>) {
  const { getBookmarks, getReadingProgress } = useBookmarks();
  // Bookmarks live in localStorage; until hydration we cannot know them.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mark the first client render
    setHydrated(true);
  }, []);

  const allBookmarks = getBookmarks();
  const collect = <T,>(
    type: BookmarkType,
    items: T[],
    idOf: (item: T) => string,
    toCard: (item: T) => Omit<SavedCard, "key" | "type" | "id" | "timestamp">,
  ): SavedCard[] =>
    getBookmarks(type).flatMap((bookmark) => {
      const item = items.find((candidate) => idOf(candidate) === bookmark.id);
      return item
        ? [
            {
              key: `${type}-${bookmark.id}`,
              type,
              id: bookmark.id,
              timestamp: bookmark.timestamp,
              ...toCard(item),
            },
          ]
        : [];
    });

  const groups: Array<{
    id: string;
    title: string;
    aspect: EntityCardAspect;
    cards: SavedCard[];
  }> = [
    {
      id: "deities",
      title: "Deities",
      aspect: "portrait",
      cards: collect(
        "deity",
        deitiesData,
        (d) => d.id,
        (d) => ({
          href: `/deities/${d.slug}`,
          title: d.name,
          description: d.description,
          image: d.imageUrl,
          pantheonId: d.pantheonId,
          subtitle: d.domain.slice(0, 3).join(" · "),
        }),
      ),
    },
    {
      id: "heroes",
      title: "Heroes",
      aspect: "portrait",
      cards: collect(
        "hero",
        heroesData,
        (h) => h.id,
        (h) => ({
          href: `/heroes/${h.slug}`,
          title: h.name,
          description: h.description,
          image: h.imageUrl,
          pantheonId: h.pantheonId,
        }),
      ),
    },
    {
      id: "stories",
      title: "Stories",
      aspect: "landscape",
      cards: collect(
        "story",
        storiesData,
        (s) => s.id,
        (s) => ({
          href: `/stories/${s.slug}`,
          title: s.title,
          description: s.summary,
          image: s.imageUrl,
          pantheonId: s.pantheonId,
          progress: getReadingProgress(s.id),
        }),
      ),
    },
    {
      id: "pantheons",
      title: "Pantheons",
      aspect: "landscape",
      cards: getBookmarks("pantheon").map((bookmark) => {
        const pantheon = pantheonsData.find((p) => p.id === bookmark.id);
        return {
          key: `pantheon-${bookmark.id}`,
          type: "pantheon" as const,
          id: bookmark.id,
          timestamp: bookmark.timestamp,
          href: `/pantheons/${pantheon?.slug ?? bookmark.id.replace("-pantheon", "")}`,
          title:
            pantheon?.name ??
            bookmark.id
              .replaceAll("-", " ")
              .replaceAll(/\b\w/g, (c) => c.toUpperCase()),
          description: pantheon?.description ?? null,
          image: pantheon?.imageUrl,
          pantheonId: bookmark.id,
        };
      }),
    },
    {
      id: "reading-list",
      title: "Reading list",
      aspect: "landscape",
      cards: collect(
        "source",
        sourcesData,
        (s) => s.id,
        (s) => ({
          href: `/sources/${s.id}`,
          title: s.title,
          description: s.description,
          subtitle: [s.author, s.type].filter(Boolean).join(" · "),
        }),
      ),
    },
  ];

  const count = allBookmarks.length;

  let body: ReactNode;
  if (!hydrated) {
    body = (
      <EntityGrid aria-busy="true" aria-label="Loading your bookmarks">
        <EntityCardSkeleton />
        <EntityCardSkeleton />
        <EntityCardSkeleton />
      </EntityGrid>
    );
  } else if (count === 0) {
    body = <EmptyState />;
  } else {
    body = (
      <div className="space-y-16">
        {groups
          .filter((group) => group.cards.length > 0)
          .map((group) => (
            <section key={group.id} aria-labelledby={`bookmarks-${group.id}`}>
              <SectionHeading
                id={`bookmarks-${group.id}`}
                title={group.title}
                description={`${group.cards.length} saved`}
                className="md:mb-8"
              />
              <EntityGrid aspect={group.aspect}>
                {group.cards.map((card) => (
                  <EntityCard
                    key={card.key}
                    href={card.href}
                    title={card.title}
                    image={card.image}
                    media={group.id !== "reading-list"}
                    aspect={group.aspect}
                    imagePosition={
                      group.aspect === "portrait" ? "50% 22%" : undefined
                    }
                    tradition={
                      card.pantheonId
                        ? (traditionNames[card.pantheonId] ??
                          card.pantheonId.replace(/-pantheon$/, ""))
                        : undefined
                    }
                    traditionColor={
                      card.pantheonId
                        ? getPantheonColor(card.pantheonId)
                        : undefined
                    }
                    subtitle={card.subtitle || undefined}
                    description={card.description}
                    meta={formatTimestamp(card.timestamp)}
                    action={
                      <BookmarkButton
                        type={card.type}
                        id={card.id}
                        size="md"
                        variant={
                          group.id === "reading-list" ? "default" : "light"
                        }
                      />
                    }
                  >
                    {card.progress ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between type-meta text-muted-foreground">
                          <span>Reading progress</span>
                          <span>{Math.round(card.progress)}%</span>
                        </div>
                        <Progress value={card.progress} className="h-1.5" />
                      </div>
                    ) : null}
                  </EntityCard>
                ))}
              </EntityGrid>
            </section>
          ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        mark="laurel"
        eyebrow="Your collection"
        title="Bookmarks"
        lede={
          hydrated && count > 0
            ? `${count} saved ${count === 1 ? "entry" : "entries"}, kept in this browser.`
            : "Figures, stories and sources you save, kept in this browser."
        }
      />
      <Container className="pt-8 pb-16 md:pt-10">{body}</Container>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="max-w-2xl" aria-labelledby="bookmarks-empty-title">
      <h2
        id="bookmarks-empty-title"
        className="page-section-title text-foreground"
      >
        Keep a reading list
      </h2>
      <p className="mt-4 type-lede text-foreground">
        Save a figure, story or source with its heart button. Your saved entries
        will appear here, ready to open again.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href="/stories"
          className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 font-medium text-midnight hover:bg-gold-light"
        >
          Find a story to save
        </Link>
        <Link
          href="/deities"
          className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
        >
          Browse figures
        </Link>
      </div>
      <p className="mt-8 border-t border-border pt-5 type-ui text-muted-foreground">
        Bookmarks are saved in this browser. You can export or restore them from{" "}
        <Link
          href="/progress"
          className="text-gold-text underline underline-offset-4"
        >
          Progress
        </Link>
        .
      </p>
    </section>
  );
}
