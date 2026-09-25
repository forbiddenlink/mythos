import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import pantheons from "@/data/pantheons.json";
import { findDeityByReference } from "@/lib/deities";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { DeityPageClient } from "./DeityPageClient";
import { getMuseumObjectsFor } from "@/lib/museum";
import { ComparisonLinks } from "@/components/compare/ComparisonLinks";

// ISR: Revalidate every week (604800 seconds)
export const revalidate = 604800;

interface DeityData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  domain: string[];
  alternateNames?: string[];
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveDeityBySlug(slug: string) {
  return findDeityByReference(slug) as DeityData | undefined;
}

// Generate static params for all deities
export async function generateStaticParams() {
  return deities.map((deity) => ({
    slug: deity.slug,
  }));
}

// Generate metadata for each deity page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deity = resolveDeityBySlug(slug);

  if (!deity) {
    return generateNotFoundMetadata(
      "Deity Not Found",
      "The requested deity could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === deity.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  // Create a rich description
  const domains = deity.domain?.slice(0, 3).join(", ") || "";
  const baseDescription =
    deity.description ||
    `Explore ${deity.name}, ${pantheonName} deity of ${domains}. Learn about their mythology, symbols, and divine family.`;
  const description =
    baseDescription.length < 140
      ? `${baseDescription} Explore mythology, symbols, and related stories in Mythos Atlas.`
      : baseDescription;

  return generateBaseMetadata({
    title: `${deity.name} - ${pantheonName} Deity`,
    description: description.slice(0, 160),
    url: `/deities/${deity.slug}`,
    image: deity.imageUrl || "/og-image.png",
    type: "article",
    keywords: [
      deity.name,
      ...(deity.alternateNames || []),
      ...(deity.domain || []),
      pantheonName,
      "mythology",
      "deity",
      "god",
      "goddess",
    ],
    articleSection: "Deities",
    articleTags: deity.domain,
  });
}

export default async function DeityPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if deity exists (for 404)
  const deity = resolveDeityBySlug(slug);
  if (!deity) {
    notFound();
  }

  if (deity.slug !== slug) {
    redirect(`/deities/${deity.slug}`);
  }

  return (
    <>
      <TrackPageView
        event="entry_viewed"
        properties={{
          entityType: "deity",
          slug,
          pantheon: deity.pantheonId,
        }}
      />
      <DeityPageClient
        slug={slug}
        traditionLabel={
          pantheons.find((pantheon) => pantheon.id === deity.pantheonId)?.name
        }
        heroParallels={heroes
          .filter((hero) => {
            const entry = deities.find((item) => item.id === deity.id);
            return entry?.crossPantheonParallels?.some(
              (parallel) => parallel.deityId === hero.id,
            );
          })
          .map(({ id, name, slug }) => ({ id, name, slug }))}
        museumObjects={getMuseumObjectsFor({ deity: deity.slug })}
      />
      <ComparisonLinks deityId={deity.id} deityName={deity.name} />
    </>
  );
}
