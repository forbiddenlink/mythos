import L from "leaflet";
import { PANTHEON_BG_BORDER_LABEL as PANTHEON_COLORS } from "@/lib/pantheon-colors";

/**
 * Leaflet marker/icon helpers shared between the full locations map
 * (`MapVisualization`) and the compact per-location inset
 * (`LocationMapInset`). Extracted so both consumers build markers the same
 * way instead of duplicating Leaflet setup.
 */

// ─── Location type icons (SVG paths used in markers) ────────────────────
export const LOCATION_ICONS: Record<string, string> = {
  temple:
    "M12 2L2 8v2h20V8L12 2zm0 2.5L18 8H6l6-3.5zM4 12v7h3v-5h2v5h2v-5h2v5h2v-5h2v5h3v-7H4z",
  city: "M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z",
  realm:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  mountain: "M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z",
  monument: "M12 2L6 12h3v8h6v-8h3L12 2z",
  sacred_site:
    "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z",
  tomb: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
  underworld:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5S16.17 11 17 11zm-5 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z",
  mythical_realm:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

// ─── Location type display labels ───────────────────────────────────────
const LOCATION_TYPE_LABELS: Record<string, string> = {
  temple: "Temple",
  city: "City",
  realm: "Realm",
  mountain: "Mountain",
  monument: "Monument",
  sacred_site: "Sacred Site",
  tomb: "Tomb",
  underworld: "Underworld",
  mythical_realm: "Mythical Realm",
};

export function getLocationTypeLabel(type: string): string {
  return (
    LOCATION_TYPE_LABELS[type] ||
    type.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase())
  );
}

interface CreateMarkerIconOptions {
  /** 0-1 opacity applied to the whole marker; used for faint context markers. */
  opacity?: number;
  /** Uniform scale factor applied to the default 36x44 marker size. */
  scale?: number;
}

// ─── Create custom marker icon ─────────────────────────────────────────
export function createMarkerIcon(
  pantheonId: string,
  locationType: string,
  options: CreateMarkerIconOptions = {},
): L.DivIcon {
  const { opacity = 1, scale = 1 } = options;
  const colors = PANTHEON_COLORS[pantheonId] || {
    bg: "#6b7280",
    border: "#4b5563",
  };
  const iconPath = LOCATION_ICONS[locationType] || LOCATION_ICONS.sacred_site;
  const width = Math.round(36 * scale);
  const height = Math.round(44 * scale);

  const svgHtml = `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      opacity: ${opacity};
    ">
      <svg width="${width}" height="${height}" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
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
    className: "custom-map-marker",
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
}
