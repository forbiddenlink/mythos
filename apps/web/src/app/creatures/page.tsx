import Link from "next/link";
import { CatalogGallery } from "@/components/entities/CatalogGallery";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { getPantheonShortNames } from "@/lib/data/catalog";
import { getCreatureHubs } from "@/lib/pantheon-hubs";
import creaturesData from "@/data/creatures.json";

interface CreatureRecord {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  habitat: string;
  dangerLevel: number;
  description: string;
  imageUrl: string | null;
}

const creatures = creaturesData as CreatureRecord[];

function threatBand(level: number): string {
  if (level >= 9) return "Catastrophic";
  if (level >= 7) return "Deadly";
  return "Perilous";
}

// Card and table fields only; biographies and sources stay on the server.
const items = creatures.map((creature) => ({
  id: creature.id,
  slug: creature.slug,
  name: creature.name,
  pantheonId: creature.pantheonId,
  description: creature.description,
  imageUrl: creature.imageUrl,
  subtitle: creature.habitat,
  badge: `Danger ${creature.dangerLevel}/10`,
  facet: threatBand(creature.dangerLevel),
  cells: [creature.habitat, `${creature.dangerLevel}/10`],
}));

export default function CreaturesPage() {
  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Creatures & Monsters"
        description="Legendary beasts and mythological creatures from ancient mythology"
        url="/creatures"
        numberOfItems={creatures.length}
      />
      <PageHero
        mark="serpent"
        tagline="The Bestiary"
        title="Creatures & Monsters"
        description="Guardians, monsters and shape-shifters from the underworld to the mountain peaks."
        colorScheme="red"
        backgroundImage="/creatures-hero.webp"
        backgroundAlt="Mythic creatures and legendary beasts"
      />
      <Container className="pt-6 pb-12 md:pt-8">
        <CatalogGallery
          items={items}
          traditionNames={getPantheonShortNames()}
          basePath="/creatures"
          noun="creatures"
          searchLabel="Search creatures"
          facetLabel="Threats"
          facetOrder={["Catastrophic", "Deadly", "Perilous"]}
          columns={["Habitat", "Danger"]}
        />
      </Container>
      <Container className="pb-12">
        <nav aria-labelledby="creatures-by-tradition">
          <h2 id="creatures-by-tradition" className="page-section-title">
            Creatures by tradition
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {getCreatureHubs().map((hub) => (
              <li key={hub.tradition.slug}>
                <Link
                  href={`/pantheons/${hub.tradition.slug}/creatures`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 type-ui text-foreground transition-colors hover:border-gold/60 hover:text-gold-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {hub.tradition.shortName}
                  <span className="text-muted-foreground tabular-nums">
                    {hub.creatures.length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <AboutThisPage title="About the bestiary">
        <p>
          Mythological creatures often repeat the same narrative jobs across
          cultures: guarding thresholds, testing heroes, embodying chaos, or
          enforcing divine punishment. Use the grid view when you want quick
          visual recognition, then switch to the table when you want to scan
          habitats, danger levels, and recurring creature types side by side.
          The detailed entries connect each beast back to the myths and deities
          that give it meaning.
        </p>
      </AboutThisPage>
    </div>
  );
}
