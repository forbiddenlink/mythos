import "server-only";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { InlineMarkdown } from "@/components/content/reading-prose";
import sourcesData from "@/data/sources.json";
import { cn } from "@/lib/utils";

export interface FurtherReadingReference {
  sourceId: string;
  note?: string;
}

interface SourceWork {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  type: string;
  language?: string;
  externalUrl?: string;
  translators?: Array<{ name: string; year: number }>;
}

const works = sourcesData as unknown as SourceWork[];

const TYPE_LABEL: Record<string, string> = {
  "ancient-text": "Ancient text",
  translation: "Translation",
  academic: "Scholarship",
};

// Ancient texts first, then translations, then scholarship.
const TYPE_ORDER = ["ancient-text", "translation", "academic"];

function typeRank(type: string): number {
  const index = TYPE_ORDER.indexOf(type);
  return index === -1 ? TYPE_ORDER.length : index;
}

interface ReferencesListProps {
  /** Works in the source catalog, each with an optional editorial note. */
  references?: FurtherReadingReference[];
  /** Editorial bibliography lines (plain text with *emphasis*). */
  lines?: string[];
  title?: string;
  className?: string;
}

/**
 * "Further reading": one list for catalogued works (linked to their source
 * records) and editorial bibliography lines, so an entry never shows the
 * same books twice under two headings.
 */
export function ReferencesList({
  references = [],
  lines = [],
  title = "Further reading",
  className,
}: ReferencesListProps) {
  const resolved: Array<SourceWork & { note?: string }> = [];
  for (const ref of references) {
    const work = works.find((w) => w.id === ref.sourceId);
    if (work) resolved.push({ ...work, note: ref.note });
  }
  resolved.sort((a, b) => typeRank(a.type) - typeRank(b.type));

  if (resolved.length === 0 && lines.length === 0) return null;

  return (
    <section
      aria-labelledby="further-reading-heading"
      className={cn(className)}
    >
      <h3 id="further-reading-heading" className="type-h3 text-foreground">
        {title}
      </h3>
      <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
        {resolved.map((work) => (
          <li key={work.id} className="py-3">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <Link
                href={`/sources/${work.id}`}
                className="font-body text-[1.125rem] italic text-foreground underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
              >
                {work.title}
              </Link>
              <span className="type-meta text-muted-foreground">
                {[work.author, work.year, TYPE_LABEL[work.type] ?? work.type]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </p>
            {work.note ? (
              <p className="mt-1 type-ui text-foreground/85">{work.note}</p>
            ) : null}
            {work.translators?.length ? (
              <p className="mt-1 type-meta text-muted-foreground">
                Recommended translations:{" "}
                {work.translators
                  .slice(0, 2)
                  .map((t) => `${t.name} (${t.year})`)
                  .join(", ")}
              </p>
            ) : null}
            {work.externalUrl ? (
              <a
                href={work.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex min-h-10 items-center gap-1.5 type-ui text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
              >
                Read online
                <span className="sr-only">
                  : {work.title} (opens in new tab)
                </span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </li>
        ))}
        {lines.map((line) => (
          <li
            key={line}
            className="break-words py-3 type-ui leading-relaxed text-foreground/90"
          >
            <InlineMarkdown text={line} />
          </li>
        ))}
      </ul>
      <p className="mt-3 type-meta text-muted-foreground">
        An editorial selection, not a full bibliography. Browse every text on
        the{" "}
        <Link
          href="/sources"
          className="text-gold-text underline underline-offset-2"
        >
          Sources
        </Link>{" "}
        page.
      </p>
    </section>
  );
}
