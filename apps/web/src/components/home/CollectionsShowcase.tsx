import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";

// Show 4 featured collections
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

/* Archetypal jewel tones from the classical system — no violet/SaaS purple */
const colorMap: Record<string, string> = {
  "trickster-gods":
    "from-[oklch(0.32_0.06_85)] via-[oklch(0.22_0.04_70)] to-midnight border-gold/35",
  "underworld-rulers":
    "from-[oklch(0.28_0.03_260)] via-[oklch(0.18_0.02_260)] to-midnight border-parchment/20",
  "love-deities":
    "from-[oklch(0.35_0.08_25)] via-[oklch(0.22_0.06_20)] to-midnight border-bronze/40",
  "war-gods":
    "from-[oklch(0.32_0.1_40)] via-[oklch(0.2_0.06_35)] to-midnight border-bronze/45",
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
    <section className="container mx-auto max-w-7xl px-4 py-20 md:py-24">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <MythosMark id="codex" className="h-5 w-5 text-gold" />
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-pretty">
              Themed Collections
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Deities grouped by role and archetype across pantheons
            </p>
          </div>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((collection) => {
          const deityCount = getDeityCount(collection.deities);

          return (
            <Link key={collection.id} href={`/collections/${collection.slug}`}>
              <Card
                className={`h-full overflow-hidden border shadow-none bg-gradient-to-br ${colorMap[collection.id] || ""} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 cursor-pointer group`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex size-9 items-center justify-center border border-gold/40 bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                      <MythosMark
                        id={markMap[collection.id] ?? "codex"}
                        className="h-5 w-5"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-parchment group-hover:text-gold transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-xs uppercase tracking-wider text-parchment/60">
                        {deityCount} {deityCount === 1 ? "deity" : "deities"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-parchment/75 line-clamp-2">
                    {collection.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
