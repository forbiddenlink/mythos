import type * as React from "react";
import Link from "next/link";
import type { MuseumObject } from "@/lib/museum";
import { cn } from "@/lib/utils";

/* Small shared pieces for entity pages built on DetailLayout. */

/** A quiet underlined link for fact values and running text. */
export function FactLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
    >
      {children}
    </Link>
  );
}

/** Class names for icon controls on the (always dark) DetailHero. */
export const heroIconButtonClass =
  "flex size-10 items-center justify-center rounded-full border border-parchment/25 text-parchment hover:border-gold/60 hover:bg-white/10";
export const heroShareClass =
  "[&_button]:h-10 [&_button]:rounded-full [&_button]:px-4";

/** Caption for a museum object used as a hero portrait. */
export function MuseumPortraitCaption({ object }: { object: MuseumObject }) {
  return (
    <figcaption className="space-y-0.5 type-meta text-parchment/80">
      <span className="block font-serif text-[0.9375rem] text-parchment">
        {object.title}
      </span>
      <span className="block">
        {[object.date, object.medium].filter(Boolean).join(" · ")}
      </span>
      <a
        href={object.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block underline underline-offset-4 hover:text-parchment"
      >
        {object.institution}
        {object.accessionNumber ? ` · ${object.accessionNumber}` : ""}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span className="block">{object.imageRights}</span>
    </figcaption>
  );
}

/** A numbered manuscript list (deeds, powers, events). */
export function NumberedList({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "divide-y divide-border/70 border-y border-border/70",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item}
          className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2 py-3.5"
        >
          <span
            aria-hidden="true"
            className="pt-0.5 font-serif text-[0.9375rem] font-semibold tabular-nums text-gold-text"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-body text-[1.125rem] leading-relaxed text-foreground/90">
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Quiet chips for tags inside the article (themes, powers, abilities). */
export function TagList({
  items,
  label,
  className,
}: {
  items: readonly string[];
  label: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-sm text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Stack of article sections with the page's one vertical rhythm. */
export function ArticleStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-16 md:space-y-20">{children}</div>;
}
