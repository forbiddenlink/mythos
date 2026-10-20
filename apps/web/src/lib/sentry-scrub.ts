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
const JSON_PAIR =
  /"((?:[^"\\]|\\.){1,64})"\s*:\s*("(?:[^"\\]|\\.){0,2048}"|[^,}\s]{1,256})/g;
const KEY_VALUE_TEXT =
  /\b(pass\w{0,32}|secret|token|api[_-]?key|authorization|session|cookie)(\s{0,4}[:=]\s{0,4})[^\s"',;&]{1,256}/gi;
const USERINFO = /(\b[A-Za-z][A-Za-z0-9+.-]{0,16}:\/\/)[^\s/@]{1,128}@/g;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;
const CARD = /\b(?:\d[ -]?){13,19}\b/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const PHONE = /(?<![^\s(])\+?\d[\d\s().-]{8,18}\d(?![\w:])/g;
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

/** "key": value pairs (serialized JSON, string-aware) whose key looks sensitive. */
function redactJsonPairs(text: string): string {
  return text.replace(JSON_PAIR, (pair, key: string) =>
    SENSITIVE_PARAM.test(key) ? `"${key}":"[REDACTED]"` : pair,
  );
}

/** `key: value` and `key = value` for sensitive keys, in plain text. */
function redactKeyValueText(text: string): string {
  return text.replace(KEY_VALUE_TEXT, (_m, key: string, sep: string) => {
    return `${key}${sep}[REDACTED]`;
  });
}

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits.charAt(digits.length - 1 - i));
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function redactCards(text: string): string {
  return text.replace(CARD, (match) => {
    const digits = match.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19 && luhn(digits)
      ? "[CARD]"
      : match;
  });
}

function redactIps(text: string): string {
  return text.replace(IPV4, (match) =>
    match.split(".").every((o) => Number(o) <= 255) ? "[IP]" : match,
  );
}

/** Token-shaped secrets: highest priority, run before any key/value handling. */
function redactTokens(text: string): string {
  return text
    .replace(AUTH_HEADER, "Authorization: [REDACTED]")
    .replace(BEARER, "Bearer [TOKEN]")
    .replace(BASIC, "Basic [TOKEN]")
    .replace(JWT, "[JWT]")
    .replace(API_KEY, "[API_KEY]");
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
  // Escaped JSON (\\"password\\":\\"x\\") is unescaped so the pair pass can see it.
  let current = input.replace(/\\+"/g, '"');
  for (let round = 0; round < 2; round++) {
    current = percentDecode(redactKeyValues(redactTokens(current)));
  }
  const redacted = redactPhones(
    redactIps(
      redactCards(
        redactEmails(
          redactJsonPairs(
            redactKeyValueText(redactKeyValues(redactTokens(current))),
          ),
        ).replace(SSN, "[SSN]"),
      ),
    ),
  ).replace(USERINFO, "$1");
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

/** Keep protocol, host and path only; userinfo, query and fragment never get copied. */
export function stripUrl(url: string): string {
  let stripped: string;
  try {
    const parsed = new URL(url);
    stripped = parsed.host
      ? `${parsed.protocol}//${parsed.host}${parsed.pathname}`
      : splitUrl(url);
  } catch {
    stripped = splitUrl(url);
  }
  return redactText(stripped);
}

/** Fallback when URL parsing fails: drop userinfo up to the LAST "@" in the authority, then cut at ? or #. */
function splitUrl(url: string): string {
  const m = /^([A-Za-z][A-Za-z0-9+.-]*:\/\/)([^/]*)([\s\S]*)$/.exec(url);
  const rebuilt = m
    ? `${m[1]}${(m[2] ?? "").slice((m[2] ?? "").lastIndexOf("@") + 1)}${m[3]}`
    : url;
  return rebuilt.split(/[?#]/)[0] ?? "";
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
  "sdk",
  "type",
  "start_timestamp",
] as const;
/** Logger context keys that may become Sentry tags (ctx.<key>). Everything else is dropped. */
export const CTX_TAG_KEYS = [
  "route",
  "op",
  "status",
  "method",
  "requestId",
  "component",
  "durationMs",
  "provider",
] as const;
const CTX_TAG_SET = new Set<string>(CTX_TAG_KEYS);
const IMAGE_FIELDS = [
  "type",
  "debug_id",
  "code_id",
  "image_addr",
  "image_size",
  "image_vmaddr",
];
const ALLOWED_TAGS = new Set([
  "environment",
  "release",
  "route",
  "runtime",
  "level",
  "source",
]);
const TAG_PREFIX = "ctx.";
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
  // context_line, pre_context and post_context are dropped on purpose.
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
    const allowed =
      ALLOWED_TAGS.has(key) ||
      (key.startsWith(TAG_PREFIX) &&
        CTX_TAG_SET.has(key.slice(TAG_PREFIX.length)));
    if (!allowed) continue;
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
  if (user?.id !== undefined) out.user = { id: redactText(String(user.id)) };
  const fingerprint = textList(src.fingerprint);
  if (fingerprint) out.fingerprint = fingerprint;

  const meta = src.debug_meta as Bag | undefined;
  if (meta) {
    const kept: Bag = {};
    const images = meta.images;
    if (Array.isArray(images)) {
      kept.images = images
        .filter((i): i is Bag => typeof i === "object" && i !== null)
        .map((i) => pick(i, IMAGE_FIELDS));
    }
    if (meta.sdk_info !== undefined) kept.sdk_info = scrub(meta.sdk_info);
    out.debug_meta = kept;
  }

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
