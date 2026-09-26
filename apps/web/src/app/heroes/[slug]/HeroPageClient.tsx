"use client";

import Link from "next/link";
import Image from "next/image";
import type { MuseumObject } from "@/lib/museum";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import ReactMarkdown from "react-markdown";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";
import { Scroll, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { PronunciationDisplay } from "@/components/ui/pronunciation";
import { EditorialByline } from "@/components/content/EditorialByline";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { AppearsIn } from "@/components/mythology/AppearsIn";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { normalizeDeityReference } from "@/lib/deity-reference";

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

export interface HeroPageHero {
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

type Hero = HeroPageHero;

interface FigureRef {
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

export function HeroPageClient({
  slug,
  hero,
  deities: allDeities,
  heroes: allHeroes,
  pantheons,
  museumObjects = [],
  museumPortrait = null,
}: {
  slug: string;
  /** The hero record, resolved on the server (null renders "not found"). */
  hero: Hero | null;
  /** id / slug / name references for linking parents and parallels. */
  deities: FigureRef[];
  heroes: FigureRef[];
  pantheons: Pantheon[];
  museumObjects?: MuseumObject[];
  museumPortrait?: MuseumObject | null;
}) {
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
      (h) => normalizeDeityReference(h.id) === normalizeDeityReference(id),
    );
  const pantheonName = (pantheonId: string) =>
    pantheons.find((p) => p.id === pantheonId)?.name ??
    formatSlugAsTitle(pantheonId.replace(/-pantheon$/, ""));

  const divineParent = hero.parentage?.divineParentId
    ? deityById(hero.parentage.divineParentId)
    : undefined;

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
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
            <figure className="order-last md:order-first relative mx-auto w-full max-w-[14rem] overflow-hidden border border-gold/30 shadow-2xl">
              <div className="aspect-3/4 relative bg-midnight flex items-center justify-center">
                {museumPortrait?.imageUrl ? (
                  <Image
                    src={museumPortrait.imageUrl}
                    alt={museumPortrait.imageAlt || museumPortrait.title}
                    fill
                    sizes="14rem"
                    unoptimized
                    className="object-contain p-3"
                    priority
                  />
                ) : hero.imageUrl ? (
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
              <figcaption className="bg-midnight px-3 py-2 text-xs text-parchment/85">
                {museumPortrait ? (
                  <>
                    <span className="block text-gold mb-1">
                      {museumPortrait.context}
                    </span>
                    <span className="block font-serif text-sm">
                      {museumPortrait.title}
                    </span>
                    <span className="block mt-1">
                      {museumPortrait.date} · {museumPortrait.medium}
                    </span>
                    <a
                      href={museumPortrait.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block underline underline-offset-4 hover:text-parchment"
                    >
                      {museumPortrait.institution} ·{" "}
                      {museumPortrait.accessionNumber}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <span className="block mt-1">
                      {museumPortrait.imageRights}
                    </span>
                  </>
                ) : (
                  <>Editorial illustration of {hero.name}</>
                )}
              </figcaption>
            </figure>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-parchment/85">
                {pantheonName(hero.pantheonId)}
              </p>
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h1 className="page-title text-parchment">{hero.name}</h1>
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
                  <nav
                    aria-label="On this page"
                    className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-sm text-parchment"
                  >
                    <a
                      href="#about"
                      className="inline-flex min-h-11 items-center underline underline-offset-4"
                    >
                      About {hero.name}
                    </a>
                    {hero.primarySources?.length ? (
                      <a
                        href="#source-notes"
                        className="inline-flex min-h-11 items-center underline underline-offset-4"
                      >
                        Source notes
                      </a>
                    ) : null}
                  </nav>
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
        <Breadcrumbs />
        <div className="space-y-12">
          {/* Detailed Bio */}
          <section id="about" className="max-w-[68ch] scroll-mt-24">
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

          <MuseumGallery
            name={hero.name}
            objects={museumObjects.filter(
              (object) => object.id !== museumPortrait?.id,
            )}
          />

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
          <CatalogSourceNotes sources={hero.primarySources} />

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
