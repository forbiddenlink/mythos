/**
 * Optional recurring "patron" tier for /support. A Stripe payment link set in
 * NEXT_PUBLIC_STRIPE_PATRON_LINK; anything that is not an https Stripe URL is
 * ignored so a typo cannot send supporters somewhere else.
 */
const STRIPE_HOSTS = new Set(["buy.stripe.com", "checkout.stripe.com"]);

export function getPatronLink(
  value: string | undefined = process.env.NEXT_PUBLIC_STRIPE_PATRON_LINK,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" && STRIPE_HOSTS.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
