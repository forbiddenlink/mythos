'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, List, Map, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import locationsData from '@/data/locations.json';
import pantheonsData from '@/data/pantheons.json';

// Dynamic import with SSR disabled - Leaflet requires the window object
const MapVisualization = dynamic(
  () =>
    import('@/components/locations/MapVisualization').then(
      (mod) => mod.MapVisualization
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] rounded-xl border border-border bg-card">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
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
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
}

// ─── Pantheon color mapping (shared with MapVisualization) ──────────────
const PANTHEON_COLORS: Record<string, { bg: string; label: string }> = {
  'greek-pantheon':    { bg: '#3b82f6', label: 'Greek' },
  'norse-pantheon':    { bg: '#8b5cf6', label: 'Norse' },
  'egyptian-pantheon': { bg: '#f59e0b', label: 'Egyptian' },
  'roman-pantheon':    { bg: '#ef4444', label: 'Roman' },
  'hindu-pantheon':    { bg: '#f97316', label: 'Hindu' },
  'japanese-pantheon': { bg: '#ec4899', label: 'Japanese' },
  'celtic-pantheon':   { bg: '#22c55e', label: 'Celtic' },
  'aztec-pantheon':    { bg: '#14b8a6', label: 'Aztec' },
  'chinese-pantheon':  { bg: '#e11d48', label: 'Chinese' },
};

function getLocationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    temple: 'Temple',
    city: 'City',
    realm: 'Realm',
    mountain: 'Mountain',
    monument: 'Monument',
    sacred_site: 'Sacred Site',
    tomb: 'Tomb',
    underworld: 'Underworld',
    mythical_realm: 'Mythical Realm',
  };
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Page Component ─────────────────────────────────────────────────────
export default function LocationsPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const locations = locationsData as Location[];
  const pantheons = pantheonsData as Pantheon[];

  const locationStats = useMemo(() => {
    const total = locations.length;
    const mappable = locations.filter((l) => l.latitude !== null && l.longitude !== null).length;
    const mythical = total - mappable;
    const types = new Set(locations.map((l) => l.locationType)).size;
    return { total, mappable, mythical, types };
  }, [locations]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background - dark gradient since no hero image yet */}
        <div className="absolute inset-0 z-0 bg-hero-gradient" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <MapPin className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Sacred Geography
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Locations
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Explore temples, sacred sites, and mythical realms across ancient civilizations
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16 bg-mythic">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Breadcrumbs />
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Locations', value: locationStats.total },
            { label: 'On Map', value: locationStats.mappable },
            { label: 'Mythical Realms', value: locationStats.mythical },
            { label: 'Location Types', value: locationStats.types },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-4 py-3 text-center"
            >
              <div className="text-2xl font-serif font-semibold text-gold">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <MapVisualization locations={locations} pantheons={pantheons} />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => {
              const colors = PANTHEON_COLORS[location.pantheonId] || {
                bg: '#6b7280',
                label: location.pantheonId,
              };
              const hasCords = location.latitude !== null && location.longitude !== null;

              return (
                <Card
                  key={location.id}
                  className="group h-full card-elevated bg-card hover:scale-[1.01] overflow-hidden"
                >
                  {/* Pantheon color bar */}
                  <div
                    className="h-0.5"
                    style={{
                      background: `linear-gradient(to right, transparent, ${colors.bg}, transparent)`,
                    }}
                  />

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="p-2.5 rounded-xl border border-border/50 group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundColor: `${colors.bg}15` }}
                      >
                        <MapPin
                          className="h-5 w-5"
                          strokeWidth={1.5}
                          style={{ color: colors.bg }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] border"
                          style={{
                            backgroundColor: `${colors.bg}15`,
                            borderColor: `${colors.bg}30`,
                            color: colors.bg,
                          }}
                        >
                          {colors.label}
                        </Badge>
                        {!hasCords && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-gold/20 text-gold/70"
                          >
                            Mythical
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-foreground mt-3 group-hover:text-gold transition-colors duration-300">
                      {location.name}
                    </CardTitle>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getLocationTypeLabel(location.locationType)}
                    </span>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {location.description}
                    </p>
                    {hasCords && (
                      <p className="text-xs text-muted-foreground/60 mt-3 font-mono">
                        {location.latitude?.toFixed(2)}, {location.longitude?.toFixed(2)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Mobile: show list below map */}
        {viewMode === 'map' && (
          <div className="mt-8 block lg:hidden">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              All Locations
            </h3>
            <div className="space-y-3">
              {locations.map((location) => {
                const colors = PANTHEON_COLORS[location.pantheonId] || {
                  bg: '#6b7280',
                  label: location.pantheonId,
                };
                const hasCords =
                  location.latitude !== null && location.longitude !== null;

                return (
                  <div
                    key={location.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span
                      className="mt-1.5 w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colors.bg }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-semibold text-sm text-foreground truncate">
                          {location.name}
                        </h4>
                        {!hasCords && (
                          <span className="text-[10px] text-gold/70 shrink-0">
                            Mythical
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {getLocationTypeLabel(location.locationType)}
                        </span>
                        <span className="text-border">|</span>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: colors.bg }}
                        >
                          {colors.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {location.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
