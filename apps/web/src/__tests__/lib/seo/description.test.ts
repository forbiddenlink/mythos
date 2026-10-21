import { describe, expect, it } from "vitest";
import { entryDescription, truncateDescription } from "@/lib/seo/description";

describe("truncateDescription", () => {
  it("returns short text unchanged, with whitespace collapsed", () => {
    expect(truncateDescription("  Short   text. ")).toBe("Short text.");
  });

  it("never exceeds the limit", () => {
    const long = "word ".repeat(100);
    expect(truncateDescription(long).length).toBeLessThanOrEqual(160);
    expect(truncateDescription(long, 50).length).toBeLessThanOrEqual(50);
  });

  it("cuts at a sentence boundary without an ellipsis", () => {
    const text =
      "Zeus rules the sky and wields the thunderbolt over gods and mortals alike from his throne on Mount Olympus. He is the youngest son of Cronus who overthrew his father and divided the cosmos among his brothers.";
    expect(truncateDescription(text)).toBe(
      "Zeus rules the sky and wields the thunderbolt over gods and mortals alike from his throne on Mount Olympus.",
    );
  });

  it("cuts at a word boundary with an ellipsis when no sentence fits", () => {
    const text =
      "Zeus is the supreme deity of the Greek pantheon, ruler of Mount Olympus and god of the sky, thunder, lightning, law and order across every age of myth and across every one of the many lands that worshipped him";
    const out = truncateDescription(text);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(160);
    // Cut on a word boundary: the text before the ellipsis is a prefix ending in a whole word.
    const body = out.slice(0, -1);
    expect(text.startsWith(body)).toBe(true);
    expect(text[body.length]).toBe(" ");
  });

  it("does not leave trailing punctuation before the ellipsis", () => {
    const text = `${"a".repeat(100)}, ${"b".repeat(100)}`;
    expect(truncateDescription(text)).toBe(`${"a".repeat(100)}…`);
  });

  it("hard-cuts a single unbroken token", () => {
    const out = truncateDescription("x".repeat(300));
    expect(out.length).toBe(160);
    expect(out.endsWith("…")).toBe(true);
  });

  it("does not treat a mid-sentence abbreviation-free period in a tiny first sentence as a cut", () => {
    const text = `Hi. ${"word ".repeat(60)}`;
    const out = truncateDescription(text);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("truncateDescription short first sentence", () => {
  it("keeps more text rather than stopping after a very short sentence", () => {
    const out = truncateDescription(`Hi. ${"word ".repeat(60)}`);
    expect(out.length).toBeGreaterThan(100);
  });
});

describe("truncateDescription at a clause", () => {
  it("cuts at a semicolon and ends with a period, not an ellipsis", () => {
    const text =
      "The crater lake near Cumae in Campania that Roman poets placed at the entrance to the underworld; in the Aeneid, the Sibyl leads Aeneas down to the dead through the cave beside it.";
    expect(truncateDescription(text)).toBe(
      "The crater lake near Cumae in Campania that Roman poets placed at the entrance to the underworld.",
    );
  });
});

describe("entryDescription", () => {
  it("names the entry first when the text opens with an article", () => {
    expect(
      entryDescription("Lake Avernus", "The crater lake near Cumae."),
    ).toBe("Lake Avernus: the crater lake near Cumae.");
    expect(entryDescription("Melinoë", "A chthonic goddess of ghosts.")).toBe(
      "Melinoë: a chthonic goddess of ghosts.",
    );
  });

  it("leaves text alone when it already mentions the entry or opens otherwise", () => {
    expect(entryDescription("Zeus", "Zeus rules the sky.")).toBe(
      "Zeus rules the sky.",
    );
    expect(entryDescription("Loki", "Norse trickster who shapeshifts.")).toBe(
      "Norse trickster who shapeshifts.",
    );
  });

  it("skips the prefix when the text already names the shorter form", () => {
    expect(
      entryDescription(
        "Haudenosaunee Mythology",
        "A living tradition of the Haudenosaunee nations.",
        { mentions: "Haudenosaunee" },
      ),
    ).toBe("A living tradition of the Haudenosaunee nations.");
  });

  it("reserves room for a suffix so it is never the part that is cut", () => {
    const long = `The ${"word ".repeat(60)}`;
    const out = entryDescription("Entry", long, {
      suffix: "5 deities, 9 stories.",
    });
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith(" 5 deities, 9 stories.")).toBe(true);
  });
});
