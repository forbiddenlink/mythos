import { renderOgCard } from "@/lib/og/card";
import { getDeities, getTraditionCount } from "@/lib/data/catalog";
import storiesData from "@/data/stories.json";
import locationsData from "@/data/locations.json";

export const runtime = "nodejs";
export const alt = "Mythos Atlas: World Mythology Encyclopedia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const traditions = getTraditionCount();
  const deities = getDeities().length;
  const stories = (storiesData as unknown[]).length;
  const places = (locationsData as unknown[]).length;

  return renderOgCard({
    eyebrow: "Interactive Encyclopedia",
    title: "Mythos Atlas",
    subtitle: `${traditions} Traditions · ${deities} Deities · ${stories} Stories · ${places} Places`,
    description: `Explore the gods, myths, and sacred places of world mythology across ${traditions} ancient civilizations with interactive family trees and maps.`,
  });
}
