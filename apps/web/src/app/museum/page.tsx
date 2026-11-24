import type { Metadata } from "next";
import Link from "next/link";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import creaturesData from "@/data/creatures.json";
import deitiesData from "@/data/deities.json";
import heroesData from "@/data/heroes.json";
import storiesData from "@/data/stories.json";
import { generateBaseMetadata } from "@/lib/metadata";
import { getAllMuseumObjects, type MuseumObject } from "@/lib/museum";
import {
  MuseumPageClient,
  type MuseumConnectedEntry,
  type MuseumGalleryItem,
} from "./MuseumPageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Museum Collection: Ancient & Reception Works",
  description:
    "Explore public-domain works from the Metropolitan Museum of Art that depict the deities, heroes, creatures and myths in Mythos Atlas, with ancient objects set ahead of later artistic reception.",
  url: "/museum",
});

interface NamedRef {
  id: string;
  slug: string;
  name: string;
}

interface StoryRef {
  id: string;
  slug: string;
  title: string;
}

const deityMap = new Map(
  (deitiesData as NamedRef[]).map((d) => [d.id, { slug: d.slug, name: d.name }]),
);
const heroMap = new Map(
  (heroesData as NamedRef[]).map((h) => [h.id, { slug: h.slug, name: h.name }]),
);
const creatureMap = new Map(
  (creaturesData as NamedRef[]).map((c) => [
    c.id,
    { slug: c.slug, name: c.name },
  ]),
);
const storyMap = new Map(
  (storiesData as StoryRef[]).map((s) => [
    s.id,
    { slug: s.slug, name: s.title },
  ]),
);

function resolveConnectedEntries(object: MuseumObject): MuseumConnectedEntry[] {
  const entries: MuseumConnectedEntry[] = [];
  for (const id of object.deityIds ?? []) {
    const found = deityMap.get(id);
    if (found) {
      entries.push({
        href: `/deities/${found.slug}`,
        label: found.name,
        kind: "Deity",
      });
    }
  }
  for (const id of object.heroIds ?? []) {
    const found = heroMap.get(id);
    if (found) {
      entries.push({
        href: `/heroes/${found.slug}`,
        label: found.name,
        kind: "Hero",
      });
    }
  }
  for (const id of object.creatureIds ?? []) {
    const found = creatureMap.get(id);
    if (found) {
      entries.push({
        href: `/creatures/${found.slug}`,
        label: found.name,
        kind: "Creature",
      });
    }
  }
  for (const id of object.storyIds ?? []) {
    const found = storyMap.get(id);
    if (found) {
      entries.push({
        href: `/stories/${found.slug}`,
        label: found.name,
        kind: "Story",
      });
    }
  }
  return entries;
}

export default function MuseumPage() {
  const objects = getAllMuseumObjects();
  const items: MuseumGalleryItem[] = objects.map((object) => ({
    object,
    connectedEntries: resolveConnectedEntries(object),
  }));

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Museum Collection: Ancient & Reception Works"
        description="Public-domain works from the Metropolitan Museum of Art that depict the deities, heroes, creatures and stories in Mythos Atlas."
        url="/museum"
        numberOfItems={items.length}
      />
      <PageHero
        mark="temple"
        tagline="In the museums"
        title="Museum Collection"
        description="Public-domain works from the Metropolitan Museum of Art that depict the figures and myths in this atlas, with ancient objects made within each tradition set ahead of later artistic reception."
        count={`${items.length} objects`}
        backgroundImage="/artifacts-hero.webp"
        backgroundAlt="Ancient sculptures and museum artifacts"
      />
      <Container className="pt-6 pb-16 md:pt-8">
        <MuseumPageClient items={items} />
      </Container>
      <AboutThisPage title="About the museum collection">
        <p>
          Every work in this gallery is a documented object in the public-domain
          open-access program of the Metropolitan Museum of Art, verified by
          accession number and curator credit. Unlike the project&apos;s own
          illustrations and engraved archival plates, these photographs show real
          bronzes, marble reliefs, manuscripts, vessels, and ceremonial objects.
        </p>
        <p>
          Works are grouped into three historical contexts: <em>Ancient object</em>{" "}
          (made within the historical culture that worshipped or told the myth),{" "}
          <em>Later depiction</em> (later works created inside the continuing
          tradition, such as Edo woodblocks or Rajput manuscripts), and{" "}
          <em>Later European depiction</em> (Renaissance through nineteenth-century
          reception). You can also browse how the atlas distinguishes real objects
          from illustrations on the <Link href="/sources">Sources</Link> page.
        </p>
      </AboutThisPage>
    </div>
  );
}
