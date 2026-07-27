/**
 * Resolve a user-supplied redirect target to a same-origin URL.
 * Rejects absolute URLs, protocol-relative URLs, and other-origin results.
 */
export function safeSameOriginRedirect(
  target: string | null | undefined,
  requestUrl: string,
  fallback = "/",
): URL {
  const base = new URL(requestUrl);
  const candidate = (target ?? "").trim() || fallback;

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return new URL(fallback, base);
  }

  try {
    const resolved = new URL(candidate, base);
    if (resolved.origin !== base.origin) {
      return new URL(fallback, base);
    }
    return resolved;
  } catch {
    return new URL(fallback, base);
  }
}
