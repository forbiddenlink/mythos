import { NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import { isAnalyticsEventName } from "@/lib/analytics/events";
import { readJsonBody } from "@/lib/http/read-json-body";

const MAX_REQUEST_BODY_BYTES = 16 * 1024;

/**
 * Event sink for beacons the client cannot send directly (page unload, the quiz
 * retention pulse). Forwards to PostHog and reports what actually happened —
 * a 2xx here means the event was accepted upstream, not that it was received
 * and dropped.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request, MAX_REQUEST_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      {
        error:
          body.reason === "too_large"
            ? "Request body too large"
            : "Invalid request",
      },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }

  const event = body.value;
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const {
    type,
    distinctId,
    at: _at,
    ...properties
  } = event as Record<string, unknown>;

  if (typeof type !== "string") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  if (!isAnalyticsEventName(type)) {
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  const result = await captureServerEvent({
    event: type,
    distinctId: typeof distinctId === "string" ? distinctId : "anonymous",
    properties,
  });

  if (result.ok) {
    return NextResponse.json({ received: true }, { status: 202 });
  }

  if (result.reason === "not_configured") {
    return NextResponse.json(
      { received: false, reason: "not_configured" },
      { status: 501 },
    );
  }

  return NextResponse.json(
    { received: false, reason: result.reason },
    { status: 502 },
  );
}
