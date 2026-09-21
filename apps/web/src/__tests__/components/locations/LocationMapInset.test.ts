import { describe, expect, it } from "vitest";
import {
  formatCoordinate,
  SYMBOLIC_LOCATION_TYPES,
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
