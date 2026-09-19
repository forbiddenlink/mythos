import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalClientAddons } from "@/components/layout/GlobalClientAddons";

vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicPlaceholder({ open }: { open?: boolean }) {
      return open === undefined ? null : (
        <div data-testid="search" data-open={open} />
      );
    },
}));
vi.mock("@/components/analytics/ConsentGatedAnalytics", () => ({
  ConsentGatedAnalytics: () => null,
}));
vi.mock("@/components/analytics/ConsentGatedSentry", () => ({
  ConsentGatedSentry: () => null,
}));

describe("GlobalClientAddons search intent", () => {
  it("opens lazy search from the header event and toggles it from the keyboard", () => {
    render(<GlobalClientAddons />);
    expect(screen.getByTestId("search")).toHaveAttribute("data-open", "false");
    act(() => {
      document.dispatchEvent(new Event("open-command-palette"));
    });
    expect(screen.getByTestId("search")).toHaveAttribute("data-open", "true");
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
      );
    });
    expect(screen.getByTestId("search")).toHaveAttribute("data-open", "false");
  });
});
