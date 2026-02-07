'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  'greek-pantheon': { bg: '#3b82f6', border: '#2563eb', label: 'Greek' },
  'norse-pantheon': { bg: '#8b5cf6', border: '#7c3aed', label: 'Norse' },
  'egyptian-pantheon': { bg: '#f59e0b', border: '#d97706', label: 'Egyptian' },
  'roman-pantheon': { bg: '#ef4444', border: '#dc2626', label: 'Roman' },
  'hindu-pantheon': { bg: '#f97316', border: '#ea580c', label: 'Hindu' },
  'japanese-pantheon': { bg: '#ec4899', border: '#db2777', label: 'Japanese' },
  'celtic-pantheon': { bg: '#22c55e', border: '#16a34a', label: 'Celtic' },
  'aztec-pantheon': { bg: '#14b8a6', border: '#0d9488', label: 'Aztec' },
  'chinese-pantheon': { bg: '#e11d48', border: '#be123c', label: 'Chinese' },
};

// ─── Location type icons (SVG paths used in markers) ────────────────────
const LOCATION_ICONS: Record<string, string> = {
  temple: 'M12 2L2 8v2h20V8L12 2zm0 2.5L18 8H6l6-3.5zM4 12v7h3v-5h2v5h2v-5h2v5h2v-5h2v5h3v-7H4z',
  city: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z',
  realm: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  mountain: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z',
  monument: 'M12 2L6 12h3v8h6v-8h3L12 2z',
  sacred_site: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z',
  tomb: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
  underworld: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5S16.17 11 17 11zm-5 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
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


export function MapVisualization({ locations, pantheons }: MapVisualizationProps) {
  // Ref for the container div
  const mapContainerRef = typeof window === 'undefined' ? null : document.createElement('div') as unknown as React.MutableRefObject<HTMLDivElement | null>;
  // We'll use a real ref in the render, this is just to satisfy Typescript if needed or standard useRef
  const containerRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);

  const mapInstanceRef = useMemo(() => ({ current: null as L.Map | null }), []);

  // Only show locations with coordinates
  const mappableLocations = useMemo(
    () => locations.filter((loc) => loc.latitude !== null && loc.longitude !== null),
    [locations]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Double check if the element has internal Leaflet ID (strict mode safety)
    const element = containerRef.current as any;
    if (element._leaflet_id) {
      element._leaflet_id = null;
    }

    // Initialize Map
    const map = L.map(containerRef.current).setView([30, 10], 3);
    mapInstanceRef.current = map;

    // Add Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Fit Bounds
    if (mappableLocations.length > 0) {
      const bounds = L.latLngBounds(
        mappableLocations.map((loc) => [loc.latitude!, loc.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }

    // Add Markers
    mappableLocations.forEach(location => {
      const icon = createMarkerIcon(location.pantheonId, location.locationType);

      // Create Popup Content
      const popupContent = document.createElement('div');
      popupContent.className = 'mythic-popup';

      const colors = PANTHEON_COLORS[location.pantheonId] || { bg: '#6b7280', border: '#4b5563', label: location.pantheonId };
      const typeLabel = getLocationTypeLabel(location.locationType);

      popupContent.innerHTML = `
        <div class="min-w-[220px] max-w-[280px]">
          <div class="flex items-start gap-2 mb-2">
            <span class="mt-1 w-3 h-3 rounded-full shrink-0" style="background-color: ${colors.bg}"></span>
            <div>
              <h3 class="font-serif font-semibold text-base leading-tight text-slate-900">${location.name}</h3>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wide">${typeLabel}</span>
                <span class="text-slate-300">|</span>
                <span class="text-[11px] font-medium uppercase tracking-wide" style="color: ${colors.bg}">${colors.label}</span>
              </div>
            </div>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">${location.description}</p>
        </div>
      `;

      L.marker([location.latitude!, location.longitude!], { icon })
        .bindPopup(popupContent)
        .addTo(map);
    });

    // FlyTo Listener
    const handleFlyTo = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number }>;
      const { lat, lng } = customEvent.detail;
      map.flyTo([lat, lng], 8, { duration: 1.5 });
    };
    window.addEventListener('flyToLocation', handleFlyTo);

    return () => {
      window.removeEventListener('flyToLocation', handleFlyTo);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mappableLocations]); // We re-init if locations change significantly or on mount

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      <div
        ref={containerRef}
        className="z-0 w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />

      {/* Map stats overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
        {mappableLocations.length} location{mappableLocations.length !== 1 ? 's' : ''} shown
      </div>
    </div>
  );
}
