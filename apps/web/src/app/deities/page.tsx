'use client';

import { useState } from 'react';
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
  const { data, isLoading, error } = useQuery<{ deities: Deity[] }>({
    queryKey: ['deities'],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
  });

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
      <div className="relative h-[50vh] min-h-100 flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/deities-list-hero.jpg"
            alt="Divine Beings"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-amber-900/65 via-amber-900/65 to-amber-900/70 z-10" />
        
        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-amber-500/20 backdrop-blur-sm">
              <Sparkles className="h-12 w-12 text-amber-300" />
            </div>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
            Deities
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 max-w-2xl mx-auto font-light leading-relaxed">
            Discover gods and goddesses from mythology across ancient civilizations.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="flex items-center justify-between mb-6">
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

      {viewMode === 'table' ? (
        <DeitiesTable deities={data?.deities || []} />
      ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.deities.map((deity) => (
          <Link key={deity.id} href={`/deities/${deity.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  </div>
                  {deity.importanceRank && deity.importanceRank <= 5 && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      Major Deity
                    </span>
                  )}
                </div>
                <CardTitle className="font-serif text-slate-900 dark:text-slate-100 mt-4">{deity.name}</CardTitle>
                {deity.domain && deity.domain.length > 0 && (
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {deity.domain.slice(0, 3).join(', ')}
                  </CardDescription>
                )}
              </CardHeader>
              {deity.description && (
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
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
