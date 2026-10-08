import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JourneyExplorer } from "@/app/journeys/[slug]/JourneyExplorer";
import { LearningPathCard } from "@/components/learning/LearningPathCard";
import { resetAnalyticsSink, setAnalyticsSink } from "@/lib/analytics/events";
import type { JourneyWaypoint } from "@/lib/journeys";
import type { LearningPath } from "@/lib/recommendations";

vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/components/maps/OtherworldRoute", () => ({
  OtherworldRoute: ({
    waypoints,
    onWaypointSelect,
  }: {
    waypoints: JourneyWaypoint[];
    onWaypointSelect: (stop: JourneyWaypoint) => void;
  }) => (
    <div>
      {waypoints.map((stop) => (
        <button key={stop.id} onClick={() => onWaypointSelect(stop)}>
          Choose {stop.name}
        </button>
      ))}
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  resetAnalyticsSink();
});

describe("learning clicks", () => {
  it("measures only explicit journey selection, without treating the final stop as completion", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);
    render(
      <JourneyExplorer
        color="#000"
        journey={{
          id: "duat",
          slug: "duat-night",
          title: "Duat",
          heroId: "ra",
          heroKind: "deity",
          heroName: "Ra",
          description: "Night route",
          pantheonId: "egyptian-pantheon",
          source: "Book of Gates",
          duration: "12 hours",
          setting: "otherworld",
          waypoints: [
            { id: "first", name: "First", order: 1, description: "First stop" },
            { id: "last", name: "Last", order: 2, description: "Final stop" },
          ],
        }}
      />,
    );
    expect(sink).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Choose Last" }));
    expect(sink).toHaveBeenCalledExactlyOnceWith("journey_stop_selected", {
      journeySlug: "duat-night",
      stopIndex: 2,
      stopCount: 2,
    });
    expect(screen.getByText("Final stop")).toBeInTheDocument();
  });

  it("distinguishes path start, a chosen reading step, and optional practice", () => {
    const path: LearningPath = {
      id: "pantheon-mastery-norse",
      name: "Norse",
      description: "Norse reading",
      estimatedTime: "1 hour",
      goal: "pantheon-mastery",
      progress: 0,
      steps: [
        {
          type: "deity",
          itemId: "odin-id",
          slug: "odin",
          title: "Odin",
          completed: false,
        },
        {
          type: "quiz",
          itemId: "norse-quiz",
          title: "Norse quiz",
          completed: false,
          required: false,
        },
      ],
    };
    const sink = vi.fn();
    setAnalyticsSink(sink);
    render(<LearningPathCard path={path} />);
    expect(sink).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Start Norse" }));
    fireEvent.click(screen.getByRole("link", { name: "Odin" }));
    fireEvent.click(
      screen.getByRole("link", {
        name: "Optional recall practice: Norse quiz",
      }),
    );
    expect(sink.mock.calls).toEqual([
      [
        "learning_path_step_selected",
        {
          goal: "pantheon-mastery",
          entityType: "deity",
          slug: "odin",
          action: "start",
        },
      ],
      [
        "learning_path_step_selected",
        {
          goal: "pantheon-mastery",
          entityType: "deity",
          slug: "odin",
          action: "step",
        },
      ],
      [
        "learning_path_step_selected",
        {
          goal: "pantheon-mastery",
          entityType: "quiz",
          slug: "quiz",
          action: "practice",
        },
      ],
    ]);
  });
});
