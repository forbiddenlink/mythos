import "server-only";

import collections from "@/data/collections.json";
import { getPantheons, getStories } from "@/lib/data/catalog";
import {
  storyContextKey,
  storyHrefIn,
  type StoryContext,
  type StoryContextLink,
  type StoryListKind,
} from "@/lib/story-context";

interface StoryRef {
  slug: string;
  title: string;
}

function buildContext(
  kind: StoryListKind,
  listSlug: string,
  listName: string,
  listHref: string,
  members: readonly StoryRef[],
  storySlug: string,
): StoryContext | null {
  const index = members.findIndex((member) => member.slug === storySlug);
  if (index === -1) return null;
  const link = (member: StoryRef | undefined): StoryContextLink | null =>
    member
      ? {
          title: member.title,
          href: storyHrefIn(member.slug, kind, listSlug),
        }
      : null;
  return {
    key: storyContextKey(kind, listSlug),
    kind,
    listName,
    listHref,
    position: index + 1,
    total: members.length,
    prev: link(members[index - 1]),
    next: link(members[index + 1]),
  };
}

/**
 * Every list a story can be read in: its pantheon, then each collection that
 * names it. Member order matches the pantheon and collection pages.
 */
export function getStoryContexts(storySlug: string): StoryContext[] {
  const stories = getStories();
  const story = stories.find((entry) => entry.slug === storySlug);
  const contexts: StoryContext[] = [];

  const pantheon = story
    ? getPantheons().find((entry) => entry.id === story.pantheonId)
    : undefined;
  if (pantheon) {
    const context = buildContext(
      "pantheon",
      pantheon.slug,
      pantheon.name,
      `/pantheons/${pantheon.slug}`,
      stories.filter((entry) => entry.pantheonId === pantheon.id),
      storySlug,
    );
    if (context) contexts.push(context);
  }

  for (const collection of collections) {
    const members = collection.stories.flatMap((id) => {
      const entry = stories.find((s) => s.id === id || s.slug === id);
      return entry ? [entry] : [];
    });
    const context = buildContext(
      "collection",
      collection.slug,
      collection.name,
      `/collections/${collection.slug}`,
      members,
      storySlug,
    );
    if (context) contexts.push(context);
  }

  return contexts;
}
