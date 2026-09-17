"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Filter,
  ChevronRight,
  Sparkles,
  Calendar,
  Search,
  X,
  Copy,
  Check,
  Quote,
  Share2,
} from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import { HeroMark } from "@/components/icons/hero-mark";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { AntiquityCalendar } from "@/components/calendar/AntiquityCalendar";
import { getPantheonColor } from "@/lib/pantheon-colors";
import facts from "@/data/mythology-facts.json";

export interface FactDeityInfo {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
}

interface FactsPageClientProps {
  /**
   * Slim lookup table created server-side in page.tsx, so deities.json (586 KB)
   * does not need to be loaded into the client bundle.
   */
  deityLookup?: Record<string, FactDeityInfo>;
}

interface _Fact {
  id: string;
  fact: string;
  category: string;
  relatedDeities: string[];
}

/**
 * Deterministic Fisher-Yates shuffle seeded by a number. Same seed always
 * yields the same order, so it is safe to call during render (pure, SSR-stable)
 * — unlike Math.random, which would desync server and client output.
 */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let state = (seed + 1) * 0x9e3779b1;
  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const categoryLabels: Record<string, string> = {
  connections: "Cross-Cultural",
  language: "Word Origins",
  science: "Hidden Knowledge",
  origins: "Origin Stories",
  symbolism: "Symbolism",
  stories: "Mythology",
  misconceptions: "Myth Busted",
  history: "Historical",
};

