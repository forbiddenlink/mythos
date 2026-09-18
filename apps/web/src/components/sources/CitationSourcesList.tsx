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
  url?: string;
  author?: string;
  lines?: string;
  book?: string;
  chapters?: string;
  chapter?: string;
  type?: string;
}

interface CitationSourcesListProps {
  sources: CitationSourceItem[];
  /** Controls border emphasis; both variants follow the active theme. */
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
          ? "border-gold/20 bg-card"
          : "border-border/60 bg-card",
        className,
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "text-2xl font-serif flex items-center gap-2",
            isStory ? "text-foreground" : "text-foreground",
          )}
        >
          <BookMarked className="h-5 w-5 text-gold-text shrink-0" aria-hidden />
          References
        </CardTitle>
        <CardDescription className={isStory ? "text-muted-foreground" : undefined}>
          Sources used for this article.
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
                  ? "border-gold/15 bg-muted/30"
                  : "border-border/50 bg-muted/30",
              )}
            >
              <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                <cite className="font-serif font-semibold not-italic text-gold-text break-words">
                  {c.url && /^https?:\/\//.test(c.url) ? (
                    <a href={c.url} className="underline underline-offset-4 hover:text-gold-text">
                      {c.title}
                    </a>
                  ) : c.title}
                </cite>
                {c.author && (
                  <span
                    className={cn(
                      "text-sm",
                      isStory ? "text-foreground" : "text-muted-foreground",
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
                        ? "border-gold/40 text-gold-text"
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
                    isStory ? "text-muted-foreground" : "text-muted-foreground",
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
