import Link from "next/link";
import Image from "next/image";
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
  imageUrl?: string | null;
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

const TOUR_COVER_IMAGES: Record<string, string> = {
  odyssey: "/locations/troy.webp",
  argonauts: "/locations/iolcos.webp",
  "norse-realms": "/locations/asgard.webp",
  "egyptian-afterlife": "/locations/hall-of-maat.webp",
  "heracles-labors": "/locations/garden-of-hesperides.webp",
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
        backgroundImage="/hero-columns.webp"
        backgroundAlt="Sacred classical ruins and guided tour path"
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
            const coverImg = TOUR_COVER_IMAGES[tour.id];
            const stops = tour.locations
              .map((id) => locationById.get(id))
              .filter((l): l is LocationRow => Boolean(l));

            return (
              <Card
                key={tour.id}
                id={tour.id}
                className="group scroll-mt-28 border-border/60 bg-card/70 overflow-hidden flex flex-col hover:border-gold/50 transition-all duration-300"
              >
                {coverImg && (
                  <div className="relative w-full h-44 overflow-hidden border-b border-border/50 bg-midnight">
                    <Image
                      src={coverImg}
                      alt={tour.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-card via-card/25 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge
                        className="capitalize bg-card text-foreground shadow-xs"
                        style={{ borderColor: color }}
                      >
                        {prettyPantheon(tour.pantheonId)}
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {!coverImg && (
                        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {prettyPantheon(tour.pantheonId)}
                        </p>
                      )}
                      <CardTitle className="font-serif text-2xl group-hover:text-gold transition-colors">
                        {tour.name}
                      </CardTitle>
                    </div>
                    <MythosMark
                      id="compass"
                      className="h-5 w-5 text-gold shrink-0 mt-1"
                    />
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
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
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
                              className="inline-flex items-center gap-1.5 border border-border/60 bg-background/50 pl-1 pr-2.5 py-1 text-xs hover:border-gold/40 hover:text-gold rounded-md transition-colors"
                            >
                              {stop.imageUrl && (
                                <div className="relative h-4 w-4 rounded overflow-hidden shrink-0 border border-border/40">
                                  <Image
                                    src={stop.imageUrl}
                                    alt={stop.name}
                                    fill
                                    sizes="16px"
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-muted-foreground text-[10px]">
                                {i + 1}.
                              </span>
                              <span className="truncate max-w-[120px]">
                                {stop.name}
                              </span>
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
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border/40">
                    <Link
                      href={`/tours#${tour.id}`}
                      className="text-sm text-gold underline-offset-4 hover:underline"
                    >
                      Deep link
                    </Link>
                    {journeySlug ? (
                      <Link
                        href={`/journeys/${journeySlug}`}
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline flex items-center gap-1"
                      >
                        Open map journey →
                      </Link>
                    ) : (
                      <Link
                        href="/journeys"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline flex items-center gap-1"
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
