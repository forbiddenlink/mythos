'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Types
interface Waypoint {
  id: string;
  name: string;
  coordinates: [number, number];
  order: number;
}

interface JourneyPreviewMapProps {
  waypoints: Waypoint[];
  pantheonId: string;
  isHovered?: boolean;
}

// Pantheon colors
const PANTHEON_COLORS: Record<string, { primary: string; secondary: string }> = {
  'greek-pantheon': { primary: '#3b82f6', secondary: '#2563eb' },
  'norse-pantheon': { primary: '#8b5cf6', secondary: '#7c3aed' },
  'egyptian-pantheon': { primary: '#f59e0b', secondary: '#d97706' },
  'roman-pantheon': { primary: '#ef4444', secondary: '#dc2626' },
  'hindu-pantheon': { primary: '#f97316', secondary: '#ea580c' },
  'japanese-pantheon': { primary: '#ec4899', secondary: '#db2777' },
  'celtic-pantheon': { primary: '#22c55e', secondary: '#16a34a' },
};

export function JourneyPreviewMap({ waypoints, pantheonId, isHovered = false }: JourneyPreviewMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const sortedWaypoints = useMemo(
    () => [...waypoints].sort((a, b) => a.order - b.order),
    [waypoints]
  );

  const colors = PANTHEON_COLORS[pantheonId] || { primary: '#D4AF37', secondary: '#B8860B' };

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const element = containerRef.current as HTMLDivElement & { _leaflet_id?: number | null };
    if (element._leaflet_id) {
      element._leaflet_id = null;
    }

    // Create map
    const map = L.map(containerRef.current, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    // Fit to waypoints
    if (sortedWaypoints.length > 0) {
      const bounds = L.latLngBounds(sortedWaypoints.map((wp) => wp.coordinates));
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 5 });
    }

    // Draw path
    const pathCoords = sortedWaypoints.map((wp) => wp.coordinates);
    L.polyline(pathCoords, {
      color: colors.primary,
      weight: 2,
      opacity: 0.7,
      dashArray: '5, 5',
    }).addTo(map);

    // Add start and end markers
    if (sortedWaypoints.length > 0) {
      // Start marker
      const startIcon = L.divIcon({
        html: `<div style="
          width: 12px;
          height: 12px;
          background: ${colors.primary};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        className: 'custom-preview-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker(sortedWaypoints[0].coordinates, { icon: startIcon }).addTo(map);

      // End marker
      if (sortedWaypoints.length > 1) {
        const endIcon = L.divIcon({
          html: `<div style="
            width: 16px;
            height: 16px;
            background: #D4AF37;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          className: 'custom-preview-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker(sortedWaypoints[sortedWaypoints.length - 1].coordinates, { icon: endIcon }).addTo(map);
      }

      // Intermediate markers (small dots)
      sortedWaypoints.slice(1, -1).forEach((wp) => {
        const dotIcon = L.divIcon({
          html: `<div style="
            width: 6px;
            height: 6px;
            background: ${colors.primary};
            border-radius: 50%;
            opacity: 0.6;
          "></div>`,
          className: 'custom-preview-marker',
          iconSize: [6, 6],
          iconAnchor: [3, 3],
        });
        L.marker(wp.coordinates, { icon: dotIcon }).addTo(map);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [sortedWaypoints, colors.primary]);

  // Handle hover animation
  useEffect(() => {
    if (!mapRef.current || sortedWaypoints.length === 0) return;

    if (isHovered) {
      // Slight zoom in on hover
      const bounds = L.latLngBounds(sortedWaypoints.map((wp) => wp.coordinates));
      mapRef.current.flyToBounds(bounds, {
        padding: [30, 30],
        maxZoom: 6,
        duration: 0.5,
      });
    }
  }, [isHovered, sortedWaypoints]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '192px' }}
    />
  );
}
