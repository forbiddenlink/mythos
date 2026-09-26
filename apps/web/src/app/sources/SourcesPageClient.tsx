"use client";

import { useMemo, useState } from "react";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import {
  ChipRow,
  EmptyResults,
  FilterChip,
  FilterToolbar,
  ToolbarSearch,
} from "@/components/entities/FilterToolbar";
import { Container } from "@/components/layout/container";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";

/** Card and filter fields for one work (no passages or scene summaries). */
export interface SourceListItem {
  id: string;
  title: string;
  author?: string;
  year?: string;
  type: string;
  language?: string;
  description: string;
  characterCount: number;
  sceneCount: number;
}

interface TraditionGroup {
  id: string;
  label: string;
  match: (s: SourceListItem) => boolean;
}

const TRADITION_GROUPS: TraditionGroup[] = [
  {
    id: "greco-roman",
    label: "Classical Greco-Roman",
    match: (s) =>
      [
        "iliad",
        "odyssey",
        "theogony",
        "works-and-days",
        "homeric-hymns",
        "aeneid",
        "metamorphoses",
        "library-apollodorus",
      ].includes(s.id),
  },
  {
    id: "norse-celtic",
    label: "Norse & Celtic",
    match: (s) =>
      ["poetic-edda", "prose-edda", "tain-bo-cuailnge"].includes(s.id),
  },
  {
    id: "egypt-meso",
    label: "Egyptian & Near Eastern",
    match: (s) =>
      [
        "book-of-the-dead",
        "pyramid-texts",
        "enuma-elish",
        "epic-of-gilgamesh",
      ].includes(s.id),
  },
  {
    id: "asian-vedic",
    label: "Indic & East Asian",
    match: (s) =>
      ["rigveda", "mahabharata", "ramayana", "kojiki", "nihon-shoki"].includes(
        s.id,
      ),
  },
  {
    id: "mesoamerican",
    label: "Mesoamerican",
    match: (s) => s.id === "popol-vuh",
  },
  {
    id: "academic",
    label: "Scholarly Reference",
    match: (s) =>
      s.type === "academic" ||
      s.type === "reference" ||
      s.type === "mythology" ||
      ![
        "iliad",
        "odyssey",
        "theogony",
        "works-and-days",
        "homeric-hymns",
        "aeneid",
        "metamorphoses",
        "library-apollodorus",
        "poetic-edda",
        "prose-edda",
        "tain-bo-cuailnge",
        "book-of-the-dead",
        "pyramid-texts",
        "enuma-elish",
        "epic-of-gilgamesh",
        "rigveda",
        "mahabharata",
        "ramayana",
        "kojiki",
        "nihon-shoki",
        "popol-vuh",
      ].includes(s.id),
  },
];

export function SourcesPageClient({
  sources,
}: Readonly<{ sources: SourceListItem[] }>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filteredSources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const group = TRADITION_GROUPS.find((g) => g.id === activeGroup);
    return sources.filter((s) => {
      if (group && !group.match(s)) return false;
      if (!query) return true;
      return (
        s.title.toLowerCase().includes(query) ||
        (s.author ?? "").toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.language ?? "").toLowerCase().includes(query)
      );
    });
  }, [sources, activeGroup, searchQuery]);

  const reset = () => {
    setSearchQuery("");
    setActiveGroup(null);
  };

  return (
    <Container className="pt-6 pb-12 md:pt-8">
      <FilterToolbar
        label="Filter sources"
        count={
          filteredSources.length === sources.length
            ? `${sources.length} works`
            : `${filteredSources.length} of ${sources.length} works`
        }
        chips={
          <ChipRow label="Tradition">
            <FilterChip
              active={activeGroup === null}
              onClick={() => setActiveGroup(null)}
              count={sources.length}
            >
              All
            </FilterChip>
            {TRADITION_GROUPS.map((group) => (
              <FilterChip
                key={group.id}
                active={activeGroup === group.id}
                onClick={() => setActiveGroup(group.id)}
                count={sources.filter(group.match).length}
              >
                {group.label}
              </FilterChip>
            ))}
          </ChipRow>
        }
      >
        <ToolbarSearch
          id="source-search"
          label="Search sources"
          placeholder="Search by title, author or language…"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </FilterToolbar>

      <div className="pt-8">
        {filteredSources.length === 0 ? (
          <EmptyResults
            title="No sources found"
            action={
              <Button variant="outline" size="sm" onClick={reset}>
                Reset filters
              </Button>
            }
          >
            No work matched &ldquo;{searchQuery}&rdquo;. Try another title,
            author or tradition.
          </EmptyResults>
        ) : (
          <EntityGrid>
            {filteredSources.map((source) => (
              <EntityCard
                key={source.id}
                media={false}
                href={`/sources/${source.id}`}
                title={source.title}
                tradition={source.language}
                subtitle={[source.author || "Traditional", source.year]
                  .filter(Boolean)
                  .join(" · ")}
                description={source.description}
                descriptionLines={3}
                meta={
                  source.characterCount > 0 || source.sceneCount > 0
                    ? [
                        source.characterCount > 0
                          ? `${source.characterCount} figures`
                          : null,
                        source.sceneCount > 0
                          ? `${source.sceneCount} key scenes`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Reference work"
                }
                action={
                  <BookmarkButton type="source" id={source.id} size="md" />
                }
              />
            ))}
          </EntityGrid>
        )}
      </div>
    </Container>
  );
}
