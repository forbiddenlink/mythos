import Link from "next/link";
import {
  Library,
  Sparkles,
  Skull,
  Heart,
  Swords,
  ArrowRight,
} from "lucide-react";
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

const iconMap: Record<string, React.ReactNode> = {
  "trickster-gods": <Sparkles className="h-5 w-5" />,
  "underworld-rulers": <Skull className="h-5 w-5" />,
  "love-deities": <Heart className="h-5 w-5" />,
  "war-gods": <Swords className="h-5 w-5" />,
};

// Rich, archetypal jewel-tones that rhyme with the pantheon cards — no pastels.
const colorMap: Record<string, string> = {
  "trickster-gods":
    "from-violet-900 via-indigo-950 to-midnight border-violet-700/40",
  "underworld-rulers":
    "from-slate-800 via-slate-950 to-midnight border-slate-600/40",
  "love-deities": "from-rose-900 via-red-950 to-midnight border-rose-700/40",
  "war-gods": "from-red-900 via-orange-950 to-midnight border-red-800/40",
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
    <section className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
            <Library className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold">
              Themed Collections
            </h2>
            <p className="text-sm text-muted-foreground">
              Deities grouped by role and archetype
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
                    <div className="flex size-9 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40 text-gold group-hover:bg-gold/25 transition-colors">
                      {iconMap[collection.id] || (
                        <Sparkles className="h-5 w-5" />
                      )}
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
