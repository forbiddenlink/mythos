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
const BASIC = /\bBasic\s+[A-Za-z0-9+/]{8,}={0,2}/g;
const AUTH_HEADER = /\bAuthorization\s*:[^\n\r]{0,200}/gi;
const JSON_STRING_PAIR = /"([^"\\]{1,64})"\s*:\s*"[^"\\]{0,256}"/g;
const PHONE = /(?<!\w)\+?\d[\d\s().-]{8,18}\d(?![\w:])/g;
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

/** "key":"value" pairs (serialized JSON) whose key looks sensitive. */
function redactJsonPairs(text: string): string {
  return text.replace(JSON_STRING_PAIR, (pair, key: string) =>
    SENSITIVE_PARAM.test(key) ? `"${key}":"[REDACTED]"` : pair,
  );
}

/** Phone numbers (E.164 and US formats): a digit run of 10 to 15 digits with separators. */
function redactPhones(text: string): string {
  return text.replace(PHONE, (match) => {
    const digits = match.replace(/\D/g, "").length;
    // Leave ISO dates alone (2026-10-20 ...).
    if (/^\d{4}-\d{2}-\d{2}/.test(match)) return match;
    return digits >= 10 && digits <= 15 ? "[PHONE]" : match;
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
  const redacted = redactPhones(
    redactEmails(redactJsonPairs(redactKeyValues(current))),
  )
    .replace(AUTH_HEADER, "Authorization: [REDACTED]")
    .replace(BEARER, "Bearer [TOKEN]")
    .replace(BASIC, "Basic [TOKEN]")
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
      redactText(key),
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
const PASSTHROUGH = [
  "event_id",
  "timestamp",
  "level",
  "platform",
  "environment",
  "release",
  "dist",
  "server_name",
  "fingerprint",
  "sdk",
  "type",
  "start_timestamp",
  // Debug IDs only (no user data); needed to symbolicate minified frames.
  "debug_meta",
] as const;
const ALLOWED_TAGS = new Set([
  "environment",
  "release",
  "route",
  "runtime",
  "level",
  "source",
]);
const TAG_PREFIX = "ctx."; // the logger puts its redacted context here
const SAFE_CONTEXTS = ["os", "runtime", "browser", "device", "app"];
const TRACE_FIELDS = [
  "trace_id",
  "span_id",
  "parent_span_id",
  "op",
  "status",
  "origin",
];
const SPAN_FIELDS = [
  "span_id",
  "parent_span_id",
  "trace_id",
  "op",
  "status",
  "start_timestamp",
  "timestamp",
  "origin",
];
const FRAME_FIELDS = ["function", "module", "lineno", "colno", "in_app"];
const BREADCRUMB_FIELDS = ["category", "level", "timestamp", "type"];
const HAS_URL = /https?:\/\/|^[A-Z]+ \//;

type Bag = Record<string, unknown>;

function pick(source: Bag, fields: readonly string[], into: Bag = {}): Bag {
  for (const field of fields) {
    if (source[field] !== undefined) into[field] = source[field];
  }
  return into;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? redactText(value) : undefined;
}

function textList(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string").map(redactText)
    : undefined;
}

function rebuildFrame(frame: Bag): Bag {
  const out = pick(frame, FRAME_FIELDS);
  for (const field of ["filename", "abs_path"]) {
    const v = frame[field];
    if (typeof v === "string") out[field] = stripUrl(v);
  }
  // vars (local variable values) are dropped on purpose.
  if (frame.context_line !== undefined)
    out.context_line = text(frame.context_line);
  if (frame.pre_context !== undefined)
    out.pre_context = textList(frame.pre_context);
  if (frame.post_context !== undefined)
    out.post_context = textList(frame.post_context);
  return out;
}

function rebuildException(value: Bag): Bag {
  const out: Bag = {};
  if (value.type !== undefined) out.type = value.type;
  if (value.value !== undefined) out.value = text(value.value);
  const mech = value.mechanism as Bag | undefined;
  if (mech) out.mechanism = pick(mech, ["type", "handled", "synthetic"]);
  const frames = (value.stacktrace as { frames?: Bag[] } | undefined)?.frames;
  if (frames) out.stacktrace = { frames: frames.map(rebuildFrame) };
  return out;
}

function rebuildHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (!ALLOWED_HEADERS.has(lower) || typeof value !== "string") continue;
    kept[name] = lower === "referer" ? stripUrl(value) : redactText(value);
  }
  return kept;
}

function rebuildBreadcrumb(crumb: Bag): Bag {
  const out = pick(crumb, BREADCRUMB_FIELDS);
  if (typeof crumb.message === "string")
    out.message = stripQueriesInText(crumb.message);
  const data = crumb.data as Bag | undefined;
  if (data) {
    const kept = pick(data, ["method", "status_code"]);
    if (typeof data.url === "string") kept.url = stripUrl(data.url);
    out.data = kept;
  }
  return out;
}

function rebuildSpan(span: Bag): Bag {
  const out = pick(span, SPAN_FIELDS);
  const description = span.description;
  if (typeof description === "string") {
    out.description = HAS_URL.test(description)
      ? stripQueriesInText(description)
      : redactText(description);
  }
  return out; // span.data is dropped on purpose.
}

function rebuildContexts(contexts: Bag): Bag {
  const out: Bag = {};
  for (const key of SAFE_CONTEXTS) {
    if (contexts[key] !== undefined) out[key] = scrub(contexts[key]);
  }
  const trace = contexts.trace as Bag | undefined;
  if (trace) out.trace = pick(trace, TRACE_FIELDS);
  return out;
}

function rebuildTags(tags: Bag): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tags)) {
    if (!ALLOWED_TAGS.has(key) && !key.startsWith(TAG_PREFIX)) continue;
    out[key] = redactText(String(value));
  }
  return out;
}

