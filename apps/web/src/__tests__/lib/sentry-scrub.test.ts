import { describe, expect, it } from "vitest";
import { redactText, scrub, scrubEvent } from "@/lib/sentry-scrub";
// Built at runtime so secret scanners do not flag the fixture.
const FAKE_KEY = ["sk", "live", "ABCDEFGHIJKL"].join("_");

describe("sentry-scrub hardening", () => {
  it("redacts passphrase and passcode keys, not just password", () => {
    const out = scrub({
      passphrase: "pp-1",
      passcode: "pc-1",
      passwd: "pw-2",
      nested: { userPassphrase: "pp-2" },
    });
    const json = JSON.stringify(out);
    for (const leaked of ["pp-1", "pc-1", "pw-2", "pp-2"]) {
      expect(json).not.toContain(leaked);
    }
  });

  it("catches percent-encoded emails and secret query params, and tolerates malformed escapes", () => {
    const text = redactText(
      "GET /x?email=jane%40example.com&phone=555%201234&q=a%E0%A4%A&note=jane%40example.com",
    );
    expect(text).not.toContain("example.com");
    expect(text).not.toContain("555");
    expect(text).toContain("email=[REDACTED]");
    expect(text).toContain("phone=[REDACTED]");
    expect(redactText("100%")).toBe("100%");
  });

  it("redacts a token inside an otherwise unremarkable header value", () => {
    const event = scrubEvent({
      request: {
        headers: {
          "x-forwarded-note":
            "retry with Bearer abc.def-123 for jane@example.com",
          accept: "json",
        },
      },
    });
    expect(event.request?.headers?.["x-forwarded-note"]).toBe(
      "retry with Bearer [TOKEN] for [EMAIL]",
    );
    expect(event.request?.headers?.accept).toBe("json");
  });

  it("redacts transaction names and span descriptions and URL data, leaving db.statement", () => {
    const event = scrubEvent({
      transaction: "GET /u/jane%40example.com?token=abc123",
      spans: [
        {
          description: "fetch https://api.test/x?api_key=k-1",
          data: {
            "http.url": "https://api.test/x?access_token=t-1",
            "url.full": "https://api.test/y?secret=s-1",
            "http.query": "code=c-1",
            "db.statement": "select * from users where id = $1",
            "http.status_code": 200,
          },
        },
      ],
    });
    const json = JSON.stringify(event);
    for (const leaked of [
      "example.com",
      "abc123",
      "k-1",
      "t-1",
      "s-1",
      "c-1",
    ]) {
      expect(json).not.toContain(leaked);
    }
    expect(event.spans?.[0].data?.["db.statement"]).toBe(
      "select * from users where id = $1",
    );
    expect(event.spans?.[0].data?.["http.status_code"]).toBe(200);
  });

  it("fully redacts a value that contains an encoded ampersand", () => {
    const text = redactText("GET /x?token=abc%26def&page=2");
    expect(text).toBe("GET /x?token=[REDACTED]&page=2");
    expect(text).not.toContain("def");
  });

  it("stays linear on adversarial input and caps text at 4 KB", () => {
    const queryBomb = "?a=&".repeat(25_000);
    const emailBomb = "a@".repeat(50_000);
    const jwtBomb = "eyJ".repeat(34_000);
    for (const input of [queryBomb, emailBomb, jwtBomb]) {
      const start = performance.now();
      const out = redactText(input);
      expect(performance.now() - start).toBeLessThan(50);
      expect(out.endsWith("[TRUNCATED]")).toBe(true);
      expect(out.length).toBeLessThan(4200);
    }
  });

  it("redacts a query nested inside an encoded value, across decode rounds", () => {
    const text = redactText("GET /x?next=%253Ftoken%253Dxyz-secret&page=2");
    expect(text).not.toContain("xyz-secret");
  });

  it("finds a JWT or API key inside a larger word", () => {
    const text = redactText(
      `id=xeyJhbGciOi.payload.sig and prefix_${FAKE_KEY} end`,
    );
    expect(text).not.toContain("eyJhbGciOi");
    expect(text).not.toContain("ABCDEFGHIJ");
  });

  it("redacts before truncating, so a secret straddling the cut cannot leak a fragment", () => {
    const text = redactText(`${"a ".repeat(2045)}${FAKE_KEY} tail`);
    expect(text).not.toContain("sk_li");
    expect(text).not.toContain("ABCDE");
    expect(text.endsWith("[TRUNCATED]")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(4096 + "[TRUNCATED]".length);
  });
});
