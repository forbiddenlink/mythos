import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuickQuizPageClient } from "@/app/quiz/quick/QuickQuizPageClient";

vi.mock("@/hooks/useAchievements", () => ({
  useAchievements: () => ({ checkAchievements: vi.fn() }),
}));

const pool = [
  { id: "ares", name: "Ares", domain: ["war"] },
  { id: "ra", name: "Ra", domain: ["sun"] },
  { id: "luna", name: "Luna", domain: ["moon"] },
  { id: "poseidon", name: "Poseidon", domain: ["sea"] },
];

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-05T12:00:00Z"));
  vi.spyOn(Math, "random").mockReturnValue(0.999);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function start() {
  render(<QuickQuizPageClient deitiesData={pool} />);
  fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
}

describe("Quick Quiz", () => {
  it("keeps a sixty-second deadline while the player answers rapidly", () => {
    start();
    for (let i = 0; i < 74; i++) {
      fireEvent.click(screen.getByRole("button", { name: "Ares" }));
      act(() => vi.advanceTimersByTime(800));
    }
    expect(screen.getByText("1s")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    expect(localStorage.getItem("mythos_quick_quiz_highscore")).toBe("74");
  });

  it("explains a missed answer and exposes a labelled answer group", () => {
    start();
    const answers = screen.getByRole("group", { name: /Which figure/ });
    expect(within(answers).getAllByRole("button")).toHaveLength(4);
    fireEvent.click(within(answers).getByRole("button", { name: "Ra" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Not quite. Ares is linked to war in the atlas.",
    );
  });

  it("finishes the round when storage access is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    start();
    fireEvent.click(screen.getByRole("button", { name: "Ares" }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    expect(screen.getByText("New High Score!")).toBeInTheDocument();
  });

  it.each(["NaN", "-5", "12garbage", "Infinity", "1.5"])(
    "ignores invalid saved scores: %s",
    (value) => {
      localStorage.setItem("mythos_quick_quiz_highscore", value);
      render(<QuickQuizPageClient deitiesData={pool} />);
      expect(screen.getByText(/High Score:/)).toHaveTextContent(
        "High Score: 0",
      );
    },
  );

  it("offers recovery instead of an empty playing screen for an unusable pool", () => {
    render(<QuickQuizPageClient deitiesData={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "There aren't enough distinct answers",
    );
    expect(screen.getByRole("link", { name: "quiz hub" })).toHaveAttribute(
      "href",
      "/quiz",
    );
  });

  it("does not let feedback from the previous round replace a restarted question", () => {
    start();
    act(() => vi.advanceTimersByTime(59_500));
    fireEvent.click(screen.getByRole("button", { name: "Ares" }));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(screen.getByRole("button", { name: "Play Again" }));
    fireEvent.click(screen.getByRole("button", { name: "Ra" }));
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite.");
  });

  it("rejects answers after the deadline even before the next timer callback", () => {
    start();
    vi.setSystemTime(new Date("2026-11-05T12:01:01Z"));
    fireEvent.click(screen.getByRole("button", { name: "Ares" }));
    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    expect(screen.queryByText("New High Score!")).not.toBeInTheDocument();
  });
});
