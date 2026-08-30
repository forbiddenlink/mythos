import { describe, it, expect } from "vitest";
import {
  generateAnkiTsv,
  createDeityFlashcards,
  type AnkiFlashcard,
  type DeityCardData,
} from "@/lib/anki-export";

const zeus: DeityCardData = {
  name: "Zeus",
  pantheon: "Greek",
  domains: ["sky", "thunder"],
  symbols: ["thunderbolt", "eagle"],
  description: "King of the gods.",
  pronunciation: { ipa: "zjuːs" },
  alternateNames: ["Jupiter"],
};

/** Split into card rows, dropping the header block and the file's trailing
 *  newline only — never trailing tabs, which carry the empty tags column. */
function cardRows(tsv: string): string[] {
  return tsv.replace(/\n$/, "").split("\n").slice(4);
}

describe("generateAnkiTsv", () => {
  it("emits real tab and newline control characters, not literal escapes", () => {
    const tsv = generateAnkiTsv([{ front: "A", back: "B", tags: ["x"] }]);

    // Regression guard: this module once contained literal newlines inside
    // string/regex literals, so it did not even parse.
    expect(tsv).toContain("\t");
    expect(tsv).toContain("\n");
    expect(tsv).not.toContain("\\t");
    expect(tsv).not.toContain("\\n");
  });

  it("writes the Anki import headers Anki needs for zero-config import", () => {
    const lines = generateAnkiTsv([{ front: "A", back: "B" }]).split("\n");

    expect(lines[0]).toBe("#separator:tab");
    expect(lines[1]).toBe("#html:true");
    expect(lines[2]).toBe("#tags column:3");
    expect(lines[3]).toBe("#columns:Front\tBack\tTags");
  });

  it("puts each card on its own line with exactly three tab-separated fields", () => {
    const cards: AnkiFlashcard[] = [
      { front: "F1", back: "B1", tags: ["a", "b"] },
      { front: "F2", back: "B2" },
    ];

    const rows = cardRows(generateAnkiTsv(cards));

    expect(rows).toHaveLength(2);
    expect(rows[0].split("\t")).toEqual(["F1", "B1", "a b"]);
    // A card with no tags still emits the (empty) third column.
    expect(rows[1].split("\t")).toEqual(["F2", "B2", ""]);
  });

  it("sanitises tabs and newlines inside fields so columns cannot break", () => {
    const rows = cardRows(
      generateAnkiTsv([{ front: "has\ttab", back: "has\nnewline" }]),
    );

    // One row, three columns: the embedded tab/newline must not add either.
    expect(rows).toHaveLength(1);
    const fields = rows[0].split("\t");
    expect(fields).toHaveLength(3);
    expect(fields[0]).toBe("has tab");
    expect(fields[1]).toBe("has<br>newline");
  });
});

describe("createDeityFlashcards", () => {
  it("builds one card per deity carrying name, pantheon and description", () => {
    const [card] = createDeityFlashcards([zeus]);

    expect(card.front).toContain("Zeus");
    expect(card.front).toContain("Greek");
    expect(card.back).toContain("King of the gods.");
  });

  it("includes optional pronunciation and alternate names when present", () => {
    const [card] = createDeityFlashcards([zeus]);

    expect(card.front).toContain("zjuːs");
    expect(card.front).toContain("Jupiter");
  });

  it("omits optional blocks entirely when the data is missing", () => {
    const [card] = createDeityFlashcards([
      { ...zeus, pronunciation: undefined, alternateNames: undefined },
    ]);

    expect(card.front).not.toContain("Also known as");
    expect(card.front).not.toContain("//");
  });

  it("slugifies tags so Anki never receives spaces or punctuation", () => {
    const [card] = createDeityFlashcards([
      { ...zeus, pantheon: "African (Yoruba)", domains: ["sky father"] },
    ]);

    expect(card.tags).toContain("mythos-atlas");
    for (const tag of card.tags ?? []) {
      expect(tag).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("survives a deity with no domains or symbols", () => {
    const [card] = createDeityFlashcards([
      { ...zeus, domains: [], symbols: [] },
    ]);

    expect(card.back).not.toContain("Domains:");
    expect(card.back).not.toContain("Symbols:");
    expect(card.back).toContain("King of the gods.");
  });

  it("produces a deck that round-trips through the TSV writer intact", () => {
    const rows = cardRows(generateAnkiTsv(createDeityFlashcards([zeus])));

    expect(rows).toHaveLength(1);
    expect(rows[0].split("\t")).toHaveLength(3);
  });
});
