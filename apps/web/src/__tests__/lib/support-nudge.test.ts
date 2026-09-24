import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MIN_VALUE_MOMENTS,
  countValueMoments,
  dismissSupportNudge,
  markSupportNudgeShown,
  recordValueMoment,
  shouldShowSupportNudge,
} from "@/lib/support-nudge";

const DAY = 86_400_000;

describe("support nudge gating", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("stays hidden for a first-time visitor", () => {
    expect(shouldShowSupportNudge()).toBe(false);
  });

  it("counts value moments", () => {
    recordValueMoment("quiz_completed");
    recordValueMoment("export_generated");
    expect(countValueMoments()).toBe(2);
  });

  it("stays hidden until enough value has been delivered", () => {
    for (let i = 0; i < MIN_VALUE_MOMENTS - 1; i += 1) {
      recordValueMoment("quiz_completed");
    }
    expect(shouldShowSupportNudge()).toBe(false);

    recordValueMoment("quiz_completed");
    expect(shouldShowSupportNudge()).toBe(true);
  });

  it("stays quiet for 14 days after being shown", () => {
    for (let i = 0; i < MIN_VALUE_MOMENTS; i += 1)
      recordValueMoment("quiz_completed");
    markSupportNudgeShown();
    expect(shouldShowSupportNudge()).toBe(false);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 15 * DAY);
    expect(shouldShowSupportNudge()).toBe(true);
  });

  it("stays dismissed for a year once the visitor says no", () => {
    for (let i = 0; i < MIN_VALUE_MOMENTS; i += 1)
      recordValueMoment("quiz_completed");
    dismissSupportNudge();

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 200 * DAY);
    expect(shouldShowSupportNudge()).toBe(false);
  });

  it("survives storage being unavailable", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    expect(() => recordValueMoment("quiz_completed")).not.toThrow();
    expect(shouldShowSupportNudge()).toBe(false);

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
