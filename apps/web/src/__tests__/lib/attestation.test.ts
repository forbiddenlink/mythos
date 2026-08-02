import { describe, expect, it } from "vitest";
import { attestationOf, formatYear, parseSourceYear } from "@/lib/attestation";

describe("parseSourceYear", () => {
  it("parses BCE dates as negative years", () => {
    expect(parseSourceYear("c. 700 BCE")).toBe(-700);
    expect(parseSourceYear("750 BCE")).toBe(-750);
  });

  it("parses CE dates as positive years", () => {
    expect(parseSourceYear("400 CE")).toBe(400);
    expect(parseSourceYear("c. 100 CE")).toBe(100);
  });

  it("parses century ranges to their midpoint", () => {
    expect(parseSourceYear("8th century BCE")).toBe(-750);
    expect(parseSourceYear("2nd century CE")).toBe(150);
  });

  it("returns null for undated / unparseable strings", () => {
    expect(parseSourceYear(undefined)).toBeNull();
    expect(parseSourceYear("unknown")).toBeNull();
  });
});

describe("formatYear", () => {
  it("labels BCE and CE", () => {
    expect(formatYear(-700)).toBe("c. 700 BCE");
    expect(formatYear(150)).toBe("c. 150 CE");
  });
});

describe("attestationOf", () => {
  it("finds the earliest source and tiers by corroboration", () => {
    const a = attestationOf([
      { text: "", source: "Hesiod, Theogony", date: "c. 700 BCE" },
      { text: "", source: "Homer, Iliad", date: "c. 750 BCE" },
    ]);
    expect(a.count).toBe(2);
    expect(a.earliestYear).toBe(-750);
    expect(a.earliestSource?.source).toBe("Homer, Iliad");
    expect(a.tier).toBe("corroborated");
  });

  it("handles a single source and no sources", () => {
    expect(attestationOf([{ text: "", source: "X", date: "1 CE" }]).tier).toBe(
      "single",
    );
    expect(attestationOf([]).tier).toBe("unattested");
    expect(attestationOf(undefined).earliestYear).toBeNull();
  });

  it("marks 3+ sources as well attested", () => {
    const a = attestationOf([
      { text: "", source: "A", date: "1 BCE" },
      { text: "", source: "B", date: "1 CE" },
      { text: "", source: "C", date: "2 CE" },
    ]);
    expect(a.tier).toBe("well-attested");
  });
});
