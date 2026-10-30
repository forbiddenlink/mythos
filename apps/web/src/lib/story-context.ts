/**
 * Reading context for a story: the list a reader came from (a pantheon or a
 * collection) so the story page can show "3 of 11" and previous/next links
 * inside that list.
 *
 * The list travels in the URL as `?in=<kind>/<slug>`. The value is only ever
 * resolved against real catalog data, so an unknown or malformed value is
 * ignored and the page behaves exactly as it does without the parameter. The
 * canonical URL stays parameter-free.
 */
export type StoryListKind = "pantheon" | "collection";

export interface StoryContextLink {
  title: string;
  href: string;
}

export interface StoryContext {
  /** The `in` query value, `<kind>/<slug>`. */
  key: string;
  kind: StoryListKind;
  listName: string;
  listHref: string;
  /** 1-based position of the story in the list. */
  position: number;
  total: number;
  prev: StoryContextLink | null;
  next: StoryContextLink | null;
}

export function storyContextKey(kind: StoryListKind, listSlug: string): string {
  return `${kind}/${listSlug}`;
}

/** Link to a story that keeps the reader's list in the URL. */
export function storyHrefIn(
  storySlug: string,
  kind: StoryListKind,
  listSlug: string,
): string {
  return `/stories/${storySlug}?in=${storyContextKey(kind, listSlug)}`;
}

/** Resolve the `?in=` value against the lists this story belongs to. */
export function pickStoryContext(
  contexts: readonly StoryContext[],
  value: string | null | undefined,
): StoryContext | null {
  if (!value) return null;
  return contexts.find((context) => context.key === value) ?? null;
}
