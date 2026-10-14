/**
 * The weekly myth digest: picks the story of the week and renders the email.
 *
 * Pure and data-free (the caller passes the catalog in), so it is safe to
 * import from routes, pages and tests. The same function feeds the public
 * sample issue at /newsletter and the Resend draft the cron route creates, so
 * what a visitor previews is what subscribers get.
 */
import { findJourneyForPantheon } from "@/lib/journeys";
import { seededShuffle } from "@/lib/seeded";

export const DIGEST_BASE_URL = "https://mythosatlas.com";

/** Resend replaces this placeholder with a per-recipient unsubscribe link. */
export const RESEND_UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";

/** Fixed seed for the rotation order; changing it reshuffles every week. */
const ROTATION_SEED = 20261012;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** 1970-01-05 was a Monday: the origin for counting whole ISO weeks. */
const FIRST_MONDAY_UTC = Date.UTC(1970, 0, 5);

export interface DigestCitation {
  title: string;
  author?: string;
  book?: string;
  chapter?: string;
  chapters?: string;
  lines?: string;
}

export interface DigestStory {
  slug: string;
  title: string;
  /** Optional in practice: a few catalog stories lack an excerpt. */
  summary?: string;
  keyExcerpts?: string;
  moralThemes?: readonly string[];
  pantheonId: string;
  citationSources?: readonly DigestCitation[];
}

export interface DigestJourney {
  slug: string;
  title: string;
  pantheonId: string;
}

export interface WeeklyDigest {
  /** ISO week label, e.g. "2026-W42"; also the idempotency key. */
  weekKey: string;
  subject: string;
  previewText: string;
  html: string;
  text: string;
  storySlug: string;
  /** The same content as structured fields, for rendering the sample page. */
  parts: {
    title: string;
    summary: string;
    excerpt: string;
    citation: string;
    prompt: string;
    /** Site-relative paths, for in-app links. */
    storyPath: string;
    journey: { title: string; path: string } | null;
  };
}

/** ISO 8601 week (Monday start) for the UTC calendar date of `date`. */
export function isoWeek(date: Date): { year: number; week: number } {
  const day = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // Shift to the Thursday of this week; its year is the ISO year.
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((day.getTime() - yearStart) / MS_PER_DAY + 1) / 7);
  return { year: day.getUTCFullYear(), week };
}

