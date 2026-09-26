/**
 * Weekly myth digest sign-ups, stored as contacts in a Resend segment.
 *
 * Server-side only in practice (it reads secrets), but free of Next imports
 * so it can be unit-tested with a fake client.
 */
import { z } from "zod";

/** The Resend segment the digest is sent to. Not a secret. */
export const DEFAULT_RESEND_SEGMENT_ID = "ef4d9db5-a6ff-4f30-adf3-be3576e3fe42";

export const NEWSLETTER_PLACEMENTS = ["footer", "daily_myth"] as const;
export type NewsletterPlacement = (typeof NEWSLETTER_PLACEMENTS)[number];

export const newsletterRequestSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email())
    .transform((value) => value.toLowerCase()),
  // The visitor must tick the box; anything else is not consent.
  consent: z.literal(true),
  placement: z.enum(NEWSLETTER_PLACEMENTS).optional(),
  // Honeypot: hidden from people, filled by naive bots.
  website: z.string().max(200).optional(),
});

export type NewsletterRequest = z.infer<typeof newsletterRequestSchema>;

export interface NewsletterConfig {
  apiKey: string;
  segmentId: string;
}

/** Null when sign-ups are not configured (no RESEND_API_KEY). */
export function getNewsletterConfig(
  env: Record<string, string | undefined> = process.env,
): NewsletterConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    segmentId: env.RESEND_SEGMENT_ID?.trim() || DEFAULT_RESEND_SEGMENT_ID,
  };
}

interface ResendResult {
  error: { message: string; statusCode?: number | null; name?: string } | null;
}

/** The two Resend calls this feature makes (a subset of the SDK). */
export interface NewsletterClient {
  contacts: {
    create(payload: {
      email: string;
      unsubscribed?: boolean;
      segments?: Array<{ id: string }>;
    }): Promise<ResendResult>;
    segments: {
      add(options: { email: string; segmentId: string }): Promise<ResendResult>;
    };
  };
}

export type SubscribeResult =
  { ok: true } | { ok: false; reason: "upstream_error" };

function isAlreadyExists(error: NonNullable<ResendResult["error"]>): boolean {
  return (
    error.statusCode === 409 ||
    /already exists/i.test(error.message) ||
    error.name === "conflict"
  );
}

/**
 * Add `email` to the digest segment. An address that is already a contact is
 * added to the segment instead, so re-subscribing succeeds and the response
 * never reveals whether an address was known.
 */
export async function subscribeToNewsletter(
  client: NewsletterClient,
  email: string,
  segmentId: string,
): Promise<SubscribeResult> {
  const created = await client.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: segmentId }],
  });
  if (!created.error) return { ok: true };

  if (isAlreadyExists(created.error)) {
    const added = await client.contacts.segments.add({ email, segmentId });
    if (!added.error) return { ok: true };
  }
  return { ok: false, reason: "upstream_error" };
}
