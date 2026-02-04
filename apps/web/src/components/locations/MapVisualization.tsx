'use client';

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types ──────────────────────────────────────────────────────────────
interface Location {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
}

interface MapVisualizationProps {
  locations: Location[];
  pantheons: Pantheon[];
}

// ─── Pantheon color mapping ─────────────────────────────────────────────
const PANTHEON_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  'greek-pantheon':    { bg: '#3b82f6', border: '#2563eb', label: 'Greek' },
  'norse-pantheon':    { bg: '#8b5cf6', border: '#7c3aed', label: 'Norse' },
  'egyptian-pantheon': { bg: '#f59e0b', border: '#d97706', label: 'Egyptian' },
  'roman-pantheon':    { bg: '#ef4444', border: '#dc2626', label: 'Roman' },
  'hindu-pantheon':    { bg: '#f97316', border: '#ea580c', label: 'Hindu' },
  'japanese-pantheon': { bg: '#ec4899', border: '#db2777', label: 'Japanese' },
  'celtic-pantheon':   { bg: '#22c55e', border: '#16a34a', label: 'Celtic' },
  'aztec-pantheon':    { bg: '#14b8a6', border: '#0d9488', label: 'Aztec' },
  'chinese-pantheon':  { bg: '#e11d48', border: '#be123c', label: 'Chinese' },
};

// ─── Location type icons (SVG paths used in markers) ────────────────────
const LOCATION_ICONS: Record<string, string> = {
  temple:       'M12 2L2 8v2h20V8L12 2zm0 2.5L18 8H6l6-3.5zM4 12v7h3v-5h2v5h2v-5h2v5h2v-5h2v5h3v-7H4z',
  city:         'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z',
  realm:        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  mountain:     'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z',
  monument:     'M12 2L6 12h3v8h6v-8h3L12 2z',
  sacred_site:  'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z',
  tomb:         'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
  underworld:   'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5S16.17 11 17 11zm-5 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  mythical_realm: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
};

// ─── Create custom marker icon ─────────────────────────────────────────
function createMarkerIcon(pantheonId: string, locationType: string): L.DivIcon {
  const colors = PANTHEON_COLORS[pantheonId] || { bg: '#6b7280', border: '#4b5563' };
  const iconPath = LOCATION_ICONS[locationType] || LOCATION_ICONS.sacred_site;

  const svgHtml = `
    <div style="
      position: relative;
      width: 36px;
      height: 44px;
    ">
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z"
              fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>
        <circle cx="18" cy="16" r="11" fill="rgba(0,0,0,0.2)"/>
        <g transform="translate(6, 4) scale(1)">
          <path d="${iconPath}" fill="white"/>
        </g>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

// ─── Location type display labels ───────────────────────────────────────
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

// ─── Fit bounds component ───────────────────────────────────────────────
function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useMemo(() => {
    const validLocations = locations.filter(
      (loc) => loc.latitude !== null && loc.longitude !== null
    );
    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude!, loc.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [locations, map]);

  return null;
}

// ─── Main component ────────────────────────────────────────────────────
export function MapVisualization({ locations, pantheons }: MapVisualizationProps) {
  const [activePantheons, setActivePantheons] = useState<Set<string>>(
    new Set(pantheons.map((p) => p.id))
  );

  const togglePantheon = (pantheonId: string) => {
    setActivePantheons((prev) => {
      const next = new Set(prev);
      if (next.has(pantheonId)) {
        next.delete(pantheonId);
      } else {
        next.add(pantheonId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (activePantheons.size === pantheons.length) {
      setActivePantheons(new Set());
    } else {
      setActivePantheons(new Set(pantheons.map((p) => p.id)));
    }
  };

  // Only show locations with coordinates and active pantheons
  const mappableLocations = useMemo(
    () =>
      locations.filter(
        (loc) =>
          loc.latitude !== null &&
          loc.longitude !== null &&
          activePantheons.has(loc.pantheonId)
      ),
    [locations, activePantheons]
  );

  // Mythical / non-mappable locations
  const mythicalLocations = useMemo(
    () =>
      locations.filter(
        (loc) =>
          (loc.latitude === null || loc.longitude === null) &&
          activePantheons.has(loc.pantheonId)
      ),
    [locations, activePantheons]
  );

  // Pantheons that actually have locations in the dataset
  const pantheonsWithLocations = useMemo(() => {
    const ids = new Set(locations.map((loc) => loc.pantheonId));
    return pantheons.filter((p) => ids.has(p.id));
  }, [locations, pantheons]);

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
            Filter by Pantheon
          </h3>
          <button
            onClick={toggleAll}
            className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
          >
            {activePantheons.size === pantheons.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {pantheonsWithLocations.map((pantheon) => {
            const colors = PANTHEON_COLORS[pantheon.id] || { bg: '#6b7280', border: '#4b5563', label: pantheon.name };
            const isActive = activePantheons.has(pantheon.id);
            const count = locations.filter((l) => l.pantheonId === pantheon.id).length;

            return (
              <button
                key={pantheon.id}
                onClick={() => togglePantheon(pantheon.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isActive
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-border text-muted-foreground bg-muted/50 hover:bg-muted'
                }`}
                style={
                  isActive
                    ? { backgroundColor: colors.bg, borderColor: colors.border }
                    : undefined
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors.bg, opacity: isActive ? 1 : 0.5 }}
                />
                {colors.label || pantheon.name}
                <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-muted-foreground/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-lg" style={{ height: '600px' }}>
        <MapContainer
          center={[30, 30]}
          zoom={3}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          style={{ background: 'oklch(0.14 0.03 265)' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <FitBounds locations={mappableLocations} />

          {mappableLocations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude!, location.longitude!]}
              icon={createMarkerIcon(location.pantheonId, location.locationType)}
            >
              <Popup className="mythic-popup">
                <div className="min-w-[220px] max-w-[280px]">
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="mt-1 w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          PANTHEON_COLORS[location.pantheonId]?.bg || '#6b7280',
                      }}
                    />
                    <div>
                      <h3 className="font-serif font-semibold text-base leading-tight text-slate-900">
                        {location.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                          {getLocationTypeLabel(location.locationType)}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          className="text-[11px] font-medium uppercase tracking-wide"
                          style={{
                            color:
                              PANTHEON_COLORS[location.pantheonId]?.bg || '#6b7280',
                          }}
                        >
                          {PANTHEON_COLORS[location.pantheonId]?.label ||
                            location.pantheonId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {location.description}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map stats overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
          {mappableLocations.length} location{mappableLocations.length !== 1 ? 's' : ''} shown
          {mythicalLocations.length > 0 && (
            <span> &middot; {mythicalLocations.length} mythical</span>
          )}
        </div>
      </div>

      {/* Mythical / non-mappable locations */}
      {mythicalLocations.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
            Mythical Realms
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            These legendary places exist beyond the physical world and cannot be mapped to earthly coordinates.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mythicalLocations.map((location) => {
              const colors = PANTHEON_COLORS[location.pantheonId] || {
                bg: '#6b7280',
                label: location.pantheonId,
              };

              return (
                <div
                  key={location.id}
                  className="group rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colors.bg }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-semibold text-foreground group-hover:text-gold transition-colors">
                        {location.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 mb-2">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          {getLocationTypeLabel(location.locationType)}
                        </span>
                        <span className="text-border">|</span>
                        <span
                          className="text-[11px] font-medium uppercase tracking-wide"
                          style={{ color: colors.bg }}
                        >
                          {colors.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {location.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
