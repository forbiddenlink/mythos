"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Flame,
  Wind,
  Clock,
} from "lucide-react";
import { getPantheonColor } from "@/lib/pantheon-colors";
import Link from "next/link";
import { FESTIVALS } from "@/lib/antiquity-festivals";

export function AntiquityCalendar({
  deitySlugs,
}: {
  /** Honored-deity name → page slug, resolved on the server. */
  deitySlugs: Record<string, string>;
}) {
  const [selectedSeason, setSelectedSeason] = useState<
    "All" | "Spring" | "Summer" | "Autumn" | "Winter"
  >("All");

  const filteredFestivals = useMemo(() => {
    if (selectedSeason === "All") return FESTIVALS;
    return FESTIVALS.filter((f) => f.season === selectedSeason);
  }, [selectedSeason]);

  const seasonIcons = {
    Spring: <Wind className="size-4 text-emerald-400" />,
    Summer: <Sun className="size-4 text-amber-400" />,
    Autumn: <Flame className="size-4 text-orange-400" />,
    Winter: <Moon className="size-4 text-blue-400" />,
  };

  return (
    <Card className="border-gold/30 bg-card/85 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-muted/30 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold shrink-0">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl text-foreground">
                The Ancient Almanac: Festivals & Sacred Rites
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                How ancient civilizations marked the turning of seasons,
                celestial solstices, and divine encounters.
              </CardDescription>
            </div>
          </div>

          {/* Season Filter Tabs */}
          <div
            role="group"
            aria-label="Filter festivals by season"
            className="flex flex-wrap rounded-lg border border-border/80 bg-background/60 p-1 shrink-0"
          >
            {(["All", "Spring", "Summer", "Autumn", "Winter"] as const).map(
              (season) => (
                <button
                  key={season}
                  type="button"
                  aria-pressed={selectedSeason === season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedSeason === season
                      ? "bg-gold text-midnight shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {season}
                </button>
              ),
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <p aria-live="polite" className="mb-4 text-xs text-muted-foreground">
          Showing {filteredFestivals.length}{" "}
          {filteredFestivals.length === 1 ? "festival" : "festivals"}
          {selectedSeason !== "All" &&
            ` observed in ${selectedSeason.toLowerCase()}`}
          .
        </p>

        {filteredFestivals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No festivals recorded for this season yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredFestivals.map((fest) => {
              const pantheonColor = getPantheonColor(fest.pantheonId);

              return (
                <div
                  key={fest.id}
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-gold/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: pantheonColor }}
                          aria-hidden
                        />
                        <Badge
                          variant="outline"
                          className="border-gold/30 text-gold-text text-[11px] uppercase tracking-wider"
                        >
                          {fest.pantheonName}
                        </Badge>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        {seasonIcons[fest.season]}
                        {fest.season}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                      {fest.name}
                    </h3>
                    {fest.originalName && (
                      <p className="font-serif text-sm text-gold/80 italic mb-2">
                        {fest.originalName}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mb-4">
                      <Clock className="size-3.5 text-gold" />
                      <span>{fest.historicalTiming}</span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {fest.description}
                    </p>

                    <div className="space-y-2 border-t border-border/60 pt-3">
                      <span className="text-xs uppercase tracking-wider text-foreground font-semibold block">
                        Sacred Rituals & Rites:
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {fest.rituals.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-gold mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Deities:</strong>{" "}
                      {fest.honoredDeities.map((name, index) => {
                        const slug = deitySlugs[name] ?? null;
                        return (
                          <span key={name}>
                            {index > 0 && ", "}
                            {slug ? (
                              <Link
                                href={`/deities/${slug}`}
                                className="text-gold-text underline decoration-gold/30 underline-offset-2 hover:decoration-gold transition-colors"
                              >
                                {name}
                              </Link>
                            ) : (
                              name
                            )}
                          </span>
                        );
                      })}
                    </p>
                    <p className="text-gold/90 font-serif italic leading-relaxed">
                      {fest.significance}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
