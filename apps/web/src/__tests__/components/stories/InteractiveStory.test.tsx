import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// AnimatePresence mode="wait" keeps the exiting scene mounted until its exit
// animation finishes, which never happens in jsdom. Render motion elements as
// plain elements so the test sees the scene the state machine chose.
vi.mock("framer-motion", () => {
  const MOTION_PROPS = new Set([
    "initial",
    "animate",
    "exit",
    "transition",
    "variants",
    "whileHover",
    "whileTap",
    "whileInView",
    "layout",
    "layoutId",
  ]);
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        function MotionElement(props: Record<string, unknown>) {
          const rest = Object.fromEntries(
            Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key)),
          );
          return createElement(tag, rest);
        },
    },
  );
  return {
    motion,
    AnimatePresence: ({ children }: { children?: ReactNode }) => children,
  };
});
import { InteractiveStory } from "@/components/stories/InteractiveStory";
import type { BranchingStory } from "@/lib/branching-story";

const story: BranchingStory = {
  id: "test-story",
  slug: "test-story",
  title: "Test",
  description: "d",
  pantheonId: "greek-pantheon",
  protagonist: "p",
  totalEndings: 1,
  estimatedTime: "1 min",
  startNodeId: "start",
  nodes: {
    start: {
      id: "start",
      content: "Begin",
      choices: [{ text: "Go", nextNodeId: "end" }],
    },
    end: {
      id: "end",
      content: "The end",
      ending: { type: "good", summary: "A fine ending" },
    },
  },
};

describe("InteractiveStory ending screen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the ending screen on reload when the ending is already known", () => {
    localStorage.setItem(
      "mythos-story-progress",
      JSON.stringify({
        "test-story": {
          storyId: "test-story",
          currentNodeId: "end",
          pathTaken: ["start", "end"],
          endingsDiscovered: ["end"],
          lastPlayed: new Date().toISOString(),
        },
      }),
    );
    localStorage.setItem(
      "mythos-story-endings",
      JSON.stringify({ "test-story": ["end"] }),
    );

    render(<InteractiveStory story={story} />);
    // The ending screen prints the full summary; the endings badge truncates it.
    expect(screen.getByText("A fine ending")).toBeTruthy();
    expect(screen.queryByText("Begin")).toBeNull();
  });
});
