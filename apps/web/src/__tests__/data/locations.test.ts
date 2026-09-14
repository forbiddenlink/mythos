import { existsSync } from "node:fs";
import { join } from "node:path";
import locations from "../../data/locations.json";
import pantheons from "../../data/pantheons.json";
import { LOCATION_ALIASES } from "@/lib/location-aliases";

const { describe, it, expect } = await import("vitest");

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);
const publicRoot = join(__dirname, "..", "..", "..", "public");

type LocationRecord = {
  id: string;
  name: string;
  pantheonId: string;
  locationType: string;
  description: string;
  imageUrl?: string | null;
  detailedBio?: string;
  primarySources?: Array<{ text?: string; source?: string; date?: string }>;
};

describe("locations.json data integrity", () => {
  it("should have at least one location", () => {
    expect(locations.length).toBeGreaterThan(0);
  });

  it("every location should have required fields", () => {
    for (const location of locations as LocationRecord[]) {
      expect(location.id).toBeTruthy();
      expect(location.name).toBeTruthy();
      expect(location.pantheonId).toBeTruthy();
      expect(location.locationType).toBeTruthy();
      expect(location.description).toBeTruthy();
    }
  });

  it("every location should have a valid pantheonId", () => {
    for (const location of locations as LocationRecord[]) {
      expect(validPantheonIds).toContain(location.pantheonId);
    }
  });

  it("every location should have a unique id and name", () => {
    const ids = locations.map((l: { id: string }) => l.id);
    const names = locations.map((l: { name: string }) => l.name.trim());
    expect(new Set(ids).size).toBe(ids.length);
    const seen = new Map<string, number>();
    for (const name of names) {
      seen.set(name, (seen.get(name) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
    expect(duplicates).toEqual([]);
  });

  it("every location should have a detailedBio", () => {
    for (const location of locations as LocationRecord[]) {
      expect(typeof location.detailedBio, location.id).toBe("string");
      expect(
        location.detailedBio!.trim().length,
        location.id,
      ).toBeGreaterThanOrEqual(300);
    }
  });

  it("every location has at least one primary source", () => {
    for (const location of locations as LocationRecord[]) {
      expect(location.primarySources?.length ?? 0, location.id).toBeGreaterThan(
        0,
      );
      for (const source of location.primarySources ?? []) {
        expect(source.source?.trim().length, location.id).toBeGreaterThan(0);
        expect(source.text?.trim().length, location.id).toBeGreaterThan(0);
      }
    }
  });

  it("imageUrl, when set, points at a file in public/", () => {
    for (const location of locations as LocationRecord[]) {
      const url = location.imageUrl;
      if (!url) continue;
      expect(url.startsWith("/"), location.id).toBe(true);
      expect(existsSync(join(publicRoot, url.slice(1))), url).toBe(true);
    }
  });

  it("aliased duplicate slugs are not still in the catalog", () => {
    const ids = new Set(locations.map((l: { id: string }) => l.id));
    for (const [from, to] of Object.entries(LOCATION_ALIASES)) {
      expect(ids.has(from), from).toBe(false);
      expect(ids.has(to), to).toBe(true);
    }
  });
});
