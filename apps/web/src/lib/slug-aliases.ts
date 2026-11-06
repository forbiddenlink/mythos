import type { RouteRedirect } from "@/lib/route-redirects";

/**
 * Retired slugs that 308 to the canonical page, keyed by route segment.
 * next.config.ts spreads `aliasRedirects()` into `redirects()`. The detail
 * pages are prerendered for canonical slugs only (`dynamicParams = false`), so
 * the redirect has to happen here, before routing.
 */
export const SLUG_ALIASES = {
  stories: {
    "five-suns-mesoamerican": "five-suns",
    "birth-huitzilopochtli": "birth-of-huitzilopochtli",
    "birth-huitzilopochtli-full": "birth-of-huitzilopochtli",
    "fall-of-quetzalcoatl-tula": "quetzalcoatl-fall-exile",
  },
  creatures: {
    "ahuizotl-aztec": "ahuizotl",
    "cipactli-aztec": "cipactli",
    "itzpapalotl-obsidian": "itzpapalotl-obsidian-host",
  },
  artifacts: {
    "shangos-oshe": "oshe-of-shango",
    me: "the-me",
  },
  locations: {
    "coatepec-aztec": "coatepec",
    "tamoanchan-aztec": "tamoanchan",
  },
} as const satisfies Record<string, Record<string, string>>;

/** Segments whose pages also have a `/read` variant. */
const WITH_READ_VARIANT: readonly string[] = ["stories"];

export function aliasRedirects(): RouteRedirect[] {
  return Object.entries(SLUG_ALIASES).flatMap(([kind, aliases]) =>
    Object.entries(aliases).flatMap(([from, to]) => {
      const redirects: RouteRedirect[] = [
        {
          source: `/${kind}/${from}`,
          destination: `/${kind}/${to}`,
          permanent: true,
        },
      ];
      if (WITH_READ_VARIANT.includes(kind)) {
        redirects.push({
          source: `/${kind}/${from}/read`,
          destination: `/${kind}/${to}/read`,
          permanent: true,
        });
      }
      return redirects;
    }),
  );
}
