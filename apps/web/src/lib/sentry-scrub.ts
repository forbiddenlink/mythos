/**
 * Redaction for anything that leaves the app for Sentry. Used by the logger and by
 * beforeSend / beforeSendTransaction (server, edge and client).
 *
 * Design: do not parse request payloads. Drop what we do not need (body, query string,
 * cookies, URL queries and fragments, most headers) and run a capped, linear free-text
 * pass over what remains. Sentry's server-side data scrubbers are the backstop.
 */

// Matched against the key lowercased with non-alphanumerics removed, so accessToken,
// access_token and access-token all match.
const SENSITIVE_KEY =
  /pass|pwd|secret|token|apikey|authorization|cookie|signature|email|phone|ssn|creditcard|cardnumber|cvv|cvc|privatekey/;
const MAX_DEPTH = 5;

// Free text is attacker-influenced, so every pattern is linear: single quantifiers, a
// lookbehind so each start position is scanned once, and a manual scan for emails.
const MAX_TEXT = 4096;
const PRE_CUT = MAX_TEXT + 512;
const SENSITIVE_PARAM =
  /token|secret|key|pass|auth|sig|session|jwt|code|email|phone|ssn|card|cvv|cvc/i;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT =
  /(?<![A-Za-z0-9_-])eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g;
