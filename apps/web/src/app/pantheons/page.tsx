"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MythosMark } from "@/components/icons/mythos-marks";
import dynamic from "next/dynamic";
import Link from "next/link";

// Interactive star-map: the decorative constellation, wired for navigation.
const ConstellationBackground = dynamic(
  () =>
    import("@/components/three/ConstellationBackground").then(
      (mod) => mod.ConstellationBackground,
    ),
  { ssr: false },
);
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/page-hero";
import { getPantheonColor } from "@/lib/pantheon-colors";
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
  imageUrl?: string | null;
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
        mark="temple"
        tagline="Mythological Traditions"
        title="Pantheons"
        description="Explore mythological traditions from ancient civilizations around the world"
        backgroundImage="/pantheons-hero.jpg"
        backgroundAlt="A panoramic scene inspired by the major pantheons of world mythology"
        colorScheme="gold"
      />

      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            How To Use The Pantheon Guide
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Each pantheon page is a fast orientation layer before you dive into
            individual gods, stories, creatures, and places. Prefer a study
            route? Try the{" "}
            <Link
              href="/study/greek-gods"
              className="text-gold underline hover:text-gold/80"
            >
              Greek gods study guide
            </Link>
            , the{" "}
            <Link
              href="/study/norse-mythology"
              className="text-gold underline hover:text-gold/80"
            >
              Norse mythology guide
            </Link>
            , or{" "}
            <Link
              href="/study/comparative-mythology"
              className="text-gold underline hover:text-gold/80"
            >
              comparative mythology
            </Link>
            .
          </p>
        </section>

        {/* Constellation-as-navigation — click a deity's star to open its page. */}
        <section
          aria-label="Featured deities star map"
          className="relative mt-6 overflow-hidden rounded-2xl border border-gold/20 bg-midnight"
        >
          <div className="relative h-72 w-full sm:h-80">
            <ConstellationBackground navigable className="absolute inset-0" />
            <div className="pointer-events-none absolute left-6 top-5 z-10 max-w-xs">
              <h2 className="font-serif text-lg text-gold">
                Chart the Heavens
              </h2>
              <p className="mt-1 text-xs leading-5 text-parchment/70">
                Hover a deity&apos;s star, then select it to open their page.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {pantheons.map((pantheon) => {
            const accent = getPantheonColor(pantheon.id);
            return (
              <Link
                key={pantheon.id}
                href={`/pantheons/${pantheon.slug}`}
                className="group"
              >
                <Card
                  asArticle
                  className="h-full cursor-pointer parchment-card bg-card transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div
                    className="relative aspect-[16/10] border-b border-border/60 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, #0a0a19 0%, ${accent}55 48%, #0a0a19 100%)`,
                    }}
                    aria-hidden
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.18),transparent_55%)]" />
                    <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gold/25 bg-midnight/40 backdrop-blur-sm">
                      <MythosMark id="temple" className="h-5 w-5 text-gold" />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="border border-gold/20 bg-gold/10 p-2.5 transition-colors duration-300 group-hover:bg-gold/15">
                        <MythosMark id="temple" className="h-5 w-5 text-gold" />
                      </div>
                      <CardTitle className="text-foreground transition-colors duration-300 group-hover:text-gold">
                        {pantheon.name}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {pantheon.culture} • {pantheon.region}
                    </CardDescription>
                  </CardHeader>
                  {pantheon.description && (
                    <CardContent>
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {pantheon.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
