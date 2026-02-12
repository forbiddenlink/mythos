'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  imageUrl?: string;
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
}

interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  domain: string[];
  imageUrl?: string;
}

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
}

interface MapVisualizationProps {
  locations: Location[];
  pantheons: Pantheon[];
  deities?: Deity[];
  stories?: Story[];
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

// ─── Cluster icon creator ───────────────────────────────────────────────
function createClusterIcon(count: number): L.DivIcon {
  // Determine size based on count
  const size = count < 10 ? 36 : count < 100 ? 44 : 52;

  const svgHtml = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
    ">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"
                fill="rgba(212, 175, 55, 0.9)"
                stroke="#B8860B"
                stroke-width="2"/>
        <text x="${size/2}" y="${size/2 + 4}"
              text-anchor="middle"
              fill="#1a1a2e"
              font-family="ui-serif, Georgia, serif"
              font-weight="600"
              font-size="${count < 10 ? 14 : 12}px">${count}</text>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}

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


export function MapVisualization({ locations, pantheons, deities = [], stories = [] }: MapVisualizationProps) {
  // Filter state for pantheons (quick filter within map)
  const [activePantheonFilter, setActivePantheonFilter] = useState<string | null>(null);
  const [enableClustering, setEnableClustering] = useState(true);

  // Refs
  const containerRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);
  const mapInstanceRef = useMemo(() => ({ current: null as L.Map | null }), []);
  const markersLayerRef = useMemo(() => ({ current: null as L.LayerGroup | null }), []);

  // Filter locations by pantheon if filter is active
  const filteredLocations = useMemo(() => {
    if (!activePantheonFilter) return locations;
    return locations.filter((loc) => loc.pantheonId === activePantheonFilter);
  }, [locations, activePantheonFilter]);

  // Only show locations with coordinates
  const mappableLocations = useMemo(
    () => filteredLocations.filter((loc) => loc.latitude !== null && loc.longitude !== null),
    [filteredLocations]
  );

  // Get unique pantheons from locations for filter pills
  const uniquePantheons = useMemo(() => {
    const ids = new Set(locations.map((loc) => loc.pantheonId));
    return pantheons.filter((p) => ids.has(p.id));
  }, [locations, pantheons]);

  // Helper to get deities for a location's pantheon
  const getDeitiesForLocation = useCallback((location: Location) => {
    return deities
      .filter((d) => d.pantheonId === location.pantheonId)
      .slice(0, 4); // Show max 4 deities
  }, [deities]);

  // Helper to get stories for a location's pantheon
  const getStoriesForLocation = useCallback((location: Location) => {
    return stories
      .filter((s) => s.pantheonId === location.pantheonId)
      .slice(0, 3); // Show max 3 stories
  }, [stories]);

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

    // Create markers layer group
    const markersLayer = L.layerGroup();
    markersLayerRef.current = markersLayer;

    // Simple clustering implementation
    interface ClusterGroup {
      locations: typeof mappableLocations;
      center: { lat: number; lng: number };
    }

    const createClusters = (locs: typeof mappableLocations, zoomLevel: number): ClusterGroup[] => {
      if (!enableClustering || zoomLevel >= 6 || locs.length < 5) {
        // No clustering at high zoom or few markers
        return locs.map((loc) => ({
          locations: [loc],
          center: { lat: loc.latitude!, lng: loc.longitude! },
        }));
      }

      // Simple grid-based clustering
      const gridSize = Math.max(5, 20 - zoomLevel * 3); // Degrees per grid cell
      const clusters = new Map<string, ClusterGroup>();

      locs.forEach((loc) => {
        const gridX = Math.floor(loc.longitude! / gridSize);
        const gridY = Math.floor(loc.latitude! / gridSize);
        const key = `${gridX},${gridY}`;

        if (!clusters.has(key)) {
          clusters.set(key, {
            locations: [],
            center: { lat: 0, lng: 0 },
          });
        }
        clusters.get(key)!.locations.push(loc);
      });

      // Calculate cluster centers
      clusters.forEach((cluster) => {
        const sumLat = cluster.locations.reduce((sum, loc) => sum + loc.latitude!, 0);
        const sumLng = cluster.locations.reduce((sum, loc) => sum + loc.longitude!, 0);
        cluster.center = {
          lat: sumLat / cluster.locations.length,
          lng: sumLng / cluster.locations.length,
        };
      });

      return Array.from(clusters.values());
    };

