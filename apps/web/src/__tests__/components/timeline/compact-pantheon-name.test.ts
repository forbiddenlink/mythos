import { describe, expect, it } from "vitest";
import { compactPantheonName } from "@/components/timeline/TimelineVisualizationD3";

describe("compactPantheonName", () => {
  it("drops a trailing Pantheon, Tradition or Traditions", () => {
    expect(compactPantheonName("Greek Pantheon")).toBe("Greek");
    expect(compactPantheonName("Tlingit and Haida Tradition")).toBe(
      "Tlingit and Haida",
    );
    expect(compactPantheonName("African Traditions")).toBe("African");
  });

  it("drops parentheticals", () => {
    expect(compactPantheonName("Persian (Iranian) Tradition")).toBe("Persian");
    expect(compactPantheonName("Canaanite Pantheon (Ugarit)")).toBe(
      "Canaanite",
    );
  });

  it("keeps a name that has nothing to drop, and never returns empty", () => {
    expect(compactPantheonName("Diné")).toBe("Diné");
    expect(compactPantheonName("Pantheon")).toBe("Pantheon");
  });
});
