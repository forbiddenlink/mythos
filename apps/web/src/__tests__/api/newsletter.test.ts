import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  add: vi.fn(),
  send: vi.fn(),
  constructedWith: [] as string[],
}));

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      create: resend.create,
      update: resend.update,
      segments: { add: resend.add },
    };
    emails = { send: resend.send };
    constructor(key: string) {
      resend.constructedWith.push(key);
    }
  },
}));

import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { POST } from "@/app/api/newsletter/route";
import {
  CONFIRMATION_SUBJECT,
  confirmNewsletterSubscription,
  DEFAULT_RESEND_SEGMENT_ID,
  getNewsletterConfig,
  newsletterRequestSchema,
  requestNewsletterConfirmation,
  type NewsletterClient,
} from "@/lib/newsletter";
import { createConfirmToken, verifyConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };
const FROM = "Mythos Atlas <digest@example.com>";
let ipCounter = 0;

function request(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  ipCounter += 1;
  return new Request("http://localhost:3000/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": `10.0.0.${ipCounter}`,
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const valid = {
  email: "Reader@Example.com",
  consent: true,
  placement: "footer",
};

describe("newsletter request schema", () => {
  it("normalises the address and requires consent", () => {
    const parsed = newsletterRequestSchema.parse(valid);
    expect(parsed.email).toBe("reader@example.com");
    expect(
      newsletterRequestSchema.safeParse({ ...valid, consent: false }).success,
    ).toBe(false);
    expect(newsletterRequestSchema.safeParse({ email: "x@y.co" }).success).toBe(
      false,
    );
    expect(
      newsletterRequestSchema.safeParse({ ...valid, email: "not-an-email" })
        .success,
    ).toBe(false);
    expect(
      newsletterRequestSchema.safeParse({ ...valid, extra: 1 }).success,
    ).toBe(false);
  });
});

describe("getNewsletterConfig", () => {
  it("is off without a key or sender and defaults the segment", () => {
    expect(getNewsletterConfig({})).toBeNull();
    // Double opt-in cannot work without a sender for the confirmation email.
    expect(getNewsletterConfig({ RESEND_API_KEY: "re_1" })).toBeNull();
    expect(
      getNewsletterConfig({ RESEND_API_KEY: "re_1", NEWSLETTER_FROM: FROM }),
    ).toEqual({
      apiKey: "re_1",
      segmentId: DEFAULT_RESEND_SEGMENT_ID,
      from: FROM,
    });
    expect(
      getNewsletterConfig({
        RESEND_API_KEY: "re_1",
        NEWSLETTER_FROM: FROM,
        RESEND_SEGMENT_ID: "seg",
      })?.segmentId,
    ).toBe("seg");
  });
});

function fakeClient(
  overrides: Partial<{
    create: { error: unknown };
    update: { error: unknown };
    add: { error: unknown };
    send: { error: unknown };
  }> = {},
): NewsletterClient {
  return {
    contacts: {
      create: vi.fn().mockResolvedValue(overrides.create ?? { error: null }),
      update: vi.fn().mockResolvedValue(overrides.update ?? { error: null }),
      segments: {
        add: vi.fn().mockResolvedValue(overrides.add ?? { error: null }),
      },
    },
    emails: {
      send: vi.fn().mockResolvedValue(overrides.send ?? { error: null }),
    },
  } as unknown as NewsletterClient;
}

const EXISTS = {
  error: { message: "Contact already exists", statusCode: 409 },
};

describe("requestNewsletterConfirmation", () => {
  const opts = {
    email: "a@b.co",
    from: FROM,
    confirmUrl: "https://mythosatlas.com/newsletter/confirm?token=t",
  };

  it("stores an unsubscribed contact outside the segment and emails the link", async () => {
    const c = fakeClient();
    await expect(requestNewsletterConfirmation(c, opts)).resolves.toEqual({
      ok: true,
    });
    expect(c.contacts.create).toHaveBeenCalledWith({
      email: "a@b.co",
      unsubscribed: true,
    });
    expect(c.contacts.segments.add).not.toHaveBeenCalled();
    expect(c.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: FROM,
        to: "a@b.co",
        subject: CONFIRMATION_SUBJECT,
        text: expect.stringContaining(opts.confirmUrl),
        html: expect.stringContaining(opts.confirmUrl),
      }),
    );
  });

  it("leaves an existing contact untouched but still sends the link", async () => {
    const c = fakeClient({ create: EXISTS });
    await expect(requestNewsletterConfirmation(c, opts)).resolves.toEqual({
      ok: true,
    });
    expect(c.contacts.update).not.toHaveBeenCalled();
    expect(c.contacts.segments.add).not.toHaveBeenCalled();
    expect(c.emails.send).toHaveBeenCalledTimes(1);
  });

  it("reports a contact or send failure", async () => {
    const down = { error: { message: "boom", statusCode: 500 } };
    await expect(
      requestNewsletterConfirmation(fakeClient({ create: down }), opts),
    ).resolves.toEqual({ ok: false, reason: "upstream_error" });
    await expect(
      requestNewsletterConfirmation(fakeClient({ send: down }), opts),
    ).resolves.toEqual({ ok: false, reason: "upstream_error" });
  });
});

