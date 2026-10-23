import { getGuide } from "@/lib/guides";
import { renderOgCard } from "@/lib/og/card";

export const alt = "Valhalla versus Folkvangr in the Norse sources";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const guide = getGuide("valhalla-vs-folkvangr");
  return renderOgCard({
    eyebrow: "Guide · The Eddas",
    title: guide?.shortTitle ?? "Mythos Atlas guide",
    subtitle: "Who goes where, and what the sources leave unsaid",
    description: guide?.description,
  });
}
