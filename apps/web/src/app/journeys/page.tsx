"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Compass,
  MapPin,
  BookOpen,
  Loader2,
  ChevronRight,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import journeysData from "@/data/journeys.json";
import pantheonsData from "@/data/pantheons.json";
import { PANTHEON_BG_LABEL as PANTHEON_COLORS } from "@/lib/pantheon-colors";

// Dynamic import for mini-map preview
const JourneyPreviewMap = dynamic(
  () =>
    import("@/components/maps/JourneyPreviewMap").then(
      (mod) => mod.JourneyPreviewMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-48 rounded-lg bg-muted/50">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    ),
  },
);

// Types
interface Waypoint {
  id: string;
  name: string;
  coordinates: [number, number];
  order: number;
  description: string;
  events?: string[];
}

interface Journey {
  id: string;
  heroId: string;
  heroName: string;
  title: string;
  slug: string;
  description: string;
  pantheonId: string;
  duration: string;
  imageUrl?: string;
  source: string;
  waypoints: Waypoint[];
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
}

export default function JourneysPage() {
  const journeys = journeysData as unknown as Journey[];
  const pantheons = pantheonsData as Pantheon[];
  const [hoveredJourney, setHoveredJourney] = useState<string | null>(null);

  // Get unique pantheons from journeys
  const pantheonsWithJourneys = useMemo(() => {
    const ids = new Set(journeys.map((j) => j.pantheonId));
    return pantheons.filter((p) => ids.has(p.id));
  }, [journeys, pantheons]);

  // Stats
  const stats = useMemo(() => {
    const totalWaypoints = journeys.reduce(
      (acc, j) => acc + j.waypoints.length,
      0,
    );
    const heroes = new Set(journeys.map((j) => j.heroName)).size;
    return {
      journeys: journeys.length,
      waypoints: totalWaypoints,
      heroes,
      pantheons: pantheonsWithJourneys.length,
    };
  }, [journeys, pantheonsWithJourneys]);

  return (
    <div className="min-h-screen">
      <PageHero
        mark="compass"
        tagline="Epic Voyages"
        title="Hero Journeys"
        description="Trace the legendary voyages of mythological heroes across the ancient world"
      />

      {/* Content Section */}
      <div className="page-shell bg-mythic">
        <Breadcrumbs />
        <p className="mt-4 text-sm text-muted-foreground">
          Prefer a shorter study walk?{" "}
          <Link
            href="/tours"
            className="text-gold underline-offset-4 hover:underline"
          >
            Open guided tours
          </Link>
          .
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 mb-12">
          {[
            { label: "Epic Journeys", value: stats.journeys, icon: Compass },
            { label: "Waypoints", value: stats.waypoints, icon: MapPin },
            { label: "Heroes", value: stats.heroes, icon: Users },
            { label: "Pantheons", value: stats.pantheons, icon: BookOpen },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-4 py-3 text-center"
            >
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-gold" />
              <div className="text-2xl font-serif font-semibold text-gold">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Journey Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {journeys.map((journey) => {
            const colors = PANTHEON_COLORS[journey.pantheonId] || {
              bg: "#6b7280",
              label: "Unknown",
            };

            return (
              <Link
                key={journey.id}
                href={`/journeys/${journey.slug}`}
                className="group"
                onMouseEnter={() => setHoveredJourney(journey.id)}
                onMouseLeave={() => setHoveredJourney(null)}
              >
                <Card
                  asArticle
                  className="h-full cursor-pointer overflow-hidden bg-card hover:border-gold/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Color accent bar */}
                  <div className="h-1" style={{ backgroundColor: colors.bg }} />

                  {/* Mini Map Preview */}
                  <div className="relative h-48 bg-midnight overflow-hidden">
                    <JourneyPreviewMap
                      waypoints={journey.waypoints}
                      pantheonId={journey.pantheonId}
                      isHovered={hoveredJourney === journey.id}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />

                    {/* Overlay badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge
                        className="text-xs font-medium text-white border-0"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {colors.label}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-background/80 backdrop-blur-sm"
                      >
                        {journey.waypoints.length} stops
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl group-hover:text-gold transition-colors">
                          {journey.title}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          <span className="font-medium text-foreground">
                            {journey.heroName}
                          </span>{" "}
                          &bull; <span>{journey.duration}</span>
                        </CardDescription>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted shrink-0 group-hover:bg-gold/20 transition-colors">
                        <Compass className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {journey.description}
                    </p>

                    {/* Journey highlights */}
                    <div className="flex flex-wrap gap-2">
                      {journey.waypoints.slice(0, 3).map((wp) => (
                        <Badge
                          key={wp.id}
                          variant="outline"
                          className="text-xs border-border/50 text-muted-foreground"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {wp.name}
                        </Badge>
                      ))}
                      {journey.waypoints.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-border/50 text-muted-foreground"
                        >
                          +{journey.waypoints.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Source */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground truncate max-w-[70%]">
                        {journey.source}
                      </span>
                      <span className="flex items-center text-xs font-medium text-gold group-hover:translate-x-1 transition-transform">
                        Explore <ChevronRight className="h-3 w-3 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-6 rounded-2xl bg-linear-to-br from-gold/10 via-transparent to-gold/5 border border-gold/20">
            <div className="max-w-lg">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Want another voyage?
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Explore story pages for Norse, Egyptian, and other traditions
                while more guided journeys are mapped.
              </p>
              <Link href="/stories">
                <Button
                  variant="outline"
                  className="border-gold/30 hover:bg-gold/10 hover:text-gold"
                >
                  Explore Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
