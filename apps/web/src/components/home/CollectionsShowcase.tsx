import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/section";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";

const featuredIds = [
  "trickster-gods",
  "underworld-rulers",
  "love-deities",
  "war-gods",
];

type CatalogDeity = (typeof deities)[number];

function membersOf(ids: string[]): CatalogDeity[] {
  return ids
    .map((id) => deities.find((d) => d.id === id || d.slug === id))
    .filter((d): d is CatalogDeity => d !== undefined);
}

/**
 * Archetypes across traditions, each shown by the faces in it: a strip of
 * portraits over the collection's name and count. Server-rendered.
 */
export function CollectionsShowcase() {
  const featured = featuredIds
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is (typeof collections)[0] => c !== undefined);

  return (
    <Section aria-labelledby="collections-title">
      <SectionHeading
        id="collections-title"
        eyebrow="Across pantheons"
        title="Themed collections"
        description="Archetypes that travel: tricksters, rulers of the dead, love and war, gathered for comparative reading."
        action={{
          href: "/paths#collections",
          label: `View all ${collections.length}`,
        }}
      />
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((collection) => {
          const members = membersOf(collection.deities);
          const portraits = members.filter((d) => d.imageUrl).slice(0, 4);
          return (
            <li key={collection.id}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span className="grid grid-cols-4 gap-1 overflow-hidden rounded-md ring-1 ring-border/70">
                  {portraits.map((deity) => (
                    <span
                      key={deity.id}
                      className="relative block aspect-[2/3] overflow-hidden bg-muted"
                    >
                      <Image
                        src={deity.imageUrl as string}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 4.5rem, (min-width: 640px) 12vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    </span>
                  ))}
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="font-serif text-xl font-semibold text-foreground group-hover:text-gold-text">
                    {collection.name}
                  </span>
                  <span className="shrink-0 text-[0.8125rem] text-muted-foreground">
                    {members.length}{" "}
                    {members.length === 1 ? "deity" : "deities"}
                  </span>
                </span>
                <span className="mt-1.5 line-clamp-2 block text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {collection.description}
                </span>
                <span className="mt-2 block text-[0.8125rem] text-muted-foreground">
                  {members
                    .slice(0, 4)
                    .map((d) => d.name)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
