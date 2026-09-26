"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  BookOpen,
  Loader2,
  ChevronRight,
  Users,
  Scroll,
  Sparkles,
  Skull,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { OtherworldRoute } from "@/components/maps/OtherworldRoute";
import {
  isOtherworldJourney,
  mappedWaypoints,
  sortWaypoints,
  type JourneyDetail,
  type JourneyWaypoint,
} from "@/lib/journeys";
import { PANTHEON_BG_LABEL as PANTHEON_COLORS } from "@/lib/pantheon-colors";

// Dynamic import for the journey map
const JourneyMap = dynamic(
  () => import("@/components/maps/JourneyMap").then((mod) => mod.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-125 rounded-xl border border-border bg-card">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading journey map...
          </p>
        </div>
      </div>
    ),
  },
);

type Waypoint = JourneyWaypoint;

interface JourneyPageClientProps {
  /** The journey, read on the server. */
  journey: JourneyDetail;
  /** Its tradition, for the "explore more" link. */
  pantheon?: { name: string; slug: string };
}

export function JourneyPageClient({
  journey,
  pantheon,
}: Readonly<JourneyPageClientProps>) {
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(
    null,
  );
  const otherworld = isOtherworldJourney(journey);

  const sortedWaypoints = useMemo(
    () => sortWaypoints(journey.waypoints),
    [journey],
  );
  const mapJourney = useMemo(
    () => ({ ...journey, waypoints: mappedWaypoints(journey.waypoints) }),
    [journey],
  );

  const handleWaypointSelect = useCallback((waypoint: Waypoint | null) => {
    setSelectedWaypoint(waypoint);
  }, []);

  const colors = PANTHEON_COLORS[journey.pantheonId] || {
    bg: "#6b7280",
    label: "Unknown",
  };

  // Current waypoint (default to first if none selected)
  const currentWaypoint = selectedWaypoint || sortedWaypoints[0];

  return (
    <div className="min-h-screen">
      <ItemListJsonLd
        name={journey.title}
        description={journey.description}
        url={`/journeys/${journey.slug}`}
        items={sortedWaypoints.map((waypoint, index) => ({
          name: waypoint.name,
          url: `/journeys/${journey.slug}`,
          position: index + 1,
        }))}
      />
      {/* Hero Section */}
      <div className="relative h-[35vh] min-h-70 flex items-center justify-center overflow-hidden">
        {/* Background */}
        {journey.imageUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={journey.imageUrl}
              alt={journey.title}
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-30 object-center scale-105"
            />
          </div>
        )}
        <div className="absolute inset-0 z-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-linear-to-b from-midnight/80 via-midnight/70 to-midnight/90 z-10" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial via-transparent to-transparent z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.bg}20, transparent)`,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge className="border-0 bg-gold text-sm font-medium text-midnight">
              {colors.label} Mythology
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {journey.duration}
            </Badge>
          </div>
          <h1 className="page-title text-parchment mb-4">{journey.title}</h1>
          <p className="text-lg text-parchment/70 max-w-2xl mx-auto font-body">
            {otherworld ? "Travel the realms with " : "The epic voyage of "}
            <span className="text-gold font-medium">{journey.heroName}</span>
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-8 bg-mythic">
        {/* Back link and Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/journeys"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Journeys
          </Link>
          <Breadcrumbs />
        </div>

        {/* Main Layout: Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="min-w-0 lg:col-span-2">
            {otherworld ? (
              <>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  These realms belong to the mythic cosmos, not an earthly map,
                  so the route is shown in order instead of as pins.
                </p>
                <OtherworldRoute
                  waypoints={sortedWaypoints}
                  color={colors.bg}
                  selectedWaypointId={currentWaypoint?.id}
                  onWaypointSelect={handleWaypointSelect}
                />
              </>
            ) : (
              <>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  This map illustrates the story’s route. Pins and connecting
                  lines are not evidence of an exact historical itinerary; some
                  locations are disputed or belong to the mythical world.
                </p>
                <div className="rounded-xl overflow-hidden border border-border shadow-lg h-150">
                  <JourneyMap
                    journey={mapJourney}
                    onWaypointSelect={handleWaypointSelect}
                    selectedWaypointId={selectedWaypoint?.id}
                  />
                </div>
              </>
            )}

            {/* Journey Description */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5 text-gold" />
                  About This Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {journey.description}
                </p>
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span>{sortedWaypoints.length} waypoints</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gold" />
                    <span>{journey.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-gold" />
                    <span>{journey.source}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Waypoint Details + List */}
          <div className="space-y-6">
            {/* Current Waypoint Details */}
            {currentWaypoint && (
              <Card
                className="border-2"
                style={{ borderColor: colors.bg + "40" }}
              >
                <div className="h-1" style={{ backgroundColor: colors.bg }} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-white"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {currentWaypoint.order}
                    </div>
                    <div>
                      <CardTitle>{currentWaypoint.name}</CardTitle>
                      {currentWaypoint.duration && (
                        <CardDescription>
                          {currentWaypoint.duration}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentWaypoint.description}
                  </p>
                  {currentWaypoint.locationId ? (
                    <Link
                      href={`/locations/${currentWaypoint.locationId}`}
                      className="inline-flex min-h-11 items-center text-sm text-gold-text underline-offset-4 hover:underline"
                    >
                      Read about {currentWaypoint.name} →
                    </Link>
                  ) : null}

                  {/* Events */}
                  {currentWaypoint.events &&
                    currentWaypoint.events.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Key Events
                        </h4>
                        <ul className="space-y-1">
                          {currentWaypoint.events.map((event, index) => (
                            <li
                              key={`${event}-${index}`}
                              className="text-sm text-foreground flex items-start gap-2"
                            >
                              <ChevronRight className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Creatures */}
                  {currentWaypoint.creatures &&
                    currentWaypoint.creatures.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Skull className="h-3 w-3" /> Creatures Encountered
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentWaypoint.creatures.map((creature) => (
                            <Badge
                              key={creature}
                              variant="outline"
                              className="text-xs border-red-500/30 text-red-400"
                            >
                              {creature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Deities */}
                  {currentWaypoint.deities &&
                    currentWaypoint.deities.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Users className="h-3 w-3" /> Divine Involvement
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentWaypoint.deities.map((deity) => (
                            <Badge
                              key={deity}
                              variant="outline"
                              className="text-xs border-gold/30 text-gold"
                            >
                              {deity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Waypoints List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  All Waypoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-100 overflow-y-auto pr-2 scrollbar-thin">
                  {sortedWaypoints.map((waypoint) => {
                    const isSelected = selectedWaypoint?.id === waypoint.id;
                    return (
                      <button
                        key={waypoint.id}
                        onClick={() => setSelectedWaypoint(waypoint)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? "bg-gold/20 border border-gold/30"
                            : "hover:bg-muted border border-transparent"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? "text-white" : "text-white/80"
                          }`}
                          style={{
                            backgroundColor: isSelected
                              ? colors.bg
                              : colors.bg + "80",
                          }}
                        >
                          {waypoint.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {waypoint.name}
                          </div>
                          {waypoint.duration && (
                            <div className="text-xs text-muted-foreground truncate">
                              {waypoint.duration}
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 ${
                            isSelected ? "text-gold" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Content */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="font-serif text-2xl font-semibold mb-6">
            Explore More
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={pantheon ? `/pantheons/${pantheon.slug}` : "/pantheons"}
            >
              <Card
                interactive
                className="h-full hover:border-gold/50 transition-colors cursor-pointer"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.bg + "20" }}
                  >
                    <BookOpen
                      className="h-6 w-6"
                      style={{ color: colors.bg }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {pantheon?.name || "All traditions"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore the {colors.label} gods
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/stories">
              <Card
                interactive
                className="h-full hover:border-gold/50 transition-colors cursor-pointer"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gold/20">
                    <Scroll className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium">Related Stories</h3>
                    <p className="text-sm text-muted-foreground">
                      More epic tales
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/locations">
              <Card
                interactive
                className="h-full hover:border-gold/50 transition-colors cursor-pointer"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-patina/20">
                    <MapPin className="h-6 w-6 text-patina" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sacred Locations</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore the ancient world
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
