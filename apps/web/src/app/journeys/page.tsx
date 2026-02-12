'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, MapPin, Clock, BookOpen, Loader2, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import journeysData from '@/data/journeys.json';
import pantheonsData from '@/data/pantheons.json';

// Dynamic import for mini-map preview
const JourneyPreviewMap = dynamic(
  () => import('@/components/maps/JourneyPreviewMap').then((mod) => mod.JourneyPreviewMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-48 rounded-lg bg-muted/50">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    ),
  }
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

// Pantheon colors
const PANTHEON_COLORS: Record<string, { bg: string; label: string }> = {
  'greek-pantheon': { bg: '#3b82f6', label: 'Greek' },
  'norse-pantheon': { bg: '#8b5cf6', label: 'Norse' },
  'egyptian-pantheon': { bg: '#f59e0b', label: 'Egyptian' },
  'roman-pantheon': { bg: '#ef4444', label: 'Roman' },
  'hindu-pantheon': { bg: '#f97316', label: 'Hindu' },
  'japanese-pantheon': { bg: '#ec4899', label: 'Japanese' },
  'celtic-pantheon': { bg: '#22c55e', label: 'Celtic' },
  'aztec-pantheon': { bg: '#14b8a6', label: 'Aztec' },
  'chinese-pantheon': { bg: '#e11d48', label: 'Chinese' },
  'mesopotamian-pantheon': { bg: '#a16207', label: 'Mesopotamian' },
};

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
    const totalWaypoints = journeys.reduce((acc, j) => acc + j.waypoints.length, 0);
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
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Compass className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Epic Voyages
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Hero Journeys
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Trace the legendary voyages of mythological heroes across the ancient world
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 mb-12">
          {[
            { label: 'Epic Journeys', value: stats.journeys, icon: Compass },
            { label: 'Waypoints', value: stats.waypoints, icon: MapPin },
            { label: 'Heroes', value: stats.heroes, icon: Users },
            { label: 'Pantheons', value: stats.pantheons, icon: BookOpen },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card px-4 py-3 text-center"
            >
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-gold" />
              <div className="text-2xl font-serif font-semibold text-gold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Journey Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {journeys.map((journey, index) => {
            const colors = PANTHEON_COLORS[journey.pantheonId] || { bg: '#6b7280', label: 'Unknown' };
            const pantheon = pantheons.find((p) => p.id === journey.pantheonId);

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
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <JourneyPreviewMap
                      waypoints={journey.waypoints}
                      pantheonId={journey.pantheonId}
                      isHovered={hoveredJourney === journey.id}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

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
                      <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
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
                          <span className="font-medium text-foreground">{journey.heroName}</span>
                          {' '}&bull;{' '}
                          <span>{journey.duration}</span>
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
          <div className="inline-flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gold/10 via-transparent to-gold/5 border border-gold/20">
            <div className="max-w-lg">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                More Journeys Coming Soon
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                We're mapping more legendary voyages from Norse, Egyptian, and other mythologies.
                Check back for new adventures!
              </p>
              <Link href="/stories">
                <Button variant="outline" className="border-gold/30 hover:bg-gold/10 hover:text-gold">
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
