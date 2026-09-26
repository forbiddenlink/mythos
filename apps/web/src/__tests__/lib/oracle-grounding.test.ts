import { describe, expect, it } from "vitest";
import {
  buildOracleGroundingContext,
  exactNameMatches,
  getOracleGrounding,
  getOracleGroundingForConversation,
  lastUserMessageText,
} from "@/lib/oracle/grounding";

describe("oracle grounding", () => {
  it.each([
    ["Heracles", "/heroes/heracles"],
    ["Iliad", "/sources/iliad"],
  ])("grounds %s in its catalog entry", async (query, url) => {
    const { context, citations } = await getOracleGrounding(query, {
      locale: "en",
    });
    expect(context).toContain(url);
    expect(citations.some((citation) => citation.path === url)).toBe(true);
  });

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

  it("streams primary sources (title + locator) drawn from the snippets", async () => {
    const { primarySources, context } = await getOracleGrounding(
      "Who is Zeus?",
      {
        locale: "en",
      },
    );
    const theogony = primarySources.find((s) => /Theogony/.test(s.title));
    expect(theogony).toBeDefined();
    expect(theogony?.locator).toMatch(/^\d+–\d+$/);
    expect(theogony?.path).toBe("/sources/theogony");
    expect(context).toMatch(/Primary sources: .*Hesiod, Theogony \d+–\d+/);
  });

  it("matches aliases exactly (Jupiter → Zeus page, Ulysses → Odysseus)", () => {
    expect(exactNameMatches("Tell me about Jove").map((h) => h.slug)).toContain(
      "zeus",
    );
    expect(exactNameMatches("Who was Ulysses?").map((h) => h.slug)).toContain(
      "odysseus",
    );
  });

  it("only matches very short names when capitalised", () => {
    expect(
      exactNameMatches("a set of rules").some((h) => h.slug === "set"),
    ).toBe(false);
    expect(exactNameMatches("Who is Set?").some((h) => h.slug === "set")).toBe(
      true,
    );
  });

  it("adds cross-pantheon counterparts for comparison questions", async () => {
    const { citations } = await getOracleGrounding(
      "What is the Norse counterpart of Zeus?",
      { locale: "en" },
    );
    const slugs = citations.map((c) => c.slug);
    expect(slugs).toContain("zeus");
    expect(slugs).toContain("odin");
  });

  it("pulls in stories featuring a matched hero", async () => {
    const { citations } = await getOracleGrounding("Odysseus", {
      locale: "en",
    });
    expect(citations.some((c) => c.type === "story")).toBe(true);
  });

  it("carries the topic into follow-ups that retrieve nothing on their own", async () => {
    const { citations } = await getOracleGroundingForConversation(
      [
        { role: "user", content: "Who is Zeus?" },
        { role: "assistant", content: "The king of the gods." },
        { role: "user", content: "and then?" },
      ],
      { locale: "en" },
    );
    expect(citations.some((c) => c.slug === "zeus")).toBe(true);
  });

  it("returns no grounding for gibberish", async () => {
    const g = await getOracleGrounding("qwxz vbnq", { locale: "en" });
    expect(g.hitCount).toBe(0);
    expect(g.citations).toEqual([]);
    expect(g.primarySources).toEqual([]);
  });
});
