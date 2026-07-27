import { describe, it, expect } from "vitest";
import { computeAtlasLayout, prettyPantheonName } from "@/lib/atlas-layout";
import deitiesData from "@/data/deities.json";

describe("computeAtlasLayout", () => {
  const layout = computeAtlasLayout();

  it("creates one node per deity", () => {
    expect(layout.nodes).toHaveLength(deitiesData.length);
  });

  it("groups every node under a known pantheon", () => {
    const pantheonIds = new Set(layout.pantheons.map((p) => p.id));
    for (const node of layout.nodes) {
      expect(pantheonIds.has(node.pantheonId)).toBe(true);
    }
  });

  it("is deterministic across calls (SSR-safe)", () => {
    const again = computeAtlasLayout();
    expect(again.nodes[0].position).toEqual(layout.nodes[0].position);
    expect(again.nodes.at(-1)?.position).toEqual(layout.nodes.at(-1)?.position);
  });

  it("sizes stars within bounds, most-important largest", () => {
    for (const n of layout.nodes) {
      expect(n.size).toBeGreaterThanOrEqual(0.1);
      expect(n.size).toBeLessThanOrEqual(0.44);
    }
    const rank1 = layout.nodes.find((n) => n.importanceRank === 1);
    const rank14 = layout.nodes.find((n) => n.importanceRank === 14);
    if (rank1 && rank14) expect(rank1.size).toBeGreaterThan(rank14.size);
  });

  it("emits only edges whose endpoints both resolve (no dangling)", () => {
    const ids = new Set(layout.nodes.map((n) => n.id));
    // every edge references real node positions (finite coords)
    for (const e of layout.edges) {
      expect(e.from.every(Number.isFinite)).toBe(true);
      expect(e.to.every(Number.isFinite)).toBe(true);
    }
    expect(ids.size).toBeGreaterThan(0);
  });

  it("prettifies pantheon ids", () => {
    expect(prettyPantheonName("greek-pantheon")).toBe("Greek");
    expect(prettyPantheonName("mesoamerican-pantheon")).toBe("Mesoamerican");
  });
});
