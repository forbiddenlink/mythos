"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, Shield, X } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { getPantheonColor } from "@/lib/pantheon-colors";
import heroesData from "@/data/heroes.json";
import pantheonsData from "@/data/pantheons.json";

import {
  catalogPage,
  queryValue,
  type CatalogQuery,
} from "@/lib/catalog-query";

interface Hero {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  alternateNames?: string[];
  imageUrl?: string | null;
  keyDeeds?: string[];
}

interface Pantheon {
  id: string;
  name: string;
}

function formatPantheonLabel(pantheonId: string, pantheons: Pantheon[]) {
  return (
    pantheons.find((p) => p.id === pantheonId)?.name ??
    pantheonId.replace(/-pantheon$/, "")
  );
}

export function HeroesPageClient({
  initialQuery,
}: {
  initialQuery: CatalogQuery;
}) {
  const allHeroes = heroesData as Hero[];
  const pantheons = pantheonsData as Pantheon[];
  const [searchQuery, setSearchQuery] = useState(
    queryValue(initialQuery, "q") ?? "",
  );
  const [activePantheon, setActivePantheon] = useState<string | null>(
    queryValue(initialQuery, "pantheon") ?? null,
  );

  const heroPantheonIds = useMemo(
    () => Array.from(new Set(allHeroes.map((h) => h.pantheonId))),
    [allHeroes],
  );

  const filteredHeroes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allHeroes.filter((h) => {
      const matchesPantheon =
        !activePantheon || h.pantheonId === activePantheon;
      if (!matchesPantheon) return false;

      if (!query) return true;
      const matchesName = h.name.toLowerCase().includes(query);
      const matchesDesc = h.description.toLowerCase().includes(query);
      const matchesAlt = h.alternateNames?.some((alt) =>
        alt.toLowerCase().includes(query),
      );
      return matchesName || matchesDesc || matchesAlt;
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

  return (
    <div className="min-h-screen bg-mythic">
      <PageHero
        mark="blade"
        tagline="Mortal Champions"
        title="Heroes"
        description="Warriors, wanderers, and doomed champions from the world's great epics"
        backgroundImage="/hero-columns.webp"
        backgroundAlt="Ancient columns evoking the age of legendary heroes"
        colorScheme="gold"
      />

      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Breadcrumbs />

        {/* Editorial Introduction */}
        <section className="mt-6 rounded-2xl border border-gold/20 bg-card/70 p-6 md:p-8 backdrop-blur-xs shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
            <h2 className="font-serif text-2xl text-foreground">
              Mortal &amp; Demi-God Champions
            </h2>
          </div>
          <p className="max-w-4xl text-sm md:text-base leading-7 text-muted-foreground">
            Unlike immortal deities, heroes live and die in their sagas. Born of
            divine blood or mortal daring, their destinies unfold not on high
            Olympus, but in the trenches of Troy, the treacherous currents of
            the wine-dark sea, or the bloody fields of Kurukshetra. Each
            champion is grounded in primary ancient sources, complete with
            family lineage, fateful choices, and cross-tradition parallels.
          </p>
        </section>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search heroes by name, title, or myth..."
                value={searchQuery}
                aria-label="Search heroes"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  pagination.firstPage();
                }}
                className="pl-10 pr-10 border-gold/20 bg-card/60 focus-visible:ring-gold/40 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    pagination.firstPage();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="text-xs text-muted-foreground shrink-0 self-center sm:self-auto">
              Showing{" "}
              <span className="font-semibold text-gold">
                {filteredHeroes.length}
              </span>{" "}
              of {allHeroes.length} heroes
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant={activePantheon === null ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActivePantheon(null);
                pagination.firstPage();
              }}
              className="text-xs"
            >
              All Traditions ({allHeroes.length})
            </Button>
            {heroPantheonIds.map((pantheonId) => {
              const count = allHeroes.filter(
                (h) => h.pantheonId === pantheonId,
              ).length;
              const color = getPantheonColor(pantheonId);
              return (
                <Button
                  key={pantheonId}
                  variant={
                    activePantheon === pantheonId ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setActivePantheon(pantheonId);
                    pagination.firstPage();
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  {formatPantheonLabel(pantheonId, pantheons)} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {filteredHeroes.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-gold/20 mb-6 shadow-sm">
              <Sparkles className="h-10 w-10 text-gold/60" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2 text-foreground">
              No heroes found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              No hero matched your query &ldquo;{searchQuery}&rdquo;. Try
              clearing your search or selecting another tradition.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-6 border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => {
                pagination.firstPage();
                setSearchQuery("");
                setActivePantheon(null);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pagination.paginatedData.map((hero) => {
                const color = getPantheonColor(hero.pantheonId);
                return (
                  <Card
                    key={hero.id}
                    asArticle
                    className="parchment-card group relative h-full bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 flex flex-col"
                  >
                    <Link
                      href={`/heroes/${hero.slug}`}
                      className="flex flex-col h-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                      aria-label={`View ${hero.name}`}
                    >
                      {/* Visual Plate Header */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-midnight shrink-0 border-b border-gold/20">
                        {hero.imageUrl ? (
                          <Image
                            src={hero.imageUrl}
                            alt={`Plate portrait of ${hero.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-midnight/90">
                            <span className="font-serif text-6xl text-gold/40">
                              {hero.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

                        {/* Top Pantheon Pill */}
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-midnight/80 backdrop-blur-xs border border-white/10 text-parchment shadow-sm"
                            style={{ borderColor: `${color}66` }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                              aria-hidden
                            />
                            {formatPantheonLabel(hero.pantheonId, pantheons)}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <CardHeader className="pt-4 pb-2">
                        <CardTitle className="font-serif text-xl text-foreground group-hover:text-gold transition-colors duration-300">
                          {hero.name}
                        </CardTitle>
                        {hero.alternateNames &&
                          hero.alternateNames.length > 0 && (
                            <p className="text-xs text-muted-foreground/80 italic">
                              {hero.alternateNames.join(", ")}
                            </p>
                          )}
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col justify-between pt-1 pb-4">
                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                          {hero.description}
                        </p>

                        {hero.keyDeeds && hero.keyDeeds.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground/80">
                            <span className="flex items-center gap-1">
                              <Shield className="h-3.5 w-3.5 text-gold/70" />
                              {hero.keyDeeds.length} key deeds recorded
                            </span>
                            <span className="text-gold group-hover:translate-x-0.5 transition-transform">
                              Read epic &rarr;
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>

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
      </div>
    </div>
  );
}
