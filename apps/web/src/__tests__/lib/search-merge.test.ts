import { mergeLexicalAndSemantic } from "@/lib/search-merge";
import type { SearchResult } from "@/lib/search";
import { describe, expect, it } from "vitest";

describe("mergeLexicalAndSemantic", () => {
  it("dedupes by type:slug and keeps higher score", () => {
    const lexical: SearchResult[] = [
      {
        type: "deity",
        id: "1",
        slug: "zeus",
        title: "Zeus",
        subtitle: "Greek",
        matchScore: 100,
      },
    ];
    const semantic: SearchResult[] = [
      {
        type: "deity",
        id: "1",
        slug: "zeus",
        title: "Zeus",
        subtitle: "Greek",
        matchScore: 500,
      },
    ];
    const out = mergeLexicalAndSemantic(lexical, semantic, 5);
    expect(out).toHaveLength(1);
    expect(out[0]?.matchScore).toBe(500);
  });
});
