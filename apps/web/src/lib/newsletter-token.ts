/**
 * Signed confirmation links for the weekly digest's double opt-in.
 *
 * Token: base64url(email) "." expiry (unix seconds) "." base64url(HMAC-SHA256).
 * The HMAC key is derived from RESEND_API_KEY with a fixed label, so the
 * feature needs no extra secret and the API key itself is never the MAC key.
 * Rotating RESEND_API_KEY invalidates outstanding links, which only means a
 * pending reader signs up again.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const CONFIRM_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const KEY_LABEL = "mythos-atlas/newsletter-confirm/v1";

function deriveKey(apiKey: string): Buffer {
  return createHmac("sha256", apiKey).update(KEY_LABEL).digest();
}

function sign(key: Buffer, payload: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createConfirmToken(
  email: string,
  apiKey: string,
  now: Date = new Date(),
  ttlSeconds: number = CONFIRM_TOKEN_TTL_SECONDS,
): string {
  const expires = Math.floor(now.getTime() / 1000) + ttlSeconds;
  const payload = `${Buffer.from(email, "utf8").toString("base64url")}.${expires}`;
  return `${payload}.${sign(deriveKey(apiKey), payload)}`;
}

/**
 * When a verified token was issued, in ms. The token carries only its expiry,
 * and every token is minted with CONFIRM_TOKEN_TTL_SECONDS, so issue time is
 * expiry minus that TTL. Used to ask "did the reader unsubscribe after this
 * link was sent".
 */
export function confirmTokenIssuedAtMs(token: string): number {
  const expires = Number(token.split(".")[1]);
  return (expires - CONFIRM_TOKEN_TTL_SECONDS) * 1000;
}

export type VerifyResult =
  { ok: true; email: string } | { ok: false; reason: "invalid" | "expired" };

export function verifyConfirmToken(
  token: string,
  apiKey: string,
  now: Date = new Date(),
): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "invalid" };
  const [encodedEmail, expiresRaw, mac] = parts as [string, string, string];
  if (!/^\d{1,12}$/.test(expiresRaw)) return { ok: false, reason: "invalid" };

  const expected = Buffer.from(
    sign(deriveKey(apiKey), `${encodedEmail}.${expiresRaw}`),
  );
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "invalid" };
  }

  if (Number(expiresRaw) < Math.floor(now.getTime() / 1000)) {
    return { ok: false, reason: "expired" };
  }
  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  if (!email.includes("@") || email.length > 254) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, email };
}
