/**
 * Browsing aids, not a scholarly taxonomy. Only listed exact aliases are grouped;
 * qualifiers and compound phrases remain intact in the source domain arrays.
 * In particular, the presence of "sun" inside an uncertain phrase proves nothing.
 */
const DOMAIN_ALIASES: Record<string, readonly string[]> = {
  sun: ["sun", "the sun"],
  moon: ["moon", "the moon"],
  sky: ["sky", "the sky"],
  earth: ["earth", "the earth"],
  sea: ["sea", "seas", "the sea"],
  water: ["water", "waters", "the waters"],
  freshwater: ["fresh water", "fresh waters", "freshwater"],
  rivers: ["rivers", "the rivers"],
  underworld: ["underworld", "the underworld"],
  afterlife: ["afterlife", "the afterlife"],
  forests: ["forest", "forests", "the forest"],
  hunting: ["hunt", "the hunt", "hunting"],
  harvest: ["harvest", "the harvest"],
  crafts: ["craft", "crafts", "craftsmanship"],
  smithing: ["smithing", "smithcraft", "metalworking", "metalwork"],
  arts: ["art", "arts"],
  messengers: ["messenger", "messengers"],
  war: ["war", "warfare"],
  fertility: ["fertility"],
  creation: ["creation"],
  death: ["death"],
  kingship: ["kingship"],
  sovereignty: ["sovereignty"],
  agriculture: ["agriculture"],
  wisdom: ["wisdom"],
  fire: ["fire"],
  healing: ["healing", "medicine"],
  protection: ["protection"],
  rain: ["rain"],
  storms: ["storms"],
  thunder: ["thunder"],
  lightning: ["lightning"],
  motherhood: ["motherhood"],
  love: ["love"],
  beauty: ["beauty"],
  magic: ["magic"],
  justice: ["justice"],
  law: ["law"],
  order: ["order", "cosmic order"],
  childbirth: ["childbirth"],
  marriage: ["marriage"],
  family: ["family"],
  hearth: ["hearth", "the hearth"],
  wealth: ["wealth"],
  trade: ["trade", "commerce"],
  poetry: ["poetry"],
  music: ["music"],
  dance: ["dance"],
  fate: ["fate"],
  destiny: ["destiny"],
  trickery: ["trickery"],
  transformation: ["transformation"],
  night: ["night", "the night"],
  darkness: ["darkness"],
  dawn: ["dawn", "the dawn"],
  light: ["light"],
  wind: ["wind", "the wind"],
  stars: ["stars", "the stars"],
  mountains: ["mountains", "the mountains"],
  animals: ["animals"],
  nature: ["nature"],
  knowledge: ["knowledge"],
  prophecy: ["prophecy"],
  divination: ["divination"],
  truth: ["truth"],
  oaths: ["oaths"],
  victory: ["victory"],
  sacrifice: ["sacrifice"],
  rebirth: ["rebirth"],
  immortality: ["immortality"],
};

export const OTHER_DOMAIN = "other-recorded-domains";
export const UNCERTAIN_DOMAIN = "unclassified-or-uncertain";
export const DOMAIN_CATEGORY_IDS: readonly string[] = [
  ...Object.keys(DOMAIN_ALIASES),
  OTHER_DOMAIN,
  UNCERTAIN_DOMAIN,
];

const aliasToCategory = new Map(
  Object.entries(DOMAIN_ALIASES).flatMap(([category, aliases]) =>
    aliases.map((alias) => [alias, category] as const),
  ),
);

export function domainCategoryLabel(category: string): string {
  if (category === OTHER_DOMAIN) return "Other recorded domains";
  if (category === UNCERTAIN_DOMAIN) return "Unclassified or uncertain";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function domainCategories(domains: readonly string[]): string[] {
  const categories = new Set<string>();
  for (const raw of domains) {
    const key = raw.trim().toLowerCase();
    const category = aliasToCategory.get(key);
    if (category) categories.add(category);
    else if (key.startsWith("uncertain;")) categories.add(UNCERTAIN_DOMAIN);
  }
  if (categories.size === 0) {
    categories.add(domains.length === 0 ? UNCERTAIN_DOMAIN : OTHER_DOMAIN);
  }
  return [...categories];
}

/** Known aliases share a group; historic prose-valued URLs still match verbatim. */
export function matchesDomainFilter(
  domains: readonly string[],
  filter: string,
): boolean {
  if (filter === "all") return true;
  const category = aliasToCategory.get(filter.trim().toLowerCase()) ?? filter;
  return DOMAIN_CATEGORY_IDS.includes(category)
    ? domainCategories(domains).includes(category)
    : domains.includes(filter);
}

export function domainFilterOptions(
  deities: readonly { pantheonId: string; domain: readonly string[] }[],
  pantheon: string,
  selected: string,
): [string, number][] {
  const counts = new Map<string, number>();
  for (const deity of deities) {
    if (pantheon !== "all" && deity.pantheonId !== pantheon) continue;
    for (const category of domainCategories(deity.domain)) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  if (selected !== "all" && !counts.has(selected)) {
    counts.set(
      selected,
      deities.filter(
        (deity) =>
          (pantheon === "all" || deity.pantheonId === pantheon) &&
          matchesDomainFilter(deity.domain, selected),
      ).length,
    );
  }
  return [...counts].sort(([a], [b]) =>
    domainCategoryLabel(a).localeCompare(domainCategoryLabel(b)),
  );
}
