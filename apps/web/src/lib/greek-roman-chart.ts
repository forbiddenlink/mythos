import deitiesData from "@/data/deities.json";
import rostersData from "@/data/pantheon-rosters.json";
import { getDeityComparisons } from "@/lib/comparisons";
import { readableParallelNote } from "@/lib/parallel-notes";

/**
 * Rows for the Greek and Roman gods chart. The pairing itself is not written
 * here: a row exists when a Roman deity carries a cross-pantheon parallel to a
 * Greek one, and links to /compare/<pair> when that head-to-head page exists.
 * `ROMAN_DIFFERENCE` is the only hand-written text, one sentence per pair,
 * each drawn from the Roman deity's own entry.
 */

interface RawParallel {
  pantheonId?: string;
  deityId?: string;
  note?: string;
}

interface RawDeity {
  id: string;
  name: string;
  slug?: string;
  pantheonId: string;
  domain?: string[];
  alternateNames?: string[];
  crossPantheonParallels?: RawParallel[];
}

const deities = deitiesData as unknown as RawDeity[];
const deityById = new Map(deities.map((d) => [d.id, d]));
const greekOrder = (rostersData as Record<string, string[]>)["greek-pantheon"];

/** What changed in Rome, keyed by the Roman deity's id. */
export const ROMAN_DIFFERENCE: Record<string, string> = {
  jupiter:
    "The chief god of the Roman state: magistrates took office and treaties were struck under him, and he shared the Capitoline temple with Juno and Minerva.",
  juno: "Also a civic goddess. As Juno Moneta she kept a temple whose name survives in the word money, and her brief covers women, colonies and the city's welfare.",
  neptune:
    "Italian cult ties him to freshwater and horses as well as the sea. His July festival, the Neptunalia, was held in the drought of midsummer.",
  mars: "An ancestor and a farmer's god. He fathered Romulus and Remus, and Cato's farmer prayed to him to keep disease off the land. The atlas calls him honorable where Ares is chaotic.",
  venus:
    "An ancestor too: the Julian family claimed descent from her through Aeneas, and Caesar dedicated a temple to Venus Genetrix.",
  minerva:
    "A magistrate's goddess on the Capitol. Her festival, the Quinquatrus, belonged to artisans and schools as much as to soldiers.",
  "apollo-roman":
    "Rome kept the Greek name. Plague liturgies, the Sibylline Books and Augustus's Palatine temple are the Roman uses of him.",
  diana:
    "Her oldest Latin home is the grove at Aricia by Lake Nemi, where the priest won his office by killing his predecessor.",
  mercury:
    "Tied to the marketplace. Ovid's Fasti gives him a May festival where merchants asked pardon for past fraud and luck for the next bargain.",
  bacchus:
    "The Latin name of Dionysus, paired with the older Italian god Liber. The Bacchanalia were restricted in 186 BCE after a state investigation.",
  vulcan:
    "Fire as a public danger in a wooden city. The Vulcanalia on 23 August used bonfires and offerings to keep accidental fire in its place.",
  ceres:
    "Also the plebeians' goddess: her Aventine temple, vowed in 496 BCE, was the base of the plebeian aediles.",
  vesta:
    "The hearth turned into state furniture. Her fire in the Forum was tended by the Vestal Virgins, and if it died the city itself was thought to be in danger.",
};

/** Planets named for the Roman gods, which is where most readers meet them. */
export const PLANET_FOR_ROMAN: Record<string, string> = {
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  neptune: "Neptune",
};

/**
 * Greek deities the atlas gives a Roman name to only as an alternate name, with
 * no Roman entry of its own. The name is checked against `alternateNames` in
 * the tests, so a renamed field fails loudly.
 */
