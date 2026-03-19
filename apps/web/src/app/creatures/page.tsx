"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { GET_CREATURES } from "@/lib/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table, Skull } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/layout/page-hero";
import {
  PageHeaderSkeleton,
  GridSkeleton,
} from "@/components/ui/skeleton-cards";

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

function getDangerBadgeClass(dangerLevel: number): string {
  if (dangerLevel >= 9) return "border-red-500 text-red-500 bg-red-500/10";
  if (dangerLevel >= 7)
    return "border-orange-500 text-orange-500 bg-orange-500/10";
  return "border-yellow-500 text-yellow-500 bg-yellow-500/10";
}

export default function CreaturesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data, isLoading, error } = useQuery<{ creatures: Creature[] }>({
    queryKey: ["creatures"],
    queryFn: async () => graphqlClient.request(GET_CREATURES),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <h1 className="sr-only">Creatures and Monsters</h1>
        <PageHeaderSkeleton />
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <GridSkeleton count={6} columns={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <h1 className="sr-only">Creatures and Monsters</h1>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Error loading creatures
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  const creatures = data?.creatures || [];

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Creatures & Monsters"
        description="Legendary beasts and mythological creatures from ancient mythology"
        url="/creatures"
        numberOfItems={creatures.length}
      />
      <PageHero
        icon={<Skull />}
        tagline="The Bestiary"
        title="Creatures & Monsters"
        description="From the depths of the underworld to the peaks of mountains, discover the legendary beasts of ancient mythology."
        colorScheme="red"
        minHeight="min-h-[40vh]"
      />

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs />
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
                      Habitat
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Danger
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground min-w-50">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {creatures.map((creature) => (
                    <tr
                      key={creature.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {creature.slug ? (
                          <Link
                            href={`/creatures/${creature.slug}`}
                            className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                          >
                            {creature.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{creature.name}</span>
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
                          }[creature.pantheonId] || creature.pantheonId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {creature.habitat}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          variant="outline"
                          className={getDangerBadgeClass(creature.dangerLevel)}
                        >
                          {creature.dangerLevel}/10
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                        <span className="line-clamp-2">
                          {creature.description}
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
            {creatures.map((creature) => (
              <Link
                key={creature.id}
                href={`/creatures/${creature.slug}`}
                className="group"
              >
                <Card
                  asArticle
                  className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] hover:border-red-500/30 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {creature.imageUrl ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-red-500/20 shadow-sm">
                          <Image
                            src={creature.imageUrl}
                            alt={creature.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/15 transition-colors duration-300">
                          <Skull
                            className="h-5 w-5 text-red-500"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}

                      <Badge
                        variant="outline"
                        className={getDangerBadgeClass(creature.dangerLevel)}
                      >
                        Danger: {creature.dangerLevel}/10
                      </Badge>
                    </div>
                    <CardTitle className="text-foreground mt-4 group-hover:text-red-500 transition-colors duration-300">
                      {creature.name}
                    </CardTitle>
                    <CardDescription>{creature.habitat}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                      {creature.description}
                    </p>
                    {creature.abilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {creature.abilities.slice(0, 3).map((ability) => (
                          <span
                            key={ability}
                            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {ability}
                          </span>
                        ))}
                        {creature.abilities.length > 3 && (
                          <span className="text-xs px-2 py-0.5 text-muted-foreground">
                            +{creature.abilities.length - 3}
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
