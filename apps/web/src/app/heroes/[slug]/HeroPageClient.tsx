"use client";

import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { BookOpen, Scroll, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { PronunciationDisplay } from "@/components/ui/pronunciation";
import { EditorialByline } from "@/components/content/EditorialByline";
import { DeityJsonLd } from "@/components/seo/JsonLd";
import { AppearsIn } from "@/components/mythology/AppearsIn";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { normalizeHeroReference } from "@/lib/heroes";
import { normalizeDeityReference } from "@/lib/deities";
import heroesData from "@/data/heroes.json";
import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";

interface Pronunciation {
  ipa: string;
  phonetic: string;
}

interface Parentage {
  divineParentId?: string;
  divineParentName?: string;
  mortalParentName?: string;
  note?: string;
}

interface CrossParallel {
  pantheonId: string;
  refId: string;
  kind: "hero" | "deity";
  note: string;
}

interface Hero {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  gender: string | null;
  alternateNames?: string[];
  description: string;
  detailedBio?: string;
  parentage?: Parentage;
  keyDeeds?: string[];
  fate?: string;
  relatedDeityIds?: string[];
  imageUrl?: string | null;
  pronunciation?: Pronunciation;
  primarySources?: Array<{ text: string; source: string; date?: string }>;
  crossPantheonParallels?: CrossParallel[];
}

interface Deity {
  id: string;
  slug: string;
  name: string;
}

interface Pantheon {
  id: string;
  name: string;
}

function formatSlugAsTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function HeroPageClient({ slug }: { slug: string }) {
  const allHeroes = heroesData as Hero[];
  const allDeities = deitiesData as Deity[];
  const pantheons = pantheonsData as Pantheon[];
  const hero =
    allHeroes.find((item) => item.id === slug || item.slug === slug) ?? null;

  if (!hero) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <h1 className="sr-only">{formatSlugAsTitle(slug)}</h1>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Hero Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The hero you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/heroes"
            className="text-gold hover:underline mt-4 inline-block"
          >
            View all heroes
          </Link>
        </div>
      </div>
    );
  }

  const deityById = (id: string) =>
    allDeities.find(
      (d) => normalizeDeityReference(d.id) === normalizeDeityReference(id),
    );
  const heroById = (id: string) =>
    allHeroes.find(
      (h) => normalizeHeroReference(h.id) === normalizeHeroReference(id),
    );
  const pantheonName = (pantheonId: string) =>
    pantheons.find((p) => p.id === pantheonId)?.name ??
    formatSlugAsTitle(pantheonId.replace(/-pantheon$/, ""));

  const divineParent = hero.parentage?.divineParentId
    ? deityById(hero.parentage.divineParentId)
    : undefined;

  return (
    <div className="min-h-screen">
      <DeityJsonLd
        name={hero.name}
        description={
          hero.description || `${hero.name} - hero from ancient mythology`
        }
        alternateNames={hero.alternateNames}
        url={`/heroes/${hero.slug}`}
        image={hero.imageUrl || undefined}
      />

      {/* Hero header */}
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          {hero.imageUrl ? (
            <Image
              src={hero.imageUrl}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-top scale-105 opacity-35 blur-[2px] motion-safe:animate-none"
              aria-hidden
            />
          ) : null}
          <div
            className="absolute inset-0 bg-linear-to-br from-midnight/90 via-midnight/75 to-midnight/55"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(10,10,25,0.92) 0%, ${getPantheonColor(hero.pantheonId)}33 55%, rgba(10,10,25,0.85) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-midnight via-transparent to-midnight/40" />
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 relative z-10">
          <Link
            href="/heroes"
            className="text-sm text-parchment/70 hover:text-parchment mb-8 inline-block"
          >
            ← Back to Heroes
          </Link>

          <div className="grid gap-10 md:grid-cols-[minmax(0,14rem)_1fr] md:items-end">
            <figure className="relative mx-auto w-full max-w-[14rem] overflow-hidden border border-gold/30 shadow-2xl">
              <div className="aspect-3/4 relative bg-midnight flex items-center justify-center">
                {hero.imageUrl ? (
                  <Image
                    src={hero.imageUrl}
                    alt={hero.name}
                    width={768}
                    height={1024}
                    sizes="14rem"
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <span className="font-serif text-7xl text-gold/70">
                    {hero.name.charAt(0)}
                  </span>
                )}
              </div>
            </figure>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-gold/80">
                {pantheonName(hero.pantheonId)} tradition
              </p>
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h1 className="page-title text-gold-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                      {hero.name}
                    </h1>
                    {hero.pronunciation && (
                      <PronunciationDisplay
                        pronunciation={hero.pronunciation}
                        className="text-parchment/75 hover:text-parchment"
                      />
                    )}
                  </div>
                  {hero.alternateNames && hero.alternateNames.length > 0 && (
                    <p className="mt-2 text-sm font-light text-parchment/70">
                      Also known as: {hero.alternateNames.join(", ")}
                    </p>
                  )}
                  {hero.description && (
                    <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-parchment/85 md:text-lg">
                      {hero.description}
                    </p>
                  )}
                  <EditorialByline className="mt-4 max-w-2xl" tone="light" />
                </div>
                <div className="flex shrink-0 gap-2">
                  <BookmarkButton
                    type="hero"
                    id={hero.id}
                    size="lg"
                    variant="light"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-12">
          {/* Detailed Bio */}
          <section className="max-w-[68ch]">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-5 border-l-4 border-gold pl-4">
              About {hero.name}
            </h2>
            {hero.detailedBio ? (
              <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-gold-text prose-a:text-gold dark:prose-a:text-gold-light max-w-none leading-relaxed [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:text-gold">
                <ReactMarkdown>{hero.detailedBio}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed text-lg">
                {hero.description}
              </p>
            )}
          </section>

          {/* Parentage */}
          {hero.parentage && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                Parentage
              </h2>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                {hero.parentage.divineParentId && (
                  <li>
                    Divine parent:{" "}
                    {divineParent ? (
                      <Link
                        href={`/deities/${divineParent.slug}`}
                        className="text-foreground font-medium hover:text-gold transition-colors"
                      >
                        {divineParent.name}
                      </Link>
                    ) : (
                      hero.parentage.divineParentName
                    )}
                  </li>
                )}
                {!hero.parentage.divineParentId &&
                  hero.parentage.divineParentName && (
                    <li>Divine parent: {hero.parentage.divineParentName}</li>
                  )}
                {hero.parentage.mortalParentName && (
                  <li>Mortal parent: {hero.parentage.mortalParentName}</li>
                )}
                {hero.parentage.note && (
                  <li className="text-sm italic">{hero.parentage.note}</li>
                )}
              </ul>
            </section>
          )}

          {/* Key Deeds */}
          {hero.keyDeeds && hero.keyDeeds.length > 0 && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" />
                Key Deeds
              </h2>
              <ul className="space-y-2">
                {hero.keyDeeds.map((deed) => (
                  <li
                    key={deed}
                    className="text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-gold mt-1">&#8226;</span>
                    {deed}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Fate */}
          {hero.fate && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Fate
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {hero.fate}
              </p>
            </section>
          )}

          {/* Cross-Pantheon / Cross-Hero Parallels */}
          {hero.crossPantheonParallels &&
            hero.crossPantheonParallels.length > 0 && (
              <section className="max-w-[68ch]">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4 flex items-center gap-2">
                  Parallels In Other Traditions
                </h2>
                <p className="text-muted-foreground text-sm mb-5 pl-5">
                  Similar heroes and figures across mythologies
                </p>
                <ul className="space-y-4">
                  {hero.crossPantheonParallels.map((parallel) => {
                    const target =
                      parallel.kind === "hero"
                        ? heroById(parallel.refId)
                        : deityById(parallel.refId);
                    const href =
                      parallel.kind === "hero"
                        ? `/heroes/${target?.slug ?? parallel.refId}`
                        : `/deities/${target?.slug ?? parallel.refId}`;
                    return (
                      <li
                        key={`${parallel.pantheonId}-${parallel.refId}`}
                        className="border-l-2 pl-4"
                        style={{
                          borderColor: getPantheonColor(parallel.pantheonId),
                        }}
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <Link
                            href={href}
                            className="font-medium text-foreground hover:text-gold transition-colors"
                          >
                            {target?.name ?? formatSlugAsTitle(parallel.refId)}
                          </Link>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            {pantheonName(parallel.pantheonId)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                          {parallel.note}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

          {/* Primary Sources */}
          {hero.primarySources && hero.primarySources.length > 0 && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gold" />
                Primary Sources
              </h2>
              <p className="text-muted-foreground text-sm mb-5 pl-5">
                Historical texts and references
              </p>
              <div className="space-y-6">
                {hero.primarySources.map((source, index) => (
                  <blockquote
                    key={`${source.source}-${index}`}
                    className="border-l-4 border-gold/30 pl-4 py-2 bg-muted/50 rounded-r-lg"
                  >
                    <p className="text-foreground/80 italic leading-relaxed">
                      &ldquo;{source.text}&rdquo;
                    </p>
                    <footer className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">{source.source}</span>
                      {source.date && (
                        <span className="ml-2 text-muted-foreground">
                          ({source.date})
                        </span>
                      )}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* Appears In — derived from sources.json */}
          <AppearsIn entityId={hero.id} kind="hero" />

          {/* Related Deities */}
          {hero.relatedDeityIds && hero.relatedDeityIds.length > 0 && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Scroll className="h-5 w-5 text-gold" />
                Related Deities
              </h2>
              <div className="flex flex-wrap gap-2">
                {hero.relatedDeityIds.map((id) => {
                  const related = deityById(id);
                  if (!related) return null;
                  return (
                    <Link key={id} href={`/deities/${related.slug}`}>
                      <Badge
                        variant="outline"
                        className="border-gold/30 text-gold-text hover:bg-gold/10"
                      >
                        {related.name}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
