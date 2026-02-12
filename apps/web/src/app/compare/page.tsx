'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES, GET_PANTHEONS } from '@/lib/queries';
import { Loader2, Scale, Sparkles, Share2, Check, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ComparisonSelector } from '@/components/compare/ComparisonSelector';
import { ComparisonTable } from '@/components/compare/ComparisonTable';
import type { Deity } from '@/components/compare/ComparisonCard';

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

// Predefined comparison suggestions
const PREDEFINED_COMPARISONS = [
  {
    name: 'Sky Gods',
    description: 'Supreme rulers of their pantheons',
    deities: ['zeus', 'jupiter', 'odin', 'indra'],
  },
  {
    name: 'Death Gods',
    description: 'Rulers of the underworld',
    deities: ['hades', 'hel', 'osiris'],
  },
  {
    name: 'Love Deities',
    description: 'Gods and goddesses of love and beauty',
    deities: ['aphrodite', 'venus', 'freyja'],
  },
  {
    name: 'War Gods',
    description: 'Divine warriors and battle masters',
    deities: ['ares', 'mars', 'tyr'],
  },
  {
    name: 'Sun Gods',
    description: 'Deities of light and the sun',
    deities: ['apollo', 'ra', 'amaterasu'],
  },
  {
    name: 'Creator Gods',
    description: 'Divine creators of the cosmos',
    deities: ['brahma', 'ra', 'odin'],
  },
];

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDeities, setSelectedDeities] = useState<Deity[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch deities
  const { data: deitiesData, isLoading: deitiesLoading, error: deitiesError } = useQuery<{ deities: Deity[] }>({
    queryKey: ['deities-compare'],
    queryFn: async () => {
      const query = `
        query GetDeitiesForCompare {
          deities {
            id
            name
            slug
            pantheonId
            gender
            domain
            symbols
            description
            importanceRank
            imageUrl
            alternateNames
            crossPantheonParallels {
              pantheonId
              deityId
              note
            }
          }
        }
      `;
      return graphqlClient.request(query);
    },
  });

  // Fetch pantheons
  const { data: pantheonsData } = useQuery<{ pantheons: Pantheon[] }>({
    queryKey: ['pantheons'],
    queryFn: async () => graphqlClient.request(GET_PANTHEONS),
  });

  const allDeities = deitiesData?.deities || [];
  const pantheons = pantheonsData?.pantheons || [];

  // Create a map for quick deity lookup
  const deityMap = useMemo(() => {
    const map = new Map<string, Deity>();
    allDeities.forEach((d) => {
      map.set(d.id, d);
      map.set(d.slug, d);
    });
    return map;
  }, [allDeities]);

  // Initialize from URL params
  useEffect(() => {
    const deityParams = searchParams.get('deities');
    if (deityParams && allDeities.length > 0) {
      const deityIds = deityParams.split(',').map(s => s.trim().toLowerCase());
      const foundDeities = deityIds
        .map((id) => deityMap.get(id))
        .filter((d): d is Deity => d !== undefined)
        .slice(0, 4);

      if (foundDeities.length > 0) {
        setSelectedDeities(foundDeities);
      }
    }
  }, [searchParams, allDeities, deityMap]);

  // Update URL when selection changes
  const updateUrl = useCallback((deities: Deity[]) => {
    if (deities.length > 0) {
      const params = new URLSearchParams();
      params.set('deities', deities.map(d => d.slug).join(','));
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    } else {
      router.replace('/compare', { scroll: false });
    }
  }, [router]);

  const handleSelect = useCallback((deity: Deity) => {
    setSelectedDeities((prev) => {
      if (prev.length >= 4) return prev;
      if (prev.some(d => d.id === deity.id)) return prev;
      const newDeities = [...prev, deity];
      updateUrl(newDeities);
      return newDeities;
    });
  }, [updateUrl]);

  const handleRemove = useCallback((id: string) => {
    setSelectedDeities((prev) => {
      const newDeities = prev.filter(d => d.id !== id);
      updateUrl(newDeities);
      return newDeities;
    });
  }, [updateUrl]);

  const handlePredefinedComparison = useCallback((deityIds: string[]) => {
    const foundDeities = deityIds
      .map((id) => deityMap.get(id))
      .filter((d): d is Deity => d !== undefined)
      .slice(0, 4);

    if (foundDeities.length > 0) {
      setSelectedDeities(foundDeities);
      updateUrl(foundDeities);
    }
  }, [deityMap, updateUrl]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  if (deitiesLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (deitiesError) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading deities</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {deitiesError instanceof Error ? deitiesError.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/deities-list-hero.png"
            alt="Compare Deities"
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
              <Scale className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Divine Comparison
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Compare Deities
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Compare gods and goddesses across ancient civilizations to discover similarities and differences
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16 bg-mythic">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Breadcrumbs />
            <Link href="/compare/myths">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Compare Myths
              </Button>
            </Link>
          </div>
          {selectedDeities.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share Comparison
                </>
              )}
            </Button>
          )}
        </div>

        {/* Deity Selector */}
        <div className="mb-12">
          <h2 className="text-xl font-serif font-semibold mb-4">Select Deities to Compare</h2>
          <ComparisonSelector
            deities={allDeities}
            selectedDeities={selectedDeities}
            onSelect={handleSelect}
            onRemove={handleRemove}
            maxSelection={4}
            pantheons={pantheons}
          />
        </div>

        {/* Predefined Comparisons */}
        {selectedDeities.length === 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-serif font-semibold mb-4">Suggested Comparisons</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PREDEFINED_COMPARISONS.map((comparison) => {
                // Check if all deities exist
                const availableDeities = comparison.deities.filter(id => deityMap.has(id));
                if (availableDeities.length < 2) return null;

                return (
                  <button
                    key={comparison.name}
                    onClick={() => handlePredefinedComparison(availableDeities)}
                    className="p-4 rounded-lg border border-border/60 bg-card hover:border-gold/50 hover:bg-gold/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-gold" />
                      <h3 className="font-serif font-semibold group-hover:text-gold transition-colors">
                        {comparison.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {comparison.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {availableDeities
                        .map((id) => deityMap.get(id)?.name || id)
                        .join(', ')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <ComparisonTable
          deities={selectedDeities}
          onRemove={handleRemove}
          pantheons={pantheons}
        />
      </div>
    </div>
  );
}
