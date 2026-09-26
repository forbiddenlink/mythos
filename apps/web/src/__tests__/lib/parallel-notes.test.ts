import { describe, expect, it } from "vitest";
import { readableParallelNote } from "@/lib/parallel-notes";

describe("readableParallelNote", () => {
  it("drops a leading catalog cross-reference and capitalizes the rest", () => {
    expect(
      readableParallelNote(
        "Zeus already lists Odin; both are the chief god of their pantheon",
      ),
    ).toBe("Both are the chief god of their pantheon");
  });

  it("drops parenthetical and trailing cross-references", () => {
    expect(
      readableParallelNote(
        "Mars is the direct Greek equivalent, god of war (Ares already lists Mars)",
      ),
    ).toBe("Mars is the direct Greek equivalent, god of war");
    expect(
      readableParallelNote(
        "Bacchus is the Roman name for the same god, already listed as an alternate name",
      ),
    ).toBe("Bacchus is the Roman name for the same god");
  });

  it("leaves reader-facing notes alone", () => {
    const note =
      "Ugaritic multilingual god-lists equate El with the Hurrian father of the gods Kumarbi.";
    expect(readableParallelNote(note)).toBe(note);
  });
});
