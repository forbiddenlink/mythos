/**
 * Closed event taxonomy for Mythos Atlas product analytics.
 *
 * Why a closed set: free-form `capture("whatever")` calls drift within weeks and
 * the resulting funnels silently measure the wrong thing. Every event the app
 * can emit is listed here, typed, and validated at runtime before it leaves the
 * browser.
 *
 * Privacy contract: no event carries free text a visitor typed, no identifiers,
 * and no entity beyond a public slug. Property values are restricted to
 * primitives so an object can never smuggle a payload through by accident.
 */

export const ANALYTICS_EVENTS = [
  // Discovery
  "entry_viewed",
  "search_performed",
  "share_clicked",
  // Engagement
  "quiz_started",
  "quiz_completed",
  "oracle_asked",
  "story_read_progress",
  "study_session_completed",
  "bookmark_added",
  // Value proof
  "export_generated",
  "achievement_unlocked",
  // Product-market fit
  "pmf_survey_answered",
  // Delivery quality
  "web_vital",
  // Conversion
  "support_page_viewed",
  "support_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsPropertyValue = string | number | boolean | null;

export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

/** Payload shape per event. Keep these narrow; a wide event answers nothing. */
export interface AnalyticsEventMap {
  entry_viewed: { entityType: string; slug: string; pantheon?: string };
  search_performed: { queryLength: number; resultCount: number };
  share_clicked: { surface: string; method: string };
  quiz_started: { quizId: string };
  quiz_completed: { quizId: string; score: number; total: number };
  oracle_asked: { grounded: boolean; provider?: string };
  story_read_progress: { slug: string; percent: number };
  study_session_completed: { cards: number; correct: number };
  bookmark_added: { entityType: string };
  export_generated: { format: string; kind: string };
  achievement_unlocked: { achievementId: string };
  pmf_survey_answered: { quizId: string; rating: string };
  web_vital: { metric: string; value: number; rating: string; path?: string };
  support_page_viewed: { from: string };
  support_click: { placement: string };
}

export type AnalyticsSink = (
  name: AnalyticsEventName,
  properties: AnalyticsProperties,
) => void;

const eventNames: ReadonlySet<string> = new Set(ANALYTICS_EVENTS);

let sink: AnalyticsSink | null = null;

export function isAnalyticsEventName(
  value: string,
): value is AnalyticsEventName {
  return eventNames.has(value);
}

/**
 * Register the destination for tracked events. The PostHog provider calls this
 * once consent is granted; until then events are dropped rather than queued, so
 * nothing recorded before consent can be replayed afterwards.
 */
export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

export function resetAnalyticsSink(): void {
  sink = null;
}

function isPrimitive(value: unknown): value is AnalyticsPropertyValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/** Drops non-primitive and undefined values so payload shape cannot drift. */
export function sanitizeProperties(
  properties: Record<string, unknown> | undefined,
): AnalyticsProperties {
  const clean: AnalyticsProperties = {};
  if (!properties) return clean;

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    if (!isPrimitive(value)) continue;
    clean[key] = value;
  }

  return clean;
}

/**
 * Emit a product-analytics event. Safe to call anywhere: it never throws, and
 * it no-ops when no sink is registered (no consent, or analytics unconfigured).
 */
export function trackEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEventMap[Name],
): void {
  if (!sink) return;
  if (!isAnalyticsEventName(name)) return;

  try {
    sink(name, sanitizeProperties(properties as Record<string, unknown>));
  } catch {
    // Analytics must never break a page render or an interaction.
  }
}
