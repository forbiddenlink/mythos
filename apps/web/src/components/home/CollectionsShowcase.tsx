import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { Button } from "@/components/ui/button";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";

const featuredIds = [
  "trickster-gods",
  "underworld-rulers",
  "love-deities",
  "war-gods",
];

const markMap: Record<string, MythosMarkId> = {
  "trickster-gods": "staff",
  "underworld-rulers": "urn",
  "love-deities": "myrtle",
  "war-gods": "blade",
};

function getDeityCount(deityIds: string[]): number {
  return deityIds.filter((id) =>
    deities.some((d) => d.id === id || d.slug === id),
  ).length;
}

export function CollectionsShowcase() {
  const featured = featuredIds
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is (typeof collections)[0] => c !== undefined);

  return (
    <section className="relative py-20 md:py-24 noise-overlay">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-block text-gold text-sm tracking-[0.25em] uppercase mb-3 font-medium">
              Across pantheons
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Themed Collections
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Archetypes that travel — tricksters, underworld rulers, love, and
              war — grouped for comparative reading.
            </p>
          </div>
          <Link href="/collections">
            <Button
              variant="ghost"
              size="sm"
              className="text-gold-text hover:text-gold-text/80"
            >
              View all {collections.length}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <ol className="divide-y divide-border/70 border-y border-border/70">
          {featured.map((collection) => {
            const deityCount = getDeityCount(collection.deities);
            return (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-5 md:py-6"
                >
                  <div className="relative flex size-10 shrink-0 items-center justify-center border border-gold/35 bg-gold/10 text-gold group-hover:border-gold/55 transition-colors">
                    <MythosMark
                      id={markMap[collection.id] ?? "codex"}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                        {collection.name}
                      </h3>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {deityCount} {deityCount === 1 ? "deity" : "deities"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {collection.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
