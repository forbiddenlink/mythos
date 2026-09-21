/**
 * Shared basemap for every Leaflet map on the site.
 *
 * CARTO's keyless basemaps now stamp "API KEY REQUIRED" across every tile, so
 * the maps use OpenStreetMap's standard tiles instead. That is within the OSM
 * tile usage policy for a low-traffic site, provided attribution stays visible.
 * The tiles are light by default; the `mythos-dark-tiles` class (globals.css)
 * inverts them to fit the dark atlas palette without a paid dark style.
 */
export const MAP_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const MAP_TILE_OPTIONS = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  className: "mythos-dark-tiles",
} as const;
