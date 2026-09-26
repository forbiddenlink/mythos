import pantheons from "@/data/pantheons.json";
import { ogPalette, renderOgCard } from "@/lib/og/card";

export const alt = "Mythological tradition from Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Entry {
  id: string;
  name: string;
  slug: string;
  culture?: string;
  region?: string;
  description?: string;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = (pantheons as unknown as Entry[]).find(
    (item) => item.slug === slug || item.id === slug,
  );
  if (!entry) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Tradition" });
  }
  return renderOgCard({
    eyebrow: "Mythological tradition",
    title: entry.name,
    subtitle: entry.region ?? entry.culture,
    description: entry.description,
    palette: ogPalette(entry.id),
  });
}
