"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createMarkerIcon } from "@/components/locations/map-marker-icons";
import { MAP_TILE_OPTIONS, MAP_TILE_URL } from "@/lib/map-tiles";

// ─── Types ──────────────────────────────────────────────────────────────
interface MapLocation {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationMapInsetProps {
  /** The location this inset is centered on. */
  location: MapLocation;
  /** Other locations from the same pantheon, shown as faint context markers. */
  relatedLocations?: MapLocation[];
  pantheonName?: string;
}

/**
 * Location types whose coordinates (when present) represent a mythological
 * or symbolic placement rather than a literal real-world address — Asgard,
 * Duat, Tartarus, Yomi, and similar realms.
 */
export const SYMBOLIC_LOCATION_TYPES = new Set([
  "realm",
  "underworld",
  "mythical_realm",
]);

export function formatCoordinate(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude)}°${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude)}°${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

// ─── Component ──────────────────────────────────────────────────────────
export function LocationMapInset({
  location,
  relatedLocations = [],
  pantheonName,
}: LocationMapInsetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;
    setPrefersReducedMotion(mql.matches);
    const handleChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const hasCoordinates =
    location.latitude != null && location.longitude != null;
  const isSymbolic = SYMBOLIC_LOCATION_TYPES.has(location.locationType);

  const nearby = useMemo(
    () =>
      relatedLocations.filter(
        (l) =>
          l.id !== location.id && l.latitude != null && l.longitude != null,
      ),
    [relatedLocations, location.id],
  );

  useEffect(() => {
    if (!hasCoordinates || !containerRef.current) return;

    // Strict-mode / re-mount safety, matching MapVisualization's pattern.
    const element = containerRef.current as HTMLDivElement & {
      _leaflet_id?: number | null;
    };
    if (element._leaflet_id) {
      element._leaflet_id = null;
    }

    const map = L.map(containerRef.current, {
      zoomAnimation: !prefersReducedMotion,
      fadeAnimation: !prefersReducedMotion,
      markerZoomAnimation: !prefersReducedMotion,
      scrollWheelZoom: false,
      // No flyTo is ever used here — setView below jumps straight to the
      // target with no animation, satisfying prefers-reduced-motion by
      // construction rather than only when the flag is set.
    }).setView([location.latitude!, location.longitude!], 5);

    L.tileLayer(MAP_TILE_URL, MAP_TILE_OPTIONS).addTo(map);

    // Primary marker for this location, full opacity.
    const primaryIcon = createMarkerIcon(
      location.pantheonId,
      location.locationType,
    );
    const primaryPopup = document.createElement("div");
    primaryPopup.style.cssText =
      "font-family: ui-serif, Georgia, serif; font-weight: 600; color: #1e293b; font-size: 13px;";
    primaryPopup.textContent = location.name;
    const primaryMarker = L.marker([location.latitude!, location.longitude!], {
      icon: primaryIcon,
      title: location.name,
    }).bindPopup(primaryPopup);
    primaryMarker.on("add", () => {
      primaryMarker.getElement()?.setAttribute("aria-label", location.name);
    });
    primaryMarker.addTo(map);

    // Faint, smaller markers for other locations in the same pantheon.
    nearby.forEach((loc) => {
      const icon = createMarkerIcon(loc.pantheonId, loc.locationType, {
        opacity: 0.45,
        scale: 0.7,
      });
      const link = document.createElement("a");
      link.href = `/locations/${loc.id}`;
      link.textContent = loc.name;
      link.style.cssText =
        "color:#B8860B; font-weight:600; text-decoration:none; font-family: ui-serif, Georgia, serif; font-size: 13px;";
      const marker = L.marker([loc.latitude!, loc.longitude!], {
        icon,
        title: loc.name,
      }).bindPopup(link);
      marker.on("add", () => {
        marker
          .getElement()
          ?.setAttribute("aria-label", `${loc.name}: view location`);
      });
      marker.addTo(map);
    });

    return () => {
      // Cancel any in-flight animation before teardown (see MapVisualization
      // for the Sentry MYTHOS-G rationale this guards against).
      map.stop();
      map.remove();
    };
  }, [location, nearby, hasCoordinates, prefersReducedMotion]);

  if (!hasCoordinates) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {location.name} has no fixed coordinates — it exists beyond physical
          geography in the myths of {pantheonName || "this pantheon"}.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isSymbolic && (
        <div
          className="absolute top-2 left-2 z-1000 rounded-full border border-gold/40 bg-midnight/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-gold-text backdrop-blur-sm"
          title="This coordinate is a symbolic placement, not a literal real-world location."
        >
          Symbolic placement
        </div>
      )}
      <div
        ref={containerRef}
        role="region"
        aria-label={`Map centered on ${location.name}`}
        className="h-80 w-full overflow-hidden rounded-lg border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      />
      {/* Text fallback: always present for screen readers / no-JS parity with the visual map. */}
      <p className="sr-only">
        {location.name} is located at{" "}
        {formatCoordinate(location.latitude!, location.longitude!)}
        {isSymbolic
          ? ". This placement is symbolic rather than a literal geographic location."
          : "."}
        {nearby.length > 0 &&
          ` Nearby on the map: ${nearby.map((l) => l.name).join(", ")}.`}
      </p>
    </div>
  );
}

export default LocationMapInset;
