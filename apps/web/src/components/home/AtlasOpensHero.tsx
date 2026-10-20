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
  artwork?: {
    title: string;
    date?: string;
    institution: string;
    url: string;
    alt: string;
  };
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
 * composition. The large engraved sky can be the LCP image on mobile.
 */
export function AtlasOpensHero({ counts, figure, index }: AtlasOpensHeroProps) {
  return (
    <section
      aria-labelledby="atlas-title"
      className="dark relative isolate overflow-hidden bg-midnight text-foreground"
    >
      <link
        rel="preload"
        as="image"
        href="/hero-star-chart.webp"
        crossOrigin="anonymous"
        fetchPriority="high"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="engraved-sky absolute -top-16 -right-40 aspect-[1100/1026] w-[34rem] opacity-[0.16] sm:-right-24 sm:w-[44rem] lg:-top-44 lg:right-[16%] lg:w-[60rem] lg:opacity-[0.11]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-midnight to-transparent" />
      </div>

      <Container className="pt-6 pb-8 sm:pt-10 lg:pt-12 lg:pb-12">
        <p className="runhead mb-6 text-gold-light lg:mb-10">
          <span>An atlas of world mythology</span>
          <span className="hidden text-parchment/70 sm:inline">
            {counts.deities} deities, {counts.stories} stories
          </span>
        </p>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:grid-rows-[auto_1fr] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <h1 id="atlas-title" className="type-display text-parchment">
              Mythos <span className="sm:block">Atlas</span>
            </h1>
            <p className="mt-4 max-w-xl font-body text-xl leading-relaxed text-parchment/90 md:text-[1.5rem] md:leading-snug">
              Meet the gods. Follow their stories. Discover how people across{" "}
              {counts.pantheons} traditions imagined their world.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button
                asChild
                variant="gold"
                size="lg"
                className="h-auto max-w-full whitespace-normal px-3 py-3 text-center sm:px-6"
              >
                <Link href="/pantheons">
                  Explore the pantheons <ArrowRight />
                </Link>
              </Button>
              <Link
                href="/stories"
                className="inline-flex min-h-12 items-center gap-2 rounded-md text-base font-medium text-parchment decoration-gold/60 underline-offset-4 transition-colors hover:text-gold-light hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Read a myth <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {figure ? (
            <figure className="mx-auto w-full max-w-[17rem] sm:max-w-[22rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none lg:pt-2">
              <Link
                href={`/deities/${figure.slug}`}
                className="plate plate-paper group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                style={
                  {
                    "--plate-accent": "var(--gold)",
                  } as React.CSSProperties
                }
              >
                <span className="plate-art block aspect-3/4 bg-parchment">
                  <Image
                    src={figure.imageUrl}
                    alt={
                      figure.artwork?.alt ??
                      `${figure.name}, ${figure.tradition}`
                    }
                    fill
                    loading="eager"
                    fetchPriority="high"
                    sizes="(min-width: 1280px) 22.5rem, (min-width: 1024px) 21.5rem, (min-width: 640px) 20.5rem, 15.5rem"
                    className="object-contain motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.025]"
                  />
                </span>
                <span className="plate-caption">
                  <span>Frontispiece</span>
                  <i>
                    {figure.name}, {figure.tradition}
                  </i>
                </span>
              </Link>
              <figcaption className="mt-3 type-meta leading-relaxed text-parchment/80">
                {figure.artwork ? (
                  <>
                    <span className="block font-body text-base text-parchment">
                      {figure.artwork.title}
                    </span>
                    <span>{figure.artwork.date}. </span>
                    <a
                      href={figure.artwork.url}
                      className="underline underline-offset-2 hover:text-parchment focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                    >
                      {figure.artwork.institution}
                    </a>
                    <span className="block text-parchment/65">
                      Public-domain photograph
                    </span>
                  </>
                ) : (
                  <>
                    Catalog illustration.{" "}
                    <Link
                      href="/about#images"
                      className="underline underline-offset-2"
                    >
                      About our images
                    </Link>
                  </>
                )}
              </figcaption>
            </figure>
          ) : null}

          <nav
            aria-label="Index of traditions"
            className="min-w-0 lg:col-start-1 lg:row-start-2"
          >
            <h2 className="runhead mb-1 text-parchment/80">
              <span>Index of traditions</span>
              <span className="sr-only">, </span>
              <span>Deities</span>
            </h2>
            <ol className="columns-[8rem] gap-x-6 sm:gap-x-10 xl:columns-3 [&>li]:break-inside-avoid">
              {index.slice(0, 6).map((entry) => (
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
            <Link
              href="/pantheons"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-gold-light underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              All {counts.pantheons} traditions{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <nav
          aria-label="Ways to study"
          className="mt-8 border-t border-parchment/15 lg:mt-10"
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
                      className="size-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
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
