"use client";

import { useContext, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Tag, ScrollText, Volume2, Square, Play } from "lucide-react";
import { HeroMark } from "@/components/icons/hero-mark";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ExportIconButton } from "@/components/ui/export-button";
import { ShareButton } from "@/components/sharing/ShareButton";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { RouteHero } from "@/components/layout/route-hero";

// Lazy load heavy Three.js-based artifact viewer
const ArtifactViewer = dynamic(
  () =>
    import("@/components/artifacts/ArtifactViewer").then((mod) => ({
      default: mod.ArtifactViewer,
    })),
  {
    loading: () => (
      <div className="h-75 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    ),
    ssr: false,
  },
);
import { ProgressContext } from "@/providers/progress-provider";
import { RelatedContent } from "@/components/related-content";
import { MythVariants } from "@/components/stories/MythVariants";
import { EditorialByline } from "@/components/content/EditorialByline";
import deitiesData from "@/data/deities.json";
import locationsData from "@/data/locations.json";
import storiesData from "@/data/stories.json";
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

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain?: string[];
  imageUrl?: string;
}

interface Location {
  id: string;
  name: string;
  locationType?: string;
  imageUrl?: string;
}

interface StoryPageClientProps {
  slug: string;
}

// Stories that have cinematic versions available
const CINEMATIC_STORIES = ["ragnarok", "titanomachy"];

