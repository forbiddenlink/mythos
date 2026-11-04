import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";

// Next compiles `matcher` with path-to-regexp; the single negative-lookahead
// pattern here is equivalent to an anchored RegExp.
const matcher = new RegExp(`^${config.matcher[0]}$`);

describe("proxy matcher", () => {
  it.each([
    "/audio/stories/ramayana.mp3",
    "/pantheons/greek.jpg",
    "/favicon.svg",
    "/logo.png",
    "/hero-columns.webp",
    "/fonts/a.woff2",
  ])("skips static asset %s", (path) => {
    expect(matcher.test(path)).toBe(false);
  });

  it.each([
    "/",
    "/deities/zeus",
    "/pantheons/greek",
    "/stories/ramayana",
    "/oracle",
  ])("still runs on page %s", (path) => {
    expect(matcher.test(path)).toBe(true);
  });
});

describe("proxy locale", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not pick a non-English locale from Accept-Language", async () => {
    const res = await proxy(
      new NextRequest("https://example.com/", {
        headers: { "accept-language": "es-ES,es;q=0.9,fr;q=0.8" },
      }),
    );
    expect(res.cookies.get("locale")?.value).toBe("en");
  });

  it("keeps an explicit locale cookie untouched", async () => {
    const res = await proxy(
      new NextRequest("https://example.com/", {
        headers: { cookie: "locale=fr", "accept-language": "de" },
      }),
    );
    expect(res.cookies.get("locale")).toBeUndefined();
  });
});
