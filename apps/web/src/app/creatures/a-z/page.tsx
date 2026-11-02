import type { Metadata } from "next";
import { AzIndex } from "@/components/layout/AzIndex";
import creatures from "@/data/creatures.json";
import { getPantheonShortNames } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythological Creatures A to Z",
  description:
    "Every creature and monster in the atlas in alphabetical order, with the tradition each belongs to. Jump to a letter to find a creature by name.",
  url: "/creatures/a-z",
  keywords: [
    "mythological creatures A to Z",
    "list of mythical creatures",
    "monsters alphabetical",
    "mythology index",
  ],
});

export default function CreaturesAzPage() {
  const traditions = getPantheonShortNames();

  return (
    <AzIndex
      title="Mythological Creatures A to Z"
      lede={`${creatures.length} creatures, listed by name.`}
      noun={{ one: "creature", many: "creatures" }}
      entries={creatures.map((creature) => ({
        name: creature.name,
        href: `/creatures/${creature.slug}`,
        meta: traditions[creature.pantheonId] ?? "",
      }))}
    />
  );
}
