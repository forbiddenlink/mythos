import { describe, expect, it } from "vitest";
import { tracesSampler } from "@/lib/sentry-sampler";

const inherit = (rate: number) => rate;

describe("tracesSampler", () => {
  it("drops middleware root transactions", () => {
    expect(
      tracesSampler(
        { name: "middleware GET", inheritOrSampleWith: inherit },
        0.15,
      ),
    ).toBe(0);
    expect(
      tracesSampler(
        { name: "middleware POST", inheritOrSampleWith: inherit },
        0.15,
      ),
    ).toBe(0);
  });

  it("keeps page and API transactions at the configured rate", () => {
    expect(
      tracesSampler(
        { name: "GET /deities/[slug]", inheritOrSampleWith: inherit },
        0.15,
      ),
    ).toBe(0.15);
  });
});
