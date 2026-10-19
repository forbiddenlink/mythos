import { describe, expect, it } from "vitest";
import {
  connectionStepLabel,
  shortestRelationshipPath,
  type ConnectionRelationship,
} from "@/lib/relationship-path";

const figures = ["a", "b", "c", "d"].map((id) => ({ id, name: id, slug: id }));
const edge = (
  id: string,
  fromDeityId: string,
  toDeityId: string,
  relationshipType = "parent_of",
): ConnectionRelationship => ({ id, fromDeityId, toDeityId, relationshipType });
const passage = {
  sourceId: "theogony",
  locator: "Lines 453–458",
  sourceUrl: "https://example.org/theogony#453",
  edition: "Example translation",
};

describe("shortest recorded relationship path", () => {
  it("finds the fewest edges without revisiting cycles", () => {
    const edges = [
      edge("ab", "a", "b"),
      edge("bc", "b", "c"),
      edge("ca", "c", "a"),
    ];
    const result = shortestRelationshipPath(figures, edges, "a", "c");
    expect(result.status).toBe("found");
    expect(result.steps.map((step) => step.relationship.id)).toEqual(["ca"]);
    expect(shortestRelationshipPath(figures, edges, "a", "d").status).toBe(
      "disconnected",
    );
  });

  it("reads parent and aspect edges correctly in both directions", () => {
    const parent = edge("ab", "a", "b");
    expect(
      connectionStepLabel(
        shortestRelationshipPath(figures, [parent], "a", "b").steps[0],
      ),
    ).toBe("is parent of");
    expect(
      connectionStepLabel(
        shortestRelationshipPath(figures, [parent], "b", "a").steps[0],
      ),
    ).toBe("is child of");
    const aspect = edge("ab", "a", "b", "aspect_of");
    expect(
      connectionStepLabel(
        shortestRelationshipPath(figures, [aspect], "b", "a").steps[0],
      ),
    ).toBe("has a recorded aspect in");
    expect(
      connectionStepLabel(
        shortestRelationshipPath(
          figures,
          [edge("ab", "a", "b", "ally_of")],
          "a",
          "b",
        ).steps[0],
      ),
    ).toBe("is ally of");
  });

  it("prefers attached evidence on duplicate pairs and has stable tie breaking", () => {
    const cited = { ...edge("z-cited", "a", "b"), evidence: [passage] };
    const edges = [
      edge("uncited", "a", "b"),
      cited,
      edge("bc", "b", "c"),
      edge("ad", "a", "d"),
      edge("dc", "d", "c"),
    ];
    const forward = shortestRelationshipPath(figures, edges, "a", "c");
    const reordered = shortestRelationshipPath(
      figures,
      [...edges].reverse(),
      "a",
      "c",
    );
    expect(forward).toEqual(reordered);
    expect(forward.steps[0].relationship.id).toBe("z-cited");
    expect(forward.steps[0].relationship.evidence).toEqual([passage]);
    expect(
      shortestRelationshipPath(figures, edges, "b", "a").steps[0].relationship
        .id,
    ).toBe("z-cited");
  });

  it("handles missing nodes, disconnected figures, and equal endpoints", () => {
    const edges = [
      edge("ghost", "a", "missing"),
      edge("ghost2", "missing", "b"),
    ];
    expect(shortestRelationshipPath(figures, edges, "a", "b")).toEqual({
      status: "disconnected",
      steps: [],
    });
    expect(
      shortestRelationshipPath(figures, edges, "missing", "missing").status,
    ).toBe("unknown-figure");
    expect(
      shortestRelationshipPath(figures, edges, "a", "missing").status,
    ).toBe("unknown-figure");
    expect(shortestRelationshipPath(figures, edges, "a", "a")).toEqual({
      status: "found",
      steps: [],
    });
    expect(shortestRelationshipPath([], edges, "a", "b").status).toBe(
      "unknown-figure",
    );
  });

  it("keeps uncited edges usable without manufacturing evidence", () => {
    const result = shortestRelationshipPath(
      figures,
      [edge("ab", "a", "b", "enemy_of")],
      "a",
      "b",
    );
    expect(result.status).toBe("found");
    expect(result.steps[0].relationship.evidence).toBeUndefined();
    expect(connectionStepLabel(result.steps[0])).toBe("is enemy of");
  });
});
