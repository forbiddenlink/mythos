import { describe, expect, it } from "vitest";
import { focusFitNodes } from "@/components/family-tree/FamilyTreeVisualization";

const nodes = [{ id: "zeus" }, { id: "hera" }, { id: "ares" }, { id: "gaia" }];
const edges = [
  { source: "zeus", target: "hera" },
  { source: "ares", target: "zeus" },
  { source: "gaia", target: "hera" },
];

describe("family tree initial fit", () => {
  it("fits the focus deity and its direct relatives only", () => {
    const ids = focusFitNodes("zeus", nodes, edges)?.map((n) => n.id);
    expect(ids?.sort()).toEqual(["ares", "hera", "zeus"]);
  });

  it("fits the whole graph when there is no focus deity", () => {
    expect(focusFitNodes(undefined, nodes, edges)).toBeUndefined();
  });

  it("fits the whole graph when the focus deity is not in it", () => {
    expect(focusFitNodes("odin", nodes, edges)).toBeUndefined();
  });
});
