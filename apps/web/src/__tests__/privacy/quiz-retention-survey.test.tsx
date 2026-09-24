import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuizRetentionSurvey } from "@/components/quiz/QuizRetentionSurvey";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("quiz feedback consent", () => {
  it.each([
    [null, false, false],
    ["rejected", false, false],
    ["accepted", true, false],
    ["accepted", false, true],
  ])("consent=%s, GPC=%s sends=%s", (consent, gpc, sends) => {
    vi.useFakeTimers();
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) =>
        key === "mythos-cookie-consent" ? consent : null,
      setItem,
    });
    const sendBeacon = vi.fn();
    vi.stubGlobal("navigator", { globalPrivacyControl: gpc, sendBeacon });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<QuizRetentionSurvey score={8} total={10} />);
    fireEvent.click(screen.getByRole("button", { name: "Very disappointed" }));
    expect(setItem).toHaveBeenCalled();
    expect(sendBeacon).toHaveBeenCalledTimes(sends ? 1 : 0);
    expect(fetch).not.toHaveBeenCalled();
  });
});
