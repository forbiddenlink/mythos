/** Old slugs that should 308 to a canonical artifact. */
export const ARTIFACT_ALIASES: Record<string, string> = {
  "shangos-oshe": "oshe-of-shango",
  me: "the-me",
};

export function canonicalArtifactSlug(slug: string): string {
  return ARTIFACT_ALIASES[slug] ?? slug;
}
