"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Filter, ChevronRight } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import { HeroMark } from "@/components/icons/hero-mark";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import facts from "@/data/mythology-facts.json";
import deities from "@/data/deities.json";

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
    // mulberry32 PRNG
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
  connections: "bg-gold/10 text-gold border-gold/30 hover:bg-gold/20",
  language: "bg-patina/10 text-patina border-patina/30 hover:bg-patina/20",
  science: "bg-bronze/10 text-bronze border-bronze/30 hover:bg-bronze/20",
  origins: "bg-gold/10 text-gold border-gold/30 hover:bg-gold/20",
  symbolism: "bg-bronze/10 text-bronze border-bronze/30 hover:bg-bronze/20",
  stories: "bg-patina/10 text-patina border-patina/30 hover:bg-patina/20",
  misconceptions:
    "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20",
  history: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

// Get unique categories
const categories = Array.from(new Set(facts.map((f) => f.category)));

export function FactsPageClient() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const filteredFacts = useMemo(() => {
    const filtered = selectedCategory
      ? facts.filter((f) => f.category === selectedCategory)
      : facts;

    // Deterministic shuffle seeded by shuffleKey: keeps render pure (no
    // Math.random during render → no SSR/hydration mismatch) while each
    // shuffle press still reorders the list.
    return seededShuffle(filtered, shuffleKey);
  }, [selectedCategory, shuffleKey]);

  const getDeityInfo = (ids: string[]) =>
    ids
      .map((id) => deities.find((d) => d.id === id || d.slug === id))
      .filter((d): d is (typeof deities)[0] => d !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <HeroMark mark="torch" tone="light" size="lg" />
          </div>

          <h1 className="page-title text-foreground mb-4">Mythology Facts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {facts.length} fascinating facts about gods, myths, and ancient
            cultures
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
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
                ? "bg-gold hover:bg-gold/90 text-black"
                : ""
            }
          >
            All ({facts.length})
          </Button>

          {categories.map((category) => {
            const count = facts.filter((f) => f.category === category).length;
            return (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category ? categoryColors[category] : ""
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
            className="ml-2"
          >
            <MythosMark id="lot" className="h-4 w-4 mr-1" />
            Shuffle
          </Button>
        </div>

        {/* Facts grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredFacts.map((fact, index) => {
            const relatedDeities = getDeityInfo(fact.relatedDeities);

            return (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
              >
                <Card className="h-full bg-gradient-to-br from-card to-card/50 hover:border-gold/30 transition-colors">
                  <CardContent className="p-6">
                    <Badge
                      variant="outline"
                      className={`text-xs mb-3 ${categoryColors[fact.category] || ""}`}
                    >
                      {categoryLabels[fact.category] || fact.category}
                    </Badge>

                    <p className="text-foreground leading-relaxed mb-4">
                      {fact.fact}
                    </p>

                    {relatedDeities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {relatedDeities.map((deity) => (
                          <Link
                            key={deity.id}
                            href={`/deities/${deity.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/50 border border-border/50 text-xs hover:border-gold/50 hover:bg-gold/5 transition-colors"
                          >
                            {deity.name}
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
