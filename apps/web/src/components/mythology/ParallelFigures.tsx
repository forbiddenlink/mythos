import Image from "next/image";
import Link from "next/link";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { cn } from "@/lib/utils";

export interface ParallelFigure {
  name: string;
  /** Deity or hero page; null when the reference has no entry yet. */
  href: string | null;
  pantheonId: string;
  /** Readable tradition name; derived from the pantheon id when omitted. */
  traditionLabel?: string;
  imageUrl?: string | null;
  /** Why the figures are compared (editorial note). */
  note?: string;
  /** Side-by-side comparison page, when one exists. */
  compare?: { href: string; label: string };
}

function traditionFromPantheonId(pantheonId: string): string {
  return pantheonId
    .replace(/-pantheon$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Portrait({
  figure,
  className,
  sizes,
}: {
  figure: ParallelFigure;
  className?: string;
  sizes: string;
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border",
        className,
      )}
    >
      {figure.imageUrl ? (
        <Image
          src={figure.imageUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <span
          className="flex h-full items-center justify-center font-serif text-2xl text-gold-text"
          aria-hidden="true"
        >
          {figure.name.charAt(0)}
        </span>
      )}
    </span>
  );
}

function Tradition({ figure }: { figure: ParallelFigure }) {
  return (
    <span className="flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: getPantheonColor(figure.pantheonId) }}
        aria-hidden="true"
      />
      {figure.traditionLabel ?? traditionFromPantheonId(figure.pantheonId)}
    </span>
  );
}

/**
 * Figures that play the same role in different traditions, shown with their
 * portraits (replaces the old Rosetta wheel). `annotated` lays out one row per
 * figure with the editorial note and comparison link; `portraits` is a gallery
 * row for collections. Both collapse to a single-column list on phones so each
 * link is its own full-width touch target.
 */
export function ParallelFigures({
  label,
  figures,
  variant = "annotated",
  className,
}: {
  /** Accessible name; keep it ending in "across pantheons". */
  label: string;
  figures: ParallelFigure[];
  variant?: "annotated" | "portraits";
  className?: string;
}) {
  const members = figures.filter(
    (f, i, arr) =>
      arr.findIndex((x) => (x.href ?? x.name) === (f.href ?? f.name)) === i,
  );
  if (members.length === 0) return null;

  if (variant === "portraits") {
    return (
      <section aria-label={label} className={className}>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
          {members.map((figure) => (
            <li key={figure.href ?? figure.name}>
              <Link
                href={figure.href ?? "#"}
                className="group flex min-h-14 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:block"
              >
                <Portrait
                  figure={figure}
                  sizes="(min-width: 640px) 12rem, 3.5rem"
                  className="size-14 sm:aspect-4/5 sm:size-auto sm:w-full"
                />
                <span className="min-w-0 sm:mt-3 sm:block">
                  <span className="block font-serif text-lg leading-tight text-foreground group-hover:text-gold-text">
                    {figure.name}
                  </span>
                  <span className="mt-1 block">
                    <Tradition figure={figure} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section aria-label={label} className={className}>
      <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {members.map((figure) => {
          const head = (
            <>
              <Portrait
                figure={figure}
                sizes="(min-width: 640px) 4.5rem, 3rem"
                className="aspect-4/5 w-12 sm:w-[4.5rem]"
              />
              <span className="min-w-0">
                <Tradition figure={figure} />
                <span
                  className={cn(
                    "mt-0.5 block font-serif text-xl leading-tight text-foreground",
                    figure.href &&
                      "underline-offset-4 group-hover:text-gold-text group-hover:underline",
                  )}
                >
                  {figure.name}
                </span>
              </span>
            </>
          );
          return (
            <li key={figure.href ?? figure.name}>
              {figure.href ? (
                <Link
                  href={figure.href}
                  className="group flex min-h-11 items-center gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {head}
                </Link>
              ) : (
                <div className="flex min-h-11 items-center gap-4">{head}</div>
              )}
              {figure.note ? (
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {figure.note}
                </p>
              ) : null}
              {figure.compare ? (
                <Link
                  href={figure.compare.href}
                  className="mt-1 inline-flex min-h-11 items-center text-[0.9375rem] text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
                >
                  {figure.compare.label}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
