import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ExternalLink,
  Scroll,
  Users,
  Quote,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import sources from "@/data/sources.json";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import storiesData from "@/data/stories.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { matchesSource } from "@/lib/source-matching";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { SourceExcerpt } from "@/components/sources/SourceExcerpt";
import { SourceWorkJsonLd } from "@/components/seo/JsonLd";

interface SourceCharacter {
  id: string;
  kind: "deity" | "hero";
  role: string;
  where: string;
}

interface SourceKeyScene {
  title: string;
  where: string;
  summary: string;
}

interface Source {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  type: string;
  language?: string;
  description: string;
  translators?: Array<{ name: string; year: number }>;
  externalUrl?: string;
  characters?: SourceCharacter[];
  keyScenes?: SourceKeyScene[];
  readingOrder?: string;
}

interface SourceExcerptRecord {
  text: string;
  translation: string;
  source: string;
  sourceId?: string;
  lineNumbers?: string;
  translator?: string;
  originalLanguage?: string;
  quoteStatus: "direct-quotation" | "editorial-paraphrase" | "unverified";
  verification: "verified" | "source-and-locator-verified" | "not-verified";
  sourceUrl: string;
  edition: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  citationSources?: Array<{
    title?: string;
    source?: string;
    sourceId?: string;
  }>;
  primarySourceExcerpts?: SourceExcerptRecord[];
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  primarySourceExcerpts?: SourceExcerptRecord[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveSource(slug: string): Source | undefined {
  return (sources as Source[]).find((s) => s.id === slug);
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

export async function generateStaticParams() {
  return (sources as Source[]).map((source) => ({ slug: source.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = resolveSource(slug);

  if (!source) {
    return generateNotFoundMetadata(
      "Source Not Found",
      "The requested source could not be found.",
    );
  }

  return generateBaseMetadata({
    title: `${source.title} - Source & Reference`,
    description: source.description.slice(0, 160),
    url: `/sources/${source.id}`,
    keywords: [source.title, source.author ?? "", "mythology source"].filter(
      Boolean,
    ),
    articleSection: "Sources",
  });
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default async function SourcePage({ params }: PageProps) {
  const { slug } = await params;
  const source = resolveSource(slug);

  if (!source) {
    notFound();
  }

  const allStories = storiesData as Story[];
  const allDeities = deities as Deity[];

  const heroCharacters = (source.characters ?? []).filter(
    (c) => c.kind === "hero",
  );
  const deityCharacters = (source.characters ?? []).filter(
    (c) => c.kind === "deity",
  );

  const heroById = (id: string) => heroes.find((h) => h.id === id);
  const deityById = (id: string) => deities.find((d) => d.id === id);

  // Find linked excerpts from stories
  const sourceExcerpts: Array<
    SourceExcerptRecord & {
      entityTitle: string;
      entitySlug: string;
      entityType: "story" | "deity";
    }
  > = [];
  for (const story of allStories) {
    for (const excerpt of story.primarySourceExcerpts ?? []) {
      if (matchesSource(excerpt, source)) {
        sourceExcerpts.push({
          ...excerpt,
          entityTitle: story.title,
          entitySlug: story.slug,
          entityType: "story",
        });
      }
    }
  }
  for (const deity of allDeities) {
    for (const excerpt of deity.primarySourceExcerpts ?? []) {
      if (matchesSource(excerpt, source)) {
        sourceExcerpts.push({
          ...excerpt,
          entityTitle: deity.name,
          entitySlug: deity.slug,
          entityType: "deity",
        });
      }
    }
  }

  // Find linked stories
  const linkedStories = allStories.filter((story) => {
    const hasExcerpt = story.primarySourceExcerpts?.some((excerpt) =>
      matchesSource(excerpt, source),
    );
    return (
      hasExcerpt ||
      story.citationSources?.some((citation) => matchesSource(citation, source))
    );
  });

  const characterLinks = [
    ...heroCharacters.flatMap((c) => {
      const hero = heroById(c.id);
      return hero ? [{ name: hero.name, url: `/heroes/${hero.slug}` }] : [];
    }),
    ...deityCharacters.flatMap((c) => {
      const deity = deityById(c.id);
      return deity ? [{ name: deity.name, url: `/deities/${deity.slug}` }] : [];
    }),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SourceWorkJsonLd
        title={source.title}
        description={source.description}
        url={`/sources/${source.id}`}
        author={source.author}
        language={source.language}
        translators={source.translators?.map((t) => t.name)}
        characters={characterLinks}
      />
      <div className="page-shell max-w-4xl">
        <Breadcrumbs />
        <header className="mt-8 border-b border-border pb-8">
          <p className="mb-3 text-sm uppercase tracking-widest text-gold-text">
            Source record
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="page-title text-foreground">{source.title}</h1>
            <BookmarkButton type="source" id={source.id} />
          </div>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {source.author && <span>{source.author}</span>}
            {source.year && <span>{source.year}</span>}
            {source.language && <span>{source.language}</span>}
          </p>
          <p className="mt-6 max-w-2xl font-body text-xl leading-relaxed text-foreground">
            {source.description}
          </p>
          {source.externalUrl && (
            <a
              href={source.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read ${source.title} online (opens in new tab)`}
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-medium text-gold-text underline underline-offset-4"
            >
              Open source{" "}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {source.translators && source.translators.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <h2 className="mb-2 text-sm font-medium text-foreground">
                Translations
              </h2>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {source.translators.map((translator) => (
                  <li key={translator.name}>
                    {translator.name} ({translator.year})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>
        <div className="mt-8 space-y-8">
          {/* Reading Guidance / Where To Start */}
          {source.readingOrder && (
            <Card className="border-gold/20 bg-card/60 p-6 shadow-sm">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-foreground font-serif text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Recommended Reading Order
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {source.readingOrder}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Canonical Characters / Figures */}
          {(heroCharacters.length > 0 || deityCharacters.length > 0) && (
            <Card className="border-gold/20 bg-card/70 p-6 md:p-8 shadow-sm">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-foreground text-xl font-serif flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  Canonical Figures in this Text
                </CardTitle>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Key heroes and divinities who feature prominently across the
                  chapters of this work
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {/* Heroes */}
                {heroCharacters.length > 0 && (
                  <div>
                    <h3 className="text-gold-text font-serif text-sm uppercase tracking-wider mb-3">
                      Heroes &amp; Mortals
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {heroCharacters.map((c) => {
                        const hero = heroById(c.id);
                        return (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-xl border border-gold/20 bg-background/60 flex items-start gap-3 hover:border-gold/40 transition-colors"
                          >
                            <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-gold/30 bg-midnight">
                              {hero?.imageUrl ? (
                                <Image
                                  src={hero.imageUrl}
                                  alt={hero.name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gold-text font-serif text-lg">
                                  {hero ? hero.name.charAt(0) : c.id.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              {hero ? (
                                <Link
                                  href={`/heroes/${hero.slug}`}
                                  className="font-medium text-foreground text-sm hover:text-gold-text transition-colors block truncate"
                                >
                                  {hero.name}
                                </Link>
                              ) : (
                                <span className="font-medium text-foreground text-sm block truncate">
                                  {c.id}
                                </span>
                              )}
                              <p className="text-muted-foreground text-xs leading-snug mt-1">
                                {c.role}
                              </p>
                              <span className="text-[11px] text-gold-text block mt-1">
                                {c.where}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Deities */}
                {deityCharacters.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-gold-text font-serif text-sm uppercase tracking-wider mb-3">
                      Deities &amp; Immortals
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {deityCharacters.map((c) => {
                        const deity = deityById(c.id);
                        return (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-xl border border-gold/20 bg-background/60 flex items-start gap-3 hover:border-gold/40 transition-colors"
                          >
                            <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-gold/30 bg-midnight">
                              {deity?.imageUrl ? (
                                <Image
                                  src={deity.imageUrl}
                                  alt={deity.name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gold-text font-serif text-lg">
                                  {deity
                                    ? deity.name.charAt(0)
                                    : c.id.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              {deity ? (
                                <Link
                                  href={`/deities/${deity.slug}`}
                                  className="font-medium text-foreground text-sm hover:text-gold-text transition-colors block truncate"
                                >
                                  {deity.name}
                                </Link>
                              ) : (
                                <span className="font-medium text-foreground text-sm block truncate">
                                  {c.id}
                                </span>
                              )}
                              <p className="text-muted-foreground text-xs leading-snug mt-1">
                                {c.role}
                              </p>
                              <span className="text-[11px] text-gold-text block mt-1">
                                {c.where}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Canonical Scenes */}
          {source.keyScenes && source.keyScenes.length > 0 && (
            <Card className="border-gold/20 bg-card/70 p-6 md:p-8 shadow-sm">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-foreground text-xl font-serif flex items-center gap-2">
                  <Scroll className="h-5 w-5 text-gold" />
                  Key Dramatic Scenes
                </CardTitle>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Pivotal passages and mythological turning points recorded in
                  this canon
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-4">
                  {source.keyScenes.map((scene, index) => (
                    <li
                      key={scene.title}
                      className="border-l-2 border-gold/40 pl-4 py-1"
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-serif text-xs font-semibold text-gold-text">
                          {ROMAN_NUMERALS[index] || `${index + 1}.`}
                        </span>
                        <h4 className="font-medium text-foreground text-base">
                          {scene.title}
                        </h4>
                        <span className="text-xs text-gold-text font-medium">
                          ({scene.where})
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                        {scene.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Preserved Dual-Language Ancient Passages */}
          {sourceExcerpts.length > 0 && (
            <Card className="border-gold/20 bg-card/70 p-6 md:p-8 shadow-sm">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-foreground text-xl font-serif flex items-center gap-2">
                  <Quote className="h-5 w-5 text-gold" />
                  Source Passages and Editorial Notes
                </CardTitle>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Direct quotations are distinguished from editorial paraphrases
                  and records awaiting verification.
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {sourceExcerpts.map((excerpt, index) => (
                  <div
                    key={`${excerpt.entitySlug}-${index}`}
                    className="space-y-3"
                  >
                    <SourceExcerpt excerpt={excerpt} />
                    <Link
                      href={`/${excerpt.entityType === "story" ? "stories" : "deities"}/${excerpt.entitySlug}`}
                      className="inline-flex min-h-11 items-center gap-1 text-sm text-gold-text underline underline-offset-4"
                    >
                      Featured in {excerpt.entityTitle} &rarr;
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Linked Stories in Mythos Atlas */}
          {linkedStories.length > 0 && (
            <Card className="border-gold/20 bg-card/70 p-6 md:p-8 shadow-sm">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-foreground text-xl font-serif flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gold" />
                  Stories Sourced from this Work
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  {linkedStories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.slug}`}
                      className="p-3.5 rounded-xl border border-gold/20 bg-background/60 hover:border-gold/40 transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="font-medium text-sm text-foreground group-hover:text-gold-text transition-colors truncate">
                          {story.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {story.summary ||
                            story.description ||
                            "Read full narrative"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gold/60 group-hover:text-gold-text group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