    // Function to render markers based on current zoom
    const renderMarkers = () => {
      markersLayer.clearLayers();
      const zoomLevel = map.getZoom();
      const clusters = createClusters(mappableLocations, zoomLevel);

      clusters.forEach((cluster) => {
        if (cluster.locations.length === 1) {
          // Single marker
          const location = cluster.locations[0];
          const icon = createMarkerIcon(location.pantheonId, location.locationType);
          const colors = PANTHEON_COLORS[location.pantheonId] || { bg: '#6b7280', border: '#4b5563', label: location.pantheonId };
          const typeLabel = getLocationTypeLabel(location.locationType);
          const locationDeities = getDeitiesForLocation(location);
          const locationStories = getStoriesForLocation(location);

          // Create enhanced popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'mythic-popup';

          // Build deities section
          let deitiesHtml = '';
          if (locationDeities.length > 0) {
            deitiesHtml = `
              <div class="mt-3 pt-3 border-t border-slate-200">
                <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Associated Deities</div>
                <div class="flex flex-wrap gap-1">
                  ${locationDeities.map((deity) => `
                    <a href="/deities/${deity.slug}"
                       class="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-700 transition-colors"
                       style="text-decoration: none;">
                      ${deity.name}
                    </a>
                  `).join('')}
                </div>
              </div>
            `;
          }

          // Build stories section
          let storiesHtml = '';
          if (locationStories.length > 0) {
            storiesHtml = `
              <div class="mt-2">
                <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Related Stories</div>
                <div class="flex flex-col gap-0.5">
                  ${locationStories.map((story) => `
                    <a href="/stories/${story.slug}"
                       class="text-xs text-blue-600 hover:text-blue-800 transition-colors truncate"
                       style="text-decoration: none;">
                      ${story.title}
                    </a>
                  `).join('')}
                </div>
              </div>
            `;
          }

          // Build image section
          const imageHtml = location.imageUrl ? `
            <div class="relative w-full h-24 -mt-3 -mx-3 mb-3 rounded-t overflow-hidden">
              <img src="${location.imageUrl}" alt="${location.name}"
                   class="w-full h-full object-cover"
                   onerror="this.parentElement.style.display='none'" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          ` : '';

          popupContent.innerHTML = `
            <div class="min-w-[260px] max-w-[320px]" style="padding: ${location.imageUrl ? '12px 12px 12px' : '0'}">
              ${imageHtml}
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
              ${deitiesHtml}
              ${storiesHtml}
              <div class="mt-3 pt-2 border-t border-slate-200">
                <a href="/locations/${location.id}"
                   class="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                   style="color: #D4AF37; text-decoration: none;">
                  Learn More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          `;

          L.marker([location.latitude!, location.longitude!], { icon })
            .bindPopup(popupContent, { maxWidth: 350 })
            .addTo(markersLayer);
        } else {
          // Cluster marker
          const clusterIcon = createClusterIcon(cluster.locations.length);

          // Create cluster popup showing all locations
          const clusterPopup = document.createElement('div');
          clusterPopup.className = 'mythic-cluster-popup';
          clusterPopup.innerHTML = `
            <div class="min-w-[200px] max-w-[280px]">
              <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                ${cluster.locations.length} Locations
              </div>
              <div class="space-y-1 max-h-[200px] overflow-y-auto">
                ${cluster.locations.map((loc) => {
                  const colors = PANTHEON_COLORS[loc.pantheonId] || { bg: '#6b7280', label: loc.pantheonId };
                  return `
                    <div class="flex items-center gap-2 py-1 px-2 bg-slate-50 rounded text-xs cursor-pointer hover:bg-slate-100 transition-colors"
                         onclick="window.dispatchEvent(new CustomEvent('flyToLocation', { detail: { lat: ${loc.latitude}, lng: ${loc.longitude} } }))">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${colors.bg}"></span>
                      <span class="text-slate-700 truncate">${loc.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200">
                Zoom in or click a location
              </div>
            </div>
          `;

          L.marker([cluster.center.lat, cluster.center.lng], { icon: clusterIcon })
            .bindPopup(clusterPopup, { maxWidth: 300 })
            .addTo(markersLayer);
        }
      });
    };

    // Initial render
    renderMarkers();
    markersLayer.addTo(map);

    // Re-render on zoom change
    map.on('zoomend', renderMarkers);

    // FlyTo Listener
    const handleFlyTo = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number }>;
      const { lat, lng } = customEvent.detail;
      map.flyTo([lat, lng], 8, { duration: 1.5 });
    };
    window.addEventListener('flyToLocation', handleFlyTo);

    return () => {
      window.removeEventListener('flyToLocation', handleFlyTo);
      map.off('zoomend');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (markersLayerRef.current) {
        markersLayerRef.current = null;
      }
    };
  }, [mappableLocations, enableClustering, getDeitiesForLocation, getStoriesForLocation]); // Re-init if locations change or clustering toggle

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Pantheon Filter Pills - Above Map */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center gap-2">
        {/* All button */}
        <button
          onClick={() => setActivePantheonFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm ${
            activePantheonFilter === null
              ? 'bg-gold text-midnight border border-gold'
              : 'bg-card/90 text-muted-foreground border border-border hover:border-gold/50 hover:text-gold'
          }`}
        >
          All
        </button>

        {/* Pantheon filter buttons */}
        {uniquePantheons.map((pantheon) => {
          const colors = PANTHEON_COLORS[pantheon.id];
          const isActive = activePantheonFilter === pantheon.id;
          const count = locations.filter((l) => l.pantheonId === pantheon.id && l.latitude !== null).length;

          return (
            <button
              key={pantheon.id}
              onClick={() => setActivePantheonFilter(isActive ? null : pantheon.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm flex items-center gap-1.5 ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-card/90 text-muted-foreground border border-border hover:border-gold/50'
              }`}
              style={isActive ? { backgroundColor: colors?.bg || '#6b7280' } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors?.bg || '#6b7280' }}
              />
              {colors?.label || pantheon.name}
              <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-muted-foreground/70'}`}>
                ({count})
              </span>
            </button>
          );
        })}

        {/* Clustering toggle */}
        <div className="ml-auto">
          <button
            onClick={() => setEnableClustering(!enableClustering)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm flex items-center gap-1.5 ${
              enableClustering
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-card/90 text-muted-foreground border border-border hover:border-gold/50'
            }`}
            title={enableClustering ? 'Disable clustering' : 'Enable clustering'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-70"
            >
              <circle cx="12" cy="12" r="3" />
              <circle cx="6" cy="6" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            Cluster
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="z-0 w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />

      {/* Map stats overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{mappableLocations.length}</span> location{mappableLocations.length !== 1 ? 's' : ''} shown
        {activePantheonFilter && (
          <span className="ml-1">
            in <span style={{ color: PANTHEON_COLORS[activePantheonFilter]?.bg }}>{PANTHEON_COLORS[activePantheonFilter]?.label}</span>
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Legend</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {Object.entries(PANTHEON_COLORS).slice(0, 5).map(([id, colors]) => (
            <div key={id} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.bg }} />
              <span className="text-muted-foreground">{colors.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
