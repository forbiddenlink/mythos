import { renderOgCard } from "@/lib/og/card";

export const alt = "Mythos Atlas guides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Guides",
    title: "Read the myths behind the story",
    subtitle: "Homer · Percy Jackson · Hades II",
    description:
      "Epics, novels and games, set beside the ancient sources they draw on.",
  });
}
