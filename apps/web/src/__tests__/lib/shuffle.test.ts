import { describe, expect, it } from "vitest";
import { shuffle } from "@/lib/shuffle";

describe("shuffle", () => {
  it("returns a permutation and leaves the input untouched", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(out).not.toBe(input);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
  });

  it("uses the supplied random source", () => {
    // random() = 0 always swaps index i with 0.
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
  });

  it("puts each item first about equally often", () => {
    const counts = [0, 0, 0, 0];
    const runs = 40_000;
    for (let n = 0; n < runs; n++) counts[shuffle([0, 1, 2, 3])[0]]++;
    for (const c of counts) {
      expect(Math.abs(c / runs - 0.25)).toBeLessThan(0.02);
    }
  });
});
