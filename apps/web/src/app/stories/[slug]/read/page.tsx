import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import stories from "@/data/stories.json";
import pantheons from "@/data/pantheons.json";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { canonicalStorySlug } from "@/lib/story-aliases";
import { ScrollytellingReader } from "@/components/stories/ScrollytellingReader";

interface StoryData {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  fullNarrative?: string;
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

// Only stories with a full narrative get a cinematic reading.
export function generateStaticParams() {
  return (stories as StoryData[])
    .filter((story) => Boolean(story.fullNarrative))
    .map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = (stories as StoryData[]).find((s) => s.slug === slug);

  if (!story) {
    return generateNotFoundMetadata(
      "Reading Not Found",
      "The requested reading could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === story.pantheonId);
  const pantheonName = pantheon?.name || "Ancient";

  return generateBaseMetadata({
    title: `${story.title} — A Reading`,
    description: `Read ${story.title} as a scroll-driven, cinematic ${pantheonName} myth.`,
    // The reading presents the same narrative as the story entry, so the entry
    // is canonical: signals consolidate there instead of splitting across two
    // URLs with identical text.
    url: `/stories/${story.slug}`,
    image: story.imageUrl || "/og-image.png",
    type: "article",
  });
}

export default async function StoryReadPage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalStorySlug(slug);
  if (canonical !== slug) {
    redirect(`/stories/${canonical}/read`);
  }

  const story = (stories as StoryData[]).find((s) => s.slug === slug);

  if (!story || !story.fullNarrative) {
    notFound();
  }

  const pantheon = pantheons.find((p) => p.id === story.pantheonId);

  return (
    <ScrollytellingReader
      title={story.title}
      narrative={story.fullNarrative}
      pantheonId={story.pantheonId}
      pantheonName={pantheon?.name}
      imageUrl={story.imageUrl ?? null}
      backHref={`/stories/${story.slug}`}
    />
  );
}
