import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import heroes from "@/data/heroes.json";
import pantheons from "@/data/pantheons.json";
import { findHeroByReference } from "@/lib/heroes";
import { generateBaseMetadata, generateNotFoundMetadata, shortPantheonName } from "@/lib/metadata";
import { HeroPageClient } from "./HeroPageClient";

// ISR: Revalidate every week (604800 seconds)
export const revalidate = 604800;

interface HeroData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  alternateNames?: string[];
  imageUrl?: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveHeroBySlug(slug: string) {
  return findHeroByReference(slug) as HeroData | undefined;
}

// Generate static params for all heroes
export async function generateStaticParams() {
  return heroes.map((hero) => ({
    slug: hero.slug,
  }));
}

// Generate metadata for each hero page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hero = resolveHeroBySlug(slug);

  if (!hero) {
    return generateNotFoundMetadata(
      "Hero Not Found",
      "The requested hero could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === hero.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  const baseDescription =
    hero.description ||
    `Explore ${hero.name}, a hero of ${pantheonName} mythology.`;
  const description =
    baseDescription.length < 140
      ? `${baseDescription} Explore mythology, key deeds, and sources in Mythos Atlas.`
      : baseDescription;

  return generateBaseMetadata({
    title: `${hero.name} - Hero of ${pantheonName} Mythology`,
    description: description.slice(0, 160),
    url: `/heroes/${hero.slug}`,
    image: hero.imageUrl || "/og-image.png",
    type: "article",
    keywords: [
      hero.name,
      ...(hero.alternateNames || []),
      pantheonName,
      "mythology",
      "hero",
      "legend",
    ],
    articleSection: "Heroes",
  });
}

export default async function HeroPage({ params }: PageProps) {
  const { slug } = await params;

  const hero = resolveHeroBySlug(slug);
  if (!hero) {
    notFound();
  }

  if (hero.slug !== slug) {
    redirect(`/heroes/${hero.slug}`);
  }

  return <HeroPageClient slug={slug} />;
}
