export interface MythVariant {
  source: string;
  passage?: string;
  sourceUrl?: string;
  translator?: string;
  date?: string;
  difference: string;
  note?: string;
}

/**
 * Alternate tellings recorded for a story: which source, when, and how it
 * differs. Content only; the page's <ArticleSection> supplies the heading.
 */
export function MythVariants({ variants }: { variants: MythVariant[] }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div>
      <ul className="divide-y divide-border/70 border-y border-border/70">
        {variants.map((variant) => (
          <li key={variant.source} className="py-5">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <cite className="font-serif text-[1.0625rem] font-semibold not-italic text-foreground">
                {variant.source}
              </cite>
              {variant.date ? (
                <span className="type-meta text-muted-foreground">
                  {variant.date}
                </span>
              ) : null}
            </p>
            <p className="mt-2 type-reading text-foreground/90">
              {variant.difference}
            </p>
            {variant.note ? (
              <p className="mt-2 type-ui text-muted-foreground">
                <span className="font-medium text-foreground">Note: </span>
                {variant.note}
              </p>
            ) : null}
            {variant.sourceUrl && /^https?:\/\//.test(variant.sourceUrl) ? (
              <p className="mt-1 type-ui text-muted-foreground">
                <a
                  href={variant.sourceUrl}
                  className="inline-flex min-h-10 items-center text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                >
                  Read {variant.passage ?? "the source"}
                </a>
                {variant.translator ? (
                  <span className="block">
                    Translation: {variant.translator}. The account above is an
                    editorial summary.
                  </span>
                ) : null}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 type-meta text-muted-foreground">
        Myths changed across centuries and communities; these differences are
        part of how the stories were preserved.
      </p>
    </div>
  );
}
