import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  add: vi.fn(),
}));

const store = await vi.hoisted(async () =>
  (await import("../helpers/fake-upstash")).createFakeRedis(),
);

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      create: resend.create,
      update: resend.update,
      segments: { add: resend.add },
    };
  },
}));

vi.mock("@upstash/ratelimit", async () =>
  (await import("../helpers/fake-upstash")).fakeRatelimitModule(store),
);

vi.mock("@upstash/redis", async () =>
  (await import("../helpers/fake-upstash")).fakeRedisModule(store),
);

import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { logger } from "@/lib/logger";
import { createConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };

function confirmRequest(token: string): NextRequest {
  return new Request("http://localhost:3000/api/newsletter/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": "10.0.0.1",
    },
    body: JSON.stringify({ token }),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = "Mythos <digest@example.com>";
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  store.touched = false;
  store.kv.clear();
  for (const fn of Object.values(resend)) fn.mockReset();
  resend.create.mockResolvedValue({ error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("confirm needs the webhook secret", () => {
  it("answers 503 and touches neither Resend nor the claim store when it is unset", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    const logged = vi.spyOn(logger, "error").mockImplementation(() => {});
    const token = createConfirmToken("reader@example.com", "re_test");

    const response = await CONFIRM(confirmRequest(token));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      confirmed: false,
      reason: "unavailable",
    });
    expect(resend.create).not.toHaveBeenCalled();
    expect(resend.update).not.toHaveBeenCalled();
    expect(resend.add).not.toHaveBeenCalled();
    expect(store.touched).toBe(false);
    expect(logged).toHaveBeenCalledWith(
      expect.stringContaining("RESEND_WEBHOOK_SECRET"),
      {},
    );
  });

  it("treats a blank secret the same as an unset one", async () => {
    process.env.RESEND_WEBHOOK_SECRET = "   ";
    vi.spyOn(logger, "error").mockImplementation(() => {});
    const token = createConfirmToken("reader@example.com", "re_test");
    expect((await CONFIRM(confirmRequest(token))).status).toBe(503);
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("confirms normally once the secret is set", async () => {
    process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
    const token = createConfirmToken("reader@example.com", "re_test");
    expect((await CONFIRM(confirmRequest(token))).status).toBe(200);
    expect(resend.create).toHaveBeenCalledTimes(1);
  });
});
