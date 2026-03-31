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
import { usePagination } from "@/hooks/usePagination";
import deitiesData from "@/data/deities.json";
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

const RECOMMENDED_DEITIES = [
  {
    href: "/deities/demeter",
    label: "Demeter",
    note: "Harvest, sacred law, and the seasonal cycle",
  },
  {
    href: "/deities/hestia",
    label: "Hestia",
    note: "The hearth goddess at the center of Greek ritual life",
  },
  {
    href: "/deities/sif",
    label: "Sif",
    note: "Norse fertility, grain, and the domestic side of Asgard",
  },
  {
    href: "/deities/bastet",
    label: "Bastet",
    note: "Protection, cats, music, and household devotion",
  },
  {
    href: "/deities/hathor",
    label: "Hathor",
    note: "Joy, kingship, motherhood, and festival culture",
  },
  {
    href: "/deities/sekhmet",
    label: "Sekhmet",
    note: "Solar wrath, plague, war, and divine healing",
  },
];

export default function DeitiesPage() {
  const allDeities = deitiesData as Deity[];
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filteredDeities, setFilteredDeities] = useState<Deity[]>(allDeities);
  const [filtersVersion, setFiltersVersion] = useState(0);
  const hasActiveFilters = filteredDeities !== allDeities;
  const displayDeities = hasActiveFilters ? filteredDeities : allDeities;

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
            setFilteredDeities(allDeities);
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

  return (
    <div className="min-h-screen">
      <PageHero
        icon={<Sparkles />}
        tagline="Divine Beings"
        title="Deities"
        description="Gods and goddesses from 13 pantheons, with family trees, domains, and stories"
        backgroundImage="/deities-list-hero.jpg"
        backgroundAlt="A dramatic collage of deities from ancient mythology"
        colorScheme="gold"
      />

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            Browse By Domain, Symbol, And Role
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            This directory works best when you use it to compare divine
            functions across traditions rather than reading one entry at a time.
            Filter by pantheon, switch between grid and table views, and look
            for recurring patterns such as storm gods, underworld rulers,
            healers, culture heroes, and tricksters. Once you find a deity, jump
            into the full entry for symbols, relationships, stories, and linked
            places in the broader mythology graph.
          </p>
        </section>
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            Good Next Stops
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            If you want a few strong follow-up entries after the major sky and
            underworld gods, start with these pages. They broaden the atlas into
            hearth cults, agricultural religion, Egyptian protection deities,
            and Norse family life.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RECOMMENDED_DEITIES.map((deity) => (
              <Link
                key={deity.href}
                href={deity.href}
                className="rounded-xl border border-border bg-background/70 px-4 py-4 transition-colors hover:border-gold/40"
              >
                <p className="text-sm font-semibold text-foreground">
                  {deity.label}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {deity.note}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <div className="mt-8 flex items-center justify-between">
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

        <DeityFilters
          key={filtersVersion}
          deities={allDeities}
          onFilteredChange={setFilteredDeities}
        />

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
        {pagination.paginatedData.map((deity, index) => (
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
                    <div className="rounded-xl overflow-hidden border border-gold/20 shadow-sm">
                      <Image
                        src={deity.imageUrl}
                        alt={deity.name}
                        width={64}
                        height={64}
                        sizes="64px"
                        priority={index < 3}
                        className="h-16 w-16 object-cover"
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
