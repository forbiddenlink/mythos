import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { generateBaseMetadata } from "@/lib/metadata";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import objects from "@/data/museum-objects.json";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Collections",
  description:
    "Explore curated collections of deities and myths across cultures. Discover trickster gods, underworld rulers, creation myths, and more thematic groupings.",
  url: "/collections",
  keywords: [
    "mythology collections",
    "deity themes",
    "trickster gods",
    "creation myths",
    "mythological archetypes",
    "comparative mythology",
  ],
});

function getCollectionStats(collection: (typeof collections)[0]): string {
  const deityCount = collection.deities.filter((id) =>
    deities.some((d) => d.id === id || d.slug === id),
  ).length;
  const storyCount = collection.stories.filter((id) =>
    stories.some((s) => s.id === id || s.slug === id),
  ).length;
  return [
    deityCount > 0
      ? `${deityCount} ${deityCount === 1 ? "deity" : "deities"}`
      : null,
    storyCount > 0
      ? `${storyCount} ${storyCount === 1 ? "story" : "stories"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function CollectionsPage() {
  const featured = collections.find(
    (collection) => collection.slug === "underworld-rulers",
  );
  const object = objects.find((item) => item.id === "met-545802");
  const remaining = collections.filter((collection) => collection !== featured);

  return (
    <div className="min-h-screen bg-mythic">
      <div className="page-shell">
        <Breadcrumbs />
        <header className="mb-8 mt-6">
          <p className="mb-3 text-sm uppercase tracking-widest text-gold-text">
            Explore by theme
          </p>
          <h1 className="page-title text-foreground">
            Mythological Collections
          </h1>
          <p className="mt-4 max-w-2xl font-body text-xl leading-relaxed text-muted-foreground">
            Follow a question across traditions: who guards the dead, who brings
            fire, who breaks the rules? Begin with a theme and explore the
            stories behind it.
          </p>
        </header>

        {featured && (
          <section
            aria-labelledby="featured-collection"
            className="mb-12 grid gap-6 border-y border-border py-6 md:grid-cols-3 md:gap-10"
          >
            <div className="self-center md:col-span-2">
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                Begin here · {getCollectionStats(featured)}
              </p>
              <h2 id="featured-collection" className="page-section-title">
                <Link
                  href={`/collections/${featured.slug}`}
                  className="text-foreground underline decoration-gold/40 underline-offset-8 hover:text-gold-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {featured.name}
                </Link>
              </h2>
              <p className="mt-5 max-w-xl font-body text-xl leading-relaxed text-muted-foreground">
                Meet Osiris, Hel, Hades and other figures associated with the
                dead. Compare their roles while keeping each tradition’s stories
                and beliefs in view.
              </p>
              <Link
                href={`/collections/${featured.slug}`}
                className="mt-5 inline-flex min-h-11 items-center gap-3 font-medium text-gold-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Explore {featured.name}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            {object?.imageUrl && object.imageAlt && (
              <figure className="min-w-0 border-l border-border pl-5">
                <div className="relative h-48 bg-muted/30 md:h-56">
                  <Image
                    src={object.imageUrl}
                    alt={object.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain p-3"
                    unoptimized
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="block font-medium text-foreground">
                    {object.title} · {object.date}
                  </span>
                  {object.medium}.{" "}
                  <a
                    href={object.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {object.institution}, {object.accessionNumber}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .<span className="block">{object.imageRights}</span>
                </figcaption>
              </figure>
            )}
          </section>
        )}

        <section aria-labelledby="more-collections">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="more-collections" className="page-section-title">
              {featured ? "More themes to follow" : "Choose a theme"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {collections.length} collections
            </p>
          </div>
          <ul className="grid gap-x-12 md:grid-cols-2">
            {remaining.map((collection, index) => (
              <li key={collection.id} className="border-t border-border">
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group flex h-full gap-4 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <span
                    aria-hidden="true"
                    className="pt-1 text-xs text-muted-foreground"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl text-foreground group-hover:text-gold-text">
                      {collection.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {collection.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {getCollectionStats(collection)}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-gold-text"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
            These collections bring related subjects together. A similar role
            does not by itself mean two figures share an origin or were
            historically identified with one another.
          </p>
        </section>
      </div>
    </div>
  );
}
