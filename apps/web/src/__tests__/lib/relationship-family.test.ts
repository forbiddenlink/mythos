import { describe, expect, it } from "vitest";
import relationships from "@/data/relationships.json";
import { relationshipFamily } from "@/lib/relationship-family";

describe("relationshipFamily", () => {
  it("groups lovers with spouses, as the relationship quiz does", () => {
    expect(relationshipFamily("spouse_of")).toBe("partner");
    expect(relationshipFamily("lover_of")).toBe("partner");
  });

  it("keeps alliances out of the partner family", () => {
    expect(relationshipFamily("ally_of")).toBe("other");
    expect(relationshipFamily("enemy_of")).toBe("other");
    expect(relationshipFamily("aspect_of")).toBe("other");
  });

  it("treats derived child_of edges as lineage", () => {
    expect(relationshipFamily("parent_of")).toBe("lineage");
    expect(relationshipFamily("child_of")).toBe("lineage");
    expect(relationshipFamily("sibling_of")).toBe("sibling");
  });

  it("classifies every stored relationship type deliberately", () => {
    const known = new Set([
      "parent_of",
      "sibling_of",
      "spouse_of",
      "lover_of",
      "ally_of",
      "enemy_of",
      "aspect_of",
    ]);
    for (const rel of relationships) {
      expect(known.has(rel.relationshipType)).toBe(true);
    }
  });
});
