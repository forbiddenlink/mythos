import { CatalogGallery } from "@/components/entities/CatalogGallery";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { getPantheonShortNames } from "@/lib/data/catalog";
import artifactsData from "@/data/artifacts.json";

interface ArtifactRecord {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  ownerId?: string;
  ownerLabel?: string;
  type: string;
  description: string;
  powers: string[];
  imageUrl: string | null;
}

const artifacts = artifactsData as ArtifactRecord[];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** "Weapon and fishhook" → "weapon"; rare types group under "other". */
const MAIN_TYPES = new Set([
  "weapon",
  "armor",
  "tool",
  "vessel",
  "jewelry",
  "vehicle",
  "relic",
  "staff",
]);
function typeGroup(type: string): string {
  const first = type.split(" ")[0].toLowerCase();
  return MAIN_TYPES.has(first) ? first : "other";
}

// Card and table fields only; biographies and sources stay on the server.
const items = artifacts.map((artifact) => ({
  id: artifact.id,
  slug: artifact.slug,
  name: artifact.name,
  pantheonId: artifact.pantheonId,
  description: artifact.description,
  imageUrl: artifact.imageUrl,
  subtitle: artifact.powers[0],
  badge: capitalize(artifact.type),
  facet: typeGroup(artifact.type),
  cells: [
    capitalize(artifact.type),
    artifact.ownerLabel ?? capitalize(artifact.ownerId ?? "—"),
  ],
}));

export default function ArtifactsPage() {
  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Legendary Artifacts"
        description="Weapons, shields, and mystical objects of power wielded by gods and heroes"
        url="/artifacts"
        numberOfItems={artifacts.length}
      />
      <PageHero
        mark="relic"
        tagline="The Arsenal"
        title="Legendary Artifacts"
        description="Weapons, shields and objects of power wielded by the gods and heroes of old."
        colorScheme="purple"
        backgroundImage="/deities-list-hero.jpg"
        backgroundAlt="Relics and divine artifacts of ancient myth"
      />
      <Container className="pt-6 pb-12 md:pt-8">
        <CatalogGallery
          items={items}
          traditionNames={getPantheonShortNames()}
          basePath="/artifacts"
          noun="artifacts"
          searchLabel="Search artifacts"
          facetLabel="Types"
          columns={["Type", "Owner"]}
        />
      </Container>
      <AboutThisPage title="About the artifacts">
        <p>
          Mythic artifacts matter because they carry ownership, symbolism, and
          narrative consequences. Use this catalog to compare how different
          traditions imagine divine power through weapons, relics, armor, and
          sacred tools. The table view is best for scanning object types and
          owners, while the card view is better for browsing. Open an artifact
          entry when you want its origin, powers, and the heroes or gods most
          closely tied to it.
        </p>
      </AboutThisPage>
    </div>
  );
}
