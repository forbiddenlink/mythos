/**
 * Redaction for anything that leaves the app for Sentry. Used by the logger and by
 * beforeSend (server and client), so captures that bypass the logger are covered too.
 */

// Matched against the key lowercased with non-alphanumerics removed, so accessToken,
// access_token and access-token all match.
const SENSITIVE_KEY =
  /pass|pwd|secret|token|apikey|authorization|cookie|signature|email|phone|ssn|creditcard|cardnumber|cvv|cvc|privatekey/;
const MAX_DEPTH = 5;

const TEXT_PATTERNS: [RegExp, string][] = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[EMAIL]"],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [TOKEN]"],
  [/\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g, "[JWT]"],
  [/\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{10,}/g, "[API_KEY]"],
  [
    /([?&][^=&\s"']*(?:token|secret|key|pass|auth|sig|session|jwt|code|email|phone|ssn|card|cvv|cvc)[^=&\s"']*=)[^&\s"']+/gi,
    "$1[REDACTED]",
  ],
];

/** Decode %XX runs one at a time so a malformed sequence cannot abort the whole string. */
function percentDecode(text: string): string {
  return text.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
    try {
      return decodeURIComponent(run);
    } catch {
      return run;
    }
  });
}

/**
 * Redact emails, bearer tokens, JWTs, API keys and secret query params in free text.
 * Percent-encoded input is decoded first so jane%40x.com cannot slip past the patterns.
 */
export function redactText(text: string): string {
  return TEXT_PATTERNS.reduce(
    (acc, [re, to]) => acc.replace(re, to),
    percentDecode(text),
  );
}

/** Recursive, depth-bounded redaction of keys and text. Nested Errors become plain objects. */
export function scrub(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return redactText(value);
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      stack: value.stack ? redactText(value.stack) : undefined,
    };
  }
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[MAX_DEPTH]";
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, v]) => [
      key,
      SENSITIVE_KEY.test(key.toLowerCase().replace(/[^a-z0-9]/g, ""))
        ? "[REDACTED]"
        : scrub(v, depth + 1),
    ]),
  );
}

/** Header names are redacted when the normalized name looks sensitive (token, secret, key, cookie...). */
function isSensitiveHeader(name: string): boolean {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return SENSITIVE_KEY.test(normalized) || /key|setcookie/.test(normalized);
}

// Span data fields that carry a URL or query. db.statement is left as is.
const SPAN_QUERY_KEYS = ["http.query", "url.query"];
const SPAN_URL_KEYS = ["http.url", "url.full", "url", "http.target"];

function redactQueryString(qs: string): string {
  return redactText(`?${qs}`).slice(1);
}

interface ScrubbableEvent {
  message?: string;
  transaction?: string;
  spans?: { description?: string; data?: Record<string, unknown> }[];
  exception?: { values?: { value?: string }[] };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  user?: Record<string, unknown>;
  breadcrumbs?: { message?: string; data?: Record<string, unknown> }[];
  request?: {
    url?: string;
    query_string?: unknown;
    data?: unknown;
    cookies?: unknown;
    headers?: Record<string, string>;
  };
}

/**
 * beforeSend helper. Redacts the message, exception text, extras, contexts, tags, user,
 * breadcrumbs, and the request URL, query string, body, cookies and sensitive headers.
 * Stack frames (filename, function, lineno) are left alone so grouping still works, and the
 * real Error still groups by its stack.
 */
export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  if (event.message) event.message = redactText(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redactText(ex.value);
  }
  if (event.extra) event.extra = scrub(event.extra) as T["extra"];
  if (event.contexts) event.contexts = scrub(event.contexts) as T["contexts"];
  if (event.tags) event.tags = scrub(event.tags) as T["tags"];
  if (event.user) event.user = scrub(event.user) as T["user"];
  if (event.transaction) event.transaction = redactText(event.transaction);
  for (const span of event.spans ?? []) {
    if (span.description) span.description = redactText(span.description);
    for (const key of SPAN_URL_KEYS) {
      const v = span.data?.[key];
      if (span.data && typeof v === "string") span.data[key] = redactText(v);
    }
    for (const key of SPAN_QUERY_KEYS) {
      const v = span.data?.[key];
      if (span.data && typeof v === "string") {
        span.data[key] = redactQueryString(v);
      }
    }
  }
  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.message) crumb.message = redactText(crumb.message);
    if (crumb.data) crumb.data = scrub(crumb.data) as typeof crumb.data;
  }
  const req = event.request;
  if (req) {
    if (req.url) req.url = redactText(req.url);
    if (typeof req.query_string === "string") {
      req.query_string = redactQueryString(req.query_string);
    } else if (req.query_string) {
      req.query_string = scrub(req.query_string);
    }
    if (req.data !== undefined) req.data = scrub(req.data);
    // Cookie names rarely look sensitive but their values always are: keep names only.
    if (req.cookies && typeof req.cookies === "object") {
      req.cookies = Object.fromEntries(
        Object.keys(req.cookies).map((name) => [name, "[REDACTED]"]),
      );
    } else if (req.cookies) {
      req.cookies = "[REDACTED]";
    }
    if (req.headers) {
      for (const name of Object.keys(req.headers)) {
        const value = req.headers[name];
        if (isSensitiveHeader(name)) req.headers[name] = "[REDACTED]";
        else if (typeof value === "string")
          req.headers[name] = redactText(value);
      }
    }
  }
  return event;
}
