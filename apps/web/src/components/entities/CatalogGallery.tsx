"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table } from "lucide-react";
import {
  EntityBadge,
  EntityCard,
  EntityGrid,
  TraditionChip,
  type EntityCardAspect,
} from "@/components/entities/EntityCard";
import {
  EmptyResults,
  FilterToolbar,
  ToolbarSearch,
  ViewToggle,
} from "@/components/entities/FilterToolbar";
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

/** One catalog entry as the gallery needs it; projected on the server. */
export interface CatalogGalleryItem {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  description: string;
  imageUrl: string | null;
  /** Line under the title (habitat, first power). */
  subtitle?: string;
  /** Pill on the image ("Danger 9/10", "Weapon"). */
  badge?: string;
  /** Value for the facet select (type, threat band). */
  facet?: string;
  /** Extra table cells, matching `columns`. */
  cells: string[];
}

interface CatalogGalleryProps {
  items: CatalogGalleryItem[];
  /** Pantheon id → short name ("Greek"). */
  traditionNames: Record<string, string>;
  /** Route prefix for entries, e.g. "/creatures". */
  basePath: string;
  /** Plural noun for counts ("creatures"). */
  noun: string;
  searchLabel: string;
  /** Label and "all" option for the facet select. */
  facetLabel: string;
  facetOrder?: string[];
  /** Headings for `cells`. */
  columns: string[];
  aspect?: EntityCardAspect;
}

const PAGE_SIZE = 24;

/**
 * Grid/table browser for the creature and artifact catalogs: the shared
 * filter toolbar, EntityCard grid with client-side paging, and a compact
 * table for scanning.
 */
export function CatalogGallery({
  items,
  traditionNames,
  basePath,
  noun,
  searchLabel,
  facetLabel,
  facetOrder,
  columns,
  aspect = "landscape",
}: CatalogGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [pantheon, setPantheon] = useState("all");
  const [facet, setFacet] = useState("all");

  const traditionName = (id: string) =>
    traditionNames[id] ?? id.replace(/-pantheon$/, "");

  const pantheonIds = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.pantheonId))).sort((a, b) =>
        (traditionNames[a] ?? a).localeCompare(traditionNames[b] ?? b),
      ),
    [items, traditionNames],
  );
  const facets = useMemo(() => {
    const values = Array.from(
      new Set(items.flatMap((item) => (item.facet ? [item.facet] : []))),
    );
    return facetOrder
      ? facetOrder.filter((value) => values.includes(value))
      : values.sort((a, b) => a.localeCompare(b));
  }, [items, facetOrder]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (pantheon === "all" || item.pantheonId === pantheon) &&
        (facet === "all" || item.facet === facet) &&
        (!q ||
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.subtitle ?? "").toLowerCase().includes(q)),
    );
  }, [items, query, pantheon, facet]);

  const pagination = usePagination(filtered, PAGE_SIZE);
  const { firstPage } = pagination;
  useEffect(() => {
    firstPage();
  }, [filtered.length, firstPage]);

  const active = query.trim() !== "" || pantheon !== "all" || facet !== "all";
  const reset = () => {
    setQuery("");
    setPantheon("all");
    setFacet("all");
  };

  return (
    <>
      <FilterToolbar
        label={`Filter ${noun}`}
        count={
          active
            ? `${filtered.length} of ${items.length} ${noun}`
            : `${items.length} ${noun}`
        }
        view={
          <ViewToggle
            label={`${noun} view`}
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "grid", label: "Grid", icon: LayoutGrid },
              { value: "table", label: "Table", icon: Table },
            ]}
          />
        }
      >
        <ToolbarSearch
          id={`${noun}-search`}
          label={searchLabel}
          placeholder="Search by name or story…"
          value={query}
          onChange={setQuery}
        />
        <Select value={pantheon} onValueChange={setPantheon}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tradition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All traditions</SelectItem>
            {pantheonIds.map((id) => (
              <SelectItem key={id} value={id}>
                {traditionName(id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {facets.length > 1 ? (
          <Select value={facet} onValueChange={setFacet}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={facetLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{`All ${facetLabel.toLowerCase()}`}</SelectItem>
              {facets.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {active ? (
          <Button variant="link" size="sm" onClick={reset}>
            Reset
          </Button>
        ) : null}
      </FilterToolbar>

      <div className="pt-8">
        {filtered.length === 0 ? (
          <EmptyResults
            title={`No ${noun} found`}
            action={
              <Button variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            }
          >
            Try another name, tradition or {facetLabel.toLowerCase()}.
          </EmptyResults>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left type-ui">
              <thead className="bg-muted/60 text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tradition
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 font-semibold"
                    >
                      {column}
                    </th>
                  ))}
                  <th scope="col" className="min-w-64 px-4 py-3 font-semibold">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`${basePath}/${item.slug}`}
                        className="font-medium text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <TraditionChip
                        name={traditionName(item.pantheonId)}
                        color={getPantheonColor(item.pantheonId)}
                      />
                    </td>
                    {item.cells.map((cell, index) => (
                      <td
                        key={columns[index] ?? index}
                        className="px-4 py-3 text-muted-foreground first-letter:uppercase"
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="max-w-md px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2">{item.description}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <EntityGrid aspect={aspect}>
              {pagination.paginatedData.map((item, index) => (
                <EntityCard
                  key={item.id}
                  href={`${basePath}/${item.slug}`}
                  title={item.name}
                  image={item.imageUrl}
                  aspect={aspect}
                  priority={index < 3}
                  tradition={traditionName(item.pantheonId)}
                  traditionColor={getPantheonColor(item.pantheonId)}
                  subtitle={item.subtitle}
                  description={item.description}
                  badges={
                    item.badge ? <EntityBadge>{item.badge}</EntityBadge> : null
                  }
                />
              ))}
            </EntityGrid>
            {pagination.totalPages > 1 ? (
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
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
