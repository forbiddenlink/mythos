"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Gem } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EditorialByline } from "@/components/content/EditorialByline";
import { ArtifactJsonLd } from "@/components/seo/JsonLd";
import { ArtifactProvenance } from "@/components/artifacts/ArtifactProvenance";
import artifactsData from "@/data/artifacts.json";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";

interface Artifact {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  owner?: string | null;
  type: string;
  description: string;
  powers: string[];
  origin?: string | null;
  currentLocation?: string | null;
  relatedStories?: string[];
  imageUrl: string | null;
}

interface ArtifactPageClientProps {
  slug: string;
}

export function ArtifactPageClient({ slug }: ArtifactPageClientProps) {
  const artifact =
    (artifactsData as Artifact[]).find(
      (item) => item.id === slug || item.slug === slug,
    ) ?? null;

  if (!artifact) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Artifact Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            The legendary item you seek is lost to time.
          </p>
          <Link
            href="/artifacts"
            className="text-gold-text hover:underline mt-4 inline-block"
          >
            Return to the Arsenal
          </Link>
        </div>
      </div>
    );
  }
  const owner = artifact.owner
    ? ((deitiesData as Array<{ id: string; slug: string; name: string }>).find(
        (deity) => deity.id === artifact.owner || deity.slug === artifact.owner,
      ) ?? null)
    : null;

  const relatedStories = (artifact.relatedStories ?? [])
    .map((id) => {
      const story = (
        storiesData as Array<{ id: string; slug: string; title: string }>
      ).find((s) => s.id === id);
      return story
        ? { id: story.id, slug: story.slug, title: story.title }
        : null;
    })
    .filter(
      (s): s is { id: string; slug: string; title: string } => s !== null,
    );

  return (
    <div className="min-h-screen">
      <ArtifactJsonLd
        name={artifact.name}
        description={artifact.description}
        url={`/artifacts/${artifact.slug}`}
        image={artifact.imageUrl || undefined}
        powers={artifact.powers}
      />
      <div className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-bronze/20 via-midnight/90 to-midnight z-10"></div>
        </div>

        <div className="absolute top-0 left-0 w-[50%] h-full bg-radial-gradient from-bronze/15 to-transparent pointer-events-none z-0" />

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
          <Link
            href="/artifacts"
            className="text-sm text-parchment/60 hover:text-parchment mb-6 inline-block transition-colors"
          >
            ← Back to Arsenal
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-bronze/35 bg-bronze/10 text-bronze text-sm font-medium">
              <Gem className="h-3.5 w-3.5" />
              {artifact.type}
            </div>
            <h1 className="page-title text-parchment">{artifact.name}</h1>
            <EditorialByline className="max-w-2xl" tone="light" />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <div className="relative w-full aspect-square overflow-hidden shadow-2xl border border-bronze/25 bg-midnight/50">
                {artifact.imageUrl ? (
                  <Image
                    src={artifact.imageUrl}
                    alt={artifact.name}
                    fill
                    sizes="(min-width: 768px) 20rem, 100vw"
                    className="object-cover p-4 hover:scale-105 transition-transform duration-500"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gem className="h-16 w-16 text-gold-text/20" />
                  </div>
                )}
              </div>

              <ArtifactProvenance
                pantheonId={artifact.pantheonId}
                type={artifact.type}
                owner={owner}
                currentLocation={artifact.currentLocation}
                origin={artifact.origin}
                relatedStories={relatedStories}
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card className="bg-card border-l-4 border-l-bronze">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {artifact.description}
                  </p>
                </CardContent>
              </Card>

              {artifact.powers && artifact.powers.length > 0 && (
                <Card className="bg-midnight/30 border-border/40">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-amber-400" />
                      Powers & Abilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {artifact.powers.map((power) => (
                        <Badge
                          key={power}
                          variant="secondary"
                          className="bg-bronze/20 text-bronze border border-bronze/35 py-1.5 px-3"
                        >
                          {power}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
