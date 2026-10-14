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

import { hasAnalyticsConsent } from "@/lib/privacy-consent";

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
  "journey_stop_selected",
  "learning_path_step_selected",
  // Value proof
  "export_generated",
  "achievement_unlocked",
  // Product-market fit
  "pmf_survey_answered",
  // Delivery quality
  "web_vital",
  // Conversion
  "support_page_viewed",
  "support_nudge_shown",
  "support_click",
  "newsletter_signup",
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
  journey_stop_selected: {
    journeySlug: string;
    stopIndex: number;
    stopCount: number;
  };
  learning_path_step_selected: {
    goal:
      "pantheon-mastery" | "domain-expert" | "story-scholar" | "completionist";
    entityType: "deity" | "story" | "quiz";
    slug: string;
    action: "start" | "continue" | "review" | "step" | "practice";
  };
  export_generated: { format: string; kind: string };
  achievement_unlocked: { achievementId: string };
  pmf_survey_answered: { quizId: string; rating: string };
  web_vital: { metric: string; value: number; rating: string; path?: string };
  support_page_viewed: { from: string };
  support_nudge_shown: { from: string };
  support_click: { placement: string };
  newsletter_signup: { placement: string };
}

export type AnalyticsSink = (
  name: AnalyticsEventName,
  properties: AnalyticsProperties,
) => void;

const eventNames: ReadonlySet<string> = new Set(ANALYTICS_EVENTS);

let sink: AnalyticsSink | null = null;

/**
 * Events from a visitor who has ALREADY consented, tracked in the moment
 * between page load and the PostHog SDK finishing its dynamic import. Without
 * this, every view event fired on mount of a hard-loaded page is lost.
 */
const MAX_PENDING_EVENTS = 20;
let pending: Array<[AnalyticsEventName, AnalyticsProperties]> = [];

export function isAnalyticsEventName(
  value: string,
): value is AnalyticsEventName {
  return eventNames.has(value);
}

/**
 * Register the destination for tracked events. The PostHog provider calls this
 * once consent is granted; events tracked before consent are dropped rather
 * than queued, so nothing recorded before consent can be replayed afterwards.
 * Only events held while an already-consented SDK loads are delivered here.
 */
export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
  const held = pending;
  pending = [];
  for (const [name, properties] of held) {
    try {
      next(name, properties);
    } catch {
      // Analytics must never break a page render or an interaction.
    }
  }
}

export function resetAnalyticsSink(): void {
  sink = null;
  pending = [];
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

/** Runtime contracts for learning clicks: never accept text or extra fields. */
export function hasValidLearningEventProperties(
  name: AnalyticsEventName,
  properties: Record<string, unknown>,
): boolean {
  if (name === "journey_stop_selected") {
    return (
      Object.keys(properties).every((key) =>
        ["journeySlug", "stopIndex", "stopCount"].includes(key),
      ) &&
      typeof properties.journeySlug === "string" &&
      properties.journeySlug.length <= 100 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(properties.journeySlug) &&
      Number.isSafeInteger(properties.stopIndex) &&
      Number.isSafeInteger(properties.stopCount) &&
      Number(properties.stopCount) <= 1000 &&
      Number(properties.stopIndex) >= 1 &&
      Number(properties.stopIndex) <= Number(properties.stopCount)
    );
  }
  if (name === "learning_path_step_selected") {
    return (
      Object.keys(properties).every((key) =>
        ["goal", "entityType", "slug", "action"].includes(key),
      ) &&
      typeof properties.goal === "string" &&
      [
        "pantheon-mastery",
        "domain-expert",
        "story-scholar",
        "completionist",
      ].includes(properties.goal) &&
      typeof properties.entityType === "string" &&
      ["deity", "story", "quiz"].includes(properties.entityType) &&
      typeof properties.slug === "string" &&
      properties.slug.length <= 100 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(properties.slug) &&
      typeof properties.action === "string" &&
      ["start", "continue", "review", "step", "practice"].includes(
        properties.action,
      )
    );
  }
  return true;
}

/**
 * Emit a product-analytics event. Safe to call anywhere: it never throws, and
 * it no-ops when no sink is registered (no consent, or analytics unconfigured).
 */
export function trackEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEventMap[Name],
): void {
  if (!isAnalyticsEventName(name)) return;
  if (
    !hasValidLearningEventProperties(
      name,
      properties as Record<string, unknown>,
    )
  )
    return;

  const clean = sanitizeProperties(properties as Record<string, unknown>);
  if (!sink) {
    if (hasAnalyticsConsent() && pending.length < MAX_PENDING_EVENTS) {
      pending.push([name, clean]);
    }
    return;
  }

  try {
    sink(name, clean);
  } catch {
    // Analytics must never break a page render or an interaction.
  }
}
