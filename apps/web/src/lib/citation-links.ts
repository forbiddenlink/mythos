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

/** "Tratado y relación ... (Narrative of the Errors, ...)" is also cited by its English title. */
function parentheticalKeys(title: string): string[] {
  return [...title.matchAll(/\(([^)]+)\)/g)].flatMap((m) => titleKeys(m[1]));
}

const sourceIds = new Set(sources.map((source) => source.id));

const sourceByKey = new Map<string, { id: string; author?: string }>();
for (const source of sources) {
  for (const key of [
    ...titleKeys(source.title),
    ...parentheticalKeys(source.title),
  ]) {
    if (!sourceByKey.has(key)) {
      sourceByKey.set(key, { id: source.id, author: source.author });
    }
  }
}

/** Same title, different author is a different work (Apuleius's Metamorphoses is not Ovid's). */
function sameAuthor(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return true;
  // A translator or editor credit ("trans. James Darmesteter") says nothing
  // about who composed the work.
  if (/\b(trans|translat\w*|ed|eds|editor|recorded|sung)\b/i.test(b))
    return true;
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
  "papyrus of ani": "book-of-the-dead",
  "plutarch - de iside et osiride": "plutarch-isis-osiris",
  "franz boas, the central eskimo": "boas-central-eskimo",
  "knud rasmussen, intellectual culture of the iglulik eskimos":
    "rasmussen-fifth-thule",
  "knud rasmussen, the netsilik eskimos: social life and spiritual culture":
    "rasmussen-fifth-thule",
  "national museum of australia, songlines: tracking the seven sisters":
    "songlines-seven-sisters",
  "homeric hymn to demeter": "homeric-hymns",
  "song of kumarbi": "kumarbi-cycle",
  "song of ullikummi": "kumarbi-cycle",
  "historia general de las cosas de nueva espana": "florentine-codex",
  "atrahasis epic": "atrahasis",
  "atra-hasis: the babylonian story of the flood": "atrahasis",
  "descent of inanna to the underworld": "descent-of-inanna",
};

/** The site's page for a cited work, when the sources catalog has one. */
export function citedWorkHref(
  title: string,
  author?: string,
): string | undefined {
  for (const key of titleKeys(title)) {
    const alias = ALIASES[key];
    if (alias && sourceIds.has(alias)) return `/sources/${alias}`;
    const source = sourceByKey.get(key);
    if (source && sameAuthor(source.author, author)) {
      return `/sources/${source.id}`;
    }
  }
  return undefined;
}
