import creatures from "@/data/creatures.json";
import pantheons from "@/data/pantheons.json";
import { ogPalette, renderOgCard } from "@/lib/og/card";

export const runtime = "edge";
export const alt = "Creature entry from Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Entry {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  habitat?: string;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = (creatures as unknown as Entry[]).find(
    (item) => item.slug === slug || item.id === slug,
  );
  if (!entry) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Creature" });
  }
  const tradition =
    pantheons
      .find((p) => p.id === entry.pantheonId)
      ?.name.replace(/\s+(?:Pantheon|Tradition|Traditions)$/, "") ?? "World";
  return renderOgCard({
    eyebrow: `${tradition} creature`,
    title: entry.name,
    subtitle: entry.habitat,
    description: entry.description,
    palette: ogPalette(entry.pantheonId),
  });
}
