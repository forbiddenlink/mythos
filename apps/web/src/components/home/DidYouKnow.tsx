"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import facts from "@/data/mythology-facts.json";
import deities from "@/data/deities.json";

interface Fact {
  id: string;
  fact: string;
  category: string;
  relatedDeities: string[];
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
  connections: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  language: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  science: "bg-green-500/10 text-green-400 border-green-500/30",
  origins: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  symbolism: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  stories: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  misconceptions: "bg-red-500/10 text-red-400 border-red-500/30",
  history: "bg-teal-500/10 text-teal-400 border-teal-500/30",
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

export function DidYouKnow() {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: detect client-side mount
    setMounted(true);
    const dailyIndex = getDailyFactIndex(new Date());
    setCurrentFact(facts[dailyIndex] as Fact);
  }, []);

  const getRandomFact = useCallback(() => {
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * facts.length);
      setCurrentFact(facts[randomIndex] as Fact);
      setIsSpinning(false);
    }, 300);
  }, []);

  // Get related deity info
  const relatedDeityInfo =
    currentFact?.relatedDeities
      .map((id) => deities.find((d) => d.id === id || d.slug === id))
      .filter((d): d is (typeof deities)[0] => d !== undefined)
      .slice(0, 3) || [];

  if (!mounted || !currentFact) {
    return (
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="h-40 bg-muted/50 rounded-xl animate-pulse" />
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-7xl px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/5 via-card to-amber-500/5 border border-gold/20">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-gold/10 to-transparent opacity-50" />

        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
                <Lightbulb className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold">
                  Did You Know?
                </h2>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 ${categoryColors[currentFact.category] || ""}`}
                >
                  {categoryLabels[currentFact.category] || currentFact.category}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={getRandomFact}
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

          {/* Fact content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
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
                    key={deity.id}
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
              className="text-sm text-gold hover:underline flex items-center gap-1 ml-auto"
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
