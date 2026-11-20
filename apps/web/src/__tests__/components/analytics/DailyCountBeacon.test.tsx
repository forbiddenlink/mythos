import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ pathname: "/gods-of/war" }));
const sendCount = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));
vi.mock("@/lib/analytics/daily-count-client", () => ({ sendCount }));

import { DailyCountBeacon } from "@/components/analytics/DailyCountBeacon";

function setReferrer(value: string) {
  Object.defineProperty(document, "referrer", { value, configurable: true });
}

function setNavigationType(type: string) {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    { type } as unknown as PerformanceEntry,
  ]);
}

beforeEach(() => {
  nav.pathname = "/gods-of/war";
  sendCount.mockClear();
  setReferrer("https://www.google.com/");
  setNavigationType("navigate");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DailyCountBeacon", () => {
  it("counts the arrival once, by page type and kind of referrer", () => {
    const { rerender } = render(<DailyCountBeacon />);
    rerender(<DailyCountBeacon />);
    expect(sendCount).toHaveBeenCalledTimes(1);
    expect(sendCount).toHaveBeenCalledWith({
      step: "arrive",
      page: "gods-of",
      source: "search",
    });
  });

  it("counts the first move to another page as onward, described by the arrival", () => {
    const { rerender } = render(<DailyCountBeacon />);
    nav.pathname = "/deities/ares";
    rerender(<DailyCountBeacon />);
    expect(sendCount).toHaveBeenCalledTimes(2);
    expect(sendCount).toHaveBeenLastCalledWith({
      step: "onward",
      page: "gods-of",
      source: "search",
    });

    // Later pages add nothing: one arrival gives at most one onward count.
    nav.pathname = "/stories/trojan-war";
    rerender(<DailyCountBeacon />);
    nav.pathname = "/gods-of/war";
    rerender(<DailyCountBeacon />);
    expect(sendCount).toHaveBeenCalledTimes(2);
  });

  it.each(["reload", "back_forward"])(
    "counts nothing for a %s load or what follows it",
    (type) => {
      setNavigationType(type);
      const { rerender } = render(<DailyCountBeacon />);
      nav.pathname = "/deities/ares";
      rerender(<DailyCountBeacon />);
      expect(sendCount).not.toHaveBeenCalled();
    },
  );

  it("still counts when the browser has no navigation timing", () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation(() => {
      throw new Error("unsupported");
    });
    render(<DailyCountBeacon />);
    expect(sendCount).toHaveBeenCalledTimes(1);
  });

  it("renders nothing", () => {
    const { container } = render(<DailyCountBeacon />);
    expect(container).toBeEmptyDOMElement();
  });
});
