import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getAppearsIn } from "@/lib/appears-in";

interface AppearsInProps {
  entityId: string;
  kind: "deity" | "hero";
  className?: string;
}

/**
 * "Appears in" — derived from sources.json's `characters` field, not
 * hand-maintained per deity/hero. See src/lib/appears-in.ts.
 */
export function AppearsIn({ entityId, kind, className }: AppearsInProps) {
  const entries = getAppearsIn(entityId, kind);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className={className ?? "max-w-[68ch]"}>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-1 border-l-4 border-gold pl-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-gold" />
        Appears In
      </h2>
      <p className="text-muted-foreground text-sm mb-5 pl-5">
        Ancient and classical works featuring this figure
      </p>
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li
            key={`${entry.sourceId}-${entry.where}`}
            className="border-l-2 border-gold/30 pl-4"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <Link
                href={`/sources/${entry.sourceId}`}
                className="font-medium text-foreground hover:text-gold transition-colors"
              >
                {entry.title}
              </Link>
              {entry.author && (
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {entry.author}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {entry.role} ({entry.where})
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
