import { getPantheons, getStories } from "@/lib/data/catalog";
import { buildStoriesFeed } from "@/lib/story-feed";

const SITE_URL = "https://mythosatlas.com";

export const dynamic = "force-static";

export function GET() {
  const pantheons = getPantheons();
  const xml = buildStoriesFeed(
    getStories().map((story) => ({
      slug: story.slug,
      title: story.title,
      summary: story.summary,
      pantheonName:
        pantheons.find((p) => p.id === story.pantheonId)?.name ??
        story.pantheonId,
    })),
    SITE_URL,
  );
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
