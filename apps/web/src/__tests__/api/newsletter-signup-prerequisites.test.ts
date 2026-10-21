import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Sign-up and confirm share one prerequisite check. Without
 * RESEND_WEBHOOK_SECRET the emailed link would answer 503, so sign-up must
 * refuse before it spends rate-limit or send budget, or sends any mail.
 */

const fake = vi.hoisted(() => ({ sends: 0, limitCalls: 0, creates: 0 }));

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      async create() {
        fake.creates += 1;
        return { error: null };
      },
    };
    emails = {
      async send() {
        fake.sends += 1;
        return { error: null };
      },
    };
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    async limit() {
      fake.limitCalls += 1;
      return { success: true };
    }
  },
}));

vi.mock("@upstash/redis", () => ({
  Redis: class {
    async incr() {
      return 1;
    }
    async expire() {
      return 1;
    }
  },
}));

import { POST as SIGNUP } from "@/app/api/newsletter/route";
import { logger } from "@/lib/logger";

const ORIGINAL_ENV = { ...process.env };

function signupRequest(): NextRequest {
  return new Request("http://localhost:3000/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": "10.0.0.1",
    },
    body: JSON.stringify({ email: "new@example.com", consent: true }),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = "Mythos <digest@example.com>";
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  fake.sends = 0;
  fake.limitCalls = 0;
  fake.creates = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("POST /api/newsletter prerequisites", () => {
  it("answers 503 and sends nothing when RESEND_WEBHOOK_SECRET is missing", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    const error = vi.spyOn(logger, "error").mockImplementation(() => {});

    const res = await SIGNUP(signupRequest());

    expect(res.status).toBe(503);
    expect(fake.sends).toBe(0);
    expect(fake.creates).toBe(0);
    expect(fake.limitCalls).toBe(0);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("RESEND_WEBHOOK_SECRET"),
      {},
    );
  });

  it("sends the confirmation email when the secret is set", async () => {
    process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
    const res = await SIGNUP(signupRequest());
    expect(res.status).toBe(200);
    expect(fake.sends).toBe(1);
  });
});
