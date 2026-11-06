import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TimelineControls } from "@/components/timeline/TimelineControls";
import { TimelineVisualizationD3 } from "@/components/timeline/TimelineVisualizationD3";

const pantheons = ["greek", "norse"].map((id) => ({
  id,
  name: id,
  slug: id,
  culture: id,
  region: id,
  timePeriodStart: -800,
  timePeriodEnd: 400,
  description: null,
}));

beforeAll(() => {
  // jsdom has no SVG text layout; the chart truncates labels with it.
  (
    SVGElement.prototype as unknown as { getComputedTextLength: () => number }
  ).getComputedTextLength = () => 0;
});

describe("timeline era buttons", () => {
  it("hands over a fresh range array on every click so a repeat click re-applies it", () => {
    const onRangeChange = vi.fn();
    render(
      <TimelineControls
        currentRange={[-3500, 2025]}
        minYear={-3500}
        maxYear={2025}
        onRangeChange={onRangeChange}
      />,
    );
    const bronze = screen.getByRole("button", { name: "Bronze Age" });
    fireEvent.click(bronze);
    fireEvent.click(bronze);
    const [first] = onRangeChange.mock.calls[0];
    const [second] = onRangeChange.mock.calls[1];
    expect(first).toEqual([-3300, -1200]);
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });
});

describe("timeline chart selection", () => {
  it("restyles on row select without rebuilding the chart (zoom is kept)", () => {
    const { container } = render(
      <TimelineVisualizationD3
        pantheons={pantheons}
        events={[]}
        viewRange={[-3500, 2025]}
      />,
    );
    const defsBefore = container.querySelector("svg defs");
    expect(defsBefore).not.toBeNull();

    const group = container.querySelector(".pantheon-group");
    expect(group).not.toBeNull();
    fireEvent.click(group as Element);

    // The init effect clears and re-appends <defs> when it reruns.
    expect(container.querySelector("svg defs")).toBe(defsBefore);
    const opacities = [...container.querySelectorAll(".pantheon-group rect")]
      .map((r) => r.getAttribute("opacity"))
      .sort();
    expect(opacities).toEqual(["0.3", "1"]);
  });
});
