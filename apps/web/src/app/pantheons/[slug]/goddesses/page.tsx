import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CollectionPageJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { joinNames } from "@/lib/deity-faq";
import { domainLabel, normalizeDomain } from "@/lib/gods-of";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { getGoddessHub, getGoddessHubs } from "@/lib/pantheon-hubs";
import { truncateDescription } from "@/lib/seo/description";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Prerendered for every tradition with enough goddesses; anything else is a
// static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getGoddessHubs().map((hub) => ({ slug: hub.tradition.slug }));
}

export async function generateMetadata({
  params,
}: Readonly<PageProps>): Promise<Metadata> {
  const { slug } = await params;
  const hub = getGoddessHub(slug);
  if (!hub) {
    return generateNotFoundMetadata(
      "Goddesses Not Found",
      "There is no goddess list for this tradition.",
    );
  }
  const { shortName } = hub.tradition;
  const names = joinNames(hub.goddesses.slice(0, 4).map((g) => g.name));
  return generateBaseMetadata({
    title: `${shortName} Goddesses and Their Domains`,
    description: truncateDescription(
      `${hub.goddesses.length} ${shortName} goddesses, including ${names}, with the domains each entry lists.`,
    ),
    url: `/pantheons/${slug}/goddesses`,
    image: null,
    keywords: [
      `${shortName} goddesses`,
      `${shortName} mythology goddesses`,
      `list of ${shortName} goddesses`,
    ],
  });
}

export default async function PantheonGoddessesPage({
  params,
}: Readonly<PageProps>) {
  const { slug } = await params;
  const hub = getGoddessHub(slug);
  if (!hub) notFound();

  const { tradition, goddesses } = hub;
  const url = `/pantheons/${tradition.slug}/goddesses`;
  const title = `${tradition.shortName} Goddesses`;
  const lede = `${goddesses.length} goddesses of the ${tradition.name} in the atlas, with the domains each entry lists, most prominent first.`;

  return (
    <>
      <CollectionPageJsonLd
        name={title}
        description={lede}
        url={url}
        numberOfItems={goddesses.length}
      />
      <ItemListJsonLd
        name={title}
        description={lede}
        url={url}
        items={goddesses.map((goddess, index) => ({
          name: goddess.name,
          url: `/deities/${goddess.slug}`,
          position: index + 1,
        }))}
      />
      <PageHero
        mark="constellation"
        tagline="Divine domains"
        title={title}
        description={lede}
      />
      <Container className="pt-6 pb-16 md:pt-8">
        <EntityGrid as="ul" aspect="portrait">
          {goddesses.map((goddess) => (
            <li key={goddess.id}>
              <EntityCard
                href={`/deities/${goddess.slug}`}
                title={goddess.name}
                image={goddess.imageUrl}
                imagePosition="50% 22%"
                aspect="portrait"
                traditionColor={getPantheonColor(tradition.id)}
                subtitle={(goddess.domain ?? [])
                  .slice(0, 3)
                  .map((d) => domainLabel(normalizeDomain(d)))
                  .join(" · ")}
                description={goddess.description}
                headingLevel="h2"
              />
            </li>
          ))}
        </EntityGrid>
        <p className="mt-16 max-w-reading border-t border-border/50 pt-6 type-ui text-muted-foreground">
          Built from each deity&apos;s catalog entry, using its recorded gender.
          Back to the{" "}
          <Link
            href={`/pantheons/${tradition.slug}`}
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            {tradition.name}
          </Link>
          , or browse{" "}
          <Link
            href="/deities"
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            every deity
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
