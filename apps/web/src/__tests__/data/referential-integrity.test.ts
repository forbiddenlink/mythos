/**
 * Cross-file integrity checks for the static catalogs.
 *
 * Each block pins an invariant that an audit once found broken, so a future
 * edit that reintroduces a dangling reference fails here instead of
 * rendering a dead link or an empty card.
 */
import { describe, expect, it } from "vitest";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import journeys from "@/data/journeys.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import relationships from "@/data/relationships.json";
import sources from "@/data/sources.json";
import stories from "@/data/stories.json";
import { normalizeDeityReference } from "@/lib/deities";
import { RELATIONSHIP_TYPES } from "@/lib/schemas";

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

describe("relationships", () => {
  const relationshipList = relationships as Array<{
    id: string;
    fromDeityId: string;
    toDeityId: string;
    relationshipType: string;
  }>;

  it("stores only the canonical relationship types", () => {
    const allowed = new Set<string>(RELATIONSHIP_TYPES);
    const odd = relationshipList
      .filter((r) => !allowed.has(r.relationshipType))
      .map((r) => `${r.id}: ${r.relationshipType}`);
    expect(odd).toEqual([]);
  });

  it("does not store the same pair twice with the same type", () => {
    const symmetric = new Set([
      "sibling_of",
      "spouse_of",
      "lover_of",
      "ally_of",
      "enemy_of",
    ]);
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const r of relationshipList) {
      const pair = symmetric.has(r.relationshipType)
        ? [r.fromDeityId, r.toDeityId].sort().join("|")
        : `${r.fromDeityId}|${r.toDeityId}`;
      const key = `${r.relationshipType}:${pair}`;
      if (seen.has(key)) duplicates.push(`${r.id} (${key})`);
      seen.add(key);
    }
    expect(duplicates).toEqual([]);
  });

  it("connects every deity to the family graph unless it has no attested kin", () => {
    // Figures for which the sources give no relationship to another deity in
    // this catalog. Adding kin for them would be invention, not coverage.
    const noAttestedKin = new Set([
      "cernunnos",
      "guan-yu",
      "ori",
      "yum-kaax",
      "ek-chuaj",
      "bes",
      "medb",
      "stribog",
      "simargl",
      "svantevit",
      "triglav",
      "chernobog",
      "purusha",
      "three-sisters",
      "dew-eagle",
      "djilaqons",
      "master-carpenter",
      "sun-goddess-of-the-earth",
      "sila",
      "pinga",
      "tornarsuk",
      "tulunigraq",
      "baiame",
      "rainbow-serpent",
      "wagyl",
      "coyote",
      "talking-god",
      // Inca/Andean: attested in lists of powers and offerings, not in kinship
      // with other deities in this catalog (Pachacamac's wife and daughters in
      // the Huarochirí material have no entries of their own).
      "pachamama",
      "mama-qucha",
      "illapa",
      "pachacamac",
      // Finnish: Ukko's consort (Akka/Rauni) and Tuoni's household have no
      // entries of their own; no kinship with catalogued figures is attested.
      "ukko",
      "tuoni",
      // Korean: Bak Hyeokgeose's parents are unnamed (an egg left by a white
      // horse), and Princess Bari's royal parents have no entries of their own.
      "bak-hyeokgeose",
      "bari-gongju",
    ]);
    const inGraph = new Set(
      relationshipList.flatMap((r) => [r.fromDeityId, r.toDeityId]),
    );
    const isolated = deityList
      .map((d) => d.id)
      .filter((id) => !inGraph.has(id) && !noAttestedKin.has(id));
    expect(isolated).toEqual([]);
    for (const id of noAttestedKin) {
      expect(deityById.has(id), id).toBe(true);
    }
  });
});

describe("artifact owners", () => {
  type ArtifactOwner = {
    id: string;
    owner?: unknown;
    ownerId?: string;
    ownerKind?: string;
    ownerLabel?: string;
  };
  const artifactList = artifacts as ArtifactOwner[];

  it("no longer uses the free-text owner field", () => {
    expect(artifactList.filter((a) => "owner" in a).map((a) => a.id)).toEqual(
      [],
    );
  });

  it("resolves every ownerId in the catalog its ownerKind names", () => {
    const unresolved: string[] = [];
    for (const artifact of artifactList) {
      if (artifact.ownerId === undefined) {
        expect(artifact.ownerKind, artifact.id).toBeUndefined();
        continue;
      }
      const catalog =
        artifact.ownerKind === "deity"
          ? deityById
          : artifact.ownerKind === "hero"
            ? heroById
            : undefined;
      if (!catalog?.has(artifact.ownerId)) {
        unresolved.push(
          `${artifact.id}: ${artifact.ownerKind}/${artifact.ownerId}`,
        );
      }
    }
    expect(unresolved).toEqual([]);
  });

  it("gives every artifact either a linked owner or an owner label", () => {
    const ownerless = artifactList
      .filter((a) => !a.ownerId && !a.ownerLabel?.trim())
      .map((a) => a.id);
    expect(ownerless).toEqual([]);
  });

  it("keeps ownerLabel for text an id cannot express", () => {
    // A label that is just the id restated adds nothing; drop it instead.
    for (const artifact of artifactList) {
      if (!artifact.ownerId || !artifact.ownerLabel) continue;
      expect(
        normalizeDeityReference(artifact.ownerLabel),
        artifact.id,
      ).not.toBe(artifact.ownerId);
    }
  });
});

