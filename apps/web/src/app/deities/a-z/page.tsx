import type { Metadata } from "next";
import { AzIndex } from "@/components/layout/AzIndex";
import { getDeityListItems, getPantheonShortNames } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Gods and Goddesses A to Z",
  description:
    "Every deity in the atlas in alphabetical order, with the tradition each belongs to. Jump to a letter to find a god or goddess by name.",
  url: "/deities/a-z",
  keywords: [
    "gods A to Z",
    "list of gods and goddesses",
    "deities alphabetical",
    "mythology index",
  ],
});

export default function DeitiesAzPage() {
  const deities = getDeityListItems();
  const traditions = getPantheonShortNames();

  return (
    <AzIndex
      title="Gods and Goddesses A to Z"
      lede={`${deities.length} deities, listed by name.`}
      noun={{ one: "deity", many: "deities" }}
      entries={deities.map((deity) => ({
        name: deity.name,
        href: `/deities/${deity.slug}`,
        meta: traditions[deity.pantheonId] ?? "",
      }))}
    />
  );
}
