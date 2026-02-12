'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
interface Waypoint {
  id: string;
  name: string;
  coordinates: [number, number];
  order: number;
  description: string;
  events?: string[];
  creatures?: string[];
  deities?: string[];
  duration?: string;
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

interface JourneyMapProps {
  journey: Journey;
  onWaypointSelect?: (waypoint: Waypoint | null) => void;
  selectedWaypointId?: string | null;
}

// Pantheon colors for markers
const PANTHEON_COLORS: Record<string, { primary: string; secondary: string }> = {
  'greek-pantheon': { primary: '#3b82f6', secondary: '#2563eb' },
  'norse-pantheon': { primary: '#8b5cf6', secondary: '#7c3aed' },
  'egyptian-pantheon': { primary: '#f59e0b', secondary: '#d97706' },
  'roman-pantheon': { primary: '#ef4444', secondary: '#dc2626' },
  'hindu-pantheon': { primary: '#f97316', secondary: '#ea580c' },
  'japanese-pantheon': { primary: '#ec4899', secondary: '#db2777' },
  'celtic-pantheon': { primary: '#22c55e', secondary: '#16a34a' },
  'aztec-pantheon': { primary: '#14b8a6', secondary: '#0d9488' },
  'chinese-pantheon': { primary: '#e11d48', secondary: '#be123c' },
  'mesopotamian-pantheon': { primary: '#a16207', secondary: '#854d0e' },
};

// Create numbered marker icon
function createNumberedMarkerIcon(
  number: number,
  isActive: boolean,
  isVisited: boolean,
  pantheonId: string
): L.DivIcon {
  const colors = PANTHEON_COLORS[pantheonId] || { primary: '#D4AF37', secondary: '#B8860B' };
  const size = isActive ? 44 : 36;
  const fontSize = isActive ? 16 : 14;

  const bgColor = isActive
    ? colors.primary
    : isVisited
    ? colors.primary
    : 'rgba(30, 30, 46, 0.9)';
  const borderColor = isActive ? '#D4AF37' : isVisited ? colors.secondary : '#4b5563';
  const textColor = isActive || isVisited ? '#ffffff' : '#9ca3af';
  const borderWidth = isActive ? 3 : 2;
  const shadow = isActive ? '0 0 20px rgba(212, 175, 55, 0.5)' : 'none';

  const svgHtml = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size + 8}px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <svg width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${size / 2} 0
                 C${size * 0.2} 0 0 ${size * 0.2} 0 ${size * 0.45}
                 C0 ${size * 0.7} ${size / 2} ${size + 8} ${size / 2} ${size + 8}
                 S${size} ${size * 0.7} ${size} ${size * 0.45}
                 C${size} ${size * 0.2} ${size * 0.8} 0 ${size / 2} 0z"
              fill="${bgColor}"
              stroke="${borderColor}"
              stroke-width="${borderWidth}"
              style="filter: ${shadow ? `drop-shadow(${shadow})` : 'none'}"/>
        <circle cx="${size / 2}" cy="${size * 0.4}" r="${size * 0.3}"
                fill="rgba(255,255,255,0.1)"/>
        <text x="${size / 2}" y="${size * 0.48}"
              text-anchor="middle"
              fill="${textColor}"
              font-family="ui-serif, Georgia, serif"
              font-weight="700"
              font-size="${fontSize}px">${number}</text>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-journey-marker',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

export function JourneyMap({ journey, onWaypointSelect, selectedWaypointId }: JourneyMapProps) {
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedWaypoints, setVisitedWaypoints] = useState<Set<number>>(new Set([0]));
  const [pathProgress, setPathProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pathRef = useRef<L.Polyline | null>(null);
  const animatedPathRef = useRef<L.Polyline | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const sortedWaypoints = useMemo(
    () => [...journey.waypoints].sort((a, b) => a.order - b.order),
    [journey.waypoints]
  );

  const colors = PANTHEON_COLORS[journey.pantheonId] || { primary: '#D4AF37', secondary: '#B8860B' };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const element = containerRef.current as HTMLDivElement & { _leaflet_id?: number | null };
    if (element._leaflet_id) {
      element._leaflet_id = null;
    }

    // Create map
    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([40, 20], 4);
    mapInstanceRef.current = map;

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Fit to waypoints
    if (sortedWaypoints.length > 0) {
      const bounds = L.latLngBounds(sortedWaypoints.map((wp) => wp.coordinates));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
    }

    // Draw the full path (faded)
    const pathCoords = sortedWaypoints.map((wp) => wp.coordinates);
    const fullPath = L.polyline(pathCoords, {
      color: 'rgba(75, 85, 99, 0.4)',
      weight: 3,
      dashArray: '10, 10',
    }).addTo(map);
    pathRef.current = fullPath;

    // Draw animated path (will be updated)
    const animatedPath = L.polyline([], {
      color: colors.primary,
      weight: 4,
      opacity: 0.9,
    }).addTo(map);
    animatedPathRef.current = animatedPath;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [journey.id, sortedWaypoints, colors.primary]);

