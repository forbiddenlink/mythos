import { InlineMarkdown } from "@/components/content/reading-prose";
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
  /** Kept for callers; both variants share one style now. */
  variant?: "story" | "deity";
  title?: string;
  className?: string;
}

function formatLocation(c: CitationSourceItem): string | null {
  const parts = [c.book, c.chapter, c.chapters, c.lines].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** The works an article cites, numbered, with the passage located. */
export function CitationSourcesList({
  sources,
  title = "Works cited",
  className,
}: CitationSourcesListProps) {
  if (!sources?.length) return null;

  return (
    <section className={cn(className)} aria-labelledby="works-cited-heading">
      <h3 id="works-cited-heading" className="type-h3 text-foreground">
        {title}
      </h3>
      <ol className="mt-4 divide-y divide-border/70 border-y border-border/70">
        {sources.map((source, index) => {
          const location = formatLocation(source);
          return (
            <li
              key={`${source.title}-${source.author ?? ""}-${index}`}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 py-3"
            >
              <span
                aria-hidden="true"
                className="pt-0.5 type-meta tabular-nums text-muted-foreground"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <cite className="break-words font-body text-[1.125rem] italic text-foreground">
                    {source.url && /^https?:\/\//.test(source.url) ? (
                      <a
                        href={source.url}
                        className="text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                      >
                        <InlineMarkdown text={source.title} />
                      </a>
                    ) : (
                      <InlineMarkdown text={source.title} />
                    )}
                  </cite>
                  {source.type && (
                    <span className="type-meta capitalize text-muted-foreground">
                      {source.type}
                    </span>
                  )}
                </p>
                {source.author || location ? (
                  <p className="mt-0.5 type-ui text-muted-foreground">
                    {[source.author, location].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
