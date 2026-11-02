import { describe, expect, it } from "vitest";
import { redactConfirmToken } from "@/lib/analytics/redact-url";

const url = "https://mythosatlas.com/newsletter/confirm?token=abc.def";
const clean = "https://mythosatlas.com/newsletter/confirm";

describe("redactConfirmToken", () => {
  it("strips the confirm token from every URL field PostHog sends", () => {
    const out = redactConfirmToken({
      event: "$pageview",
      properties: { $current_url: url, $referrer: url, keep: 1 },
      $set: { $current_url: url },
      $set_once: { $initial_current_url: url },
    });
    expect(out).toEqual({
      event: "$pageview",
      properties: { $current_url: clean, $referrer: clean, keep: 1 },
      $set: { $current_url: clean },
      $set_once: { $initial_current_url: clean },
    });
  });

  it("leaves other URLs and a dropped event alone", () => {
    const event = {
      properties: { $current_url: "https://mythosatlas.com/stories?page=2" },
    };
    expect(redactConfirmToken(event)).toEqual(event);
    expect(redactConfirmToken(null)).toBeNull();
  });
});
