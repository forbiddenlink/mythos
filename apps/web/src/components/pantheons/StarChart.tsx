import Image from "next/image";
import Link from "next/link";

export interface StarChartFigure {
  name: string;
  slug: string;
  imageUrl: string | null;
  tradition: string;
}

interface Constellation {
  slug: string;
  color: string;
  /** Star positions in the 640 × 380 chart; the label sits on the first. */
  points: [number, number][];
  labelBelow?: boolean;
}

// Five deities drawn as constellations, laid out across the chart.
const CONSTELLATIONS: Constellation[] = [
  {
    slug: "zeus",
    color: "oklch(0.86 0.12 90)",
    points: [
      [120, 70],
      [165, 108],
      [212, 50],
      [262, 96],
      [306, 66],
    ],
  },
  {
    slug: "odin",
    color: "oklch(0.82 0.08 230)",
    points: [
      [540, 58],
      [482, 104],
      [520, 150],
      [596, 118],
    ],
  },
  {
    slug: "ra",
    color: "oklch(0.8 0.13 65)",
    points: [
      [66, 250],
      [108, 216],
      [150, 262],
      [112, 304],
      [66, 250],
    ],
  },
  {
    slug: "athena",
    color: "oklch(0.88 0.02 260)",
    points: [
      [462, 262],
      [420, 300],
      [450, 348],
      [512, 312],
    ],
  },
  {
    slug: "thor",
    color: "oklch(0.72 0.12 260)",
    labelBelow: true,
    points: [
      [248, 322],
      [290, 282],
      [330, 338],
      [372, 296],
    ],
  },
];

/** Deterministic field of faint background stars (same on server and client). */
function backgroundStars(count: number) {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: Math.round(next() * 640),
    y: Math.round(next() * 380),
    r: next() > 0.85 ? 1.6 : 0.9,
    o: 0.25 + next() * 0.5,
  }));
}

const STARS = backgroundStars(90);

/**
 * "Chart the heavens": a drawn star map where five deities appear as
 * constellations. Server-rendered SVG, so it shows at once (no WebGL, no
 * loading state, no font fetch), works without JavaScript and keeps still
 * under reduced motion. The portrait links are the keyboard and screen-reader
 * path; the chart (hidden from assistive tech) repeats them for pointers.
 */
export function StarChart({ figures }: { figures: StarChartFigure[] }) {
  const bySlug = new Map(figures.map((figure) => [figure.slug, figure]));
  const drawn = CONSTELLATIONS.filter((c) => bySlug.has(c.slug));

  return (
    <section
      aria-labelledby="star-chart-heading"
      className="dark relative isolate overflow-hidden rounded-xl bg-midnight text-foreground ring-1 ring-gold/20"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_75%_40%,color-mix(in_oklch,var(--gold)_10%,transparent),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:p-10">
        <div>
          <p className="type-eyebrow text-gold-light">Star map</p>
          <h2
            id="star-chart-heading"
            className="page-section-title mt-2 text-parchment"
          >
            Chart the heavens
          </h2>
          <p className="mt-3 font-body text-lg leading-relaxed text-parchment/80">
            Five sky-rulers and protectors, drawn as constellations. Choose a
            star or a portrait to open their entry.
          </p>
          <nav aria-label="Featured deities" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {figures.map((figure) => (
                <li key={figure.slug}>
                  <Link
                    href={`/deities/${figure.slug}`}
                    className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-parchment/15 bg-parchment/5 py-1 pl-1 pr-3.5 text-[0.9375rem] text-parchment transition-colors hover:border-gold/60 hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {figure.imageUrl ? (
                      <Image
                        src={figure.imageUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 rounded-full object-cover object-top"
                      />
                    ) : null}
                    {figure.name}
                    <span className="sr-only">, {figure.tradition}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <svg
          viewBox="0 0 640 380"
          className="h-auto w-full min-w-0"
          aria-hidden="true"
          focusable="false"
        >
          <g>
            {STARS.map((star) => (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={star.r}
                fill="oklch(0.95 0.02 90)"
                opacity={star.o}
              />
            ))}
          </g>
          {drawn.map((constellation, index) => {
            const figure = bySlug.get(constellation.slug);
            if (!figure) return null;
            const [lx, ly] = constellation.points[0];
            const path = constellation.points
              .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
              .join(" ");
            return (
              <a
                key={constellation.slug}
                href={`/deities/${constellation.slug}`}
                tabIndex={-1}
                className="group/star cursor-pointer outline-none"
              >
                <path
                  d={path}
                  fill="none"
                  stroke={constellation.color}
                  strokeWidth={1.2}
                  strokeOpacity={0.45}
                  className="transition-[stroke-opacity] group-hover/star:[stroke-opacity:0.9]"
                />
                {constellation.points.map(([x, y], i) => (
                  <circle
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed star positions
                    key={i}
                    cx={x}
                    cy={y}
                    r={i === 0 ? 4 : 2.6}
                    fill={constellation.color}
                    className="[transform-box:fill-box] [transform-origin:center] motion-safe:animate-[pulse-subtle_4s_ease-in-out_infinite]"
                    style={{
                      animationDelay: `${(index * 0.7 + i * 0.4) % 4}s`,
                    }}
                  />
                ))}
                <circle
                  cx={lx}
                  cy={ly}
                  r={16}
                  fill={constellation.color}
                  opacity={0.12}
                  className="transition-opacity group-hover/star:opacity-30"
                />
                <text
                  x={lx}
                  y={constellation.labelBelow ? ly + 34 : ly - 24}
                  textAnchor="middle"
                  fill="oklch(0.95 0.02 90)"
                  className="font-serif text-[15px] tracking-[0.12em] uppercase"
                >
                  {figure.name}
                </text>
              </a>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
