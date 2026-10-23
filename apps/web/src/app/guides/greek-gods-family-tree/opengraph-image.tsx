import { getGuide } from "@/lib/guides";
import { renderOgCard } from "@/lib/og/card";

export const alt = "Greek gods family tree, simple version";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const guide = getGuide("greek-gods-family-tree");
  return renderOgCard({
    eyebrow: "Guide · Hesiod",
    title: guide?.shortTitle ?? "Mythos Atlas guide",
    subtitle: "Primordials, Titans and the 12 Olympians",
    description: guide?.description,
  });
}
