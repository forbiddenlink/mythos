"use client";

import { useContext, useEffect, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollText, Play, ArrowDown, Headphones } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ExportIconButton } from "@/components/ui/export-button";
import { ShareButton } from "@/components/sharing/ShareButton";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

import { ProgressContext } from "@/providers/progress-provider";
import { RelatedContent } from "@/components/related-content";
import { MythVariants } from "@/components/stories/MythVariants";
import { VersionMatrix } from "@/components/stories/VersionMatrix";
import type { MythVersions } from "@/lib/myth-versions";
import { EditorialByline } from "@/components/content/EditorialByline";
import { StoryNarrator } from "@/components/stories/StoryNarrator";
import {
  SourceExcerptsList,
  ReferencesList,
  CitationSourcesList,
  EntityPlainSourcesList,
  type PrimarySourceExcerpt,
  type FurtherReadingReference,
  type CitationSourceItem,
} from "@/components/sources";

function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return context;
}

// Component to track story reads - separated to avoid hook call issues with early returns
function StoryProgressTracker({
  storyId,
  pantheonId,
}: {
  storyId: string;
  pantheonId: string;
}) {
  const { trackStoryRead, trackPantheonExplore } = useProgress();

  useEffect(() => {
    if (storyId) {
      trackStoryRead(storyId);
    }
    if (pantheonId) {
      trackPantheonExplore(pantheonId);
    }
  }, [storyId, pantheonId, trackStoryRead, trackPantheonExplore]);

  return null;
}

interface MythVariant {
  source: string;
  date?: string;
  difference: string;
  note?: string;
}

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl?: string | null;
  fullNarrative?: string | null;
  keyExcerpts?: string;
  category: string;
  moralThemes?: string[];
  culturalSignificance?: string;
  featuredDeities?: string[];
  featuredLocations?: string[];
  relatedStories?: string[];
  variants?: MythVariant[];
  citationSources?: CitationSourceItem[];
  primarySourceExcerpts?: PrimarySourceExcerpt[];
  furtherReading?: FurtherReadingReference[];
  /** Optional editorial bibliography lines (plain text). */
  sources?: string[];
}

export interface StoryPageClientProps {
  story: Story;
  pantheon?: { name: string; slug: string };
  featuredDeitiesData: Array<{
    id: string;
    name: string;
    slug: string;
    domain?: string[];
    imageUrl?: string;
  }>;
  featuredLocationsData: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
  }>;
  relatedStoriesData: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
  }>;
  museumObjects: ReactNode;
  versions?: MythVersions | null;
}

// Stories that have cinematic versions available
const CINEMATIC_STORIES = ["ragnarok", "titanomachy"];

