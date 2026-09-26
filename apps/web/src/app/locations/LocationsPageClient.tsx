"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { MapPin, List, Map as MapIcon, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  catalogPage,
  queryValue,
  type CatalogQuery,
} from "@/lib/catalog-query";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { PANTHEON_BG_LABEL as PANTHEON_COLORS } from "@/lib/pantheon-colors";
import { MYTHIC_ERAS, pantheonIdsForEraId } from "@/lib/mythic-eras";

// Dynamic import with SSR disabled - Leaflet requires the window object
const MapVisualization = dynamic(
  () =>
    import("@/components/locations/MapVisualization").then(
      (mod) => mod.MapVisualization,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-150 rounded-xl border border-border bg-card">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  },
);

// ─── Types ──────────────────────────────────────────────────────────────
interface Location {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl?: string;
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  timePeriodStart?: number | null;
  timePeriodEnd?: number | null;
}

interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  domain: string[];
  imageUrl?: string;
}

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
}

function getLocationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    temple: "Temple",
    city: "City",
    realm: "Realm",
    mountain: "Mountain",
    monument: "Monument",
    sacred_site: "Sacred Site",
    tomb: "Tomb",
    underworld: "Underworld",
    mythical_realm: "Mythical Realm",
  };
  return (
    labels[type] ||
    type.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function LocationsPageClient({
  initialQuery,
  locations,
  pantheons,
  deities,
  stories,
}: {
  initialQuery: CatalogQuery;
  locations: Location[];
  pantheons: Pantheon[];
  deities: Deity[];
  stories: Story[];
}) {
  const initialEra =
    MYTHIC_ERAS.find((era) => era.id === queryValue(initialQuery, "era"))?.id ??
    null;
  const [viewMode, setViewMode] = useState<"map" | "list">(
    queryValue(initialQuery, "view") === "list" ||
      (queryValue(initialQuery, "view") !== "map" &&
        catalogPage(initialQuery) > 1)
      ? "list"
      : "map",
  );
  const [searchQuery, setSearchQuery] = useState(
    queryValue(initialQuery, "q") ?? "",
  );
  const [activeEra, setActiveEra] = useState<string | null>(initialEra);
  const [activePantheons, setActivePantheons] = useState<Set<string>>(() => {
    if (initialEra) return new Set(pantheonIdsForEraId(initialEra));
    const selected = queryValue(initialQuery, "pantheons");
    return new Set(
      selected === undefined
        ? pantheons.map((p) => p.id)
        : selected.split(",").filter(Boolean),
    );
  });
  const [activeLocationTypes, setActiveLocationTypes] = useState<Set<string>>(
    () => {
      const selected = queryValue(initialQuery, "types");
      return new Set(
        selected === undefined
          ? locations.map((l) => l.locationType)
          : selected.split(",").filter(Boolean),
      );
    },
  );

  // Derived filters
  const allLocationTypes = useMemo(
    () =>
      Array.from(new Set(locations.map((l) => l.locationType))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [locations],
  );

  const pantheonsWithLocations = useMemo(() => {
    const ids = new Set(locations.map((loc) => loc.pantheonId));
    return pantheons.filter((p) => ids.has(p.id));
  }, [locations, pantheons]);

  // Filtering Logic
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesPantheon = activePantheons.has(loc.pantheonId);
      const matchesType = activeLocationTypes.has(loc.locationType);
      const matchesSearch =
        searchQuery === "" ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPantheon && matchesType && matchesSearch;
    });
  }, [locations, activePantheons, activeLocationTypes, searchQuery]);
  const locationPagination = usePagination(
    filteredLocations,
    24,
    catalogPage(initialQuery),
  );
  const { setPage } = locationPagination;

  const getPageHref = (page: number, view = "list"): string => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeEra) params.set("era", activeEra);
    else if (!pantheonsWithLocations.every((p) => activePantheons.has(p.id)))
      params.set("pantheons", [...activePantheons].sort().join(","));
    if (!allLocationTypes.every((type) => activeLocationTypes.has(type)))
      params.set("types", [...activeLocationTypes].sort().join(","));
    if (page > 1) params.set("page", String(page));
    if (view === "list" || page > 1) params.set("view", view);
    return `/locations${params.size ? `?${params}` : ""}`;
  };
  const currentHref = getPageHref(locationPagination.page, viewMode);
  useEffect(() => {
    window.history.replaceState(null, "", currentHref);
  }, [currentHref]);

  const selectEra = (eraId: string | null) => {
    setPage(1);
    setActiveEra(eraId);
    setActivePantheons(
      eraId
        ? new Set(pantheonIdsForEraId(eraId))
        : new Set(pantheonsWithLocations.map((p) => p.id)),
    );
  };

  const togglePantheon = (id: string) => {
    setPage(1);
    if (activeEra) {
      setActiveEra(null);
    }
    setActivePantheons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleLocationType = (type: string) => {
    setPage(1);
    setActiveLocationTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const toggleAll = (type: "pantheons" | "types") => {
    setPage(1);
    if (type === "pantheons") {
      if (activeEra) {
        setActiveEra(null);
      }
      setActivePantheons((prev) =>
        prev.size === pantheonsWithLocations.length
          ? new Set()
          : new Set(pantheonsWithLocations.map((p) => p.id)),
      );
    } else {
      setActiveLocationTypes((prev) =>
        prev.size === allLocationTypes.length
          ? new Set()
          : new Set(allLocationTypes),
      );
    }
  };

  const locationStats = useMemo(() => {
    // Stats based on FILTERED locations
    const total = filteredLocations.length;
    const mappable = filteredLocations.filter(
      (l) => l.latitude !== null && l.longitude !== null,
    ).length;
    const mythical = total - mappable;
    // Count of types present in current selection
    const types = new Set(filteredLocations.map((l) => l.locationType)).size;
    return { total, mappable, mythical, types };
  }, [filteredLocations]);

  return (
    <div className="min-h-screen">
      <PageHero
        mark="peak"
        tagline="Sacred Geography"
        title="Locations"
        description="Browse temples, realms, and sacred sites by pantheon, place type, or historical era"
        backgroundImage="/hero-columns.webp"
        backgroundAlt="Classical temple columns and ancient sacred landscape"
        minHeight="min-h-[45vh]"
      />

      {/* Content Section */}
      <div className="page-shell bg-mythic">
        {/* Controls Bar */}
        <div className="relative z-30 mb-8 bg-background/95 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm transition-all">
          <div className="flex flex-col gap-6">
            {/* Top Row: Breadcrumbs + Search + View Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border/50 pb-4">
              <Breadcrumbs />

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <label htmlFor="locations-search" className="sr-only">
                    Search locations
                  </label>
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="locations-search"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-8 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0">
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="gap-2 h-8"
                    aria-label="Show map view"
                    aria-pressed={viewMode === "map"}
                  >
                    <MapIcon className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Map</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="gap-2 h-8"
                    aria-label="Show list view"
                    aria-pressed={viewMode === "list"}
                  >
                    <List className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">List</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Era × place */}
            <div className="space-y-2 border-b border-border/40 pb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Era
                </span>
                <button
                  type="button"
                  onClick={() => selectEra(null)}
                  className="text-xs text-gold hover:text-gold/80 font-medium"
                >
                  {activeEra ? "Clear era" : "All eras"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MYTHIC_ERAS.map((era) => {
                  const isActive = activeEra === era.id;
                  return (
                    <button
                      key={era.id}
                      type="button"
                      title={era.blurb}
                      onClick={() => selectEra(isActive ? null : era.id)}
                      className={`text-xs px-3 py-1.5 border transition-all ${
                        isActive
                          ? "border-gold/50 bg-gold/15 text-gold font-medium"
                          : "border-border text-muted-foreground bg-muted/30 hover:bg-muted"
                      }`}
                    >
                      {era.label}
                    </button>
                  );
                })}
              </div>
              {activeEra && (
                <p className="text-xs text-muted-foreground">
                  {MYTHIC_ERAS.find((e) => e.id === activeEra)?.blurb} — the
                  collection filters below follow this selection. Shareable as{" "}
                  <code className="text-gold/90">?era={activeEra}</code>
                </p>
              )}
            </div>

            {/* Filters Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pantheon Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pantheons
                  </span>
                  <button
                    onClick={() => toggleAll("pantheons")}
                    className="text-xs text-gold hover:text-gold/80 font-medium"
                  >
                    {activePantheons.size === pantheonsWithLocations.length
                      ? "Clear All"
                      : "Select All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                  {pantheonsWithLocations.map((p) => {
                    const isActive = activePantheons.has(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePantheon(p.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isActive
                            ? "border-gold bg-gold text-midnight"
                            : "border-border text-muted-foreground bg-muted/30 hover:bg-muted"
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Type Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Types
                  </span>
                  <button
                    onClick={() => toggleAll("types")}
                    className="text-xs text-gold hover:text-gold/80 font-medium"
                  >
                    {activeLocationTypes.size === allLocationTypes.length
                      ? "Clear All"
                      : "Select All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                  {allLocationTypes.map((type) => {
                    const isActive = activeLocationTypes.has(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleLocationType(type)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isActive
                            ? "bg-gold/20 border-gold/30 text-gold-light font-medium"
                            : "border-border text-muted-foreground bg-muted/30 hover:bg-muted"
                        }`}
                      >
                        {getLocationTypeLabel(type)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Locations Shown", value: locationStats.total },
            { label: "On Map", value: locationStats.mappable },
            { label: "Mythical Realms", value: locationStats.mythical },
            { label: "Types Shown", value: locationStats.types },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-4 py-3 text-center"
            >
              <div className="text-2xl font-serif font-semibold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Controls (Toggle) - Only visible on small screens */}
        <div className="md:hidden flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0 mb-4 mx-auto w-fit">
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="gap-2 h-8"
          >
            <MapIcon className="h-4 w-4" /> Map
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2 h-8"
          >
            <List className="h-4 w-4" /> List
          </Button>
        </div>

        {/* Split View Content */}
        <div className="flex flex-col-reverse lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-150">
          {/* List Side (Left) - Always visible on desktop, toggled on mobile */}
          <div
            className={`lg:w-1/3 flex flex-col h-full bg-card/30 rounded-xl border border-border overflow-hidden ${viewMode === "map" ? "hidden lg:flex" : "flex"}`}
          >
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
              <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
                <List className="h-4 w-4 text-gold" /> Locations (
                {filteredLocations.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {filteredLocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
                  <MapPin className="h-10 w-10 text-muted-foreground/50" />
                  <p className="font-serif text-lg text-foreground">
                    No locations match these filters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try another pantheon, type, or clear filters to see the full
                    map again.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage(1);
                      setActiveEra(null);
                      setSearchQuery("");
                      setActivePantheons(
                        new Set(pantheonsWithLocations.map((p) => p.id)),
                      );
                      setActiveLocationTypes(new Set(allLocationTypes));
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                locationPagination.paginatedData.map((location) => {
                  const pantheon = pantheons.find(
                    (p) => p.id === location.pantheonId,
                  );
                  const colors = PANTHEON_COLORS[location.pantheonId] || {
                    bg: "#6b7280",
                    label: location.pantheonId,
                  };
                  const hasCords =
                    location.latitude !== null && location.longitude !== null;

                  return (
                    <Card
                      key={location.id}
                      asArticle
                      className={`group hover:border-gold/50 transition-all duration-300 ${hasCords ? "" : "opacity-75 grayscale-[0.5]"}`}
                    >
                      <div className="h-1" style={{ background: colors.bg }} />
                      <div className="flex p-4 pb-2 gap-3 items-start">
                        {location.imageUrl && (
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 shadow-xs">
                            <Image
                              src={location.imageUrl}
                              alt={location.name}
                              fill
                              sizes="56px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                              {location.name}
                            </h3>
                            {hasCords ? (
                              <button
                                type="button"
                                className="mt-0.5 shrink-0 rounded-sm text-muted-foreground hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                                aria-label={`Show ${location.name} on the map`}
                                onClick={() => {
                                  globalThis.dispatchEvent(
                                    new CustomEvent("flyToLocation", {
                                      detail: {
                                        lat: location.latitude,
                                        lng: location.longitude,
                                      },
                                    }),
                                  );
                                  if (globalThis.innerWidth < 1024)
                                    setViewMode("map");
                                }}
                              >
                                <MapPin
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                              </button>
                            ) : (
                              <span className="text-[10px] border border-border px-1 rounded shrink-0">
                                Myth
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground uppercase mt-0.5">
                            {pantheon?.name}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-4 pt-2">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {location.description}
                        </p>
                        <Link
                          href={`/locations/${location.id}`}
                          className="inline-flex items-center gap-1 text-xs text-gold-text hover:text-gold-text mt-2 transition-colors"
                          aria-label={`Explore ${location.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explore {location.name}{" "}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            <div className="border-t border-border bg-card/50 p-4">
              <PaginationControls
                getPageHref={getPageHref}
                page={locationPagination.page}
                totalPages={locationPagination.totalPages}
                hasNextPage={locationPagination.hasNextPage}
                hasPreviousPage={locationPagination.hasPreviousPage}
                onPageChange={locationPagination.setPage}
                onNextPage={locationPagination.nextPage}
                onPreviousPage={locationPagination.previousPage}
                onFirstPage={locationPagination.firstPage}
                onLastPage={locationPagination.lastPage}
                startIndex={locationPagination.startIndex}
                endIndex={locationPagination.endIndex}
                totalItems={locationPagination.totalItems}
                showItemCount
              />
            </div>
          </div>

          {/* Map Side (Right) - Always visible on desktop, toggled on mobile */}
          <div
            className={`flex-1 rounded-xl overflow-hidden border border-border shadow-lg relative ${viewMode === "list" ? "hidden lg:block" : "block"}`}
          >
            <MapVisualization
              locations={filteredLocations}
              pantheons={pantheons}
              deities={deities}
              stories={stories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
