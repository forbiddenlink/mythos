import { getDeityComparison } from "@/lib/comparisons";
import { ogPalette, renderOgCard } from "@/lib/og/card";

// Node runtime: the catalogs these cards read are too large for an edge bundle.
export const runtime = "nodejs";
export const alt = "Side-by-side deity comparison from Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const comparison = getDeityComparison(pair);
  if (!comparison) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Comparison" });
  }
  const { a, b, basis, sharedDomains } = comparison;
  const traditions = comparison.sameTradition
    ? a.pantheonName
    : `${a.pantheonName} · ${b.pantheonName}`;
  return renderOgCard({
    eyebrow: "Side by side",
    title: `${a.displayName} vs ${b.displayName}`,
    subtitle: sharedDomains.length
      ? `Shared: ${sharedDomains.slice(0, 3).join(" · ")}`
      : traditions,
    description: basis.kind === "parallel" ? basis.notes[0] : traditions,
    palette: ogPalette(a.pantheonId),
  });
}
