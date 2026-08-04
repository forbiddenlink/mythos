import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MythosMark } from "@/components/icons/mythos-marks";
import { generateBaseMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";
import toursData from "@/data/tours.json";
import locationsData from "@/data/locations.json";

export const metadata: Metadata = generateBaseMetadata({
  title: "Guided Mythology Tours",
  description:
    "Take guided walks through mythic geography — Odyssey, Argonauts, the Nine Realms, the Duat, and the Labors of Heracles.",
  url: "/tours",
});

interface Tour {
  id: string;
  name: string;
  description: string;
  pantheonId: string;
  difficulty: string;
  estimatedTime: string;
  locations: string[];
  highlights: string[];
}

interface LocationRow {
  id: string;
  name: string;
}

function prettyPantheon(pantheonId: string): string {
  return pantheonId
    .replace(/-pantheon$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TOUR_TO_JOURNEY: Record<string, string> = {
  odyssey: "odyssey",
  argonauts: "golden-fleece",
  "heracles-labors": "twelve-labors",
};

export default function ToursPage() {
  const tours = toursData as Tour[];
  const locations = locationsData as LocationRow[];
  const locationById = new Map(locations.map((l) => [l.id, l]));

  return (
    <div className="min-h-screen">
      <PageHero
        mark="compass"
        tagline="Guided walks"
        title="Mythology Tours"
        description="Shareable study walks through sacred geography — stop by stop, with the highlights that make each route worth remembering."
      />

      <div className="container mx-auto max-w-6xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
          Each stop links into the location atlas. Deep-link any tour with{" "}
          <code className="text-gold">/tours#odyssey</code>, or open a matching
          map journey when you want Leaflet waypoints.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tours.map((tour) => {
            const color = getPantheonColor(tour.pantheonId);
            const journeySlug = TOUR_TO_JOURNEY[tour.id];
            const stops = tour.locations
              .map((id) => locationById.get(id))
              .filter((l): l is LocationRow => Boolean(l));

            return (
              <Card
                key={tour.id}
                id={tour.id}
                className="scroll-mt-28 border-border/60 bg-card/70"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {prettyPantheon(tour.pantheonId)}
                      </p>
                      <CardTitle className="font-serif text-2xl">
                        {tour.name}
                      </CardTitle>
                    </div>
                    <MythosMark id="compass" className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge
                      variant="outline"
                      className="capitalize"
                      style={{ borderColor: color, color }}
                    >
                      {tour.difficulty}
                    </Badge>
                    <Badge variant="secondary">{tour.estimatedTime}</Badge>
                    <Badge variant="secondary">{stops.length} stops</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {tour.description}
                  </p>

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Highlights
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
                      {tour.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Route stops
                    </p>
                    <ol className="flex flex-wrap gap-2">
                      {stops.slice(0, 10).map((stop, i) => (
                        <li key={`${tour.id}-${stop.id}-${i}`}>
                          <Link
                            href={`/locations/${stop.id}`}
                            className="inline-flex items-center gap-1 border border-border/60 bg-background/50 px-2 py-1 text-xs hover:border-gold/40 hover:text-gold"
                          >
                            <span className="text-muted-foreground">
                              {i + 1}.
                            </span>
                            {stop.name}
                          </Link>
                        </li>
                      ))}
                      {stops.length > 10 && (
                        <li className="self-center text-xs text-muted-foreground">
                          +{stops.length - 10} more
                        </li>
                      )}
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={`/tours#${tour.id}`}
                      className="text-sm text-gold underline-offset-4 hover:underline"
                    >
                      Deep link
                    </Link>
                    {journeySlug ? (
                      <Link
                        href={`/journeys/${journeySlug}`}
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                      >
                        Open map journey →
                      </Link>
                    ) : (
                      <Link
                        href="/journeys"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                      >
                        Map journeys →
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
