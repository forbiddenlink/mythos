import Link from "next/link";
import { getAppearsIn } from "@/lib/appears-in";

interface AppearsInProps {
  entityId: string;
  kind: "deity" | "hero";
  className?: string;
}

/**
 * "Appears in": the works that feature a figure, derived from sources.json's
 * `characters` field rather than maintained per entry. See src/lib/appears-in.ts.
 */
export function AppearsIn({ entityId, kind, className }: AppearsInProps) {
  const entries = getAppearsIn(entityId, kind);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="appears-in-heading" className={className}>
      <h3 id="appears-in-heading" className="type-h3 text-foreground">
        Appears in
      </h3>
      <p className="mt-1.5 type-ui text-muted-foreground">
        Ancient and classical works featuring this figure.
      </p>
      <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
        {entries.map((entry) => (
          <li key={`${entry.sourceId}-${entry.where}`} className="py-3">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <Link
                href={`/sources/${entry.sourceId}`}
                className="font-body text-[1.125rem] italic text-foreground underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
              >
                {entry.title}
              </Link>
              {entry.author ? (
                <span className="type-meta text-muted-foreground">
                  {entry.author}
                </span>
              ) : null}
            </p>
            <p className="mt-1 type-ui text-foreground/85">
              {entry.role}{" "}
              <span className="text-muted-foreground">({entry.where})</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
