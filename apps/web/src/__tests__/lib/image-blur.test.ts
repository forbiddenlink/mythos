import { describe, expect, it } from "vitest";
import thumbhashes from "@/data/thumbhashes.json";
import { getBlurDataURL, getBlurHash } from "@/lib/image-blur";
import { thumbHashToBlurDataURL } from "@/lib/thumbhash-data-url";

const [knownPath, knownHash] = Object.entries(thumbhashes)[0];

describe("getBlurHash", () => {
  it("returns the stored hash for a local path", () => {
    expect(getBlurHash(knownPath)).toBe(knownHash);
  });

  it("returns undefined for remote, unknown, empty and prototype keys", () => {
    expect(
      getBlurHash("https://images.metmuseum.org/CRDImages/x.jpg"),
    ).toBeUndefined();
    expect(getBlurHash("/deities/does-not-exist.webp")).toBeUndefined();
    expect(getBlurHash("")).toBeUndefined();
    expect(getBlurHash(null)).toBeUndefined();
    expect(getBlurHash(undefined)).toBeUndefined();
    expect(getBlurHash("/constructor")).toBeUndefined();
  });
});

describe("thumbHashToBlurDataURL", () => {
  it("produces a small, valid PNG data URL", () => {
    const url = thumbHashToBlurDataURL(knownHash);
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    const bytes = Buffer.from(url.split(",")[1], "base64");
    expect([...bytes.subarray(0, 8)]).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    expect(url.length).toBeLessThan(1500);
  });

  it("stays decodable for every generated hash", () => {
    for (const hash of Object.values(thumbhashes)) {
      expect(thumbHashToBlurDataURL(hash)).toMatch(/^data:image\/png;base64,/);
    }
  });

  it("getBlurDataURL expands a known path and skips unknown ones", () => {
    expect(getBlurDataURL(knownPath)).toBe(thumbHashToBlurDataURL(knownHash));
    expect(getBlurDataURL("/nope.png")).toBeUndefined();
  });
});
