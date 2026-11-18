import { describe, expect, it } from "vitest";
import {
  arrivalSource,
  isAutomatedUserAgent,
  pageTypeForPath,
} from "@/lib/daily-counts";

describe("pageTypeForPath", () => {
  it.each([
    ["/", "home"],
    ["/deities/zeus", "deity"],
    ["/stories/trojan-war", "story"],
    ["/creatures/medusa", "creature"],
    ["/artifacts/mjolnir", "artifact"],
    ["/locations/lake-avernus", "location"],
    ["/pantheons", "pantheon"],
    ["/pantheons/greek", "pantheon"],
    ["/pantheons/roman/goddesses", "pantheon-sub"],
    ["/gods-of/war", "gods-of"],
    ["/compare/indra-vs-thor", "compare"],
    ["/collections/trickster-gods", "collection"],
    ["/guides/odyssey", "guide"],
    ["/teachers", "teachers"],
    ["/newsletter/confirm", "newsletter"],
    ["/quiz", "other"],
    ["/deities/", "deity"],
  ])("reduces %s to %s", (path, type) => {
    expect(pageTypeForPath(path)).toBe(type);
  });
});

describe("arrivalSource", () => {
  const own = "mythosatlas.com";

  it.each([
    ["", "direct"],
    ["https://www.google.com/", "search"],
    ["https://www.google.co.uk/search?q=zeus", "search"],
    ["https://duckduckgo.com/", "search"],
    ["https://search.brave.com/search?q=zeus", "search"],
    ["https://www.bing.com/search?q=zeus", "search"],
    ["android-app://com.google.android.googlequicksearchbox/", "search"],
    ["https://mythosatlas.com/deities/zeus", "internal"],
    ["https://www.mythosatlas.com/", "internal"],
    ["https://www.reddit.com/r/mythology", "other"],
    ["https://brave.com/", "other"],
    ["not a url", "other"],
  ])("reduces %j to %s", (referrer, kind) => {
    expect(arrivalSource(referrer, own)).toBe(kind);
  });

  it("treats the www host as the same site", () => {
    expect(
      arrivalSource("https://mythosatlas.com/", "www.mythosatlas.com"),
    ).toBe("internal");
  });

  it("needs the engine name as a whole host label", () => {
    expect(arrivalSource("https://notgoogle.example/", own)).toBe("other");
  });

  it("matches the engine label under any suffix, so country domains count", () => {
    // Known limit: a host that puts the label in front of another domain is
    // also read as search. The value is a total, so the cost is one miscount.
    expect(arrivalSource("https://google.evil.example/", own)).toBe("search");
  });
});

describe("isAutomatedUserAgent", () => {
  it("flags crawlers, headless browsers and an empty value", () => {
    expect(isAutomatedUserAgent("")).toBe(true);
    expect(
      isAutomatedUserAgent(
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      ),
    ).toBe(true);
    expect(isAutomatedUserAgent("Mozilla/5.0 HeadlessChrome/126.0")).toBe(true);
    expect(isAutomatedUserAgent("Chrome-Lighthouse")).toBe(true);
  });

  it("passes an ordinary browser", () => {
    expect(
      isAutomatedUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
  });
});
