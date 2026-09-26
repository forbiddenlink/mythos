import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import stories from "@/data/stories.json";
import pantheons from "@/data/pantheons.json";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { canonicalStorySlug } from "@/lib/story-aliases";
import { StoryPageClient, type StoryPageClientProps } from "./StoryPageClient";
import deities from "@/data/deities.json";
import locations from "@/data/locations.json";
import { MuseumObjects } from "@/components/stories/MuseumObjects";
import { getMythVersions } from "@/lib/myth-versions";

interface StoryData {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  moralThemes?: string[];
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

// Generate static params for all stories
export async function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

// Generate metadata for each story page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = canonicalStorySlug(rawSlug);
  const story = stories.find((s) => s.slug === slug) as StoryData | undefined;

  if (!story) {
    return generateNotFoundMetadata(
      "Story Not Found",
      "The requested story could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === story.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  // Create a rich description
  const themes = story.moralThemes?.slice(0, 3).join(", ") || "";
  const description =
    story.summary?.slice(0, 160) ||
    `Read ${story.title}, a ${story.category} from ${pantheonName} mythology. Themes: ${themes}.`;

  return generateBaseMetadata({
    title: `${story.title} - ${pantheonName} Mythology`,
    description: description,
    url: `/stories/${story.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      story.title,
      story.category,
      ...(story.moralThemes || []),
      pantheonName,
      "mythology",
      "myth",
      "legend",
      "ancient story",
    ],
    articleSection: "Stories",
    articleTags: story.moralThemes,
  });
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalStorySlug(slug);
  if (canonical !== slug) {
    redirect(`/stories/${canonical}`);
  }

  // Check if story exists (for 404)
  const story = stories.find((s) => s.slug === slug);
  if (!story) {
    notFound();
  }

  const pantheon = pantheons.find((entry) => entry.id === story.pantheonId);
  const featuredDeitiesData = (story.featuredDeities || []).flatMap((id) => {
    const entry = deities.find((deity) => deity.id === id);
    return entry
      ? [
          {
            id: entry.id,
            name: entry.name,
            slug: entry.slug,
            domain: entry.domain,
            imageUrl: entry.imageUrl,
          },
        ]
      : [];
  });
  const featuredLocationsData = (story.featuredLocations || []).flatMap(
    (id) => {
      const entry = locations.find((location) => location.id === id);
      return entry
        ? [
            {
              id: entry.id,
              name: entry.name,
              slug: entry.id,
              imageUrl: entry.imageUrl,
            },
          ]
        : [];
    },
  );
  const relatedStoriesData = (story.relatedStories || []).flatMap((id) => {
    const entry = stories.find((related) => related.id === id);
    return entry
      ? [
          {
            id: entry.id,
            title: entry.title,
            slug: entry.slug,
            summary: entry.summary,
          },
        ]
      : [];
  });

  return (
    <>
      <TrackPageView
        event="entry_viewed"
        properties={{
          entityType: "story",
          slug,
          pantheon: story.pantheonId,
        }}
      />
      <StoryPageClient
        story={story as StoryPageClientProps["story"]}
        pantheon={
          pantheon ? { name: pantheon.name, slug: pantheon.slug } : undefined
        }
        featuredDeitiesData={featuredDeitiesData}
        featuredLocationsData={featuredLocationsData}
        relatedStoriesData={relatedStoriesData}
        museumObjects={<MuseumObjects storyId={story.id} />}
        versions={getMythVersions(slug)}
      />
    </>
  );
}
