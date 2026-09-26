import deities from "@/data/deities.json";
import pantheons from "@/data/pantheons.json";
import { ogPalette, renderOgCard } from "@/lib/og/card";

// Node runtime: the catalogs these cards read are too large for an edge bundle.
export const runtime = "nodejs";
export const alt = "Deity information from Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Entry {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  domain?: string[];
  description: string;
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
  const entry = (deities as unknown as Entry[]).find(
    (item) => item.slug === slug || item.id === slug,
  );
  if (!entry) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Deity" });
  }
  return renderOgCard({
    eyebrow: `${traditionName(entry.pantheonId)} mythology`,
    title: entry.name,
    subtitle: entry.domain?.length
      ? entry.domain.slice(0, 4).join(" · ")
      : undefined,
    description: entry.description,
    palette: ogPalette(entry.pantheonId),
  });
}
