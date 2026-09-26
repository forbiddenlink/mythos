import { getGodsOfDomain, godsOfTitle } from "@/lib/gods-of";
import { renderOgCard } from "@/lib/og/card";

export const runtime = "edge";
export const alt = "Gods of a divine domain across world mythology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const page = getGodsOfDomain(domain);
  if (!page) {
    return renderOgCard({ eyebrow: "Mythos Atlas", title: "Divine domains" });
  }
  const names = page.traditions
    .map((t) => t.deities[0]?.name)
    .filter(Boolean)
    .slice(0, 5)
    .join(" · ");
  return renderOgCard({
    eyebrow: "Divine domains",
    title: godsOfTitle(page),
    subtitle: `${page.deityCount} deities · ${page.traditions.length} traditions`,
    description: names,
  });
}
