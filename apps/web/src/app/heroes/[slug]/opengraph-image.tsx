import heroes from "@/data/heroes.json";
import pantheons from "@/data/pantheons.json";
import { ogPalette, renderOgCard } from "@/lib/og/card";

// Node runtime: the catalogs these cards read are too large for an edge bundle.
export const runtime = "nodejs";
export const alt = "Hero entry from Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Entry {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  alternateNames?: string[];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = (heroes as unknown as Entry[]).find(
    (item) => item.slug === slug || item.id === slug,
  );
  if (!entry) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Hero" });
  }
  const tradition =
    pantheons
      .find((p) => p.id === entry.pantheonId)
      ?.name.replace(/\s+(?:Pantheon|Tradition|Traditions)$/, "") ?? "World";
  return renderOgCard({
    eyebrow: `${tradition} hero`,
    title: entry.name,
    subtitle: entry.alternateNames?.length
      ? `Also called ${entry.alternateNames.slice(0, 3).join(", ")}`
      : undefined,
    description: entry.description,
    palette: ogPalette(entry.pantheonId),
  });
}
