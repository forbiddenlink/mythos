'use client';

import { useContext, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProgressContext } from '@/providers/progress-provider';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Shield, Users, Network, Link2, BookOpen, Building, Calendar, ScrollText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Lazy load heavy ReactFlow-based family tree
const FamilyTreeVisualization = dynamic(
  () => import('@/components/family-tree/FamilyTreeVisualization').then(mod => ({ default: mod.FamilyTreeVisualization })),
  { loading: () => <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>, ssr: false }
);
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { ExportIconButton } from '@/components/ui/export-button';
import { DeityJsonLd } from '@/components/seo/JsonLd';
import ReactMarkdown from 'react-markdown';
import { DetailPageSkeleton } from '@/components/ui/skeleton-cards';
import { PronunciationDisplay } from '@/components/ui/pronunciation';
import { SourceExcerptsList, ReferencesList, OriginalLanguageName } from '@/components/sources';
import type { PrimarySourceExcerpt, FurtherReadingReference, OriginalLanguageNameData } from '@/components/sources';

function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
}

interface Pronunciation {
  ipa: string;
  phonetic: string;
  audioUrl?: string;
}

interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  detailedBio?: string | null;
  originStory: string | null;
  pronunciation?: Pronunciation;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
  crossPantheonParallels?: Array<{
    pantheonId: string;
    deityId: string;
    note: string;
  }>;
  primarySources?: Array<{
    text: string;
    source: string;
    date?: string;
  }>;
  primarySourceExcerpts?: PrimarySourceExcerpt[];
  furtherReading?: FurtherReadingReference[];
  originalLanguageName?: OriginalLanguageNameData;
  worship?: {
    temples?: string[];
    festivals?: string[];
    practices?: string;
  };
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
      // Fetch specific deity by slug (API supports slug as ID)
      const result = await graphqlClient.request<{ deity: Deity }>(gql`
        query GetDeity($id: String!) {
          deity(id: $id) {
            id
            pantheonId
            name
            slug
            gender
            domain
            symbols
            description
            detailedBio
            originStory
            pronunciation {
              ipa
              phonetic
              audioUrl
            }
            importanceRank
            imageUrl
            alternateNames
            crossPantheonParallels {
              pantheonId
              deityId
              note
            }
            primarySources {
              text
              source
              date
            }
            primarySourceExcerpts {
              text
              translation
              source
              sourceId
              lineNumbers
              translator
              originalLanguage
            }
            furtherReading {
              sourceId
              note
            }
            originalLanguageName {
              text
              language
              transliteration
              meaning
            }
            worship {
              temples
              festivals
              practices
            }
          }
        }
      `, { id: slug });
      return { deity: result.deity || null };
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

  // Track progress when deity is viewed
  const { trackDeityView, trackPantheonExplore } = useProgress();

  useEffect(() => {
    if (data?.deity?.id) {
      trackDeityView(data.deity.id);
    }
    if (data?.deity?.pantheonId) {
      trackPantheonExplore(data.deity.pantheonId);
    }
  }, [data?.deity?.id, data?.deity?.pantheonId, trackDeityView, trackPantheonExplore]);

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
    return <DetailPageSkeleton />;
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
              <div className="flex items-center gap-4 mb-4" style={{ viewTransitionName: 'page-header' }}>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-white">{deity.name}</h1>
                    {deity.pronunciation && (
                      <PronunciationDisplay
                        pronunciation={deity.pronunciation}
                        className="text-slate-200 hover:text-white"
                      />
                    )}
                  </div>
                  {deity.originalLanguageName && (
                    <p className="text-slate-200 mt-1">
                      <OriginalLanguageName data={deity.originalLanguageName} variant="inline" className="text-slate-100" />
                    </p>
                  )}
                  {deity.alternateNames && deity.alternateNames.length > 0 && (
                    <p className="text-slate-200 mt-1 font-light">
                      Also known as: {deity.alternateNames.join(', ')}
                    </p>
                  )}
                </div>
                <BookmarkButton type="deity" id={deity.id} size="lg" variant="light" />
                <ExportIconButton
                  type="deity"
                  data={{
                    name: deity.name,
                    alternateNames: deity.alternateNames,
                    description: deity.description,
                    detailedBio: deity.detailedBio,
                    originStory: deity.originStory,
                    domain: deity.domain,
                    symbols: deity.symbols,
                    pantheonId: deity.pantheonId,
                    imageUrl: deity.imageUrl,
                    primarySources: deity.primarySources,
                    worship: deity.worship,
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">


          <div className="space-y-8">
            {/* Centered Image with shared element transition */}
            {deity.imageUrl && (
              <div
                className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl"
                style={{ viewTransitionName: `deity-image-${deity.slug}` }}
              >
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
              {/* Detailed Bio (Markdown) or Description */}
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-gold">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">About {deity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {deity.detailedBio ? (
                    <div className="prose prose-slate dark:prose-invert prose-headings:font-serif prose-headings:text-amber-700 dark:prose-headings:text-amber-500 prose-a:text-teal-600 dark:prose-a:text-teal-400 max-w-none">
                      <ReactMarkdown>{deity.detailedBio}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                      {deity.description}
                    </p>
                  )}
                </CardContent>
              </Card>

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

              {/* Cross-Pantheon Parallels */}
              {deity.crossPantheonParallels && deity.crossPantheonParallels.length > 0 && (
                <Card className="bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2 text-xl">
                      <Link2 className="h-5 w-5 text-gold" />
                      Cross-Pantheon Parallels
                    </CardTitle>
                    <CardDescription>
                      Similar deities across different mythologies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {deity.crossPantheonParallels.map((parallel, index) => (
                        <li key={index} className="border-l-2 border-gold/30 pl-4">
                          <div className="flex items-baseline gap-2">
                            <Link
                              href={`/deities/${parallel.deityId}`}
                              className="text-gold hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                            >
                              {parallel.deityId}
                            </Link>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                              ({parallel.pantheonId})
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                            {parallel.note}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Primary Source Excerpts (with original language toggle) */}
              {deity.primarySourceExcerpts && deity.primarySourceExcerpts.length > 0 && (
                <Card className="bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2 text-xl">
                      <ScrollText className="h-5 w-5 text-teal-600" />
                      Ancient Sources
                    </CardTitle>
                    <CardDescription>
                      Original texts with translations - toggle to see the original language
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SourceExcerptsList excerpts={deity.primarySourceExcerpts} />
                  </CardContent>
                </Card>
              )}

              {/* Primary Sources (simple quotes) */}
              {deity.primarySources && deity.primarySources.length > 0 && !deity.primarySourceExcerpts?.length && (
                <Card className="bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2 text-xl">
                      <BookOpen className="h-5 w-5 text-teal-600" />
                      Primary Sources
                    </CardTitle>
                    <CardDescription>
                      Historical texts and references
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {deity.primarySources.map((source, index) => (
                        <blockquote
                          key={index}
                          className="border-l-4 border-teal-500/50 pl-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg"
                        >
                          <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            &ldquo;{source.text}&rdquo;
                          </p>
                          <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-medium">{source.source}</span>
                            {source.date && (
                              <span className="ml-2 text-slate-400 dark:text-slate-500">
                                ({source.date})
                              </span>
                            )}
                          </footer>
                        </blockquote>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Further Reading */}
              {deity.furtherReading && deity.furtherReading.length > 0 && (
                <ReferencesList
                  references={deity.furtherReading}
                  title="Further Reading"
                  showDescriptions={false}
                  collapsible={true}
                  defaultExpanded={false}
                />
              )}

              {/* Worship & Cult */}
              {deity.worship && (deity.worship.temples?.length || deity.worship.festivals?.length || deity.worship.practices) && (
                <Card className="bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2 text-xl">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      Worship & Cult
                    </CardTitle>
                    <CardDescription>
                      How {deity.name} was venerated in ancient times
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {deity.worship.temples && deity.worship.temples.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-3">
                          <Building className="h-4 w-4 text-slate-500" />
                          Sacred Temples
                        </h4>
                        <ul className="space-y-2">
                          {deity.worship.temples.map((temple, index) => (
                            <li
                              key={index}
                              className="text-slate-600 dark:text-slate-400 flex items-start gap-2"
                            >
                              <span className="text-gold mt-1">&#8226;</span>
                              {temple}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {deity.worship.festivals && deity.worship.festivals.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-3">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          Festivals & Celebrations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {deity.worship.festivals.map((festival, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                            >
                              {festival}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {deity.worship.practices && (
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                          Worship Practices
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {deity.worship.practices}
                        </p>
                      </div>
                    )}
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