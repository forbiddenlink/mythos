import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.hoisted(() => ({
  create: vi.fn(),
  add: vi.fn(),
  constructedWith: [] as string[],
}));

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      create: resend.create,
      segments: { add: resend.add },
    };
    constructor(key: string) {
      resend.constructedWith.push(key);
    }
  },
}));

import { POST } from "@/app/api/newsletter/route";
import {
  DEFAULT_RESEND_SEGMENT_ID,
  getNewsletterConfig,
  newsletterRequestSchema,
  subscribeToNewsletter,
  type NewsletterClient,
} from "@/lib/newsletter";

const ORIGINAL_ENV = { ...process.env };
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
  it("is off without a key and defaults the segment", () => {
    expect(getNewsletterConfig({})).toBeNull();
    expect(getNewsletterConfig({ RESEND_API_KEY: "re_1" })).toEqual({
      apiKey: "re_1",
      segmentId: DEFAULT_RESEND_SEGMENT_ID,
    });
    expect(
      getNewsletterConfig({ RESEND_API_KEY: "re_1", RESEND_SEGMENT_ID: "seg" })
        ?.segmentId,
    ).toBe("seg");
  });
});

describe("subscribeToNewsletter", () => {
  function client(
    create: { error: unknown },
    add: { error: unknown } = { error: null },
  ): NewsletterClient {
    return {
      contacts: {
        create: vi.fn().mockResolvedValue(create),
        segments: { add: vi.fn().mockResolvedValue(add) },
      },
    } as unknown as NewsletterClient;
  }

  it("creates the contact in the segment", async () => {
    const c = client({ error: null });
    await expect(subscribeToNewsletter(c, "a@b.co", "seg")).resolves.toEqual({
      ok: true,
    });
    expect(c.contacts.create).toHaveBeenCalledWith({
      email: "a@b.co",
      unsubscribed: false,
      segments: [{ id: "seg" }],
    });
  });

  it("adds an existing contact to the segment", async () => {
    const c = client({
      error: { message: "Contact already exists", statusCode: 409 },
    });
    await expect(subscribeToNewsletter(c, "a@b.co", "seg")).resolves.toEqual({
      ok: true,
    });
    expect(c.contacts.segments.add).toHaveBeenCalledWith({
      email: "a@b.co",
      segmentId: "seg",
    });
  });

  it("reports other failures", async () => {
    const c = client({ error: { message: "boom", statusCode: 500 } });
    await expect(subscribeToNewsletter(c, "a@b.co", "seg")).resolves.toEqual({
      ok: false,
      reason: "upstream_error",
    });
  });
});

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_SEGMENT_ID;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    resend.create.mockReset();
    resend.add.mockReset();
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
    const response = await POST(request({ email: "a@b.co", consent: false }));
    expect(response.status).toBe(400);
  });

  it("subscribes a valid address to the default segment", async () => {
    process.env.RESEND_API_KEY = "re_test";
    resend.create.mockResolvedValue({ error: null });
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(resend.constructedWith).toEqual(["re_test"]);
    expect(resend.create).toHaveBeenCalledWith({
      email: "reader@example.com",
      unsubscribed: false,
      segments: [{ id: DEFAULT_RESEND_SEGMENT_ID }],
    });
  });

  it("stores nothing for a filled honeypot", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const response = await POST(request({ ...valid, website: "spam.biz" }));
    expect(response.status).toBe(200);
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("reports an upstream failure as 502", async () => {
    process.env.RESEND_API_KEY = "re_test";
    resend.create.mockResolvedValue({
      error: { message: "down", statusCode: 500 },
    });
    const response = await POST(request(valid));
    expect(response.status).toBe(502);
  });

  it("rate limits repeated sign-ups from one client", async () => {
    process.env.RESEND_API_KEY = "re_test";
    resend.create.mockResolvedValue({ error: null });
    const headers = { "x-real-ip": "192.0.2.77" };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await POST(request(valid, headers))).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });
});
