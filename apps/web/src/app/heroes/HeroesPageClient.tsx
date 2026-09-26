"use client";

import { useEffect, useMemo, useState } from "react";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import {
  ChipRow,
  EmptyResults,
  FilterChip,
  FilterToolbar,
  ToolbarSearch,
} from "@/components/entities/FilterToolbar";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { getPantheonColor } from "@/lib/pantheon-colors";
import {
  catalogPage,
  queryValue,
  type CatalogQuery,
} from "@/lib/catalog-query";

/** Card and filter fields for one hero (no biography or sources). */
export interface HeroListItem {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  alternateNames: string[];
  imageUrl: string | null;
  keyDeedCount: number;
}

export function HeroesPageClient({
  initialQuery,
  allHeroes,
  traditionNames,
}: {
  initialQuery: CatalogQuery;
  allHeroes: HeroListItem[];
  /** Pantheon id → short name ("Greek"), computed on the server. */
  traditionNames: Record<string, string>;
}) {
  const [searchQuery, setSearchQuery] = useState(
    queryValue(initialQuery, "q") ?? "",
  );
  const [activePantheon, setActivePantheon] = useState<string | null>(
    queryValue(initialQuery, "pantheon") ?? null,
  );
  const traditionName = (id: string) =>
    traditionNames[id] ?? id.replace(/-pantheon$/, "");

  const heroPantheonIds = useMemo(
    () => Array.from(new Set(allHeroes.map((h) => h.pantheonId))),
    [allHeroes],
  );

  const filteredHeroes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allHeroes.filter((h) => {
      if (activePantheon && h.pantheonId !== activePantheon) return false;
      if (!query) return true;
      return (
        h.name.toLowerCase().includes(query) ||
        h.description.toLowerCase().includes(query) ||
        h.alternateNames.some((alt) => alt.toLowerCase().includes(query))
      );
    });
  }, [allHeroes, activePantheon, searchQuery]);

  const pagination = usePagination(
    filteredHeroes,
    12,
    catalogPage(initialQuery),
  );

  const getPageHref = (page: number): string => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activePantheon) params.set("pantheon", activePantheon);
    if (page > 1) params.set("page", String(page));
    return `/heroes${params.size ? `?${params}` : ""}`;
  };
  const currentHref = getPageHref(pagination.page);
  useEffect(() => {
    window.history.replaceState(null, "", currentHref);
  }, [currentHref]);

  const choosePantheon = (id: string | null) => {
    setActivePantheon(id);
    pagination.firstPage();
  };

  return (
    <div className="min-h-screen">
      <PageHero
        mark="blade"
        tagline="Mortal Champions"
        title="Heroes"
        description="Warriors, wanderers, and doomed champions from the world's great epics."
        backgroundImage="/hero-columns.webp"
        backgroundAlt="Ancient columns evoking the age of legendary heroes"
        colorScheme="gold"
      />

      <Container className="pt-6 pb-4 md:pt-8">
        <FilterToolbar
          label="Filter heroes"
          count={
            filteredHeroes.length === allHeroes.length
              ? `${allHeroes.length} heroes`
              : `${filteredHeroes.length} of ${allHeroes.length} heroes`
          }
          chips={
            <ChipRow label="Tradition">
              <FilterChip
                active={activePantheon === null}
                onClick={() => choosePantheon(null)}
                count={allHeroes.length}
              >
                All
              </FilterChip>
              {heroPantheonIds.map((pantheonId) => (
                <FilterChip
                  key={pantheonId}
                  active={activePantheon === pantheonId}
                  onClick={() => choosePantheon(pantheonId)}
                  color={getPantheonColor(pantheonId)}
                  count={
                    allHeroes.filter((h) => h.pantheonId === pantheonId).length
                  }
                >
                  {traditionName(pantheonId)}
                </FilterChip>
              ))}
            </ChipRow>
          }
        >
          <ToolbarSearch
            id="hero-search"
            label="Search heroes"
            placeholder="Search by name, title or myth…"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              pagination.firstPage();
            }}
          />
        </FilterToolbar>
      </Container>

      <Container className="pt-6 pb-12">
        {filteredHeroes.length === 0 ? (
          <EmptyResults
            title="No heroes found"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pagination.firstPage();
                  setSearchQuery("");
                  setActivePantheon(null);
                }}
              >
                Reset filters
              </Button>
            }
          >
            No hero matched &ldquo;{searchQuery}&rdquo;. Try another name or
            tradition.
          </EmptyResults>
        ) : (
          <>
            <EntityGrid aspect="portrait">
              {pagination.paginatedData.map((hero, index) => (
                <EntityCard
                  key={hero.id}
                  href={`/heroes/${hero.slug}`}
                  linkLabel={`View ${hero.name}`}
                  title={hero.name}
                  image={hero.imageUrl}
                  imagePosition="50% 20%"
                  aspect="portrait"
                  priority={index < 4}
                  tradition={traditionName(hero.pantheonId)}
                  traditionColor={getPantheonColor(hero.pantheonId)}
                  subtitle={
                    hero.alternateNames.length
                      ? hero.alternateNames.slice(0, 2).join(" · ")
                      : undefined
                  }
                  description={hero.description}
                  meta={
                    hero.keyDeedCount > 0
                      ? `${hero.keyDeedCount} key deeds`
                      : undefined
                  }
                  action={
                    <BookmarkButton
                      type="hero"
                      id={hero.id}
                      size="md"
                      variant="light"
                    />
                  }
                />
              ))}
            </EntityGrid>

            {pagination.totalPages > 1 && (
              <PaginationControls
                getPageHref={getPageHref}
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
        )}
      </Container>

      <AboutThisPage title="About the heroes">
        <p>
          Unlike immortal deities, heroes live and die in their sagas. Born of
          divine blood or mortal daring, their destinies unfold not on high
          Olympus, but in the trenches of Troy, the treacherous currents of the
          wine-dark sea, or the bloody fields of Kurukshetra. Each champion is
          grounded in primary ancient sources, complete with family lineage,
          fateful choices, and cross-tradition parallels.
        </p>
      </AboutThisPage>
    </div>
  );
}
