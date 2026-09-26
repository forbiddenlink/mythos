"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronRight, Copy, Check } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import facts from "@/data/mythology-facts.json";

interface Fact {
  id: string;
  fact: string;
  category: string;
  relatedDeities: string[];
}

interface DidYouKnowProps {
  /**
   * Slim id/slug -> {name, slug} map built server-side in page.tsx, so the full
   * 492 KB deities.json no longer ships to the client just to render 3 chips.
   */
  deityLookup: Record<string, { name: string; slug: string }>;
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

/* Stay inside the classical palette — gold, bronze, patina, parchment, wine */
const categoryColors: Record<string, string> = {
  connections: "bg-bronze/10 border-bronze/35",
  language: "bg-patina/10 border-patina/35",
  science: "bg-gold/10 border-gold/35",
  origins: "bg-gold/15 border-gold/40",
  symbolism: "bg-midnight/5 border-midnight/25 dark:border-parchment/25",
  stories: "bg-bronze/10 border-bronze/30",
  misconceptions: "bg-destructive/10 border-destructive/30",
  history: "bg-muted border-border",
};

// Deterministic daily fact based on date
function getDailyFactIndex(date: Date): number {
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + (dateString.codePointAt(i) ?? 0);
    hash = hash & hash;
  }
  return Math.abs(hash) % facts.length;
}

export function DidYouKnow({ deityLookup }: DidYouKnowProps) {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: detect client-side mount
    setMounted(true);
    const dailyIndex = getDailyFactIndex(new Date());
    setCurrentFact(facts[dailyIndex] as Fact);
  }, []);

  const getRandomFact = useCallback(() => {
    setIsSpinning(true);
    setIsCopied(false);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * facts.length);
      setCurrentFact(facts[randomIndex] as Fact);
      setIsSpinning(false);
    }, 300);
  }, []);

  const handleCopyFact = useCallback(() => {
    if (!currentFact) return;
    const shareText = `"${currentFact.fact}" — Mythos Atlas (https://mythosatlas.com/facts)`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [currentFact]);

  // Resolve related deities via the server-provided slim lookup (id or slug).
  const relatedDeityInfo =
    currentFact?.relatedDeities
      .map((id) => deityLookup[id])
      .filter((d): d is { name: string; slug: string } => d !== undefined)
      .slice(0, 3) || [];

  if (!mounted || !currentFact) {
    return (
      <section className="layout-container layout-container-content pb-[var(--section-space)]">
        <div className="h-52 rounded-lg bg-muted/50 animate-pulse motion-reduce:animate-none" />
      </section>
    );
  }

  return (
    <section className="layout-container layout-container-content pb-[var(--section-space)]">
      <div className="relative overflow-hidden rounded-lg bg-card ring-1 ring-border/70">
        <div className="relative p-6 md:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <MythosMark id="torch" className="h-5 w-5 text-gold-text" />
              <div>
                <h2 className="type-h3 text-foreground">Did you know?</h2>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs text-foreground ${categoryColors[currentFact.category] || ""}`}
                >
                  {categoryLabels[currentFact.category] || currentFact.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyFact}
                className="text-muted-foreground hover:text-foreground"
                aria-label={
                  isCopied
                    ? "Fact copied to clipboard"
                    : "Copy fact to clipboard"
                }
                title="Copy fact"
              >
                {isCopied ? (
                  <span className="flex items-center gap-1 text-gold">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Copied</span>
                  </span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={getRandomFact}
                aria-label="Show another mythology fact"
                disabled={isSpinning}
                className="text-muted-foreground hover:text-foreground"
              >
                <motion.div
                  animate={{ rotate: isSpinning ? 360 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span className="ml-2 hidden sm:inline">Another</span>
              </Button>
            </div>
          </div>

          {/* Fact content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="mb-6 max-w-4xl font-body text-xl leading-relaxed text-foreground md:text-2xl md:leading-snug">
                {currentFact.fact}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Related deities and view all link */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {relatedDeityInfo.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Related:</span>
                {relatedDeityInfo.map((deity) => (
                  <Link
                    key={deity.slug}
                    href={`/deities/${deity.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background/50 border border-border/50 text-sm hover:border-gold/50 hover:bg-gold/5 transition-colors"
                  >
                    {deity.name}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/facts"
              className="text-sm text-gold-text hover:underline flex items-center gap-1 ml-auto"
            >
              View all {facts.length} facts
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
