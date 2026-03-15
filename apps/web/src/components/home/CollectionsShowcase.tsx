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

const colorMap: Record<string, string> = {
  "trickster-gods": "from-purple-500/20 to-violet-600/20 border-purple-500/30",
  "underworld-rulers": "from-slate-500/20 to-gray-600/20 border-slate-500/30",
  "love-deities": "from-pink-500/20 to-rose-600/20 border-pink-500/30",
  "war-gods": "from-red-500/20 to-orange-600/20 border-red-500/30",
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
                className={`h-full bg-gradient-to-br ${colorMap[collection.id] || ""} hover:scale-[1.02] transition-transform cursor-pointer group`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-background/50 border border-border/50 group-hover:bg-background/70 transition-colors">
                      {iconMap[collection.id] || (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold group-hover:text-gold transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {deityCount} {deityCount === 1 ? "deity" : "deities"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
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
