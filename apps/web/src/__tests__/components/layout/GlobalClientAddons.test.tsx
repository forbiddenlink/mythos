import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalClientAddons } from "@/components/layout/GlobalClientAddons";

vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicPlaceholder() {
      return <div data-testid="dynamic-placeholder" />;
    },
}));

vi.mock("@/components/effects/LayoutEffects", () => ({
  LayoutEffects: () => null,
}));
vi.mock("@/components/analytics/ConsentGatedAnalytics", () => ({
  ConsentGatedAnalytics: () => null,
}));
vi.mock("@/components/analytics/ConsentGatedSentry", () => ({
  ConsentGatedSentry: () => null,
}));

describe("GlobalClientAddons audio loading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "loading",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as { requestIdleCallback?: unknown }).requestIdleCallback;
  });

  it("waits for load and idle before rendering audio enhancements", () => {
    let runIdle: (() => void) | undefined;
    Object.assign(window, {
      requestIdleCallback: vi.fn((callback: () => void) => {
        runIdle = callback;
        return 1;
      }),
      cancelIdleCallback: vi.fn(),
    });

    render(<GlobalClientAddons />);
    expect(screen.getAllByTestId("dynamic-placeholder")).toHaveLength(5);

    act(() => {
      window.dispatchEvent(new Event("load"));
      runIdle?.();
    });

    expect(screen.getAllByTestId("dynamic-placeholder")).toHaveLength(6);
  });

  it("uses a short timeout fallback and cleans up a pending load listener", () => {
    const { unmount } = render(<GlobalClientAddons />);
    expect(screen.getAllByTestId("dynamic-placeholder")).toHaveLength(5);

    unmount();
    act(() => {
      window.dispatchEvent(new Event("load"));
      vi.runAllTimers();
    });

    expect(screen.queryByTestId("dynamic-placeholder")).not.toBeInTheDocument();
  });
});
