"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Scroll, Search, Sparkles, X, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import sourcesData from "@/data/sources.json";

interface SourceCharacter {
  id: string;
  kind: "deity" | "hero";
  role: string;
  where: string;
}

interface SourceKeyScene {
  title: string;
  where: string;
  summary: string;
}

interface Source {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  type: string;
  language?: string;
  description: string;
  translators?: Array<{ name: string; year: number }>;
  characters?: SourceCharacter[];
  keyScenes?: SourceKeyScene[];
  readingOrder?: string;
}

interface TraditionGroup {
  id: string;
  label: string;
  match: (s: Source) => boolean;
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

export function SourcesPageClient() {
  const sources = sourcesData as Source[];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filteredSources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sources.filter((s) => {
      if (activeGroup) {
        const group = TRADITION_GROUPS.find((g) => g.id === activeGroup);
        if (group && !group.match(s)) return false;
      }

      if (!query) return true;
      const matchTitle = s.title.toLowerCase().includes(query);
      const matchAuthor = (s.author ?? "").toLowerCase().includes(query);
      const matchDesc = s.description.toLowerCase().includes(query);
      const matchLang = (s.language ?? "").toLowerCase().includes(query);
      return matchTitle || matchAuthor || matchDesc || matchLang;
    });
  }, [sources, activeGroup, searchQuery]);

  return (
    <div className="page-shell max-w-5xl">
      <Breadcrumbs />

      {/* Editorial Methodology Card */}
      <Card className="border-gold/20 bg-card/70 p-6 md:p-8 backdrop-blur-xs shadow-sm mt-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
            <CardTitle className="text-foreground text-2xl font-serif">
              Canonical Texts &amp; Scholarly Foundations
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            This catalog brings together primary works, translations, and modern
            scholarship used across the atlas. It is a selected reading library,
            not a complete record of every tradition or the earliest surviving
            mention of each figure.
          </p>
          <p className="text-muted-foreground/80 leading-relaxed text-xs md:text-sm">
            Primary canonical works below are enriched with structured character
            occurrences, key narrative scenes, recommended reading sequences,
            and dual-language excerpts.
          </p>
        </CardContent>
      </Card>

      {/* Search & Filter Bar */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by work title, author (Homer, Hesiod, Ovid...), or tradition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 border-gold/20 bg-card/60 focus-visible:ring-gold/40 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
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
              {filteredSources.length}
            </span>{" "}
            of {sources.length} works
          </div>
        </div>

        {/* Tradition Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant={activeGroup === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGroup(null)}
            className="text-xs"
          >
            All Sources ({sources.length})
          </Button>
          {TRADITION_GROUPS.map((group) => {
            const count = sources.filter(group.match).length;
            return (
              <Button
                key={group.id}
                variant={activeGroup === group.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGroup(group.id)}
                className="text-xs"
              >
                {group.label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Sources Grid */}
      {filteredSources.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-gold/20 mb-6 shadow-sm">
            <Sparkles className="h-10 w-10 text-gold/60" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2 text-foreground">
            No sources found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            No source or reference matched &ldquo;{searchQuery}&rdquo;. Try
            adjusting your search terms or filter selections.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6 border-gold/30 text-gold hover:bg-gold/10"
            onClick={() => {
              setSearchQuery("");
              setActiveGroup(null);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {filteredSources.map((source) => {
            const characterCount = source.characters?.length ?? 0;
            const sceneCount = source.keyScenes?.length ?? 0;
            const isEnriched = characterCount > 0 || sceneCount > 0;

            return (
              <Card
                interactive
                key={source.id}
                asArticle
                className="parchment-card group relative h-full bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 flex flex-col justify-between"
              >
                <Link
                  href={`/sources/${source.id}`}
                  className="flex flex-col h-full p-6 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  aria-label={`View ${source.title}`}
                >
                  <div>
                    {/* Header line: Title + Era badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-gold transition-colors duration-300">
                          {source.title}
                        </h3>
                        <p className="text-gold/90 text-sm font-medium mt-1">
                          {source.author || "Traditional / Various"}
                          {source.year && ` · ${source.year}`}
                        </p>
                      </div>
                      {source.language && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-gold/10 text-gold border border-gold/20">
                          {source.language}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mt-4">
                      {source.description}
                    </p>
                  </div>

                  {/* Footer metadata & indicators */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      {characterCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-gold/90">
                          <Users className="h-3.5 w-3.5" />
                          {characterCount} figures
                        </span>
                      )}
                      {sceneCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Scroll className="h-3.5 w-3.5" />
                          {sceneCount} scenes
                        </span>
                      )}
                      {!isEnriched && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                          <BookOpen className="h-3.5 w-3.5" />
                          Reference text
                        </span>
                      )}
                    </div>

                    <span className="text-gold font-medium group-hover:translate-x-0.5 transition-transform">
                      Examine &rarr;
                    </span>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Additional Scholarly Resources Note */}
      <Card className="border-gold/20 bg-card/60 mt-12 p-6">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-foreground text-xl font-serif">
            Scholarly Citations &amp; Living Corpus
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2 text-sm text-muted-foreground">
          <p>
            Ancient literature survives in recensions, papyrus fragments, and
            variant manuscripts across centuries. When consulting entries, look
            for the &ldquo;Appears In&rdquo; cross-index on deities and heroes
            to compare how Homeric epic differs from Hesiodic theology, or how
            the Vedas differ from later Puranic literature.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
