import type { Metadata } from "next";
import Link from "next/link";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";
import { THEME_HUBS } from "@/lib/theme-hubs";

export const metadata: Metadata = generateBaseMetadata({
  title: "Same Story, Many Cultures: Myth Themes Across Traditions",
  description:
    "Ten themes, including floods, creation, tricksters and journeys to the underworld, each gathering the stories in the atlas that tell them, with links to every entry.",
  url: "/themes",
  image: null,
  keywords: [
    "mythology themes",
    "flood myths",
    "trickster myths",
    "underworld myths",
    "creation myths around the world",
  ],
});

export default function ThemesIndex() {
  return (
    <>
      <ItemListJsonLd
        name="Myth themes across cultures"
        description="Stories from different traditions gathered by theme."
        url="/themes"
        items={THEME_HUBS.map((hub, index) => ({
          name: hub.title,
          url: `/themes/${hub.slug}`,
          position: index + 1,
        }))}
      />
      <PageHero
        mark="codex"
        tagline="Themes"
        title="Same Story, Many Cultures"
        description="Stories from different traditions that turn on the same idea, gathered in one place."
        count={`${THEME_HUBS.length} themes`}
      />
      <Container className="pt-8 pb-12 md:pt-10">
        <EntityGrid>
          {THEME_HUBS.map((hub) => (
            <EntityCard
              key={hub.slug}
              href={`/themes/${hub.slug}`}
              title={hub.title}
              headingLevel="h2"
              media={false}
              description={hub.description}
              descriptionLines={3}
              meta={`${hub.stories.length} stories`}
            />
          ))}
        </EntityGrid>
      </Container>
      <AboutThisPage title="About the themes">
        <p>
          Each theme gathers stories that already have entries in the atlas and
          shows the entry&apos;s own summary. The page says only what those
          summaries support. Similar stories are not treated as proof of a
          shared origin. To compare two deities directly, see the{" "}
          <Link href="/compare">comparisons</Link>, or browse all{" "}
          <Link href="/stories">stories</Link>.
        </p>
      </AboutThisPage>
    </>
  );
}
