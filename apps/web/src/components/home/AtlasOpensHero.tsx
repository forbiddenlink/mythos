import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AtlasCounts {
  pantheons: number;
  deities: number;
  stories: number;
}

interface AtlasOpensHeroProps {
  counts: AtlasCounts;
}

const studyPaths = [
  {
    title: "Follow a family tree",
    description: "See how gods, heroes, and generations connect.",
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

/** A single, server-rendered composition that stays in the document's scroll flow. */
export function AtlasOpensHero({ counts }: AtlasOpensHeroProps) {
  return (
    <section
      aria-labelledby="atlas-title"
      className="relative isolate overflow-hidden bg-midnight text-parchment"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[url('/hero-columns.webp')] bg-cover bg-center opacity-45" />
        <div className="absolute inset-0 bg-linear-to-r from-midnight via-midnight/80 to-midnight/30" />
        <div className="absolute inset-0 bg-linear-to-t from-midnight via-transparent to-midnight/20" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 pt-16 pb-8 sm:px-8 md:pt-24 lg:pt-32">
        <div className="grid items-end gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="mb-6 font-sans text-sm font-medium uppercase tracking-widest text-gold-light">
              An atlas of world mythology
            </p>
            <h1
              id="atlas-title"
              className="font-serif text-display font-semibold text-parchment"
            >
              Mythos Atlas
            </h1>
            <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-parchment/90 md:text-2xl">
              Meet the gods. Follow their stories. Discover how people across{" "}
              {counts.pantheons} traditions imagined their world.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/pantheons">
                  Explore the pantheons <ArrowRight />
                </Link>
              </Button>
              <Link
                href="/stories"
                className="inline-flex min-h-12 items-center gap-2 px-4 text-base font-medium text-parchment underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Read a myth <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-parchment/75">
              {counts.deities} deities · {counts.stories} stories · Free to
              explore
            </p>
          </div>

          <nav
            aria-label="Ways to study"
            className="border-t border-gold/30 lg:border-t-0 lg:border-l lg:pl-8"
          >
            <p className="pt-6 pb-2 text-sm uppercase tracking-widest text-gold-light lg:pt-0">
              Look a little closer
            </p>
            <ul className="divide-y divide-gold/20">
              {studyPaths.map((path) => (
                <li key={path.href}>
                  <Link
                    href={path.href}
                    className="group block py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  >
                    <span className="flex items-center justify-between gap-4 font-serif text-lg text-parchment group-hover:text-gold-light">
                      {path.title}
                      <ArrowRight
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-parchment/75">
                      {path.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-gold/20 pt-6 md:mt-20">
          <a
            href="#featured-pantheons"
            className="inline-flex min-h-11 items-center gap-3 text-sm text-parchment/80 hover:text-parchment focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Begin with a tradition{" "}
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
