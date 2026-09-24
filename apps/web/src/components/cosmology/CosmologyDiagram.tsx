import Image from "next/image";
import Link from "next/link";
import type {
  Cosmology,
  CosmologyBand,
  CosmologyFigure,
} from "@/lib/cosmology";

/**
 * Cosmology plate — a pantheon's own map of the universe, drawn as stacked
 * bands from the highest heaven to the deepest abyss. When the tradition has a
 * world axis (a tree, mountain, bridge, or chain) it runs through the middle of
 * the plate, the way the sources picture it. Server-rendered, CSS only: every
 * realm, god, creature, and place is a real link, so the diagram is also the
 * accessible version.
 */

const BAND_STYLE: Record<CosmologyBand, string> = {
  beyond:
    "bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--gold)_22%,transparent),transparent_70%)]",
  sky: "bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--gold)_10%,transparent),color-mix(in_oklch,var(--midnight-light)_55%,transparent))]",
  earth:
    "bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--bronze)_16%,transparent),color-mix(in_oklch,var(--patina)_12%,transparent))]",
  water:
    "bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--patina)_22%,transparent),color-mix(in_oklch,var(--patina)_8%,transparent))]",
  under:
    "bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--bronze)_10%,var(--midnight)),var(--midnight))]",
  abyss:
    "bg-[radial-gradient(ellipse_at_bottom,oklch(0.08_0.02_265),var(--midnight))]",
};

const BAND_NAME: Record<CosmologyBand, string> = {
  beyond: "Beyond",
  sky: "Above",
  earth: "Middle",
  water: "Waters",
  under: "Below",
  abyss: "Abyss",
};

function Figure({ figure }: { figure: CosmologyFigure }) {
  return (
    <li>
      <Link
        href={figure.href}
        className="group inline-flex items-center gap-2 rounded-full border border-parchment/15 bg-midnight/60 py-0.5 pl-0.5 pr-3 text-xs text-parchment/85 transition-colors hover:border-gold/60 hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {figure.imageUrl ? (
          <Image
            src={figure.imageUrl}
            alt={figure.name}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover object-top ring-1 ring-gold/40"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 font-serif text-[0.65rem] text-gold-light ring-1 ring-gold/40"
          >
            {figure.name.charAt(0)}
          </span>
        )}
        {figure.name}
      </Link>
    </li>
  );
}

export function CosmologyDiagram({
  cosmology,
  accent,
}: {
  cosmology: Cosmology;
  accent: string;
}) {
  const { axis } = cosmology;

  return (
    <section
      aria-labelledby="cosmology-title"
      className="mb-14"
      style={{ "--cosmos-accent": accent } as React.CSSProperties}
    >
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold-text">
        Cosmology
      </p>
      <h2
        id="cosmology-title"
        className="mb-3 font-serif text-3xl font-semibold text-foreground"
      >
        {cosmology.title}
      </h2>
      <p className="mb-8 max-w-[68ch] font-body text-lg leading-relaxed text-muted-foreground">
        {cosmology.summary}
      </p>

      <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-midnight text-parchment shadow-[inset_0_0_80px_color-mix(in_oklch,var(--cosmos-accent)_25%,transparent)]">
        {/* World axis: tree, mountain, bridge, chain, or path */}
        {axis && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-6 w-[3px] -translate-x-1/2 bg-linear-to-b from-gold/10 via-gold/70 to-gold/10 shadow-[0_0_18px_2px_color-mix(in_oklch,var(--gold)_35%,transparent)] md:left-1/2"
          />
        )}

        {axis && (
          <div className="relative flex justify-start px-4 pt-5 md:justify-center">
            <p className="rounded-full border border-gold/40 bg-midnight px-4 py-1 text-center text-xs text-parchment/80">
              <span className="font-serif uppercase tracking-[0.2em] text-gold-light">
                {axis.name}
              </span>
              <span className="sr-only">: </span>
              <span className="hidden sm:inline"> · {axis.note}</span>
            </p>
          </div>
        )}

        <ol className="relative">
          {cosmology.tiers.map((tier, i) => (
            <li
              key={tier.id}
              className={`relative ${BAND_STYLE[tier.band]} ${i > 0 ? "border-t border-parchment/10" : ""} px-4 py-6 md:px-8`}
            >
              <div className="mb-4 flex items-baseline justify-between gap-4 pl-6 md:justify-center md:pl-0">
                <h3 className="font-serif text-sm uppercase tracking-[0.2em] text-gold-light">
                  {tier.label}
                </h3>
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-parchment/60 md:absolute md:left-8">
                  {BAND_NAME[tier.band]}
                </span>
              </div>

              <ul className="flex flex-wrap justify-center gap-4 pl-6 md:pl-0">
                {tier.realms.map((realm) => (
                  <li
                    key={realm.name}
                    className="relative w-full max-w-sm rounded-lg border border-parchment/15 bg-midnight/85 p-4 backdrop-blur-sm md:w-[calc(50%-0.5rem)] lg:w-auto lg:min-w-64 lg:flex-1"
                  >
                    <p className="font-serif text-lg text-parchment">
                      {realm.name}
                      {realm.originalName &&
                        realm.originalName !== realm.name && (
                          <span
                            className="ml-2 font-body text-sm italic text-parchment/60"
                            lang="und"
                          >
                            {realm.originalName}
                          </span>
                        )}
                    </p>
                    <p className="mt-1 font-body text-sm leading-relaxed text-parchment/75">
                      {realm.description}
                    </p>
                    {realm.figures.length > 0 && (
                      <ul
                        className="mt-3 flex flex-wrap gap-1.5"
                        aria-label={`Who dwells in ${realm.name}`}
                      >
                        {realm.figures.map((f) => (
                          <Figure key={f.href} figure={f} />
                        ))}
                      </ul>
                    )}
                    {realm.place && (
                      <Link
                        href={realm.place.href}
                        className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-gold-light underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        Visit {realm.place.name}
                        <span aria-hidden> →</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <aside className="mt-4 max-w-[68ch] border-l-2 border-gold/40 pl-4 text-sm text-muted-foreground">
        <p className="font-body leading-relaxed">
          <span className="font-semibold text-foreground">
            A note on the sources.{" "}
          </span>
          {cosmology.variantNote}
        </p>
        <p className="mt-2 text-xs">
          <span className="uppercase tracking-[0.15em]">Drawn from:</span>{" "}
          {cosmology.sources.join("; ")}
        </p>
      </aside>
    </section>
  );
}
