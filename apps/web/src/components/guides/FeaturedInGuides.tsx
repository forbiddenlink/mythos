import Link from "next/link";
import { type GuideEntityKind, guidesFeaturing } from "@/lib/guides";
import { cn } from "@/lib/utils";

/**
 * A small "Featured in" note linking an entry to the guides that discuss it.
 * Renders nothing when no guide features the entry.
 */
export function FeaturedInGuides({
  kind,
  id,
  className,
}: Readonly<{ kind: GuideEntityKind; id: string; className?: string }>) {
  const guides = guidesFeaturing(kind, id);
  if (guides.length === 0) return null;

  return (
    <aside
      aria-label="Featured in guides"
      className={cn(
        "max-w-[68ch] border-l-2 border-gold/50 py-1 pl-4",
        className,
      )}
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Featured in
      </p>
      <ul className="mt-1 space-y-1">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="font-body text-lg text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
            >
              {guide.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
