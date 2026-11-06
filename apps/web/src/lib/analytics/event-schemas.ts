import type { AnalyticsEventName } from "@/lib/analytics/events";

/**
 * Server-enforced property contract for every analytics event.
 *
 * The privacy contract in events.ts promises that no event carries free text,
 * identifiers, or extra fields. The browser enforces that through typed
 * `trackEvent` calls, but `/api/analytics/events` accepts arbitrary JSON, so
 * the server must check it again. Each event lists the only keys it may carry
 * and what each value must look like; anything else is refused.
 *
 * Kept free of zod and server-only imports so the field kinds stay readable
 * next to `AnalyticsEventMap`. Only the server imports this module.
 */
type FieldKind =
  /** Lower-case kebab slug, at most 100 characters. */
  | "slug"
  /** Short machine identifier: letters, digits, "_", "-", ":", at most 64. */
  | "token"
  /** Non-negative safe integer. */
  | "count"
  /** Finite number from 0 to 100. */
  | "percent"
  | "boolean"
  /** Checked by the existing search-term allowlist in events.ts. */
  | "searchTerm"
  | { oneOf: readonly string[] };

interface FieldSpec {
  kind: FieldKind;
  optional?: boolean;
}

type EventSpec = Readonly<Record<string, FieldSpec>>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9_:-]{0,63}$/;

const req = (kind: FieldKind): FieldSpec => ({ kind });
const opt = (kind: FieldKind): FieldSpec => ({ kind, optional: true });

export const EVENT_PROPERTY_SPECS: Readonly<
  Record<AnalyticsEventName, EventSpec>
> = {
  entry_viewed: {
    entityType: req("token"),
    slug: req("slug"),
    pantheon: opt("slug"),
  },
  search_performed: { queryLength: req("count"), resultCount: req("count") },
  search_no_results: { term: req("searchTerm") },
  share_clicked: { surface: req("token"), method: req("token") },
  quiz_started: { quizId: req("token") },
  quiz_completed: {
    quizId: req("token"),
    score: req("count"),
    total: req("count"),
  },
  oracle_asked: { grounded: req("boolean"), provider: opt("token") },
  story_read_progress: { slug: req("slug"), percent: req("percent") },
  study_session_completed: { cards: req("count"), correct: req("count") },
  bookmark_added: { entityType: req("token") },
  journey_stop_selected: {
    journeySlug: req("slug"),
    stopIndex: req("count"),
    stopCount: req("count"),
  },
  learning_path_step_selected: {
    goal: req({
      oneOf: [
        "pantheon-mastery",
        "domain-expert",
        "story-scholar",
        "completionist",
      ],
    }),
    entityType: req({ oneOf: ["deity", "story", "quiz"] }),
    slug: req("slug"),
    action: req({
      oneOf: ["start", "continue", "review", "step", "practice"],
    }),
  },
  export_generated: { format: req("token"), kind: req("token") },
  achievement_unlocked: { achievementId: req("token") },
  // The quiz retention beacon also reports the score it was answered after.
  pmf_survey_answered: {
    quizId: req("token"),
    rating: req({ oneOf: ["very", "somewhat", "not"] }),
    score: opt("count"),
    total: opt("count"),
  },
  support_page_viewed: { from: req("token") },
  support_nudge_shown: { from: req("token") },
  support_click: { placement: req("token") },
  newsletter_signup: { placement: req("token") },
};

function matchesKind(kind: FieldKind, value: unknown): boolean {
  if (typeof kind === "object") {
    return typeof value === "string" && kind.oneOf.includes(value);
  }
  switch (kind) {
    case "slug":
      return (
        typeof value === "string" && value.length <= 100 && SLUG.test(value)
      );
    case "token":
      return typeof value === "string" && TOKEN.test(value);
    case "count":
      return Number.isSafeInteger(value) && (value as number) >= 0;
    case "percent":
      return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 100
      );
    case "boolean":
      return typeof value === "boolean";
    case "searchTerm":
      return typeof value === "string";
  }
}

/**
 * True only when `properties` carries no key outside the event's spec, every
 * required key is present, and every value has the declared shape. Undefined
 * values count as absent, matching `sanitizeProperties`.
 */
export function matchesEventSchema(
  name: AnalyticsEventName,
  properties: Record<string, unknown>,
): boolean {
  const spec = EVENT_PROPERTY_SPECS[name];
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    const field = Object.hasOwn(spec, key) ? spec[key] : undefined;
    if (!field || !matchesKind(field.kind, value)) return false;
  }
  for (const [key, field] of Object.entries(spec)) {
    if (!field.optional && properties[key] === undefined) return false;
  }
  return true;
}
