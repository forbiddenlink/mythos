import { describe, it, expect } from "vitest";
import { neighborWindow, windowAt } from "@/lib/neighbor-window";

const key = (item: { id: string }): string => item.id;
const items = ["e", "b", "a", "d", "c"].map((id) => ({ id }));

describe("neighborWindow", () => {
  it("takes the next entries in id order, ignoring input order", () => {
    expect(neighborWindow(items, "b", 2, key).map(key)).toEqual(["c", "d"]);
  });

  it("wraps around the end of the sorted list", () => {
    expect(neighborWindow(items, "d", 3, key).map(key)).toEqual([
      "e",
      "a",
      "b",
    ]);
  });

  it("never returns the current entry, even when count exceeds the list", () => {
    const result = neighborWindow(items, "c", 10, key).map(key);
    expect(result).toEqual(["d", "e", "a", "b"]);
  });

  it("falls back to the start of the list when the key is absent", () => {
    expect(neighborWindow(items, "zzz", 2, key).map(key)).toEqual(["a", "b"]);
  });

  it("handles empty lists and non-positive counts", () => {
    expect(neighborWindow([], "a", 4, key)).toEqual([]);
    expect(neighborWindow(items, "a", 0, key)).toEqual([]);
  });

  it("gives every entry the same number of inbound links", () => {
    const inbound = new Map<string, number>();
    for (const item of items) {
      for (const n of neighborWindow(items, item.id, 2, key)) {
        inbound.set(n.id, (inbound.get(n.id) ?? 0) + 1);
      }
    }
    expect([...inbound.values()]).toEqual([2, 2, 2, 2, 2]);
  });
});

describe("windowAt", () => {
  const sorted = ["a", "b", "c"];

  it("wraps and normalizes the start index", () => {
    expect(windowAt(sorted, 2, 2)).toEqual(["c", "a"]);
    expect(windowAt(sorted, 7, 2)).toEqual(["b", "c"]);
    expect(windowAt(sorted, -1, 2)).toEqual(["c", "a"]);
  });

  it("does not repeat entries when count exceeds the length", () => {
    expect(windowAt(sorted, 1, 9)).toEqual(["b", "c", "a"]);
  });

  it("returns an empty list for an empty input", () => {
    expect(windowAt([], 3, 2)).toEqual([]);
  });
});
