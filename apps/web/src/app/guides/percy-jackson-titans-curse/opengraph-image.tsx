import { getGuide } from "@/lib/guides";
import { renderOgCard } from "@/lib/og/card";

export const alt = "The myths behind Percy Jackson: The Titan's Curse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const guide = getGuide("percy-jackson-titans-curse");
  return renderOgCard({
    eyebrow: "Guide · Book vs myth",
    title: guide?.shortTitle ?? "Mythos Atlas guide",
    subtitle: "What Riordan took from Greek myth, and what he invented",
    description: guide?.description,
  });
}
