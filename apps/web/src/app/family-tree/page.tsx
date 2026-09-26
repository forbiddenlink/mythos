import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getDeities, getPantheons, getRelationships } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { FamilyTreePageClient } from "./FamilyTreePageClient";

export default function Page() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Genealogies"
        mark="tree"
        title="Family Tree"
        lede="Trace who descends from whom, which marriages bind divine houses, and how power passes from the first beings to later gods."
      />

      <Container size="wide" className="pt-6 pb-4 md:pt-8">
        <FamilyTreePageClient
          pantheonsData={project(getPantheons(), ["id", "name"])}
          deitiesData={project(getDeities(), [
            "id",
            "name",
            "slug",
            "domain",
            "gender",
            "pantheonId",
            "imageUrl",
          ])}
          relationshipsData={getRelationships().map((r) => ({
            id: r.id,
            fromDeityId: r.fromDeityId,
            toDeityId: r.toDeityId,
            relationshipType: r.relationshipType,
            description: r.description ?? null,
          }))}
        />
      </Container>

      <AboutThisPage title="How to read the family tree" size="wide">
        <p>
          Family trees are one of the fastest ways to understand why myths
          branch the way they do. Switch pantheons to compare divine succession,
          marriage alliances, rival sibling lines, and the way heroic figures
          sit inside larger cosmic families. The family tree view works best for
          ancestry, while the network view makes it easier to spot clusters,
          loops, and cross-generational relationships at a glance.
        </p>
        <p>
          Use the tree when you want to answer concrete questions such as who
          descends from whom, which marriages bind different divine houses, and
          how power passes from primordial beings to later gods. Click a figure
          to open or close its branch, drag to pan and scroll to zoom; in the
          network view, drag figures to rearrange them and use the minimap for
          quick navigation.
        </p>
        <p>
          It also helps surface narrative context. Feuds, inheritances,
          rivalries, and alliances tend to make more sense once you can see the
          full shape of a family rather than reading each character in isolation
          from the surrounding lineage.
        </p>
        <p>
          Use the pantheon switcher to compare how different traditions organize
          divine authority. Some families center succession and inheritance,
          while others reveal looser networks of marriage, rivalry, and alliance
          that shape myth in a very different way.
        </p>
        <p>
          The view is especially helpful for comparative reading because it
          exposes repeated structures: sky fathers replacing earlier powers,
          sibling rivalries shaping succession, and marriages acting as
          political links between divine houses. Those patterns are difficult to
          spot when the same information is scattered across separate deity
          pages.
        </p>
        <p>
          Use this page as a map before and after deeper reading. Open the tree
          first to orient yourself, read a story or deity profile with that
          structure in mind, then return to the visualization to confirm how the
          narrative changed your understanding of the wider family.
        </p>
      </AboutThisPage>
    </div>
  );
}