const allow = async () => "ok" as const;

describe("confirmNewsletterSubscription", () => {
  it("creates a subscribed contact in the segment", async () => {
    const c = fakeClient();
    await expect(
      confirmNewsletterSubscription(c, "a@b.co", "seg", allow),
    ).resolves.toEqual({ ok: true });
    expect(c.contacts.create).toHaveBeenCalledWith({
      email: "a@b.co",
      unsubscribed: false,
      segments: [{ id: "seg" }],
    });
  });

  it("re-subscribes an existing contact and adds it to the segment", async () => {
    const c = fakeClient({ create: EXISTS });
    await expect(
      confirmNewsletterSubscription(c, "a@b.co", "seg", allow),
    ).resolves.toEqual({ ok: true });
    expect(c.contacts.update).toHaveBeenCalledWith({
      email: "a@b.co",
      unsubscribed: false,
    });
    expect(c.contacts.segments.add).toHaveBeenCalledWith({
      email: "a@b.co",
      segmentId: "seg",
    });
  });
});

describe("confirmNewsletterSubscription guard", () => {
  it("asks the guard before create, update and segment add, and stops on a no", async () => {
    // Allow the first n checks, deny the rest; a denied check must prevent
    // exactly the mutation it precedes.
    const run = async (allowed: number) => {
      let calls = 0;
      const c = fakeClient({ create: EXISTS });
      const result = await confirmNewsletterSubscription(
        c,
        "a@b.co",
        "seg",
        async () => (++calls <= allowed ? "ok" : "unsubscribed"),
      );
      return { c, result };
    };

    const none = await run(0);
    expect(none.result).toEqual({
      ok: false,
      reason: "aborted",
      verdict: "unsubscribed",
    });
    expect(none.c.contacts.create).not.toHaveBeenCalled();

    const afterCreate = await run(1);
    expect(afterCreate.c.contacts.create).toHaveBeenCalledTimes(1);
    expect(afterCreate.c.contacts.update).not.toHaveBeenCalled();

    const afterUpdate = await run(2);
    expect(afterUpdate.c.contacts.update).toHaveBeenCalledTimes(1);
    expect(afterUpdate.c.contacts.segments.add).not.toHaveBeenCalled();

    const all = await run(3);
    expect(all.result).toEqual({ ok: true });
  });
});

