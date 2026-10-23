import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import {
  childrenOf,
  MOTHERS_OUTSIDE_ATLAS,
  OLYMPIAN_IDS,
  parentsOf,
  TWELFTH_SEAT_IDS,
} from "@/lib/greek-family";
import {
  getChartRows,
  getNameOnlyRows,
  getRomanWithoutGreek,
  listsRomanName,
  ROMAN_DIFFERENCE,
} from "@/lib/greek-roman-chart";

const ids = new Set((deities as Array<{ id: string }>).map((d) => d.id));

describe("Greek family tree guide data", () => {
  it("names only deities that exist in the catalog", () => {
    for (const id of [...OLYMPIAN_IDS, ...TWELFTH_SEAT_IDS]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it("reads Zeus's parents from the kinship records", () => {
    const parents = parentsOf("zeus").map((p) => p.id);
    expect(parents).toEqual(expect.arrayContaining(["cronus", "rhea"]));
    expect(parentsOf("zeus").every((p) => p.locator !== null)).toBe(true);
  });

  it("keeps Hephaestus's Zeus link, marked disputed, after Hera", () => {
    const parents = parentsOf("hephaestus");
    expect(parents[0]).toMatchObject({ id: "hera", disputed: false });
    expect(parents.find((p) => p.id === "zeus")?.disputed).toBe(true);
  });

  it("leaves Aphrodite without a recorded parent rather than picking one", () => {
    expect(parentsOf("aphrodite")).toEqual([]);
  });

  it("gives every Olympian a recorded father or a named outside mother", () => {
    for (const id of [...OLYMPIAN_IDS, ...TWELFTH_SEAT_IDS]) {
      if (id === "aphrodite") continue;
      const recorded = parentsOf(id).length > 0 || id in MOTHERS_OUTSIDE_ATLAS;
      expect(recorded, id).toBe(true);
    }
  });

  it("finds Zeus's children from the same records", () => {
    expect(childrenOf("zeus").map((c) => c.id)).toEqual(
      expect.arrayContaining(["athena", "apollo", "artemis", "hermes"]),
    );
  });
});

describe("Greek and Roman gods chart data", () => {
  const rows = getChartRows();

  it("pairs every Roman deity that has a Greek parallel", () => {
    expect(rows.length).toBe(13);
    expect(rows.map((r) => r.roman.id)).toEqual(
      expect.arrayContaining(["jupiter", "mars", "venus", "vesta"]),
    );
  });

  it("links every row to a comparison page that exists", () => {
    for (const row of rows) {
      expect(row.pairSlug, `${row.greek.id}/${row.roman.id}`).not.toBeNull();
    }
  });

  it("writes a difference for every pair", () => {
    for (const row of rows) {
      expect(ROMAN_DIFFERENCE[row.roman.id], row.roman.id).toBeTruthy();
      expect(row.difference).toBe(ROMAN_DIFFERENCE[row.roman.id]);
    }
  });

  it("starts with Zeus and Jupiter, in the Greek roster order", () => {
    expect(rows[0]?.greek.id).toBe("zeus");
    expect(rows[0]?.roman.id).toBe("jupiter");
  });

  it("finds Janus as the Roman god without a Greek counterpart", () => {
    expect(getRomanWithoutGreek().map((d) => d.id)).toEqual(["janus"]);
  });

  it("lists each name-only Roman name on the Greek entry", () => {
    for (const { greek, roman } of getNameOnlyRows()) {
      expect(listsRomanName(greek.id, roman), `${greek.id}: ${roman}`).toBe(
        true,
      );
    }
  });
});
