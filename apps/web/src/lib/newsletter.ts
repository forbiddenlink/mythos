/**
 * Weekly myth digest sign-ups, stored as contacts in a Resend segment.
 *
 * Server-side only in practice (it reads secrets), but free of Next imports
 * so it can be unit-tested with a fake client.
 */
import "@/lib/zod-jitless";
import { z } from "zod";
import { logger } from "@/lib/logger";

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

export interface NewsletterConfig {
  apiKey: string;
  segmentId: string;
  /** Sender for the confirmation email (NEWSLETTER_FROM). */
  from: string;
}

/**
 * Null when sign-ups are not configured. Double opt-in needs to send a
 * confirmation email, so both RESEND_API_KEY and NEWSLETTER_FROM are required.
 */
export function getNewsletterConfig(
  env: Record<string, string | undefined> = process.env,
): NewsletterConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.NEWSLETTER_FROM?.trim();
  if (!apiKey || !from) return null;
  return {
    apiKey,
    segmentId: env.RESEND_SEGMENT_ID?.trim() || DEFAULT_RESEND_SEGMENT_ID,
    from,
  };
}

/**
 * Unsubscribe tracking depends on Resend's signed webhook. Without the secret
 * a link issued before an unsubscribe could resubscribe the reader, so
 * confirmation is disabled until it is set.
 */
export function getNewsletterWebhookSecret(
  env: Record<string, string | undefined> = process.env,
): string | null {
  return env.RESEND_WEBHOOK_SECRET?.trim() || null;
}

/**
 * The one prerequisite check for double opt-in, shared by sign-up and confirm
 * so neither can run while the other is disabled. Returns false (after logging
 * why) when RESEND_WEBHOOK_SECRET is missing; callers answer 503.
 */
export function ensureConfirmationEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (getNewsletterWebhookSecret(env)) return true;
  logger.error(
    "Newsletter confirmation disabled: RESEND_WEBHOOK_SECRET is not set, so unsubscribes cannot be tracked",
    {},
  );
  return false;
}

interface ResendResult {
  error: { message: string; statusCode?: number | null; name?: string } | null;
}

