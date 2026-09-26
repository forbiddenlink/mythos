/**
 * Ancient festival calendar data and the name → deity-page resolution used by
 * the facts page. Pure module: the server resolves deity slugs against the
 * catalog (`resolveFestivalDeitySlugs`) and passes the result to the client
 * calendar, so the calendar never needs the deity catalog itself.
 */

export interface AncientFestival {
  id: string;
  name: string;
  originalName?: string;
  pantheonId: string;
  pantheonName: string;
  season: "Spring" | "Summer" | "Autumn" | "Winter";
  historicalTiming: string;
  honoredDeities: string[];
  description: string;
  rituals: string[];
  significance: string;
}

export const FESTIVALS: AncientFestival[] = [
  // Spring
  {
    id: "anthesteria",
    name: "Anthesteria (Festival of Flowers & Spirits)",
    originalName: "Ἀνθεστήρια",
    pantheonId: "greek-pantheon",
    pantheonName: "Greek",
    season: "Spring",
    historicalTiming: "Late February / Early March (11th–13th Anthesterion)",
    honoredDeities: ["Dionysus", "Hermes Chthonios"],
    description:
      "A three-day Greek festival celebrating the opening of the new vintage wine, the arrival of spring flowers, and a sacred threshold period where the souls of the deceased wandered the mortal streets.",
    rituals: [
      "Pithoigia: Opening and tasting of the fermented wine jars",
      "Choes: Communal silent drinking contest with crown of flowers",
      "Chytroi: Offering pots of boiled grains and seeds to Hermes for the spirits",
    ],
    significance:
      "Balancing joy and reverent hospitality for wandering ancestral souls.",
  },
  {
    id: "megalesia",
    name: "Megalesia (Festival of Magna Mater)",
    originalName: "Ludi Megalenses",
    pantheonId: "roman-pantheon",
    pantheonName: "Roman",
    season: "Spring",
    historicalTiming: "April 4th–10th",
    honoredDeities: ["Cybele (Magna Mater)", "Attis"],
    description:
      "A prominent Roman festival commemorating the arrival of the sacred black meteoric stone of Cybele from Asia Minor to Rome during the Second Punic War.",
    rituals: [
      "Procession of the Galli priests bearing Cybele's image",
      "Dramatic plays and theatrical performances on the Palatine Hill",
      "Communal patrician banquets with traditional vegetarian dishes",
    ],
    significance:
      "Civic protection, divine maternal favor, and the rebirth of nature.",
  },
  {
    id: "ostara",
    name: "Sigrblót / Ostara (Spring Awakening)",
    pantheonId: "norse-pantheon",
    pantheonName: "Norse",
    season: "Spring",
    historicalTiming: "Spring Equinox (Mid-March)",
    honoredDeities: ["Freyja", "Freyr", "Odin"],
    description:
      "The Norse sacrifice for victory (Sigrblót) and seasonal resurgence, marking the opening of sailing season, the thawing of glacial soils, and blessing the newly plowed fields.",
    rituals: [
      "Blót: Sacrificial feast dedicated to Freyr for bountiful harvests",
      "Drinking of ceremonial mead in honor of Odin and ancestors",
      "Blessing of ship keels and forging tools",
    ],
    significance:
      "Invoking fertility and triumph as daylight overcomes arctic darkness.",
  },

  // Summer
  {
    id: "vestalia",
    name: "Vestalia (Purification of the Sacred Hearth)",
    originalName: "Vestalia",
    pantheonId: "roman-pantheon",
    pantheonName: "Roman",
    season: "Summer",
    historicalTiming: "June 7th–15th",
    honoredDeities: ["Vesta"],
    description:
      "The only time of year when married Roman women were permitted barefoot entry into the inner sanctuary (penus) of the Temple of Vesta to make humble domestic offerings.",
    rituals: [
      "Mill-donkeys decorated with wreaths and garlands of bread loaves",
      "Preparation of Mola Salsa (sacred salted flour) by the Vestal Virgins",
      "Sweeping and ritual cleansing of the temple on the final day",
    ],
    significance:
      "Purifying the eternal fire that guaranteed Rome's state survival.",
  },
  {
    id: "midsummer",
    name: "Midsummer / Midsommarblót",
    pantheonId: "norse-pantheon",
    pantheonName: "Norse",
    season: "Summer",
    historicalTiming: "Summer Solstice (Late June)",
    honoredDeities: ["Sunna / Sól", "Baldr", "Freyr"],
    description:
      "A grand celebratory assembly at the peak of the midnight sun, honoring the solar chariot and warding against twilight elves and subterranean wights.",
    rituals: [
      "Lighting hilltop bonfires to mirror the solar disc",
      "Gathering of sacred medicinal herbs during the solstitial dawn",
      "Communal athletic contests and assembly deliberations (Thing)",
    ],
    significance:
      "Celebrating the peak of light and abundance before the descent into autumn.",
  },
  {
    id: "opet-festival",
    name: "Beautiful Feast of Opet",
    originalName: "Heb Opet",
    pantheonId: "egyptian-pantheon",
    pantheonName: "Egyptian",
    season: "Summer",
    historicalTiming: "Second month of Akhet (Inundation / August)",
    honoredDeities: ["Amun-Ra", "Mut", "Khonsu"],
    description:
      "An exuberant multi-week festival celebrating the annual flooding of the Nile and the spiritual rejuvenation of the Pharaoh through communion with the supreme creator god Amun.",
    rituals: [
      "Sacred river barque procession from Karnak Temple down the Nile to Luxor",
      "Re-enactment of the divine coronation inside the inner holy of holies",
      "Distribution of tens of thousands of free loaves and beer jugs to citizens",
    ],
    significance:
      "Renewing cosmic Ma'at (harmony) and ensuring Nile agricultural fertility.",
  },

  // Autumn
  {
    id: "eleusinian-mysteries",
    name: "Greater Eleusinian Mysteries",
    originalName: "Ἐλευσίνια Μυστήρια",
    pantheonId: "greek-pantheon",
    pantheonName: "Greek",
    season: "Autumn",
    historicalTiming: "Mid-Autumn (15th–23rd Boedromion / September–October)",
    honoredDeities: ["Demeter", "Persephone (Kore)", "Hades", "Iacchus"],
    description:
      "The most prestigious and sacred secret initiation rite of the ancient Mediterranean world, promising initiates liberation from the fear of death through the myth of Persephone's return.",
    rituals: [
      "Procession along the Sacred Way from Athens to the Telesterion at Eleusis",
      "Drinking of the sacred barley-pennyroyal potion (Kykeon)",
      "Vision of the sacred ear of wheat reaped in silence by the Hierophant",
    ],
    significance:
      "Conquering the dread of mortality through divine agricultural and soul rebirth.",
  },
  {
    id: "samhain",
    name: "Samhain (The Great Celtic Threshold)",
    pantheonId: "celtic-pantheon",
    pantheonName: "Celtic",
    season: "Autumn",
    historicalTiming: "Sunset October 31st – November 1st",
    honoredDeities: ["The Dagda", "The Morrígan", "Arawn"],
    description:
      "The pivotal festival marking the close of harvest, the arrival of winter, and the collapse of boundaries between the mortal world and the Sidhe (fairy realms).",
    rituals: [
      "Extinguishing all hearth fires and relighting from a single Druidic bonfire",
      "Leaving dumb suppers (food offerings) for returning ancestral spirits",
      "Guising and wearing animal masks to confound malevolent spirits",
    ],
    significance:
      "The Celtic New Year: standing in the liminal gap outside ordinary time.",
  },

  // Winter
  {
    id: "saturnalia",
    name: "Saturnalia (The Golden Age Inversion)",
    originalName: "Saturnalia",
    pantheonId: "roman-pantheon",
    pantheonName: "Roman",
    season: "Winter",
    historicalTiming: "December 17th–23rd",
    honoredDeities: ["Saturn", "Ops"],
    description:
      "Rome's most joyful and law-suspending festival, recreating the egalitarian peace of the mythical Golden Age where social hierarchies were playfully inverted.",
    rituals: [
      "Slaves dine first while masters serve them at table",
      "Exchange of gag gifts, terracotta figurines (sigillaria), and wax candles",
      "Wearing the pilleus (freedman's cap) and casual colorful garments",
    ],
    significance:
      "Honoring universal brotherhood, agriculture, and liberation from social strife.",
  },
  {
    id: "yule",
    name: "Yule / Jól (Midwinter Feast & Wild Hunt)",
    pantheonId: "norse-pantheon",
    pantheonName: "Norse",
    season: "Winter",
    historicalTiming: "Winter Solstice (Late December / Early January)",
    honoredDeities: ["Odin (Jólnir)", "Thor", "Freyr"],
    description:
      "The twelve-night midwinter feast commemorating the rebirth of the sun, communal peace, and guarding the hall against Odin's ghostly Wild Hunt riding through the night skies.",
    rituals: [
      "Burning the massive Yule log on the hearth for continuous warmth",
      "Swearing sacred oaths on the sacrificial boar (Sonarblót)",
      "Wassailing fruit orchards and singing for spring abundance",
    ],
    significance:
      "Enduring the darkest nights in solidarity, song, and feasting.",
  },
];

