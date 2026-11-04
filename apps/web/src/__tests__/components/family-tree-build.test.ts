import { describe, it, expect } from "vitest";
import type { RawNodeDatum } from "react-d3-tree";
import { buildTreeData } from "@/components/family-tree/EnhancedFamilyTree";

const d = (id: string) => ({
  id,
  name: id,
  slug: id,
  domain: [],
  gender: null,
});
let n = 0;
const idsOf = (nodes: RawNodeDatum[] | undefined): string[] =>
  (nodes ?? []).map(
    (c) => (c as unknown as { deity: { id: string } }).deity.id,
  );
const rel = (from: string, to: string, type: string) => ({
  id: `r${n++}`,
  fromDeityId: from,
  toDeityId: to,
  relationshipType: type,
  description: null,
});

describe("buildTreeData", () => {
  it("lists a figure once under a node when linked as both child and spouse", () => {
    const deities = ["gaia", "uranus", "kronos"].map(d);
    const relationships = [
      rel("gaia", "uranus", "parent"),
      rel("gaia", "uranus", "spouse"),
      rel("gaia", "kronos", "parent"),
    ];
    const tree = buildTreeData(deities, relationships, "gaia");
    const ids = idsOf(tree?.children);
    expect(ids.filter((id) => id === "uranus")).toHaveLength(1);
    expect(ids).toContain("kronos");
    // The single entry keeps both relationships rather than dropping the marriage.
    const uranus = (
      tree?.children as
        | { deity: { id: string }; relationshipType?: string }[]
        | undefined
    )?.find((c) => c.deity.id === "uranus");
    expect(uranus?.relationshipType).toBe("Child and spouse");
  });

  it("still lists a spouse who is not also a child", () => {
    const deities = ["a", "b"].map(d);
    const tree = buildTreeData(deities, [rel("a", "b", "spouse")], "a");
    expect(idsOf(tree?.children)).toEqual(["b"]);
  });

  it("draws a two-parent figure's branch once and stubs the repeat", () => {
    const deities = ["gaia", "uranus", "tethys", "oceanus"].map(d);
    const relationships = [
      rel("gaia", "uranus", "parent"),
      rel("gaia", "tethys", "parent"),
      rel("uranus", "tethys", "parent"),
      rel("tethys", "oceanus", "parent"),
    ];
    const tree = buildTreeData(deities, relationships, "gaia");
    type Node = RawNodeDatum & { deity: { id: string }; alsoUnder?: string };
    const all: Node[] = [];
    const walk = (n: RawNodeDatum) => {
      all.push(n as Node);
      (n.children ?? []).forEach(walk);
    };
    if (tree) walk(tree);
    const tethys = all.filter((n) => n.deity.id === "tethys");
    expect(tethys).toHaveLength(2);
    expect(tethys.filter((n) => n.alsoUnder)).toHaveLength(1);
    expect(tethys.find((n) => n.alsoUnder)?.children).toBeUndefined();
    expect(all.filter((n) => n.deity.id === "oceanus")).toHaveLength(1);
  });

  it("does not repeat a couple's children under the second partner", () => {
    const deities = ["root", "cronus", "rhea", "zeus", "hera"].map(d);
    const relationships = [
      rel("root", "cronus", "parent"),
      rel("root", "rhea", "parent"),
      rel("cronus", "rhea", "spouse"),
      rel("cronus", "zeus", "parent"),
      rel("cronus", "hera", "parent"),
      rel("rhea", "zeus", "parent"),
      rel("rhea", "hera", "parent"),
    ];
    const tree = buildTreeData(deities, relationships, "root");
    const all: RawNodeDatum[] = [];
    const walk = (n: RawNodeDatum) => {
      all.push(n);
      (n.children ?? []).forEach(walk);
    };
    if (tree) walk(tree);
    const ids = idsOf(all);
    expect(ids.filter((id) => id === "zeus")).toHaveLength(1);
    expect(ids.filter((id) => id === "hera")).toHaveLength(1);
  });
});