const API_KEY = /(?<![A-Za-z0-9_])(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{10,}/g;
const KV_SEGMENT = /[^?#&;\s]+/g;
const LOCAL_CH = /[A-Za-z0-9._%+-]/;
const DOMAIN_CH = /[A-Za-z0-9.-]/;
const TLD = /^[A-Za-z]{2,}$/;

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** Decode %XX runs one at a time so a malformed sequence cannot abort the whole string. */
function percentDecode(text: string): string {
  return text.replace(/(?:%[0-9A-Fa-f]{2})+/g, safeDecode);
}

/**
 * key=value pass anywhere in text. Delimiters are ? # & ; and whitespace (or start of
 * string); a segment whose key looks sensitive has its whole value replaced.
 */
function redactKeyValues(text: string): string {
  return text.replace(KV_SEGMENT, (segment) => {
    const eq = segment.indexOf("=");
    if (eq < 1) return segment;
    const key = segment.slice(0, eq);
    return SENSITIVE_PARAM.test(safeDecode(key))
      ? `${key}=[REDACTED]`
      : segment;
  });
}

/** Linear email redaction: expand outward from each "@" over its own character run. */
function redactEmails(text: string): string {
  let out = "";
  let last = 0;
  for (let at = text.indexOf("@"); at !== -1; at = text.indexOf("@", at + 1)) {
    let left = at;
    while (left > last && LOCAL_CH.test(text.charAt(left - 1))) left--;
    let right = at + 1;
    while (right < text.length && DOMAIN_CH.test(text.charAt(right))) right++;
    while (right > at + 1 && /[.-]/.test(text.charAt(right - 1))) right--;
    const domain = text.slice(at + 1, right);
    const dot = domain.lastIndexOf(".");
    if (left < at && dot > 0 && TLD.test(domain.slice(dot + 1))) {
      out += `${text.slice(last, left)}[EMAIL]`;
      last = right;
    }
  }
  return out + text.slice(last);
}

/** Drop the trailing partial run of non-whitespace. */
function dropPartialRun(text: string): string {
  let end = text.length;
  while (end > 0 && !/\s/.test(text.charAt(end - 1))) end--;
  return text.slice(0, end);
}

/**
 * Redact emails, bearer tokens, JWTs, API keys and sensitive key=value pairs in free text.
 * Two fixed rounds of (key=value pass, percent-decode) run first so encoded and doubly
 * encoded values are caught, then a final key=value pass. Only the first MAX_TEXT + 512
 * characters are processed, with the trailing partial token dropped from that input. If the
 * input was longer than MAX_TEXT, the output is cut to MAX_TEXT, the trailing partial token
 * dropped again, and "[TRUNCATED]" appended.
 */
export function redactText(text: string): string {
  const input =
    text.length > PRE_CUT ? dropPartialRun(text.slice(0, PRE_CUT)) : text;
  let current = input;
  for (let round = 0; round < 2; round++) {
    current = percentDecode(redactKeyValues(current));
  }
  const redacted = redactEmails(redactKeyValues(current))
    .replace(BEARER, "Bearer [TOKEN]")
    .replace(JWT, "[JWT]")
    .replace(API_KEY, "[API_KEY]");
  if (text.length <= MAX_TEXT && redacted.length <= MAX_TEXT) return redacted;
  return `${dropPartialRun(redacted.slice(0, MAX_TEXT))}[TRUNCATED]`;
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

/** Keep origin and path only; everything from the first ? or # (and any userinfo) goes. */
export function stripUrl(url: string): string {
  let stripped: string;
  try {
    const parsed = new URL(url);
    stripped =
      parsed.origin === "null"
        ? splitUrl(url)
        : parsed.origin + parsed.pathname;
  } catch {
    stripped = splitUrl(url);
  }
  return redactText(stripped);
}

/** Fallback when URL parsing is unavailable or fails: cut at ? or #, drop any userinfo. */
function splitUrl(url: string): string {
  const [head = ""] = url.split(/[?#]/);
  return head.replace(/^([A-Za-z][A-Za-z0-9+.-]*:\/\/)[^/@]*@/, "$1");
}

/** Strip a query or fragment out of text such as "GET /x?y=1" or "/a -> /b#c". */
function stripQueriesInText(text: string): string {
  return redactText(text.replace(/[?#]\S*/g, ""));
}

const ALLOWED_HEADERS = new Set([
  "accept",
  "accept-language",
  "content-type",
  "user-agent",
  "referer",
]);
const URL_DATA_KEYS = [
  "http.url",
  "url.full",
  "url",
  "http.target",
  "from",
  "to",
];
const QUERY_DATA_KEYS = ["http.query", "url.query", "query"];
const URL_CRUMB_CATEGORIES = new Set(["navigation", "fetch", "xhr", "http"]);

interface ScrubbableEvent {
  message?: string;
  transaction?: string;
  spans?: { description?: string; data?: Record<string, unknown> }[];
  exception?: { values?: { value?: string }[] };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  user?: Record<string, unknown>;
  breadcrumbs?: {
    category?: string;
    message?: string;
    data?: Record<string, unknown>;
  }[];
  request?: {
    url?: string;
    query_string?: unknown;
    data?: unknown;
    cookies?: unknown;
    headers?: Record<string, string>;
  };
}

function stripUrlData(data: Record<string, unknown>): void {
  for (const key of URL_DATA_KEYS) {
    const v = data[key];
    if (typeof v === "string") data[key] = stripUrl(v);
  }
  for (const key of QUERY_DATA_KEYS) delete data[key];
}

/**
 * beforeSend / beforeSendTransaction helper. Deletes the request body, query string and
 * cookies; keeps only origin and path for request, breadcrumb and span URLs; keeps only
 * allowlisted headers; and runs the free-text pass over the rest. Stack frames are left
 * alone so grouping still works.
 */
export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  if (event.message) event.message = redactText(event.message);
  if (event.transaction)
    event.transaction = stripQueriesInText(event.transaction);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = redactText(ex.value);
  }
  if (event.extra) event.extra = scrub(event.extra) as T["extra"];
  // The root transaction span keeps its http.url / url.full in contexts.trace.data.
  const traceData = (
    event.contexts?.trace as { data?: Record<string, unknown> } | undefined
  )?.data;
  if (traceData) stripUrlData(traceData);
  if (event.contexts) event.contexts = scrub(event.contexts) as T["contexts"];
  if (event.tags) event.tags = scrub(event.tags) as T["tags"];
  if (event.user) event.user = scrub(event.user) as T["user"];
  for (const span of event.spans ?? []) {
    if (span.description)
      span.description = stripQueriesInText(span.description);
    if (span.data) stripUrlData(span.data);
  }
  for (const crumb of event.breadcrumbs ?? []) {
    const isUrlCrumb = URL_CRUMB_CATEGORIES.has(crumb.category ?? "");
    if (crumb.message) {
      crumb.message = isUrlCrumb
        ? stripQueriesInText(crumb.message)
        : redactText(crumb.message);
    }
    if (crumb.data) {
      stripUrlData(crumb.data);
      crumb.data = scrub(crumb.data) as typeof crumb.data;
    }
  }
  const req = event.request;
  if (req) {
    if (req.url) req.url = stripUrl(req.url);
    delete req.data;
    delete req.query_string;
    delete req.cookies;
    if (req.headers) {
      const kept: Record<string, string> = {};
      for (const [name, value] of Object.entries(req.headers)) {
        const lower = name.toLowerCase();
        if (!ALLOWED_HEADERS.has(lower) || typeof value !== "string") continue;
        kept[name] = lower === "referer" ? stripUrl(value) : redactText(value);
      }
      req.headers = kept;
    }
  }
  return event;
}
