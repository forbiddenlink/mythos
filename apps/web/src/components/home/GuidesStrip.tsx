import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GUIDES } from "@/lib/guides";

/**
 * Homepage strip linking the editorial guides: a manuscript list, not a card
 * grid, so it sits quietly between the showcase sections. Server-rendered.
 */
export function GuidesStrip() {
  return (
    <section
      aria-labelledby="guides-strip-heading"
      className="container mx-auto px-4 py-16"
    >
      <div className="mx-auto max-w-5xl border-y border-gold/25 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-text">
              Guides
            </p>
            <h2
              id="guides-strip-heading"
              className="page-section-title text-foreground"
            >
              The myths behind the story
            </h2>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 font-body text-lg text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
          >
            All guides
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="font-serif text-xl text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
              >
                {guide.shortTitle}
              </Link>
              <p className="mt-1 font-body text-muted-foreground">
                {guide.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
