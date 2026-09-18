import { describe, expect, it } from "vitest";
import { matchesSource } from "@/lib/source-matching";

const poeticEdda = { id: "poetic-edda", title: "Poetic Edda" };

describe("matchesSource", () => {
  it("allows omission of a catalog title's parenthetical translation", () => {
    expect(
      matchesSource(
        { title: "Kojiki" },
        { id: "kojiki", title: "Kojiki (Records of Ancient Matters)" },
      ),
    ).toBe(true);
    expect(
      matchesSource(
        { title: "Apollodorus, Bibliotheca 2.4.12" },
        { id: "library-apollodorus", title: "Bibliotheca (Library)" },
      ),
    ).toBe(true);
    expect(
      matchesSource(
        { title: "Library" },
        { id: "library-apollodorus", title: "Bibliotheca (Library)" },
      ),
    ).toBe(false);
  });
  it("never overrides a different explicit work ID with a matching label", () => {
    expect(
      matchesSource(
        { sourceId: "prose-edda", source: "Poetic Edda" },
        poeticEdda,
      ),
    ).toBe(false);
  });

  it("accepts an explicit ID even when the label uses another language", () => {
    expect(
      matchesSource({ sourceId: "poetic-edda", source: "Ljóð" }, poeticEdda),
    ).toBe(true);
  });

  it("does not guess a replacement for an unknown explicit ID", () => {
    expect(
      matchesSource(
        { sourceId: "missing-work", title: "Poetic Edda" },
        poeticEdda,
      ),
    ).toBe(false);
  });

  it("matches a complete legacy work title with passage and author context", () => {
    expect(
      matchesSource({ title: "  POETIC  EDDA — Völuspá, 40–66 " }, poeticEdda),
    ).toBe(true);
    expect(
      matchesSource(
        { source: "Hesiod, Theogony 678–680" },
        { id: "theogony", title: "Theogony" },
      ),
    ).toBe(true);
  });

  it("rejects incomplete titles and substrings inside other words", () => {
    expect(matchesSource({ title: "Edda" }, poeticEdda)).toBe(false);
    expect(
      matchesSource(
        { title: "NotTheogony" },
        { id: "theogony", title: "Theogony" },
      ),
    ).toBe(false);
  });

  it("does not match blank or punctuation-only labels", () => {
    for (const title of ["", "  ", "—"]) {
      expect(matchesSource({ title }, poeticEdda)).toBe(false);
    }
  });
});
