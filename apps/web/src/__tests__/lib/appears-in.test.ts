import { describe, expect, it } from "vitest";
import { getAppearsIn } from "@/lib/appears-in";

describe("getAppearsIn", () => {
  it("finds Achilles in both the Iliad and the Odyssey", () => {
    const entries = getAppearsIn("achilles", "hero");
    const titles = entries.map((e) => e.title);

    expect(titles).toContain("Iliad");
    expect(titles).toContain("Odyssey");

    const odysseyEntry = entries.find((e) => e.title === "Odyssey");
    expect(odysseyEntry?.where).toMatch(/11/);
  });

  it("returns an empty array for an entity with no appearances", () => {
    expect(getAppearsIn("not-a-real-id", "hero")).toEqual([]);
  });

  it("does not cross-match a hero id against deity entries", () => {
    // gilgamesh is stored as a deity, not a hero
    expect(getAppearsIn("gilgamesh", "hero")).toEqual([]);
    expect(getAppearsIn("gilgamesh", "deity").length).toBeGreaterThan(0);
  });

  it("finds Marduk in Enuma Elish", () => {
    const entries = getAppearsIn("marduk", "deity");
    const sourceIds = entries.map((e) => e.sourceId);
    expect(sourceIds).toContain("enuma-elish");
  });

  it("finds Osiris in both the Book of the Dead and the Pyramid Texts", () => {
    const entries = getAppearsIn("osiris", "deity");
    const sourceIds = entries.map((e) => e.sourceId);
    expect(sourceIds).toContain("book-of-the-dead");
    expect(sourceIds).toContain("pyramid-texts");
  });

  it("finds Amaterasu in both Kojiki and Nihon Shoki", () => {
    const entries = getAppearsIn("amaterasu", "deity");
    const sourceIds = entries.map((e) => e.sourceId);
    expect(sourceIds).toContain("kojiki");
    expect(sourceIds).toContain("nihon-shoki");
  });

  it("finds Heracles and Perseus in Apollodorus Bibliotheca", () => {
    const heraclesEntries = getAppearsIn("heracles", "hero");
    expect(heraclesEntries.map((e) => e.sourceId)).toContain(
      "library-apollodorus",
    );

    const perseusEntries = getAppearsIn("perseus", "deity");
    expect(perseusEntries.map((e) => e.sourceId)).toContain(
      "library-apollodorus",
    );
  });
});
