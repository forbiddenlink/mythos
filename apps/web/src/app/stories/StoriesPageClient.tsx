"use client";

import { useEffect, useMemo, useState } from "react";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import {
  EmptyResults,
  FilterToolbar,
  ToolbarSearch,
} from "@/components/entities/FilterToolbar";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading } from "@/components/layout/section";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import {
  InteractiveStoryCard,
  type InteractiveStoryListItem,
} from "@/components/stories/InteractiveStoryCard";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { getPantheonColor } from "@/lib/pantheon-colors";

/** Story card and filter fields (no narrative text). */
export interface StoryListItem {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string | null;
  themes: string[];
  imageUrl: string | null;
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function StoriesPageClient({
  stories,
  interactiveStories,
  traditionCount,
  traditionNames,
}: Readonly<{
  stories: StoryListItem[];
  interactiveStories: InteractiveStoryListItem[];
  /** Traditions in the atlas (collections excluded), counted on the server. */
  traditionCount: number;
  /** Pantheon id → short name ("Greek"), computed on the server. */
  traditionNames: Record<string, string>;
}>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(new Set(stories.map((s) => s.themes[0] ?? "other"))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [stories],
  );
  const themes = useMemo(
    () =>
      Array.from(new Set(stories.flatMap((s) => s.themes))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [stories],
  );

  const displayStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return stories.filter(
      (s) =>
        (categoryFilter === "all" ||
          (s.themes[0] ?? "other") === categoryFilter) &&
        (themeFilter === "all" || s.themes.includes(themeFilter)) &&
        (!query ||
          s.title.toLowerCase().includes(query) ||
          s.summary?.toLowerCase().includes(query)),
    );
  }, [stories, searchQuery, categoryFilter, themeFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    themeFilter !== "all";
  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setThemeFilter("all");
  };

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Mythological Stories"
        description={`Epic tales and legends from ancient civilizations across ${traditionCount} traditions`}
        url="/stories"
        numberOfItems={stories.length}
      />
      <PageHero
        mark="scroll"
        tagline="Epic Tales"
        title="Mythological Stories"
        description={`Creation myths, descents to the underworld and hero quests from ${traditionCount} traditions.`}
        backgroundImage="/stories-hero.jpg"
        backgroundAlt="Ancient storytellers and heroes gathered in a mythic landscape"
        colorScheme="gold"
      />

      {interactiveStories.length > 0 && (
        <Container
          as="section"
          id="interactive"
          aria-labelledby="interactive-heading"
          className="scroll-mt-24 pt-8 pb-4 md:pt-10"
        >
          <SectionHeading
            id="interactive-heading"
            eyebrow="Choose your path"
            title="Interactive stories"
            description="Branching myths where your choices decide the ending."
            action={{ href: "/stories/interactive", label: "All interactive" }}
            className="md:mb-8"
          />
          <EntityGrid>
            {interactiveStories.slice(0, 3).map((story, index) => (
              <InteractiveStoryCard
                key={story.id}
                story={story}
                priority={index < 3}
              />
            ))}
          </EntityGrid>
        </Container>
      )}

      <Container
        as="section"
        aria-labelledby="epic-tales-heading"
        className="pt-10 pb-12 md:pt-14"
      >
        <SectionHeading
          id="epic-tales-heading"
          eyebrow="The canon"
          title="Epic tales"
          description="The classic narratives, retold from their sources."
          className="md:mb-8"
        />
        <FilterToolbar
          label="Filter stories"
          count={
            hasActiveFilters
              ? `${displayStories.length} of ${stories.length} stories`
              : `${stories.length} stories`
          }
        >
          <ToolbarSearch
            id="story-search"
            label="Search stories"
            placeholder="Search stories…"
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {capitalize(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={themeFilter} onValueChange={setThemeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All themes</SelectItem>
              {themes.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {capitalize(theme)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters ? (
            <Button variant="link" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          ) : null}
        </FilterToolbar>

        <div className="pt-8">
          {displayStories.length > 0 ? (
            <PaginatedStoryGrid
              stories={displayStories}
              traditionNames={traditionNames}
            />
          ) : (
            <EmptyResults
              title={hasActiveFilters ? "No stories found" : "No stories yet"}
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                ) : null
              }
            >
              {hasActiveFilters
                ? "Try another title, category or theme."
                : "Check back later for mythological tales and legends."}
            </EmptyResults>
          )}
        </div>
      </Container>

      <AboutThisPage title="About the story index">
        <p>
          The story index is organized to help you move from foundational myths
          into more specialized tales. Start with creation stories, succession
          struggles, and culture-defining journeys, then use the filters to
          narrow by theme or tradition. Interactive stories are collected
          separately so returning readers can switch between reference reading
          and choice-driven exploration without losing the main narrative canon.
        </p>
      </AboutThisPage>
    </div>
  );
}

function PaginatedStoryGrid({
  stories,
  traditionNames,
}: Readonly<{
  stories: StoryListItem[];
  traditionNames: Record<string, string>;
}>) {
  const pagination = usePagination(stories, 24);
  const { firstPage } = pagination;

  // Reset to first page when filtered data changes
  useEffect(() => {
    firstPage();
  }, [stories.length, firstPage]);

  return (
    <>
      <EntityGrid>
        {pagination.paginatedData.map((story) => (
          <EntityCard
            key={story.id}
            href={`/stories/${story.slug}`}
            title={story.title}
            image={story.imageUrl}
            aspect="landscape"
            tradition={
              traditionNames[story.pantheonId] ??
              story.pantheonId.replace(/-pantheon$/, "")
            }
            traditionColor={getPantheonColor(story.pantheonId)}
            description={story.summary}
            meta={
              story.themes.length > 0
                ? story.themes.slice(0, 3).map(capitalize).join(" · ")
                : undefined
            }
            action={
              <BookmarkButton
                type="story"
                id={story.id}
                size="md"
                variant="light"
              />
            }
          />
        ))}
      </EntityGrid>

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
          className="mt-12"
        />
      )}
    </>
  );
}