/**
 * beforeSend / beforeSendTransaction helper. ALLOWLIST rebuild: builds a new event from
 * known-safe fields and drops everything else (extra, request body/query/cookies, user
 * fields other than id, span and breadcrumb data, stack frame vars, unknown top-level
 * fields). Free text goes through redactText; URLs keep origin and path only.
 */
export function scrubEvent<T>(event: T): T {
  const src = event as unknown as Bag;
  const out = pick(src, PASSTHROUGH);

  if (typeof src.transaction === "string")
    out.transaction = stripQueriesInText(src.transaction);
  if (typeof src.message === "string") out.message = redactText(src.message);

  const logentry = src.logentry as Bag | undefined;
  if (logentry) {
    const kept: Bag = {};
    if (logentry.message !== undefined) kept.message = text(logentry.message);
    if (logentry.formatted !== undefined)
      kept.formatted = text(logentry.formatted);
    out.logentry = kept; // params are dropped on purpose.
  }

  const values = (src.exception as { values?: Bag[] } | undefined)?.values;
  if (values) out.exception = { values: values.map(rebuildException) };

  const user = src.user as Bag | undefined;
  if (user?.id !== undefined) out.user = { id: user.id };

  if (src.tags) out.tags = rebuildTags(src.tags as Bag);
  if (src.contexts) out.contexts = rebuildContexts(src.contexts as Bag);

  const req = src.request as {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  };
  if (req) {
    const kept: Bag = {};
    if (req.method !== undefined) kept.method = req.method;
    if (typeof req.url === "string") kept.url = stripUrl(req.url);
    if (req.headers) kept.headers = rebuildHeaders(req.headers);
    out.request = kept;
  }

  const crumbs = src.breadcrumbs as Bag[] | undefined;
  if (crumbs) out.breadcrumbs = crumbs.map(rebuildBreadcrumb);
  const spans = src.spans as Bag[] | undefined;
  if (spans) out.spans = spans.map(rebuildSpan);

  return out as unknown as T;
}
