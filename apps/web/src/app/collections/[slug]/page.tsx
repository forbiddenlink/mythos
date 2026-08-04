import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
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
  ScrollText,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { RosettaWheel } from "@/components/collections/RosettaWheel";
import collections from "@/data/collections.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";

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

/* Classical atlas palette — gold, bronze, patina, parchment, wine — not rainbow SaaS chips */
const themeColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  chaos: {
    bg: "from-bronze/15 to-gold/5",
    border: "border-bronze/35",
    text: "text-bronze",
  },
  death: {
    bg: "from-midnight/20 to-muted/40",
    border: "border-foreground/20",
    text: "text-muted-foreground",
  },
  sky: {
    bg: "from-patina/15 to-midnight/10",
    border: "border-patina/35",
    text: "text-patina",
  },
  love: {
    bg: "from-[oklch(0.45_0.1_25)]/15 to-bronze/10",
    border: "border-bronze/35",
    text: "text-bronze",
  },
  war: {
    bg: "from-destructive/10 to-bronze/10",
    border: "border-destructive/30",
    text: "text-destructive",
  },
  sun: {
    bg: "from-gold/15 to-bronze/10",
    border: "border-gold/35",
    text: "text-gold-text",
  },
  water: {
    bg: "from-patina/15 to-patina/5",
    border: "border-patina/30",
    text: "text-patina",
  },
  wisdom: {
    bg: "from-midnight/15 to-gold/5",
    border: "border-gold/25",
    text: "text-gold-text",
  },
  creation: {
    bg: "from-gold/10 to-bronze/10",
    border: "border-gold/30",
    text: "text-gold-text",
  },
  flood: {
    bg: "from-patina/12 to-midnight/10",
    border: "border-patina/30",
    text: "text-patina",
  },
  earth: {
    bg: "from-bronze/15 to-patina/10",
    border: "border-bronze/30",
    text: "text-bronze",
  },
  craft: {
    bg: "from-bronze/15 to-gold/10",
    border: "border-bronze/35",
    text: "text-bronze",
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    return generateNotFoundMetadata(
      "Collection Not Found",
      "The requested collection could not be found.",
    );
  }

  return generateBaseMetadata({
    title: `${collection.name} Collection`,
    description:
      `${collection.description} See related deities, myths, and themes in this Mythos Atlas guide.`.slice(
        0,
        158,
      ),
    url: `/collections/${slug}`,
    keywords: [
      collection.name,
      "mythology",
      "deities",
      "myths",
      collection.theme,
    ],
  });
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const Icon = iconMap[collection.icon] || Sparkles;
  const colors = themeColors[collection.theme] || themeColors.creation;

  // Get actual deity and story data
  const collectionDeities = collection.deities
    .map((id) => deities.find((d) => d.id === id || d.slug === id))
    .filter((d): d is (typeof deities)[0] => d !== undefined);

  const collectionStories = collection.stories
    .map((id) => stories.find((s) => s.id === id || s.slug === id))
    .filter((s): s is (typeof stories)[0] => s !== undefined);

  const listItems = [
    ...collectionDeities.map((deity, index) => ({
      name: deity.name,
      url: `/deities/${deity.slug}`,
      position: index + 1,
    })),
    ...collectionStories.map((story, index) => ({
      name: story.title,
      url: `/stories/${story.slug}`,
      position: collectionDeities.length + index + 1,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <ItemListJsonLd
        name={`${collection.name} Collection`}
        description={collection.description}
        url={`/collections/${slug}`}
        items={listItems}
      />
      {/* Hero Section */}
      <div className={`relative py-16 bg-gradient-to-br ${colors.bg}`}>
        <div className="container mx-auto max-w-7xl px-4">
          <Breadcrumbs />

          <div className="mt-8 flex flex-col md:flex-row md:items-start gap-6">
            <div
              className={`p-4 rounded-2xl bg-background/50 ${colors.border} border backdrop-blur-sm`}
            >
              <Icon className={`h-12 w-12 ${colors.text}`} />
            </div>

            <div className="flex-1">
              <h1 className="page-title text-foreground mb-4">
                {collection.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                {collection.description}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                {collectionDeities.length > 0 && (
                  <Badge
                    variant="outline"
                    className={`${colors.border} ${colors.text}`}
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    {collectionDeities.length}{" "}
                    {collectionDeities.length === 1 ? "Deity" : "Deities"}
                  </Badge>
                )}
                {collectionStories.length > 0 && (
                  <Badge
                    variant="outline"
                    className={`${colors.border} ${colors.text}`}
                  >
                    <ScrollText className="h-3.5 w-3.5 mr-1.5" />
                    {collectionStories.length}{" "}
                    {collectionStories.length === 1 ? "Story" : "Stories"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Link href="/collections">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Collections
          </Button>
        </Link>

        <section className="mb-10 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="page-section-title text-foreground">
            Why This Theme Is Useful
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Collections make comparative mythology easier to scan. Instead of
            approaching one pantheon at a time, this page groups related figures
            and narratives so you can compare how different traditions handled
            the same role, motif, or symbolic pattern.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The best way to use it is to open a few entries side by side, notice
            the overlap first, and then branch into the full deity and story
            pages for context, source material, and deeper reading.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            That process matters because collections are strongest when they do
            more than list names. They help you see where a motif repeats, where
            a culture changes the pattern, and which figures deserve a closer
            read once the broad shape of the theme is clear.
          </p>
        </section>

        {/* Cross-pantheon archetype wheel */}
        <RosettaWheel
          archetype={collection.name}
          deities={collectionDeities.map((d) => ({
            name: d.name,
            slug: d.slug,
            pantheonId: d.pantheonId,
          }))}
        />

        {/* Deities Section */}
        {collectionDeities.length > 0 && (
          <section className="mb-16">
            <h2 className="font-serif text-2xl font-semibold mb-6 flex items-center gap-3">
              <Users className={`h-6 w-6 ${colors.text}`} />
              Deities in this Collection
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collectionDeities.map((deity, index) => {
                const pantheonName =
                  deity.pantheonId
                    ?.replace("-pantheon", "")
                    .replaceAll("-", " ") || "";
                const domains = deity.domain?.slice(0, 3).join(", ") || "";

                return (
                  <Link key={deity.id} href={`/deities/${deity.slug}`}>
                    <Card className="h-full hover:border-gold/50 hover:bg-gold/5 transition-all group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize mb-2 border-gold/30 text-gold"
                            >
                              {pantheonName}
                            </Badge>
                            <CardTitle className="font-serif text-lg group-hover:text-gold transition-colors">
                              {deity.name}
                            </CardTitle>
                          </div>
                          {deity.imageUrl && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border">
                              <Image
                                src={deity.imageUrl}
                                alt={deity.name}
                                fill
                                sizes="48px"
                                priority={index < 4}
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {domains && (
                          <p className="text-sm text-muted-foreground capitalize mb-2">
                            {domains}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {deity.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Stories Section */}
        {collectionStories.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-semibold mb-6 flex items-center gap-3">
              <ScrollText className={`h-6 w-6 ${colors.text}`} />
              Stories in this Collection
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collectionStories.map((story) => {
                const pantheonName =
                  story.pantheonId
                    ?.replace("-pantheon", "")
                    .replaceAll("-", " ") || "";
                const themes = story.themes?.slice(0, 3).join(", ") || "";

                return (
                  <Link key={story.id} href={`/stories/${story.slug}`}>
                    <Card className="h-full hover:border-gold/50 hover:bg-gold/5 transition-all group">
                      <CardHeader className="pb-2">
                        <Badge
                          variant="outline"
                          className="text-xs capitalize mb-2 w-fit border-gold/30 text-gold"
                        >
                          {pantheonName}
                        </Badge>
                        <CardTitle className="font-serif text-lg group-hover:text-gold transition-colors">
                          {story.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {themes && (
                          <p className="text-sm text-muted-foreground capitalize mb-2">
                            {themes}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {story.summary}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {collectionDeities.length === 0 && collectionStories.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              This collection is being curated. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