export function StoryPageClient({
  story,
  pantheon,
  featuredDeitiesData,
  featuredLocationsData,
  relatedStoriesData,
  museumObjects,
  versions = null,
}: StoryPageClientProps) {
  const hasRelatedContent =
    featuredDeitiesData.length > 0 ||
    featuredLocationsData.length > 0 ||
    relatedStoriesData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <StoryProgressTracker storyId={story.id} pantheonId={story.pantheonId} />
      <ArticleJsonLd
        headline={story.title}
        description={story.summary}
        section={story.category}
        tags={story.moralThemes}
        url={`/stories/${story.slug}`}
      />
      <div className="container mx-auto max-w-6xl px-4 pb-10 pt-6 sm:pt-10">
        <Breadcrumbs />
        <header className="mt-8 grid gap-8 lg:grid-cols-5 lg:items-center lg:gap-12">
          <div
            className={
              story.imageUrl ? "lg:col-span-3" : "lg:col-span-5 max-w-3xl"
            }
          >
            <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gold-text">
              {pantheon && (
                <Link
                  href={`/pantheons/${pantheon.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {pantheon.name}
                </Link>
              )}
              <span aria-hidden="true">/</span>
              <span className="capitalize">{story.category}</span>
            </p>
            <h1 className="page-title text-foreground">{story.title}</h1>
            <p className="mt-5 max-w-2xl font-body text-xl leading-relaxed text-muted-foreground">
              {story.summary}
            </p>
            <nav
              aria-label="On this story page"
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm"
            >
              <a
                href="#story-narrative"
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-gold-text underline underline-offset-4"
              >
                Read the story{" "}
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#story-sources"
                className="inline-flex min-h-11 items-center text-foreground underline underline-offset-4"
              >
                Sources and context
              </a>
              {versions && (
                <a
                  href="#version-matrix-title"
                  className="inline-flex min-h-11 items-center text-foreground underline underline-offset-4"
                >
                  Compare tellings
                </a>
              )}
            </nav>
          </div>
          {story.imageUrl && (
            <figure className="lg:col-span-2">
              <div className="relative aspect-video overflow-hidden border border-border bg-muted lg:aspect-square">
                <Image
                  src={story.imageUrl}
                  alt={`Illustration for ${story.title}`}
                  fill
                  sizes="(min-width: 1024px) 440px, (max-width: 640px) 100vw, 640px"
                  className="object-cover object-center"
                  priority
                  fetchPriority="high"
                />
              </div>
              <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Story illustration. Historical objects are identified separately
                with their museum records.
              </figcaption>
            </figure>
          )}
        </header>
      </div>

      <div className="container mx-auto max-w-4xl px-4 pb-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
          <p className="text-sm text-muted-foreground">
            An editorial retelling
          </p>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Save or share this story"
          >
            <BookmarkButton type="story" id={story.id} />
            <ShareButton
              title={`${story.title} - Mythos Atlas`}
              text={story.summary}
              url={`https://mythosatlas.com/stories/${story.slug}`}
            />
            <ExportIconButton
              type="story"
              data={{
                title: story.title,
                summary: story.summary,
                fullNarrative: story.fullNarrative,
                category: story.category,
                moralThemes: story.moralThemes,
                culturalSignificance: story.culturalSignificance,
                pantheonId: story.pantheonId,
                featuredDeities: story.featuredDeities,
              }}
              variant="ghost"
            />
          </div>
        </div>

        <div className="space-y-12">
          {/* Full Narrative — borderless editorial */}
          {story.fullNarrative ? (
            <section id="story-narrative" className="max-w-[68ch] scroll-mt-24">
              <h2 className="chapter-mark font-serif text-2xl font-semibold text-foreground mb-5 border-l-4 border-gold pl-4">
                Editorial narrative
              </h2>
              <div className="illuminated-tale prose dark:prose-invert prose-gold max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-gold-text prose-strong:text-foreground prose-blockquote:border-l-gold/40 prose-li:marker:text-gold/50">
                <ReactMarkdown>{story.fullNarrative}</ReactMarkdown>
              </div>
            </section>
          ) : (
            <section id="story-narrative" className="max-w-[68ch] scroll-mt-24">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-5 border-l-4 border-gold pl-4">
                Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                {story.summary}
              </p>
            </section>
          )}

          <details className="border-y border-border py-4">
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-medium text-foreground">
              <Headphones
                className="h-4 w-4 text-gold-text"
                aria-hidden="true"
              />
              Listen or change reading mode
            </summary>
            <div className="mt-4 space-y-4">
              <StoryNarrator
                text={story.fullNarrative || story.summary}
                defaultCompact
              />
              <div className="flex flex-wrap gap-4 text-sm">
                {story.fullNarrative && (
                  <Link
                    href={`/stories/${story.slug}/read`}
                    className="inline-flex min-h-11 items-center gap-2 text-gold-text underline underline-offset-4"
                  >
                    <ScrollText className="h-4 w-4" aria-hidden="true" />
                    Cinematic reading
                  </Link>
                )}
                {CINEMATIC_STORIES.includes(story.slug) && (
                  <Link
                    href={`/stories/${story.slug}/cinematic`}
                    className="inline-flex min-h-11 items-center gap-2 text-gold-text underline underline-offset-4"
                  >
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Scene-by-scene version
                  </Link>
                )}
              </div>
            </div>
          </details>

          {/* Key Excerpts */}
          {story.keyExcerpts && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Story highlights
              </h2>
              <p className="border-l-2 border-gold/40 bg-muted/40 px-5 py-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                {story.keyExcerpts}
              </p>
            </section>
          )}

          {/* Moral Themes */}
          {story.moralThemes && story.moralThemes.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Themes
              </h2>
              <ul className="flex flex-wrap gap-2" aria-label="Moral themes">
                {story.moralThemes.map((theme) => (
                  <li
                    key={theme}
                    className="border border-gold/30 bg-gold/10 px-3 py-1 text-sm text-gold-text"
                  >
                    {theme}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Cultural Significance */}
          {story.culturalSignificance && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Cultural Significance
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                {story.culturalSignificance}
              </p>
            </section>
          )}

          <section
            id="story-sources"
            aria-labelledby="story-sources-title"
            className="scroll-mt-24 border-t border-border pt-8"
          >
            <h2
              id="story-sources-title"
              className="page-section-title mb-4 text-foreground"
            >
              Sources and context
            </h2>
            <EditorialByline tone="dark" />
          </section>

          {/* Structured citation references (from JSON citationSources) */}
          {story.citationSources && story.citationSources.length > 0 && (
            <CitationSourcesList
              sources={story.citationSources}
              variant="story"
            />
          )}

          {versions && <VersionMatrix versions={versions} />}

          {/* Myth Variants */}
          {story.variants && story.variants.length > 0 && (
            <MythVariants variants={story.variants} />
          )}

          {/* Primary Source Excerpts */}
          {story.primarySourceExcerpts &&
            story.primarySourceExcerpts.length > 0 && (
              <Card className="border-border bg-card/50 shadow-none">
                <CardHeader>
                  <CardTitle className="text-foreground text-2xl font-serif flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-gold" />
                    Ancient Sources
                  </CardTitle>
                  <CardDescription>
                    Quotations and source notes. Verification status is shown
                    for each passage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SourceExcerptsList excerpts={story.primarySourceExcerpts} />
                </CardContent>
              </Card>
            )}

          {/* Further Reading */}
          {museumObjects}
          {story.furtherReading && story.furtherReading.length > 0 && (
            <ReferencesList
              references={story.furtherReading}
              title="Further Reading"
              showDescriptions={false}
              collapsible={true}
              defaultExpanded={false}
            />
          )}

          {story.sources && story.sources.length > 0 && (
            <EntityPlainSourcesList lines={story.sources} variant="story" />
          )}

          {/* Related Content Section */}
          {hasRelatedContent && (
            <Card className="border-border bg-card/50 shadow-none">
              <CardHeader>
                <CardTitle className="text-foreground text-2xl font-serif">
                  Explore Further
                </CardTitle>
                <CardDescription>
                  Characters, locations, and stories connected to this tale.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RelatedContent
                  type="story"
                  currentId={story.id}
                  relatedDeities={featuredDeitiesData}
                  relatedLocations={featuredLocationsData}
                  relatedStories={relatedStoriesData}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-center pt-8">
            <Link
              href="/stories"
              className="px-6 py-3 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold-text transition-colors"
            >
              ← Back to All Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
