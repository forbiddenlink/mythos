'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Lightbulb, Filter, ChevronRight, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import facts from '@/data/mythology-facts.json';
import deities from '@/data/deities.json';

interface Fact {
  id: string;
  fact: string;
  category: string;
  relatedDeities: string[];
}

const categoryLabels: Record<string, string> = {
  connections: 'Cross-Cultural',
  language: 'Word Origins',
  science: 'Hidden Knowledge',
  origins: 'Origin Stories',
  symbolism: 'Symbolism',
  stories: 'Mythology',
  misconceptions: 'Myth Busted',
  history: 'Historical',
};

const categoryColors: Record<string, string> = {
  connections: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
  language: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
  science: 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20',
  origins: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
  symbolism: 'bg-pink-500/10 text-pink-400 border-pink-500/30 hover:bg-pink-500/20',
  stories: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20',
  misconceptions: 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20',
  history: 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20',
};

// Get unique categories
const categories = Array.from(new Set(facts.map((f) => f.category)));

export default function FactsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const filteredFacts = useMemo(() => {
    const filtered = selectedCategory
      ? facts.filter((f) => f.category === selectedCategory)
      : facts;

    // Shuffle based on shuffleKey
    return [...filtered].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, shuffleKey]);

  const getDeityInfo = (ids: string[]) =>
    ids
      .map((id) => deities.find((d) => d.id === id || d.slug === id))
      .filter((d): d is typeof deities[0] => d !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Lightbulb className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Mythology Facts
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {facts.length} fascinating facts about gods, myths, and ancient cultures
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-gold hover:bg-gold/90 text-black' : ''}
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
                className={selectedCategory === category ? categoryColors[category] : ''}
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
            <Shuffle className="h-4 w-4 mr-1" />
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
                      className={`text-xs mb-3 ${categoryColors[fact.category] || ''}`}
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
