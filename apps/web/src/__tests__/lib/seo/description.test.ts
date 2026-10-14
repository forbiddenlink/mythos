import { describe, expect, it } from "vitest";
import { truncateDescription } from "@/lib/seo/description";

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
