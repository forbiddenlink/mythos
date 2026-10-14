import { describe, expect, it } from "vitest";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import {
  getCreatureHub,
  getCreatureHubs,
  getGoddessHub,
  getGoddessHubs,
  MIN_CREATURES,
  MIN_GODDESSES,
} from "@/lib/pantheon-hubs";

describe("creature hubs", () => {
  const hubs = getCreatureHubs();

  it("exist only for traditions at or above the threshold", () => {
    expect(hubs.length).toBeGreaterThan(0);
    for (const hub of hubs) {
      expect(hub.creatures.length).toBeGreaterThanOrEqual(MIN_CREATURES);
    }
    const counts = new Map<string, number>();
    for (const c of creatures) {
      counts.set(c.pantheonId, (counts.get(c.pantheonId) ?? 0) + 1);
    }
    const eligible = [...counts.values()].filter((n) => n >= MIN_CREATURES);
    expect(hubs).toHaveLength(eligible.length);
  });

  it("lists exactly that tradition's creatures, most dangerous first", () => {
    const greek = getCreatureHub("greek");
    expect(greek).not.toBeNull();
    const expected = creatures.filter(
      (c) => c.pantheonId === "greek-pantheon",
    ).length;
    expect(greek?.creatures).toHaveLength(expected);
    const levels = greek?.creatures.map((c) => c.dangerLevel) ?? [];
    expect(levels).toEqual([...levels].sort((a, b) => b - a));
  });

  it("returns null for a tradition below the threshold or unknown", () => {
    expect(getCreatureHub("celtic")).toBeNull();
    expect(getCreatureHub("not-a-tradition")).toBeNull();
  });
});

describe("goddess hubs", () => {
  it("include only female deities of that tradition, above the threshold", () => {
    const hubs = getGoddessHubs();
    expect(hubs.length).toBeGreaterThan(0);
    for (const hub of hubs) {
      expect(hub.goddesses.length).toBeGreaterThanOrEqual(MIN_GODDESSES);
      for (const g of hub.goddesses) {
        expect(g.gender).toBe("female");
        expect(g.pantheonId).toBe(hub.tradition.id);
      }
    }
  });

  it("matches the catalog count for Greek goddesses", () => {
    const expected = deities.filter(
      (d) => d.pantheonId === "greek-pantheon" && d.gender === "female",
    ).length;
    expect(getGoddessHub("greek")?.goddesses).toHaveLength(expected);
  });

  it("has no hub for a tradition under the threshold", () => {
    expect(getGoddessHub("dine")).toBeNull();
  });
});
