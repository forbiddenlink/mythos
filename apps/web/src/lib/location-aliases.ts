/** Old slugs that should 308 to a canonical location. */
export const LOCATION_ALIASES: Record<string, string> = {
  "coatepec-aztec": "coatepec",
  "tamoanchan-aztec": "tamoanchan",
};

export function canonicalLocationSlug(slug: string): string {
  return LOCATION_ALIASES[slug] ?? slug;
}
