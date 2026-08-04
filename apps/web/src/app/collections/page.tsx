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
import { SimplePageHeader } from "@/components/layout/simple-page-header";
import { pageSectionTitleClass } from "@/components/layout/page-typography";
import { generateBaseMetadata } from "@/lib/metadata";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import { cn } from "@/lib/utils";

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
  chaos: "from-bronze/20 to-gold/10 border-bronze/35",
  death: "from-midnight/20 to-muted/30 border-foreground/20",
  sky: "from-patina/20 to-midnight/10 border-patina/35",
  love: "from-bronze/20 to-destructive/10 border-bronze/35",
  war: "from-destructive/15 to-bronze/15 border-destructive/30",
  sun: "from-gold/20 to-bronze/15 border-gold/35",
  water: "from-patina/20 to-patina/5 border-patina/30",
  wisdom: "from-midnight/15 to-gold/10 border-gold/25",
  creation: "from-gold/20 to-bronze/15 border-gold/30",
  flood: "from-patina/15 to-midnight/10 border-patina/30",
  earth: "from-bronze/20 to-patina/10 border-bronze/30",
  craft: "from-bronze/20 to-gold/10 border-bronze/35",
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
      <div className="page-shell">
        <Breadcrumbs />

        <SimplePageHeader
          mark="codex"
          tagline="Across pantheons"
          title="Mythological Collections"
          description="Curated groupings of deities and stories that span cultures and reveal universal themes in human mythology"
        />

        <section className="mb-10 rounded-xl border border-border/60 bg-card/60 p-6">
          <h2 className={cn(pageSectionTitleClass, "text-foreground")}>
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
