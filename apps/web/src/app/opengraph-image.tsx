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
    image: "/deities/zeus.jpg",
    eyebrow: "Interactive Encyclopedia",
    title: "Mythos Atlas",
    subtitle: `${traditions} traditions · ${deities} deities · ${stories} stories`,
    description: `Explore the gods, myths, and ${places} sacred places of world mythology, with family trees, maps and the sources behind each story.`,
  });
}
