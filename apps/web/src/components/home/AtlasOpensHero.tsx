import type * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export interface IndexEntry {
  name: string;
  slug: string;
  deities: number;
  /** Tradition colour (lib/pantheon-colors.ts), used for the index tab. */
  color: string;
}

interface AtlasCounts {
  pantheons: number;
  deities: number;
  stories: number;
}

export interface HeroFigure {
  name: string;
  slug: string;
  imageUrl: string;
  tradition: string;
}

interface AtlasOpensHeroProps {
  counts: AtlasCounts;
  /** The frontispiece plate, chosen on the server. */
  figure?: HeroFigure;
  /** Every tradition, for the printed index under the title. */
  index: IndexEntry[];
}

const studyPaths = [
  {
    title: "Follow a family tree",
    description: "See how gods, heroes and generations connect.",
    href: "/family-tree",
  },
  {
    title: "Read with the sources",
    description: "Compare a myth with the texts and objects behind it.",
    href: "/paths#study-guides",
  },
  {
    title: "Test what you know",
    description: "Practice with a quiz, then revisit what you missed.",
    href: "/quiz",
  },
] as const;

/**
 * "The Atlas Opens", set as a title page: the brand as the headline, one
 * mounted plate as the frontispiece, and an index of every tradition with
 * leader dots, the way a printed atlas opens. One server-rendered
 * composition; the plate is the only image, and it is the LCP element.
 */
export function AtlasOpensHero({ counts, figure, index }: AtlasOpensHeroProps) {
  return (
    <section
      aria-labelledby="atlas-title"
      className="dark relative isolate overflow-hidden bg-midnight text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_82%_30%,color-mix(in_oklch,var(--gold)_14%,transparent),transparent_70%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(8.333%-1px),color-mix(in_oklch,var(--gold)_7%,transparent)_calc(8.333%-1px),color-mix(in_oklch,var(--gold)_7%,transparent)_8.333%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-midnight to-transparent" />
      </div>

      <Container className="pt-8 pb-10 sm:pt-12 lg:pt-14 lg:pb-14">
        <p className="runhead mb-8 text-gold-light lg:mb-12">
          <span>An atlas of world mythology</span>
          <span className="hidden text-parchment/70 sm:inline">
            {counts.deities} deities, {counts.stories} stories
          </span>
        </p>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <h1 id="atlas-title" className="type-display text-parchment">
              Mythos
              <br />
              Atlas
            </h1>
            <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-parchment/90 md:text-[1.5rem] md:leading-snug">
              Meet the gods. Follow their stories. Discover how people across{" "}
              {counts.pantheons} traditions imagined their world.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="gold"
                size="lg"
                className="h-auto max-w-full whitespace-normal px-4 py-3 text-center sm:px-8"
              >
                <Link href="/pantheons">
                  Explore the pantheons <ArrowRight />
                </Link>
              </Button>
              <Link
                href="/stories"
                className="inline-flex min-h-12 items-center gap-2 rounded-md px-4 text-base font-medium text-parchment ring-1 ring-parchment/25 transition-colors hover:bg-white/5 hover:ring-parchment/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Read a myth <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {figure ? (
            <figure className="mx-auto w-full max-w-[19rem] sm:max-w-[22rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none lg:pt-2">
              <Link
                href={`/deities/${figure.slug}`}
                className="plate plate-paper block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                style={
                  {
                    "--plate-accent": "var(--gold)",
                  } as React.CSSProperties
                }
              >
                <span className="plate-art block aspect-4/5">
                  <Image
                    src={figure.imageUrl}
                    alt={`${figure.name}, ${figure.tradition}`}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 1280px) 28rem, (min-width: 1024px) 25rem, 22rem"
                    className="object-cover object-top"
                  />
                </span>
                <span className="plate-caption">
                  <span>Frontispiece</span>
                  <i>
                    {figure.name}, {figure.tradition}
                  </i>
                </span>
              </Link>
              <figcaption className="mt-3 text-xs text-parchment/65">
                Catalog pictures are illustrations, not historical artworks.{" "}
                <Link
                  href="/about#images"
                  className="underline underline-offset-2 hover:text-parchment"
                >
                  About our images
                </Link>
              </figcaption>
            </figure>
          ) : null}

          <nav aria-label="Index of traditions" className="min-w-0 lg:col-start-1 lg:row-start-2">
            <h2 className="runhead mb-1 text-parchment/80">
              <span>Index of traditions</span>
              <span>Deities</span>
            </h2>
            <ol className="columns-2 gap-x-6 sm:gap-x-10 xl:columns-3 [&>li]:break-inside-avoid">
              {index.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/pantheons/${entry.slug}`}
                    className="index-line group min-h-11 items-center text-[0.9375rem] text-parchment/85 transition-colors hover:text-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-1 shrink-0 rounded-[1px]"
                        style={{ backgroundColor: entry.color }}
                        aria-hidden="true"
                      />
                      {entry.name
                          .replace(/\s+(Pantheon|Tradition|Traditions)\b/g, "")
                          .replace(/\s*\([^)]*\)/g, "")}
                    </span>
                    <span className="tabular-nums text-parchment/70">
                      {entry.deities}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <nav
          aria-label="Ways to study"
          className="mt-12 border-t border-parchment/15 lg:mt-16"
        >
          <ul className="grid sm:grid-cols-3 sm:divide-x sm:divide-parchment/15">
            {studyPaths.map((path) => (
              <li key={path.href} className="sm:px-6 sm:first:pl-0">
                <Link
                  href={path.href}
                  className="group block py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  <span className="flex items-center justify-between gap-4 font-serif text-lg text-parchment group-hover:text-gold-light">
                    {path.title}
                    <ArrowRight
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-parchment/75">
                    {path.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
