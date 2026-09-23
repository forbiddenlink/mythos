import deities from "../../data/deities.json";
import {
  distinctDeityReference,
  findDeityByReference,
  normalizeDeityReference,
} from "@/lib/deities";
import pantheons from "../../data/pantheons.json";

const { describe, it, expect } = await import("vitest");

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);

describe("deities.json data integrity", () => {
  it("uses canonical IDs when a parallel names a known alias in the same pantheon", () => {
    const aliases = deities.flatMap((deity) =>
      (deity.alternateNames ?? []).map((alias) => ({
        alias: normalizeDeityReference(alias),
        deity,
      })),
    );
    const stale: string[] = [];
    for (const deity of deities) {
      for (const parallel of deity.crossPantheonParallels ?? []) {
        const target = aliases.find(
          ({ alias, deity: candidate }) =>
            alias === normalizeDeityReference(parallel.deityId) &&
            candidate.pantheonId === parallel.pantheonId,
        )?.deity;
        if (target && parallel.deityId !== target.id) {
          stale.push(`${deity.id}: ${parallel.deityId} should be ${target.id}`);
        }
      }
    }
    expect(stale).toEqual([]);
  });

  it("keeps Roman names searchable without a second deity page", () => {
    expect(findDeityByReference("pluto")?.id).toBe("hades");
    expect(findDeityByReference("proserpina")?.id).toBe("persephone");
    expect(distinctDeityReference("hades", "pluto")).toBeUndefined();
    expect(distinctDeityReference("persephone", "proserpina")).toBeUndefined();
    expect(distinctDeityReference("hades", "osiris")?.id).toBe("osiris");

    const selfAliases: string[] = [];
    for (const deity of deities) {
      for (const parallel of deity.crossPantheonParallels ?? []) {
        if (findDeityByReference(parallel.deityId)?.id === deity.id) {
          selfAliases.push(`${deity.id}:${parallel.deityId}`);
        }
      }
    }
    expect(selfAliases.sort()).toEqual([
      "hades:pluto",
      "persephone:proserpina",
    ]);
  });

  it("should have at least one deity", () => {
    expect(deities.length).toBeGreaterThan(0);
  });

  it("every deity should have required fields", () => {
    for (const deity of deities) {
      expect(deity.id).toBeTruthy();
      expect(deity.name).toBeTruthy();
      expect(deity.slug).toBeTruthy();
      expect(deity.pantheonId).toBeTruthy();
      expect(deity.description).toBeTruthy();
      expect(Array.isArray(deity.domain)).toBe(true);
      expect(Array.isArray(deity.symbols)).toBe(true);
    }
  });

  it("every deity should have a valid pantheonId", () => {
    for (const deity of deities) {
      expect(validPantheonIds).toContain(deity.pantheonId);
    }
  });

  it("every deity should have a unique id", () => {
    const ids = deities.map((d: { id: string }) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every deity should have a unique slug", () => {
    const slugs = deities.map((d: { slug: string }) => d.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("every deity id should match its slug", () => {
    for (const deity of deities) {
      expect(deity.id).toBe(deity.slug);
    }
  });

  it("every deity should have a valid gender", () => {
    const validGenders = ["male", "female", "androgynous", "none", null];
    for (const deity of deities) {
      expect(validGenders).toContain(deity.gender);
    }
  });

  it("every deity should have a non-empty domain array", () => {
    for (const deity of deities) {
      expect(deity.domain.length).toBeGreaterThan(0);
    }
  });

  it("importanceRank should be a positive number when present", () => {
    for (const deity of deities) {
      if (deity.importanceRank !== null) {
        expect(deity.importanceRank).toBeGreaterThan(0);
      }
    }
  });

  it("sources should be a non-empty string array when present", () => {
    for (const deity of deities) {
      if ("sources" in deity && deity.sources !== undefined) {
        expect(Array.isArray(deity.sources)).toBe(true);
        expect(deity.sources.length).toBeGreaterThan(0);
        for (const line of deity.sources) {
          expect(typeof line).toBe("string");
          expect(line.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every deity should have a detailedBio", () => {
    for (const deity of deities) {
      expect(typeof deity.detailedBio).toBe("string");
      expect(deity.detailedBio.trim().length).toBeGreaterThanOrEqual(300);
    }
  });

  it("the densified deities include a primary source and cult notes", () => {
    const densified = [
      "njord",
      "nephthys",
      "jupiter",
      "juno",
      "neptune",
      "mars",
      "venus",
      "minerva",
      "apollo-roman",
      "diana",
      "mercury",
      "bacchus",
      "vulcan",
      "ceres",
      "vesta",
      "janus",
      "izanagi",
      "izanami",
      "hachiman",
      "benzaiten",
    ];
    const byId = new Map(deities.map((d: { id: string }) => [d.id, d]));
    for (const id of densified) {
      const deity = byId.get(id) as CultDeity;
      expect(deity, id).toBeTruthy();
      expect(deity.primarySources?.length ?? 0, id).toBeGreaterThan(0);
      expectCultNotes(deity, id);
    }
  });

  it("every deity has at least one primary source", () => {
    for (const deity of deities as CultDeity[]) {
      expect(deity.primarySources?.length ?? 0, deity.id).toBeGreaterThan(0);
    }
  });

  it("the Greek olympians include cult notes", () => {
    const olympians = [
      "zeus",
      "hera",
      "poseidon",
      "hades",
      "athena",
      "apollo",
      "artemis",
      "ares",
      "aphrodite",
      "hermes",
      "dionysus",
      "demeter",
      "hephaestus",
      "hestia",
    ];
    const byId = new Map(
      (deities as CultDeity[]).map((deity) => [deity.id, deity]),
    );
    for (const id of olympians) {
      const deity = byId.get(id);
      expect(deity, id).toBeTruthy();
      expectCultNotes(deity!, id);
    }
  });

  it("recorded cult notes are nonempty and contain no drafting instructions", () => {
    for (const deity of deities as CultDeity[]) {
      // Missing evidence is allowed; filling this field is not evidence of a cult.
      if (!deity.worship) continue;
      expectCultNotes(deity, deity.id);
      for (const note of [
        ...(deity.worship.temples ?? []),
        ...(deity.worship.festivals ?? []),
        deity.worship.practices ?? "",
      ]) {
        expect(note, deity.id).not.toMatch(/(?:^|[.;]\s+)do not invent\b/i);
      }
    }
  });
});

type CultDeity = {
  id: string;
  importanceRank?: number;
  primarySources?: { text: string; source: string }[];
  worship?: {
    temples?: string[];
    festivals?: string[];
    practices?: string;
  };
};

function expectCultNotes(deity: CultDeity, id: string) {
  const worship = deity.worship;
  expect(worship, id).toBeTruthy();
  const cultBits =
    (worship?.temples?.length ?? 0) +
    (worship?.festivals?.length ?? 0) +
    (worship?.practices ? 1 : 0);
  expect(cultBits, id).toBeGreaterThan(0);
}
