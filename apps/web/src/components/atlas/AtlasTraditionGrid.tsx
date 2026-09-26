import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPantheonColor } from "@/lib/pantheon-colors";

export interface AtlasGridFigure {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
}

export interface AtlasGridTradition {
  id: string;
  name: string;
  /** Pantheon page slug, when the tradition has one. */
  slug?: string;
  /** Figures ordered by importance. */
  figures: AtlasGridFigure[];
}

/** Portraits shown per tradition; the rest are listed by name. */
const PORTRAITS = 5;

/**
 * Every deity on the Aether Map, grouped by tradition: the leading figures as
 * portraits, the rest as a name list. Server-rendered, so it is the complete,
 * keyboard- and screen-reader-navigable index of the star map, and the whole
 * experience when motion is reduced or 3D is unavailable.
 */
export function AtlasTraditionGrid({
  traditions,
}: Readonly<{ traditions: AtlasGridTradition[] }>) {
  return (
    <div className="grid gap-x-14 gap-y-14 lg:grid-cols-2">
      {traditions.map((tradition) => {
        const color = getPantheonColor(tradition.id);
        const withPortraits = tradition.figures.filter((f) => f.imageUrl);
        const featured = withPortraits.slice(0, PORTRAITS);
        const featuredIds = new Set(featured.map((f) => f.id));
        const rest = tradition.figures.filter((f) => !featuredIds.has(f.id));
        const headingId = `atlas-${tradition.id}`;
        return (
          <section
            key={tradition.id}
            aria-labelledby={headingId}
            className="min-w-0"
          >
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/70 pb-3">
              <h3
                id={headingId}
                className="flex items-center gap-2.5 font-serif text-xl font-semibold text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {tradition.name}
              </h3>
              <p className="flex shrink-0 items-center gap-3 type-meta text-muted-foreground">
                <span className="tabular-nums">
                  {tradition.figures.length}{" "}
                  {tradition.figures.length === 1 ? "figure" : "figures"}
                </span>
                {tradition.slug ? (
                  <Link
                    href={`/pantheons/${tradition.slug}`}
                    className="inline-flex min-h-11 items-center gap-1 font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                    aria-label={`${tradition.name} pantheon`}
                  >
                    Pantheon
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </p>
            </div>

            {featured.length > 0 ? (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {featured.map((figure) => (
                  <li key={figure.id}>
                    <Link
                      href={`/deities/${figure.slug}`}
                      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                    >
                      <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                        <Image
                          src={figure.imageUrl as string}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 7.5rem, (min-width: 640px) 18vw, 30vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      </span>
                      <span className="mt-1.5 block truncate type-ui font-medium text-foreground group-hover:text-gold-text">
                        {figure.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {rest.length > 0 ? (
              <ul
                aria-label={`More ${tradition.name} figures`}
                className="mt-4 flex flex-wrap gap-x-1 gap-y-0.5 type-ui text-muted-foreground"
              >
                {rest.map((figure, index) => (
                  <li key={figure.id} className="inline-flex items-center">
                    <Link
                      href={`/deities/${figure.slug}`}
                      className="inline-flex min-h-8 items-center text-foreground/85 underline decoration-border underline-offset-4 hover:text-gold-text hover:decoration-current"
                    >
                      {figure.name}
                    </Link>
                    {index < rest.length - 1 ? (
                      <span aria-hidden="true" className="ml-1 text-border">
                        ·
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
