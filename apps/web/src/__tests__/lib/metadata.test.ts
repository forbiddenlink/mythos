import { describe, expect, it } from "vitest";
import pantheons from "@/data/pantheons.json";
import {
  figuresNoun,
  shortPantheonName,
  traditionHubTitle,
} from "@/lib/metadata";

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

describe("traditionHubTitle", () => {
  it.each([
    ["Greek Pantheon", "Greek Mythology: Gods, Pantheon and Myths"],
    ["Haudenosaunee Tradition", "Haudenosaunee Mythology: Gods and Myths"],
    ["African Traditions", "African Traditions: Gods and Myths"],
    [
      "Canaanite Pantheon (Ugarit)",
      "Canaanite Pantheon (Ugarit): Gods and Myths",
    ],
  ])("puts the searched phrase in the hub title: %s", (name, expected) => {
    expect(traditionHubTitle({ name })).toBe(expected);
  });
});

describe("figuresNoun", () => {
  it("counts a tradition with its own label as figures, never deities", () => {
    const shinto = pantheons.find((p) => p.id === "japanese-pantheon");
    expect(shinto?.figuresLabel).toBe("Kami");
    expect(figuresNoun(shinto!)).toBe("figures");
  });

  it("counts a tradition without a label as deities", () => {
    expect(figuresNoun({})).toBe("deities");
    expect(figuresNoun({ figuresLabel: null })).toBe("deities");
  });
});
