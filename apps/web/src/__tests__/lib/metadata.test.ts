import { describe, expect, it } from "vitest";
import { shortPantheonName } from "@/lib/metadata";

describe("shortPantheonName", () => {
  it.each([
    ["Greek Pantheon", "Greek"],
    ["Haudenosaunee Tradition", "Haudenosaunee"],
    ["African Traditions", "African Traditions"],
    ["African Pantheon (Yoruba)", "African Pantheon (Yoruba)"],
  ])("shortens only a terminal category label: %s", (name, expected) => {
    expect(shortPantheonName({ name })).toBe(expected);
  });
  it("supplies a fallback for missing tradition records", () => {
    expect(shortPantheonName(undefined)).toBe("Ancient");
  });
});