/** The Resend calls this feature makes (a subset of the SDK). */
export interface NewsletterClient {
  contacts: {
    create(payload: {
      email: string;
      unsubscribed?: boolean;
      segments?: Array<{ id: string }>;
    }): Promise<ResendResult>;
    update(payload: {
      email: string;
      unsubscribed?: boolean;
    }): Promise<ResendResult>;
    get(options: { email: string }): Promise<
      ResendResult & { data?: { unsubscribed?: boolean | null } | null }
    >;
    segments: {
      add(options: { email: string; segmentId: string }): Promise<ResendResult>;
    };
  };
  emails: {
    send(payload: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
    }): Promise<ResendResult>;
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

/** Subject line of the confirmation email; exported for tests. */
export const CONFIRMATION_SUBJECT = "Confirm your Mythos Atlas weekly myth";

function confirmationEmail(confirmUrl: string): { html: string; text: string } {
  // confirmUrl is built by the server from a fixed origin and a base64url
  // token, so it carries no user-supplied markup.
  const text = [
    "Someone, hopefully you, asked to receive the Mythos Atlas weekly myth at this address.",
    "",
    `Confirm the subscription: ${confirmUrl}`,
    "",
    "If this was not you, ignore this email. You will not be subscribed and will not hear from us again.",
  ].join("\n");
  const html = `<p>Someone, hopefully you, asked to receive the Mythos Atlas weekly myth at this address.</p>
<p><a href="${confirmUrl}">Confirm the subscription</a></p>
<p>If this was not you, ignore this email. You will not be subscribed and will not hear from us again.</p>`;
  return { html, text };
}

/**
 * Step one of double opt-in. Records the address as an unsubscribed contact
 * outside the digest segment (so no broadcast can reach it) and emails a
 * signed confirmation link. An existing contact is left exactly as it is, so a
 * stranger cannot unsubscribe or re-subscribe someone else, and the response
 * never reveals whether an address was known.
 */
export async function requestNewsletterConfirmation(
  client: NewsletterClient,
  opts: { email: string; from: string; confirmUrl: string },
): Promise<SubscribeResult> {
  const created = await client.contacts.create({
    email: opts.email,
    unsubscribed: true,
  });
  if (created.error && !isAlreadyExists(created.error)) {
    return { ok: false, reason: "upstream_error" };
  }

  const { html, text } = confirmationEmail(opts.confirmUrl);
  const sent = await client.emails.send({
    from: opts.from,
    to: opts.email,
    subject: CONFIRMATION_SUBJECT,
    html,
    text,
  });
  return sent.error ? { ok: false, reason: "upstream_error" } : { ok: true };
}

export type MutationGuardVerdict =
  "ok" | "lost" | "unsubscribed" | "unavailable";

/**
 * Called immediately before EVERY Resend mutation in the confirm sequence.
 * Anything but "ok" aborts the sequence before the call is made.
 */
export type MutationGuard = () => Promise<MutationGuardVerdict>;

/**
 * Called once after the last mutation. "unsubscribed" means the reader left
 * while the mutation was running, so the contact must be set unsubscribed again.
 */
export type PostMutationCheck = () => Promise<
  "ok" | "unsubscribed" | "unavailable"
>;

export type ConfirmResult =
  | { ok: true }
  | { ok: false; reason: "upstream_error" }
  | { ok: false; reason: "aborted"; verdict: Exclude<MutationGuardVerdict, "ok"> };

const REASSERT_ATTEMPTS = 3;

/**
 * Set a contact unsubscribed, only if it is not already. Idempotent: the read
 * first means a repair that is already in place makes no write, and so emits
 * no contact.updated event for the webhook to answer with another repair. A
 * contact Resend does not know has nothing to repair. The write is retried a
 * few times because nobody else will retry it.
 */
export async function reassertUnsubscribed(
  client: NewsletterClient,
  email: string,
): Promise<{ ok: boolean }> {
  for (let attempt = 0; attempt < REASSERT_ATTEMPTS; attempt += 1) {
    const current = await client.contacts.get({ email });
    if (current.error) {
      if (current.error.statusCode === 404) return { ok: true };
      continue;
    }
    if (current.data?.unsubscribed === true) return { ok: true };
    const updated = await client.contacts.update({ email, unsubscribed: true });
    if (!updated.error) return { ok: true };
  }
  return { ok: false };
}

/**
 * Step two, run only after the signed link checks out: mark the contact
 * subscribed and put it in the digest segment, which is all the weekly
 * broadcast sends to.
 *
 * Resend has no conditional write, so a stale writer is handled from both
 * sides. `mayMutate` runs before create, update and segments.add alike and
 * aborts before the call is made. `afterMutation` runs once the last call has
 * returned (calls are awaited to completion, so nothing runs after this
 * function returns) and catches an unsubscribe that landed while a call was
 * already in flight, which no pre-check can: it sets the contact unsubscribed
 * again, so consent ends on the reader's latest intent.
 */
export async function confirmNewsletterSubscription(
  client: NewsletterClient,
  email: string,
  segmentId: string,
  mayMutate: MutationGuard,
  afterMutation?: PostMutationCheck,
): Promise<ConfirmResult> {
  let mutated = false;
  const result = await runConfirm(client, email, segmentId, mayMutate, () => {
    mutated = true;
  });
  if (!mutated || !afterMutation) return result;

  const verdict = await afterMutation();
  if (verdict === "ok") return result;
  // "unavailable" cannot tell whether the reader left, so it fails closed too.
  const repaired = await reassertUnsubscribed(client, email);
  if (!repaired.ok) return { ok: false, reason: "upstream_error" };
  return { ok: false, reason: "aborted", verdict };
}

async function runConfirm(
  client: NewsletterClient,
  email: string,
  segmentId: string,
  mayMutate: MutationGuard,
  markMutated: () => void,
): Promise<ConfirmResult> {
  const abort = async (): Promise<ConfirmResult | null> => {
    const verdict = await mayMutate();
    return verdict === "ok" ? null : { ok: false, reason: "aborted", verdict };
  };

  const blockedCreate = await abort();
  if (blockedCreate) return blockedCreate;
  markMutated();
  const created = await client.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: segmentId }],
  });
  if (!created.error) return { ok: true };
  if (!isAlreadyExists(created.error)) {
    return { ok: false, reason: "upstream_error" };
  }

  const blockedUpdate = await abort();
  if (blockedUpdate) return blockedUpdate;
  markMutated();
  const updated = await client.contacts.update({ email, unsubscribed: false });
  if (updated.error) return { ok: false, reason: "upstream_error" };

  const blockedAdd = await abort();
  if (blockedAdd) return blockedAdd;
  markMutated();
  const added = await client.contacts.segments.add({ email, segmentId });
  if (added.error && !isAlreadyExists(added.error)) {
    return { ok: false, reason: "upstream_error" };
  }
  return { ok: true };
}

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/**
 * Canonical mailbox for RATE-LIMIT KEYS ONLY. Delivery always uses the
 * submitted address. Providers deliver `victim+1@x`, `victim+2@x` to the
 * same inbox, and Gmail also ignores dots in the local part, so a limiter
 * keyed on the literal address gives every alias its own allowance.
 * Lowercases, strips a `+tag` for every provider, and strips dots plus
 * folds googlemail.com into gmail.com for Gmail.
 */
export function canonicalMailboxKey(email: string): string {
  const lowered = email.trim().toLowerCase();
  const at = lowered.lastIndexOf("@");
  if (at < 1) return lowered;
  let local = lowered.slice(0, at);
  let domain = lowered.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replaceAll(".", "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
}
