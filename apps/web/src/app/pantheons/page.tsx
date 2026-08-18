"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MythosMark } from "@/components/icons/mythos-marks";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

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

        {/* Constellation-as-navigation */}
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
                className="group pantheon-reveal"
              >
                <Card
                  asArticle
                  className="h-full cursor-pointer overflow-hidden border border-white/[0.06] bg-card transition-colors duration-300 hover:border-white/[0.12] hover:bg-card/80"
                >
                  {/* Card image area */}
                  <div
                    className="pantheon-grain relative aspect-[16/10] overflow-hidden border-b border-white/[0.06]"
                    aria-hidden
                  >
                    {/* Base accent gradient */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(160deg, #07060f 0%, ${accent}4a 45%, #07060f 100%)`,
                      }}
                    />
                    {/* Atmospheric image – low opacity, luminosity blend for texture */}
                    {pantheon.imageUrl && (
                      <Image
                        src={pantheon.imageUrl}
                        alt=""
                        fill
                        className="object-cover opacity-35 mix-blend-luminosity"
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        priority={false}
                      />
                    )}
                    {/* Vignette overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_25%,transparent_40%,rgba(7,6,15,0.75)_100%)]" />
                    {/* Accent shimmer */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 65% 30%, ${accent}60, transparent 60%)`,
                      }}
                    />
                    {/* Rotating badge on hover */}
                    <div className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-md border border-gold/20 bg-midnight/50 backdrop-blur-sm transition-transform duration-500 group-hover:rotate-[15deg]">
                      <MythosMark id="temple" className="h-4 w-4 text-gold" />
                    </div>
                    {/* Region label top-right */}
                    <div className="absolute right-3 top-3">
                      <span className="rounded px-2 py-0.5 text-[10px] font-mono tracking-widest text-parchment/50 uppercase bg-midnight/40 backdrop-blur-sm border border-white/[0.06]">
                        {pantheon.region}
                      </span>
                    </div>
                  </div>

                  {/* Card text */}
                  <CardHeader className="pb-2">
                    {/* Tracked uppercase culture tag */}
                    <p className="mb-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground/70">
                      {pantheon.culture}
                    </p>
                    <CardTitle className="font-serif text-xl leading-tight text-foreground transition-colors duration-300 group-hover:text-gold">
                      {pantheon.name}
                    </CardTitle>
                  </CardHeader>

                  {pantheon.description && (
                    <CardContent className="pt-0">
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
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
