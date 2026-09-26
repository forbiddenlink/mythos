import stories from "@/data/stories.json";
import pantheons from "@/data/pantheons.json";
import { ogPalette, renderOgCard } from "@/lib/og/card";

// Node runtime: the catalogs these cards read are too large for an edge bundle.
export const runtime = "nodejs";
export const alt = "Story from Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Entry {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary?: string;
  category?: string;
}

function traditionName(pantheonId: string): string {
  return (
    pantheons
      .find((p) => p.id === pantheonId)
      ?.name.replace(/\s*\([^)]*\)/g, "")
      .replace(/\s+(?:Pantheon|Tradition|Traditions)\b/, "") ?? "World"
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = (stories as unknown as Entry[]).find(
    (item) => item.slug === slug || item.id === slug,
  );
  if (!entry) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Story" });
  }
  return renderOgCard({
    eyebrow: `${traditionName(entry.pantheonId)} myth`,
    title: entry.title,
    subtitle: entry.category
      ? entry.category.charAt(0).toUpperCase() + entry.category.slice(1)
      : undefined,
    description: entry.summary,
    palette: ogPalette(entry.pantheonId),
  });
}
