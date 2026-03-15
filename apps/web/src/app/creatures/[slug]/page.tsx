import type { Metadata } from "next";
import { notFound } from "next/navigation";
import creatures from "@/data/creatures.json";
import pantheons from "@/data/pantheons.json";
import { generateBaseMetadata } from "@/lib/metadata";
import { CreaturePageClient } from "./CreaturePageClient";

// ISR: Revalidate every week (604800 seconds)
export const revalidate = 604800;

interface CreatureData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all creatures
export async function generateStaticParams() {
  return creatures.map((creature) => ({
    slug: creature.slug,
  }));
}

// Generate metadata for each creature page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const creature = creatures.find((c) => c.slug === slug) as
    | CreatureData
    | undefined;

  if (!creature) {
    return generateBaseMetadata({
      title: "Creature Not Found",
      description: "The requested creature could not be found.",
    });
  }

  const pantheon = pantheons.find((p) => p.id === creature.pantheonId);
  const pantheonName = pantheon?.name || "Ancient";

  // Create a rich description
  const abilities = creature.abilities?.slice(0, 3).join(", ") || "";
  const description =
    creature.description?.slice(0, 160) ||
    `Learn about ${creature.name}, a mythological creature from ${pantheonName} mythology. Habitat: ${creature.habitat}. Abilities: ${abilities}.`;

  return generateBaseMetadata({
    title: `${creature.name} - ${pantheonName} Creature`,
    description: description,
    url: `/creatures/${creature.slug}`,
    image: creature.imageUrl || "/og-image.png",
    type: "article",
    keywords: [
      creature.name,
      creature.habitat,
      ...creature.abilities,
      pantheonName,
      "mythology",
      "creature",
      "monster",
      "beast",
      "bestiary",
    ],
    articleSection: "Bestiary",
    articleTags: creature.abilities,
  });
}

export default async function CreaturePage({ params }: PageProps) {
  const { slug } = await params;

  // Check if creature exists (for 404)
  const creature = creatures.find((c) => c.slug === slug);
  if (!creature) {
    notFound();
  }

  return <CreaturePageClient slug={slug} />;
}
