import { describe, expect, it } from "vitest";
import branchingStories from "@/data/branching-stories.json";

type Node = {
  ending?: { type: string; summary: string };
};

type Story = {
  slug: string;
  totalEndings: number;
  startNodeId: string;
  nodes: Record<string, Node>;
  coverImage?: string;
};

const stories = branchingStories as unknown as Story[];

describe("branching-stories.json", () => {
  it("includes five interactive myths", () => {
    expect(stories.map((s) => s.slug).sort()).toEqual(
      [
        "amaterasu-cave",
        "inanna-descent",
        "judgment-of-paris",
        "orpheus-underworld",
        "thor-jotunheim",
      ].sort(),
    );
  });

  it("keeps new stories' ending counts in sync with ending nodes", () => {
    const added = new Set(["amaterasu-cave", "inanna-descent"]);
    for (const story of stories.filter((s) => added.has(s.slug))) {
      const endings = Object.values(story.nodes).filter((node) => node.ending);
      expect(endings.length).toBe(story.totalEndings);
      expect(story.nodes[story.startNodeId]).toBeDefined();
    }
  });

  it("gives every story a start node", () => {
    for (const story of stories) {
      expect(story.nodes[story.startNodeId]).toBeDefined();
    }
  });
});
