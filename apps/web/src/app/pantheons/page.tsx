"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import Image from "next/image";
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {pantheons.map((pantheon) => (
            <Link
              key={pantheon.id}
              href={`/pantheons/${pantheon.slug}`}
              className="group"
            >
              <Card
                asArticle
                className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] overflow-hidden"
              >
                {pantheon.imageUrl && (
                  <div className="relative aspect-[16/10] border-b border-border/60 bg-midnight">
                    <Image
                      src={pantheon.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20rem, 50vw"
                      className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                )}
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
          ))}
        </div>
      </div>
    </div>
  );
}
