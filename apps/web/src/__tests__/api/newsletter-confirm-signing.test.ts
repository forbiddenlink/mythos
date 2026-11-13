import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  add: vi.fn(),
  send: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      create: resend.create,
      update: resend.update,
      segments: { add: resend.add },
    };
    emails = { send: resend.send };
  },
}));

import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { POST as SIGN_UP } from "@/app/api/newsletter/route";
import { getNewsletterConfirmSecret } from "@/lib/newsletter";
import { createConfirmToken, verifyConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };
let ipCounter = 100;

function post(path: string, body: unknown, withIp = false): NextRequest {
  ipCounter += 1;
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      ...(withIp ? { "x-real-ip": `10.1.0.${ipCounter}` } : {}),
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const confirm = (token: string) =>
  CONFIRM(post("/api/newsletter/confirm", { token }, true));

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_old";
  process.env.NEWSLETTER_FROM = "Mythos <digest@example.com>";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
  delete process.env.NEWSLETTER_CONFIRM_SECRET;
  delete process.env.RESEND_SEGMENT_ID;
  for (const fn of Object.values(resend)) fn.mockReset();
  resend.create.mockResolvedValue({ error: null });
  resend.send.mockResolvedValue({ error: null });
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getNewsletterConfirmSecret", () => {
  it("prefers NEWSLETTER_CONFIRM_SECRET and falls back to the Resend key", () => {
    expect(
      getNewsletterConfirmSecret("re_old", { NEWSLETTER_CONFIRM_SECRET: "s1" }),
    ).toBe("s1");
    expect(getNewsletterConfirmSecret("re_old", {})).toBe("re_old");
    expect(
      getNewsletterConfirmSecret("re_old", { NEWSLETTER_CONFIRM_SECRET: " " }),
    ).toBe("re_old");
  });
});

describe("confirmation link signing", () => {
  async function tokenFromSignUp(email: string): Promise<string> {
    const res = await SIGN_UP(
      post(
        "/api/newsletter",
        { email, consent: true, placement: "footer" },
        true,
      ),
    );
    expect(res.status).toBe(200);
    const sent = resend.send.mock.calls[0]![0] as { text: string };
    return decodeURIComponent(/token=([^\s"&]+)/.exec(sent.text)![1]!);
  }

  it("signs with NEWSLETTER_CONFIRM_SECRET when it is set", async () => {
    process.env.NEWSLETTER_CONFIRM_SECRET = "confirm-secret";
    const token = await tokenFromSignUp("signs@example.com");
    expect(verifyConfirmToken(token, "confirm-secret").ok).toBe(true);
    expect(verifyConfirmToken(token, "re_old").ok).toBe(false);
  });

  it("falls back to the Resend key when it is unset, so sent links keep working", async () => {
    const token = await tokenFromSignUp("fallback@example.com");
    expect(verifyConfirmToken(token, "re_old").ok).toBe(true);

    const legacy = createConfirmToken("legacy@example.com", "re_old");
    expect((await confirm(legacy)).status).toBe(200);
  });

  it("keeps pending links valid after RESEND_API_KEY rotates when the secret is set", async () => {
    process.env.NEWSLETTER_CONFIRM_SECRET = "confirm-secret";
    const token = await tokenFromSignUp("rotate@example.com");

    process.env.RESEND_API_KEY = "re_rotated";
    const res = await confirm(token);
    expect(res.status).toBe(200);
    // Sign-up recorded a held contact; confirmation then subscribed it.
    expect(resend.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        email: "rotate@example.com",
        unsubscribed: false,
      }),
    );
  });

  it("rejects links signed with the old Resend key once the secret is set", async () => {
    process.env.NEWSLETTER_CONFIRM_SECRET = "confirm-secret";
    const res = await confirm(createConfirmToken("old@example.com", "re_old"));
    expect(res.status).toBe(400);
    expect(resend.create).not.toHaveBeenCalled();
  });
});
