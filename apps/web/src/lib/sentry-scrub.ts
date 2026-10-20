/**
 * Redaction for anything that leaves the app for Sentry. Used by the logger and by
 * beforeSend (server and client), so captures that bypass the logger are covered too.
 */

// Matched against the key lowercased with non-alphanumerics removed, so accessToken,
// access_token and access-token all match.
const SENSITIVE_KEY =
  /password|passwd|pwd|secret|token|apikey|authorization|cookie|signature|email|phone|ssn|creditcard|cardnumber|cvv|cvc|privatekey/;
const MAX_DEPTH = 5;

const TEXT_PATTERNS: [RegExp, string][] = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[EMAIL]"],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [TOKEN]"],
  [/\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g, "[JWT]"],
  [/\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{10,}/g, "[API_KEY]"],
  [
    /([?&](?:token|access_token|api_key|apikey|key|secret|password|code)=)[^&\s"']+/gi,
    "$1[REDACTED]",
  ],
];

/** Redact emails, bearer tokens, JWTs, API keys and secret query params in free text. */
export function redactText(text: string): string {
  return TEXT_PATTERNS.reduce((acc, [re, to]) => acc.replace(re, to), text);
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

interface ScrubbableEvent {
  message?: string;
  exception?: { values?: { value?: string }[] };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  request?: { headers?: Record<string, string> };
}

/**
 * beforeSend helper: redacts the message, exception text, extras, contexts and the
 * authorization/cookie headers. The real Error still groups by its stack frames.
 */
export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  if (event.message) event.message = redactText(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redactText(ex.value);
  }
  if (event.extra) event.extra = scrub(event.extra) as T["extra"];
  if (event.contexts) event.contexts = scrub(event.contexts) as T["contexts"];
  const headers = event.request?.headers;
  if (headers) {
    for (const name of Object.keys(headers)) {
      if (["authorization", "cookie"].includes(name.toLowerCase())) {
        headers[name] = "[REDACTED]";
      }
    }
  }
  return event;
}
