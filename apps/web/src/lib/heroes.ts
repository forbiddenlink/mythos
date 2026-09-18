import heroesData from "@/data/heroes.json";

interface HeroLookup {
  id: string;
  name: string;
  slug: string;
  alternateNames?: string[];
}

const allHeroes = heroesData as HeroLookup[];

export function normalizeHeroReference(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const heroReferenceMap = new Map<string, HeroLookup>();

for (const hero of allHeroes) {
  heroReferenceMap.set(normalizeHeroReference(hero.id), hero);
  heroReferenceMap.set(normalizeHeroReference(hero.slug), hero);

  for (const alternateName of hero.alternateNames || []) {
    heroReferenceMap.set(normalizeHeroReference(alternateName), hero);
  }
}

export function findHeroByReference(reference: string): HeroLookup | undefined {
  return heroReferenceMap.get(normalizeHeroReference(reference));
}

export function formatHeroReference(reference: string): string {
  return reference
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getHeroSlug(reference: string): string {
  return (
    findHeroByReference(reference)?.slug ?? normalizeHeroReference(reference)
  );
}

export function getHeroName(reference: string): string {
  return findHeroByReference(reference)?.name ?? formatHeroReference(reference);
}

export function getHeroPath(reference: string): string {
  return `/heroes/${getHeroSlug(reference)}`;
}
