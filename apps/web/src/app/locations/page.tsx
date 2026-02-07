'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, List, Map, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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

// ─── Constants ──────────────────────────────────────────────────────────
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
  const locations = locationsData as Location[];
  const pantheons = pantheonsData as Pantheon[];

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePantheons, setActivePantheons] = useState<Set<string>>(
    new Set(pantheons.map((p) => p.id))
  );
  const [activeLocationTypes, setActiveLocationTypes] = useState<Set<string>>(
    new Set(locations.map((l) => l.locationType))
  );

  // Derived filters
  const allLocationTypes = useMemo(() =>
    Array.from(new Set(locations.map(l => l.locationType))).sort(),
    [locations]);

  const pantheonsWithLocations = useMemo(() => {
    const ids = new Set(locations.map((loc) => loc.pantheonId));
    return pantheons.filter((p) => ids.has(p.id));
  }, [locations, pantheons]);

  // Filtering Logic
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesPantheon = activePantheons.has(loc.pantheonId);
      const matchesType = activeLocationTypes.has(loc.locationType);
      const matchesSearch = searchQuery === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPantheon && matchesType && matchesSearch;
    });
  }, [locations, activePantheons, activeLocationTypes, searchQuery]);

  const togglePantheon = (id: string) => {
    setActivePantheons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleLocationType = (type: string) => {
    setActiveLocationTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleAll = (type: 'pantheons' | 'types') => {
    if (type === 'pantheons') {
      setActivePantheons(prev => prev.size === pantheonsWithLocations.length ? new Set() : new Set(pantheonsWithLocations.map(p => p.id)));
    } else {
      setActiveLocationTypes(prev => prev.size === allLocationTypes.length ? new Set() : new Set(allLocationTypes));
    }
  };

  const locationStats = useMemo(() => {
    // Stats based on FILTERED locations
    const total = filteredLocations.length;
    const mappable = filteredLocations.filter((l) => l.latitude !== null && l.longitude !== null).length;
    const mythical = total - mappable;
    // Count of types present in current selection
    const types = new Set(filteredLocations.map((l) => l.locationType)).size;
    return { total, mappable, mythical, types };
  }, [filteredLocations]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[45vh] min-h-[360px] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <MapPin className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">Sacred Geography</span>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-parchment">Locations</h1>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Explore temples, sacred sites, and mythical realms across ancient civilizations
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">

        {/* Controls Bar */}
        <div className="sticky top-20 z-30 mb-8 bg-background/95 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm transition-all">
          <div className="flex flex-col gap-6">

            {/* Top Row: Breadcrumbs + Search + View Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border/50 pb-4">
              <Breadcrumbs />

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0">
                  <Button variant={viewMode === 'map' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('map')} className="gap-2 h-8">
                    <Map className="h-4 w-4" /> <span className="hidden sm:inline">Map</span>
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="gap-2 h-8">
                    <List className="h-4 w-4" /> <span className="hidden sm:inline">List</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pantheon Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pantheons</label>
                  <button onClick={() => toggleAll('pantheons')} className="text-xs text-gold hover:text-gold/80 font-medium">
                    {activePantheons.size === pantheonsWithLocations.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                  {pantheonsWithLocations.map(p => {
                    const colors = PANTHEON_COLORS[p.id];
                    const isActive = activePantheons.has(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePantheon(p.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isActive
                          ? 'border-transparent text-white'
                          : 'border-border text-muted-foreground bg-muted/30 hover:bg-muted'
                          }`}
                        style={isActive ? { backgroundColor: colors.bg } : undefined}
                      >
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Location Type Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Types</label>
                  <button onClick={() => toggleAll('types')} className="text-xs text-gold hover:text-gold/80 font-medium">
                    {activeLocationTypes.size === allLocationTypes.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                  {allLocationTypes.map(type => {
                    const isActive = activeLocationTypes.has(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleLocationType(type)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isActive
                          ? 'bg-gold/20 border-gold/30 text-gold-light font-medium'
                          : 'border-border text-muted-foreground bg-muted/30 hover:bg-muted'
                          }`}
                      >
                        {getLocationTypeLabel(type)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Locations Shown', value: locationStats.total },
            { label: 'On Map', value: locationStats.mappable },
            { label: 'Mythical Realms', value: locationStats.mythical },
            { label: 'Types Shown', value: locationStats.types },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3 text-center">
              <div className="text-2xl font-serif font-semibold text-gold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mobile Controls (Toggle) - Only visible on small screens */}
        <div className="md:hidden flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50 shrink-0 mb-4 mx-auto w-fit">
          <Button variant={viewMode === 'map' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('map')} className="gap-2 h-8">
            <Map className="h-4 w-4" /> Map
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="gap-2 h-8">
            <List className="h-4 w-4" /> List
          </Button>
        </div>

        {/* Split View Content */}
        <div className="flex flex-col-reverse lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">

          {/* List Side (Left) - Always visible on desktop, toggled on mobile */}
          <div className={`lg:w-1/3 flex flex-col h-full bg-card/30 rounded-xl border border-border overflow-hidden ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <List className="h-4 w-4 text-gold" /> Locations ({filteredLocations.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {filteredLocations.map((location) => {
                const pantheon = pantheons.find(p => p.id === location.pantheonId);
                const colors = PANTHEON_COLORS[location.pantheonId] || { bg: '#6b7280', label: location.pantheonId };
                const hasCords = location.latitude !== null && location.longitude !== null;

                return (
                  <Card
                    key={location.id}
                    className={`group cursor-pointer hover:border-gold/50 transition-all duration-300 ${!hasCords ? 'opacity-75 grayscale-[0.5]' : ''}`}
                    onClick={() => {
                      if (hasCords && location.latitude && location.longitude) {
                        // Dispatch custom event for Map component to listen to
                        window.dispatchEvent(new CustomEvent('flyToLocation', {
                          detail: { lat: location.latitude, lng: location.longitude }
                        }));
                        // On mobile, switch to map view
                        if (window.innerWidth < 1024) setViewMode('map');
                      }
                    }}
                  >
                    <div className="h-1" style={{ background: colors.bg }} />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-foreground group-hover:text-gold transition-colors">{location.name}</h4>
                        {hasCords ? <MapPin className="h-3 w-3 text-muted-foreground" /> : <span className="text-[10px] border border-border px-1 rounded">Myth</span>}
                      </div>
                      <p className="text-xs text-muted-foreground uppercase">{pantheon?.name}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-xs text-muted-foreground line-clamp-2">{location.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Map Side (Right) - Always visible on desktop, toggled on mobile */}
          <div className={`flex-1 rounded-xl overflow-hidden border border-border shadow-lg relative ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
            <MapVisualization locations={filteredLocations} pantheons={pantheons} />
          </div>

        </div>
      </div>
    </div>
  );
}
