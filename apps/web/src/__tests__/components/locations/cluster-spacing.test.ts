import { describe, expect, it } from "vitest";
import {
  MIN_MARKER_SPACING,
  mergeCrowdedGroups,
  type PinGroup,
} from "@/components/locations/cluster-spacing";

// 1 degree = 1 pixel keeps the arithmetic obvious.
const toPoint = (c: { lat: number; lng: number }) => ({ x: c.lng, y: c.lat });
const group = (
  name: string,
  lat: number,
  lng: number,
  n = 1,
): PinGroup<string> => ({
  locations: Array.from({ length: n }, (_, i) => `${name}${i}`),
  center: { lat, lng },
});

describe("mergeCrowdedGroups", () => {
  it("leaves well separated groups alone", () => {
    const out = mergeCrowdedGroups(
      [group("a", 0, 0), group("b", 0, 200)],
      toPoint,
    );
    expect(out).toHaveLength(2);
  });

  it("merges groups closer than the marker spacing", () => {
    const out = mergeCrowdedGroups(
      [group("a", 0, 0), group("b", 0, MIN_MARKER_SPACING - 1)],
      toPoint,
    );
    expect(out).toHaveLength(1);
    expect(out[0].locations).toEqual(["a0", "b0"]);
  });

  it("weights the merged centre by location count", () => {
    const [merged] = mergeCrowdedGroups(
      [group("a", 0, 0, 3), group("b", 0, 40, 1)],
      toPoint,
    );
    expect(merged.center.lng).toBeCloseTo(10);
  });

  it("chains merges until every pair is clear of the others", () => {
    const out = mergeCrowdedGroups(
      [
        group("a", 0, 0),
        group("b", 0, 40),
        group("c", 0, 80),
        group("d", 0, 400),
      ],
      toPoint,
    );
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const d = Math.hypot(
          out[i].center.lng - out[j].center.lng,
          out[i].center.lat - out[j].center.lat,
        );
        expect(d).toBeGreaterThanOrEqual(MIN_MARKER_SPACING);
      }
    }
    expect(out.flatMap((g) => g.locations).sort()).toEqual([
      "a0",
      "b0",
      "c0",
      "d0",
    ]);
  });
});
