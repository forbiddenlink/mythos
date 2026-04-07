"use client";

import { useContext, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ProgressContext } from "@/providers/progress-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Shield,
  Users,
  Network,
  Link2,
  BookOpen,
  Building,
  Calendar,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HERO_IMAGE_WIDTH = 1920;
const HERO_IMAGE_HEIGHT = 1080;
const DEITY_IMAGE_WIDTH = 768;
const DEITY_IMAGE_HEIGHT = 1024;

// Lazy load heavy ReactFlow-based family tree
const FamilyTreeVisualization = dynamic(
  () =>
    import("@/components/family-tree/FamilyTreeVisualization").then((mod) => ({
      default: mod.FamilyTreeVisualization,
    })),
  {
    loading: () => (
      <div className="h-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  },
);

// Lazy load 3D deity statue
const DeityStatue = dynamic(
  () =>
    import("@/components/three/DeityStatue").then((mod) => ({
      default: mod.DeityStatue,
    })),
  {
    loading: () => (
      <div className="h-80 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    ),
    ssr: false,
  },
);
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ExportIconButton } from "@/components/ui/export-button";
import { ShareButton } from "@/components/sharing/ShareButton";
import { DeityJsonLd } from "@/components/seo/JsonLd";
import ReactMarkdown from "react-markdown";
import { PronunciationDisplay } from "@/components/ui/pronunciation";
import { EditorialByline } from "@/components/content/EditorialByline";
import { normalizeDeityReference } from "@/lib/deities";
import {
  SourceExcerptsList,
  ReferencesList,
  EntityPlainSourcesList,
  OriginalLanguageName,
  type PrimarySourceExcerpt,
  type FurtherReadingReference,
  type OriginalLanguageNameData,
} from "@/components/sources";
import { RelatedDeities } from "@/components/deities/RelatedDeities";
import { DeityStoryRecommendations } from "@/components/deities/DeityStoryRecommendations";
import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";

function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
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
  /** Optional editorial bibliography lines (plain text). */
  sources?: string[];
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

interface DeityPageClientProps {
  slug: string;
}

function formatSlugAsTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DeityPageClient({ slug }: DeityPageClientProps) {
  // Track progress when deity is viewed
  const { trackDeityView, trackPantheonExplore } = useProgress();
  const allDeities = deitiesData as Deity[];
  const relationshipList = relationshipsData as Relationship[];
  const deity =
    allDeities.find((item) => item.id === slug || item.slug === slug) ?? null;
  const deityRelationships = useMemo(
    () =>
      deity
        ? relationshipList.filter(
            (relationship) =>
              relationship.fromDeityId === deity.id ||
              relationship.toDeityId === deity.id,
          )
        : [],
    [deity, relationshipList],
  );
  const deityReferenceMap = useMemo(() => {
    const map = new Map<string, Deity>();
    allDeities.forEach((item) => {
      map.set(normalizeDeityReference(item.id), item);
      map.set(normalizeDeityReference(item.slug), item);

      item.alternateNames?.forEach((alternateName) => {
        map.set(normalizeDeityReference(alternateName), item);
      });
    });
    return map;
  }, [allDeities]);

  useEffect(() => {
    if (deity?.id) {
      trackDeityView(deity.id);
    }
    if (deity?.pantheonId) {
      trackPantheonExplore(deity.pantheonId);
    }
  }, [deity?.id, deity?.pantheonId, trackDeityView, trackPantheonExplore]);

  if (!deity) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <h1 className="sr-only">{formatSlugAsTitle(slug)}</h1>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Deity Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The deity you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/deities"
            className="text-gold hover:underline mt-4 inline-block"
          >
            View all deities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DeityJsonLd
        name={deity.name}
        description={
          deity.description || `${deity.name} - deity from ancient mythology`
        }
        alternateNames={deity.alternateNames}
        domains={deity.domain}
        url={`/deities/${deity.slug}`}
        image={deity.imageUrl || undefined}
      />
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/deity-hero.jpg"
            alt={`${deity.name} hero background`}
            width={HERO_IMAGE_WIDTH}
            height={HERO_IMAGE_HEIGHT}
            sizes="100vw"
            className="h-full w-full object-cover"
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
              <div
                className="flex items-center gap-4 mb-4"
                style={{ viewTransitionName: "page-header" }}
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
                      {deity.name}
                    </h1>
                    {deity.pronunciation && (
                      <PronunciationDisplay
                        pronunciation={deity.pronunciation}
                        className="text-slate-200 hover:text-white"
                      />
                    )}
                  </div>
                  {deity.originalLanguageName && (
                    <p className="text-slate-200 mt-1">
                      <OriginalLanguageName
                        data={deity.originalLanguageName}
                        variant="inline"
                        className="text-slate-100"
                      />
                    </p>
                  )}
                  {deity.alternateNames && deity.alternateNames.length > 0 && (
                    <p className="text-slate-200 mt-1 font-light">
                      Also known as: {deity.alternateNames.join(", ")}
                    </p>
                  )}
                  <EditorialByline className="mt-3 max-w-2xl" tone="light" />
                </div>
                <BookmarkButton
                  type="deity"
                  id={deity.id}
                  size="lg"
                  variant="light"
                />
                <ShareButton
                  title={`${deity.name} - Mythos Atlas`}
                  text={`Discover ${deity.name}, ${deity.domain?.join(", ") || "deity"} from ancient mythology on Mythos Atlas`}
                  url={`https://mythosatlas.com/deities/${deity.slug}`}
                  className="[&_button]:text-white [&_button]:border-white/30 [&_button]:hover:bg-white/20"
                />
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
            {/* Deity Visual Display - Image and 3D Statue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Image with shared element transition */}
              {deity.imageUrl && (
                <div
                  className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-border shadow-2xl"
                  style={{ viewTransitionName: `deity-image-${deity.slug}` }}
                >
                  <div className="aspect-3/4 relative">
                    <Image
                      src={deity.imageUrl}
                      alt={deity.name}
                      width={DEITY_IMAGE_WIDTH}
                      height={DEITY_IMAGE_HEIGHT}
                      sizes="(min-width: 768px) 24rem, 90vw"
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                  </div>
                </div>
              )}

              {/* 3D Interactive Statue */}
              <div
                className={
                  deity.imageUrl ? "" : "md:col-span-2 max-w-sm mx-auto w-full"
                }
              >
                <DeityStatue
                  pantheon={deity.pantheonId}
                  domains={deity.domain}
                  showParticles={true}
                />
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Interactive 3D representation
                </p>
              </div>
            </div>

            {/* Content Cards */}
            <div className="space-y-8">
              {/* Detailed Bio (Markdown) or Description */}
              <Card className="border-l-4 border-l-gold">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">
                    About {deity.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deity.detailedBio ? (
                    <div className="prose prose-slate dark:prose-invert prose-headings:font-serif prose-headings:text-amber-700 dark:prose-headings:text-amber-500 prose-a:text-gold dark:prose-a:text-gold-light max-w-none">
                      <ReactMarkdown>{deity.detailedBio}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {deity.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Origin Story */}
              {deity.originStory && (
                <Card className="">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">
                      Origin Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {deity.originStory}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Cross-Pantheon Parallels */}
              {deity.crossPantheonParallels &&
                deity.crossPantheonParallels.length > 0 && (
                  <Card className="">
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
                        {deity.crossPantheonParallels.map((parallel) => (
                          <li
                            key={parallel.deityId}
                            className="border-l-2 border-gold/30 pl-4"
                          >
                            {(() => {
                              const relatedDeity = deityReferenceMap.get(
                                normalizeDeityReference(parallel.deityId),
                              );

                              return (
                                <>
                                  <div className="flex items-baseline gap-2">
                                    {relatedDeity ? (
                                      <Link
                                        href={`/deities/${relatedDeity.slug}`}
                                        className="text-gold hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                                      >
                                        {relatedDeity.name}
                                      </Link>
                                    ) : (
                                      <span className="font-medium text-foreground">
                                        {formatSlugAsTitle(
                                          normalizeDeityReference(
                                            parallel.deityId,
                                          ),
                                        )}
                                      </span>
                                    )}
                                    <span className="text-muted-foreground text-sm">
                                      ({parallel.pantheonId})
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground text-sm mt-1">
                                    {parallel.note}
                                  </p>
                                </>
                              );
                            })()}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Primary Source Excerpts (with original language toggle) */}
              {deity.primarySourceExcerpts &&
                deity.primarySourceExcerpts.length > 0 && (
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2 text-xl">
                        <ScrollText className="h-5 w-5 text-gold" />
                        Ancient Sources
                      </CardTitle>
                      <CardDescription>
                        Original texts with translations - toggle to see the
                        original language
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SourceExcerptsList
                        excerpts={deity.primarySourceExcerpts}
                      />
                    </CardContent>
                  </Card>
                )}

              {/* Primary Sources (simple quotes) */}
              {deity.primarySources &&
                deity.primarySources.length > 0 &&
                !deity.primarySourceExcerpts?.length && (
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2 text-xl">
                        <BookOpen className="h-5 w-5 text-gold" />
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
                            key={`${source.source}-${index}`}
                            className="border-l-4 border-gold/30 pl-4 py-2 bg-muted/50 rounded-r-lg"
                          >
                            <p className="text-foreground/80 italic leading-relaxed">
                              &ldquo;{source.text}&rdquo;
                            </p>
                            <footer className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">
                                {source.source}
                              </span>
                              {source.date && (
                                <span className="ml-2 text-muted-foreground/70">
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

              {deity.sources && deity.sources.length > 0 && (
                <EntityPlainSourcesList lines={deity.sources} variant="deity" />
              )}

              {/* Worship & Cult */}
              {deity.worship &&
                (deity.worship.temples?.length ||
                  deity.worship.festivals?.length ||
                  deity.worship.practices) && (
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-gold" />
                        Worship & Cult
                      </CardTitle>
                      <CardDescription>
                        How {deity.name} was venerated in ancient times
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {deity.worship.temples &&
                        deity.worship.temples.length > 0 && (
                          <div>
                            <h4 className="font-medium flex items-center gap-2 text-foreground mb-3">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              Sacred Temples
                            </h4>
                            <ul className="space-y-2">
                              {deity.worship.temples.map((temple) => (
                                <li
                                  key={temple}
                                  className="text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-gold mt-1">
                                    &#8226;
                                  </span>
                                  {temple}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {deity.worship.festivals &&
                        deity.worship.festivals.length > 0 && (
                          <div>
                            <h4 className="font-medium flex items-center gap-2 text-foreground mb-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              Festivals & Celebrations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {deity.worship.festivals.map((festival) => (
                                <Badge
                                  key={festival}
                                  variant="outline"
                                  className="border-gold/30 text-gold"
                                >
                                  {festival}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {deity.worship.practices && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">
                            Worship Practices
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
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
                  <Card className="">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-gold" />
                        Domains
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {deity.domain.map((d) => (
                          <Badge
                            key={d}
                            variant="secondary"
                            className="bg-gold/10 text-gold"
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {deity.symbols && deity.symbols.length > 0 && (
                  <Card className="">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-gold" />
                        Symbols
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {deity.symbols.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="border-gold/30"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Related Deities */}
          <RelatedDeities deityId={deity.id} pantheonId={deity.pantheonId} />

          {/* Interactive Stories featuring this deity */}
          <DeityStoryRecommendations
            deityId={deity.id}
            deityName={deity.name}
          />

          {/* Family Tree */}
          {deityRelationships.length > 0 && (
            <Card className="">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Network className="h-5 w-5 text-gold" />
                  Family Tree
                </CardTitle>
                <CardDescription>
                  Explore {deity.name}&apos;s relationships with other deities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FamilyTreeVisualization
                  deities={allDeities}
                  relationships={deityRelationships}
                  focusDeityId={deity.id}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
