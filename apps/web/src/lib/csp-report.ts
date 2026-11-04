/**
 * Parse browser CSP violation reports into a small, privacy-safe summary.
 *
 * Browsers send either the Reporting API shape (`application/reports+json`,
 * an array of `{ type: "csp-violation", body }`) or the legacy `report-uri`
 * shape (`application/csp-report`, `{ "csp-report": {...} }`). Only the
 * directive, the blocked origin (never its path or query) and the page path
 * are kept, so no token or personal data in a URL reaches Sentry.
 */

export interface CspViolation {
  directive: string;
  blocked: string;
  page: string;
  disposition: "enforce" | "report";
}

const MAX_REPORTS = 10;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** `inline`, `eval`, `data` etc. stay as keywords; URLs shrink to origin. */
function blockedOrigin(raw: string | undefined): string {
  if (!raw) return "unknown";
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
    return url.protocol.replace(/:$/, "");
  } catch {
    return raw.slice(0, 40);
  }
}

function pagePath(raw: string | undefined): string {
  if (!raw) return "unknown";
  try {
    return new URL(raw).pathname.slice(0, 120);
  } catch {
    return "unknown";
  }
}

function toViolation(body: Record<string, unknown>): CspViolation | null {
  const directive =
    str(body.effectiveDirective) ??
    str(body["effective-directive"]) ??
    str(body["violated-directive"]);
  if (!directive) return null;
  const disposition = body.disposition === "report" ? "report" : "enforce";
  return {
    directive: directive.split(" ")[0].slice(0, 40),
    blocked: blockedOrigin(str(body.blockedURL) ?? str(body["blocked-uri"])),
    page: pagePath(str(body.documentURL) ?? str(body["document-uri"])),
    disposition,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCspReports(payload: unknown): CspViolation[] {
  const bodies: Record<string, unknown>[] = [];
  if (Array.isArray(payload)) {
    for (const report of payload.slice(0, MAX_REPORTS)) {
      if (
        isRecord(report) &&
        report.type === "csp-violation" &&
        isRecord(report.body)
      ) {
        bodies.push(report.body);
      }
    }
  } else if (isRecord(payload) && isRecord(payload["csp-report"])) {
    bodies.push(payload["csp-report"]);
  }
  return bodies.map(toViolation).filter((v): v is CspViolation => v !== null);
}

/** One Sentry issue per directive + blocked origin, regardless of page. */
export function violationKey(v: CspViolation): string {
  return `${v.disposition}:${v.directive}:${v.blocked}`;
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_KEYS_PER_WINDOW = 25;
const forwarded = new Map<string, number>();

/**
 * True the first time a key is seen in the window, and only while fewer than
 * MAX_KEYS_PER_WINDOW distinct keys are held. Per server instance, so a noisy
 * extension cannot exhaust the Sentry quota.
 */
export function shouldForwardCspViolation(key: string, now: number): boolean {
  for (const [k, at] of forwarded) {
    if (now - at > WINDOW_MS) forwarded.delete(k);
  }
  if (forwarded.has(key) || forwarded.size >= MAX_KEYS_PER_WINDOW) return false;
  forwarded.set(key, now);
  return true;
}

/** Test hook: forget forwarded keys between cases. */
export function resetCspViolationDedupe(): void {
  forwarded.clear();
}
