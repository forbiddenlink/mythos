"use client";

import { useRecommendations } from "@/hooks/use-recommendations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import Image from "next/image";

interface RecommendedContentProps {
  showPantheonSuggestions?: boolean;
  maxDeities?: number;
  maxStories?: number;
  className?: string;
}

export function RecommendedContent({
  showPantheonSuggestions = true,
  maxDeities = 5,
  maxStories = 3,
  className = "",
}: RecommendedContentProps) {
  const {
    recommendations,
    pantheonSuggestions,
    explorationSuggestion,
    hasHistory,
  } = useRecommendations();

  const displayedDeities = recommendations.deities.slice(0, maxDeities);
  const displayedStories = recommendations.stories.slice(0, maxStories);

  if (displayedDeities.length === 0 && displayedStories.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-8 ${className}`}>
      {/* Main Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MythosMark id="compass" className="h-5 w-5 text-gold" />
          <h2 className="font-serif text-2xl font-bold">
            {hasHistory ? "Recommended For You" : "Start Your Journey"}
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {recommendations.reason}
        </p>

        {/* Recommended Deities */}
        {displayedDeities.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MythosMark id="laurel" className="h-5 w-5 text-gold" />
              Deities to Discover
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {displayedDeities.map((deity) => (
                <Link key={deity.id} href={`/deities/${deity.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    {deity.imageUrl && (
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={deity.imageUrl}
                          alt={deity.name}
                          width={512}
                          height={384}
                          sizes="(min-width: 1280px) 16rem, (min-width: 1024px) 20vw, (min-width: 640px) 45vw, 90vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="font-serif font-bold text-white text-lg truncate">
                            {deity.name}
                          </h4>
                        </div>
                      </div>
                    )}
                    <CardContent className={deity.imageUrl ? "pt-3" : "pt-4"}>
                      {!deity.imageUrl && (
                        <h4 className="font-serif font-bold text-lg mb-2 group-hover:text-gold transition-colors">
                          {deity.name}
                        </h4>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {deity.domain.slice(0, 2).map((d) => (
                          <Badge
                            key={d}
                            variant="secondary"
                            className="text-xs"
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Stories */}
        {displayedStories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                <MythosMark id="scroll" className="h-4 w-4 text-gold" />
              </span>
              Stories to Read
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayedStories.map((story) => (
                <Link key={story.id} href={`/stories/${story.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {story.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {story.category}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {story.summary}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pantheon Suggestions */}
      {showPantheonSuggestions && pantheonSuggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="relative inline-flex h-8 w-8 items-center justify-center border border-gold/30 bg-gold/5">
              <MythosMark id="compass" className="h-4 w-4 text-gold" />
            </span>
            Continue Exploring
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantheonSuggestions.slice(0, 3).map((suggestion) => (
              <Link
                key={suggestion.pantheonId}
                href={`/pantheons/${suggestion.pantheonId.replace("-pantheon", "")}`}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold group-hover:text-gold transition-colors">
                        {suggestion.pantheonName} Pantheon
                      </h4>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.suggestion}
                    </p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-gold to-bronze rounded-full transition-all duration-500"
                        style={{
                          width: `${((suggestion.totalCount - suggestion.unviewedCount) / suggestion.totalCount) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {suggestion.totalCount - suggestion.unviewedCount} of{" "}
                      {suggestion.totalCount} explored
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Exploration Suggestion */}
      {explorationSuggestion &&
        explorationSuggestion.unviewedCount ===
          explorationSuggestion.totalCount && (
          <Card className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-gold/30 bg-gold/5">
                  <MythosMark id="compass" className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                    Explore a New Pantheon
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Discover the {explorationSuggestion.pantheonName} gods and
                    their fascinating stories
                  </p>
                </div>
                <Link
                  href={`/pantheons/${explorationSuggestion.pantheonId.replace("-pantheon", "")}`}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
    </section>
  );
}
