"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PANTHEON_BG_BORDER_LABEL as PANTHEON_COLORS } from "@/lib/pantheon-colors";
import {
  createMarkerIcon,
  getLocationTypeLabel,
} from "@/components/locations/map-marker-icons";
import { MAP_TILE_OPTIONS, MAP_TILE_URL } from "@/lib/map-tiles";

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
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
                fill="rgba(212, 175, 55, 0.9)"
                stroke="#B8860B"
                stroke-width="2"/>
        <text x="${size / 2}" y="${size / 2 + 4}"
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
    className: "custom-cluster-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapVisualization({
  locations,
  pantheons,
  deities = [],
  stories = [],
}: MapVisualizationProps) {
  // Filter state for pantheons (quick filter within map)
  const [activePantheonFilter, setActivePantheonFilter] = useState<
    string | null
  >(null);
  const [enableClustering, setEnableClustering] = useState(true);

  // Refs
  const containerRef = useMemo(
    () => ({ current: null as HTMLDivElement | null }),
    [],
  );
  const mapInstanceRef = useMemo(() => ({ current: null as L.Map | null }), []);
  const markersLayerRef = useMemo(
    () => ({ current: null as L.LayerGroup | null }),
    [],
  );

  // Filter locations by pantheon if filter is active
  const filteredLocations = useMemo(() => {
    if (!activePantheonFilter) return locations;
    return locations.filter((loc) => loc.pantheonId === activePantheonFilter);
  }, [locations, activePantheonFilter]);

  // Only show locations with coordinates
  const mappableLocations = useMemo(
    () =>
      filteredLocations.filter(
        (loc) => loc.latitude !== null && loc.longitude !== null,
      ),
    [filteredLocations],
  );

  // Get unique pantheons from locations for filter pills
  const uniquePantheons = useMemo(() => {
    const ids = new Set(locations.map((loc) => loc.pantheonId));
    return pantheons.filter((p) => ids.has(p.id));
  }, [locations, pantheons]);

  // Helper to get deities for a location's pantheon
  const getDeitiesForLocation = useCallback(
    (location: Location) => {
      return deities
        .filter((d) => d.pantheonId === location.pantheonId)
        .slice(0, 4); // Show max 4 deities
    },
    [deities],
  );

  // Helper to get stories for a location's pantheon
  const getStoriesForLocation = useCallback(
    (location: Location) => {
      return stories
        .filter((s) => s.pantheonId === location.pantheonId)
        .slice(0, 3); // Show max 3 stories
    },
    [stories],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();

      mapInstanceRef.current = null;
    }

    // Double check if the element has internal Leaflet ID (strict mode safety)
    const element = containerRef.current as HTMLDivElement & {
      _leaflet_id?: number | null;
    };
    if (element._leaflet_id) {
      element._leaflet_id = null;
    }

    // Initialize Map
    const map = L.map(containerRef.current).setView([30, 10], 3);
    mapInstanceRef.current = map;

    // Add Tile Layer
    L.tileLayer(MAP_TILE_URL, MAP_TILE_OPTIONS).addTo(map);

    // Fit Bounds
    if (mappableLocations.length > 0) {
      const bounds = L.latLngBounds(
        mappableLocations.map((loc) => [loc.latitude!, loc.longitude!]),
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

    const createClusters = (
      locs: typeof mappableLocations,
      zoomLevel: number,
    ): ClusterGroup[] => {
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
        const sumLat = cluster.locations.reduce(
          (sum, loc) => sum + loc.latitude!,
          0,
        );
        const sumLng = cluster.locations.reduce(
          (sum, loc) => sum + loc.longitude!,
          0,
        );
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
          const icon = createMarkerIcon(
            location.pantheonId,
            location.locationType,
          );
          const colors = PANTHEON_COLORS[location.pantheonId] || {
            bg: "#6b7280",
            border: "#4b5563",
            label: location.pantheonId,
          };
          const typeLabel = getLocationTypeLabel(location.locationType);
          const locationDeities = getDeitiesForLocation(location);
          const locationStories = getStoriesForLocation(location);

          // Build popup using DOM API to avoid innerHTML injection risks
          const popupContent = document.createElement("div");
          popupContent.className = "mythic-popup";
          popupContent.style.cssText = `min-width: 260px; max-width: 320px; padding: ${location.imageUrl ? "12px" : "12px"};`;

          // Image section
          if (location.imageUrl) {
            const imgWrapper = document.createElement("div");
            imgWrapper.style.cssText =
              "position:relative; width:100%; height:96px; margin:-12px -12px 12px; border-radius:6px 6px 0 0; overflow:hidden; width:calc(100% + 24px);";
            const img = document.createElement("img");
            img.src = location.imageUrl;
            img.alt = location.name;
            img.style.cssText = "width:100%; height:100%; object-fit:cover;";
            img.addEventListener("error", () => {
              imgWrapper.style.display = "none";
            });
            const overlay = document.createElement("div");
            overlay.style.cssText =
              "position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.4), transparent);";
            imgWrapper.appendChild(img);
            imgWrapper.appendChild(overlay);
            popupContent.appendChild(imgWrapper);
          }

          // Header row
          const headerRow = document.createElement("div");
          headerRow.style.cssText =
            "display:flex; align-items:flex-start; gap:8px; margin-bottom:8px;";
          const dot = document.createElement("span");
          dot.style.cssText = `margin-top:4px; width:12px; height:12px; border-radius:50%; flex-shrink:0; background-color:${colors.bg};`;
          const titleBlock = document.createElement("div");
          const h3 = document.createElement("h3");
          h3.style.cssText =
            "font-family:serif; font-weight:600; font-size:14px; line-height:1.3; color:#1e293b; margin:0;";
          h3.textContent = location.name;
          const meta = document.createElement("div");
          meta.style.cssText =
            "display:flex; align-items:center; gap:8px; margin-top:2px;";
          const typeSpan = document.createElement("span");
          typeSpan.style.cssText =
            "font-size:11px; font-weight:500; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;";
          typeSpan.textContent = typeLabel;
          const sep = document.createElement("span");
          sep.style.cssText = "color:#cbd5e1;";
          sep.textContent = "|";
          const pantheonSpan = document.createElement("span");
          pantheonSpan.style.cssText = `font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.05em; color:${colors.bg};`;
          pantheonSpan.textContent = colors.label;
          meta.appendChild(typeSpan);
          meta.appendChild(sep);
          meta.appendChild(pantheonSpan);
          titleBlock.appendChild(h3);
          titleBlock.appendChild(meta);
          headerRow.appendChild(dot);
          headerRow.appendChild(titleBlock);
          popupContent.appendChild(headerRow);

          // Description
          const descP = document.createElement("p");
          descP.style.cssText =
            "font-size:13px; color:#475569; line-height:1.5; margin:0 0 4px;";
          descP.textContent = location.description;
          popupContent.appendChild(descP);

          // Deities section
          if (locationDeities.length > 0) {
            const deitiesSection = document.createElement("div");
            deitiesSection.style.cssText =
              "margin-top:12px; padding-top:12px; border-top:1px solid #e2e8f0;";
            const deitiesLabel = document.createElement("div");
            deitiesLabel.style.cssText =
              "font-size:10px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;";
            deitiesLabel.textContent = "Associated Deities";
            deitiesSection.appendChild(deitiesLabel);
            const deityLinks = document.createElement("div");
            deityLinks.style.cssText = "display:flex; flex-wrap:wrap; gap:4px;";
            locationDeities.forEach((deity) => {
              const a = document.createElement("a");
              a.href = `/deities/${deity.slug}`;
              a.style.cssText =
                "display:inline-flex; align-items:center; gap:4px; padding:2px 8px; background:#f1f5f9; border-radius:4px; font-size:12px; color:#475569; text-decoration:none;";
              a.textContent = deity.name;
              deityLinks.appendChild(a);
            });
            deitiesSection.appendChild(deityLinks);
            popupContent.appendChild(deitiesSection);
          }

          // Stories section
          if (locationStories.length > 0) {
            const storiesSection = document.createElement("div");
            storiesSection.style.cssText = "margin-top:8px;";
            const storiesLabel = document.createElement("div");
            storiesLabel.style.cssText =
              "font-size:10px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;";
            storiesLabel.textContent = "Related Stories";
            storiesSection.appendChild(storiesLabel);
            locationStories.forEach((story) => {
              const a = document.createElement("a");
              a.href = `/stories/${story.slug}`;
              a.style.cssText =
                "display:block; font-size:12px; color:#2563eb; text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px;";
              a.textContent = story.title;
              storiesSection.appendChild(a);
            });
            popupContent.appendChild(storiesSection);
          }

          // Learn More link
          const footer = document.createElement("div");
          footer.style.cssText =
            "margin-top:12px; padding-top:8px; border-top:1px solid #e2e8f0;";
          const learnMore = document.createElement("a");
          learnMore.href = `/locations/${location.id}`;
          learnMore.style.cssText =
            "display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:500; color:#D4AF37; text-decoration:none;";
          learnMore.textContent = "Learn More →";
          footer.appendChild(learnMore);
          popupContent.appendChild(footer);

          const marker = L.marker([location.latitude!, location.longitude!], {
            icon,
            title: `${location.name}: ${typeLabel}`,
          }).bindPopup(popupContent, { maxWidth: 350 });
          marker.on("add", () => {
            marker
              .getElement()
              ?.setAttribute("aria-label", `${location.name}: ${typeLabel}`);
          });
          marker.addTo(markersLayer);
        } else {
          // Cluster marker
          const clusterIcon = createClusterIcon(cluster.locations.length);

          // Build cluster popup using DOM API to avoid innerHTML injection risks
          const clusterPopup = document.createElement("div");
          clusterPopup.className = "mythic-cluster-popup";
          clusterPopup.style.cssText = "min-width:200px; max-width:280px;";

          const clusterHeader = document.createElement("div");
          clusterHeader.style.cssText =
            "font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;";
          clusterHeader.textContent = `${cluster.locations.length} Locations`;
          clusterPopup.appendChild(clusterHeader);

          const clusterList = document.createElement("div");
          clusterList.style.cssText =
            "display:flex; flex-direction:column; gap:2px; max-height:200px; overflow-y:auto;";
          cluster.locations.forEach((loc) => {
            const locColors = PANTHEON_COLORS[loc.pantheonId] || {
              bg: "#6b7280",
              label: loc.pantheonId,
            };
            const item = document.createElement("button");
            item.type = "button";
            item.style.cssText =
              "display:flex; align-items:center; gap:8px; width:100%; text-align:left; padding:4px 8px; background:#f8fafc; border:0; border-radius:4px; font-size:12px; cursor:pointer;";
            item.addEventListener("mouseenter", () => {
              item.style.background = "#f1f5f9";
            });
            item.addEventListener("mouseleave", () => {
              item.style.background = "#f8fafc";
            });
            item.addEventListener("click", () => {
              globalThis.dispatchEvent(
                new CustomEvent("flyToLocation", {
                  detail: { lat: loc.latitude, lng: loc.longitude },
                }),
              );
            });
            const colorDot = document.createElement("span");
            colorDot.style.cssText = `width:8px; height:8px; border-radius:50%; flex-shrink:0; background-color:${locColors.bg};`;
            const nameSpan = document.createElement("span");
            nameSpan.style.cssText =
              "color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
            nameSpan.textContent = loc.name;
            item.appendChild(colorDot);
            item.appendChild(nameSpan);
            clusterList.appendChild(item);
          });
          clusterPopup.appendChild(clusterList);

          const clusterFooter = document.createElement("div");
          clusterFooter.style.cssText =
            "font-size:10px; color:#94a3b8; margin-top:8px; padding-top:8px; border-top:1px solid #e2e8f0;";
          clusterFooter.textContent = "Zoom in or click a location";
          clusterPopup.appendChild(clusterFooter);

          const marker = L.marker([cluster.center.lat, cluster.center.lng], {
            icon: clusterIcon,
            title: `Cluster of ${cluster.locations.length} locations`,
          }).bindPopup(clusterPopup, { maxWidth: 300 });
          marker.on("add", () => {
            marker
              .getElement()
              ?.setAttribute(
                "aria-label",
                `Cluster of ${cluster.locations.length} locations. Open locations.`,
              );
          });
          marker.addTo(markersLayer);
        }
      });
    };

    // Initial render
    renderMarkers();
    markersLayer.addTo(map);

    // Re-render on zoom change
    map.on("zoomend", renderMarkers);

    // FlyTo Listener
    const handleFlyTo = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number }>;
      const { lat, lng } = customEvent.detail;
      map.flyTo([lat, lng], 8, { duration: 1.5 });
    };
    globalThis.addEventListener("flyToLocation", handleFlyTo);

    return () => {
      globalThis.removeEventListener("flyToLocation", handleFlyTo);
      map.off("zoomend");
      // Cancel any in-flight pan/zoom/flyTo animation before teardown. A filter
      // pill click changes mappableLocations and re-runs this effect; without
      // stop(), a queued animation frame calls _move() on the removed map whose
      // _mapPane no longer has _leaflet_pos, throwing TypeError (Sentry MYTHOS-G).
      map.stop();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (markersLayerRef.current) {
        markersLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable and don't need to be in deps
  }, [
    mappableLocations,
    enableClustering,
    getDeitiesForLocation,
    getStoriesForLocation,
  ]); // Re-init if locations change or clustering toggle

  return (
    <div className="relative w-full h-full min-h-125 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Pantheon Filter Pills - Above Map */}
      <div className="absolute top-4 left-4 right-4 z-1000 flex flex-wrap items-center gap-2">
        {/* All button */}
        <button
          onClick={() => setActivePantheonFilter(null)}
          aria-pressed={activePantheonFilter === null}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm ${
            activePantheonFilter === null
              ? "bg-gold text-midnight border border-gold"
              : "bg-card text-safe-subtle border border-border hover:border-gold/50 hover:text-gold-text"
          }`}
        >
          All
        </button>

        {/* Pantheon filter buttons */}
        {uniquePantheons.map((pantheon) => {
          const colors = PANTHEON_COLORS[pantheon.id];
          const isActive = activePantheonFilter === pantheon.id;
          const count = locations.filter(
            (l) => l.pantheonId === pantheon.id && l.latitude !== null,
          ).length;

          return (
            <button
              key={pantheon.id}
              onClick={() =>
                setActivePantheonFilter(isActive ? null : pantheon.id)
              }
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm flex items-center gap-1.5 ${
                isActive
                  ? "bg-gold text-midnight border border-gold"
                  : "bg-card text-safe-subtle border border-border hover:border-gold/50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors?.bg || "#6b7280" }}
              />
              {colors?.label || pantheon.name}
              <span className={isActive ? "text-midnight" : "text-safe-subtle"}>
                ({count})
              </span>
            </button>
          );
        })}

        {/* Clustering toggle */}
        <div className="ml-auto">
          <button
            onClick={() => setEnableClustering(!enableClustering)}
            aria-pressed={enableClustering}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm backdrop-blur-sm flex items-center gap-1.5 ${
              enableClustering
                ? "bg-gold text-midnight border border-gold"
                : "bg-card text-safe-subtle border border-border hover:border-gold/50"
            }`}
            title={
              enableClustering ? "Disable clustering" : "Enable clustering"
            }
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
        role="region"
        aria-label="Mythology locations map"
        className="mythos-locations-map z-0 w-full h-full"
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
      />

      <style jsx global>{`
        .mythos-locations-map .leaflet-control-attribution a {
          color: var(--gold-text);
        }
      `}</style>

      {/* Map stats overlay */}
      <div className="absolute bottom-4 left-4 z-1000 bg-card border border-border rounded-lg px-3 py-2 text-xs text-safe-subtle">
        <span className="font-medium text-foreground">
          {mappableLocations.length}
        </span>{" "}
        location
        {mappableLocations.length !== 1 ? "s" : ""} shown
        {activePantheonFilter && (
          <span className="ml-1">
            in{" "}
            <span className="text-safe-subtle">
              {PANTHEON_COLORS[activePantheonFilter]?.label}
            </span>
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-1000 bg-card border border-border rounded-lg px-3 py-2">
        <div className="text-[10px] font-semibold text-safe-subtle uppercase tracking-wider mb-1.5">
          Legend
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {Object.entries(PANTHEON_COLORS)
            .slice(0, 5)
            .map(([id, colors]) => (
              <div key={id} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.bg }}
                />
                <span className="text-safe-subtle">{colors.label}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
