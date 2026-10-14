/**
 * Decides when the site may ask for support.
 *
 * The rule is earned attention: the ask appears only after the visitor has
 * finished a couple of things that took real work to build, then goes quiet for
 * two weeks, and disappears for a year the moment they decline. A tip request
 * on the first page view converts worse than no request at all, because it
 * reads as a toll rather than a thank-you.
 */

const MOMENTS_KEY = "mythos_value_moments_v1";
const SHOWN_KEY = "mythos_support_nudge_shown_at";
const DISMISSED_KEY = "mythos_support_nudge_dismissed_at";
const COUNTED_KEY = "mythos_value_moments_counted_v1";
/** Oldest counted keys are forgotten past this, so storage stays small. */
const MAX_COUNTED_KEYS = 200;

const DAY = 86_400_000;

/** Value moments required before the first ask. */
export const MIN_VALUE_MOMENTS = 2;
/** Quiet period after an ask is shown. */
export const NUDGE_COOLDOWN_DAYS = 14;
/** Quiet period after the visitor dismisses the ask. */
export const NUDGE_DISMISS_DAYS = 365;

export type ValueMoment =
  | "quiz_completed"
  | "export_generated"
  | "study_session_completed"
  | "story_finished";

function readNumber(key: string): number {
  if (globalThis.window === undefined) return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeNumber(key: string, value: number): void {
  if (globalThis.window === undefined) return;
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Private browsing or a full quota: the nudge simply never fires.
  }
}

export function countValueMoments(): number {
  return readNumber(MOMENTS_KEY);
}

function readCountedKeys(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(COUNTED_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Count one value moment. With a `key` (for example a story slug), the same
 * key counts only once, so re-reading one story cannot earn the ask by itself.
 */
export function recordValueMoment(moment: ValueMoment, key?: string): void {
  if (globalThis.window === undefined) return;
  if (key) {
    const counted = readCountedKeys();
    const id = `${moment}:${key}`;
    if (counted.includes(id)) return;
    try {
      localStorage.setItem(
        COUNTED_KEY,
        JSON.stringify([...counted, id].slice(-MAX_COUNTED_KEYS)),
      );
    } catch {
      // Without storage the moment is still counted below, as before.
    }
  }
  writeNumber(MOMENTS_KEY, countValueMoments() + 1);
}

export function markSupportNudgeShown(): void {
  writeNumber(SHOWN_KEY, Date.now());
}

export function dismissSupportNudge(): void {
  writeNumber(DISMISSED_KEY, Date.now());
}

export function shouldShowSupportNudge(now: number = Date.now()): boolean {
  if (globalThis.window === undefined) return false;

  if (countValueMoments() < MIN_VALUE_MOMENTS) return false;

  const dismissedAt = readNumber(DISMISSED_KEY);
  if (dismissedAt && now - dismissedAt < NUDGE_DISMISS_DAYS * DAY) return false;

  const shownAt = readNumber(SHOWN_KEY);
  if (shownAt && now - shownAt < NUDGE_COOLDOWN_DAYS * DAY) return false;

  return true;
}
