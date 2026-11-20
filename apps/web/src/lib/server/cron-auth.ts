import { timingSafeEqual } from "node:crypto";

/**
 * True when `header` is exactly `Bearer <secret>`. Compared in constant time
 * so a caller cannot learn the secret one character at a time.
 */
export function bearerMatches(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
