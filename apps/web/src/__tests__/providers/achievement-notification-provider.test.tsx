import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { achievements } from "@/data/achievements";
import type { AchievementWithStatus } from "@/hooks/useAchievements";
import {
  AchievementNotificationProvider,
  AchievementNotificationToggle,
} from "@/providers/achievement-notification-provider";

let mockedAchievements: AchievementWithStatus[] = [];
let localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  clear: vi.fn(() => {
    localStorageData = {};
  }),
};

vi.mock("@/hooks/useAchievements", () => ({
  useAchievements: () => ({
    achievements: mockedAchievements,
    unlockedCount: mockedAchievements.filter(
      (achievement) => achievement.unlocked,
    ).length,
  }),
}));

vi.mock("@/components/ui/achievement-toast", () => ({
  AchievementToast: ({ achievement }: { achievement: { name: string } }) => (
    <div role="alert">{achievement.name}</div>
  ),
}));

const achievement = achievements[0]!;

function renderProvider() {
  return render(
    <AchievementNotificationProvider>
      <AchievementNotificationToggle />
    </AchievementNotificationProvider>,
  );
}

describe("AchievementNotificationProvider", () => {
  beforeEach(() => {
    localStorageData = {};
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
    localStorage.clear();
    mockedAchievements = [{ ...achievement, unlocked: false }];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("keeps achievement notifications off until the visitor opts in", () => {
    renderProvider();

    act(() => vi.runAllTimers());

    expect(
      screen.getByRole("checkbox", { name: "Achievement notifications" }),
    ).not.toBeChecked();

    mockedAchievements = [{ ...achievement, unlocked: true }];
    renderProvider();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not replay achievements that existed before notifications were enabled", () => {
    mockedAchievements = [{ ...achievement, unlocked: true }];
    const { rerender } = renderProvider();

    act(() => vi.runAllTimers());
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Achievement notifications" }),
    );
    rerender(
      <AchievementNotificationProvider>
        <AchievementNotificationToggle />
      </AchievementNotificationProvider>,
    );

    expect(localStorage.getItem("mythos-achievement-notifications")).toBe(
      "enabled",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not replay stored achievements when notifications were previously enabled", () => {
    localStorage.setItem("mythos-achievement-notifications", "enabled");
    mockedAchievements = [{ ...achievement, unlocked: true }];
    renderProvider();

    act(() => vi.runAllTimers());

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows only achievements unlocked after an enabled preference is established", () => {
    const { rerender } = renderProvider();
    act(() => vi.runAllTimers());

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Achievement notifications" }),
    );
    mockedAchievements = [{ ...achievement, unlocked: true }];
    rerender(
      <AchievementNotificationProvider>
        <AchievementNotificationToggle />
      </AchievementNotificationProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(achievement.name);
  });
});
