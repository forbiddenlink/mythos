import Link from "next/link";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { StarChart } from "@/components/pantheons/StarChart";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import {
  getDeities,
  getPantheonShortNames,
  getPantheons,
  getStories,
  getTraditionCount,
} from "@/lib/data/catalog";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { shortRegionName } from "@/lib/tradition-name";

const STAR_CHART_SLUGS = ["zeus", "odin", "ra", "athena", "thor"];

/** The catalog cover, or the tradition's leading portrait when there is none. */
function coverImage(pantheonId: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  const lead = getDeities()
    .filter((d) => d.pantheonId === pantheonId && d.imageUrl)
    .sort((a, b) => (a.importanceRank ?? 99) - (b.importanceRank ?? 99))[0];
  return lead?.imageUrl ?? null;
}

function countBy(items: readonly { pantheonId: string }[]) {
  const counts = new Map<string, number>();
  for (const item of items)
    counts.set(item.pantheonId, (counts.get(item.pantheonId) ?? 0) + 1);
  return counts;
}

export default function PantheonsPage() {
  const pantheons = getPantheons();
  const shortNames = getPantheonShortNames();
  const deityCounts = countBy(getDeities());
  const storyCounts = countBy(getStories());
  const starFigures = STAR_CHART_SLUGS.flatMap((slug) => {
    const deity = getDeities().find((d) => d.slug === slug);
    return deity
      ? [
          {
            name: deity.name,
            slug: deity.slug,
            imageUrl: deity.imageUrl ?? null,
            tradition: shortNames[deity.pantheonId] ?? deity.pantheonId,
          },
        ]
      : [];
  });

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Pantheons"
        description="Explore mythological traditions from ancient civilizations around the world"
        url="/pantheons"
        numberOfItems={pantheons.length}
      />
      <PageHero
        mark="temple"
        tagline="Mythological Traditions"
        title="Pantheons"
        description="Orient in a tradition first, then branch into its gods, myths and sacred places."
        count={`${getTraditionCount()} traditions`}
        backgroundImage="/pantheons-hero.jpg"
        backgroundAlt="A panoramic scene inspired by the major pantheons of world mythology"
        colorScheme="gold"
      />

      <Container className="pt-8 pb-12 md:pt-10">
        <EntityGrid>
          {pantheons.map((pantheon, index) => {
            const deities = deityCounts.get(pantheon.id) ?? 0;
            const stories = storyCounts.get(pantheon.id) ?? 0;
            return (
              <EntityCard
                key={pantheon.id}
                href={`/pantheons/${pantheon.slug}`}
                title={pantheon.name}
                image={coverImage(pantheon.id, pantheon.imageUrl)}
                aspect="landscape"
                priority={index < 3}
                headingLevel="h2"
                tradition={shortRegionName(pantheon.region)}
                traditionColor={getPantheonColor(pantheon.id)}
                description={pantheon.description}
                meta={[
                  deities > 0
                    ? `${deities} ${deities === 1 ? "deity" : "deities"}`
                    : null,
                  stories > 0
                    ? `${stories} ${stories === 1 ? "story" : "stories"}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            );
          })}
        </EntityGrid>

        <div className="mt-16 md:mt-20">
          <StarChart figures={starFigures} />
        </div>
      </Container>

      <AboutThisPage title="How to use the pantheon guide">
        <p>
          Each pantheon page is a fast orientation layer before you dive into
          individual gods, stories, creatures, and places. Prefer a study route?
          Try the <Link href="/study/greek-gods">Greek gods study guide</Link>,
          the <Link href="/study/norse-mythology">Norse mythology guide</Link>,
          or{" "}
          <Link href="/study/comparative-mythology">comparative mythology</Link>
          .
        </p>
      </AboutThisPage>
    </div>
  );
}
