import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.hoisted(() => ({ verify: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    webhooks = { verify: resend.verify };
  },
}));

import { POST } from "@/app/api/newsletter/webhook/route";
import {
  __resetNewsletterRedemptionForTests,
  checkConfirmMutationAllowed,
  claimConfirmToken,
} from "@/lib/newsletter-redemption";
import { createConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };

function hook(body: unknown = {}): NextRequest {
  return new Request("http://localhost:3000/api/newsletter/webhook", {
    method: "POST",
    headers: {
      "svix-id": "msg_1",
      "svix-timestamp": "1",
      "svix-signature": "v1,abc",
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function contactEvent(
  type: string,
  email: string,
  unsubscribed: boolean,
  createdAt = new Date().toISOString(),
) {
  return { type, created_at: createdAt, data: { email, unsubscribed } };
}

/** A confirm attempt for `email` that has claimed its token. */
async function claimedAttempt(email: string) {
  const token = createConfirmToken(email, "re_test");
  const claim = await claimConfirmToken(token, 3600);
  if (claim.status !== "claimed") throw new Error("claim failed");
  return () => checkConfirmMutationAllowed(token, claim.marker, email);
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = "Mythos <digest@example.com>";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  __resetNewsletterRedemptionForTests();
  resend.verify.mockReset();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("resend webhook: unsubscribe record", () => {
  it("answers 501 until a signing secret is configured", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    expect((await POST(hook())).status).toBe(501);
  });

  it("rejects a request whose signature does not verify", async () => {
    resend.verify.mockImplementation(() => {
      throw new Error("bad signature");
    });
    expect((await POST(hook())).status).toBe(401);
  });

  it("blocks confirm attempts for links issued before the unsubscribe", async () => {
    const mayMutate = await claimedAttempt("leaver@example.com");
    expect(await mayMutate()).toBe("ok");

    resend.verify.mockReturnValue(
      contactEvent("contact.updated", "Leaver@Example.com", true),
    );
    expect(await (await POST(hook())).json()).toEqual({
      ok: true,
      recorded: true,
    });
    expect(await mayMutate()).toBe("unsubscribed");
  });

  it("ignores contact.created and events that leave the contact subscribed", async () => {
    const mayMutate = await claimedAttempt("quiet@example.com");
    for (const event of [
      contactEvent("contact.created", "quiet@example.com", true),
      contactEvent("contact.updated", "quiet@example.com", false),
    ]) {
      resend.verify.mockReturnValue(event);
      expect(await (await POST(hook())).json()).toMatchObject({
        recorded: false,
      });
    }
    expect(await mayMutate()).toBe("ok");
  });

  it("does not let an older event move the unsubscribe time backwards", async () => {
    const mayMutate = await claimedAttempt("order@example.com");
    resend.verify.mockReturnValue(
      contactEvent("contact.updated", "order@example.com", true),
    );
    await POST(hook());
    resend.verify.mockReturnValue(
      contactEvent(
        "contact.updated",
        "order@example.com",
        true,
        "2020-01-01T00:00:00Z",
      ),
    );
    await POST(hook());
    expect(await mayMutate()).toBe("unsubscribed");
  });
});
