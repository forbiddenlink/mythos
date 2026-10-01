import { describe, expect, it } from "vitest";
import {
  formatCoordinate,
  MIN_PIN_SPACING,
  SYMBOLIC_LOCATION_TYPES,
  spreadPins,
} from "@/components/locations/LocationMapInset";

describe("formatCoordinate", () => {
  it("formats positive coordinates as N/E", () => {
    expect(formatCoordinate(40.086, 22.358)).toBe("40.086°N, 22.358°E");
  });

  it("formats negative coordinates as S/W", () => {
    expect(formatCoordinate(-13.5, -71.98)).toBe("13.5°S, 71.98°W");
  });

  it("formats zero as N/E (matches the >= 0 convention used elsewhere on the page)", () => {
    expect(formatCoordinate(0, 0)).toBe("0°N, 0°E");
  });
});

describe("SYMBOLIC_LOCATION_TYPES", () => {
  it("flags realm, underworld, and mythical_realm as symbolic placements", () => {
    expect(SYMBOLIC_LOCATION_TYPES.has("realm")).toBe(true);
    expect(SYMBOLIC_LOCATION_TYPES.has("underworld")).toBe(true);
    expect(SYMBOLIC_LOCATION_TYPES.has("mythical_realm")).toBe(true);
  });

  it("does not flag physically-located types", () => {
    expect(SYMBOLIC_LOCATION_TYPES.has("mountain")).toBe(false);
    expect(SYMBOLIC_LOCATION_TYPES.has("city")).toBe(false);
    expect(SYMBOLIC_LOCATION_TYPES.has("temple")).toBe(false);
  });
});

describe("spreadPins", () => {
  const primary = { x: 0, y: 0 };

  it("drops pins closer than the minimum spacing to the primary or each other", () => {
    const near = { id: "near", x: 10, y: 5 };
    const a = { id: "a", x: 100, y: 0 };
    const b = { id: "b", x: 110, y: 10 };
    expect(spreadPins(primary, [near, a, b]).map((p) => p.id)).toEqual(["a"]);
  });

  it("keeps pins that sit exactly at the minimum spacing", () => {
    const edge = { id: "edge", x: MIN_PIN_SPACING, y: 0 };
    expect(spreadPins(primary, [edge])).toEqual([edge]);
  });

  it("keeps the first of a crowded group so the result is stable", () => {
    const pins = [
      { id: "first", x: 200, y: 200 },
      { id: "second", x: 205, y: 200 },
    ];
    expect(spreadPins(primary, pins).map((p) => p.id)).toEqual(["first"]);
  });
});
