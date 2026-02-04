'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Shield, Users, Network } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FamilyTreeVisualization } from '@/components/family-tree/FamilyTreeVisualization';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { DeityJsonLd } from '@/components/seo/JsonLd';

interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  originStory: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description: string | null;
}

export default function DeityPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { data, isLoading, error } = useQuery<{ deity: Deity | null }>({
    queryKey: ['deity', slug],
    queryFn: async () => {
      // For now, we'll need to get all deities and find by slug
      // In a real app, you'd modify the backend to support slug queries
      const allDeities = await graphqlClient.request<{ deities: Deity[] }>(gql`
        query GetDeities {
          deities(pantheonId: null) {
            id
            pantheonId
            name
            slug
            gender
            domain
            symbols
            description
            originStory
            importanceRank
            imageUrl
            alternateNames
          }
        }
      `);
      return { deity: allDeities.deities.find(d => d.slug === slug) || null };
    },
  });

  // Fetch relationships for this deity
  const { data: relationshipsData } = useQuery<{ deityRelationships: Relationship[] }>({
    queryKey: ['deity-relationships', data?.deity?.id],
    queryFn: async () => {
      if (!data?.deity?.id) return { deityRelationships: [] };
      return graphqlClient.request(gql`
        query GetDeityRelationships($deityId: String!) {
          deityRelationships(deityId: $deityId) {
            id
            deityId
            relatedDeityId
            relationshipType
            description
          }
        }
      `, { deityId: data.deity.id });
    },
    enabled: !!data?.deity?.id,
  });

  // Fetch all deities for the family tree
  const { data: allDeitiesData } = useQuery<{ deities: Deity[] }>({
    queryKey: ['all-deities'],
    queryFn: async () => {
      return graphqlClient.request(gql`
        query GetAllDeities {
          deities(pantheonId: null) {
            id
            name
            slug
            gender
            domain
          }
        }
      `);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading deity</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.deity && !isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Deity Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The deity you're looking for doesn't exist.
          </p>
          <Link href="/deities" className="text-gold hover:underline mt-4 inline-block">
            View all deities
          </Link>
        </div>
      </div>
    );
  }

  if (!data?.deity) {
    return null;
  }

  const deity = data.deity;

  return (
    <div className="min-h-screen">
      <DeityJsonLd
        name={deity.name}
        description={deity.description || `${deity.name} - deity from ancient mythology`}
        alternateNames={deity.alternateNames}
        domains={deity.domain}
        url={`/deities/${deity.slug}`}
        image={deity.imageUrl || undefined}
      />
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/deity-hero.png"
            alt="Ancient Greek Statue"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-800/65 to-amber-900/70"></div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-10">
          <Link
            href="/deities"
            className="text-sm text-slate-200 hover:text-white mb-6 inline-block"
          >
            ← Back to Deities
          </Link>

          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="font-serif text-4xl font-bold tracking-tight text-white">{deity.name}</h1>
                  {deity.alternateNames && deity.alternateNames.length > 0 && (
                    <p className="text-slate-200 mt-1 font-light">
                      Also known as: {deity.alternateNames.join(', ')}
                    </p>
                  )}
                </div>
                <BookmarkButton type="deity" id={deity.id} size="lg" variant="light" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">


          <div className="space-y-8">
            {/* Centered Image */}
            {deity.imageUrl && (
              <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={deity.imageUrl}
                    alt={deity.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                </div>
              </div>
            )}

            {/* Content Cards */}
            <div className="space-y-8">
              {/* Description */}
              {deity.description && (
                <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-gold">
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">About {deity.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                      {deity.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Origin Story */}
              {deity.originStory && (
                <Card className="bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Origin Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                      {deity.originStory}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {deity.domain && deity.domain.length > 0 && (
                  <Card className="bg-white dark:bg-slate-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-teal-600" />
                        Domains
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {deity.domain.map((d) => (
                          <Badge key={d} variant="secondary" className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">{d}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {deity.symbols && deity.symbols.length > 0 && (
                  <Card className="bg-white dark:bg-slate-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-amber-600" />
                        Symbols
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {deity.symbols.map((s) => (
                          <Badge key={s} variant="outline" className="border-amber-200 dark:border-amber-800">{s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Family Tree */}
          {relationshipsData?.deityRelationships && relationshipsData.deityRelationships.length > 0 && (
            <Card className="bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Network className="h-5 w-5 text-teal-600" />
                  Family Tree
                </CardTitle>
                <CardDescription>
                  Explore {deity.name}&apos;s relationships with other deities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allDeitiesData?.deities && (
                  <FamilyTreeVisualization
                    deities={allDeitiesData.deities}
                    relationships={relationshipsData.deityRelationships}
                    focusDeityId={deity.id}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}