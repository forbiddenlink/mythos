import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import roster from "@/data/pantheon-rosters.json";
import { PANTHEON_IDS, isPantheonComplete } from "@/lib/pantheon-rosters";

describe("pantheon-rosters", () => {
  it("lists all 21 pantheons including Aztec", () => {
    expect(PANTHEON_IDS).toHaveLength(21);
    expect(PANTHEON_IDS).toContain("aztec-pantheon");
    expect(PANTHEON_IDS).toContain("roman-pantheon");
  });

  it("matches deity ids grouped from deities.json", () => {
    const expected: Record<string, string[]> = {};
    for (const id of PANTHEON_IDS) {
      expected[id] = [];
    }
    for (const deity of deities as { id: string; pantheonId: string }[]) {
      expected[deity.pantheonId]?.push(deity.id);
    }
    expect(roster).toEqual(expected);
  });

  it("treats a pantheon as complete only when every roster id was viewed", () => {
    expect(isPantheonComplete("roman-pantheon", [])).toBe(false);
    expect(
      isPantheonComplete("roman-pantheon", [...roster["roman-pantheon"]]),
    ).toBe(true);
  });
});
