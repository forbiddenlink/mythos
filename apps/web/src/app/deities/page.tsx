"use client";

import { DeitiesTable } from "@/components/deities/DeitiesTable";
import { DeityFilters } from "@/components/deities/DeityFilters";
import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FiltersSkeleton, GridSkeleton } from "@/components/ui/skeleton-cards";
import { usePagination } from "@/hooks/usePagination";
import { graphqlClient } from "@/lib/graphql-client";
import { GET_DEITIES } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Sparkles, Table } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Note: Metadata export removed - use layout.tsx for client components
// SEO is handled via dynamic title updates below

interface Deity {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
}

export default function DeitiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filteredDeities, setFilteredDeities] = useState<Deity[]>([]);
  const [filtersVersion, setFiltersVersion] = useState(0);

  const { data, isLoading, error } = useQuery<{ deities: Deity[] }>({
    queryKey: ["deities"],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync filtered list when data loads
      setFilteredDeities(data.deities);
    }
  }, [data]);

  const hasActiveFilters = filteredDeities !== data?.deities;
  const displayDeities = hasActiveFilters
    ? filteredDeities
    : data?.deities || [];

  let deitiesContent;
  if (displayDeities.length === 0 && hasActiveFilters) {
    deitiesContent = (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-muted border border-border mb-6">
          <Sparkles
            className="h-10 w-10 text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>
        <h2 className="text-2xl font-serif font-semibold mb-2 text-foreground">
          No deities found
        </h2>
        <p className="text-muted-foreground">
          Try adjusting your filters to find what you&apos;re looking for
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            setFilteredDeities(data?.deities ?? []);
            setFiltersVersion((prev) => prev + 1);
          }}
        >
          Clear filters
        </Button>
      </div>
    );
  } else if (viewMode === "table") {
    deitiesContent = <DeitiesTable deities={displayDeities} />;
  } else {
    deitiesContent = <PaginatedDeityGrid deities={displayDeities} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero placeholder */}
        <div className="relative h-[50vh] min-h-100 flex items-center justify-center overflow-hidden bg-linear-to-b from-midnight/70 via-midnight/60 to-midnight/80" />

        {/* Content Section */}
        <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
          <div className="flex items-center justify-between mb-8">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse hidden sm:block" />
            </div>
          </div>
          <FiltersSkeleton />
          <GridSkeleton count={6} columns={3} type="deity" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Error loading deities
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHero
        icon={<Sparkles />}
        tagline="Divine Beings"
        title="Deities"
        description="Gods and goddesses from 13 pantheons, with family trees, domains, and stories"
        backgroundImage="/deities-list-hero.png"
        colorScheme="gold"
      />

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs />
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2 hidden sm:flex"
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>

        {data?.deities && (
          <DeityFilters
            key={filtersVersion}
            deities={data.deities}
            onFilteredChange={setFilteredDeities}
          />
        )}

        {deitiesContent}
      </div>
    </div>
  );
}

function PaginatedDeityGrid({ deities }: Readonly<{ deities: Deity[] }>) {
  const pagination = usePagination(deities, 24);

  // Reset to first page when filtered data changes
  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deities.length]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pagination.paginatedData.map((deity) => (
          <Link
            key={deity.id}
            href={`/deities/${deity.slug}`}
            className="group"
          >
            <Card
              asArticle
              className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  {deity.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/20 shadow-sm">
                      <Image
                        src={deity.imageUrl}
                        alt={deity.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300">
                      <Sparkles
                        className="h-5 w-5 text-gold"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {deity.importanceRank && deity.importanceRank <= 5 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold/20 border border-gold/30 text-amber-900 dark:text-amber-100">
                        Major Deity
                      </span>
                    )}
                    <BookmarkButton type="deity" id={deity.id} size="sm" />
                  </div>
                </div>
                <CardTitle className="text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {deity.name}
                </CardTitle>
                {deity.domain && deity.domain.length > 0 && (
                  <CardDescription>
                    {deity.domain.slice(0, 3).join(", ")}
                  </CardDescription>
                )}
              </CardHeader>
              {deity.description && (
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {deity.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>

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
          className="mt-8"
        />
      )}
    </>
  );
}
