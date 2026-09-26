/**
 * Cross-file integrity checks for the static catalogs.
 *
 * Each block pins an invariant that an audit once found broken, so a future
 * edit that reintroduces a dangling reference fails here instead of
 * rendering a dead link or an empty card.
 */
import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import pantheons from "@/data/pantheons.json";
import { normalizeDeityReference } from "@/lib/deities";

type Parallel = { pantheonId: string; deityId: string; note: string };
type HeroParallel = { pantheonId: string; heroId: string; note: string };
type DeityRecord = {
  id: string;
  pantheonId: string;
  alternateNames?: string[];
  crossPantheonParallels?: Parallel[];
  heroParallels?: HeroParallel[];
};

const deityList = deities as DeityRecord[];
const deityById = new Map(deityList.map((d) => [d.id, d]));
const heroById = new Map(
  (heroes as Array<{ id: string; pantheonId: string }>).map((h) => [h.id, h]),
);
const pantheonIds = new Set(pantheons.map((p) => p.id));

/**
 * Hades and Persephone keep their Roman names (Pluto, Proserpina) as alias
 * rows instead of second articles; `distinctDeityReference` hides those rows
 * in the UI. Such a row is valid only when the target is one of the source
 * deity's own alternate names.
 */
function isOwnAlias(deity: DeityRecord, reference: string): boolean {
  const wanted = normalizeDeityReference(reference);
  return (deity.alternateNames ?? []).some(
    (name) => normalizeDeityReference(name) === wanted,
  );
}

describe("deity cross-pantheon parallels", () => {
  it("every crossPantheonParallels target is a deity (or the source's own alias)", () => {
    const dangling: string[] = [];
    for (const deity of deityList) {
      for (const parallel of deity.crossPantheonParallels ?? []) {
        if (deityById.has(parallel.deityId)) continue;
        if (isOwnAlias(deity, parallel.deityId)) continue;
        dangling.push(`${deity.id} -> ${parallel.deityId}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it("names the target's own pantheon on every deity parallel", () => {
    const mismatched: string[] = [];
    for (const deity of deityList) {
      for (const parallel of deity.crossPantheonParallels ?? []) {
        expect(pantheonIds, `${deity.id} -> ${parallel.pantheonId}`).toContain(
          parallel.pantheonId,
        );
        const target = deityById.get(parallel.deityId);
        if (target && target.pantheonId !== parallel.pantheonId) {
          mismatched.push(
            `${deity.id} -> ${parallel.deityId}: ${parallel.pantheonId} != ${target.pantheonId}`,
          );
        }
      }
    }
    expect(mismatched).toEqual([]);
  });

  it("points hero comparisons at heroes.json through heroParallels", () => {
    const dangling: string[] = [];
    for (const deity of deityList) {
      for (const parallel of deity.heroParallels ?? []) {
        const hero = heroById.get(parallel.heroId);
        if (!hero || hero.pantheonId !== parallel.pantheonId) {
          dangling.push(`${deity.id} -> ${parallel.heroId}`);
        }
        expect(parallel.note.length, deity.id).toBeGreaterThan(0);
      }
    }
    expect(dangling).toEqual([]);
  });

  it("does not list a hero id as a deity parallel", () => {
    const heroTargets = deityList.flatMap((deity) =>
      (deity.crossPantheonParallels ?? [])
        .filter((p) => !deityById.has(p.deityId) && heroById.has(p.deityId))
        .map((p) => `${deity.id} -> ${p.deityId}`),
    );
    expect(heroTargets).toEqual([]);
  });
});
