import { describe, expect, it } from "vitest";
import { estimateNarrationDuration } from "@/lib/narration";

describe("narration duration", () => {
  const oneMinute = Array(150).fill("story").join(" ");

  it("estimates speech in words per minute rather than characters per second", () => {
    expect(estimateNarrationDuration(oneMinute)).toBe(60);
    expect(estimateNarrationDuration(oneMinute, 2)).toBe(30);
    expect(estimateNarrationDuration(oneMinute, 0.5)).toBe(120);
  });

  it("handles empty text, whitespace, and invalid rates", () => {
    expect(estimateNarrationDuration(" \n\t ")).toBe(0);
    expect(estimateNarrationDuration("one\n\ttwo")).toBe(1);
    for (const rate of [0, -1, NaN, Infinity]) {
      expect(estimateNarrationDuration(oneMinute, rate)).toBe(60);
    }
  });
});
