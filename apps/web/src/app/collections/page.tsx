import { Metadata } from "next";
import Link from "next/link";
import {
  Library,
  Sparkles,
  Skull,
  CloudLightning,
  Heart,
  Swords,
  Sun,
  Waves,
  BookOpen,
  Droplets,
  Leaf,
  Hammer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { generateBaseMetadata } from "@/lib/metadata";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";

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

type IconComponent = typeof Sparkles;

const iconMap: Record<string, IconComponent> = {
  sparkles: Sparkles,
  skull: Skull,
  "cloud-lightning": CloudLightning,
  heart: Heart,
  sword: Swords,
  sun: Sun,
  waves: Waves,
  "book-open": BookOpen,
  droplets: Droplets,
  leaf: Leaf,
  hammer: Hammer,
};

const themeColors: Record<string, string> = {
  chaos: "from-purple-500/20 to-violet-600/20 border-purple-500/30",
  death: "from-slate-500/20 to-gray-600/20 border-slate-500/30",
  sky: "from-blue-500/20 to-cyan-600/20 border-blue-500/30",
  love: "from-pink-500/20 to-rose-600/20 border-pink-500/30",
  war: "from-red-500/20 to-orange-600/20 border-red-500/30",
  sun: "from-yellow-500/20 to-amber-600/20 border-yellow-500/30",
  water: "from-cyan-500/20 to-blue-600/20 border-cyan-500/30",
  wisdom: "from-indigo-500/20 to-blue-600/20 border-indigo-500/30",
  creation: "from-gold/20 to-amber-600/20 border-gold/30",
  flood: "from-teal-500/20 to-cyan-600/20 border-teal-500/30",
  earth: "from-green-500/20 to-emerald-600/20 border-green-500/30",
  craft: "from-orange-500/20 to-amber-600/20 border-orange-500/30",
};

function getCollectionStats(collection: (typeof collections)[0]) {
  const validDeities = collection.deities.filter((id) =>
    deities.some((d) => d.id === id || d.slug === id),
  );
  const validStories = collection.stories.filter((id) =>
    stories.some((s) => s.id === id || s.slug === id),
  );
  return { deityCount: validDeities.length, storyCount: validStories.length };
}

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Library className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Mythological Collections
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated groupings of deities and stories that span cultures and
            reveal universal themes in human mythology
          </p>
        </div>

        <section className="mb-10 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Use Collections To Compare Motifs Quickly
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Collections gather figures and myths by shared role rather than by
            one civilization at a time. That makes them useful when you want to
            compare archetypes such as tricksters, underworld rulers, war gods,
            creators, or flood narratives without building the list yourself.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Start with a theme, open two or three linked entries, and then jump
            outward into the full deity or story pages for context. It is a
            faster way to notice recurring patterns across traditions before you
            return to the deeper source and pantheon material.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const Icon = iconMap[collection.icon] || Sparkles;
            const colors =
              themeColors[collection.theme] || themeColors.creation;
            const stats = getCollectionStats(collection);

            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
              >
                <Card
                  className={`h-full bg-gradient-to-br ${colors} hover:scale-[1.02] transition-transform cursor-pointer group`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-background/50 border border-border/50 group-hover:bg-background/70 transition-colors">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div className="flex gap-2">
                        {stats.deityCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.deityCount}{" "}
                            {stats.deityCount === 1 ? "deity" : "deities"}
                          </Badge>
                        )}
                        {stats.storyCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.storyCount}{" "}
                            {stats.storyCount === 1 ? "story" : "stories"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="font-serif text-xl mt-3 group-hover:text-gold transition-colors">
                      {collection.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {collection.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
