/**
 * Single owner of the bookmark types and the localStorage keys that hold the
 * reader's learning record. Zod-free so client providers can import it
 * without pulling the backup schemas into their bundle.
 */

export const BOOKMARK_TYPES = [
  "deity",
  "story",
  "pantheon",
  "hero",
  "source",
  "creature",
  "artifact",
  "location",
] as const;

export type BookmarkType = (typeof BOOKMARK_TYPES)[number];

export const LEARNING_KEYS = {
  bookmarks: "mythos-atlas-bookmarks",
  readingProgress: "mythos-atlas-reading-progress",
  progress: "mythos-atlas-progress",
  review: "mythos-atlas-review",
  storyProgress: "mythos-story-progress",
  storyEndings: "mythos-story-endings",
} as const;
