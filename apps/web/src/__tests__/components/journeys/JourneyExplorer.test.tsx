import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import journeysData from "@/data/journeys.json";
import type { JourneyDetail, JourneyWaypoint } from "@/lib/journeys";
import { getJourneyStopContexts } from "@/lib/journey-references";
import { JourneyExplorer } from "@/app/journeys/[slug]/JourneyExplorer";

vi.mock("@/lib/analytics/events", () => ({ trackEvent: vi.fn() }));
vi.mock("next/dynamic", () => ({
  default: () =>
    function MapStops({
      journey,
      onWaypointSelect,
    }: {
      journey: JourneyDetail;
      onWaypointSelect: (stop: JourneyWaypoint) => void;
    }) {
      return (
        <div>
          {journey.waypoints.map((stop) => (
            <button key={stop.id} onClick={() => onWaypointSelect(stop)}>
              Select {stop.name}
            </button>
          ))}
        </div>
      );
    },
}));

const journeys = journeysData as JourneyDetail[];

describe("JourneyExplorer", () => {
  it("updates the selected stop and its catalog reading links from keyboard selection", async () => {
    const journey = journeys.find((item) => item.slug === "odyssey")!;
    render(
      <JourneyExplorer
        journey={journey}
        color="#D4AF37"
        stopContexts={getJourneyStopContexts(journey)}
      />,
    );
    expect(
      screen.getByRole("link", { name: "The Trojan War" }),
    ).toHaveAttribute("href", "/stories/trojan-war");
    const button = screen.getByRole("button", {
      name: "Select Island of the Cyclopes",
    });
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { name: "Island of the Cyclopes" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Poseidon" })).toHaveAttribute(
      "href",
      "/deities/poseidon",
    );
    expect(screen.getByRole("link", { name: "Cyclops" })).toHaveAttribute(
      "href",
      "/creatures/cyclops",
    );
    expect(
      screen.getByRole("link", { name: "Read about Island of the Cyclopes" }),
    ).toHaveAttribute("href", "/locations/cyclops-cave");
    expect(
      screen.getByRole("link", { name: /Read Odyssey · Book 9/ }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      screen.queryByRole("link", { name: "The Trojan War" }),
    ).not.toBeInTheDocument();
  });

  it("keeps otherworld routes available without geographic tiles", async () => {
    const journey = journeys.find(
      (item) => item.slug === "duat-night-journey",
    )!;
    render(
      <JourneyExplorer
        journey={journey}
        color="#D4AF37"
        stopContexts={getJourneyStopContexts(journey)}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /Select / }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: journey.waypoints[0].name }),
    ).toBeInTheDocument();
  });
});
