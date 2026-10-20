import { describe, expect, it } from "vitest";
import {
  buildCsp,
  buildScriptSrc,
  hashesForPath,
  normalizeCspPath,
  type CspManifest,
} from "@/lib/csp";
import { inlineScripts, sha256 } from "../../../scripts/csp-hashes.mjs";

const manifest: CspManifest = {
  version: 1,
  buildId: "test",
  common: ["sha256-common"],
  routes: {
    "/": ["sha256-home"],
    "/deities/zeus": ["sha256-zeus"],
    "/_not-found": ["sha256-404"],
  },
};

describe("hashesForPath", () => {
  it("combines common hashes with the page's own", () => {
    expect(hashesForPath(manifest, "/deities/zeus")).toEqual([
      "sha256-common",
      "sha256-zeus",
    ]);
    expect(hashesForPath(manifest, "/deities/zeus/")).toEqual([
      "sha256-common",
      "sha256-zeus",
    ]);
  });

  it("falls back to the static not-found page for unknown paths", () => {
    expect(hashesForPath(manifest, "/nope")).toEqual([
      "sha256-common",
      "sha256-404",
    ]);
  });

  it("normalizes trailing slashes but keeps the root", () => {
    expect(normalizeCspPath("/")).toBe("/");
    expect(normalizeCspPath("/a//")).toBe("/a");
  });
});

describe("buildScriptSrc", () => {
  it("strict mode allows only self, the nonce, hashes and the analytics host", () => {
    const src = buildScriptSrc({
      mode: "strict",
      nonce: "abc",
      hashes: ["sha256-x"],
    });
    expect(src).toBe(
      "'self' 'nonce-abc' 'sha256-x' blob: https://va.vercel-scripts.com",
    );
    expect(src).not.toContain("unsafe");
    expect(src).not.toContain("strict-dynamic");
  });

  it("degraded mode drops the nonce so 'unsafe-inline' actually applies", () => {
    const src = buildScriptSrc({ mode: "degraded", nonce: "abc" });
    expect(src).toContain("'unsafe-inline'");
    expect(src).not.toContain("nonce-");
  });

  it("development keeps inline + eval for HMR", () => {
    expect(buildScriptSrc({ mode: "development", nonce: "n" })).toContain(
      "'unsafe-eval'",
    );
  });

  it("keeps the rest of the policy intact", () => {
    const csp = buildCsp({ mode: "strict", nonce: "n", hashes: [] });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self' https://va.vercel-scripts.com");
    expect(csp).toContain("report-to csp-endpoint");
  });

  it("lets the browser SDK reach the US Sentry ingest host", () => {
    // CSP "*.a.b" only matches hosts ending in ".a.b", so *.ingest.sentry.io
    // silently blocked every client event sent to o<org>.ingest.us.sentry.io.
    const csp = buildCsp({ mode: "strict", nonce: "n", hashes: [] });
    const connect = csp
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("connect-src"))
      ?.split(" ")
      .slice(1) ?? [];
    const host = "o4509096111112192.ingest.us.sentry.io";
    const allowed = connect.some((src) => {
      const m = /^https:\/\/\*\.(.+)$/.exec(src);
      return m ? host.endsWith(`.${m[1]}`) : src === `https://${host}`;
    });
    expect(allowed).toBe(true);
  });
});

describe("csp-hashes build script", () => {
  it("hashes inline executable scripts only", () => {
    const html = [
      '<script src="/a.js"></script>',
      "<script>self.__next_f.push([1])</script>",
      '<script type="application/ld+json">{"@type":"Thing"}</script>',
      '<script nonce="x">console.log(1)</script>',
    ].join("");
    expect(inlineScripts(html)).toEqual([
      "self.__next_f.push([1])",
      "console.log(1)",
    ]);
  });

  it("finds scripts whose end tag carries whitespace or attributes", () => {
    const html =
      "<script>first()</script ><script>second()</script\n foo><p>x</p>";
    expect(inlineScripts(html)).toEqual(["first()", "second()"]);
  });

  it("produces CSP-compatible SHA-256 sources", () => {
    // echo -n "alert(1)" | openssl dgst -sha256 -binary | base64
    expect(sha256("alert(1)")).toBe(
      "sha256-bhHHL3z2vDgxUt0W3dWQOrprscmda2Y5pLsLg4GF+pI=",
    );
  });
});
