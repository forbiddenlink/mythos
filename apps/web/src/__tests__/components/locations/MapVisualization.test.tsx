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
    project: vi.fn(([lat, lng]: number[]) => ({ x: lng * 100, y: lat * 100 })),
    flyTo: vi.fn(),
    flyToBounds: vi.fn(),
    getBoundsZoom: vi.fn(() => 6),
  };
  const markers: Array<{
    bindPopup: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  }> = [];
  return {
    map,
    markers,
    createMap: vi.fn(() => map),
    tile: vi.fn(() => ({ addTo: vi.fn() })),
  };
});
vi.mock("leaflet", () => ({
  default: {
    map: leaflet.createMap,
    tileLayer: leaflet.tile,
    latLngBounds: vi.fn((points) => ({ points, isValid: () => true })),
    point: vi.fn((x, y) => ({ x, y })),
    divIcon: vi.fn(),
    layerGroup: vi.fn(() => ({
      clearLayers: vi.fn(),
      remove: vi.fn(),
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => {
      const marker = {
        bindPopup: vi.fn().mockReturnThis(),
        on: vi.fn(),
        addTo: vi.fn(),
      };
      leaflet.markers.push(marker);
      return marker;
    }),
  },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  leaflet.markers.length = 0;
});

const greek = [
  { id: "greek-pantheon", name: "Greek", slug: "greek", culture: "Greek" },
];

function place(i: number) {
  return {
    id: `place-${i}`,
    name: `Place ${i}`,
    pantheonId: "greek-pantheon",
    locationType: "temple",
    latitude: 38 + i * 0.01,
    longitude: 23 + i * 0.01,
    description: "A temple",
    imageUrl: undefined,
  };
}

it("zooms into a large cluster instead of listing every place", () => {
  render(
    <MapVisualization
      locations={Array.from({ length: 20 }, (_, i) => place(i))}
      pantheons={greek}
    />,
  );
  expect(leaflet.markers).toHaveLength(1);
  const [cluster] = leaflet.markers;
  expect(cluster.bindPopup).not.toHaveBeenCalled();
  const onClick = cluster.on.mock.calls.find(([event]) => event === "click");
  expect(onClick).toBeDefined();
  onClick![1]();
  expect(leaflet.map.flyToBounds).toHaveBeenCalledTimes(1);
});

it("still lists the places in a small cluster", () => {
  render(
    <MapVisualization
      locations={Array.from({ length: 3 }, (_, i) => place(i))}
      pantheons={greek}
    />,
  );
  expect(leaflet.markers).toHaveLength(1);
  expect(leaflet.markers[0].bindPopup).toHaveBeenCalledTimes(1);
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
