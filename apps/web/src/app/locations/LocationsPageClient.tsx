"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon, MapPin } from "lucide-react";
import {
  EntityBadge,
  EntityCard,
  EntityGrid,
} from "@/components/entities/EntityCard";
import {
  ChipRow,
  EmptyResults,
  FilterChip,
  FilterToolbar,
  ToolbarSearch,
  ViewToggle,
} from "@/components/entities/FilterToolbar";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
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
import {
  catalogPage,
  queryValue,
  type CatalogQuery,
} from "@/lib/catalog-query";
import { MYTHIC_ERAS, pantheonIdsForEraId } from "@/lib/mythic-eras";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { shortTraditionName } from "@/lib/tradition-name";

// Dynamic import with SSR disabled - Leaflet requires the window object
const MapVisualization = dynamic(
  () =>
    import("@/components/locations/MapVisualization").then(
      (mod) => mod.MapVisualization,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-100 flex-col items-center justify-center gap-3 bg-muted/40">
        <MapPin className="size-7 text-gold-text" aria-hidden="true" />
        <p className="type-ui text-muted-foreground">Drawing the map…</p>
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
    sacred_site: "Sacred site",
    tomb: "Tomb",
    underworld: "Underworld",
    mythical_realm: "Mythical realm",
  };
  return (
    labels[type] ||
    type.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
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
    return pantheons
      .filter((p) => ids.has(p.id))
      .sort((a, b) =>
        shortTraditionName(a.name).localeCompare(shortTraditionName(b.name)),
      );
  }, [locations, pantheons]);
  const pantheonName = useMemo(() => {
    const names = new Map(
      pantheons.map((p) => [p.id, shortTraditionName(p.name)]),
    );
    return (id: string) => names.get(id) ?? id.replace(/-pantheon$/, "");
  }, [pantheons]);

  // Filtering Logic
  const filteredLocations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        activePantheons.has(loc.pantheonId) &&
        activeLocationTypes.has(loc.locationType) &&
        (query === "" ||
          loc.name.toLowerCase().includes(query) ||
          loc.description.toLowerCase().includes(query)),
    );
  }, [locations, activePantheons, activeLocationTypes, searchQuery]);
  const locationPagination = usePagination(
    filteredLocations,
    24,
    catalogPage(initialQuery),
  );
  const { setPage } = locationPagination;

  const allPantheonsActive = pantheonsWithLocations.every((p) =>
    activePantheons.has(p.id),
  );
  const allTypesActive = allLocationTypes.every((type) =>
    activeLocationTypes.has(type),
  );

  const getPageHref = (page: number, view = "list"): string => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeEra) params.set("era", activeEra);
    else if (!allPantheonsActive)
      params.set("pantheons", [...activePantheons].sort().join(","));
    if (!allTypesActive)
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

  const selectPantheon = (id: string) => {
    setPage(1);
    setActiveEra(null);
    setActivePantheons(
      id === "all"
        ? new Set(pantheonsWithLocations.map((p) => p.id))
        : new Set([id]),
    );
  };

  /** With every type shown, a chip narrows to that type; then it toggles. */
  const toggleLocationType = (type: string) => {
    setPage(1);
    setActiveLocationTypes((prev) => {
      if (allTypesActive) return new Set([type]);
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next.size === 0 ? new Set(allLocationTypes) : next;
    });
  };

  const clearFilters = () => {
    setPage(1);
    setActiveEra(null);
    setSearchQuery("");
    setActivePantheons(new Set(pantheonsWithLocations.map((p) => p.id)));
    setActiveLocationTypes(new Set(allLocationTypes));
  };

  const mappable = filteredLocations.filter(
    (l) => l.latitude !== null && l.longitude !== null,
  ).length;

  const pantheonSelectValue = activeEra
    ? "custom"
    : allPantheonsActive
      ? "all"
      : activePantheons.size === 1
        ? [...activePantheons][0]
        : "custom";

  const showOnMap = (location: Location) => {
    globalThis.dispatchEvent(
      new CustomEvent("flyToLocation", {
        detail: { lat: location.latitude, lng: location.longitude },
      }),
    );
    setViewMode("map");
  };

  const pager =
    locationPagination.totalPages > 1 ? (
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
        showItemCount={viewMode === "list"}
      />
    ) : null;

  const empty = (
    <EmptyResults
      title="No places match these filters"
      action={
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    >
      Try another tradition or type, or clear the filters to see the full map.
    </EmptyResults>
  );

  const card = (location: Location, list: boolean, index: number) => {
    const hasCoords = location.latitude !== null && location.longitude !== null;
    return (
      <EntityCard
        key={location.id}
        variant={list ? "list" : "grid"}
        href={`/locations/${location.id}`}
        linkLabel={`Explore ${location.name}`}
        title={location.name}
        image={location.imageUrl}
        imageAlt={location.name}
        aspect="landscape"
        priority={!list && index < 3}
        tradition={pantheonName(location.pantheonId)}
        traditionColor={getPantheonColor(location.pantheonId)}
        subtitle={getLocationTypeLabel(location.locationType)}
        description={location.description}
        badges={hasCoords ? undefined : <EntityBadge>Mythic realm</EntityBadge>}
        action={
          hasCoords ? (
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-current hover:text-gold-light focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={`Show ${location.name} on the map`}
              onClick={() => showOnMap(location)}
            >
              <MapPin
                className={list ? "size-4 text-muted-foreground" : "size-4"}
                aria-hidden="true"
              />
            </button>
          ) : undefined
        }
      />
    );
  };

  return (
    <div className="min-h-screen">
      <PageHero
        mark="peak"
        tagline="Sacred Geography"
        title="Locations"
        description="Temples, realms and sacred sites, on the map and by tradition, type or era."
        backgroundImage="/hero-columns.webp"
        backgroundAlt="Classical temple columns and ancient sacred landscape"
      />

      <Container className="pt-6 pb-4 md:pt-8">
        <FilterToolbar
          label="Filter places"
          count={`${filteredLocations.length} places · ${mappable} on the map`}
          view={
            <ViewToggle
              label="Places view"
              value={viewMode}
              onChange={setViewMode}
              options={[
                {
                  value: "map",
                  label: "Map",
                  icon: MapIcon,
                  ariaLabel: "Show map view",
                },
                {
                  value: "list",
                  label: "List",
                  icon: List,
                  ariaLabel: "Show list view",
                },
              ]}
            />
          }
          chips={
            <ChipRow label="Type">
              <FilterChip
                active={allTypesActive}
                onClick={() => {
                  setPage(1);
                  setActiveLocationTypes(new Set(allLocationTypes));
                }}
              >
                All
              </FilterChip>
              {allLocationTypes.map((type) => (
                <FilterChip
                  key={type}
                  active={!allTypesActive && activeLocationTypes.has(type)}
                  onClick={() => toggleLocationType(type)}
                  count={
                    locations.filter((l) => l.locationType === type).length
                  }
                >
                  {getLocationTypeLabel(type)}
                </FilterChip>
              ))}
            </ChipRow>
          }
        >
          <ToolbarSearch
            id="locations-search"
            label="Search locations"
            placeholder="Search places…"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
          />
          <Select
            value={activeEra ?? "all"}
            onValueChange={(value) => selectEra(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Era" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All eras</SelectItem>
              {MYTHIC_ERAS.map((era) => (
                <SelectItem key={era.id} value={era.id}>
                  {era.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={pantheonSelectValue} onValueChange={selectPantheon}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tradition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All traditions</SelectItem>
              {pantheonSelectValue === "custom" ? (
                <SelectItem value="custom">
                  {activeEra ? "Traditions of this era" : "Several traditions"}
                </SelectItem>
              ) : null}
              {pantheonsWithLocations.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {pantheonName(p.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterToolbar>
        {activeEra ? (
          <p className="mt-3 type-meta text-muted-foreground">
            {MYTHIC_ERAS.find((e) => e.id === activeEra)?.blurb}
          </p>
        ) : null}
      </Container>

      <Container className="pt-6 pb-12">
        {viewMode === "list" ? (
          <div>
            {filteredLocations.length === 0 ? (
              empty
            ) : (
              <>
                <EntityGrid>
                  {locationPagination.paginatedData.map((location, index) =>
                    card(location, false, index),
                  )}
                </EntityGrid>
                {pager ? <div className="mt-12">{pager}</div> : null}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-6 lg:h-[calc(100vh-180px)] lg:min-h-150 lg:flex-row">
            <div className="hidden min-h-0 flex-col lg:flex lg:w-[26rem] lg:shrink-0">
              <h2 className="sr-only">Places in the current view</h2>
              <div className="min-h-0 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {filteredLocations.length === 0 ? (
                  empty
                ) : (
                  <EntityGrid variant="list">
                    {locationPagination.paginatedData.map((location, index) =>
                      card(location, true, index),
                    )}
                  </EntityGrid>
                )}
              </div>
              {pager ? (
                <div className="border-t border-border pt-3">{pager}</div>
              ) : null}
            </div>
            <div className="relative h-[70vh] min-h-100 flex-1 overflow-hidden rounded-lg ring-1 ring-border lg:h-auto">
              <MapVisualization
                locations={filteredLocations}
                pantheons={pantheons}
                deities={deities}
                stories={stories}
                chrome="minimal"
              />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
