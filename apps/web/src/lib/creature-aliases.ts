/** Old slugs that should 308 to a canonical creature. */
export const CREATURE_ALIASES: Record<string, string> = {
  "ahuizotl-aztec": "ahuizotl",
  "cipactli-aztec": "cipactli",
  "itzpapalotl-obsidian": "itzpapalotl-obsidian-host",
};

export function canonicalCreatureSlug(slug: string): string {
  return CREATURE_ALIASES[slug] ?? slug;
}
