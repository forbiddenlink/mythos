"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Gem } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";
import { EditorialByline } from "@/components/content/EditorialByline";
import { ArtifactJsonLd } from "@/components/seo/JsonLd";
import { ArtifactProvenance } from "@/components/artifacts/ArtifactProvenance";
import { SourceProvenance } from "@/components/deities/SourceProvenance";
import artifactsData from "@/data/artifacts.json";

export interface ArtifactOwner {
  id: string;
  slug: string;
  name: string;
}

export interface ArtifactRelatedStory {
  id: string;
  slug: string;
  title: string;
}

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
  detailedBio?: string;
  primarySources?: Array<{
    text: string;
    source: string;
    date?: string;
  }>;
  imageUrl: string | null;
}

interface ArtifactPageClientProps {
  slug: string;
  owner?: ArtifactOwner | null;
  relatedStories?: ArtifactRelatedStory[];
}

export function ArtifactPageClient({
  slug,
  owner = null,
  relatedStories = [],
}: ArtifactPageClientProps) {
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
          <div className="absolute inset-0 bg-linear-to-b from-bronze/25 via-midnight/90 to-midnight z-10"></div>
        </div>

        <div className="absolute top-0 left-0 w-[50%] h-full bg-radial-gradient from-bronze/15 to-transparent pointer-events-none z-0" />

        <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
          <Link
            href="/artifacts"
            className="text-sm text-parchment/80 hover:text-parchment mb-6 inline-block transition-colors"
          >
            ← Back to Arsenal
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-bronze/35 bg-midnight/80 text-gold text-sm font-medium">
              <Gem className="h-3.5 w-3.5" />
              {artifact.type}
            </div>
            <h1 className="page-title text-parchment">{artifact.name}</h1>
            {artifact.detailedBio && (
              <p className="max-w-2xl text-lg leading-relaxed text-parchment/85">
                {artifact.description}
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
                About {artifact.name}
              </a>
              {artifact.primarySources?.length ? (
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

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="order-last min-w-0 md:order-first md:col-span-1 space-y-6">
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

              <p className="text-xs text-muted-foreground">
                Editorial illustration of {artifact.name}
              </p>

              <ArtifactProvenance
                pantheonId={artifact.pantheonId}
                type={artifact.type}
                owner={owner}
                currentLocation={artifact.currentLocation}
                origin={artifact.origin}
                relatedStories={relatedStories}
              />
            </div>

            <div className="min-w-0 md:col-span-2 space-y-6">
              <section id="about" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="page-section-title">Description</h2>
                </div>
                <div className="space-y-6">
                  {artifact.detailedBio ? (
                    <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-gold-text prose-a:text-gold dark:prose-a:text-gold-light max-w-none leading-relaxed">
                      <ReactMarkdown>{artifact.detailedBio}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {artifact.description}
                    </p>
                  )}
                  <SourceProvenance sources={artifact.primarySources} />
                  <CatalogSourceNotes sources={artifact.primarySources} />
                </div>
              </section>

              {artifact.powers && artifact.powers.length > 0 && (
                <Card className="bg-card border-border">
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
                          className="bg-gold/10 text-gold-text border border-gold/30 py-1.5 px-3"
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
