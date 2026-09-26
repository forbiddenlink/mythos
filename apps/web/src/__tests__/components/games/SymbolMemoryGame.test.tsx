import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { SymbolMemoryGame } from "@/components/games/SymbolMemoryGame";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
const deities = Array.from({ length: 12 }, (_, i) => ({
  id: `figure-${i}`,
  name: `Figure ${i}`,
  symbols: [`symbol ${i}`],
  pantheonId: "greek-pantheon",
}));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  // Keep both deals identical so an old mismatch timer would affect the new cards.
  vi.spyOn(Math, "random").mockReturnValue(0.999);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function mismatch(): void {
  const cards = within(
    screen.getByRole("group", { name: "Memory game board" }),
  ).getAllByRole("button");
  fireEvent.click(cards[0]);
  fireEvent.click(cards[2]);
}

describe("memory game recovery", () => {
  it.each([
    "null",
    "[]",
    '{"easy":"fast"}',
    '{"easy":null,"medium":-1,"hard":null}',
  ])("ignores invalid saved scores: %s", (saved) => {
    localStorage.setItem("mythos_memory_best_times", saved);
    render(<SymbolMemoryGame deities={deities} />);
    expect(
      screen.getAllByRole("button", { name: "Face down card" }),
    ).toHaveLength(16);
  });

  it.each(["Reset game", "Easy"])(
    "cancels a pending mismatch when %s starts a new board",
    (action) => {
      render(<SymbolMemoryGame deities={deities} />);
      mismatch();
      fireEvent.click(screen.getByRole("button", { name: action }));
      fireEvent.click(
        screen.getAllByRole("button", { name: "Face down card" })[0],
      );
      act(() => vi.advanceTimersByTime(1100));
      expect(
        screen.getByRole("button", { name: "Symbol: symbol 0" }),
      ).toHaveAttribute("aria-pressed", "true");
    },
  );

  it("cancels delayed work on unmount", () => {
    const view = render(<SymbolMemoryGame deities={deities} />);
    mismatch();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("works when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Unavailable");
    });
    render(<SymbolMemoryGame deities={deities} />);
    expect(
      screen.getAllByRole("button", { name: "Face down card" }),
    ).toHaveLength(16);
  });
});
