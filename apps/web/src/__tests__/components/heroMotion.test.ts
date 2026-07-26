import { describe, it, expect } from "vitest";
import { heroEntrance, heroLoop } from "../../components/home/heroMotion";

describe("heroEntrance", () => {
  const full = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  it("reduced motion: skips initial (renders at final state), zero duration", () => {
    const e = heroEntrance(true, full);
    expect(e.initial).toBe(false);
    expect(e.animate).toEqual({ opacity: 1, y: 0 });
    expect((e.transition as { duration: number }).duration).toBe(0);
  });

  it("full motion: returns the animation unchanged", () => {
    expect(heroEntrance(false, full)).toBe(full);
  });
});

describe("heroLoop", () => {
  const full = {
    animate: { y: [0, 8, 0] },
    transition: { duration: 2.5, repeat: Infinity },
  };

  it("reduced motion: no looping animate or transition", () => {
    const l = heroLoop(true, full);
    expect(l.animate).toEqual({});
    expect((l.transition as { repeat?: number }).repeat ?? 0).toBe(0);
  });

  it("full motion: returns the loop unchanged", () => {
    expect(heroLoop(false, full)).toBe(full);
  });
});
