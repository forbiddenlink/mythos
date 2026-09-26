import Link from "next/link";
import pantheons from "@/data/pantheons.json";
import { getAllCosmologies, type CosmologyBand } from "@/lib/cosmology";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { generateBaseMetadata } from "@/lib/metadata";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import cosmologiesData from "@/data/cosmologies.json";

export const metadata = generateBaseMetadata({
  title: "Cosmologies Compared Across Cultures",
  description: `${cosmologiesData.length} mythic universes side by side: Yggdrasil's nine worlds, the Egyptian Duat, the Hindu lokas, Aztec heavens and Mictlan, and more, each drawn from its primary sources.`,
  url: "/cosmology",
  keywords: [
    "mythology cosmology",
    "nine worlds",
    "Yggdrasil",
    "Duat",
    "Hindu lokas",
    "Mictlan",
    "Xibalba",
    "comparative mythology",
    "underworld",
  ],
});

const BAND_FILL: Record<CosmologyBand, string> = {
  beyond: "bg-gold/25 border-gold/50",
  sky: "bg-midnight-light/70 border-gold/25",
  earth: "bg-bronze/25 border-bronze/50",
  water: "bg-patina/30 border-patina/60",
  under: "bg-midnight/90 border-parchment/15",
  abyss: "bg-black/80 border-parchment/10",
};

const LEGEND: { band: CosmologyBand; label: string }[] = [
  { band: "beyond", label: "Beyond or between" },
  { band: "sky", label: "Heavens" },
  { band: "earth", label: "Earth" },
  { band: "water", label: "Waters" },
  { band: "under", label: "Underworld" },
  { band: "abyss", label: "Abyss" },
];

export default function CosmologyPage() {
  const cosmologies = getAllCosmologies();
  const pantheonById = new Map(pantheons.map((p) => [p.id, p]));

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Mythic universes"
        mark="tree"
        title="Cosmologies Compared"
        lede={`Every culture drew its own map of the universe. Here are ${cosmologies.length} of them side by side, from the highest heaven to the deepest pit.`}
      />

      <Container size="wide" className="section-space-sm">
        <ul
          aria-label="Legend"
          className="mb-8 flex flex-wrap gap-x-6 gap-y-2 type-meta font-medium text-muted-foreground"
        >
          {LEGEND.map((l) => (
            <li key={l.band} className="flex items-center gap-2">
              <span
                aria-hidden
                className={`inline-block h-3 w-5 rounded-sm border ${BAND_FILL[l.band]}`}
              />
              {l.label}
            </li>
          ))}
        </ul>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cosmologies.map((c) => {
            const pantheon = pantheonById.get(c.pantheonId);
            if (!pantheon) return null;
            const accent = getPantheonColor(c.pantheonId);
            return (
              <li key={c.pantheonId}>
                <Link
                  href={`/pantheons/${pantheon.slug}#cosmology-title`}
                  className="group flex h-full flex-col rounded-xl border border-gold/20 bg-midnight p-4 text-parchment transition-transform hover:-translate-y-1 hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  style={{ boxShadow: `inset 0 3px 0 ${accent}` }}
                >
                  <p className="type-meta uppercase tracking-[0.16em] text-parchment/70">
                    {pantheon.culture}
                  </p>
                  <h2 className="mt-1 mb-4 font-serif text-lg leading-snug text-parchment group-hover:text-gold-light">
                    {c.title}
                  </h2>

                  <div className="relative flex flex-1 flex-col gap-1">
                    {c.axis && (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-gold/0 via-gold/70 to-gold/0"
                      />
                    )}
                    {c.tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="relative rounded-md bg-midnight"
                      >
                        <div
                          className={`rounded-md border px-2 py-1.5 text-center ${BAND_FILL[tier.band]}`}
                        >
                          <p className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-gold-light">
                            {tier.label}
                          </p>
                          <p className="type-meta text-parchment/85">
                            {tier.realms.map((r) => r.name).join(" · ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {c.axis && (
                    <p className="mt-3 type-meta text-parchment/75">
                      <span className="text-gold-light">Axis:</span>{" "}
                      {c.axis.name}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </Container>

      <AboutThisPage title="How to read these maps">
        <p>
          Some traditions stack worlds in layers. Others join them with a tree,
          a mountain or a chain, and a few, like the Irish, set the Otherworld
          beside this one instead of above or below it. Each column follows that
          culture&apos;s own sources. Open a pantheon to see who lives in each
          realm and where the sources disagree.
        </p>
      </AboutThisPage>
    </div>
  );
}
