import { getDeities, getJourneys, getStories } from "@/lib/data/catalog";
import {
  isAnalyticsEventName,
  hasValidLearningEventProperties,
  sanitizeProperties,
  type AnalyticsProperties,
} from "@/lib/analytics/events";

const DEFAULT_HOST = "https://us.i.posthog.com";

export interface ServerAnalyticsConfig {
  key: string;
  host: string;
}

export type CaptureResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "unknown_event" }
  | { ok: false; reason: "invalid_properties" }
  | { ok: false; reason: "upstream_error"; status: number }
  | { ok: false; reason: "network_error" };

/**
 * Resolves the server-side PostHog credentials, or null when analytics is not
 * wired. Callers must surface null as a real failure: an endpoint that answers
 * "received" while discarding the event is worse than one that answers 501,
 * because nobody ever notices the data is missing.
 */
export function resolveServerAnalyticsConfig(): ServerAnalyticsConfig | null {
  // One project for browser events and server beacons; a private override must
  // not silently split the learning funnel across projects.
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_KEY;
  if (!key) return null;

  const configuredHost =
    process.env.POSTHOG_INGEST_ORIGIN ?? process.env.POSTHOG_HOST;
  const host = (
    configuredHost && /^https?:\/\//.test(configuredHost)
      ? configuredHost
      : DEFAULT_HOST
  ).replace(/\/+$/, "");

  return { key, host };
}

export function isServerAnalyticsConfigured(): boolean {
  return resolveServerAnalyticsConfig() !== null;
}

export async function captureServerEvent({
  event,
  distinctId,
  properties,
}: {
  event: string;
  distinctId: string;
  properties: Record<string, unknown>;
}): Promise<CaptureResult> {
  if (!isAnalyticsEventName(event)) {
    return { ok: false, reason: "unknown_event" };
  }

  if (!hasValidLearningEventProperties(event, properties)) {
    return { ok: false, reason: "invalid_properties" };
  }

  if (event === "journey_stop_selected") {
    const journey = getJourneys().find(
      (item) => item.slug === properties.journeySlug,
    );
    if (!journey || properties.stopCount !== journey.waypoints.length) {
      return { ok: false, reason: "invalid_properties" };
    }
  }
  if (event === "learning_path_step_selected") {
    const known =
      properties.entityType === "quiz"
        ? properties.slug === "quiz"
        : properties.entityType === "deity"
          ? getDeities().some((item) => item.slug === properties.slug)
          : getStories().some((item) => item.slug === properties.slug);
    if (!known) return { ok: false, reason: "invalid_properties" };
  }

  const config = resolveServerAnalyticsConfig();
  if (!config) return { ok: false, reason: "not_configured" };

  const clean: AnalyticsProperties = sanitizeProperties(properties);

  try {
    const response = await fetch(`${config.host}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.key,
        event,
        distinct_id: distinctId,
        timestamp: new Date().toISOString(),
        properties: {
          ...clean,
          // Keep server events identifiable in the configured project. The browser SDK stamps
          // `app` via posthog.register(); this path posts to the capture API directly, so
          // without this line every server event from mythos is unattributable.
          app: "mythos",
          // Anonymous events only: no person profile, so no cross-session
          // identity is built for a visitor who never signs in.
          $process_person_profile: false,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, reason: "upstream_error", status: response.status };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}
