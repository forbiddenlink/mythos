import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMessage = vi.fn();
vi.mock("@sentry/nextjs", () => ({ captureMessage }));

import { POST } from "@/app/api/csp-report/route";
import {
  parseCspReports,
  resetCspViolationDedupe,
  shouldForwardCspViolation,
} from "@/lib/csp-report";

const reportingApi = [
  {
    type: "csp-violation",
    url: "https://mythosatlas.com/deities/zeus?token=secret",
    body: {
      documentURL: "https://mythosatlas.com/deities/zeus?token=secret",
      blockedURL: "https://evil.example/x.js?user=a@b.com",
      effectiveDirective: "script-src-elem",
      disposition: "enforce",
    },
  },
  { type: "deprecation", body: { id: "x" } },
];

const legacy = {
  "csp-report": {
    "document-uri": "https://mythosatlas.com/stories",
    "blocked-uri": "inline",
    "violated-directive": "style-src-attr 'self'",
    disposition: "report",
  },
};

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://mythosatlas.com/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/reports+json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("parseCspReports", () => {
  it("keeps only directive, blocked origin and page path", () => {
    expect(parseCspReports(reportingApi)).toEqual([
      {
        directive: "script-src-elem",
        blocked: "https://evil.example",
        page: "/deities/zeus",
        disposition: "enforce",
      },
    ]);
  });

  it("reads the legacy report-uri shape", () => {
    expect(parseCspReports(legacy)).toEqual([
      {
        directive: "style-src-attr",
        blocked: "inline",
        page: "/stories",
        disposition: "report",
      },
    ]);
  });

  it("ignores junk", () => {
    expect(parseCspReports(null)).toEqual([]);
    expect(parseCspReports({ foo: 1 })).toEqual([]);
    expect(parseCspReports([{ type: "csp-violation", body: {} }])).toEqual([]);
  });
});

describe("shouldForwardCspViolation", () => {
  beforeEach(() => resetCspViolationDedupe());

  it("forwards a key once per hour", () => {
    expect(shouldForwardCspViolation("a", 0)).toBe(true);
    expect(shouldForwardCspViolation("a", 1000)).toBe(false);
    expect(shouldForwardCspViolation("a", 60 * 60 * 1000 + 1)).toBe(true);
  });

  it("caps distinct keys per window", () => {
    for (let i = 0; i < 25; i++) {
      expect(shouldForwardCspViolation(`k${i}`, 0)).toBe(true);
    }
    expect(shouldForwardCspViolation("k25", 0)).toBe(false);
  });
});

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    resetCspViolationDedupe();
    captureMessage.mockClear();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@o0.ingest.sentry.io/0");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("forwards a redacted violation to Sentry once", async () => {
    expect((await POST(post(reportingApi))).status).toBe(204);
    expect((await POST(post(reportingApi))).status).toBe(204);
    expect(captureMessage).toHaveBeenCalledTimes(1);
    const [message, options] = captureMessage.mock.calls[0];
    expect(message).toBe(
      "CSP enforce: script-src-elem blocked https://evil.example on /deities/zeus",
    );
    expect(message).not.toMatch(/token|user=|@b\.com/);
    expect(options.fingerprint).toEqual([
      "csp-violation",
      "enforce",
      "script-src-elem",
      "https://evil.example",
    ]);
  });

  it("does not call Sentry without a DSN", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    expect((await POST(post(reportingApi))).status).toBe(204);
    expect(captureMessage).not.toHaveBeenCalled();
  });

  it("rejects oversized and malformed bodies", async () => {
    const big = post("x".repeat(20 * 1024));
    expect((await POST(big)).status).toBe(413);
    expect((await POST(post("{not json"))).status).toBe(400);
    expect(captureMessage).not.toHaveBeenCalled();
  });
});