describe("confirm token", () => {
  const now = new Date("2026-10-20T12:00:00Z");

  it("round-trips the address", () => {
    const token = createConfirmToken("a@b.co", "re_key", now);
    expect(verifyConfirmToken(token, "re_key", now)).toEqual({
      ok: true,
      email: "a@b.co",
    });
  });

  it("rejects a token signed with another key or edited to another address", () => {
    const token = createConfirmToken("a@b.co", "re_key", now);
    expect(verifyConfirmToken(token, "re_other", now)).toEqual({
      ok: false,
      reason: "invalid",
    });
    const [, expires, mac] = token.split(".");
    const forged = `${Buffer.from("victim@b.co").toString("base64url")}.${expires}.${mac}`;
    expect(verifyConfirmToken(forged, "re_key", now).ok).toBe(false);
    expect(verifyConfirmToken("garbage", "re_key", now).ok).toBe(false);
  });

  it("expires", () => {
    const token = createConfirmToken("a@b.co", "re_key", now, 60);
    const later = new Date(now.getTime() + 61_000);
    expect(verifyConfirmToken(token, "re_key", later)).toEqual({
      ok: false,
      reason: "expired",
    });
  });
});

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_SEGMENT_ID;
    delete process.env.NEWSLETTER_FROM;
    // Sign-up needs the secret too, or the emailed link could never work.
    process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    resend.create.mockReset();
    resend.update.mockReset();
    resend.add.mockReset();
    resend.send.mockReset();
    resend.send.mockResolvedValue({ error: null });
    resend.constructedWith.length = 0;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("rejects cross-origin posts", async () => {
    const response = await POST(
      request(valid, { origin: "https://evil.example" }),
    );
    expect(response.status).toBe(403);
  });

  it("answers 501 when sign-ups are not configured", async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      subscribed: false,
      reason: "not_configured",
    });
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid body", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    const response = await POST(request({ email: "a@b.co", consent: false }));
    expect(response.status).toBe(400);
  });

  it("answers 501 with a key but no sender", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const response = await POST(request(valid));
    expect(response.status).toBe(501);
    expect(resend.send).not.toHaveBeenCalled();
  });

  it("emails a confirmation link instead of subscribing", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    resend.create.mockResolvedValue({ error: null });
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      subscribed: false,
      pending: true,
    });
    expect(resend.constructedWith).toEqual(["re_test"]);
    expect(resend.create).toHaveBeenCalledWith({
      email: "reader@example.com",
      unsubscribed: true,
    });
    expect(resend.add).not.toHaveBeenCalled();
    const sent = resend.send.mock.calls[0]?.[0] as { to: string; text: string };
    expect(sent.to).toBe("reader@example.com");
    const token = decodeURIComponent(
      /confirm\?token=([^\s"]+)/.exec(sent.text)?.[1] ?? "",
    );
    expect(verifyConfirmToken(token, "re_test")).toEqual({
      ok: true,
      email: "reader@example.com",
    });
  });

  it("stores nothing for a filled honeypot", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    const response = await POST(request({ ...valid, website: "spam.biz" }));
    expect(response.status).toBe(200);
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("reports an upstream failure as 502", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    resend.create.mockResolvedValue({
      error: { message: "down", statusCode: 500 },
    });
    const response = await POST(request(valid));
    expect(response.status).toBe(502);
  });

  it("rate limits repeated sign-ups from one client", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    resend.create.mockResolvedValue({ error: null });
    const headers = { "x-real-ip": "192.0.2.77" };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const body = { ...valid, email: `ip-limit-${i}@example.com` };
      statuses.push((await POST(request(body, headers))).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });

  it("limits confirmation emails to one address across many clients", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    resend.create.mockResolvedValue({ error: null });
    const body = { ...valid, email: "inbox-bomb@example.com" };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      // request() gives every call a fresh IP.
      statuses.push((await POST(request(body))).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
    expect(resend.send).toHaveBeenCalledTimes(5);
  });
});

function confirmRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new Request("http://localhost:3000/api/newsletter/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/newsletter/confirm", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM = FROM;
    process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
    delete process.env.RESEND_SEGMENT_ID;
    resend.create.mockReset();
    resend.update.mockReset();
    resend.add.mockReset();
    resend.create.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("adds the address to the digest segment for a valid token", async () => {
    const token = createConfirmToken("reader@example.com", "re_test");
    const response = await CONFIRM(confirmRequest({ token }));
    expect(response.status).toBe(200);
    expect(resend.create).toHaveBeenCalledWith({
      email: "reader@example.com",
      unsubscribed: false,
      segments: [{ id: DEFAULT_RESEND_SEGMENT_ID }],
    });
  });

  it("subscribes nobody for a forged or expired token", async () => {
    const forged = createConfirmToken("reader@example.com", "re_attacker");
    expect((await CONFIRM(confirmRequest({ token: forged }))).status).toBe(400);
    const expired = createConfirmToken(
      "reader@example.com",
      "re_test",
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    );
    const response = await CONFIRM(confirmRequest({ token: expired }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ reason: "expired" });
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("rejects cross-origin posts", async () => {
    const token = createConfirmToken("reader@example.com", "re_test");
    const response = await CONFIRM(
      confirmRequest({ token }, { origin: "https://evil.example" }),
    );
    expect(response.status).toBe(403);
    expect(resend.create).not.toHaveBeenCalled();
  });
});
