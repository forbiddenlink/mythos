"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Calendar, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { EditorialByline } from "@/components/content/EditorialByline";
import ReactMarkdown from "react-markdown";
import pantheonsData from "@/data/pantheons.json";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string | null;
  detailedHistory?: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
  summary: string;
  category: string;
}

interface PantheonPageClientProps {
  slug: string;
}

export function PantheonPageClient({ slug }: PantheonPageClientProps) {
  const pantheons = pantheonsData as Pantheon[];
  const allDeities = deitiesData as Deity[];
  const allStories = storiesData as Story[];
  const pantheon = pantheons.find((p) => p.slug === slug);

  if (!pantheon) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Pantheon Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The pantheon you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/pantheons"
            className="text-gold hover:underline mt-4 inline-block"
          >
            View all pantheons
          </Link>
        </div>
      </div>
    );
  }

  const pantheonDeities = allDeities.filter(
    (deity) => deity.pantheonId === pantheon.id,
  );
  const pantheonStories = allStories.filter(
    (story) => story.pantheonId === pantheon.id,
  );

  return (
    <div className="min-h-screen bg-mythic">
      <CollectionPageJsonLd
        name={`${pantheon.name} - ${pantheon.culture} Mythology`}
        description={
          pantheon.description ||
          `Explore the ${pantheon.name} from ${pantheon.culture} mythology.`
        }
        url={`/pantheons/${pantheon.slug}`}
        numberOfItems={pantheonDeities.length}
      />
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-75 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            {pantheon.name}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            {pantheon.culture}
          </p>
          <EditorialByline
            className="mx-auto mt-4 max-w-2xl text-center text-parchment/80"
            tone="light"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Breadcrumbs />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-8">
          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                <CardTitle className="text-parchment">Region</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-parchment/80">{pantheon.region}</p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold" />
                <CardTitle className="text-parchment">Time Period</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-parchment/80">
                {pantheon.timePeriodStart && pantheon.timePeriodEnd
                  ? `${Math.abs(pantheon.timePeriodStart)} BCE - ${Math.abs(pantheon.timePeriodEnd)} ${pantheon.timePeriodEnd < 0 ? "BCE" : "CE"}`
                  : "Ancient Times"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                <CardTitle className="text-parchment">Deities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-parchment/80">
                {pantheonDeities.length} gods and goddesses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed History (Markdown) or Description */}
        <Card className="border-gold/20 bg-midnight-light/50 mb-12">
          <CardHeader>
            <CardTitle className="text-parchment text-2xl font-serif">
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pantheon.detailedHistory ? (
              <div className="prose prose-invert prose-gold max-w-none">
                <ReactMarkdown>{pantheon.detailedHistory}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-parchment/80 leading-relaxed text-lg">
                {pantheon.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Deities Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-gold" />
            <h2 className="text-3xl font-serif font-semibold text-parchment">
              Deities
            </h2>
          </div>

          {pantheonDeities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pantheonDeities.map((deity) => (
                <Link key={deity.id} href={`/deities/${deity.slug}`}>
                  <Card className="h-full border-gold/20 bg-midnight-light/50 hover:border-gold/40 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-parchment">
                        {deity.name}
                      </CardTitle>
                      <CardDescription className="text-gold/80">
                        {deity.domain.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-parchment/70 line-clamp-3">
                        {deity.description || "No description available."}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardContent className="py-12 text-center">
                <p className="text-parchment/60">
                  No deities found for this pantheon.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Stories Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-gold" />
            <h2 className="text-3xl font-serif font-semibold text-parchment">
              Stories & Myths
            </h2>
          </div>

          {pantheonStories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {pantheonStories.map((story) => (
                <Card
                  key={story.id}
                  className="border-gold/20 bg-midnight-light/50 hover:border-gold/40 transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="text-parchment">
                      {story.title}
                    </CardTitle>
                    <CardDescription className="text-gold/80">
                      {story.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-parchment/70 line-clamp-3">
                      {story.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardContent className="py-12 text-center">
                <p className="text-parchment/60">
                  No stories found for this pantheon.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
