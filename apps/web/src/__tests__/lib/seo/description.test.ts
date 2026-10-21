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

  it("cuts at a clause boundary and ends with a period", () => {
    const text =
      "Zeus is the supreme deity of the Greek pantheon, ruler of Mount Olympus and god of the sky, thunder, lightning, law and order across every age of myth and across every one of the many lands that worshipped him";
    const out = truncateDescription(text);
    expect(out.endsWith(".")).toBe(true);
    expect(out).not.toContain("…");
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.length).toBeGreaterThan(80);
  });

  it("cuts at a word and drops a dangling word when no clause fits", () => {
    const text = `${"alpha ".repeat(26)}and the beta gamma delta`;
    const out = truncateDescription(text, 160);
    expect(out.endsWith(".")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(160);
    const text2 = `${"alpha ".repeat(25)}of the ${"zeta ".repeat(20)}`;
    const out2 = truncateDescription(text2, 160);
    expect(out2).not.toMatch(/\b(?:of|the|and)\.$/);
  });

  it("drops several dangling words in a row", () => {
    expect(truncateDescription(`${"ab ".repeat(8)}and the of`, 30)).toBe(
      "ab ab ab ab ab ab ab ab.",
    );
  });

  it("hard-cuts a single unbroken token", () => {
    const out = truncateDescription("x".repeat(300));
    expect(out.length).toBe(160);
    expect(out.endsWith(".")).toBe(true);
  });

  it("does not treat a tiny first sentence as a cut", () => {
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

  it("appends the suffix as its own sentence after a complete one", () => {
    const text =
      "The lake sits in a crater near the coast, ringed by wooded hills and sulphurous vents that the poets feared, and the road runs on past the ancient cave for miles";
    const out = entryDescription("Lake", text, {
      suffix: "5 deities, 9 stories.",
    });
    expect(out).toMatch(/\w\. 5 deities, 9 stories\.$/);
    expect(out).not.toContain("…");
    expect(out.length).toBeLessThanOrEqual(160);
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
