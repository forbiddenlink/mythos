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

import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ExportIconButton } from "@/components/ui/export-button";
import { ShareButton } from "@/components/sharing/ShareButton";
import { DeityJsonLd } from "@/components/seo/JsonLd";
import ReactMarkdown from "react-markdown";
import { PronunciationDisplay } from "@/components/ui/pronunciation";
import { EditorialByline } from "@/components/content/EditorialByline";
import { BloodlineTapestry } from "@/components/deities/BloodlineTapestry";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import { normalizeDeityReference } from "@/lib/deities";
import { getPantheonColor } from "@/lib/pantheon-colors";
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
import { LinkedMentions } from "@/components/mythology/LinkedMentions";
import { RosettaWheel } from "@/components/collections/RosettaWheel";
import { MythosMark } from "@/components/icons/mythos-marks";
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
      {/* Hero — per-deity art (portfolio Phase 2), not the shared deity-hero.jpg */}
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          {deity.imageUrl ? (
            <Image
              src={deity.imageUrl}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-top scale-105 opacity-50 blur-[2px] motion-safe:animate-none"
              aria-hidden
            />
          ) : (
            <Image
              src="/deity-hero.jpg"
              alt=""
              width={HERO_IMAGE_WIDTH}
              height={HERO_IMAGE_HEIGHT}
              sizes="100vw"
              className="h-full w-full object-cover"
              aria-hidden
            />
          )}
          <div
            className="absolute inset-0 bg-linear-to-br from-midnight/90 via-midnight/75 to-midnight/55"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(10,10,25,0.92) 0%, ${getPantheonColor(deity.pantheonId)}33 55%, rgba(10,10,25,0.85) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-midnight via-transparent to-midnight/40" />
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 relative z-10">
          <Link
            href="/deities"
            className="text-sm text-parchment/70 hover:text-parchment mb-8 inline-block"
          >
            ← Back to Deities
          </Link>

          <div className="grid gap-10 md:grid-cols-[minmax(0,14rem)_1fr] md:items-end">
            <figure
              className="relative mx-auto w-full max-w-[14rem] overflow-hidden border border-gold/30 shadow-2xl"
              style={{ viewTransitionName: `deity-image-${deity.slug}` }}
            >
              <div className="aspect-3/4 relative bg-midnight">
                {deity.imageUrl ? (
                  <Image
                    src={deity.imageUrl}
                    alt={deity.name}
                    width={DEITY_IMAGE_WIDTH}
                    height={DEITY_IMAGE_HEIGHT}
                    sizes="14rem"
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-7xl text-gold/70">
                      {deity.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </figure>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-gold/80">
                {formatSlugAsTitle(deity.pantheonId.replace(/-pantheon$/, ""))}{" "}
                pantheon
              </p>
              <div
                className="flex flex-wrap items-start gap-4"
                style={{ viewTransitionName: "page-header" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h1 className="shimmer-gold page-title drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                      {deity.name}
                    </h1>
                    {deity.pronunciation && (
                      <PronunciationDisplay
                        pronunciation={deity.pronunciation}
                        className="text-parchment/75 hover:text-parchment"
                      />
                    )}
                  </div>
                  {deity.originalLanguageName && (
                    <p className="mt-2 font-serif text-xl text-parchment/80 md:text-2xl">
                      <OriginalLanguageName
                        data={deity.originalLanguageName}
                        variant="inline"
                        className="text-parchment/90"
                      />
                    </p>
                  )}
                  {deity.alternateNames && deity.alternateNames.length > 0 && (
                    <p className="mt-2 text-sm font-light text-parchment/70">
                      Also known as: {deity.alternateNames.join(", ")}
                    </p>
                  )}
                  {deity.domain && deity.domain.length > 0 && (
                    <ul
                      className="mt-4 flex flex-wrap gap-2"
                      aria-label="Domains"
                    >
                      {deity.domain.map((d) => (
                        <li
                          key={d}
                          className="border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold-light backdrop-blur-sm"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {deity.description && (
                    <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-parchment/85 md:text-lg">
                      {deity.description}
                    </p>
                  )}
                  <EditorialByline className="mt-4 max-w-2xl" tone="light" />
                </div>
                <div className="flex shrink-0 gap-2">
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
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-8">
            <LinkedMentions deityId={deity.id} deityName={deity.name} />

            {/* Content Cards */}
            <div className="space-y-8">
              {/* Detailed Bio (Markdown) or Description */}
              <Card className="border-l-4 border-l-gold shadow-none bg-card/50">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">
                    About {deity.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deity.detailedBio ? (
                    <div className="prose prose-lg prose-slate dark:prose-invert prose-headings:font-serif prose-headings:text-amber-700 dark:prose-headings:text-amber-500 prose-a:text-gold dark:prose-a:text-gold-light max-w-[68ch] leading-relaxed [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:text-gold">
                      <ReactMarkdown>{deity.detailedBio}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="max-w-[68ch] text-muted-foreground leading-relaxed text-lg">
                      {deity.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Origin Story */}
              {deity.originStory && (
                <Card className="shadow-none bg-card/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">
                      Origin Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="max-w-[68ch] text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                      {deity.originStory}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Cross-Pantheon Parallels */}
              {deity.crossPantheonParallels &&
                deity.crossPantheonParallels.length > 0 && (
                  <>
                    <RosettaWheel
                      archetype={
                        deity.domain?.[0] ??
                        formatSlugAsTitle(
                          deity.pantheonId.replace(/-pantheon$/, ""),
                        )
                      }
                      deities={[
                        {
                          name: deity.name,
                          slug: deity.slug,
                          pantheonId: deity.pantheonId,
                        },
                        ...deity.crossPantheonParallels
                          .map((parallel) => {
                            const relatedDeity = deityReferenceMap.get(
                              normalizeDeityReference(parallel.deityId),
                            );
                            if (!relatedDeity) return null;
                            return {
                              name: relatedDeity.name,
                              slug: relatedDeity.slug,
                              pantheonId: parallel.pantheonId,
                            };
                          })
                          .filter(
                            (
                              d,
                            ): d is {
                              name: string;
                              slug: string;
                              pantheonId: string;
                            } => d !== null,
                          ),
                      ]}
                    />
                    <Card className="shadow-none bg-card/50">
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2 text-xl">
                          <MythosMark
                            id="scales"
                            className="h-5 w-5 text-gold"
                          />
                          Cross-Pantheon Parallels
                        </CardTitle>
                        <CardDescription>
                          Similar deities across different mythologies
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {deity.crossPantheonParallels.map((parallel) => {
                            const relatedDeity = deityReferenceMap.get(
                              normalizeDeityReference(parallel.deityId),
                            );
                            const pantheonColor = getPantheonColor(
                              parallel.pantheonId,
                            );
                            const pantheonLabel = formatSlugAsTitle(
                              parallel.pantheonId.replace(/-pantheon$/, ""),
                            );

                            return (
                              <li
                                key={parallel.deityId}
                                className="border-l-2 pl-4"
                                style={{ borderColor: pantheonColor }}
                              >
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                  {relatedDeity ? (
                                    <Link
                                      href={`/deities/${relatedDeity.slug}`}
                                      className="font-medium text-foreground hover:text-gold transition-colors"
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
                                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                                    <span
                                      className="inline-block size-2 rounded-full"
                                      style={{ backgroundColor: pantheonColor }}
                                      aria-hidden
                                    />
                                    {pantheonLabel}
                                  </span>
                                </div>
                                <p className="text-muted-foreground text-sm mt-1">
                                  {parallel.note}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}

              {/* Attestation provenance — confidence derived from corroboration */}
              <div className="reveal-on-scroll">
                <SourceProvenance sources={deity.primarySources} />
              </div>

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

          {/* Bloodline tapestry — at-a-glance genealogy plate */}
          <BloodlineTapestry
            deityId={deity.id}
            deityName={deity.name}
            pantheonId={deity.pantheonId}
          />

          {/* Family Tree */}
          {deityRelationships.length > 0 && (
            <Card className="reveal-on-scroll">
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
