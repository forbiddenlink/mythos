import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readHighScore, writeHighScore } from "@/lib/quiz-high-score";

const KEY = "mythos_test_highscore";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("readHighScore", () => {
  it("returns 0 when unset", () => {
    expect(readHighScore(KEY)).toBe(0);
  });

  it("reads a stored score", () => {
    localStorage.setItem(KEY, "7");
    expect(readHighScore(KEY)).toBe(7);
  });

  it.each(["abc", "-3", "NaN", "Infinity", ""])("rejects %j", (raw) => {
    localStorage.setItem(KEY, raw);
    expect(readHighScore(KEY)).toBe(0);
  });

  it("returns 0 when storage access throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readHighScore(KEY)).toBe(0);
  });
});

describe("writeHighScore", () => {
  it("stores the score", () => {
    writeHighScore(KEY, 9);
    expect(localStorage.getItem(KEY)).toBe("9");
  });

  it("ignores non-finite and negative scores", () => {
    writeHighScore(KEY, Number.NaN);
    writeHighScore(KEY, -1);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("does not throw when storage is full", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => writeHighScore(KEY, 5)).not.toThrow();
  });
});
