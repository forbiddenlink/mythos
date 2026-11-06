import { describe, expect, it } from "vitest";
import type { Node } from "reactflow";
import { applyHoverHighlight } from "@/components/graph/graph-highlight";
import { countUniqueRelationships } from "@/components/graph/relationship-counts";

describe("applyHoverHighlight", () => {
  const nodes: Node[] = [
    { id: "a", position: { x: 120, y: 340 }, data: { isHighlighted: false } },
    { id: "b", position: { x: 5, y: 6 }, data: { isHighlighted: true } },
  ];

  it("keeps dragged positions while moving the highlight", () => {
    const out = applyHoverHighlight(nodes, "a", null);
    expect(out[0].position).toEqual({ x: 120, y: 340 });
    expect(out[0].data.isHighlighted).toBe(true);
    expect(out[1].data.isHighlighted).toBe(false);
  });

  it("keeps the explore focus highlighted when hover leaves", () => {
    const out = applyHoverHighlight(nodes, null, "b");
    expect(out[1].data.isHighlighted).toBe(true);
    expect(out[0].data.isHighlighted).toBe(false);
  });

  it("returns the same node object when nothing changes", () => {
    const out = applyHoverHighlight(nodes, null, "b");
    expect(out[1]).toBe(nodes[1]);
  });
});

describe("countUniqueRelationships", () => {
  const ids = new Set(["a", "b", "c"]);

  it("counts reversed and repeated pairs once, like the graph edges", () => {
    const rels = [
      { fromDeityId: "a", toDeityId: "b" },
      { fromDeityId: "b", toDeityId: "a" },
      { fromDeityId: "a", toDeityId: "b" },
      { fromDeityId: "b", toDeityId: "c" },
    ];
    expect(countUniqueRelationships(rels, ids)).toBe(2);
  });

  it("ignores pairs outside the selected deities", () => {
    expect(
      countUniqueRelationships([{ fromDeityId: "a", toDeityId: "z" }], ids),
    ).toBe(0);
  });
});
