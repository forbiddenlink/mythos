import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CollectionPageJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { joinNames } from "@/lib/deity-faq";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { getCreatureHub, getCreatureHubs } from "@/lib/pantheon-hubs";
import { truncateDescription } from "@/lib/seo/description";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Prerendered for every tradition with enough creatures; anything else is a
// static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCreatureHubs().map((hub) => ({ slug: hub.tradition.slug }));
}

export async function generateMetadata({
  params,
}: Readonly<PageProps>): Promise<Metadata> {
  const { slug } = await params;
  const hub = getCreatureHub(slug);
  if (!hub) {
    return generateNotFoundMetadata(
      "Creatures Not Found",
      "There is no creature list for this tradition.",
    );
  }
  const { shortName } = hub.tradition;
  const names = joinNames(hub.creatures.slice(0, 4).map((c) => c.name));
  return generateBaseMetadata({
    title: `${shortName} Mythological Creatures and Monsters`,
    description: truncateDescription(
      `${hub.creatures.length} ${shortName} mythological creatures, including ${names}, with their habitats, abilities and danger ratings.`,
    ),
    url: `/pantheons/${slug}/creatures`,
    image: null,
    keywords: [
      `${shortName} mythological creatures`,
      `${shortName} monsters`,
      `${shortName} mythology creatures`,
      "bestiary",
    ],
  });
}

export default async function PantheonCreaturesPage({
  params,
}: Readonly<PageProps>) {
  const { slug } = await params;
  const hub = getCreatureHub(slug);
  if (!hub) notFound();

  const { tradition, creatures } = hub;
  const url = `/pantheons/${tradition.slug}/creatures`;
  const title = `${tradition.shortName} Mythological Creatures`;
  const lede = `${creatures.length} creatures from the ${tradition.name} in the atlas, listed from most to least dangerous by the atlas's own rating.`;

  return (
    <>
      <CollectionPageJsonLd
        name={title}
        description={lede}
        url={url}
        numberOfItems={creatures.length}
      />
      <ItemListJsonLd
        name={title}
        description={lede}
        url={url}
        items={creatures.map((creature, index) => ({
          name: creature.name,
          url: `/creatures/${creature.slug}`,
          position: index + 1,
        }))}
      />
      <PageHero
        mark="serpent"
        tagline="The Bestiary"
        title={title}
        description={lede}
        colorScheme="red"
      />
      <Container className="pt-6 pb-16 md:pt-8">
        <EntityGrid as="ul" aspect="landscape">
          {creatures.map((creature, index) => (
            <li key={creature.id}>
              <EntityCard
                priority={index < 2}
                href={`/creatures/${creature.slug}`}
                title={creature.name}
                image={creature.imageUrl}
                aspect="landscape"
                traditionColor={getPantheonColor(tradition.id)}
                subtitle={creature.habitat}
                description={creature.description}
                meta={`Danger ${creature.dangerLevel}/10`}
                headingLevel="h2"
              />
            </li>
          ))}
        </EntityGrid>
        <p className="mt-16 max-w-reading border-t border-border/50 pt-6 type-ui text-muted-foreground">
          Built from each creature&apos;s catalog entry. Back to the{" "}
          <Link
            href={`/pantheons/${tradition.slug}`}
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            {tradition.name}
          </Link>
          , or browse{" "}
          <Link
            href="/creatures"
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            every creature
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
