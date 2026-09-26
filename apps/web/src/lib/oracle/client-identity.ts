/**
 * Who is asking? Resolves the per-client rate-limit key for the Oracle.
 *
 * Normally that is the client IP from the platform's forwarding headers. When
 * no IP can be determined (a misconfigured proxy, a local tool hitting the
 * route directly), we do NOT fall back to one shared "anonymous" key: a single
 * abusive client would then exhaust it and lock out every other IP-less
 * visitor. Instead IP-less requests are keyed by a hash of their
 * User-Agent + Accept-Language and go through a separate, stricter bucket
 * (see `checkOracleAnonymousRateLimit`). An abuser who rotates those headers
 * can dodge the per-key limit, but is still bounded by the global daily
 * request and token caps — and cannot starve other clients' keys.
 */

export type OracleClientIdentity =
  { kind: "ip"; key: string } | { kind: "anonymous"; key: string };

export function clientIpFromHeaders(headers: Headers): string | null {
  const vercelForwarded = headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelForwarded) return vercelForwarded;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    // Prefer the last hop (proxy-appended) when a chain is present.
    if (hops.length > 0) return hops[hops.length - 1]!;
  }

  return null;
}

/** FNV-1a 32-bit; only used to shorten header values into a key, not for security. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getOracleClientIdentity(
  headers: Headers,
): OracleClientIdentity {
  const ip = clientIpFromHeaders(headers);
  if (ip) return { kind: "ip", key: ip };

  const fingerprint = [
    headers.get("user-agent") ?? "",
    headers.get("accept-language") ?? "",
  ].join("|");
  return { kind: "anonymous", key: `anon:${fnv1a(fingerprint)}` };
}
