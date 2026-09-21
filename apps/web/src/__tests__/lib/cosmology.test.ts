import { describe, expect, it } from "vitest";
import cosmologies from "@/data/cosmologies.json";
import deities from "@/data/deities.json";
import creatures from "@/data/creatures.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import {
  getAllCosmologies,
  resolveCosmology,
  type RawCosmology,
} from "@/lib/cosmology";

const raw = cosmologies as RawCosmology[];

describe("cosmologies data", () => {
  it("covers every pantheon exactly once", () => {
    const ids = raw.map((c) => c.pantheonId).sort();
    expect(ids).toEqual(pantheons.map((p) => p.id).sort());
  });

  it("only references deities, creatures, and locations that exist", () => {
    const deitySlugs = new Set(deities.map((d) => d.slug));
    const creatureSlugs = new Set(creatures.map((c) => c.slug));
    const locationIds = new Set(locations.map((l) => l.id));
    const broken: string[] = [];
    for (const c of raw) {
      for (const tier of c.tiers) {
        for (const realm of tier.realms) {
          for (const s of realm.deities ?? [])
            if (!deitySlugs.has(s)) broken.push(`${c.pantheonId}: deity ${s}`);
          for (const s of realm.creatures ?? [])
            if (!creatureSlugs.has(s))
              broken.push(`${c.pantheonId}: creature ${s}`);
          if (realm.locationId && !locationIds.has(realm.locationId))
            broken.push(`${c.pantheonId}: location ${realm.locationId}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it("cites at least one primary source and notes variant traditions", () => {
    for (const c of raw) {
      expect(c.sources.length, c.pantheonId).toBeGreaterThan(0);
      expect(c.variantNote.length, c.pantheonId).toBeGreaterThan(20);
    }
  });
});

describe("resolveCosmology", () => {
  it("resolves figures to links with names and images", () => {
    const norse = resolveCosmology("norse-pantheon");
    expect(norse?.axis?.name).toBe("Yggdrasil");
    const asgard = norse?.tiers[0].realms.find((r) => r.name === "Asgard");
    expect(asgard?.figures).toContainEqual(
      expect.objectContaining({ name: "Odin", href: "/deities/odin" }),
    );
    expect(asgard?.figures.some((f) => f.href === "/creatures/sleipnir")).toBe(
      true,
    );
    expect(asgard?.place).toEqual({
      name: "Asgard",
      href: "/locations/asgard",
    });
  });

  it("drops unknown references instead of rendering broken links", () => {
    const fixture: RawCosmology[] = [
      {
        pantheonId: "test",
        title: "t",
        summary: "s",
        axis: null,
        variantNote: "v",
        sources: ["x"],
        tiers: [
          {
            id: "a",
            label: "A",
            band: "sky",
            realms: [
              {
                name: "R",
                description: "d",
                deities: ["zeus", "no-such-god"],
                locationId: "nowhere",
              },
            ],
          },
        ],
      },
    ];
    const realm = resolveCosmology("test", fixture)?.tiers[0].realms[0];
    expect(realm?.figures.map((f) => f.href)).toEqual(["/deities/zeus"]);
    expect(realm?.place).toBeNull();
  });

  it("returns null for a pantheon with no cosmology", () => {
    expect(resolveCosmology("missing-pantheon")).toBeNull();
  });

  it("orders tiers from highest to lowest", () => {
    const order = ["beyond", "sky", "earth", "water", "under", "abyss"];
    for (const c of getAllCosmologies()) {
      const bands = c.tiers.map((t) => order.indexOf(t.band));
      // "beyond" can mark a pillar or crossing mid-stack (Kunlun, Eshu), so only
      // require that nothing below the earth sits above it.
      const firstBelow = bands.findIndex((b) => b >= order.indexOf("water"));
      if (firstBelow >= 0) {
        expect(
          bands.slice(firstBelow).every((b) => b >= order.indexOf("water")),
          c.pantheonId,
        ).toBe(true);
      }
    }
  });
});
