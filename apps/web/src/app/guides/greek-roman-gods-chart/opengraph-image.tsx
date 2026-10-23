import { getGuide } from "@/lib/guides";
import { renderOgCard } from "@/lib/og/card";

export const alt = "Greek and Roman gods name chart";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const guide = getGuide("greek-roman-gods-chart");
  return renderOgCard({
    eyebrow: "Guide · Greece and Rome",
    title: guide?.shortTitle ?? "Mythos Atlas guide",
    subtitle: "Every pair, with what Rome changed",
    description: guide?.description,
  });
}
