import { NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import { readJsonBody } from "@/lib/http/read-json-body";

const MAX_REQUEST_BODY_BYTES = 8 * 1024;
const ALLOWED_METRICS = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);

/**
 * Core Web Vitals sink. Field data beats lab data: a Lighthouse score says how
 * the site behaves on one machine, these numbers say how it behaves for the
 * people who actually visit.
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

  const metric = body.value as Record<string, unknown> | null;
  if (!metric || typeof metric !== "object" || Array.isArray(metric)) {
    return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
  }

  const name = metric.name;
  const value = metric.value;

  if (typeof name !== "string" || !ALLOWED_METRICS.has(name)) {
    return NextResponse.json({ error: "Unknown metric" }, { status: 400 });
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return NextResponse.json(
      { error: "Invalid metric value" },
      { status: 400 },
    );
  }

  const result = await captureServerEvent({
    event: "web_vital",
    distinctId:
      typeof metric.distinctId === "string" ? metric.distinctId : "anonymous",
    properties: {
      metric: name,
      value,
      rating: typeof metric.rating === "string" ? metric.rating : "unknown",
      path: typeof metric.path === "string" ? metric.path : undefined,
      navigationType:
        typeof metric.navigationType === "string"
          ? metric.navigationType
          : undefined,
    },
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
