import type { Metadata } from "next";
import { AzIndex } from "@/components/layout/AzIndex";
import locations from "@/data/locations.json";
import { getPantheonShortNames } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythological Places A to Z",
  description:
    "Every sacred site and mythic place in the atlas in alphabetical order, with the tradition each belongs to. Jump to a letter to find a place by name.",
  url: "/locations/a-z",
  keywords: [
    "mythological places A to Z",
    "list of mythological places",
    "sacred sites alphabetical",
    "mythology index",
  ],
});

export default function LocationsAzPage() {
  const traditions = getPantheonShortNames();

  return (
    <AzIndex
      title="Mythological Places A to Z"
      lede={`${locations.length} places, listed by name.`}
      noun={{ one: "place", many: "places" }}
      entries={locations.map((location) => ({
        name: location.name,
        href: `/locations/${location.id}`,
        meta: traditions[location.pantheonId] ?? "",
      }))}
    />
  );
}
