'use client';

import { useContext, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_STORIES } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Tag, ScrollText } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { ExportIconButton } from '@/components/ui/export-button';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Volume2, Square } from 'lucide-react';

// Lazy load heavy Three.js-based artifact viewer
const ArtifactViewer = dynamic(
  () => import('@/components/artifacts/ArtifactViewer').then(mod => ({ default: mod.ArtifactViewer })),
  { loading: () => <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>, ssr: false }
);
import { ProgressContext } from '@/providers/progress-provider';
import { RelatedContent } from '@/components/related-content';
import { MythVariants } from '@/components/stories/MythVariants';
import deitiesData from '@/data/deities.json';
import locationsData from '@/data/locations.json';
import { DetailPageSkeleton } from '@/components/ui/skeleton-cards';
import { StoryNarrator } from '@/components/stories/StoryNarrator';
import { SourceExcerptsList, ReferencesList } from '@/components/sources';
import type { PrimarySourceExcerpt, FurtherReadingReference } from '@/components/sources';

function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
}

// Component to track story reads - separated to avoid hook call issues with early returns
function StoryProgressTracker({ storyId, pantheonId }: { storyId: string; pantheonId: string }) {
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
  primarySourceExcerpts?: PrimarySourceExcerpt[];
  furtherReading?: FurtherReadingReference[];
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

export default function StoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { speak, cancel, isSpeaking, isPaused, pause, resume } = useTextToSpeech();


  const { data, isLoading, error } = useQuery<{ stories: Story[] }>({
    queryKey: ['stories'],
    queryFn: async () => graphqlClient.request(GET_STORIES),
  });

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error loading story</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const story = data?.stories.find(s => s.slug === slug);

  if (!story && !isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Story Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The story you're looking for doesn't exist.
          </p>
          <Link href="/stories" className="text-gold hover:underline mt-4 inline-block">
            View all stories
          </Link>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  // Look up featured deities by ID
  const featuredDeitiesData = (story.featuredDeities || [])
    .map(deityId => {
      const deity = (deitiesData as Deity[]).find(d => d.id === deityId);
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
    .map(locationId => {
      const location = (locationsData as Location[]).find(l => l.id === locationId);
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
    .map(storyId => {
      const relatedStory = data?.stories.find(s => s.id === storyId);
      if (!relatedStory) return null;
      return {
        id: relatedStory.id,
        title: relatedStory.title,
        slug: relatedStory.slug,
        summary: relatedStory.summary,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const hasRelatedContent = featuredDeitiesData.length > 0 || featuredLocationsData.length > 0 || relatedStoriesData.length > 0;

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
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <BookOpen className="h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-parchment">
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-gold/80" />
            <p className="text-gold/80 font-body">{story?.category}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <BookmarkButton type="story" id={story?.id || ''} size="lg" variant="light" />

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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isSpeaking
                  ? 'bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30'
                  : 'bg-gold/20 border-gold/40 text-gold hover:bg-gold/30'
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
          </div>
        </div>
      </div>

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

        <div className="mt-8 space-y-8">

          {/* Full Narrative */}
          {story.fullNarrative ? (
            <Card className="border-gold/20 bg-midnight-light/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">The Tale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-gold max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-gold/90 prose-strong:text-gold/80 prose-blockquote:border-l-gold/40 prose-blockquote:text-parchment/70 prose-li:marker:text-gold/50">
                  <ReactMarkdown>{story.fullNarrative}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/80 leading-relaxed text-lg whitespace-pre-line">
                  {story.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Excerpts - Only show if we have a full narrative (as a summary) or if specific excerpts exist */}
          {story.keyExcerpts && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Key Passages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-midnight/30 p-6 rounded-lg border border-gold/10">
                  <p className="text-parchment/70 italic leading-relaxed whitespace-pre-line">
                    {story.keyExcerpts}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moral Themes */}
          {story.moralThemes && story.moralThemes.length > 0 && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {story.moralThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold/80 text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cultural Significance */}
          {story.culturalSignificance && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Cultural Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/80 leading-relaxed text-lg whitespace-pre-line">
                  {story.culturalSignificance}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Myth Variants */}
          {story.variants && story.variants.length > 0 && (
            <MythVariants variants={story.variants} />
          )}

          {/* Primary Source Excerpts */}
          {story.primarySourceExcerpts && story.primarySourceExcerpts.length > 0 && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-gold" />
                  Ancient Sources
                </CardTitle>
                <CardDescription>
                  Original texts with translations - toggle to see the original language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SourceExcerptsList excerpts={story.primarySourceExcerpts} />
              </CardContent>
            </Card>
          )}

          {/* Further Reading */}
          {story.furtherReading && story.furtherReading.length > 0 && (
            <div className="[&_*]:!bg-midnight-light/50 [&_*]:!border-gold/20 [&_h3]:!text-parchment [&_h4]:!text-gold [&_p]:!text-parchment/80 [&_cite]:!text-parchment [&_span]:!text-parchment/60">
              <ReferencesList
                references={story.furtherReading}
                title="Further Reading"
                showDescriptions={false}
                collapsible={true}
                defaultExpanded={false}
              />
            </div>
          )}

          {/* Related Content Section */}
          {hasRelatedContent && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Explore Further</CardTitle>
                <CardDescription>Characters, locations, and stories connected to this tale.</CardDescription>
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
          <Card className="border-gold/20 bg-midnight-light/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Museum Artifacts</CardTitle>
              <CardDescription>Interactive 3D relics associated with this legend.</CardDescription>
            </CardHeader>
            <CardContent>
              <ArtifactViewer type={story.title.toLowerCase().includes('war') || story.title.toLowerCase().includes('battle') ? 'shield' : 'apple'} />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center pt-8">
            <Link href="/stories">
              <button className="px-6 py-3 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold transition-colors">
                ← Back to All Stories
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
