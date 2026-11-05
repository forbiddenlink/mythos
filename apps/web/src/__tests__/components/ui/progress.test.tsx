import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Progress } from "@/components/ui/progress";

afterEach(cleanup);

describe("Progress accessibility", () => {
  it("exposes changing progress rather than an indeterminate loading state", () => {
    const { rerender } = render(
      <Progress value={25} aria-label="Reading progress" />,
    );
    const bar = screen.getByRole("progressbar", { name: "Reading progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "25");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    rerender(<Progress value={100} aria-label="Reading progress" />);
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar).toHaveAttribute("data-state", "complete");
  });

  it("retains an indeterminate state when the amount is unknown", () => {
    render(<Progress value={null} aria-label="Loading" />);
    expect(
      screen.getByRole("progressbar", { name: "Loading" }),
    ).not.toHaveAttribute("aria-valuenow");
  });
});
