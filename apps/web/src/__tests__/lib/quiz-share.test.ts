import { describe, expect, it } from "vitest";
import {
  formatQuizResultSlug,
  parseQuizResultSlug,
  quizResultPath,
  quizResultVerdict,
} from "@/lib/quiz-share";

describe("quiz result share slugs", () => {
  it("formats a score as a readable slug", () => {
    expect(formatQuizResultSlug(8, 10)).toBe("8-of-10");
  });

  it("round-trips a valid slug", () => {
    expect(parseQuizResultSlug("8-of-10")).toEqual({ score: 8, total: 10 });
  });

  it("rejects a malformed slug", () => {
    for (const bad of [
      "",
      "8of10",
      "8-of-",
      "-of-10",
      "eight-of-ten",
      "8-of-10-of-12",
    ]) {
      expect(parseQuizResultSlug(bad)).toBeNull();
    }
  });

  it("rejects a score above the total", () => {
    expect(parseQuizResultSlug("11-of-10")).toBeNull();
  });

  it("rejects a zero or negative total", () => {
    expect(parseQuizResultSlug("0-of-0")).toBeNull();
    expect(parseQuizResultSlug("-1-of-10")).toBeNull();
  });

  it("rejects an implausibly long quiz so the route cannot be used as a text field", () => {
    expect(parseQuizResultSlug("500-of-1000")).toBeNull();
  });

  it("builds the share path", () => {
    expect(quizResultPath(8, 10)).toBe("/quiz/result/8-of-10");
  });

  it("gives every score a verdict", () => {
    expect(quizResultVerdict(10, 10).title).toBeTruthy();
    expect(quizResultVerdict(0, 10).title).toBeTruthy();
    expect(quizResultVerdict(5, 10).title).toBeTruthy();
  });

  it("scales the verdict with the percentage, not the raw score", () => {
    expect(quizResultVerdict(9, 10).title).toBe(
      quizResultVerdict(18, 20).title,
    );
  });
});