const categoryColors: Record<string, string> = {
  connections: "bg-gold/15 text-gold-text border-gold/30 hover:bg-gold/25",
  language: "bg-patina/15 text-patina border-patina/30 hover:bg-patina/25",
  science: "bg-bronze/15 text-bronze border-bronze/30 hover:bg-bronze/25",
  origins: "bg-gold/15 text-gold border-gold/30 hover:bg-gold/25",
  symbolism: "bg-bronze/15 text-bronze border-bronze/30 hover:bg-bronze/25",
  stories: "bg-patina/15 text-patina border-patina/30 hover:bg-patina/25",
  misconceptions:
    "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25",
  history: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

const categories = Array.from(new Set(facts.map((f) => f.category)));

export function FactsPageClient({ deityLookup = {} }: FactsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"facts" | "calendar">("facts");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleKey, setShuffleKey] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to quickly focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        activeTab === "facts" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const filteredFacts = useMemo(() => {
    let result = facts;

    if (selectedCategory) {
      result = result.filter((f) => f.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((f) => {
        const textMatch = f.fact.toLowerCase().includes(q);
        const categoryMatch = (categoryLabels[f.category] || f.category)
          .toLowerCase()
          .includes(q);
        const deityMatch = f.relatedDeities.some((id) =>
          id.toLowerCase().includes(q),
        );
        return textMatch || categoryMatch || deityMatch;
      });
    }

    return seededShuffle(result, shuffleKey);
  }, [selectedCategory, searchQuery, shuffleKey]);

  const getDeityInfo = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => deityLookup[id])
        .filter((d): d is FactDeityInfo => d !== undefined),
    [deityLookup],
  );

  const handleCopyFact = useCallback((fact: (typeof facts)[0]) => {
    const shareText = `"${fact.fact}" — Mythos Atlas (https://mythosatlas.com/facts)`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(fact.id);
      setTimeout(
        () => setCopiedId((curr) => (curr === fact.id ? null : curr)),
        2000,
      );
    }
  }, []);

  const handleShareFact = useCallback(
    async (fact: (typeof facts)[0]) => {
      const shareData = {
        title: "Mythology Fact - Mythos Atlas",
        text: `"${fact.fact}"`,
        url: "https://mythosatlas.com/facts",
      };

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare?.(shareData)
      ) {
        try {
          await navigator.share(shareData);
          return;
        } catch {
          // User dismissed or aborted share
        }
      }
      // Fallback to clipboard
      handleCopyFact(fact);
    },
    [handleCopyFact],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-10">
        <Breadcrumbs />

        <div className="text-center mb-8 mt-4">
          <div className="flex items-center justify-center mb-6">
            <HeroMark mark="torch" tone="light" size="lg" />
          </div>

          <h1 className="page-title text-foreground mb-4">
            Mythology Facts & Ancient Almanac
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated discoveries, historical insights, and seasonal liturgical
            calendars from 13 world traditions.
          </p>

          {/* View Switcher */}
          <div className="flex justify-center mt-6">
            <div
              role="group"
              aria-label="Switch between facts and the festival almanac"
              className="inline-flex rounded-lg border border-border/80 bg-card/70 p-1 shadow-inner"
            >
              <button
                type="button"
                aria-pressed={activeTab === "facts"}
                onClick={() => setActiveTab("facts")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "facts"
                    ? "bg-gold text-midnight shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="size-4" />
                Curated Facts ({facts.length})
              </button>
              <button
                type="button"
                aria-pressed={activeTab === "calendar"}
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "calendar"
                    ? "bg-gold text-midnight shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="size-4" />
                Ancient Festival Almanac
              </button>
            </div>
          </div>
        </div>

        {activeTab === "facts" ? (
          <div className="space-y-8">
            {/* Search Bar + Controls */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search facts by keyword, deity, or topic... (Press '/' to focus)"
                  aria-label="Search facts by keyword, deity, or topic"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-card/80 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search query"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                <span>Filter:</span>
              </div>

              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={
                  selectedCategory === null
                    ? "bg-gold hover:bg-gold/90 text-black font-semibold shadow-sm"
                    : ""
                }
              >
                All ({facts.length})
              </Button>

              {categories.map((category) => {
                const count = facts.filter(
                  (f) => f.category === category,
                ).length;
                return (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedCategory((curr) =>
                        curr === category ? null : category,
                      )
                    }
                    className={
                      selectedCategory === category
                        ? categoryColors[category]
                        : "border-border/60 hover:border-gold/30 text-muted-foreground hover:text-foreground"
                    }
                  >
                    {categoryLabels[category] || category} ({count})
                  </Button>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShuffleKey((k) => k + 1)}
                className="ml-2 text-gold hover:text-gold-light"
                title="Shuffle facts display order"
              >
                <MythosMark id="lot" className="h-4 w-4 mr-1" />
                Shuffle
              </Button>
            </div>

            {/* Result count when filtering or searching */}
            {(searchQuery.trim() || selectedCategory) && (
              <div className="text-center text-xs text-muted-foreground">
                Showing {filteredFacts.length} of {facts.length} facts
                {searchQuery.trim() && (
                  <span> matching &ldquo;{searchQuery}&rdquo;</span>
                )}
                {selectedCategory && (
                  <span> in category {categoryLabels[selectedCategory]}</span>
                )}
              </div>
            )}

            {/* Facts grid */}
            {filteredFacts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/80 rounded-xl max-w-md mx-auto">
                <Quote className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-medium text-foreground">
                  No facts match your query
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search terms or clearing the filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-4 text-xs"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredFacts.map((fact, index) => {
                  const relatedDeities = getDeityInfo(fact.relatedDeities);
                  const isCopied = copiedId === fact.id;

                  return (
                    <motion.div
                      key={fact.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(index * 0.02, 0.3),
                        duration: 0.25,
                      }}
                    >
                      <Card className="Card parchment-card group relative h-full bg-card/85 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 shadow-sm overflow-hidden flex flex-col justify-between">
                        {/* Subtle classical watermark */}
                        <Quote
                          className="absolute -bottom-3 -right-3 size-24 text-gold/5 pointer-events-none select-none"
                          aria-hidden="true"
                        />

                        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                          <div>
                            {/* Card Header: Category Badge + Copy/Share actions */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${categoryColors[fact.category] || ""}`}
                              >
                                {categoryLabels[fact.category] || fact.category}
                              </Badge>

                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleCopyFact(fact)}
                                  aria-label={
                                    isCopied
                                      ? "Fact copied to clipboard"
                                      : "Copy fact to clipboard"
                                  }
                                  title="Copy quote"
                                  className="p-1.5 rounded-md hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors cursor-pointer"
                                >
                                  {isCopied ? (
                                    <span className="flex items-center gap-1 text-xs text-gold">
                                      <Check className="size-3.5" />
                                      <span className="text-[10px] font-medium">
                                        Copied
                                      </span>
                                    </span>
                                  ) : (
                                    <Copy className="size-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShareFact(fact)}
                                  aria-label="Share this fact"
                                  title="Share fact"
                                  className="p-1.5 rounded-md hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors cursor-pointer"
                                >
                                  <Share2 className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Fact Text */}
                            <p className="font-serif text-base sm:text-lg text-foreground/95 leading-relaxed mb-5">
                              &ldquo;{fact.fact}&rdquo;
                            </p>
                          </div>

                          {/* Related Deities */}
                          {relatedDeities.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider text-[10px]">
                                Deities:
                              </span>
                              {relatedDeities.map((deity) => {
                                const dotColor = getPantheonColor(
                                  deity.pantheonId,
                                );
                                return (
                                  <Link
                                    key={deity.id}
                                    href={`/deities/${deity.slug}`}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 border border-border/70 text-xs text-foreground/90 hover:border-gold/60 hover:text-gold hover:bg-gold/5 transition-colors"
                                  >
                                    <span
                                      className="size-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: dotColor }}
                                      aria-hidden="true"
                                    />
                                    <span>{deity.name}</span>
                                    <ChevronRight className="h-3 w-3 text-gold/70" />
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <AntiquityCalendar />
        )}
      </div>
    </div>
  );
}