export function isoWeekKey(date: Date): string {
  const { year, week } = isoWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Whole weeks since the first Monday of 1970, for the date's UTC week. */
function weekNumber(date: Date): number {
  const day = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor((day - FIRST_MONDAY_UTC) / (7 * MS_PER_DAY));
}

/** Stories with everything the email shows: summary, excerpt, source, theme. */
export function isDigestEligible(story: DigestStory): boolean {
  return (
    Boolean(story.summary?.trim()) &&
    Boolean(story.keyExcerpts?.trim()) &&
    (story.moralThemes?.length ?? 0) > 0 &&
    formatCitation(story.citationSources) !== null
  );
}

/**
 * The story for the week containing `date`. Walks a fixed shuffled order one
 * step per week, so every eligible story comes up once before any repeats.
 */
export function pickStoryOfTheWeek(
  stories: readonly DigestStory[],
  date: Date,
): DigestStory | null {
  const eligible = stories
    .filter(isDigestEligible)
    .toSorted((a, b) => a.slug.localeCompare(b.slug));
  if (eligible.length === 0) return null;
  const order = seededShuffle(
    eligible.map((_, i) => i),
    ROTATION_SEED,
  );
  const week = weekNumber(date);
  return eligible[order[((week % order.length) + order.length) % order.length]];
}

/** "Hesiod, Theogony, lines 617-735" from the first usable catalog source. */
export function formatCitation(
  sources: readonly DigestCitation[] | undefined,
): string | null {
  const source = sources?.find((s) => s.title.trim() !== "");
  if (!source) return null;
  const locator = source.lines
    ? `lines ${source.lines}`
    : source.book
      ? `book ${source.book}`
      : source.chapters
        ? `chapters ${source.chapters}`
        : source.chapter
          ? `chapter ${source.chapter}`
          : null;
  return [source.author, source.title, locator]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

/**
 * A reflection question built from the story's own themes. Catalog themes are
 * short phrases ("justice", "promises should be kept"), so they are quoted
 * rather than slotted into a sentence.
 */
export function reflectionPrompt(themes: readonly string[]): string {
  const quoted = themes.slice(0, 2).map((theme) => `"${theme}"`);
  return `The themes of this story include ${quoted.join(" and ")}. Which do you see most clearly in the telling, and why?`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Build the issue for the week containing `date`, or null when no story in
 * the catalog has the fields the email needs.
 */
export function buildWeeklyDigest(
  stories: readonly DigestStory[],
  journeys: readonly DigestJourney[],
  date: Date,
): WeeklyDigest | null {
  const story = pickStoryOfTheWeek(stories, date);
  if (!story) return null;

  const citation = formatCitation(story.citationSources) as string;
  const journey = findJourneyForPantheon(journeys, story.pantheonId);
  // Eligibility (pickStoryOfTheWeek) guarantees these are present.
  const summary = story.summary ?? "";
  const excerpt = story.keyExcerpts ?? "";
  const prompt = reflectionPrompt(story.moralThemes ?? []);
  const storyPath = `/stories/${story.slug}`;
  const journeyPath = journey ? `/journeys/${journey.slug}` : null;
  const storyUrl = `${DIGEST_BASE_URL}${storyPath}`;
  const journeyUrl = journeyPath ? `${DIGEST_BASE_URL}${journeyPath}` : null;
  const subject = `The weekly myth: ${story.title}`;

  const html = [
    '<div style="font-family:Georgia,serif;max-width:36rem;margin:0 auto;line-height:1.6;color:#1c1917">',
    `<p style="font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:#78350f">Mythos Atlas · The weekly myth</p>`,
    `<h1 style="font-size:1.6rem;margin:0.25rem 0 1rem">${escapeHtml(story.title)}</h1>`,
    `<p>${escapeHtml(summary)}</p>`,
    `<blockquote style="margin:1.25rem 0;padding-left:1rem;border-left:3px solid #b45309">${escapeHtml(excerpt)}<br><span style="font-size:0.85rem;color:#57534e">Source: ${escapeHtml(citation)}</span></blockquote>`,
    `<p><strong>To think about:</strong> ${escapeHtml(prompt)}</p>`,
    `<p><a href="${storyUrl}">Read the full story and its sources</a></p>`,
    journey && journeyUrl
      ? `<p><a href="${journeyUrl}">Walk a journey: ${escapeHtml(journey.title)}</a></p>`
      : "",
    '<hr style="border:0;border-top:1px solid #d6d3d1;margin:1.5rem 0">',
    `<p style="font-size:0.8rem;color:#57534e">You get this because you signed up at mythosatlas.com. <a href="${RESEND_UNSUBSCRIBE_PLACEHOLDER}">Unsubscribe</a>.</p>`,
    "</div>",
  ]
    .filter(Boolean)
    .join("\n");

  const text = [
    "MYTHOS ATLAS · THE WEEKLY MYTH",
    "",
    story.title,
    "",
    summary,
    "",
    `"${excerpt}"`,
    `Source: ${citation}`,
    "",
    `To think about: ${prompt}`,
    "",
    `Read the full story and its sources: ${storyUrl}`,
    journey && journeyUrl
      ? `Walk a journey, ${journey.title}: ${journeyUrl}`
      : "",
    "",
    "--",
    `You get this because you signed up at mythosatlas.com. Unsubscribe: ${RESEND_UNSUBSCRIBE_PLACEHOLDER}`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return {
    weekKey: isoWeekKey(date),
    subject,
    previewText: summary,
    html,
    text,
    storySlug: story.slug,
    parts: {
      title: story.title,
      summary,
      excerpt,
      citation,
      prompt,
      storyPath,
      journey:
        journey && journeyPath
          ? { title: journey.title, path: journeyPath }
          : null,
    },
  };
}
