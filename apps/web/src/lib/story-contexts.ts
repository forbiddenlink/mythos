import "server-only";

import collections from "@/data/collections.json";
import { getPantheons, getStories } from "@/lib/data/catalog";
import {
  storyContextKey,
  storyHrefIn,
  type StoryContext,
  type StoryContextLink,
  type StoryListKind,
  type StoryNextStep,
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

/** A story's tradition and that tradition's stories, in catalog order. */
function storyTradition(storySlug: string) {
  const stories = getStories();
  const story = stories.find((entry) => entry.slug === storySlug);
  const pantheon = story
    ? getPantheons().find((entry) => entry.id === story.pantheonId)
    : undefined;
  return pantheon
    ? {
        pantheon,
        members: stories.filter((entry) => entry.pantheonId === pantheon.id),
      }
    : null;
}

/**
 * The onward link for a reader who arrived without a list in the URL (from
 * search, a shared link or a deity page): the next story of the tradition in
 * the order its page lists them, then the tradition's page after the last one.
 */
export function getNextInTradition(storySlug: string): StoryNextStep | null {
  const tradition = storyTradition(storySlug);
  if (!tradition) return null;
  const { pantheon, members } = tradition;
  const next = members[members.findIndex((m) => m.slug === storySlug) + 1];
  return next
    ? { kind: "story", title: next.title, href: `/stories/${next.slug}` }
    : {
        kind: "tradition",
        title: pantheon.name,
        href: `/pantheons/${pantheon.slug}`,
      };
}

/**
 * Every list a story can be read in: its pantheon, then each collection that
 * names it. Member order matches the pantheon and collection pages.
 */
export function getStoryContexts(storySlug: string): StoryContext[] {
  const stories = getStories();
  const contexts: StoryContext[] = [];

  const tradition = storyTradition(storySlug);
  if (tradition) {
    const context = buildContext(
      "pantheon",
      tradition.pantheon.slug,
      tradition.pantheon.name,
      `/pantheons/${tradition.pantheon.slug}`,
      tradition.members,
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
