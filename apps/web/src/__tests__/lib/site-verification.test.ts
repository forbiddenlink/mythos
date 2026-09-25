import { afterEach, describe, expect, it, vi } from "vitest";

const ENV_KEY = "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION";

async function load() {
  vi.resetModules();
  return import("@/lib/metadata");
}

describe("googleSiteVerification", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is undefined when no token is configured", async () => {
    vi.stubEnv(ENV_KEY, "");
    const { googleSiteVerification } = await load();
    expect(googleSiteVerification()).toBeUndefined();
  });

  it("is undefined when the token is only whitespace", async () => {
    vi.stubEnv(ENV_KEY, "   ");
    const { googleSiteVerification } = await load();
    expect(googleSiteVerification()).toBeUndefined();
  });

  it("returns a configured token, trimmed", async () => {
    vi.stubEnv(ENV_KEY, "  abc123-token  ");
    const { googleSiteVerification } = await load();
    expect(googleSiteVerification()).toBe("abc123-token");
  });
});
