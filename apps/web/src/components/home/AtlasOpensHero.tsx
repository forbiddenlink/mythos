import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

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
  /** Six portraits for the mosaic, chosen on the server. */
  figures: HeroFigure[];
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

function MosaicTile({
  figure,
  priority,
  className,
}: {
  figure: HeroFigure;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/deities/${figure.slug}`}
      className={`group relative block overflow-hidden rounded-md bg-midnight-light shadow-xl shadow-black/40 ring-1 ring-gold/20 transition-shadow hover:ring-gold/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${className ?? ""}`}
    >
      <span className="relative block aspect-4/5">
        <Image
          src={figure.imageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 13rem, (min-width: 1024px) 11rem, 30vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span
          className="absolute inset-0 bg-linear-to-t from-midnight/90 via-midnight/10 to-transparent"
          aria-hidden="true"
        />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
        <span className="block font-serif text-sm font-semibold text-parchment sm:text-base">
          {figure.name}
        </span>
        <span className="hidden text-xs text-parchment/75 sm:block">
          {figure.tradition}
        </span>
      </span>
    </Link>
  );
}

/**
 * "The Atlas Opens": one server-rendered composition in normal document flow.
 * The brand is the headline; a mosaic of portraits from the catalog shows at
 * a glance that this is a place of faces and stories.
 */
export function AtlasOpensHero({ counts, figures }: AtlasOpensHeroProps) {
  const [a, b, c, d, e, f] = figures;
  return (
    <section
      aria-labelledby="atlas-title"
      className="dark relative isolate overflow-hidden bg-midnight text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[url('/hero-columns.webp')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-linear-to-r from-midnight via-midnight/90 to-midnight/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_80%_40%,color-mix(in_oklch,var(--gold)_16%,transparent),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-midnight to-transparent" />
      </div>

      <Container className="pt-12 pb-10 sm:pt-16 lg:pt-20 lg:pb-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,38rem)]">
          <div className="max-w-2xl">
            <p className="type-eyebrow mb-5 text-gold-light">
              An atlas of world mythology
            </p>
            <h1 id="atlas-title" className="type-display text-parchment">
              Mythos Atlas
            </h1>
            <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-parchment/90 md:text-[1.5rem] md:leading-snug">
              Meet the gods. Follow their stories. Discover how people across{" "}
              {counts.pantheons} traditions imagined their world.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="gold" size="lg">
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
            <ul className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-parchment/15 pt-5 text-sm text-parchment/70">
              {(
                [
                  [counts.deities, "deities"],
                  [counts.stories, "stories"],
                  [counts.pantheons, "traditions"],
                ] as const
              ).map(([value, label]) => (
                <li key={label}>
                  <span className="mr-1.5 font-serif text-2xl font-semibold text-parchment">
                    {value}
                  </span>
                  {label}
                </li>
              ))}
              <li>Free to explore</li>
            </ul>
          </div>

          {a && b && c ? (
            <div
              className="grid grid-cols-3 gap-3 sm:gap-4"
              aria-label="Featured figures"
              role="group"
            >
              <div className="space-y-3 pt-8 sm:space-y-4 sm:pt-12">
                <MosaicTile figure={a} priority />
                {d ? (
                  <MosaicTile figure={d} className="hidden lg:block" />
                ) : null}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <MosaicTile figure={b} priority />
                {e ? (
                  <MosaicTile figure={e} className="hidden lg:block" />
                ) : null}
              </div>
              <div className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                <MosaicTile figure={c} priority />
                {f ? (
                  <MosaicTile figure={f} className="hidden lg:block" />
                ) : null}
              </div>
            </div>
          ) : null}
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
