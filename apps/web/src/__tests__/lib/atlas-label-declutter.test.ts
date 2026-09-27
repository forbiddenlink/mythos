import { describe, it, expect } from "vitest";
import {
  declutterLabels,
  hiddenSetsDiffer,
  type LabelBox,
} from "@/lib/atlas-label-declutter";

const box = (partial: Partial<LabelBox> & Pick<LabelBox, "id">): LabelBox => ({
  x: 0,
  y: 0,
  width: 60,
  height: 16,
  priority: 0,
  ...partial,
});

describe("declutterLabels", () => {
  it("hides nothing when no boxes overlap", () => {
    const boxes = [
      box({ id: "greek", x: 0, y: 0 }),
      box({ id: "norse", x: 500, y: 0 }),
      box({ id: "egyptian", x: 0, y: 500 }),
    ];
    expect(declutterLabels(boxes)).toEqual(new Set());
  });

  it("hides the lower-priority label of a colliding pair", () => {
    const boxes = [
      box({ id: "canaanite", x: 100, y: 100, priority: 1 }),
      box({ id: "akan", x: 108, y: 100, priority: 5 }), // overlaps canaanite, higher priority
    ];
    const hidden = declutterLabels(boxes);
    expect(hidden).toEqual(new Set(["canaanite"]));
  });

  it("keeps a chain of three mutually overlapping labels down to the single highest priority", () => {
    // a-b overlap, b-c overlap, a-c do not (a wide chain), but b is the
    // highest priority so both neighbours must yield to it.
    const boxes = [
      box({ id: "a", x: 0, y: 0, width: 40, priority: 1 }),
      box({ id: "b", x: 30, y: 0, width: 40, priority: 9 }),
      box({ id: "c", x: 60, y: 0, width: 40, priority: 2 }),
    ];
    const hidden = declutterLabels(boxes);
    expect(hidden.has("b")).toBe(false);
    expect(hidden.has("a")).toBe(true);
    expect(hidden.has("c")).toBe(true);
  });

  it("is deterministic for equal-priority collisions (breaks ties by id)", () => {
    const boxes = [
      box({ id: "zeus-cluster", x: 0, y: 0, priority: 3 }),
      box({ id: "amun-cluster", x: 10, y: 0, priority: 3 }),
    ];
    // "amun-cluster" sorts before "zeus-cluster" alphabetically, so it wins.
    expect(declutterLabels(boxes)).toEqual(new Set(["zeus-cluster"]));
  });

  it("respects a hovered label's boosted priority even against a larger cluster", () => {
    const HOVER_PRIORITY = Number.POSITIVE_INFINITY;
    const boxes = [
      box({ id: "big-cluster", x: 0, y: 0, priority: 26 }),
      box({ id: "hovered", x: 5, y: 0, priority: HOVER_PRIORITY }),
    ];
    expect(declutterLabels(boxes)).toEqual(new Set(["big-cluster"]));
  });

  it("treats touching-but-not-overlapping boxes (plus padding) as non-colliding", () => {
    const boxes = [
      box({ id: "a", x: 0, y: 0, width: 20, height: 10 }),
      box({ id: "b", x: 50, y: 0, width: 20, height: 10 }), // gap of 20px, well past the 4px default padding
    ];
    expect(declutterLabels(boxes)).toEqual(new Set());
  });

  it("returns an empty set for zero or one boxes", () => {
    expect(declutterLabels([])).toEqual(new Set());
    expect(declutterLabels([box({ id: "solo" })])).toEqual(new Set());
  });
});

describe("hiddenSetsDiffer", () => {
  it("is false for two empty sets", () => {
    expect(hiddenSetsDiffer(new Set(), new Set())).toBe(false);
  });

  it("is false for equal sets regardless of insertion order", () => {
    expect(
      hiddenSetsDiffer(new Set(["a", "b"]), new Set(["b", "a"])),
    ).toBe(false);
  });

  it("is true when sizes differ", () => {
    expect(hiddenSetsDiffer(new Set(["a"]), new Set())).toBe(true);
  });

  it("is true when sizes match but membership differs", () => {
    expect(hiddenSetsDiffer(new Set(["a"]), new Set(["b"]))).toBe(true);
  });
});
