"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/page-hero";
import pantheonsData from "@/data/pantheons.json";

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
}

export default function PantheonsPage() {
  const pantheons = pantheonsData as Pantheon[];

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Pantheons"
        description="Explore mythological traditions from ancient civilizations around the world"
        url="/pantheons"
        numberOfItems={pantheons.length}
      />
      <PageHero
        icon={<Globe />}
        tagline="Mythological Traditions"
        title="Pantheons"
        description="Explore mythological traditions from ancient civilizations around the world"
        backgroundImage="/pantheons-hero.jpg"
        backgroundAlt="A panoramic scene inspired by the major pantheons of world mythology"
        colorScheme="gold"
      />

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            How To Use The Pantheon Guide
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Each pantheon page is meant to be a fast orientation layer before
            you dive into individual gods, stories, creatures, and places. Start
            by comparing culture and region, then open a tradition to see how
            its major deities relate to one another, which themes dominate its
            myths, and where it connects to the rest of the atlas. If
            you&apos;re new to mythology, this is the best place to understand
            the larger story world before drilling into specific figures.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            If you want a strong first stop, try the{" "}
            <Link
              href="/pantheons/celtic"
              className="text-gold underline hover:text-gold/80"
            >
              Celtic pantheon
            </Link>
            . It is a good route for readers who want a compact divine family,
            vivid symbolic roles, and stories that connect cleanly to deity and
            artifact pages across the site.
          </p>
        </section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {pantheons.map((pantheon) => (
            <Link
              key={pantheon.id}
              href={`/pantheons/${pantheon.slug}`}
              className="group"
            >
              <Card
                asArticle
                className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01]"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300">
                      <Globe className="h-5 w-5 text-gold" strokeWidth={1.5} />
                    </div>
                    <CardTitle className="text-foreground group-hover:text-gold transition-colors duration-300">
                      {pantheon.name}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {pantheon.culture} • {pantheon.region}
                  </CardDescription>
                </CardHeader>
                {pantheon.description && (
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {pantheon.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
