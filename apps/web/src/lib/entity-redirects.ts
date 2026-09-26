/**
 * Canonical URLs for entity alias paths, resolved in src/proxy.ts.
 *
 * Deity, hero and pantheon pages are prerendered for their canonical slugs
 * only (`dynamicParams = false`). Their pages used to redirect ids, alternate
 * names and other casings at render time; that now happens here, before
 * routing, so aliases keep answering with an HTTP redirect instead of a 404.
 * Server-side only (imports the catalog JSON into the proxy bundle).
 */
import deitiesData from "@/data/deities.json";
import heroesData from "@/data/heroes.json";
import pantheonsData from "@/data/pantheons.json";
import {
  createDeityLookup,
  type DeityLookup,
  type DeityLookupEntry,
} from "@/lib/deity-reference";

type Lookups = {
  deities: DeityLookup;
  heroes: DeityLookup;
  pantheons: Map<string, string>;
};

let lookups: Lookups | null = null;

function getLookups(): Lookups {
  lookups ??= {
    deities: createDeityLookup(deitiesData as DeityLookupEntry[]),
    // Heroes share the deity reference shape and normalization.
    heroes: createDeityLookup(heroesData as DeityLookupEntry[]),
    pantheons: new Map(
      (pantheonsData as { id: string; slug: string }[]).flatMap((p) => [
        [p.id, p.slug],
        [p.slug, p.slug],
      ]),
    ),
  };
  return lookups;
}

const ENTITY_PATH = /^\/(deities|heroes|pantheons)\/([^/]+)$/;

/**
 * The canonical pathname when `pathname` is an alias of an entity page, or
 * null when it is already canonical, unknown, or not an entity page.
 */
export function canonicalEntityPath(pathname: string): string | null {
  const match = ENTITY_PATH.exec(pathname);
  if (!match) return null;
  const [, kind, segment] = match;
  let raw: string;
  try {
    raw = decodeURIComponent(segment);
  } catch {
    return null;
  }
  const { deities, heroes, pantheons } = getLookups();
  let slug: string | undefined;
  if (kind === "deities") slug = deities.find(raw)?.slug;
  else if (kind === "heroes") slug = heroes.find(raw)?.slug;
  else slug = pantheons.get(raw);
  if (!slug || slug === raw) return null;
  return `/${kind}/${slug}`;
}
