"use client";

import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { useMemo, useState } from "react";
import {
  ChipRow,
  EmptyResults,
  FilterChip,
  FilterToolbar,
  ToolbarSearch,
} from "@/components/entities/FilterToolbar";
import { MuseumInspector } from "@/components/museum/MuseumInspector";
import type { MuseumObject } from "@/lib/museum";

export interface MuseumConnectedEntry {
  href: string;
  label: string;
  kind: "Deity" | "Hero" | "Creature" | "Story";
}

export interface MuseumGalleryItem {
  object: MuseumObject;
  connectedEntries: MuseumConnectedEntry[];
}

const CONTEXT_FILTERS = [
  "Ancient object",
  "Later depiction",
  "Later European depiction",
] as const;

export function MuseumPageClient({ items }: { items: MuseumGalleryItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedContext, setSelectedContext] = useState<string>("all");
  const [selectedCulture, setSelectedCulture] = useState<string>("all");

  const contextCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { object } of items) {
      counts.set(object.context, (counts.get(object.context) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const cultureGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { object } of items) {
      const raw = object.culture ?? "Other";
      const primary = raw.split(",")[0].trim();
      counts.set(primary, (counts.get(primary) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ object, connectedEntries }) => {
      if (selectedContext !== "all" && object.context !== selectedContext) {
        return false;
      }
      if (selectedCulture !== "all") {
        const primary = (object.culture ?? "Other").split(",")[0].trim();
        if (primary !== selectedCulture) return false;
      }
      if (!q) return true;
      const haystack = [
        object.title,
        object.culture,
        object.creator,
        object.medium,
        object.date,
        object.description,
        object.accessionNumber,
        ...connectedEntries.map((e) => e.label),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query, selectedContext, selectedCulture]);

  return (
    <div>
      <FilterToolbar
        label="Filter museum objects"
        count={`${filtered.length} of ${items.length} objects`}
        chips={
          <>
            <ChipRow label="Context">
              <FilterChip
                active={selectedContext === "all"}
                onClick={() => setSelectedContext("all")}
                count={items.length}
              >
                All contexts
              </FilterChip>
              {CONTEXT_FILTERS.map((ctx) => (
                <FilterChip
                  key={ctx}
                  active={selectedContext === ctx}
                  onClick={() =>
                    setSelectedContext(selectedContext === ctx ? "all" : ctx)
                  }
                  count={contextCounts.get(ctx) ?? 0}
                >
                  {ctx}
                </FilterChip>
              ))}
            </ChipRow>
            <ChipRow label="Culture">
              <FilterChip
                active={selectedCulture === "all"}
                onClick={() => setSelectedCulture("all")}
              >
                All cultures
              </FilterChip>
              {cultureGroups.map(([culture, count]) => (
                <FilterChip
                  key={culture}
                  active={selectedCulture === culture}
                  onClick={() =>
                    setSelectedCulture(
                      selectedCulture === culture ? "all" : culture,
                    )
                  }
                  count={count}
                >
                  {culture}
                </FilterChip>
              ))}
            </ChipRow>
          </>
        }
      >
        <ToolbarSearch
          id="museum-search"
          label="Search museum objects, cultures, mediums, or figures"
          placeholder="Search objects, cultures, or figures..."
          value={query}
          onChange={setQuery}
          className="sm:w-80"
        />
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyResults
          title="No museum objects match those filters"
          action={
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedContext("all");
                setSelectedCulture("all");
              }}
              className="inline-flex h-10 items-center rounded-md border border-gold/60 px-4 type-ui font-medium text-foreground hover:bg-gold/10"
            >
              Reset filters
            </button>
          }
        >
          Try clearing the search query or selecting a broader historical
          context.
        </EmptyResults>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ object, connectedEntries }) => (
            <li key={object.id} className="flex min-w-0 flex-col">
              {object.imageUrl ? (
                <a
                  href={object.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-4 block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span
                    className="plate plate-paper block"
                    style={
                      { "--plate-accent": "var(--gold)" } as React.CSSProperties
                    }
                  >
                    <span className="plate-art relative block aspect-4/5 overflow-hidden bg-parchment">
                      <Image
                        src={object.imageUrl}
                        alt={object.imageAlt || object.title}
                        fill
                        unoptimized
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </span>
                  </span>
                  <span className="sr-only"> (opens the museum record)</span>
                </a>
              ) : null}
              <MuseumInspector object={object} />
              <p className="type-eyebrow">{object.context}</p>
              <h2 className="mt-1 font-serif text-[1.0625rem] font-semibold leading-snug text-foreground">
                <a
                  href={object.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-text"
                >
                  {object.title}
                  <span className="sr-only"> (opens the museum record)</span>
                </a>
              </h2>
              <p className="mt-1 type-meta text-muted-foreground">
                {[object.creator ?? object.culture, object.date, object.medium]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/85">
                {object.description}
              </p>
              {connectedEntries.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="type-meta text-muted-foreground">
                    In the atlas:
                  </span>
                  {connectedEntries.map((entry) => (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className="inline-flex items-center rounded-sm border border-border/80 bg-muted/40 px-2 py-0.5 type-meta text-foreground transition-colors hover:border-gold/60 hover:text-gold-text"
                    >
                      {entry.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              <p className="mt-auto pt-3 type-meta text-muted-foreground">
                {object.institution}
                {object.accessionNumber ? ` · ${object.accessionNumber}` : ""}
                {object.imageRights ? ` · ${object.imageRights}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
