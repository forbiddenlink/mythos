import { describe, expect, it } from "vitest";
import { splitIntoPlates } from "@/components/stories/ScrollytellingReader";

describe("splitIntoPlates", () => {
  it("splits on ## / ### headings, keeping each heading with its body", () => {
    const md = [
      "Intro paragraph before any heading.",
      "",
      "## The First Trial",
      "He crossed the river.",
      "",
      "### A Whisper",
      "The oracle spoke.",
    ].join("\n");

    const plates = splitIntoPlates(md);
    expect(plates).toHaveLength(3);
    expect(plates[0].heading).toBeUndefined();
    expect(plates[0].body).toContain("Intro paragraph");
    expect(plates[1].heading).toBe("The First Trial");
    expect(plates[1].body).toBe("He crossed the river.");
    expect(plates[2].heading).toBe("A Whisper");
  });

  it("falls back to paragraph pairs when there are no headings", () => {
    const md = ["Para one.", "", "Para two.", "", "Para three."].join("\n");
    const plates = splitIntoPlates(md);
    // 3 paragraphs -> pairs of 2 -> [ [1,2], [3] ]
    expect(plates).toHaveLength(2);
    expect(plates[0].body).toContain("Para one.");
    expect(plates[0].body).toContain("Para two.");
    expect(plates[1].body).toBe("Para three.");
  });

  it("never returns an empty array for non-empty input", () => {
    expect(splitIntoPlates("Single line.").length).toBeGreaterThan(0);
  });

  it("does not emit empty plates from trailing whitespace", () => {
    const md = "## Only Heading\n\n\n";
    const plates = splitIntoPlates(md);
    expect(plates).toHaveLength(1);
    expect(plates[0].heading).toBe("Only Heading");
    expect(plates.every((p) => p.heading || p.body)).toBe(true);
  });
});
