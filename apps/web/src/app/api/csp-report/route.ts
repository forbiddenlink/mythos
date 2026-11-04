import { readJsonBody } from "@/lib/http/read-json-body";
import {
  parseCspReports,
  shouldForwardCspViolation,
  violationKey,
} from "@/lib/csp-report";

/**
 * CSP violation sink. The Reporting-Endpoints header (next.config.ts) and the
 * `report-to` directive (src/lib/csp.ts) send browser reports here. Each new
 * directive + blocked-origin pair is forwarded to Sentry as a warning, at
 * most once per server instance per hour. The body is capped and only a
 * redacted summary (directive, blocked origin, page path) is sent.
 */

const MAX_BODY_BYTES = 16 * 1024;

function sentryEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)
  );
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return new Response(null, {
      status: body.reason === "too_large" ? 413 : 400,
    });
  }

  const violations = parseCspReports(body.value);
  if (violations.length === 0 || !sentryEnabled()) {
    return new Response(null, { status: 204 });
  }

  const now = Date.now();
  const fresh = violations.filter((v) =>
    shouldForwardCspViolation(violationKey(v), now),
  );
  if (fresh.length > 0) {
    try {
      const Sentry = await import("@sentry/nextjs");
      for (const v of fresh) {
        Sentry.captureMessage(
          `CSP ${v.disposition}: ${v.directive} blocked ${v.blocked} on ${v.page}`,
          {
            level: "warning",
            tags: { "ctx.route": "/api/csp-report", "ctx.op": v.directive },
            fingerprint: [
              "csp-violation",
              v.disposition,
              v.directive,
              v.blocked,
            ],
          },
        );
      }
    } catch {
      /* Sentry unavailable: the report is still acknowledged */
    }
  }

  return new Response(null, { status: 204 });
}
