/** Historical eras used to browse places × culture (MythosJourney pattern).
 * Pantheon membership is curated — raw year-overlap is too loose because
 * many traditions span millennia and would all match "classical".
 */
export type MythicEra = {
  id: string;
  label: string;
  blurb: string;
  /** Inclusive year bounds for display; BCE negative */
  start: number;
  end: number;
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
    label: "West Africa",
    blurb: "Yoruba and related traditions",
    start: -500,
    end: 1900,
    pantheonIds: ["african-pantheon"],
  },
];

export function pantheonIdsForEraId(eraId: string): Set<string> | null {
  const era = MYTHIC_ERAS.find((e) => e.id === eraId);
  if (!era) return null;
  return new Set(era.pantheonIds);
}
