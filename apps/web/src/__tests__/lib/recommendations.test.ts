import { describe, expect, it } from "vitest";
import {
  generateLearningPath,
  getRequiredLearningPathSteps,
  type Deity,
  type Story,
} from "@/lib/recommendations";

const deity: Deity = {
  id: "zeus",
  name: "Zeus",
  slug: "zeus",
  pantheonId: "greek-pantheon",
  domain: ["sky"],
};

const story: Story = {
  id: "iliad",
  title: "Iliad",
  slug: "iliad",
  pantheonId: "greek-pantheon",
  summary: "An epic of the Trojan War.",
  fullNarrative: "A narrative.",
  keyExcerpts: "An excerpt.",
  category: "epic",
  moralThemes: [],
  culturalSignificance: "A foundational Greek epic.",
};

describe("learning path completion", () => {
  it("does not make optional recall practice block a completed reading route", () => {
    const path = generateLearningPath(
      {
        viewedDeities: ["zeus"],
        readStories: ["iliad"],
        favoriteDomains: ["sky"],
        favoritePantheons: ["greek-pantheon"],
      },
      "pantheon-mastery",
      [deity],
      [story],
      { pantheonId: "greek-pantheon" },
    );

    const requiredSteps = getRequiredLearningPathSteps(path.steps);
    const practiceStep = path.steps.find((step) => step.type === "quiz");

    expect(requiredSteps).toHaveLength(2);
    expect(requiredSteps.every((step) => step.completed)).toBe(true);
    expect(practiceStep).toMatchObject({ completed: false, required: false });
    expect(path.progress).toBe(100);
  });
});
