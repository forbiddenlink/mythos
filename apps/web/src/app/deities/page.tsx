'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, LayoutGrid, Table } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { DeitiesTable } from '@/components/deities/DeitiesTable';
import { DeityFilters } from '@/components/deities/DeityFilters';
import { BookmarkButton } from '@/components/ui/bookmark-button';

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

export default function DeitiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filteredDeities, setFilteredDeities] = useState<Deity[]>([]);

  const { data, isLoading, error } = useQuery<{ deities: Deity[] }>({
    queryKey: ['deities'],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
  });

  useEffect(() => {
    if (data) {
      setFilteredDeities(data.deities);
    }
  }, [data]);

  const displayDeities = filteredDeities.length > 0 ? filteredDeities : (data?.deities || []);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading deities</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/deities-list-hero.png"
            alt="Divine Beings"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Sparkles className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Divine Beings
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Deities
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Discover gods and goddesses from mythology across ancient civilizations
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs />
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>

        {data?.deities && (
          <DeityFilters
            deities={data.deities}
            onFilteredChange={setFilteredDeities}
          />
        )}

        {viewMode === 'table' ? (
          <DeitiesTable deities={displayDeities} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayDeities.map((deity) => (
              <Link key={deity.id} href={`/deities/${deity.slug}`}>
                <Card className="group h-full cursor-pointer card-elevated bg-card hover:scale-[1.01]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {deity.imageUrl ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/20 shadow-sm">
                          <Image
                            src={deity.imageUrl}
                            alt={deity.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300">
                          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {deity.importanceRank && deity.importanceRank <= 5 && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold">
                            Major Deity
                          </span>
                        )}
                        <BookmarkButton type="deity" id={deity.id} size="sm" />
                      </div>
                    </div>
                    <CardTitle className="text-foreground mt-4 group-hover:text-gold transition-colors duration-300">{deity.name}</CardTitle>
                    {deity.domain && deity.domain.length > 0 && (
                      <CardDescription>
                        {deity.domain.slice(0, 3).join(', ')}
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
        )}
      </div>
    </div>
  );
}