describe("location coordinates", () => {
  type LocationRecord = {
    id: string;
    latitude?: number | null;
    longitude?: number | null;
    geography?: string;
    coordinateNote?: string;
  };
  const locationList = locations as LocationRecord[];

  it("classifies every location's geography", () => {
    const unclassified = locationList
      .filter(
        (l) =>
          !["physical", "identified", "mythic"].includes(l.geography ?? ""),
      )
      .map((l) => l.id);
    expect(unclassified).toEqual([]);
  });

  it("gives every physical or identified place valid coordinates", () => {
    const missing: string[] = [];
    for (const loc of locationList) {
      if (loc.geography === "mythic") continue;
      const { latitude, longitude } = loc;
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180
      ) {
        missing.push(loc.id);
      }
    }
    expect(missing).toEqual([]);
  });

  it("keeps mythic realms off the map", () => {
    const pinned = locationList
      .filter(
        (l) =>
          l.geography === "mythic" &&
          (l.latitude != null || l.longitude != null),
      )
      .map((l) => l.id);
    expect(pinned).toEqual([]);
  });

  it("does not stack distinct places on one point", () => {
    const byPoint = new Map<string, string[]>();
    for (const loc of locationList) {
      if (loc.latitude == null || loc.longitude == null) continue;
      const key = `${loc.latitude},${loc.longitude}`;
      byPoint.set(key, [...(byPoint.get(key) ?? []), loc.id]);
    }
    const stacked = [...byPoint.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([point, ids]) => `${point}: ${ids.join(", ")}`);
    expect(stacked).toEqual([]);
  });

  it("explains coordinates only where there are coordinates", () => {
    for (const loc of locationList) {
      if (loc.coordinateNote) {
        expect(loc.latitude, loc.id).not.toBeNull();
      }
    }
  });
});

describe("citation sourceIds", () => {
  const sourceIds = new Set(sources.map((s) => s.id));
  const catalogs: Record<string, unknown[]> = {
    deities,
    heroes,
    creatures,
    artifacts,
    locations,
    stories,
    pantheons,
    journeys,
  };

  /** Every `sourceId` anywhere inside a record, with its JSON path. */
  function collectSourceIds(
    value: unknown,
    path: string,
    out: Array<[string, string]>,
  ): void {
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        collectSourceIds(item, `${path}[${i}]`, out);
      });
    } else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (key === "sourceId" && typeof child === "string") {
          out.push([path, child]);
        } else {
          collectSourceIds(child, `${path}.${key}`, out);
        }
      }
    }
  }

  it.each(Object.keys(catalogs))(
    "every sourceId in %s names a work in sources.json",
    (name) => {
      const found: Array<[string, string]> = [];
      collectSourceIds(catalogs[name], name, found);
      const dangling = found
        .filter(([, id]) => !sourceIds.has(id))
        .map(([path, id]) => `${path}: ${id}`);
      expect(dangling).toEqual([]);
    },
  );

  it("links the commonly cited works rather than leaving them as free text", () => {
    // Plain "Homer, Iliad"-style labels are unambiguous; they must carry an id.
    const plain =
      /^(Homer, (Iliad|Odyssey)|Hesiod, Theogony|Virgil, Aeneid|Ovid, Metamorphoses)(,? (Book )?[\dIVXL.–-]+)?( \(trans\. [^)]*\))?$/;
    const unlinked: string[] = [];
    for (const [name, records] of Object.entries(catalogs)) {
      for (const record of records as Array<{
        id: string;
        primarySources?: Array<{ source: string; sourceId?: string }>;
      }>) {
        for (const citation of record.primarySources ?? []) {
          if (plain.test(citation.source) && !citation.sourceId) {
            unlinked.push(`${name}/${record.id}: ${citation.source}`);
          }
        }
      }
    }
    expect(unlinked).toEqual([]);
  });

  it("gives a locator only alongside a sourceId", () => {
    const orphaned: Array<[string, string]> = [];
    for (const [name, records] of Object.entries(catalogs)) {
      for (const record of records as Array<{
        id: string;
        primarySources?: Array<{ locator?: string; sourceId?: string }>;
      }>) {
        for (const citation of record.primarySources ?? []) {
          if (citation.locator && !citation.sourceId) {
            orphaned.push([name, record.id]);
          }
        }
      }
    }
    expect(orphaned).toEqual([]);
  });
});

describe("journeys", () => {
  it("resolves every heroId in the catalog its heroKind names", () => {
    const unresolved: string[] = [];
    for (const journey of journeys as Array<{
      id: string;
      heroId: string;
      heroKind: string;
      pantheonId: string;
    }>) {
      const catalog =
        journey.heroKind === "hero"
          ? heroById
          : journey.heroKind === "deity"
            ? deityById
            : undefined;
      const protagonist = catalog?.get(journey.heroId);
      if (!protagonist) {
        unresolved.push(`${journey.id}: ${journey.heroKind}/${journey.heroId}`);
        continue;
      }
      expect(protagonist.pantheonId, journey.id).toBe(journey.pantheonId);
    }
    expect(unresolved).toEqual([]);
  });

  it("uses heroKind 'hero' whenever the protagonist has a hero entry", () => {
    for (const journey of journeys) {
      if (heroById.has(journey.heroId)) {
        expect(journey.heroKind, journey.id).toBe("hero");
      }
    }
  });
});
