import { describe, expect, it } from "vitest";
import {
  canonicalLocationSlug,
  LOCATION_ALIASES,
} from "@/lib/location-aliases";

describe("location aliases", () => {
  it("sends duplicate Aztec/Mesoamerican slugs to one canonical location", () => {
    expect(canonicalLocationSlug("coatepec-aztec")).toBe("coatepec");
    expect(canonicalLocationSlug("tamoanchan-aztec")).toBe("tamoanchan");
    expect(canonicalLocationSlug("coatepec")).toBe("coatepec");
  });

  it("does not alias unrelated locations", () => {
    expect(Object.keys(LOCATION_ALIASES).length).toBe(2);
  });
});
