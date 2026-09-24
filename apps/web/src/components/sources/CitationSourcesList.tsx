"use client";

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

  return (
    <section
      className={cn(
        "border-y py-6",
        variant === "story" ? "border-gold/20" : "border-border",
        className,
      )}
      aria-label="References"
    >
      <h2 className="page-section-title text-foreground">References</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sources cited in this article.
      </p>
      <ol className="mt-5 divide-y divide-border">
        {sources.map((source, index) => (
          <li
            key={`${source.title}-${source.author ?? ""}-${index}`}
            className="grid grid-cols-[auto_1fr] gap-4 py-4 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="pt-1 text-sm tabular-nums text-muted-foreground"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <cite className="break-words font-serif font-medium not-italic text-foreground">
                  {source.url && /^https?:\/\//.test(source.url) ? (
                    <a
                      href={source.url}
                      className="text-gold-text underline underline-offset-4"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </cite>
                {source.type && (
                  <span className="text-xs capitalize text-muted-foreground">
                    {source.type}
                  </span>
                )}
              </div>
              {source.author && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {source.author}
                </p>
              )}
              {formatLocation(source) && (
                <p className="mt-2 text-sm text-foreground">
                  {formatLocation(source)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
