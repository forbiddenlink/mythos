import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import artifacts from "@/data/artifacts.json";
import deitiesData from "@/data/deities.json";
import pantheons from "@/data/pantheons.json";
import storiesData from "@/data/stories.json";
import { canonicalArtifactSlug } from "@/lib/artifact-aliases";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { ArtifactPageClient } from "./ArtifactPageClient";
import { ArtifactJsonLd } from "@/components/seo/JsonLd";
import { citedWorksFor } from "@/lib/seo/cited-works";

interface ArtifactData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  powers: string[];
  ownerId?: string;
  ownerKind?: "deity" | "hero";
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

// Generate static params for all artifacts
export async function generateStaticParams() {
  return artifacts.map((artifact) => ({
    slug: artifact.slug,
  }));
}

// Generate metadata for each artifact page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = canonicalArtifactSlug(rawSlug);
  const artifact = artifacts.find((a) => a.slug === slug) as
    ArtifactData | undefined;

  if (!artifact) {
    return generateNotFoundMetadata(
      "Artifact Not Found",
      "The requested artifact could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === artifact.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  // Create a rich description
  const powers = artifact.powers?.slice(0, 3).join(", ") || "";
  const description =
    artifact.description?.slice(0, 160) ||
    `Learn about ${artifact.name}, a legendary ${artifact.type} from ${pantheonName} mythology. Powers: ${powers}.`;

  return generateBaseMetadata({
    title: `${artifact.name} - ${pantheonName} Artifact`,
    description: description,
    url: `/artifacts/${artifact.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      artifact.name,
      artifact.type,
      ...artifact.powers,
      pantheonName,
      "mythology",
      "artifact",
      "relic",
      "legendary weapon",
      "divine item",
    ],
    articleSection: "Arsenal",
    articleTags: artifact.powers,
  });
}

export default async function ArtifactPage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalArtifactSlug(slug);
  if (canonical !== slug) {
    redirect(`/artifacts/${canonical}`);
  }

  const artifact = artifacts.find((a) => a.slug === slug);
  if (!artifact) {
    notFound();
  }

  // The provenance panel links owners to /deities/, so only deity owners resolve here.
  const owner =
    artifact.ownerId && artifact.ownerKind === "deity"
      ? ((
          deitiesData as Array<{ id: string; slug: string; name: string }>
        ).find((deity) => deity.id === artifact.ownerId) ?? null)
      : null;

  const relatedStories = (artifact.relatedStories ?? [])
    .map((id) => {
      const story = (
        storiesData as Array<{ id: string; slug: string; title: string }>
      ).find((s) => s.id === id);
      return story
        ? { id: story.id, slug: story.slug, title: story.title }
        : null;
    })
    .filter(
      (s): s is { id: string; slug: string; title: string } => s !== null,
    );

  const pantheon = pantheons.find((p) => p.id === artifact.pantheonId);

  return (
    <>
      <ArtifactJsonLd
        name={artifact.name}
        description={artifact.description}
        url={`/artifacts/${artifact.slug}`}
        image={artifact.imageUrl || undefined}
        powers={artifact.powers}
        artifactType={artifact.type}
        tradition={shortPantheonName(pantheon)}
        citations={citedWorksFor(artifact)}
      />
      <ArtifactPageClient
        slug={slug}
        owner={owner}
        relatedStories={relatedStories}
      />
    </>
  );
}
