import { AetherMap } from "@/components/atlas/AetherMap";
import {
  AtlasTraditionGrid,
  type AtlasGridTradition,
} from "@/components/atlas/AtlasTraditionGrid";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { computeAtlasLayout } from "@/lib/atlas-layout";
import {
  getDeities,
  getPantheons,
  getRelationships,
  getTraditionCount,
} from "@/lib/data/catalog";
import { getImageProvenance } from "@/lib/image-provenance";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "The Aether Map - Every God, One Sky",
  description: `An interactive 3D star map of deities across ${getTraditionCount()} traditions, connected by their relationships. Explore world mythology as a living cosmos.`,
  url: "/atlas",
  keywords: [
    "mythology map",
    "interactive mythology",
    "pantheon constellation",
    "deity relationships",
    "3D mythology",
    "comparative mythology",
  ],
});

function traditionsForGrid(): AtlasGridTradition[] {
  const deities = getDeities();
  const pantheons = getPantheons();
  const byId = new Map(pantheons.map((p) => [p.id, p]));
  const ids = [...new Set(deities.map((d) => d.pantheonId))];
  return ids
    .map((id) => {
      const pantheon = byId.get(id);
      const figures = deities
        .filter((d) => d.pantheonId === id)
        .toSorted(
          (a, b) =>
            (a.importanceRank ?? 99) - (b.importanceRank ?? 99) ||
            a.name.localeCompare(b.name),
        )
        .map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          // Portraits only: procedural plates are stand-ins, not showcase art.
          imageUrl:
            d.imageUrl &&
            getImageProvenance("deity", d.id)?.kind !==
              "illustration-procedural"
              ? d.imageUrl
              : undefined,
        }));
      return {
        id,
        name:
          pantheon?.name.replace(/ Pantheon$/, "") ??
          id.replace(/-pantheon$/, ""),
        slug: pantheon?.slug,
        figures,
      };
    })
    .toSorted((a, b) => b.figures.length - a.figures.length);
}

export default function AtlasPage() {
  const deities = getDeities();
  const traditions = traditionsForGrid();
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="The Aether Map"
        mark="constellation"
        title="Every god, one sky"
        lede="Stars are deities, sized by importance and coloured by tradition; the threads between them are their relationships."
        count={`${deities.length} deities · ${traditions.length} traditions`}
      />

      <Container size="wide" className="pt-6 md:pt-8">
        <AetherMap layout={computeAtlasLayout(deities, getRelationships())} />
      </Container>

      <Container
        as="section"
        size="wide"
        aria-labelledby="atlas-index-title"
        className="section-space"
      >
        <div className="mb-10 max-w-3xl">
          <p className="type-eyebrow mb-2">Every star, by tradition</p>
          <h2
            id="atlas-index-title"
            className="page-section-title text-foreground"
          >
            The figures on the map
          </h2>
          <p className="type-lede mt-2 text-muted-foreground">
            The leading figures of each tradition, then everyone else in the
            sky. Traditions are ordered by how many figures the atlas records.
          </p>
        </div>
        <AtlasTraditionGrid traditions={traditions} />
      </Container>
    </div>
  );
}