/**
 * Festival records name deities with epithets and parentheticals ("Odin (Jólnir)",
 * "Hermes Chthonios", "Persephone (Kore)"), so an exact-name lookup misses most of
 * them. Try the raw name, the name with parentheticals stripped, the parenthetical
 * itself, each side of a "/" alternation, and finally the leading word — against both
 * canonical names and recorded alternate names. Names with no entry in the atlas stay
 * as plain text rather than becoming broken links.
 */
function buildDeityIndex(
  deities: readonly { name: string; slug: string; alternateNames?: string[] }[],
): Map<string, string> {
  const index = new Map<string, string>();
  for (const deity of deities) {
    index.set(deity.name.toLowerCase(), deity.slug);
    for (const alt of deity.alternateNames ?? []) {
      if (!index.has(alt.toLowerCase()))
        index.set(alt.toLowerCase(), deity.slug);
    }
  }
  return index;
}

export function resolveDeitySlug(
  rawName: string,
  deityIndex: ReadonlyMap<string, string>,
): string | null {
  const withoutParens = rawName
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parentheticals = [...rawName.matchAll(/\(([^)]*)\)/g)].map((m) =>
    m[1].trim(),
  );

  const candidates: string[] = [];
  for (const base of [rawName, withoutParens, ...parentheticals]) {
    for (const part of base
      .split("/")
      .map((x) => x.trim())
      .filter(Boolean)) {
      candidates.push(part);
      const words = part.split(" ");
      if (words.length > 1) candidates.push(words[0]);
    }
  }

  for (const candidate of candidates) {
    const slug = deityIndex.get(candidate.toLowerCase());
    if (slug) return slug;
  }
  return null;
}

/** Honored-deity name (as written in FESTIVALS) → deity page slug, for every resolvable name. */
export function resolveFestivalDeitySlugs(
  deities: readonly { name: string; slug: string; alternateNames?: string[] }[],
  festivals: readonly AncientFestival[] = FESTIVALS,
): Record<string, string> {
  const index = buildDeityIndex(deities);
  const out: Record<string, string> = {};
  for (const festival of festivals) {
    for (const name of festival.honoredDeities) {
      const slug = resolveDeitySlug(name, index);
      if (slug) out[name] = slug;
    }
  }
  return out;
}
