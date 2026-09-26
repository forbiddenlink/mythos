import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJourneys, getPantheonById } from "@/lib/data/catalog";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { JourneyPageClient } from "./JourneyPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

function findJourney(slug: string) {
  return getJourneys().find((j) => j.slug === slug);
}

// Generate static params for all journeys
export async function generateStaticParams() {
  return getJourneys().map((journey) => ({
    slug: journey.slug,
  }));
}

// Generate metadata for each journey page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = findJourney(slug);

  if (!journey) {
    return generateNotFoundMetadata(
      "Journey Not Found",
      "The requested journey could not be found.",
    );
  }

  const pantheon = getPantheonById(journey.pantheonId);
  const pantheonName = pantheon?.name || "Ancient";

  // Create a rich description
  const waypointCount = journey.waypoints?.length || 0;
  const description =
    journey.description?.slice(0, 160) ||
    `Follow ${journey.heroName}'s epic ${journey.duration} journey through ${waypointCount} legendary locations in ${pantheonName} mythology.`;

  return generateBaseMetadata({
    title: `${journey.title} - ${journey.heroName}'s Journey`,
    description: description,
    url: `/journeys/${journey.slug}`,
    image: journey.imageUrl || "/og-image.png",
    type: "article",
    keywords: [
      journey.title,
      journey.heroName,
      pantheonName,
      "mythology",
      "epic journey",
      "hero quest",
      "adventure",
      "ancient voyage",
      journey.source.split(",")[0], // e.g., "Homer"
    ],
    articleSection: "Journeys",
    articleTags: journey.waypoints?.slice(0, 5).map((w) => w.name),
  });
}

export default async function JourneyPage({ params }: PageProps) {
  const { slug } = await params;
  const journey = findJourney(slug);
  if (!journey) {
    notFound();
  }
  const pantheon = getPantheonById(journey.pantheonId);

  return (
    <JourneyPageClient
      journey={journey}
      pantheon={
        pantheon ? { name: pantheon.name, slug: pantheon.slug } : undefined
      }
    />
  );
}
