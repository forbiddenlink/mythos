/** Historical eras used to browse places × culture (MythosJourney pattern).
 * Pantheon membership is curated — raw year-overlap is too loose because
 * many traditions span millennia and would all match "classical".
 */
export type MythicEra = {
  id: string;
  label: string;
  blurb: string;
  /** Inclusive year bounds for display; BCE negative */
  start: number | null;
  end: number | null;
  /** Pantheon ids that belong in this browse window */
  pantheonIds: string[];
};

export const MYTHIC_ERAS: MythicEra[] = [
  {
    id: "ancient-near-east",
    label: "Ancient Near East",
    blurb: "Mesopotamia & pharaonic Egypt",
    start: -3500,
    end: -500,
    pantheonIds: ["mesopotamian-pantheon", "egyptian-pantheon"],
  },
  {
    id: "classical-mediterranean",
    label: "Classical Mediterranean",
    blurb: "Greek & Roman heartland",
    start: -800,
    end: 500,
    pantheonIds: ["greek-pantheon", "roman-pantheon"],
  },
  {
    id: "celtic-norse",
    label: "Celtic & Norse worlds",
    blurb: "Iron Age Atlantic to Viking Age",
    start: -1200,
    end: 1100,
    pantheonIds: ["celtic-pantheon", "norse-pantheon"],
  },
  {
    id: "precolumbian",
    label: "Pre-Columbian Americas",
    blurb: "Mesoamerica through contact",
    start: -2000,
    end: 1521,
    pantheonIds: ["aztec-pantheon", "mesoamerican-pantheon"],
  },
  {
    id: "asia-pacific",
    label: "Asia & Pacific",
    blurb: "Hindu, Chinese, Japanese, Polynesian",
    start: -1600,
    end: 1900,
    pantheonIds: [
      "hindu-pantheon",
      "chinese-pantheon",
      "japanese-pantheon",
      "polynesian-pantheon",
    ],
  },
  {
    id: "west-africa",
    label: "African traditions",
    blurb: "Distinct traditions across Africa; no shared historical period",
    start: null,
    end: null,
    pantheonIds: ["african-pantheon"],
  },
  {
    id: "medieval-slavic-world",
    label: "Medieval Slavic World",
    blurb: "Kievan Rus' and the Baltic-coast Slavs",
    start: 500,
    end: 1250,
    pantheonIds: ["slavic-pantheon"],
  },
  {
    id: "haudenosaunee-confederacy",
    label: "Haudenosaunee Confederacy",
    blurb:
      "Sky Woman's Turtle Island and the Great Law of Peace, a living tradition",
    start: 1000,
    end: 2026,
    pantheonIds: ["haudenosaunee-pantheon"],
  },
  {
    id: "northwest-coast",
    label: "Northwest Coast",
    blurb: "Tlingit and Haida Raven tradition, a living tradition",
    start: -11000,
    end: 2026,
    pantheonIds: ["tlingit-haida-pantheon"],
  },
  {
    id: "late-bronze-age-anatolia-levant",
    label: "Hittite Anatolia & Ugarit",
    blurb: "Late Bronze Age Hattusa and the city of Ugarit",
    start: -1650,
    end: -1180,
    pantheonIds: ["hittite-pantheon", "canaanite-pantheon"],
  },
  {
    id: "inuit-arctic",
    label: "Inuit Nunangat & Kalaallit Nunaat",
    blurb: "Inuit Arctic from Alaska to Greenland, a living tradition",
    start: 1000,
    end: 2026,
    pantheonIds: ["inuit-pantheon"],
  },
  {
    id: "aboriginal-australia",
    label: "Aboriginal Australia",
    blurb: "Many nations, many Dreamings; living traditions, not a past era",
    start: null,
    end: null,
    pantheonIds: ["aboriginal-australian-pantheon"],
  },
];

export function pantheonIdsForEraId(eraId: string): Set<string> | null {
  const era = MYTHIC_ERAS.find((e) => e.id === eraId);
  if (!era) return null;
  return new Set(era.pantheonIds);
}
