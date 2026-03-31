"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Zap, MapPin, Skull, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CreatureJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { EditorialByline } from "@/components/content/EditorialByline";
import { siteConfig } from "@/lib/metadata";
import creaturesData from "@/data/creatures.json";
import deitiesData from "@/data/deities.json";

interface Creature {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  description: string;
  imageUrl: string | null;
}

interface CreaturePageClientProps {
  slug: string;
}

export function CreaturePageClient({ slug }: CreaturePageClientProps) {
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
  let dangerColor = "text-yellow-500";
  if (creature.dangerLevel >= 9) dangerColor = "text-destructive";
  else if (creature.dangerLevel >= 7) dangerColor = "text-orange-500";

  const samePantheonCreatures = creaturesData
    .filter((c) => c.pantheonId === creature.pantheonId && c.id !== creature.id)
    .slice(0, 4);

  const samePantheonDeities = deitiesData
    .filter((d) => d.pantheonId === creature.pantheonId)
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
      <CreatureJsonLd
        name={creature.name}
        description={creature.description}
        url={`/creatures/${creature.slug}`}
        image={creature.imageUrl || undefined}
        abilities={creature.abilities}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/80 via-slate-900/90 to-slate-950 z-10"></div>
          {/* Optional: Add a subtle texture or noise pattern here */}
        </div>

        {/* Abstract Red Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-radial-gradient from-red-900/10 to-transparent pointer-events-none z-0" />

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
          <Link
            href="/creatures"
            className="text-sm text-slate-400 hover:text-white mb-6 inline-block transition-colors"
          >
            ← Back to Bestiary
          </Link>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
              {creature.name}
            </h1>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{creature.habitat}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className={`h-4 w-4 ${dangerColor}`} />
                <span className={`${dangerColor} font-medium`}>
                  Danger Level: {creature.dangerLevel}/10
                </span>
              </div>
            </div>
            <EditorialByline className="max-w-2xl" tone="light" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* Centered Image */}
          {creature.imageUrl && (
            <div className="relative w-full max-w-lg mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800">
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
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Column: Stats */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
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
                        className="bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Lore */}
            <div className="md:col-span-2">
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">
                    Lore & Legend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {creature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Content */}
          <div className="mt-12 space-y-8">
            {/* More Creatures from this Pantheon */}
            {samePantheonCreatures.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Skull className="h-5 w-5 text-red-500" />
                  More from this Pantheon
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samePantheonCreatures.map((c) => (
                    <Link key={c.id} href={`/creatures/${c.slug}`}>
                      <Card className="bg-slate-900/50 border-slate-800 hover:border-red-500/50 transition-all group">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">
                            {c.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
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
                <h2 className="font-serif text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  Deities of this Pantheon
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samePantheonDeities.map((d) => (
                    <Link key={d.id} href={`/deities/${d.slug}`}>
                      <Card className="bg-slate-900/50 border-slate-800 hover:border-gold/50 transition-all group">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
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
