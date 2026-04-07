"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationSourceItem {
  title: string;
  author?: string;
  lines?: string;
  book?: string;
  chapters?: string;
  chapter?: string;
  type?: string;
}

interface CitationSourcesListProps {
  sources: CitationSourceItem[];
  /** `story` = dark mythic cards; `deity` = default light cards */
  variant?: "story" | "deity";
  className?: string;
}

function formatLocation(c: CitationSourceItem): string | null {
  const parts = [c.book, c.chapter, c.chapters, c.lines].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function CitationSourcesList({
  sources,
  variant = "story",
  className,
}: CitationSourcesListProps) {
  if (!sources?.length) return null;

  const isStory = variant === "story";

  return (
    <Card
      className={cn(
        isStory
          ? "border-gold/20 bg-midnight-light/50"
          : "border-border/60 bg-card",
        className,
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "text-2xl font-serif flex items-center gap-2",
            isStory ? "text-parchment" : "text-foreground",
          )}
        >
          <BookMarked className="h-5 w-5 text-gold shrink-0" aria-hidden />
          Primary references
        </CardTitle>
        <CardDescription className={isStory ? "text-parchment/60" : undefined}>
          Works this article draws on for names, plot, and chronology.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sources.map((c, i) => (
            <li
              key={`${c.title}-${c.author ?? ""}-${i}`}
              className={cn(
                "rounded-lg border p-4",
                isStory
                  ? "border-gold/15 bg-midnight/30"
                  : "border-border/50 bg-muted/30",
              )}
            >
              <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                <cite className="font-serif font-semibold not-italic text-gold">
                  {c.title}
                </cite>
                {c.author && (
                  <span
                    className={cn(
                      "text-sm",
                      isStory ? "text-parchment/80" : "text-muted-foreground",
                    )}
                  >
                    — {c.author}
                  </span>
                )}
                {c.type && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase tracking-wide",
                      c.type === "primary"
                        ? "border-gold/40 text-gold/90"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {c.type}
                  </Badge>
                )}
              </div>
              {formatLocation(c) && (
                <p
                  className={cn(
                    "mt-2 text-sm font-mono",
                    isStory ? "text-parchment/55" : "text-muted-foreground",
                  )}
                >
                  {formatLocation(c)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
