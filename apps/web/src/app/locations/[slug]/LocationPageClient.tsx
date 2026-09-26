"use client";

import { BreadcrumbJsonLd, PlaceJsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/sharing/ShareButton";
import { IllustrativeImageCaption } from "@/components/content/IllustrativeImageCaption";
import type { ImageNote } from "@/lib/image-provenance";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import { siteConfig } from "@/lib/metadata";
import {
  ChevronRight,
  Compass,
  Globe,
  Loader2,
  MapPin,
  Mountain,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";

// Dynamic import with SSR disabled - Leaflet requires the window object.
// Fixed height matches the loaded component's own height so nothing shifts
// when the map swaps in (avoids CLS).
const LocationMapInset = dynamic(
  () =>
    import("@/components/locations/LocationMapInset").then(
      (mod) => mod.LocationMapInset,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    ),
  },
);

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
  detailedBio?: string;
  primarySources?: Array<{
    text: string;
    source: string;
    date?: string;
  }>;
}

interface LocationPageClientProps {
  slug: string;
  /** Image provenance for the caption, resolved on the server. */
  imageNote?: ImageNote;
}

// ─── Helpers ────────────────────────────────────────────────────────────
function formatLocationType(type: string): string {
  return type.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

const LOCATION_TYPE_COLORS: Record<string, string> = {
  mountain: "bg-gold/10 text-gold-text border-gold/30",
  realm: "bg-gold/10 text-gold-text border-gold/30",
  sacred_site: "bg-gold/10 text-gold-text border-gold/30",
  city: "bg-gold/10 text-gold-text border-gold/30",
  underworld: "bg-gold/10 text-gold-text border-gold/30",
  body_of_water: "bg-gold/10 text-gold-text border-gold/30",
  temple: "bg-gold/10 text-gold-text border-gold/30",
  forest: "bg-gold/10 text-gold-text border-gold/30",
  cosmic: "bg-gold/10 text-gold-text border-gold/30",
};

function getTypeColor(type: string): string {
  return (
    LOCATION_TYPE_COLORS[type] || "bg-gold/10 text-gold-text border-gold/30"
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
export function LocationPageClient({
  slug,
  imageNote,
}: LocationPageClientProps) {
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

  // Same-pantheon locations for the map inset's faint context markers
  // (unbounded, unlike the "More from" grid above, so the inset shows the
  // full geographic picture rather than just the first six cards).
  const pantheonMapLocations = (locations as Location[]).filter(
    (l) => l.pantheonId === location.pantheonId && l.id !== location.id,
  );

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
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-midnight/85 via-midnight/90 to-midnight z-10" />
        </div>

        {/* Abstract Emerald Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-radial-gradient from-emerald-900/10 to-transparent pointer-events-none z-0" />

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
          <Link
            href="/locations"
            className="text-sm text-parchment/80 hover:text-parchment mb-6 inline-block transition-colors"
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
                className="bg-midnight-light/50 text-parchment/75 border-border/40 text-sm px-3 py-1"
              >
                <Globe className="h-3.5 w-3.5 mr-1.5" />
                {pantheonName}
              </Badge>
            </div>

            <h1 className="page-title text-parchment">{location.name}</h1>
            {location.detailedBio && (
              <p className="max-w-2xl text-lg leading-relaxed text-parchment/85">
                {location.description}
              </p>
            )}
            <nav
              aria-label="On this page"
              className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-sm text-parchment"
            >
              <a
                href="#about"
                className="inline-flex min-h-11 items-center underline underline-offset-4"
              >
                About {location.name}
              </a>
              {location.primarySources?.length ? (
                <a
                  href="#source-notes"
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  Source notes
                </a>
              ) : null}
            </nav>
            <ShareButton
              surface="location_page"
              title={`${location.name} - Mythos Atlas`}
              text={`Explore ${location.name}, a sacred place in ${pantheonName} mythology, on Mythos Atlas`}
              url={`https://mythosatlas.com/locations/${location.id}`}
              className="w-fit"
            />

            {hasCoordinates && (
              <div className="flex items-center gap-2 text-parchment/80 text-sm">
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
            <figure className="w-full max-w-lg border border-border">
              <div className="aspect-video relative">
                <Image
                  src={location.imageUrl}
                  alt={location.name}
                  fill
                  sizes="(min-width: 768px) 32rem, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
              </div>
              <IllustrativeImageCaption
                note={imageNote}
                subject={`Illustration of ${location.name}`}
                className="px-3 py-2"
              />
            </figure>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* ── Left Column: Details ──────────────────────────────── */}
            <div className="order-last min-w-0 md:order-first md:col-span-1 space-y-6">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    Key Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Mythology
                    </p>
                    <p className="text-foreground font-medium">
                      {pantheonName}
                    </p>
                  </div>
                  {hasCoordinates && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Coordinates
                      </p>
                      <p className="text-foreground text-sm font-mono">
                        {Math.abs(location.latitude!)}°
                        {location.latitude! >= 0 ? "N" : "S"},{" "}
                        {Math.abs(location.longitude!)}°
                        {location.longitude! >= 0 ? "E" : "W"}
                      </p>
                    </div>
                  )}
                  {!hasCoordinates && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Realm
                      </p>
                      <p className="text-muted-foreground text-sm italic">
                        Mythological / Non-physical
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    On the Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationMapInset
                    location={{
                      id: location.id,
                      name: location.name,
                      locationType: location.locationType,
                      pantheonId: location.pantheonId,
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    relatedLocations={pantheonMapLocations}
                    pantheonName={pantheonName}
                  />
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column: Description ─────────────────────────── */}
            <div className="min-w-0 md:col-span-2">
              <section id="about" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="page-section-title">About This Location</h2>
                </div>
                <div className="space-y-6">
                  {location.detailedBio ? (
                    <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-gold-text prose-a:text-gold dark:prose-a:text-gold-light max-w-none leading-relaxed">
                      <ReactMarkdown>{location.detailedBio}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {location.description}
                    </p>
                  )}
                  <SourceProvenance sources={location.primarySources} />
                  <CatalogSourceNotes sources={location.primarySources} />
                </div>
              </section>
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
                      <Card
                        interactive
                        className="group h-full bg-card/30 border-border hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
                      >
                        {related.imageUrl && (
                          <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
                            <Image
                              src={related.imageUrl}
                              alt={related.name}
                              fill
                              sizes="100vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-midnight/80 to-transparent" />
                          </div>
                        )}
                        <CardHeader className="p-4 pb-2">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <CardTitle className="text-base font-serif group-hover:text-gold-text transition-colors">
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
