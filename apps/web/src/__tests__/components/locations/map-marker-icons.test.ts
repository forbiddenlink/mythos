import { describe, expect, it } from "vitest";
import {
  createMarkerIcon,
  getLocationTypeLabel,
} from "@/components/locations/map-marker-icons";

describe("getLocationTypeLabel", () => {
  it("returns the curated label for known types", () => {
    expect(getLocationTypeLabel("sacred_site")).toBe("Sacred Site");
    expect(getLocationTypeLabel("underworld")).toBe("Underworld");
  });

  it("title-cases unknown snake_case types as a fallback", () => {
    expect(getLocationTypeLabel("body_of_water")).toBe("Body Of Water");
  });
});

describe("createMarkerIcon", () => {
  it("builds a full-size icon by default", () => {
    const icon = createMarkerIcon("greek-pantheon", "mountain");
    expect(icon.options.iconSize).toEqual([36, 44]);
  });

  it("scales the icon size when a scale option is given", () => {
    const icon = createMarkerIcon("greek-pantheon", "mountain", {
      scale: 0.7,
    });
    expect(icon.options.iconSize).toEqual([25, 31]);
  });

  it("applies the requested opacity to the marker html", () => {
    const icon = createMarkerIcon("greek-pantheon", "mountain", {
      opacity: 0.45,
    });
    expect(icon.options.html).toContain("opacity: 0.45");
  });
});
