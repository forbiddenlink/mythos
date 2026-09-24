import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MapVisualization } from "@/components/locations/MapVisualization";

const leaflet = vi.hoisted(() => {
  const map = {
    setView: vi.fn().mockReturnThis(),
    fitBounds: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    stop: vi.fn(),
    remove: vi.fn(),
    getZoom: vi.fn(() => 3),
    flyTo: vi.fn(),
  };
  return {
    map,
    createMap: vi.fn(() => map),
    tile: vi.fn(() => ({ addTo: vi.fn() })),
  };
});
vi.mock("leaflet", () => ({
  default: {
    map: leaflet.createMap,
    tileLayer: leaflet.tile,
    latLngBounds: vi.fn((v) => v),
    divIcon: vi.fn(),
    layerGroup: vi.fn(() => ({
      clearLayers: vi.fn(),
      remove: vi.fn(),
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      bindPopup: vi.fn().mockReturnThis(),
      on: vi.fn(),
      addTo: vi.fn(),
    })),
  },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("preserves the map and viewport when filters or clustering change", () => {
  render(
    <MapVisualization
      locations={[
        {
          id: "olympus",
          name: "Olympus",
          pantheonId: "greek-pantheon",
          locationType: "mountain",
          latitude: 40,
          longitude: 22,
          description: "A mountain",
          imageUrl: undefined,
        },
      ]}
      pantheons={[
        {
          id: "greek-pantheon",
          name: "Greek",
          slug: "greek",
          culture: "Greek",
        },
      ]}
    />,
  );
  expect(leaflet.createMap).toHaveBeenCalledTimes(1);
  expect(leaflet.map.fitBounds).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: /Greek/ }));
  fireEvent.click(screen.getByRole("button", { name: "All" }));
  fireEvent.click(screen.getByRole("button", { name: /cluster/i }));
  expect(leaflet.createMap).toHaveBeenCalledTimes(1);
  expect(leaflet.tile).toHaveBeenCalledTimes(1);
  expect(leaflet.map.fitBounds).toHaveBeenCalledTimes(1);
  expect(leaflet.map.remove).not.toHaveBeenCalled();
  cleanup();
  expect(leaflet.map.remove).toHaveBeenCalledTimes(1);
});
