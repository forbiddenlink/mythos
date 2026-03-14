"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Trophy, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BranchingStory, getDiscoveredEndings } from "@/lib/branching-story";
import branchingStoriesData from "@/data/branching-stories.json";

const branchingStories = branchingStoriesData as unknown as BranchingStory[];

export function InteractiveStoriesBanner() {
  const [totalDiscovered, setTotalDiscovered] = useState(0);
  const [totalEndings, setTotalEndings] = useState(0);

  useEffect(() => {
    let discovered = 0;
    let total = 0;
    for (const story of branchingStories) {
      discovered += getDiscoveredEndings(story.id).length;
      total += story.totalEndings;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate discovered totals from localStorage
    setTotalDiscovered(discovered);
    setTotalEndings(total);
  }, []);

  if (branchingStories.length === 0) {
    return null;
  }

  const featuredStory = branchingStories[0];

  return (
    <section className="py-12 bg-linear-to-b from-background to-midnight/5">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-linear-to-br from-midnight/80 via-midnight/90 to-midnight shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-gold/10 to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-gold/5 to-transparent" />

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gold/20 border border-gold/30">
                    <Gamepad2 className="h-6 w-6 text-gold" />
                  </div>
                  <Badge className="bg-gold/20 text-amber-900 dark:text-amber-100 border-gold/30 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Interactive
                  </Badge>
                </div>

                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-parchment mb-3">
                  Choose Your Own Mythology
                </h2>

                <p className="text-parchment/70 text-lg mb-6 max-w-xl">
                  Step into the sandals of legendary heroes. Make choices that
                  shape destiny. Discover multiple endings in immersive
                  mythological adventures.
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gold" />
                    <span className="text-parchment">
                      <span className="font-semibold text-gold">
                        {branchingStories.length}
                      </span>{" "}
                      stories
                    </span>
                  </div>
                  <div className="w-px h-5 bg-gold/30" />
                  <span className="text-parchment">
                    <span className="font-semibold text-gold">
                      {totalDiscovered}/{totalEndings}
                    </span>{" "}
                    endings discovered
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gold hover:bg-gold-dark text-midnight"
                  >
                    <Link href={`/stories/interactive/${featuredStory.slug}`}>
                      <Gamepad2 className="h-5 w-5 mr-2" />
                      Play Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-gold/30 text-parchment hover:bg-gold/10"
                  >
                    <Link href="/stories">
                      View All Stories
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Featured Story Preview */}
              <div className="w-full lg:w-80 shrink-0">
                <Link
                  href={`/stories/interactive/${featuredStory.slug}`}
                  className="group block"
                >
                  <div className="relative rounded-xl overflow-hidden border border-gold/30 hover:border-gold/50 transition-colors">
                    {featuredStory.coverImage && (
                      <div className="relative aspect-4/3">
                        <Image
                          src={featuredStory.coverImage}
                          alt={featuredStory.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-midnight via-midnight/20 to-transparent" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge className="bg-gold/90 text-midnight border-0 mb-2">
                        Featured
                      </Badge>
                      <h3 className="font-serif text-xl font-semibold text-parchment group-hover:text-gold transition-colors">
                        {featuredStory.title}
                      </h3>
                      <p className="text-parchment/60 text-sm mt-1 line-clamp-2">
                        {featuredStory.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
