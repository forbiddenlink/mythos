"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Zap, MapPin, Skull, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { EditorialByline } from "@/components/content/EditorialByline";
import { siteConfig } from "@/lib/metadata";
import creaturesData from "@/data/creatures.json";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import type { MuseumObject } from "@/lib/museum";

interface Creature {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  description: string;
  detailedBio?: string;
  primarySources?: Array<{
    text: string;
    source: string;
    date?: string;
  }>;
  imageUrl: string | null;
}

export interface PantheonDeitySummary {
  id: string;
  slug: string;
  name: string;
}

interface CreaturePageClientProps {
  slug: string;
  samePantheonDeities?: PantheonDeitySummary[];
  museumObjects?: MuseumObject[];
}

export function CreaturePageClient({
  slug,
  samePantheonDeities = [],
  museumObjects = [],
}: CreaturePageClientProps) {
  const creature =
    (creaturesData as Creature[]).find(
      (item) => item.id === slug || item.slug === slug,
    ) ?? null;

  if (!creature) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Creature Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            The beast you seek remains elusive.
          </p>
          <Link
            href="/creatures"
            className="text-red-500 hover:underline mt-4 inline-block"
          >
            Return to the Bestiary
          </Link>
        </div>
      </div>
    );
  }

  const samePantheonCreatures = creaturesData
    .filter((c) => c.pantheonId === creature.pantheonId && c.id !== creature.id)
    .slice(0, 4);

  const breadcrumbItems = [
    { name: "Home", item: siteConfig.url },
    { name: "Creatures", item: `${siteConfig.url}/creatures` },
    {
      name: creature.name,
      item: `${siteConfig.url}/creatures/${creature.slug}`,
    },
  ];

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-midnight/85 via-midnight/90 to-midnight z-10"></div>
        </div>

        {/* Abstract Red Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-radial-gradient from-red-900/10 to-transparent pointer-events-none z-0" />

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
          <Link
            href="/creatures"
            className="text-sm text-parchment/80 hover:text-parchment mb-6 inline-block transition-colors"
          >
            ← Back to Bestiary
          </Link>

          <div className="space-y-4">
            <h1 className="page-title text-parchment">{creature.name}</h1>
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2 text-parchment/85">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{creature.habitat}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-parchment" />
                <span className="font-medium text-parchment">
                  Catalog danger rating: {creature.dangerLevel}/10
                </span>
              </div>
            </div>
            {creature.detailedBio && (
              <p className="max-w-2xl text-lg leading-relaxed text-parchment/85">
                {creature.description}
              </p>
            )}
            <EditorialByline className="max-w-2xl" tone="light" />
            <nav
              aria-label="On this page"
              className="flex flex-wrap gap-x-6 gap-y-3 pt-3 text-sm text-parchment"
            >
              <a
                href="#about"
                className="inline-flex min-h-11 items-center underline underline-offset-4"
              >
                About {creature.name}
              </a>
              {creature.primarySources?.length ? (
                <a
                  href="#source-notes"
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  Source notes
                </a>
              ) : null}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* Centered Image */}
          {creature.imageUrl && (
            <figure className="w-full max-w-lg border border-border">
              <div className="aspect-video relative">
                <Image
                  src={creature.imageUrl}
                  alt={creature.name}
                  fill
                  sizes="(min-width: 1024px) 32rem, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
              </div>
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                Editorial illustration of {creature.name}
              </figcaption>
            </figure>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Column: Stats */}
            <div className="order-last min-w-0 md:order-first md:col-span-1 space-y-6">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Abilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {creature.abilities.map((ability) => (
                      <Badge
                        key={ability}
                        variant="secondary"
                        className="bg-midnight-light text-parchment/75 hover:bg-midnight"
                      >
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Lore */}
            <div className="min-w-0 md:col-span-2">
              <section id="about" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="page-section-title">Lore & Legend</h2>
                </div>
                <div className="space-y-6">
                  {creature.detailedBio ? (
                    <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-gold-text prose-a:text-gold dark:prose-a:text-gold-light max-w-none leading-relaxed">
                      <ReactMarkdown>{creature.detailedBio}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {creature.description}
                    </p>
                  )}
                  <SourceProvenance sources={creature.primarySources} />
                  <CatalogSourceNotes sources={creature.primarySources} />
                </div>
              </section>
            </div>
          </div>

          <MuseumGallery name={creature.name} objects={museumObjects} />

          {/* Related Content */}
          <div className="mt-12 space-y-8">
            {/* More Creatures from this Pantheon */}
            {samePantheonCreatures.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Skull className="h-5 w-5 text-red-500" />
                  More from this tradition
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samePantheonCreatures.map((c) => (
                    <Link key={c.id} href={`/creatures/${c.slug}`}>
                      <Card className="bg-card/50 border-border hover:border-red-500/50 transition-all group">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-red-400 transition-colors">
                            {c.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {c.habitat}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Deities */}
            {samePantheonDeities.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  Figures from this tradition
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samePantheonDeities.map((d) => (
                    <Link key={d.id} href={`/deities/${d.slug}`}>
                      <Card className="bg-card/50 border-border hover:border-gold/50 transition-all group">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">
                            {d.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
