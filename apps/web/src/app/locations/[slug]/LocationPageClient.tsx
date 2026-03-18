"use client";

import { BreadcrumbJsonLd, PlaceJsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import { siteConfig } from "@/lib/metadata";
import { ChevronRight, Compass, Globe, MapPin, Mountain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────
interface Location {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl?: string;
}

interface LocationPageClientProps {
  slug: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────
function formatLocationType(type: string): string {
  return type.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

const LOCATION_TYPE_COLORS: Record<string, string> = {
  mountain: "bg-emerald-900/30 text-emerald-300 border-emerald-500/30",
  realm: "bg-purple-900/30 text-purple-300 border-purple-500/30",
  sacred_site: "bg-amber-900/30 text-amber-300 border-amber-500/30",
  city: "bg-blue-900/30 text-blue-300 border-blue-500/30",
  underworld: "bg-red-900/30 text-red-300 border-red-500/30",
  body_of_water: "bg-cyan-900/30 text-cyan-300 border-cyan-500/30",
  temple: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  forest: "bg-green-900/30 text-green-300 border-green-500/30",
  cosmic: "bg-indigo-900/30 text-indigo-300 border-indigo-500/30",
};

function getTypeColor(type: string): string {
  return (
    LOCATION_TYPE_COLORS[type] ||
    "bg-slate-800/50 text-slate-300 border-slate-600/30"
  );
}

const LOCATION_TYPE_ICONS: Record<string, typeof MapPin> = {
  mountain: Mountain,
  body_of_water: Compass,
};

function getTypeIcon(type: string) {
  return LOCATION_TYPE_ICONS[type] || MapPin;
}

// ─── Component ──────────────────────────────────────────────────────────
export function LocationPageClient({ slug }: LocationPageClientProps) {
  const location = (locations as Location[]).find((l) => l.id === slug);
  const pantheon = pantheons.find((p) => p.id === location?.pantheonId);

  if (!location) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Location Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            The mythical place you seek is lost to the ages.
          </p>
          <Link
            href="/locations"
            className="text-emerald-500 hover:underline mt-4 inline-block"
          >
            Return to Locations
          </Link>
        </div>
      </div>
    );
  }

  const pantheonName = pantheon?.name || "Ancient";
  const TypeIcon = getTypeIcon(location.locationType);
  const typeLabel = formatLocationType(location.locationType);
  const hasCoordinates =
    location.latitude != null && location.longitude != null;

  // Find related locations from same pantheon (excluding current)
  const relatedLocations = (locations as Location[])
    .filter((l) => l.pantheonId === location.pantheonId && l.id !== location.id)
    .slice(0, 6);

  const breadcrumbItems = [
    { name: "Home", item: siteConfig.url },
    { name: "Locations", item: `${siteConfig.url}/locations` },
    {
      name: pantheonName,
      item: `${siteConfig.url}/pantheons/${pantheon?.slug || ""}`,
    },
    { name: location.name, item: `${siteConfig.url}/locations/${location.id}` },
  ];

  return (
    <div className="min-h-screen">
      <PlaceJsonLd
        name={location.name}
        description={location.description}
        url={`/locations/${location.id}`}
        image={location.imageUrl}
        latitude={location.latitude}
        longitude={location.longitude}
        locationType={location.locationType}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/80 via-slate-900/90 to-slate-950 z-10" />
        </div>

        {/* Abstract Emerald Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-radial-gradient from-emerald-900/10 to-transparent pointer-events-none z-0" />

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
          <Link
            href="/locations"
            className="text-sm text-slate-400 hover:text-white mb-6 inline-block transition-colors"
          >
            ← Back to Locations
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={`${getTypeColor(location.locationType)} border text-sm font-medium px-3 py-1`}
              >
                {/* eslint-disable-next-line react-hooks/static-components -- dynamic icon from module-scope lookup */}
                <TypeIcon className="h-3.5 w-3.5 mr-1.5" />
                {typeLabel}
              </Badge>
              <Badge
                variant="outline"
                className="bg-slate-800/50 text-slate-300 border-slate-600/30 text-sm px-3 py-1"
              >
                <Globe className="h-3.5 w-3.5 mr-1.5" />
                {pantheonName}
              </Badge>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
              {location.name}
            </h1>

            {hasCoordinates && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Compass className="h-4 w-4" />
                <span>
                  {Math.abs(location.latitude!)}°
                  {location.latitude! >= 0 ? "N" : "S"},{" "}
                  {Math.abs(location.longitude!)}°
                  {location.longitude! >= 0 ? "E" : "W"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Section ─────────────────────────────────────────── */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* Hero Image */}
          {location.imageUrl && (
            <div className="relative w-full max-w-lg mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800">
              <div className="aspect-video relative">
                <Image
                  src={location.imageUrl}
                  alt={location.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
              </div>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* ── Left Column: Details ──────────────────────────────── */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    Key Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Type
                    </p>
                    <Badge
                      variant="secondary"
                      className={`${getTypeColor(location.locationType)} border`}
                    >
                      {typeLabel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Mythology
                    </p>
                    <p className="text-slate-300 font-medium">{pantheonName}</p>
                  </div>
                  {hasCoordinates && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Coordinates
                      </p>
                      <p className="text-slate-300 text-sm font-mono">
                        {Math.abs(location.latitude!)}°
                        {location.latitude! >= 0 ? "N" : "S"},{" "}
                        {Math.abs(location.longitude!)}°
                        {location.longitude! >= 0 ? "E" : "W"}
                      </p>
                    </div>
                  )}
                  {!hasCoordinates && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Realm
                      </p>
                      <p className="text-sm text-slate-400 italic">
                        Mythological / Non-physical
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column: Description ─────────────────────────── */}
            <div className="md:col-span-2">
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">
                    About This Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {location.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Related Locations ────────────────────────────────────── */}
          {relatedLocations.length > 0 && (
            <div className="pt-4">
              <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <ChevronRight className="h-5 w-5 text-emerald-500" />
                More from {pantheonName}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedLocations.map((related) => {
                  const relatedType = formatLocationType(related.locationType);
                  return (
                    <Link key={related.id} href={`/locations/${related.id}`}>
                      <Card className="group h-full bg-slate-900/30 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
                        {related.imageUrl && (
                          <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
                            <Image
                              src={related.imageUrl}
                              alt={related.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />
                          </div>
                        )}
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base font-serif group-hover:text-emerald-400 transition-colors">
                              {related.name}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={`${getTypeColor(related.locationType)} border text-[10px] shrink-0`}
                            >
                              {relatedType}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {related.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
