"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, LayoutGrid, Table } from "lucide-react";
import { DeitiesTable } from "@/components/deities/DeitiesTable";
import {
  EntityBadge,
  EntityCard,
  EntityGrid,
} from "@/components/entities/EntityCard";
import {
  EmptyResults,
  FilterToolbar,
  ToolbarSearch,
  ViewToggle,
} from "@/components/entities/FilterToolbar";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
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
import type { DeityListItem } from "@/lib/data/types";
import { getPantheonColor } from "@/lib/pantheon-colors";

type Deity = DeityListItem;

const RECOMMENDED_DEITIES = [
  {
    href: "/deities/demeter",
    label: "Demeter",
    note: "harvest, sacred law, and the seasonal cycle",
  },
  {
    href: "/deities/hestia",
    label: "Hestia",
    note: "the hearth goddess at the center of Greek ritual life",
  },
  {
    href: "/deities/sif",
    label: "Sif",
    note: "Norse fertility, grain, and the domestic side of Asgard",
  },
  {
    href: "/deities/bastet",
    label: "Bastet",
    note: "protection, cats, music, and household devotion",
  },
  {
    href: "/deities/hathor",
    label: "Hathor",
    note: "joy, kingship, motherhood, and festival culture",
  },
  {
    href: "/deities/sekhmet",
    label: "Sekhmet",
    note: "solar wrath, plague, war, and divine healing",
  },
];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function DeitiesPageClient({
  deities: allDeities,
  traditionCount,
  traditionNames,
}: Readonly<{
  deities: Deity[];
  /** Traditions in the atlas (collections excluded), counted on the server. */
  traditionCount: number;
  /** Pantheon id → short name ("Greek"), computed on the server. */
  traditionNames: Record<string, string>;
}>) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [nameSearch, setNameSearch] = useState("");
  const [pantheonFilter, setPantheonFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"importance" | "name">("importance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const traditionName = (id: string) =>
    traditionNames[id] ?? capitalize(id.replace(/-pantheon$/, ""));

  const allDomains = useMemo(
    () =>
      Array.from(new Set(allDeities.flatMap((d) => d.domain ?? []))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [allDeities],
  );
  const allPantheons = useMemo(
    () =>
      Array.from(new Set(allDeities.map((d) => d.pantheonId))).sort((a, b) =>
        (traditionNames[a] ?? a).localeCompare(traditionNames[b] ?? b),
      ),
    [allDeities, traditionNames],
  );

  const displayDeities = useMemo(() => {
    const query = nameSearch.trim().toLowerCase();
    const filtered = allDeities.filter(
      (d) =>
        (!query ||
          d.name.toLowerCase().includes(query) ||
          d.alternateNames?.some((n) => n.toLowerCase().includes(query))) &&
        (genderFilter === "all" || d.gender === genderFilter) &&
        (domainFilter === "all" || d.domain?.includes(domainFilter)) &&
        (pantheonFilter === "all" || d.pantheonId === pantheonFilter),
    );
    filtered.sort((a, b) => {
      const comparison =
        sortBy === "name"
          ? a.name.localeCompare(b.name)
          : (a.importanceRank || 999) - (b.importanceRank || 999);
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return filtered;
  }, [
    allDeities,
    nameSearch,
    genderFilter,
    domainFilter,
    pantheonFilter,
    sortBy,
    sortOrder,
  ]);

  const hasActiveFilters =
    nameSearch.trim() !== "" ||
    genderFilter !== "all" ||
    domainFilter !== "all" ||
    pantheonFilter !== "all";

  const resetFilters = () => {
    setNameSearch("");
    setGenderFilter("all");
    setDomainFilter("all");
    setPantheonFilter("all");
  };

  return (
    <div className="min-h-screen">
      <PageHero
        mark="laurel"
        tagline="Divine Beings"
        title="Deities"
        description={`Gods and goddesses from ${traditionCount} traditions, with family trees, domains, and stories.`}
        backgroundImage="/deities-list-hero.jpg"
        backgroundAlt="A dramatic collage of deities from ancient mythology"
        colorScheme="gold"
      />

      <Container className="pt-6 pb-4 md:pt-8">
        <FilterToolbar
          label="Filter deities"
          count={
            hasActiveFilters
              ? `${displayDeities.length} of ${allDeities.length} deities`
              : `${allDeities.length} deities`
          }
          view={
            <div className="max-sm:hidden">
              <ViewToggle
                label="Deity view"
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: "grid", label: "Grid", icon: LayoutGrid },
                  {
                    value: "table",
                    label: "Table",
                    icon: Table,
                  },
                ]}
              />
            </div>
          }
        >
          <ToolbarSearch
            id="deity-search"
            label="Search deities by name"
            placeholder="Search by name…"
            value={nameSearch}
            onChange={setNameSearch}
          />
          <Select value={pantheonFilter} onValueChange={setPantheonFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tradition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All traditions</SelectItem>
              {allPantheons.map((pantheon) => (
                <SelectItem key={pantheon} value={pantheon}>
                  {traditionName(pantheon)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {allDomains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {capitalize(domain)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "importance" | "name")
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="importance">By importance</SelectItem>
                <SelectItem value="name">By name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              aria-label={
                sortOrder === "asc" ? "Sort descending" : "Sort ascending"
              }
            >
              {sortOrder === "asc" ? <ArrowDownAZ /> : <ArrowUpAZ />}
            </Button>
          </div>
          {hasActiveFilters ? (
            <Button variant="link" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          ) : null}
        </FilterToolbar>
      </Container>

      <Container className="pt-6 pb-12">
        {displayDeities.length === 0 ? (
          <EmptyResults
            title="No deities found"
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          >
            Try another name, tradition or domain.
          </EmptyResults>
        ) : viewMode === "table" ? (
          <DeitiesTable deities={displayDeities} />
        ) : (
          <PaginatedDeityGrid
            deities={displayDeities}
            traditionName={traditionName}
          />
        )}
      </Container>

      <AboutThisPage title="About the deity directory">
        <p>
          This directory works best when you use it to compare divine functions
          across traditions rather than reading one entry at a time. Filter by
          tradition, switch between grid and table views, and look for recurring
          patterns such as storm gods, underworld rulers, healers, culture
          heroes, and tricksters. Once you find a deity, jump into the full
          entry for symbols, relationships, stories, and linked places in the
          broader mythology graph.
        </p>
        <p>
          Good next stops after the major sky and underworld gods broaden the
          atlas into hearth cults, agricultural religion, Egyptian protection
          deities, and Norse family life:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {RECOMMENDED_DEITIES.map((deity) => (
            <li key={deity.href}>
              <Link href={deity.href}>{deity.label}</Link>: {deity.note}
            </li>
          ))}
        </ul>
      </AboutThisPage>
    </div>
  );
}

function PaginatedDeityGrid({
  deities,
  traditionName,
}: Readonly<{ deities: Deity[]; traditionName: (id: string) => string }>) {
  const pagination = usePagination(deities, 24);

  // Reset to first page when filtered data changes
  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deities.length]);

  return (
    <>
      <EntityGrid aspect="portrait">
        {pagination.paginatedData.map((deity, index) => (
          <EntityCard
            key={deity.id}
            href={`/deities/${deity.slug}`}
            title={deity.name}
            image={deity.imageUrl}
            imagePosition="50% 22%"
            aspect="portrait"
            priority={index < 4}
            tradition={traditionName(deity.pantheonId)}
            traditionColor={getPantheonColor(deity.pantheonId)}
            subtitle={
              deity.domain?.length
                ? deity.domain.slice(0, 3).map(capitalize).join(" · ")
                : undefined
            }
            description={deity.description}
            badges={
              deity.importanceRank === 1 ? (
                <EntityBadge tone="gold">Major deity</EntityBadge>
              ) : undefined
            }
            action={
              <BookmarkButton
                type="deity"
                id={deity.id}
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
