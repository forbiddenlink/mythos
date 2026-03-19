"use client";

import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { GET_PANTHEONS } from "@/lib/queries";
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
import {
  PageHeaderSkeleton,
  GridSkeleton,
} from "@/components/ui/skeleton-cards";

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
  const { data, isLoading, error } = useQuery<{ pantheons: Pantheon[] }>({
    queryKey: ["pantheons"],
    queryFn: async () => graphqlClient.request(GET_PANTHEONS),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <h1 className="sr-only">Pantheons</h1>
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
        <h1 className="sr-only">Pantheons</h1>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Error loading pantheons
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CollectionPageJsonLd
        name="Pantheons"
        description="Explore mythological traditions from ancient civilizations around the world"
        url="/pantheons"
        numberOfItems={data?.pantheons?.length}
      />
      <PageHero
        icon={<Globe />}
        tagline="Mythological Traditions"
        title="Pantheons"
        description="Explore mythological traditions from ancient civilizations around the world"
        backgroundImage="/pantheons-hero.png"
        colorScheme="gold"
      />

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <Breadcrumbs />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {data?.pantheons.map((pantheon) => (
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
