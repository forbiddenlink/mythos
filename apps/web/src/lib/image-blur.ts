import "server-only";
import hashes from "@/data/thumbhashes.json";
import { thumbHashToBlurDataURL } from "@/lib/thumbhash-data-url";

const HASHES: Readonly<Record<string, string>> = hashes;

/**
 * Compact ThumbHash for a local `/public` image path, or undefined for remote,
 * unknown or empty values. Server only: the whole map is ~77 KB (~32 KB gzip)
 * and must never reach a client bundle. Pass the result to `EntityCard`'s
 * `blurHash`, or through props to a client component.
 */
export function getBlurHash(
  src: string | null | undefined,
): string | undefined {
  if (!src || !src.startsWith("/")) return undefined;
  return Object.hasOwn(HASHES, src) ? HASHES[src] : undefined;
}

/** Ready `blurDataURL` for a server component rendering `<Image>` directly. */
export function getBlurDataURL(
  src: string | null | undefined,
): string | undefined {
  const hash = getBlurHash(src);
  return hash ? thumbHashToBlurDataURL(hash) : undefined;
}
