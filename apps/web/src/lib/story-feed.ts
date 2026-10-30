export interface FeedStory {
  slug: string;
  title: string;
  summary: string;
  pantheonName: string;
}

// Characters XML 1.0 does not allow, which would make a reader reject the feed.
const FORBIDDEN_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

function escapeXml(value: string): string {
  return value
    .replace(FORBIDDEN_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * RSS 2.0 feed of the story catalog. Items carry no pubDate: the catalog does
 * not record publication dates and none are invented. Links are the canonical,
 * parameter-free story URLs.
 */
export function buildStoriesFeed(
  stories: readonly FeedStory[],
  siteUrl: string,
): string {
  const items = stories
    .map((story) => {
      const url = `${siteUrl}/stories/${story.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(story.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(story.summary)}</description>`,
        `      <category>${escapeXml(story.pantheonName)}</category>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Mythos Atlas stories</title>",
    `    <link>${siteUrl}/stories</link>`,
    "    <description>Myths and legends retold on Mythos Atlas.</description>",
    "    <language>en</language>",
    `    <atom:link href="${siteUrl}/stories/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
