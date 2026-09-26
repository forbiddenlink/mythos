import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getDeities, getPantheons, getRelationships } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { KnowledgeGraphPageClient } from "./KnowledgeGraphPageClient";

export default function Page() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Connections"
        mark="constellation"
        title="Knowledge Graph"
        lede="Parentage, marriage, rivalry and cross-pantheon parallels for every deity in the atlas, in one interactive network."
      />

      <Container size="wide" className="pt-6 pb-4 md:pt-8">
        <KnowledgeGraphPageClient
          deitiesData={project(getDeities(), [
            "id",
            "name",
            "slug",
            "pantheonId",
            "alternateNames",
            "domain",
            "gender",
            "importanceRank",
            "imageUrl",
            "crossPantheonParallels",
          ])}
          relationshipsData={project(getRelationships(), [
            "id",
            "fromDeityId",
            "toDeityId",
            "relationshipType",
            "description",
          ])}
          pantheonsData={project(getPantheons(), ["id", "name", "slug"])}
        />
      </Container>

      <AboutThisPage title="How to use the knowledge graph" size="wide">
        <p>
          The knowledge graph maps parentage, marriage, rivalry, and
          cross-pantheon parallels in one interactive view. Instead of reading
          mythological figures one at a time, you can trace how whole divine
          networks connect across traditions and across time.
        </p>
        <p>
          Drag to pan and scroll to zoom. Click a deity to open their profile,
          or switch on explore mode to focus a figure&apos;s neighbourhood.
          Filters show or hide pantheons and relationship types, the layout
          button cycles between cluster, radial and grid arrangements, and the
          list beside the graph reaches every figure from the keyboard.
        </p>
        <p>
          Use the controls to isolate a single culture or keep multiple
          pantheons visible when you want to compare recurring archetypes,
          contested lineages, or equivalent gods that appear under different
          names in different civilizations. The golden threads are
          cross-pantheon parallels: similar gods with shared attributes or
          roles, such as Zeus, Jupiter and Odin, or Aphrodite, Venus and Freyja.
        </p>
        <p>
          The graph is most useful when you alternate between overview and
          detail: scan the network to see which figures cluster together, then
          open individual deity pages to confirm why a connection exists and
          what makes it mythologically significant.
        </p>
        <p>
          For comparative work, start narrow with one pantheon, then widen the
          filter to watch parallel figures appear. That shift reveals which
          relationships are internal to one tradition and which ones reflect a
          larger pattern that repeats across cultures.
        </p>
        <p>
          If you are using the graph for research or teaching, treat it as a
          navigation layer rather than a final answer. The strongest use case is
          spotting a connection here, then opening the relevant deity pages and
          source notes to confirm what kind of relationship the graph is
          actually showing.
        </p>
      </AboutThisPage>
    </div>
  );
}
