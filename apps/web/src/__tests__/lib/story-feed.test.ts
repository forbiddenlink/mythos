import { describe, expect, it } from "vitest";
import stories from "@/data/stories.json";
import { buildStoriesFeed } from "@/lib/story-feed";

const SITE = "https://mythosatlas.com";

describe("buildStoriesFeed", () => {
  it("emits one item per story with its canonical, parameter-free URL", () => {
    const xml = buildStoriesFeed(
      [
        {
          slug: "titanomachy",
          title: "The Titanomachy",
          summary: "Zeus & the Olympians <rise>.",
          pantheonName: "Greek Pantheon",
        },
      ],
      SITE,
    );
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(`<link>${SITE}/stories/titanomachy</link>`);
    expect(xml).toContain(
      `<guid isPermaLink="true">${SITE}/stories/titanomachy</guid>`,
    );
    expect(xml).toContain("Zeus &amp; the Olympians &lt;rise&gt;.");
    expect(xml).toContain("<category>Greek Pantheon</category>");
    expect(xml).not.toContain("?in=");
  });

  it("declares its own address for feed readers", () => {
    expect(buildStoriesFeed([], SITE)).toContain(
      `<atom:link href="${SITE}/stories/feed.xml" rel="self" type="application/rss+xml"`,
    );
  });

  it("invents no dates: items carry no pubDate", () => {
    const xml = buildStoriesFeed(
      [{ slug: "a", title: "A", summary: "s", pantheonName: "P" }],
      SITE,
    );
    expect(xml).not.toContain("pubDate");
  });

  it("covers the whole catalog", () => {
    const xml = buildStoriesFeed(
      stories.map((s) => ({
        slug: s.slug,
        title: s.title,
        summary: s.summary,
        pantheonName: "x",
      })),
      SITE,
    );
    expect(xml.match(/<item>/g)).toHaveLength(stories.length);
  });

  it("strips characters XML 1.0 forbids", () => {
    const xml = buildStoriesFeed(
      [{ slug: "a", title: "A\u0000B", summary: "s\u0008", pantheonName: "P" }],
      SITE,
    );
    expect(xml).toContain("<title>AB</title>");
  });
});
