import Link from "next/link";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChangelogType = "feature" | "fix" | "content";

export interface ChangelogEntryData {
  id: string;
  date: string;
  version: string;
  title: string;
  description: string;
  changes: string[];
  type: ChangelogType;
}

interface ChangelogEntryProps {
  entry: ChangelogEntryData;
  isLast?: boolean;
}

const TYPE_LABEL: Record<ChangelogType, string> = {
  feature: "Feature",
  fix: "Fix",
  content: "Content",
};

const TYPE_DOT: Record<ChangelogType, string> = {
  feature: "bg-gold",
  fix: "bg-bronze",
  content: "bg-patina",
};

/**
 * One release on the changelog timeline: date and version on the left rail,
 * the release notes in a reading column on the right.
 */
export function ChangelogEntry({
  entry,
  isLast = false,
}: Readonly<ChangelogEntryProps>) {
  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <article
      id={entry.id}
      aria-labelledby={`release-${entry.id}`}
      className="relative grid scroll-mt-24 gap-3 pb-12 pl-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10 md:pl-0"
    >
      {/* Rail: a line through the dots on phones, beside the dates on desktop */}
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute top-3 bottom-0 left-[5px] w-px bg-border md:left-[calc(10rem+1.25rem)]"
        />
      ) : null}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 left-0 size-[11px] rounded-full ring-4 ring-background md:left-[calc(10rem+1.25rem-5px)]",
          TYPE_DOT[entry.type],
        )}
      />

      <div className="md:pt-0.5 md:text-right">
        <p className="type-ui font-medium text-foreground">
          <time dateTime={entry.date}>{formattedDate}</time>
        </p>
        <p className="type-meta text-muted-foreground">
          <span className="font-mono">v{entry.version}</span>
          <span aria-hidden="true"> · </span>
          {TYPE_LABEL[entry.type]}
        </p>
      </div>

      <div className="min-w-0 max-w-reading md:pl-10">
        <div className="flex items-start gap-2">
          <h2
            id={`release-${entry.id}`}
            className="font-serif text-xl font-semibold leading-snug text-foreground md:text-2xl"
          >
            {entry.title}
          </h2>
          {/* No query string: the link must show the entry whatever filter is active. */}
          <Link
            href={`/changelog#${entry.id}`}
            aria-label="Link to this entry"
            title="Link to this entry"
            className="-m-2 mt-0 inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <Link2 className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-2 type-reading text-muted-foreground">
          {entry.description}
        </p>
        {entry.changes.length > 0 ? (
          <ul className="mt-4 space-y-2 type-ui text-foreground/90">
            {entry.changes.map((change, index) => (
              <li key={`${change}-${index}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-px w-3 shrink-0 bg-gold"
                />
                <span className="leading-relaxed">{change}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
