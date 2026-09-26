"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Check, Copy, Share2, Shuffle, Sparkles } from "lucide-react";
import { AntiquityCalendar } from "@/components/calendar/AntiquityCalendar";
import {
  ChipRow,
  EmptyResults,
  FilterChip,
  FilterToolbar,
  ToolbarSearch,
  ViewToggle,
} from "@/components/entities/FilterToolbar";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface FactDeityInfo {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  imageUrl: string | null;
}

export interface Fact {
  id: string;
  fact: string;
  category: string;
  relatedDeities: string[];
}

interface FactsPageClientProps {
  facts: Fact[];
  /**
   * Slim lookup table created server-side in page.tsx, so deities.json
   * never reaches the client bundle.
   */
  deityLookup?: Record<string, FactDeityInfo>;
  /** Festival honored-deity name → deity page slug, resolved on the server. */
  festivalDeitySlugs?: Record<string, string>;
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

export function FactsPageClient({
  facts,
  deityLookup = {},
  festivalDeitySlugs = {},
}: FactsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"facts" | "calendar">("facts");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleKey, setShuffleKey] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(facts.map((f) => f.category))),
    [facts],
  );

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
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (f) =>
          f.fact.toLowerCase().includes(q) ||
          (categoryLabels[f.category] || f.category)
            .toLowerCase()
            .includes(q) ||
          f.relatedDeities.some((id) => id.toLowerCase().includes(q)),
      );
    }
    return seededShuffle(result, shuffleKey);
  }, [facts, selectedCategory, searchQuery, shuffleKey]);

  const getDeityInfo = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => deityLookup[id])
        .filter((d): d is FactDeityInfo => d !== undefined),
    [deityLookup],
  );

  const handleCopyFact = useCallback((fact: Fact) => {
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
    async (fact: Fact) => {
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
      handleCopyFact(fact);
    },
    [handleCopyFact],
  );

  const viewSwitch = (
    <ViewToggle
      label="Switch between facts and the festival almanac"
      value={activeTab}
      onChange={setActiveTab}
      alwaysShowLabels
      options={[
        {
          value: "facts",
          label: `Curated Facts (${facts.length})`,
          icon: Sparkles,
        },
        {
          value: "calendar",
          label: "Ancient Festival Almanac",
          icon: Calendar,
        },
      ]}
    />
  );

  if (activeTab === "calendar") {
    return (
      <Container className="pt-6 pb-12 md:pt-8">
        <div className="border-b border-border/70 pb-4">{viewSwitch}</div>
        <div className="pt-8">
          <AntiquityCalendar deitySlugs={festivalDeitySlugs} />
        </div>
      </Container>
    );
  }

  return (
    <Container className="pt-6 pb-12 md:pt-8">
      <div className="mb-4">{viewSwitch}</div>
      <FilterToolbar
        label="Filter facts"
        count={
          searchQuery.trim() || selectedCategory
            ? `${filteredFacts.length} of ${facts.length} facts`
            : `${facts.length} facts`
        }
        chips={
          <ChipRow label="Category">
            <FilterChip
              active={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
              count={facts.length}
            >
              All
            </FilterChip>
            {categories.map((category) => (
              <FilterChip
                key={category}
                active={selectedCategory === category}
                onClick={() =>
                  setSelectedCategory((curr) =>
                    curr === category ? null : category,
                  )
                }
                count={facts.filter((f) => f.category === category).length}
              >
                {categoryLabels[category] || category}
              </FilterChip>
            ))}
          </ChipRow>
        }
      >
        <ToolbarSearch
          id="facts-search"
          label="Search facts by keyword, deity, or topic"
          placeholder="Search facts… (press / to focus)"
          value={searchQuery}
          onChange={setSearchQuery}
          inputRef={searchInputRef}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShuffleKey((k) => k + 1)}
          title="Shuffle facts display order"
        >
          <Shuffle aria-hidden="true" />
          Shuffle
        </Button>
      </FilterToolbar>

      <div className="pt-8">
        {filteredFacts.length === 0 ? (
          <EmptyResults
            title="No facts match your query"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Reset filters
              </Button>
            }
          >
            Try another keyword or clear the category.
          </EmptyResults>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredFacts.map((fact) => {
              const relatedDeities = getDeityInfo(fact.relatedDeities);
              const isCopied = copiedId === fact.id;
              return (
                <Card
                  key={fact.id}
                  className="Card h-full justify-between gap-5 bg-card px-6 py-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="type-eyebrow">
                        {categoryLabels[fact.category] || fact.category}
                      </p>
                      <div className="-mr-2 flex items-center">
                        <button
                          type="button"
                          onClick={() => handleCopyFact(fact)}
                          aria-label={
                            isCopied
                              ? "Fact copied to clipboard"
                              : "Copy fact to clipboard"
                          }
                          title="Copy quote"
                          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold-text focus-visible:outline-2 focus-visible:outline-gold"
                        >
                          {isCopied ? (
                            <Check className="size-4" aria-hidden="true" />
                          ) : (
                            <Copy className="size-4" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareFact(fact)}
                          aria-label="Share this fact"
                          title="Share fact"
                          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold-text focus-visible:outline-2 focus-visible:outline-gold"
                        >
                          <Share2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <blockquote className="mt-3 font-body text-xl leading-relaxed text-foreground">
                      {fact.fact}
                    </blockquote>
                  </div>

                  {relatedDeities.length > 0 && (
                    <ul
                      className="flex flex-wrap gap-2 border-t border-border/60 pt-4"
                      aria-label="Related deities"
                    >
                      {relatedDeities.map((deity) => (
                        <li key={deity.id}>
                          <Link
                            href={`/deities/${deity.slug}`}
                            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-background py-0.5 pl-0.5 pr-3 text-sm text-foreground transition-colors hover:border-gold/60 hover:text-gold-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            {deity.imageUrl ? (
                              <Image
                                src={deity.imageUrl}
                                alt=""
                                width={28}
                                height={28}
                                className="size-7 rounded-full object-cover object-top"
                              />
                            ) : null}
                            {deity.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
