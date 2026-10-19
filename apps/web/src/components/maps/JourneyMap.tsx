"use client";

import { Button } from "@/components/ui/button";
import { MAP_TILE_OPTIONS, MAP_TILE_URL } from "@/lib/map-tiles";
import { PANTHEON_PRIMARY_SECONDARY as PANTHEON_COLORS } from "@/lib/pantheon-colors";
import type { JourneyDetail, JourneyWaypoint } from "@/lib/journeys";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Waypoint = JourneyWaypoint & { coordinates: [number, number] };
interface JourneyMapProps {
  journey: Omit<JourneyDetail, "waypoints"> & { waypoints: Waypoint[] };
  onWaypointSelect?: (waypoint: Waypoint | null) => void;
  selectedWaypointId?: string | null;
}

export function JourneyMap({
  journey,
  onWaypointSelect,
  selectedWaypointId,
}: JourneyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const progressRef = useRef<L.Polyline | null>(null);
  const [localId, setLocalId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const stops = useMemo(
    () => journey.waypoints.toSorted((a, b) => a.order - b.order),
    [journey.waypoints],
  );
  const selectedIndex = stops.findIndex(
    (stop) => stop.id === (selectedWaypointId ?? localId),
  );
  const index = Math.max(0, selectedIndex);
  const current = stops[index];
  const color = PANTHEON_COLORS[journey.pantheonId]?.primary ?? "#D4AF37";

  const select = useCallback(
    (next: number) => {
      const stop = stops[next];
      if (!stop) return;
      setLocalId(stop.id);
      onWaypointSelect?.(stop);
    },
    [stops, onWaypointSelect],
  );
  const selectRef = useRef(select);
  useEffect(() => {
    selectRef.current = select;
  }, [select]);

  const showRoute = useCallback(() => {
    if (stops.length) {
      mapRef.current?.fitBounds(
        L.latLngBounds(stops.map((stop) => stop.coordinates)),
        {
          padding: [36, 36],
          maxZoom: 5,
          animate: false,
        },
      );
    }
  }, [stops]);

  useEffect(() => {
    if (!containerRef.current) return;
    // A fixed overview keeps the coastline and the whole voyage in context.
    // Selection never triggers a flying camera, including with reduced motion.
    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
    mapRef.current = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(MAP_TILE_URL, {
      ...MAP_TILE_OPTIONS,
      className: `${MAP_TILE_OPTIONS.className} journey-tiles`,
    })
      .on("tileerror", () => setTilesUnavailable(true))
      .addTo(map);
    const coordinates = stops.map((stop) => stop.coordinates);
    L.polyline(coordinates, {
      color,
      weight: 2,
      opacity: 0.6,
      dashArray: "5 8",
    }).addTo(map);
    progressRef.current = L.polyline([], {
      color,
      weight: 3,
      opacity: 0.95,
    }).addTo(map);
    markersRef.current = stops.map((stop, stopIndex) => {
      const marker = L.marker(stop.coordinates, {
        keyboard: false,
        title: `Stop ${stop.order}: ${stop.name}`,
      });
      marker.on("click", () => selectRef.current(stopIndex));
      marker.on("add", () =>
        marker.getElement()?.setAttribute("aria-hidden", "true"),
      );
      const label = document.createElement("span");
      label.textContent = stop.name;
      marker.bindTooltip(label, { direction: "top" });
      return marker;
    });
    showRoute();
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      progressRef.current = null;
    };
  }, [stops, color, showRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker, markerIndex) => {
      const active = markerIndex === index;
      marker.setIcon(
        L.divIcon({
          className: "journey-stop-marker",
          html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:2px solid ${color};background:${active ? color : "#182129"};color:${active ? "#111827" : "#f5ecd8"};font:bold 12px Georgia,serif;box-shadow:0 1px 5px #0008">${stops[markerIndex].order}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          tooltipAnchor: [0, -17],
        }),
      );
      if (!map.hasLayer(marker)) marker.addTo(map);
      marker.setZIndexOffset(active ? 1000 : 0);
    });
    progressRef.current?.setLatLngs(
      stops.slice(0, index + 1).map((stop) => stop.coordinates),
    );
    if (current)
      map.panInside(current.coordinates, { padding: [40, 40], animate: false });
  }, [index, current, stops, color]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      if (index >= stops.length - 1) setIsPlaying(false);
      else select(index + 1);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [isPlaying, index, stops.length, select]);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div
        ref={containerRef}
        className="journey-geography h-[22rem] w-full bg-[#182129] sm:h-[28rem]"
        role="region"
        aria-label={`Geographic illustration of ${journey.title}`}
      />
      <style>{`.journey-geography .journey-tiles { filter: invert(1) hue-rotate(180deg) saturate(.12) brightness(.82) contrast(.85); }`}</style>
      <div className="space-y-4 border-t border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-ui text-foreground">
            <span className="text-muted-foreground">
              Stop {index + 1} of {stops.length}
            </span>{" "}
            · {current?.name}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reset journey"
              onClick={() => {
                setIsPlaying(false);
                select(0);
                showRoute();
              }}
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous stop"
              disabled={index === 0}
              onClick={() => {
                setIsPlaying(false);
                select(index - 1);
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isPlaying ? "Pause journey" : "Play journey"}
              aria-pressed={isPlaying}
              disabled={
                !stops.length || (!isPlaying && index === stops.length - 1)
              }
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next stop"
              disabled={index >= stops.length - 1}
              onClick={() => {
                setIsPlaying(false);
                select(index + 1);
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Journey stops">
          {stops.map((stop, stopIndex) => (
            <button
              key={stop.id}
              type="button"
              aria-label={`Go to stop ${stop.order}: ${stop.name}`}
              aria-pressed={index === stopIndex}
              onClick={() => {
                setIsPlaying(false);
                select(stopIndex);
              }}
              className="flex size-10 items-center justify-center rounded-full border font-serif text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              style={{
                borderColor: index === stopIndex ? color : undefined,
                backgroundColor: index === stopIndex ? `${color}20` : undefined,
              }}
            >
              {stop.order}
            </button>
          ))}
        </div>
        <p className="type-meta text-muted-foreground">
          Dashed line: story sequence. Solid line: route to the selected stop.
          Modern coastline shown for orientation; disputed and mythical places
          are illustrative.
        </p>
        {tilesUnavailable ? (
          <p role="status" className="type-meta text-muted-foreground">
            The background map could not load. Use the numbered stops and the
            written route below.
          </p>
        ) : null}
      </div>
    </div>
  );
}
