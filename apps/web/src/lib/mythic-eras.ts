/** Historical eras used to browse places × culture timeframe (MythosJourney pattern). */
export type MythicEra = {
  id: string;
  label: string;
  blurb: string;
  /** Inclusive year bounds; BCE negative */
  start: number;
  end: number;
};

export const MYTHIC_ERAS: MythicEra[] = [
  {
    id: "ancient-near-east",
    label: "Ancient Near East",
    blurb: "Mesopotamia & pharaonic Egypt",
    start: -3500,
    end: -500,
  },
  {
    id: "classical-mediterranean",
    label: "Classical Mediterranean",
    blurb: "Greek & Roman heartland",
    start: -800,
    end: 500,
  },
  {
    id: "celtic-norse",
    label: "Celtic & Norse worlds",
    blurb: "Iron Age Atlantic to Viking Age",
    start: -1200,
    end: 1100,
  },
  {
    id: "precolumbian",
    label: "Pre-Columbian Americas",
    blurb: "Mesoamerica through contact",
    start: -2000,
    end: 1521,
  },
  {
    id: "asia-pacific",
    label: "Asia & Pacific",
    blurb: "Hindu, Chinese, Japanese, Polynesian",
    start: -1600,
    end: 1900,
  },
  {
    id: "west-africa",
    label: "West Africa",
    blurb: "Yoruba and related traditions",
    start: -500,
    end: 1900,
  },
];

export function erasOverlap(
  eraStart: number,
  eraEnd: number,
  pantheonStart: number | null | undefined,
  pantheonEnd: number | null | undefined,
): boolean {
  if (pantheonStart == null && pantheonEnd == null) return false;
  const pStart = pantheonStart ?? -4000;
  const pEnd = pantheonEnd ?? 2000;
  return pStart <= eraEnd && pEnd >= eraStart;
}
