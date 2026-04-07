import { describe, expect, it } from "vitest";
import {
  buildOracleGroundingContext,
  getOracleGrounding,
  lastUserMessageText,
} from "@/lib/oracle/grounding";

describe("oracle grounding", () => {
  it("returns empty string for short query", async () => {
    expect(await buildOracleGroundingContext("a", { locale: "en" })).toBe("");
  });

  it("includes Zeus from natural-language questions via keyword fallback", async () => {
    const { context, hitCount, citations } = await getOracleGrounding(
      "Who is Zeus?",
      { locale: "en" },
    );
    expect(context).toContain("Zeus");
    expect(context).toContain("/deities/zeus");
    expect(context).toContain("REFERENCE");
    expect(hitCount).toBeGreaterThan(0);
    expect(citations.some((c) => c.slug === "zeus")).toBe(true);
  });

  it("reports hit count aligned with snippets", async () => {
    const { hitCount, context } = await getOracleGrounding(
      "Zeus Hera Olympus",
      {
        locale: "en",
      },
    );
    expect(context.length).toBeGreaterThan(0);
    expect(hitCount).toBeGreaterThan(0);
  });

  it("lastUserMessageText picks latest user message", () => {
    expect(
      lastUserMessageText([
        { role: "user", content: "first" },
        { role: "assistant", content: "reply" },
        { role: "user", content: "second" },
      ]),
    ).toBe("second");
  });
});
