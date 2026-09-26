import { describe, expect, it } from "vitest";
import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";
import branchingStoriesData from "@/data/branching-stories.json";
import {
  buildBloodline,
  deitiesInRelationships,
  formatPantheonLabel,
  formatSlugAsTitle,
  hasLineage,
  interactiveStoriesFeaturing,
  relationshipsFor,
  resolveParallels,
  selectRelatedDeities,
} from "@/lib/deity-page";
import { createDeityLookup } from "@/lib/deity-reference";

const deities = [
  {
    id: "zeus",
    name: "Zeus",
    slug: "zeus",
    pantheonId: "greek-pantheon",
    alternateNames: ["Dias"],
    imageUrl: "/zeus.jpg",
  },
  {
    id: "hera",
    name: "Hera",
    slug: "hera",
    pantheonId: "greek-pantheon",
    alternateNames: [],
    imageUrl: "/hera.jpg",
  },
  {
    id: "ares",
    name: "Ares",
    slug: "ares",
    pantheonId: "greek-pantheon",
    alternateNames: [],
    imageUrl: "",
  },
  {
    id: "cronus",
    name: "Cronus",
    slug: "cronus",
    pantheonId: "greek-pantheon",
    alternateNames: [],
  },
  {
    id: "odin",
    name: "Odin",
    slug: "odin",
    pantheonId: "norse-pantheon",
    alternateNames: [],
  },
];

const relationships = [
  {
    id: "r1",
    fromDeityId: "zeus",
    toDeityId: "hera",
    relationshipType: "spouse_of",
  },
  {
    id: "r2",
    fromDeityId: "cronus",
    toDeityId: "zeus",
    relationshipType: "parent_of",
  },
  {
    id: "r3",
    fromDeityId: "zeus",
    toDeityId: "ares",
    relationshipType: "parent_of",
  },
  {
    id: "r4",
    fromDeityId: "zeus",
    toDeityId: "typhon",
    relationshipType: "enemy_of",
  },
  {
    id: "r5",
    fromDeityId: "hera",
    toDeityId: "ares",
    relationshipType: "parent_of",
  },
  {
    id: "r6",
    fromDeityId: "zeus",
    toDeityId: "hera",
    relationshipType: "spouse_of",
  },
];

describe("formatting", () => {
  it("titles slugs and pantheon ids", () => {
    expect(formatSlugAsTitle("king-of-olympus")).toBe("King Of Olympus");
    expect(formatPantheonLabel("tlingit-haida-pantheon")).toBe("Tlingit Haida");
  });
});

describe("resolveParallels", () => {
  const lookup = createDeityLookup(deities);

  it("links deities first, then heroes, and keeps dangling references readable", () => {
    const parallels = resolveParallels(
      "zeus",
      [
        { pantheonId: "norse-pantheon", deityId: "odin", note: "Sky father" },
        { pantheonId: "greek-pantheon", deityId: "heracles", note: "Son" },
        {
          pantheonId: "hindu-pantheon",
          deityId: "dyaus-pita",
          note: "Cognate",
        },
      ],
      lookup,
      [{ id: "heracles", name: "Heracles", slug: "heracles" }],
    );
    expect(parallels.map((p) => [p.name, p.href])).toEqual([
      ["Odin", "/deities/odin"],
      ["Heracles", "/heroes/heracles"],
      ["Dyaus Pita", null],
    ]);
    expect(parallels[0].pantheonLabel).toBe("Norse");
  });

  it("does not link a parallel that only matches the deity's own alias", () => {
    const [own] = resolveParallels(
      "zeus",
      [{ pantheonId: "greek-pantheon", deityId: "dias", note: "alias" }],
      lookup,
      [],
    );
    expect(own.href).toBeNull();
  });
});

describe("relationships", () => {
  it("selects only the deity's relationships and the deities they touch", () => {
    const own = relationshipsFor("ares", relationships);
    expect(own.map((r) => r.id)).toEqual(["r3", "r5"]);
    expect(deitiesInRelationships(own, deities).map((d) => d.id)).toEqual([
      "zeus",
      "hera",
      "ares",
    ]);
  });
});

describe("buildBloodline", () => {
  it("groups kin into tiers without duplicates and marks dangling kin", () => {
    const bloodline = buildBloodline("zeus", relationships, deities);
    expect(bloodline.parents.map((k) => k.key)).toEqual(["cronus"]);
    expect(bloodline.children.map((k) => k.key)).toEqual(["ares"]);
    expect(bloodline.consorts.map((k) => k.key)).toEqual(["hera"]);
    expect(bloodline.rivals).toEqual([
      { key: "typhon", name: "Typhon", slug: null, color: "#6b7280" },
    ]);
    expect(hasLineage(bloodline)).toBe(true);
    expect(hasLineage(buildBloodline("odin", relationships, deities))).toBe(
      false,
    );
  });
});

describe("selectRelatedDeities", () => {
  it("fills to four with same-pantheon deities, never the deity itself", () => {
    const cards = selectRelatedDeities(
      "zeus",
      "greek-pantheon",
      [{ deityId: "hera", label: "Spouse" }],
      deities,
    );
    expect(cards.map((c) => [c.id, c.label])).toEqual([
      ["hera", "Spouse"],
      ["ares", "Same Pantheon"],
      ["cronus", "Same Pantheon"],
    ]);
    expect(cards[2].imageUrl).toBeNull();
  });

  it("shows nothing without relationships", () => {
    expect(selectRelatedDeities("odin", "norse-pantheon", [], deities)).toEqual(
      [],
    );
  });
});

describe("interactiveStoriesFeaturing", () => {
  it("matches protagonist, description or node text and drops the story graph", () => {
    const cards = interactiveStoriesFeaturing("zeus", [
      {
        id: "a",
        slug: "a",
        title: "A",
        description: "…",
        protagonist: "Prometheus",
        estimatedTime: "5 min",
        totalEndings: 3,
        nodes: { start: { content: "Zeus frowns." } },
      },
      {
        id: "b",
        slug: "b",
        title: "B",
        description: "No gods here",
        protagonist: "Odysseus",
        estimatedTime: "5 min",
        totalEndings: 2,
        nodes: { start: { content: "The sea." } },
      },
    ]);
    expect(cards).toEqual([
      {
        id: "a",
        slug: "a",
        title: "A",
        description: "…",
        estimatedTime: "5 min",
        totalEndings: 3,
      },
    ]);
  });
});

describe("against the catalog", () => {
  it("produces a bloodline and related cards for Zeus from real data", () => {
    const bloodline = buildBloodline("zeus", relationshipsData, deitiesData);
    expect(hasLineage(bloodline)).toBe(true);
    const related = selectRelatedDeities(
      "zeus",
      "greek-pantheon",
      relationshipsFor("zeus", relationshipsData).map((r) => ({
        deityId: r.fromDeityId === "zeus" ? r.toDeityId : r.fromDeityId,
        label: r.relationshipType,
      })),
      deitiesData,
    );
    expect(related.length).toBeGreaterThan(0);
    expect(
      interactiveStoriesFeaturing(
        "zeus",
        branchingStoriesData as unknown as Parameters<
          typeof interactiveStoriesFeaturing
        >[1],
      ).every((s) => !("nodes" in s)),
    ).toBe(true);
  });
});
