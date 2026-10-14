import { describe, expect, it } from "vitest";
import {
  RESEND_UNSUBSCRIBE_PLACEHOLDER,
  buildWeeklyDigest,
  formatCitation,
  isoWeek,
  isoWeekKey,
  pickStoryOfTheWeek,
  reflectionPrompt,
  type DigestJourney,
  type DigestStory,
} from "@/lib/newsletter-digest";

function story(
  slug: string,
  overrides: Partial<DigestStory> = {},
): DigestStory {
  return {
    slug,
    title: `Story ${slug}`,
    summary: `Summary of ${slug}.`,
    keyExcerpts: `Excerpt of ${slug}.`,
    moralThemes: ["justice", "power"],
    pantheonId: "greek-pantheon",
    citationSources: [
      { title: "Theogony", author: "Hesiod", lines: "617-735" },
    ],
    ...overrides,
  };
}

const STORIES = ["a", "b", "c", "d", "e"].map((s) => story(s));
const JOURNEYS: DigestJourney[] = [
  { slug: "odyssey", title: "The Odyssey", pantheonId: "greek-pantheon" },
];

describe("isoWeek", () => {
  it("handles year boundaries", () => {
    expect(isoWeek(new Date("2026-01-01T12:00:00Z"))).toEqual({
      year: 2026,
      week: 1,
    });
    // 2027-01-01 is a Friday, still in the last week of 2026.
    expect(isoWeekKey(new Date("2027-01-01T12:00:00Z"))).toBe("2026-W53");
    expect(isoWeekKey(new Date("2026-10-12T00:00:00Z"))).toBe("2026-W42");
    expect(isoWeekKey(new Date("2026-10-18T23:59:00Z"))).toBe("2026-W42");
    expect(isoWeekKey(new Date("2026-10-19T00:00:00Z"))).toBe("2026-W43");
  });
});

describe("pickStoryOfTheWeek", () => {
  it("is stable within a week and independent of input order", () => {
    const monday = new Date("2026-10-12T08:00:00Z");
    const sunday = new Date("2026-10-18T22:00:00Z");
    const first = pickStoryOfTheWeek(STORIES, monday);
    expect(pickStoryOfTheWeek(STORIES, sunday)).toEqual(first);
    expect(pickStoryOfTheWeek([...STORIES].reverse(), monday)).toEqual(first);
  });

  it("shows every eligible story once before repeating", () => {
    const start = new Date("2026-10-12T08:00:00Z").getTime();
    const slugs = Array.from(
      { length: STORIES.length },
      (_, i) =>
        pickStoryOfTheWeek(STORIES, new Date(start + i * 7 * 86_400_000))?.slug,
    );
    expect(new Set(slugs).size).toBe(STORIES.length);
  });

  it("skips stories missing a source, excerpt or theme", () => {
    const incomplete = [
      story("no-source", { citationSources: [] }),
      story("no-themes", { moralThemes: [] }),
      story("no-excerpt", { keyExcerpts: " " }),
    ];
    expect(pickStoryOfTheWeek(incomplete, new Date())).toBeNull();
    expect(buildWeeklyDigest(incomplete, JOURNEYS, new Date())).toBeNull();
  });
});

describe("formatCitation", () => {
  it("joins author, title and locator", () => {
    expect(
      formatCitation([
        { title: "Library", author: "Apollodorus", book: "1.2.1" },
      ]),
    ).toBe("Apollodorus, Library, book 1.2.1");
    expect(formatCitation([{ title: "Theogony" }])).toBe("Theogony");
    expect(formatCitation([])).toBeNull();
  });
});

describe("reflectionPrompt", () => {
  it("uses the story's own themes", () => {
    expect(reflectionPrompt(["justice", "power"])).toBe(
      "What does this story say about justice and power?",
    );
    expect(reflectionPrompt(["fate"])).toBe(
      "What does this story say about fate?",
    );
  });
});

describe("buildWeeklyDigest", () => {
  const date = new Date("2026-10-12T08:00:00Z");

  it("returns subject, html and text with the required parts", () => {
    const digest = buildWeeklyDigest(STORIES, JOURNEYS, date);
    expect(digest).not.toBeNull();
    const { subject, html, text, weekKey, storySlug } = digest!;
    expect(weekKey).toBe("2026-W42");
    expect(subject).toContain("Story");
    for (const body of [html, text]) {
      expect(body).toContain(RESEND_UNSUBSCRIBE_PLACEHOLDER);
      expect(body).toContain(`https://mythosatlas.com/stories/${storySlug}`);
      expect(body).toContain("https://mythosatlas.com/journeys/odyssey");
      expect(body).toContain("Hesiod, Theogony, lines 617-735");
      expect(body).toContain(
        "What does this story say about justice and power?",
      );
    }
  });

  it("omits the journey when the tradition has none", () => {
    const digest = buildWeeklyDigest(
      [story("x", { pantheonId: "norse-pantheon" })],
      JOURNEYS,
      date,
    );
    expect(digest?.html).not.toContain("/journeys/");
    expect(digest?.parts.journey).toBeNull();
  });

  it("escapes HTML in catalog text", () => {
    const digest = buildWeeklyDigest(
      [story("x", { title: "A <b>&</b> B" })],
      [],
      date,
    );
    expect(digest?.html).toContain("A &lt;b&gt;&amp;&lt;/b&gt; B");
    expect(digest?.html).not.toContain("<b>&</b>");
  });
});
