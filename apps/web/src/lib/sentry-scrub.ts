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
  /token|secret|key|pass|pwd|auth|sig|session|jwt|code|email|phone|ssn|card|cvv|cvc/i;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const BASIC = /\bBasic\s+[A-Za-z0-9+/]{4,}={0,2}/gi;
const AUTH_HEADER = /\bAuthorization\s*:[^\n\r]{0,200}/gi;
const JSON_KEY = /"((?:[^"\\]|\\.){1,64})"\s*:\s*/g;
const KEY_CHAR = /[A-Za-z0-9_.-]/;
const SENSITIVE_WORD =
  /pass|pwd|secret|token|api[_-]?key|authorization|session|cookie/i;
const USERINFO =
  /(\b[A-Za-z][A-Za-z0-9+.-]{0,16}:\/\/)[A-Za-z0-9._~%!$&()*+;=-]{0,256}(?::[^\s/@"',{}<>]{0,2048})?@/g;
const SSN = /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g;
const CARD = /\b(?:\d[ -]?){13,19}\b/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const PHONE =
  /(?<![^\s(:+[\]"'=,;>/])\+?\d[\d\s()./-]{8,18}\d(?![A-Za-wyz0-9_:])/g;
const JWT =
  /(?<![A-Za-z0-9_-])ey[A-Za-z0-9_-]{2,}\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g;
const API_KEY = new RegExp(
  [
    "(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{10,}",
    "(?:sk|pk|rk)_[A-Za-z0-9]{20,}",
    "sk-[A-Za-z0-9_-]{20,}",
    "(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}",
    "github_pat_[A-Za-z0-9_]{20,}",
    "xox[baprs]-[A-Za-z0-9-]{10,}",
    "AKIA[0-9A-Z]{16}",
    "AIza[0-9A-Za-z_-]{35}",
  ]
    .map((p) => `(?<![A-Za-z0-9])${p}`)
    .join("|"),
  "g",
);
const KV_SEGMENT = /[^?#&;\s]+/g;
const LOCAL_CH = /[\p{L}\p{N}._%+-]/u;
const DOMAIN_CH = /[\p{L}\p{N}.-]/u;
const TLD = /^(?:xn--[A-Za-z0-9-]{2,}|\p{L}{2,})$/u;
const IPV6_RUN = /(?<![\w:])[0-9A-Fa-f:]{3,39}(?![\w:])/g;
const MAX_QUOTED_KEY = 512;
const MAX_STRUCT = 4096;
const MAX_EXCEPTIONS = 20;
const MAX_FRAMES = 100;

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    // Invalid UTF-8 (such as %FF): decode the ASCII bytes one at a time.
    return text.replace(/%([0-7][0-9A-Fa-f])/g, (_m, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
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
    // A quoted value can contain spaces and delimiters; the text pass measures it.
    if (/^\\?["']/.test(segment.slice(eq + 1))) return segment;
    return SENSITIVE_PARAM.test(safeDecode(key))
      ? `${key}=[REDACTED]`
      : segment;
  });
}

/** One key test for JSON pairs, key=value and key: value. */
/** Decode \uXXXX escapes so an escaped key such as pa\u0073sword is matched as written. */
function unescapeUnicode(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
}

function isSensitiveKey(key: string): boolean {
  const k = percentDecode(unescapeUnicode(key));
  return SENSITIVE_PARAM.test(k) || SENSITIVE_WORD.test(k);
}

/** End index of a quoted string that starts at `start` (a quote), or text.length. */
function quotedEnd(text: string, start: number): number {
  const quote = text.charAt(start);
  for (let i = start + 1; i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\\") i++;
    else if (ch === quote) return i + 1;
  }
  return text.length;
}

/** End of an object or array value that starts at `start`, string-aware and bounded. */
function structEnd(text: string, start: number): number {
  let depth = 0;
  const limit = Math.min(text.length, start + MAX_STRUCT);
  for (let i = start; i < limit; i++) {
    const ch = text.charAt(i);
    if (ch === '"' || ch === "'") {
      i = quotedEnd(text, i) - 1;
    } else if (ch === "{" || ch === "[") {
      depth++;
    } else if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return text.length;
}

/**
 * End of the value that begins at `start`, or undefined when there is none. Quoted values
 * (plain or JSON-escaped) run to the closing quote; objects and arrays to their closing
 * bracket; anything else to a delimiter. A closing quote followed straight away by a key
 * character means the quote was inside the value, so redaction runs on to , } or end of line.
 */
function valueEnd(
  text: string,
  start: number,
  scalar: RegExp,
): number | undefined {
  const first = text.charAt(start);
  let end: number;
  if (first === "{" || first === "[") {
    end = structEnd(text, start);
  } else if (first === '"' || first === "'") {
    end = quotedEnd(text, start);
  } else if (first === "\\" && /["']/.test(text.charAt(start + 1))) {
    const close = text.indexOf(`\\${text.charAt(start + 1)}`, start + 2);
    end = close === -1 ? text.length : close + 2;
  } else {
    scalar.lastIndex = start;
    const v = scalar.exec(text);
    return v && v.index === start ? start + v[0].length : undefined;
  }
  if (end < text.length && KEY_CHAR.test(text.charAt(end))) {
    const rest = text.slice(end).search(/[,}\n]/);
    end = rest === -1 ? text.length : end + rest;
  }
  return end;
}

/**
 * Replace the value that follows each sensitive key. `pattern` matches `key sep` only and
 * the value is measured here, so a non-sensitive key never swallows a pair nested in its
 * value.
 */
function redactAfterKeys(
  text: string,
  pattern: RegExp,
  keyOf: (m: RegExpExecArray) => string,
  scalar: RegExp,
  render: (m: RegExpExecArray) => string,
): string {
  let out = "";
  let last = 0;
  pattern.lastIndex = 0;
  for (let m = pattern.exec(text); m; m = pattern.exec(text)) {
    const start = m.index + m[0].length;
    if (!isSensitiveKey(keyOf(m))) continue;
    const end = valueEnd(text, start, scalar);
    if (end === undefined) continue;
    out += text.slice(last, m.index) + render(m);
    last = end;
    pattern.lastIndex = end;
  }
  return out + text.slice(last);
}

/** "key": value pairs (serialized JSON, string-aware) whose key looks sensitive. */
function redactJsonPairs(text: string): string {
  return redactAfterKeys(
    text,
    JSON_KEY,
    (m) => m[1] ?? "",
    /[^,}\s]+/g,
    (m) => `"${m[1]}":"[REDACTED]"`,
  );
}

/**
 * The key written before the separator at `at`: a quoted key (any length up to
 * MAX_QUOTED_KEY, escaped quotes allowed) or up to 64 key characters. `long` is true when
 * the key is longer than what could be read, in which case the caller redacts by default.
 */
function keyBefore(
  text: string,
  at: number,
  last: number,
): { key: string; long: boolean } | undefined {
  let end = at;
  // password[] and creds[password] name their key before the brackets close.
  while (end > last && /[\s[\]]/.test(text.charAt(end - 1))) end--;
  if (end <= last) return undefined;
  const close = text.charAt(end - 1);
  if (close === '"' || close === "'") {
    let e = end - 1;
    while (e > last && text.charAt(e - 1) === "\\") e--;
    const stop = Math.max(last, e - MAX_QUOTED_KEY);
    let s = e - 1;
    while (s >= stop && text.charAt(s) !== close) s--;
    if (s < stop) return { key: "", long: true };
    const key = text.slice(s + 1, e);
    return key === "" ? undefined : { key, long: false };
  }
  let start = end;
  while (
    start > last &&
    end - start < 64 &&
    KEY_CHAR.test(text.charAt(start - 1))
  )
    start--;
  if (start === end) return undefined;
  const long =
    end - start === 64 && start > last && KEY_CHAR.test(text.charAt(start - 1));
  return { key: text.slice(start, end), long };
}

/**
 * `key: value` and `key = value` for sensitive keys, quoted or not, in plain text. Cost per
 * separator is bounded, so the pass is linear.
 */
function redactKeyValueText(text: string): string {
  const scalar = /[^\s,;&"']+/y;
  let out = "";
  let last = 0;
  const sep = /[:=]/g;
  for (let m = sep.exec(text); m; m = sep.exec(text)) {
    const at = m.index;
    const found = keyBefore(text, at, last);
    if (!found || !(found.long || isSensitiveKey(found.key))) continue;
    let start = at + 1;
    while (start < text.length && /\s/.test(text.charAt(start))) start++;
    if (
      /^\\?"?\[REDACTED\]\\?"?(?![\p{L}\p{N}_])/u.test(
        text.slice(start, start + 16),
      )
    )
      continue;
    let end = valueEnd(text, start, scalar);
    if (end === undefined) continue;
    const wholeLine =
      /^(?:set-)?cookie$/i.test(found.key) ||
      (m[0] === ":" &&
        /pass|pwd|secret/i.test(found.key) &&
        !/^["'\\{[]/.test(text.charAt(start)));
    if (wholeLine) {
      // A cookie header holds several name=value pairs; redact the whole line.
      const eol = text.indexOf("\n", start);
      end = eol === -1 ? text.length : eol;
    }
    out += `${text.slice(last, start)}[REDACTED]`;
    last = end;
    sep.lastIndex = end;
  }
  return out + text.slice(last);
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

/** IPv6 addresses: a hex-and-colon run with a "::" or at least five colons. Times stay. */
function redactIpv6(text: string): string {
  return text.replace(IPV6_RUN, (match) => {
    const colons = match.split(":").length - 1;
    return match.includes("::") || colons >= 5 ? "[IP]" : match;
  });
}

const URL_STOP = /[\s"'<>]/;
const SCHEME_CH = /[A-Za-z0-9+.-]/;

/**
 * Query values in URLs inside free text: keep the parameter names, drop every value. One
 * linear scan: a token with no "?" is skipped whole, so repeated "a://" cannot rescan it,
 * and a query of any length is redacted to the end of its token (fail closed).
 */
function redactUrlQueries(text: string): string {
  let out = "";
  let last = 0;
  let pos = 0;
  for (let at = text.indexOf("://"); at !== -1; at = text.indexOf("://", pos)) {
    let s = at;
    while (s > 0 && at - s < 17 && SCHEME_CH.test(text.charAt(s - 1))) s--;
    let q = at + 3;
    while (
      q < text.length &&
      !URL_STOP.test(text.charAt(q)) &&
      text.charAt(q) !== "?"
    )
      q++;
    if (
      at - s < 2 ||
      !/[A-Za-z]/.test(text.charAt(s)) ||
      text.charAt(q) !== "?"
    ) {
      pos = Math.max(q, at + 3);
      continue;
    }
    let e = q + 1;
    while (e < text.length && !URL_STOP.test(text.charAt(e))) e++;
    const pairs = text
      .slice(q + 1, e)
      .split("&")
      .map((pair) => {
        const eq = pair.indexOf("=");
        return eq < 1 ? pair : `${pair.slice(0, eq)}=[REDACTED]`;
      });
    out += `${text.slice(last, q + 1)}${pairs.join("&")}`;
    last = e;
    pos = e;
  }
  return out + text.slice(last);
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
    if (text.charAt(left - 1) === '"' && left - 1 > last) {
      // Quoted local part: "any text"@host
      const open = text.lastIndexOf('"', left - 2);
      if (open >= last && left - open <= 66) left = open;
    }
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
  for (let round = 0; round < 3; round++) {
    current = percentDecode(redactKeyValues(redactTokens(current)));
  }
  let redacted = redactPass(current);
  // Escaped JSON (\\"password\\":\\"x\\") is scanned as written first, then unescaped and
  // decoded and scanned again until the text stops changing, so layered encodings
  // (\\u0025 over %40) are peeled one layer per round.
  for (let round = 0; round < 4; round++) {
    const next = percentDecode(unescapeUnicode(redacted)).replace(/\\+"/g, '"');
    if (next === redacted) break;
    redacted = redactPass(next);
  }
  if (text.length <= MAX_TEXT && redacted.length <= MAX_TEXT) return redacted;
  return `${dropPartialRun(redacted.slice(0, MAX_TEXT))}[TRUNCATED]`;
}

function redactPass(current: string): string {
  return redactPhones(
    redactIpv6(
      redactIps(
        redactCards(
          redactEmails(
            redactKeyValueText(
              redactJsonPairs(
                redactKeyValues(
                  redactUrlQueries(
                    redactTokens(current).replace(USERINFO, "$1"),
                  ),
                ),
              ),
            ),
          ).replace(SSN, "[SSN]"),
        ),
      ),
    ),
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
const ALLOWED_TAGS = new Set([
  "environment",
  "release",
  "route",
  "runtime",
  "level",
  "source",
]);
const TAG_PREFIX = "ctx.";
const METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
]);
const LEVELS = new Set(["fatal", "error", "warning", "log", "info", "debug"]);
const IMAGE_ID = /^[0-9a-fA-F-]{8,64}$/;
const IMAGE_ADDR = /^0x[0-9a-fA-F]{1,16}$/;
const HAS_URL = /https?:\/\/|^[A-Z]+ \//;
const MAX_ITEMS = 500;
const MAX_ID = 256;

type Bag = Record<string, unknown>;

function isBag(v: unknown): v is Bag {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Array entries that are plain objects, capped. Anything else is skipped. */
function bags(v: unknown, max = MAX_ITEMS): Bag[] {
  return Array.isArray(v) ? v.slice(0, max).filter(isBag) : [];
}

/** A short identifier string; anything else is dropped. */
function id(v: unknown): string | undefined {
  return typeof v === "string" ? redactText(v).slice(0, MAX_ID) : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Timestamps arrive as epoch numbers or ISO strings. */
function time(v: unknown): number | string | undefined {
  return num(v) ?? id(v);
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? redactText(value) : undefined;
}

function textList(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value
        .slice(0, MAX_ITEMS)
        .filter((v): v is string => typeof v === "string")
        .map(redactText)
    : undefined;
}

/** Copy only fields whose value passes the reader; the rest are dropped. */
function take(
  source: Bag,
  readers: Record<string, (v: unknown) => unknown>,
): Bag {
  const out: Bag = {};
  for (const [field, read] of Object.entries(readers)) {
    const v = read(source[field]);
    if (v !== undefined) out[field] = v;
  }
  return out;
}

const bool = (v: unknown): boolean | undefined =>
  typeof v === "boolean" ? v : undefined;

function enumOf(allowed: Set<string>) {
  return (v: unknown): string | undefined =>
    typeof v === "string" && allowed.has(v) ? v : undefined;
}

function rebuildImage(image: Bag): Bag {
  const idCheck = (v: unknown) =>
    typeof v === "string" && IMAGE_ID.test(v) ? v : undefined;
  const addr = (v: unknown) =>
    typeof v === "string" && IMAGE_ADDR.test(v) ? v : (num(v) ?? undefined);
  return take(image, {
    type: (v) =>
      typeof v === "string" && /^[a-z_]{1,32}$/.test(v) ? v : undefined,
    debug_id: idCheck,
    code_id: idCheck,
    image_addr: addr,
    image_size: addr,
    image_vmaddr: addr,
  });
}

function rebuildFrame(frame: Bag): Bag {
  const out = take(frame, {
    function: id,
    module: id,
    lineno: num,
    colno: num,
    in_app: bool,
  });
  for (const field of ["filename", "abs_path"]) {
    const v = frame[field];
    if (typeof v === "string") out[field] = stripUrl(v);
  }
  // vars, context_line, pre_context and post_context are dropped on purpose.
  return out;
}

function rebuildException(value: Bag): Bag {
  const out: Bag = {};
  const type = id(value.type);
  if (type !== undefined) out.type = type;
  const v = text(value.value);
  if (v !== undefined) out.value = v;
  if (isBag(value.mechanism)) {
    out.mechanism = take(value.mechanism, {
      type: id,
      handled: bool,
      synthetic: bool,
    });
  }
  const stack = value.stacktrace;
  if (isBag(stack) && Array.isArray(stack.frames)) {
    out.stacktrace = {
      frames: bags(stack.frames, MAX_FRAMES).map(rebuildFrame),
    };
  }
  return out;
}

function rebuildHeaders(headers: Bag): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (!ALLOWED_HEADERS.has(lower) || typeof value !== "string") continue;
    kept[name] = lower === "referer" ? stripUrl(value) : redactText(value);
  }
  return kept;
}

function rebuildBreadcrumb(crumb: Bag): Bag {
  const out = take(crumb, {
    category: id,
    level: enumOf(LEVELS),
    timestamp: time,
    type: id,
  });
  if (typeof crumb.message === "string")
    out.message = stripQueriesInText(crumb.message);
  if (isBag(crumb.data)) {
    const kept = take(crumb.data, {
      method: enumOf(METHODS),
      status_code: num,
    });
    if (typeof crumb.data.url === "string") kept.url = stripUrl(crumb.data.url);
    out.data = kept;
  }
  return out;
}

function rebuildSpan(span: Bag): Bag {
  const out = take(span, {
    span_id: id,
    parent_span_id: id,
    trace_id: id,
    op: id,
    status: id,
    start_timestamp: time,
    timestamp: time,
    origin: id,
  });
  const description = span.description;
  if (typeof description === "string") {
    out.description = HAS_URL.test(description)
      ? stripQueriesInText(description)
      : redactText(description);
  }
  return out; // span.data is dropped on purpose.
}

const CONTEXT_FIELDS: Record<string, string[]> = {
  os: ["name", "version", "build", "kernel_version"],
  runtime: ["name", "version"],
  browser: ["name", "version"],
  device: [
    "family",
    "model",
    "model_id",
    "arch",
    "brand",
    "manufacturer",
    "simulator",
    "memory_size",
    "free_memory",
    "usable_memory",
    "storage_size",
    "free_storage",
    "screen_width_pixels",
    "screen_height_pixels",
    "screen_density",
    "processor_count",
    "processor_frequency",
    "online",
    "charging",
    "orientation",
  ],
  app: [
    "app_name",
    "app_version",
    "app_build",
    "app_identifier",
    "build_type",
    "in_foreground",
  ],
};

/** Scalar context fields on a per-context allowlist; nested values are dropped. */
function rebuildContexts(contexts: Bag): Bag {
  const out: Bag = {};
  for (const [key, fields] of Object.entries(CONTEXT_FIELDS)) {
    const ctx = contexts[key];
    if (!isBag(ctx)) continue;
    const kept: Bag = {};
    for (const field of fields) {
      const v = ctx[field];
      if (typeof v === "string") kept[field] = id(v);
      else if (typeof v === "boolean" || num(v) !== undefined) kept[field] = v;
    }
    out[key] = kept;
  }
  if (isBag(contexts.trace)) {
    out.trace = take(contexts.trace, {
      trace_id: id,
      span_id: id,
      parent_span_id: id,
      op: id,
      status: id,
      origin: id,
    });
  }
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
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    )
      continue;
    out[key] = redactText(String(value));
  }
  return out;
}

function rebuildEvent(src: Bag): Bag {
  const out = take(src, {
    event_id: id,
    timestamp: time,
    level: enumOf(LEVELS),
    platform: id,
    environment: id,
    release: id,
    dist: id,
    server_name: id,
    type: id,
    start_timestamp: time,
  });
  if (isBag(src.sdk)) out.sdk = take(src.sdk, { name: id, version: id });

  if (typeof src.transaction === "string")
    out.transaction = stripQueriesInText(src.transaction);
  if (typeof src.message === "string") out.message = redactText(src.message);

  if (isBag(src.logentry)) {
    out.logentry = take(src.logentry, { message: text, formatted: text }); // params dropped
  }

  if (isBag(src.exception) && Array.isArray(src.exception.values)) {
    out.exception = {
      values: bags(src.exception.values, MAX_EXCEPTIONS).map(rebuildException),
    };
  }

  if (isBag(src.user)) {
    const uid = src.user.id;
    if (typeof uid === "string" || typeof uid === "number")
      out.user = { id: redactText(String(uid)) };
  }
  const fingerprint = textList(src.fingerprint);
  if (fingerprint) out.fingerprint = fingerprint;

  if (isBag(src.debug_meta)) {
    const kept: Bag = {};
    if (Array.isArray(src.debug_meta.images))
      kept.images = bags(src.debug_meta.images).map(rebuildImage);
    if (isBag(src.debug_meta.sdk_info)) {
      kept.sdk_info = take(src.debug_meta.sdk_info, {
        sdk_name: id,
        version_major: num,
        version_minor: num,
        version_patchlevel: num,
      });
    }
    out.debug_meta = kept;
  }

  if (isBag(src.tags)) out.tags = rebuildTags(src.tags);
  if (isBag(src.contexts)) out.contexts = rebuildContexts(src.contexts);

  if (isBag(src.request)) {
    const req = src.request;
    const kept: Bag = {};
    const method = enumOf(METHODS)(req.method);
    if (method !== undefined) kept.method = method;
    if (typeof req.url === "string") kept.url = stripUrl(req.url);
    if (isBag(req.headers)) kept.headers = rebuildHeaders(req.headers);
    out.request = kept;
  }

  if (Array.isArray(src.breadcrumbs))
    out.breadcrumbs = bags(src.breadcrumbs).map(rebuildBreadcrumb);
  if (Array.isArray(src.spans)) out.spans = bags(src.spans).map(rebuildSpan);
  return out;
}

/** Last resort when rebuilding throws: nothing from the original beyond ids and a type. */
function minimalEvent(src: unknown): Bag {
  const out: Bag = { message: "[scrub-error]" };
  try {
    if (isBag(src)) {
      Object.assign(
        out,
        take(src, { event_id: id, timestamp: time, level: enumOf(LEVELS) }),
      );
      const values = isBag(src.exception) ? src.exception.values : undefined;
      const first = Array.isArray(values) ? values[0] : undefined;
      const type = isBag(first) ? id(first.type) : undefined;
      if (type !== undefined) out.exception = { values: [{ type }] };
    }
  } catch {
    // keep the bare message
  }
  return out;
}

/**
 * beforeSend / beforeSendTransaction helper. ALLOWLIST rebuild: every field is type-checked
 * and copied into a new event; everything else is dropped (extra, request body/query/
 * cookies, user fields other than id, span and breadcrumb data, stack frame vars, unknown
 * top-level fields). Free text goes through redactText; URLs keep origin and path only.
 * Never throws and never returns the original event: on any error it returns a minimal
 * safe event.
 */
export function scrubEvent<T>(event: T): T {
  try {
    if (!isBag(event)) return minimalEvent(event) as unknown as T;
    return rebuildEvent(event) as unknown as T;
  } catch {
    return minimalEvent(event) as unknown as T;
  }
}