export function StoryPageClient({ slug }: StoryPageClientProps) {
  const { speak, cancel, isSpeaking } = useTextToSpeech();
  const allStories = storiesData as Story[];
  const story = allStories.find((s) => s.slug === slug);

  if (!story) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Story Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The story you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/stories"
            className="text-gold hover:underline mt-4 inline-block"
          >
            View all stories
          </Link>
        </div>
      </div>
    );
  }

  // Look up featured deities by ID
  const featuredDeitiesData = (story.featuredDeities || [])
    .map((deityId) => {
      const deity = (deitiesData as Deity[]).find((d) => d.id === deityId);
      if (!deity) return null;
      return {
        id: deity.id,
        name: deity.name,
        slug: deity.slug,
        domain: deity.domain,
        imageUrl: deity.imageUrl,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Look up featured locations by ID
  const featuredLocationsData = (story.featuredLocations || [])
    .map((locationId) => {
      const location = (locationsData as Location[]).find(
        (l) => l.id === locationId,
      );
      if (!location) return null;
      // Locations don't have a slug field, use id as slug
      return {
        id: location.id,
        name: location.name,
        slug: location.id,
        imageUrl: location.imageUrl,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  // Look up related stories by ID
  const relatedStoriesData = (story.relatedStories || [])
    .map((storyId) => {
      const relatedStory = allStories.find((s) => s.id === storyId);
      if (!relatedStory) return null;
      return {
        id: relatedStory.id,
        title: relatedStory.title,
        slug: relatedStory.slug,
        summary: relatedStory.summary,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const hasRelatedContent =
    featuredDeitiesData.length > 0 ||
    featuredLocationsData.length > 0 ||
    relatedStoriesData.length > 0;

  return (
    <div className="min-h-screen bg-mythic">
      <StoryProgressTracker storyId={story.id} pantheonId={story.pantheonId} />
      <ArticleJsonLd
        headline={story.title}
        description={story.summary}
        section={story.category}
        tags={story.moralThemes}
        url={`/stories/${story.slug}`}
      />
      {/* Hero Section */}
      <RouteHero>
        <div className="flex items-center justify-center mb-6">
          <HeroMark mark="scroll" tone="gold" size="lg" />
        </div>
        <h1 className="page-title text-parchment mb-6">{story.title}</h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-gold/80" />
          <p className="text-gold/80 font-body">{story?.category}</p>
        </div>
        <EditorialByline
          className="mx-auto max-w-2xl text-center"
          tone="light"
        />

        <div className="flex items-center justify-center gap-4">
          <BookmarkButton
            type="story"
            id={story?.id || ""}
            size="lg"
            variant="light"
          />

          {story && (
            <ShareButton
              title={`${story.title} - Mythos Atlas`}
              text={`Read "${story.title}" - ${story.summary?.slice(0, 100)}... on Mythos Atlas`}
              url={`https://mythosatlas.com/stories/${story.slug}`}
              className="[&_button]:text-gold [&_button]:border-gold/40 [&_button]:hover:bg-gold/20"
            />
          )}

          {story && (
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
              className="text-gold hover:bg-gold/20"
            />
          )}

          {story && (
            <button
              onClick={() => {
                if (isSpeaking) {
                  cancel();
                } else {
                  speak(story.fullNarrative || story.summary);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                isSpeaking
                  ? "bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30"
                  : "bg-gold/20 border-gold/40 text-gold hover:bg-gold/30"
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="h-4 w-4 fill-current" />
                  <span className="font-semibold">Stop Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="font-semibold">Read Aloud</span>
                </>
              )}
            </button>
          )}

          {story && CINEMATIC_STORIES.includes(story.slug) && (
            <Link
              href={`/stories/${story.slug}/cinematic`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-bronze/20 border-bronze/40 text-bronze hover:bg-bronze/30 transition-all"
            >
              <Play className="h-4 w-4" />
              <span className="font-semibold">Cinematic Mode</span>
            </Link>
          )}

          {story?.fullNarrative && (
            <Link
              href={`/stories/${story.slug}/read`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-gold/15 border-gold/40 text-gold hover:bg-gold/25 transition-all"
            >
              <ScrollText className="h-4 w-4" />
              <span className="font-semibold">Read Cinematically</span>
            </Link>
          )}
        </div>
      </RouteHero>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs />

        {/* Story Narrator */}
        {(story.fullNarrative || story.summary) && (
          <div className="mt-6">
            <StoryNarrator
              text={story.fullNarrative || story.summary}
              defaultCompact={false}
            />
          </div>
        )}

        <div className="mt-8 space-y-12">
          {/* Full Narrative — borderless editorial */}
          {story.fullNarrative ? (
            <section className="reveal-on-scroll max-w-[68ch]">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-5 border-l-4 border-gold pl-4">
                The Tale
              </h2>
              <div className="prose dark:prose-invert prose-gold max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-gold-text prose-strong:text-foreground prose-blockquote:border-l-gold/40 prose-li:marker:text-gold/50">
                <ReactMarkdown>{story.fullNarrative}</ReactMarkdown>
              </div>
            </section>
          ) : (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-5 border-l-4 border-gold pl-4">
                Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                {story.summary}
              </p>
            </section>
          )}

          {/* Key Excerpts */}
          {story.keyExcerpts && (
            <section className="max-w-[68ch]">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Key Passages
              </h2>
              <blockquote className="border-l-2 border-gold/40 bg-muted/40 px-5 py-4 text-muted-foreground italic leading-relaxed whitespace-pre-line">
                {story.keyExcerpts}
              </blockquote>
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

          {/* Structured citation references (from JSON citationSources) */}
          {story.citationSources && story.citationSources.length > 0 && (
            <CitationSourcesList
              sources={story.citationSources}
              variant="story"
            />
          )}

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
                    Original texts with translations — toggle to see the
                    original language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SourceExcerptsList excerpts={story.primarySourceExcerpts} />
                </CardContent>
              </Card>
            )}

          {/* Further Reading */}
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

          {/* Museum Relics */}
          <Card className="border-border bg-card/50 shadow-none overflow-hidden">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl font-serif">
                Museum Artifacts
              </CardTitle>
              <CardDescription>
                Interactive 3D relics associated with this legend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArtifactViewer
                type={
                  story.title.toLowerCase().includes("war") ||
                  story.title.toLowerCase().includes("battle")
                    ? "shield"
                    : "apple"
                }
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center pt-8">
            <Link href="/stories">
              <button className="px-6 py-3 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold-text transition-colors">
                ← Back to All Stories
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
