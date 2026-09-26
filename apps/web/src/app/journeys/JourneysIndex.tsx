import Link from "next/link";
import {
  EntityBadge,
  EntityCard,
  EntityGrid,
} from "@/components/entities/EntityCard";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { getPantheonColor } from "@/lib/pantheon-colors";
import type { JourneySetting } from "@/lib/journeys";

/** Card fields for one journey (no waypoint narratives). */
export interface JourneyCard {
  id: string;
  slug: string;
  title: string;
  heroName: string;
  description: string;
  pantheonId: string;
  duration: string;
  source: string;
  imageUrl: string | null;
  setting?: JourneySetting;
  stopCount: number;
  /** First few stop names, in order. */
  firstStops: string[];
}

/**
 * Journey index: one image-led card per route. Server component; the maps
 * load on each journey's own page.
 */
export function JourneysIndex({
  journeys,
  pantheonCount,
  traditionNames,
}: Readonly<{
  journeys: JourneyCard[];
  /** Traditions with at least one journey, counted on the server. */
  pantheonCount: number;
  traditionNames: Record<string, string>;
}>) {
  const stops = journeys.reduce((sum, j) => sum + j.stopCount, 0);
  return (
    <div className="min-h-screen">
      <PageHero
        mark="compass"
        tagline="Guided journeys"
        title="Journeys"
        description="Follow heroes and gods along legendary routes, from the wine-dark sea to the realms beyond the world."
        count={`${journeys.length} routes · ${stops} stops · ${pantheonCount} traditions`}
        backgroundImage="/family-tree-hero.jpg"
        backgroundAlt="Ancient celestial cartography and mythical voyages"
      />

      <Container className="pt-8 pb-12 md:pt-10">
        <EntityGrid>
          {journeys.map((journey, index) => (
            <EntityCard
              key={journey.id}
              href={`/journeys/${journey.slug}`}
              title={journey.title}
              image={journey.imageUrl}
              aspect="landscape"
              priority={index < 3}
              headingLevel="h2"
              tradition={
                traditionNames[journey.pantheonId] ??
                journey.pantheonId.replace(/-pantheon$/, "")
              }
              traditionColor={getPantheonColor(journey.pantheonId)}
              subtitle={`${journey.heroName} · ${journey.duration}`}
              description={journey.description}
              badges={
                <EntityBadge>
                  {journey.stopCount} stops
                  {journey.setting === "otherworld" ? " · otherworld" : ""}
                </EntityBadge>
              }
              meta={
                <span className="line-clamp-1">
                  {journey.firstStops.join(" → ")}
                  {journey.stopCount > journey.firstStops.length ? " → …" : ""}
                </span>
              }
            />
          ))}
        </EntityGrid>
      </Container>

      <AboutThisPage title="About the journeys">
        <p>
          Earthly voyages are drawn on a map. Journeys through otherworlds, such
          as the Nine Realms or the Duat, follow their realms in order, and
          every stop links to its place in the locations atlas. Want another
          route? Themed collections and study guides gather readings across
          traditions on <Link href="/paths">Paths</Link>.
        </p>
      </AboutThisPage>
    </div>
  );
}
