import { describe, expect, it } from "vitest";
import {
  COMPARISON_EXTENSION,
  standardUrl,
  WORKSHEET_STANDARDS,
} from "@/lib/worksheet-standards";

const all = [
  ...WORKSHEET_STANDARDS.flatMap((entry) => entry.standards),
  COMPARISON_EXTENSION,
];

describe("worksheet standards", () => {
  it("uses well-formed reading codes at grades 4 to 8", () => {
    for (const standard of all) {
      expect(standard.code).toMatch(/^R[LI]\.[4-8]\.\d{1,2}$/);
      expect(standard.text.length).toBeGreaterThan(20);
    }
  });

  it("covers every worksheet section once", () => {
    const sections = WORKSHEET_STANDARDS.map((entry) => entry.section);
    expect(new Set(sections).size).toBe(sections.length);
    expect(sections).toEqual([
      "matching",
      "family",
      "short-figures",
      "short-stories",
    ]);
  });

  it("links each code to its page on thecorestandards.org", () => {
    expect(standardUrl("RL.4.2")).toBe(
      "https://www.thecorestandards.org/ELA-Literacy/RL/4/2/",
    );
  });
});
