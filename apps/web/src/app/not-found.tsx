import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { OpenSearchButton } from "@/components/search/OpenSearchButton";
import {
  getDeities,
  getPantheonShortNames,
  getStories,
} from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = {
  ...generateBaseMetadata({
    title: "Page Not Found",
    description:
      "The page you requested does not exist. Continue exploring Mythos Atlas through pantheons, deities, and stories.",
    url: "/404",
  }),
  robots: { index: false, follow: true },
};

// Well-known figures with portraits; the page shows three, rotating hourly.
const FEATURED_SLUGS = [
  "athena",
  "odin",
  "isis",
  "amaterasu",
  "shiva",
  "quetzalcoatl",
  "anubis",
  "freyja",
  "apollo",
];

const SECTIONS: Array<{ href: string; label: string; mark: MythosMarkId }> = [
  { href: "/pantheons", label: "Pantheons", mark: "temple" },
  { href: "/deities", label: "Deities", mark: "laurel" },
  { href: "/stories", label: "Stories", mark: "scroll" },
  { href: "/creatures", label: "Creatures", mark: "serpent" },
  { href: "/family-tree", label: "Family tree", mark: "tree" },
  { href: "/quiz", label: "Quizzes", mark: "lyre" },
];

function pickSuggestions() {
  const hour = Math.floor(Date.now() / (1000 * 60 * 60));
  const deities = getDeities();
  const names = getPantheonShortNames();
  const featured = FEATURED_SLUGS.flatMap((slug) => {
    const deity = deities.find((d) => d.slug === slug);
    return deity?.imageUrl
      ? [
          {
            name: deity.name,
            slug: deity.slug,
            imageUrl: deity.imageUrl,
            tradition: names[deity.pantheonId] ?? "",
          },
        ]
      : [];
  });
  const start = featured.length > 0 ? hour % featured.length : 0;
  const figures = [0, 1, 2]
    .map((offset) => featured[(start + offset) % featured.length])
    .filter(Boolean);

  const stories = getStories();
  const storyStart = stories.length > 0 ? (hour * 7) % stories.length : 0;
  const tales = [0, 1, 2]
    .map((offset) => stories[(storyStart + offset * 11) % stories.length])
    .filter(Boolean)
    .map((story) => ({
      title: story.title,
      slug: story.slug,
      tradition: names[story.pantheonId] ?? "",
    }));

  return { figures, tales };
}

export default function NotFound() {
  const { figures, tales } = pickSuggestions();

  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(ellipse_60%_70%_at_20%_0%,color-mix(in_oklch,var(--gold)_14%,transparent),transparent_70%)]"
      />
      <Container className="section-space">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-xl">
            <p className="type-eyebrow flex items-center gap-2">
              <MythosMark id="compass" className="size-4" />
              Error 404 · Page not found
            </p>
            <h1 className="page-title mt-4 text-foreground">
              This path leads off the map
            </h1>
            <p className="type-lede mt-4 text-muted-foreground">
              The page you requested does not exist or may have moved. Search
              the atlas, or pick up one of the trails below.
            </p>
            <OpenSearchButton className="mt-8" />
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-5 type-ui font-semibold text-midnight transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Return home
              </Link>
              <Link
                href="/pantheons"
                className="inline-flex min-h-11 items-center gap-1.5 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
              >
                Explore pantheons
              </Link>
            </div>
          </div>

          {figures.length > 0 ? (
            <section aria-labelledby="not-found-figures">
              <h2
                id="not-found-figures"
                className="type-eyebrow mb-4 text-muted-foreground!"
              >
                Perhaps you were seeking
              </h2>
              <ul className="grid grid-cols-3 gap-3 sm:gap-4">
                {figures.map((figure) => (
                  <li key={figure.slug}>
                    <Link
                      href={`/deities/${figure.slug}`}
                      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                    >
                      <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                        <Image
                          src={figure.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 12rem, 30vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </span>
                      <span className="mt-2 block font-serif text-base font-semibold leading-tight text-foreground group-hover:text-gold-text sm:text-lg">
                        {figure.name}
                      </span>
                      <span className="block type-meta text-muted-foreground">
                        {figure.tradition}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="mt-16 grid gap-12 border-t border-border/70 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <nav aria-labelledby="not-found-sections">
            <h2 id="not-found-sections" className="type-h3 text-foreground">
              Browse the atlas
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SECTIONS.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border/70 px-3 type-ui font-medium text-foreground transition-colors hover:border-gold/50 hover:bg-gold/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <MythosMark
                      id={section.mark}
                      className="size-4 shrink-0 text-gold-text"
                    />
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {tales.length > 0 ? (
            <section aria-labelledby="not-found-tales">
              <h2 id="not-found-tales" className="type-h3 text-foreground">
                Tales to explore
              </h2>
              <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
                {tales.map((tale) => (
                  <li key={tale.slug}>
                    <Link
                      href={`/stories/${tale.slug}`}
                      className="group flex min-h-14 items-center justify-between gap-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-body text-lg text-foreground group-hover:text-gold-text">
                          {tale.title}
                        </span>
                        <span className="block type-meta text-muted-foreground">
                          {tale.tradition}
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
