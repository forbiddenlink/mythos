import type { Metadata } from "next";
import { AzIndex } from "@/components/layout/AzIndex";
import artifacts from "@/data/artifacts.json";
import { getPantheonShortNames } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythological Artifacts A to Z",
  description:
    "Every relic and divine artifact in the atlas in alphabetical order, with the tradition each belongs to. Jump to a letter to find an artifact by name.",
  url: "/artifacts/a-z",
  keywords: [
    "mythological artifacts A to Z",
    "list of mythical weapons",
    "divine relics alphabetical",
    "mythology index",
  ],
});

export default function ArtifactsAzPage() {
  const traditions = getPantheonShortNames();

  return (
    <AzIndex
      title="Mythological Artifacts A to Z"
      lede={`${artifacts.length} artifacts, listed by name.`}
      noun={{ one: "artifact", many: "artifacts" }}
      entries={artifacts.map((artifact) => ({
        name: artifact.name,
        href: `/artifacts/${artifact.slug}`,
        meta: traditions[artifact.pantheonId] ?? "",
      }))}
    />
  );
}
