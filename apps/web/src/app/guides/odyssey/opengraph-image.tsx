import { getGuide } from "@/lib/guides";
import { renderOgCard } from "@/lib/og/card";

export const alt = "A guide to Homer's Odyssey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const guide = getGuide("odyssey");
  return renderOgCard({
    eyebrow: "Guide · Homer",
    title: guide?.shortTitle ?? "Mythos Atlas guide",
    subtitle: "The route, the 24 books, and the cast",
    description: guide?.description,
  });
}