export const NAME_ONLY: ReadonlyArray<{ greekId: string; roman: string }> = [
  { greekId: "hades", roman: "Pluto" },
  { greekId: "persephone", roman: "Proserpina" },
  { greekId: "cronus", roman: "Saturn" },
  { greekId: "gaia", roman: "Tellus" },
  { greekId: "helios", roman: "Sol" },
  { greekId: "selene", roman: "Luna" },
  { greekId: "eos", roman: "Aurora" },
  { greekId: "nyx", roman: "Nox" },
  { greekId: "thanatos", roman: "Mors" },
  { greekId: "asclepius", roman: "Aesculapius" },
];

export interface ChartDeity {
  id: string;
  name: string;
  slug: string;
  domains: string[];
}

export interface ChartRow {
  greek: ChartDeity;
  roman: ChartDeity;
  /** Slug of the /compare page for the pair, when one exists. */
  pairSlug: string | null;
  /** The cross-pantheon note, with catalog bookkeeping stripped. */
  parallelNote: string;
  sharedDomains: string[];
  romanOnlyDomains: string[];
  greekOnlyDomains: string[];
  planet: string | null;
  difference: string | null;
}

function toChartDeity(d: RawDeity): ChartDeity {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug ?? d.id,
    domains: d.domain ?? [],
  };
}

function lower(items: string[]): Set<string> {
  return new Set(items.map((item) => item.toLowerCase()));
}

export function getChartRows(): ChartRow[] {
  const comparisons = getDeityComparisons();
  const rows: ChartRow[] = [];

  for (const roman of deities) {
    if (roman.pantheonId !== "roman-pantheon") continue;
    for (const parallel of roman.crossPantheonParallels ?? []) {
      if (parallel.pantheonId !== "greek-pantheon" || !parallel.deityId) {
        continue;
      }
      const greek = deityById.get(parallel.deityId);
      if (!greek) continue;
      const pair = comparisons.find(
        (c) =>
          (c.a.id === roman.id && c.b.id === greek.id) ||
          (c.a.id === greek.id && c.b.id === roman.id),
      );
      const romanDomains = roman.domain ?? [];
      const greekDomains = greek.domain ?? [];
      const greekSet = lower(greekDomains);
      const romanSet = lower(romanDomains);
      rows.push({
        greek: toChartDeity(greek),
        roman: toChartDeity(roman),
        pairSlug: pair?.slug ?? null,
        parallelNote: readableParallelNote(parallel.note ?? ""),
        sharedDomains: romanDomains.filter((d) =>
          greekSet.has(d.toLowerCase()),
        ),
        romanOnlyDomains: romanDomains.filter(
          (d) => !greekSet.has(d.toLowerCase()),
        ),
        greekOnlyDomains: greekDomains.filter(
          (d) => !romanSet.has(d.toLowerCase()),
        ),
        planet: PLANET_FOR_ROMAN[roman.id] ?? null,
        difference: ROMAN_DIFFERENCE[roman.id] ?? null,
      });
    }
  }

  const rank = (row: ChartRow): number => {
    const index = greekOrder.indexOf(row.greek.id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return rows.sort((a, b) => rank(a) - rank(b));
}

/** Roman deities with no Greek counterpart in the atlas (Janus). */
export function getRomanWithoutGreek(): ChartDeity[] {
  const paired = new Set(getChartRows().map((row) => row.roman.id));
  return deities
    .filter((d) => d.pantheonId === "roman-pantheon" && !paired.has(d.id))
    .map(toChartDeity);
}

export function getNameOnlyRows(): Array<{
  greek: ChartDeity;
  roman: string;
}> {
  return NAME_ONLY.flatMap(({ greekId, roman }) => {
    const greek = deityById.get(greekId);
    return greek ? [{ greek: toChartDeity(greek), roman }] : [];
  });
}

/** True when the Greek deity lists the Roman name among its alternate names. */
export function listsRomanName(greekId: string, roman: string): boolean {
  return (deityById.get(greekId)?.alternateNames ?? []).some((name) =>
    name.startsWith(roman),
  );
}