  // Update markers when waypoint changes
  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers
    sortedWaypoints.forEach((waypoint, index) => {
      const isActive = index === currentWaypointIndex;
      const isVisited = visitedWaypoints.has(index);

      const icon = createNumberedMarkerIcon(
        waypoint.order,
        isActive,
        isVisited,
        journey.pantheonId
      );

      const marker = L.marker(waypoint.coordinates, { icon })
        .addTo(map)
        .on('click', () => {
          setCurrentWaypointIndex(index);
          setVisitedWaypoints((prev) => new Set([...prev, index]));
          onWaypointSelect?.(waypoint);
        });

      // Add popup
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style="background-color: ${colors.primary}">
              ${waypoint.order}
            </span>
            <h3 class="font-serif font-semibold text-slate-900">${waypoint.name}</h3>
          </div>
          <p class="text-sm text-slate-600 line-clamp-3">${waypoint.description}</p>
          ${waypoint.duration ? `<p class="text-xs text-slate-400 mt-2">Duration: ${waypoint.duration}</p>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent, { maxWidth: 300 });

      markersRef.current.push(marker);
    });
  }, [sortedWaypoints, currentWaypointIndex, visitedWaypoints, journey.pantheonId, colors.primary, onWaypointSelect]);

  // Update animated path
  const updateAnimatedPath = useCallback(() => {
    if (!animatedPathRef.current) return;

    const visitedCoords = sortedWaypoints
      .slice(0, currentWaypointIndex + 1)
      .map((wp) => wp.coordinates);

    animatedPathRef.current.setLatLngs(visitedCoords);
  }, [sortedWaypoints, currentWaypointIndex]);

  // Effect to update markers and path
  useEffect(() => {
    updateMarkers();
    updateAnimatedPath();
  }, [updateMarkers, updateAnimatedPath]);

  // Effect to fly to current waypoint
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || sortedWaypoints.length === 0) return;

    const waypoint = sortedWaypoints[currentWaypointIndex];
    if (waypoint) {
      map.flyTo(waypoint.coordinates, 6, { duration: 1.5 });
      onWaypointSelect?.(waypoint);
    }
  }, [currentWaypointIndex, sortedWaypoints, onWaypointSelect]);

  // Handle external waypoint selection
  useEffect(() => {
    if (selectedWaypointId) {
      const index = sortedWaypoints.findIndex((wp) => wp.id === selectedWaypointId);
      if (index !== -1 && index !== currentWaypointIndex) {
        setCurrentWaypointIndex(index);
        setVisitedWaypoints((prev) => new Set([...prev, index]));
      }
    }
  }, [selectedWaypointId, sortedWaypoints, currentWaypointIndex]);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = () => {
      setCurrentWaypointIndex((prev) => {
        if (prev >= sortedWaypoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        setVisitedWaypoints((visited) => new Set([...visited, next]));
        return next;
      });
    };

    const timer = setTimeout(animate, 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentWaypointIndex, sortedWaypoints.length]);

  // Controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentWaypointIndex(0);
    setVisitedWaypoints(new Set([0]));
  };
  const handlePrev = () => {
    if (currentWaypointIndex > 0) {
      setCurrentWaypointIndex((prev) => prev - 1);
    }
  };
  const handleNext = () => {
    if (currentWaypointIndex < sortedWaypoints.length - 1) {
      const next = currentWaypointIndex + 1;
      setCurrentWaypointIndex(next);
      setVisitedWaypoints((prev) => new Set([...prev, next]));
    }
  };

  const currentWaypoint = sortedWaypoints[currentWaypointIndex];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden">
      {/* Map Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />

      {/* Journey Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-white text-sm"
                style={{ backgroundColor: colors.primary }}
              >
                {currentWaypoint?.order || 1}
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">
                  {currentWaypoint?.name || 'Start'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Stop {currentWaypointIndex + 1} of {sortedWaypoints.length}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8"
                title="Reset journey"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={currentWaypointIndex === 0}
                className="h-8 w-8"
                title="Previous stop"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className="h-8 w-8"
                style={{ backgroundColor: colors.primary }}
                title={isPlaying ? 'Pause' : 'Play journey'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentWaypointIndex === sortedWaypoints.length - 1}
                className="h-8 w-8"
                title="Next stop"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {sortedWaypoints.map((wp, index) => (
              <button
                key={wp.id}
                onClick={() => {
                  setCurrentWaypointIndex(index);
                  setVisitedWaypoints((prev) => new Set([...prev, index]));
                }}
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  index === currentWaypointIndex
                    ? 'ring-2 ring-gold ring-offset-2 ring-offset-background'
                    : ''
                }`}
                style={{
                  backgroundColor:
                    index === currentWaypointIndex
                      ? colors.primary
                      : visitedWaypoints.has(index)
                      ? colors.primary + '80'
                      : 'rgba(75, 85, 99, 0.5)',
                  color:
                    index === currentWaypointIndex || visitedWaypoints.has(index)
                      ? '#ffffff'
                      : '#9ca3af',
                }}
                title={wp.name}
              >
                {wp.order}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Journey Timeline Slider */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-card/95 backdrop-blur-sm rounded-lg border border-border px-4 py-2">
          <input
            type="range"
            min={0}
            max={sortedWaypoints.length - 1}
            value={currentWaypointIndex}
            onChange={(e) => {
              const index = parseInt(e.target.value);
              setCurrentWaypointIndex(index);
              setVisitedWaypoints((prev) => {
                const newSet = new Set(prev);
                for (let i = 0; i <= index; i++) {
                  newSet.add(i);
                }
                return newSet;
              });
            }}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-gold"
            style={{
              background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${
                (currentWaypointIndex / (sortedWaypoints.length - 1)) * 100
              }%, rgba(75, 85, 99, 0.5) ${
                (currentWaypointIndex / (sortedWaypoints.length - 1)) * 100
              }%, rgba(75, 85, 99, 0.5) 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{sortedWaypoints[0]?.name}</span>
            <span>{sortedWaypoints[sortedWaypoints.length - 1]?.name}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-20 right-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-muted-foreground">Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span className="text-muted-foreground">Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full ring-2 ring-gold"
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-muted-foreground">Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}
