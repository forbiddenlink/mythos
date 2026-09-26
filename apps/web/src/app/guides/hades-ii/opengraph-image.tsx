import { getGuide } from "@/lib/guides";
import { renderOgCard } from "@/lib/og/card";

export const alt = "Who's who in Hades II mythology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const guide = getGuide("hades-ii");
  return renderOgCard({
    eyebrow: "Guide · Game vs myth",
    title: guide?.shortTitle ?? "Mythos Atlas guide",
    subtitle: "Melinoë, Hecate, Chronos and the children of Night",
    description: guide?.description,
  });
}
