import "server-only";

import sources from "@/data/sources.json";
import { foldForSearch } from "./search-fold";

/**
 * Article citations name a work by its title as the article cites it
 * ("Prose Edda - Gylfaginning", "Kojiki"); the sources catalog names it
 * fully ("Kojiki (Records of Ancient Matters)"). Both reduce to the same key.
 */
function titleKeys(title: string): string[] {
  const base = foldForSearch(title)
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/^the\s+/, "")
    .trim();
  const work = base.split(/\s+-\s+|,/)[0].trim();
  return [...new Set([base, work])].filter(Boolean);
}

const sourceByKey = new Map<string, { id: string; author?: string }>();
for (const source of sources) {
  for (const key of titleKeys(source.title)) {
    if (!sourceByKey.has(key)) {
      sourceByKey.set(key, { id: source.id, author: source.author });
    }
  }
}

/** Same title, different author is a different work (Apuleius's Metamorphoses is not Ovid's). */
function sameAuthor(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return true;
  const words = (name: string) =>
    new Set(
      foldForSearch(name)
        .split(/[^a-z]+/)
        .filter((w) => w.length > 2),
    );
  const left = words(a);
  return [...words(b)].some((word) => left.has(word));
}

/** Aliases for works the catalog files under another title. */
const ALIASES: Record<string, string> = {
  library: "library-apollodorus",
  bibliotheca: "library-apollodorus",
};

/** The site's page for a cited work, when the sources catalog has one. */
export function citedWorkHref(
  title: string,
  author?: string,
): string | undefined {
  for (const key of titleKeys(title)) {
    const alias = ALIASES[key];
    if (alias) return `/sources/${alias}`;
    const source = sourceByKey.get(key);
    if (source && sameAuthor(source.author, author)) {
      return `/sources/${source.id}`;
    }
  }
  return undefined;
}
