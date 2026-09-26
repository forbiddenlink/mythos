import type { Metadata } from "next";
import Link from "next/link";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { GUIDES } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Guides: Epics, Novels and Games Read Against the Myths",
  description:
    "Guides to Homer's Odyssey, Percy Jackson's The Titan's Curse and Hades II: the ancient sources behind each, what the modern versions invent, and links to every figure and place.",
  url: "/guides",
  image: null,
  keywords: [
    "mythology guides",
    "Percy Jackson mythology",
    "Odyssey guide",
    "Hades II mythology",
  ],
});

/** A catalog image that stands for each guide's subject. */
const GUIDE_IMAGES: Record<string, string> = {
  "percy-jackson-titans-curse": "/deities/artemis.jpg",
  odyssey: "/journeys/odyssey.png",
  "hades-ii": "/deities/hades.jpg",
};

export default function GuidesIndex() {
  return (
    <>
      <ItemListJsonLd
        name="Mythos Atlas guides"
        description="Editorial guides that set modern retellings and ancient epics beside their sources."
        url="/guides"
        items={GUIDES.map((guide, index) => ({
          name: guide.title,
          url: `/guides/${guide.slug}`,
          position: index + 1,
        }))}
      />
      <PageHero
        mark="codex"
        tagline="Guides"
        title="Read the Myths Behind the Story"
        description="Epics, novels and games, set beside the ancient sources they draw on."
        count={`${GUIDES.length} guides`}
      />
      <Container className="pt-8 pb-12 md:pt-10">
        <EntityGrid>
          {GUIDES.map((guide, index) => (
            <EntityCard
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              title={guide.title}
              image={GUIDE_IMAGES[guide.slug]}
              imagePosition="50% 30%"
              aspect="landscape"
              priority={index < 3}
              headingLevel="h2"
              description={guide.description}
              descriptionLines={3}
              meta={`${Object.values(guide.featured).reduce(
                (sum, ids) => sum + (ids?.length ?? 0),
                0,
              )} linked entries`}
            />
          ))}
        </EntityGrid>
      </Container>
      <AboutThisPage title="About the guides">
        <p>
          Each guide reads a modern retelling or an ancient epic against its
          sources, then links every figure, creature and place it mentions to
          its entry in the atlas. Looking for a single domain instead? See the{" "}
          <Link href="/divine-domains">gods by domain</Link>, from war and love
          to the sea and the dead.
        </p>
      </AboutThisPage>
    </>
  );
}
