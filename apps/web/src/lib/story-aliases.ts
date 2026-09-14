/** Old slugs that should 308 to a canonical story. */
export const STORY_ALIASES: Record<string, string> = {
  "five-suns-mesoamerican": "five-suns",
  "birth-huitzilopochtli": "birth-of-huitzilopochtli",
  "birth-huitzilopochtli-full": "birth-of-huitzilopochtli",
};

export function canonicalStorySlug(slug: string): string {
  return STORY_ALIASES[slug] ?? slug;
}
