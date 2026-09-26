import "server-only";

import type {
  DailyMyth,
  DailyMythPool,
  DailyMythQuestion,
} from "@/lib/daily-myth";
import { seededShuffle } from "@/lib/seeded";
import {
  getDeityLookup,
  getDeities,
  getPantheonShortNames,
  getStories,
  getTraditions,
} from "./catalog";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** A question whose correct option sits at a seeded position. */
function question(
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  seed: number,
): DailyMythQuestion {
  const options = seededShuffle([correct, ...distractors.slice(0, 3)], seed);
  return { prompt, options, answer: options.indexOf(correct), explanation };
}

/**
 * Every story that supports all three questions: its tradition, a figure
 * who takes part, and another story from the same tradition. Distractors
 * come from other traditions so each question has one defensible answer.
 */
export function buildDailyMythPool(): DailyMythPool {
  const names = getPantheonShortNames();
  const traditionIds = getTraditions().map((p) => p.id);
  const lookup = getDeityLookup();
  const stories = getStories();
  const famousDeities = getDeities()
    .filter((d) => d.importanceRank > 0)
    .toSorted((a, b) => a.importanceRank - b.importanceRank);

  const storiesByPantheon = new Map<string, typeof stories>();
  for (const story of stories) {
    const list = storiesByPantheon.get(story.pantheonId) ?? [];
    storiesByPantheon.set(story.pantheonId, [...list, story]);
  }

  const myths: DailyMyth[] = [];
  for (const story of stories) {
    if (!traditionIds.includes(story.pantheonId)) continue;
    const tradition = names[story.pantheonId];
    const seed = hashString(story.id);

    const featuredIds = [
      ...((story as { featuredDeities?: string[] }).featuredDeities ?? []),
      ...(story.featuredDeityIds ?? []),
    ];
    const figure = featuredIds
      .map((ref) => lookup.find(ref))
      .find((d) => d && d.pantheonId === story.pantheonId);
    const sibling = seededShuffle(
      (storiesByPantheon.get(story.pantheonId) ?? []).filter(
        (s) => s.id !== story.id,
      ),
      seed,
    )[0];
    if (!tradition || !figure || !sibling) continue;

    const otherTraditions = seededShuffle(
      traditionIds.filter((id) => id !== story.pantheonId),
      seed + 1,
    ).map((id) => names[id]);
    const otherFigures = seededShuffle(
      famousDeities
        .filter((d) => d.pantheonId !== story.pantheonId)
        .slice(0, 40),
      seed + 2,
    ).map((d) => d.name);
    const otherStories = seededShuffle(
      stories.filter((s) => s.pantheonId !== story.pantheonId),
      seed + 3,
    ).map((s) => s.title);

    myths.push({
      id: story.id,
      slug: story.slug,
      title: story.title,
      tradition,
      summary: story.summary,
      ...(story.imageUrl ? { imageUrl: story.imageUrl } : {}),
      questions: [
        question(
          `Which tradition tells “${story.title}”?`,
          tradition,
          otherTraditions,
          `“${story.title}” is catalogued with the ${tradition} tradition.`,
          seed + 4,
        ),
        question(
          `Who has a part in “${story.title}”?`,
          figure.name,
          otherFigures,
          `${figure.name} appears in this story; the others belong to other traditions.`,
          seed + 5,
        ),
        question(
          `Which other story is also told in the ${tradition} tradition?`,
          sibling.title,
          otherStories,
          `“${sibling.title}” is another ${tradition} story in the atlas.`,
          seed + 6,
        ),
      ],
    });
  }

  return { version: 1, myths };
}
