import {
  isAnalyticsEventName,
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
  | { ok: false; reason: "upstream_error"; status: number }
  | { ok: false; reason: "network_error" };

/**
 * Resolves the server-side PostHog credentials, or null when analytics is not
 * wired. Callers must surface null as a real failure: an endpoint that answers
 * "received" while discarding the event is worse than one that answers 501,
 * because nobody ever notices the data is missing.
 */
export function resolveServerAnalyticsConfig(): ServerAnalyticsConfig | null {
  const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  const host = (process.env.POSTHOG_HOST ?? DEFAULT_HOST).replace(/\/+$/, "");

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
  const config = resolveServerAnalyticsConfig();
  if (!config) {
    return { ok: false, reason: "not_configured" };
  }

  if (!isAnalyticsEventName(event)) {
    return { ok: false, reason: "unknown_event" };
  }

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
          // PostHog project 325061 is shared by every personal app. The browser SDK stamps
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
