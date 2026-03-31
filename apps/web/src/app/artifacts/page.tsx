"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table, Gem } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/page-hero";
import artifactsData from "@/data/artifacts.json";

interface Artifact {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  ownerId?: string;
  owner?: string;
  type: string;
  description: string;
  powers: string[];
  imageUrl: string | null;
}

export default function ArtifactsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const artifacts = artifactsData as Artifact[];

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Legendary Artifacts"
        description="Weapons, shields, and mystical objects of power wielded by gods and heroes"
        url="/artifacts"
        numberOfItems={artifacts.length}
      />
      <PageHero
        icon={<Gem />}
        tagline="The Arsenal"
        title="Legendary Artifacts"
        description="Weapons, shields, and mystical objects of power wielded by the gods and heroes of old."
        colorScheme="purple"
        minHeight="min-h-[40vh]"
      />

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            Follow Objects Through Their Stories
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Mythic artifacts matter because they carry ownership, symbolism, and
            narrative consequences. Use this catalog to compare how different
            traditions imagine divine power through weapons, relics, armor, and
            sacred tools. The table view is best for scanning object types and
            owners, while the card view is better for browsing. Open an artifact
            entry when you want its origin, powers, and the heroes or gods most
            closely tied to it.
          </p>
        </section>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <Table className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Mythology
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground min-w-50">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {artifacts.map((artifact) => (
                    <tr
                      key={artifact.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {artifact.slug ? (
                          <Link
                            href={`/artifacts/${artifact.slug}`}
                            className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline"
                          >
                            {artifact.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{artifact.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                          {{
                            "greek-pantheon": "Greek",
                            "norse-pantheon": "Norse",
                            "egyptian-pantheon": "Egyptian",
                            "roman-pantheon": "Roman",
                            "hindu-pantheon": "Hindu",
                            "japanese-pantheon": "Japanese",
                            "celtic-pantheon": "Celtic",
                            "mesopotamian-pantheon": "Mesopotamian",
                          }[artifact.pantheonId] || artifact.pantheonId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          variant="outline"
                          className="border-purple-500/50 text-purple-500 bg-purple-500/5 capitalize"
                        >
                          {artifact.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap capitalize">
                        {artifact.ownerId || artifact.owner || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                        <span className="line-clamp-2">
                          {artifact.description}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artifacts.map((artifact, index) => (
              <Link
                key={artifact.id}
                href={`/artifacts/${artifact.slug}`}
                className="group"
              >
                <Card
                  asArticle
                  className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] hover:border-purple-500/30 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {artifact.imageUrl ? (
                        <div className="rounded-xl overflow-hidden border border-purple-500/20 shadow-sm">
                          <Image
                            src={artifact.imageUrl}
                            alt={artifact.name}
                            width={64}
                            height={64}
                            sizes="64px"
                            priority={index < 3}
                            className="h-16 w-16 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/15 transition-colors duration-300">
                          <Gem
                            className="h-5 w-5 text-purple-500"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}

                      <Badge
                        variant="outline"
                        className="border-purple-500/50 text-purple-500 bg-purple-500/5"
                      >
                        {artifact.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-foreground mt-4 group-hover:text-purple-400 transition-colors duration-300">
                      {artifact.name}
                    </CardTitle>
                    <CardDescription>
                      {artifact.powers && artifact.powers.length > 0
                        ? artifact.powers[0]
                        : "Legendary Item"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                      {artifact.description}
                    </p>
                    {artifact.powers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {artifact.powers.slice(0, 3).map((power) => (
                          <span
                            key={power}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {power}
                          </span>
                        ))}
                        {artifact.powers.length > 3 && (
                          <span className="text-xs px-2 py-0.5 text-muted-foreground">
                            +{artifact.powers.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
