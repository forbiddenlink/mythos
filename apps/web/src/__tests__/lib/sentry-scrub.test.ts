import { describe, expect, it } from "vitest";
import { redactText, scrub, scrubEvent } from "@/lib/sentry-scrub";

// Built at runtime so secret scanners do not flag the fixture.
const FAKE_KEY = ["sk", "live", "ABCDEFGHIJKL"].join("_");

describe("sentry-scrub: free text", () => {
  it("redacts passphrase and passcode keys, not just password", () => {
    const json = JSON.stringify(
      scrub({
        passphrase: "pp-1",
        passcode: "pc-1",
        n: { userPassphrase: "pp-2" },
      }),
    );
    for (const leaked of ["pp-1", "pc-1", "pp-2"]) {
      expect(json).not.toContain(leaked);
    }
  });

  it("catches percent-encoded emails and key=value pairs, and tolerates malformed escapes", () => {
    const text = redactText(
      "GET /x?email=jane%40example.com&phone=555%201234&q=a%E0%A4%A&note=jane%40example.com",
    );
    expect(text).not.toContain("example.com");
    expect(text).not.toContain("555");
    expect(redactText("100%")).toBe("100%");
  });

  it("fully redacts a value that contains an encoded ampersand", () => {
    const text = redactText("GET /x?token=abc%26def&page=2");
    expect(text).toBe("GET /x?token=[REDACTED]&page=2");
  });

  it("redacts a query nested inside an encoded value, across decode rounds", () => {
    expect(
      redactText("GET /x?next=%253Ftoken%253Dxyz-secret&page=2"),
    ).not.toContain("xyz-secret");
  });

  it("redacts key=value after any delimiter, including a hash fragment and a bare form body", () => {
    const text = redactText(
      "see /x#access_token=frag-1;secret=semi-1 and password=form-1&a=2",
    );
    for (const leaked of ["frag-1", "semi-1", "form-1"]) {
      expect(text).not.toContain(leaked);
    }
    expect(text).toContain("a=2");
  });

  it("finds a JWT or API key after punctuation inside a larger string", () => {
    const text = redactText(
      `id=eyJhbGciOi.payload.sig and key=${FAKE_KEY} end`,
    );
    expect(text).not.toContain("eyJhbGciOi");
    expect(text).not.toContain("ABCDEFGHIJ");
  });

  it("redacts before truncating, so a secret straddling the cut cannot leak a fragment", () => {
    const text = redactText(`${"a ".repeat(2045)}${FAKE_KEY} tail`);
    expect(text).not.toContain("sk_li");
    expect(text).not.toContain("ABCDE");
    expect(text.endsWith("[TRUNCATED]")).toBe(true);
  });

  it("never shows a fragment of a JWT that straddles the pre-cut boundary", () => {
    const jwt = [
      "eyJhbGciOiJIUzI1NiJ9",
      "eyJzdWIiOiIxMjM0In0",
      "c2lnbmF0dXJl",
    ].join(".");
    const pad = "word ".repeat(1000).slice(0, 4096 + 512 - 20);
    const text = redactText(`${pad} ${jwt} tail tail`);
    for (const fragment of ["eyJ", "c2lnbm", "IxMjM0"]) {
      expect(text).not.toContain(fragment);
    }
  });

  it("stays linear on adversarial input and caps text at 4 KB", () => {
    const inputs = [
      "?a=&".repeat(25_000),
      "a@".repeat(50_000),
      "eyJ".repeat(34_000),
      "eyJ".repeat(1500),
      "sk_live_".repeat(560),
    ];
    for (const input of inputs) {
      const start = performance.now();
      const out = redactText(input);
      expect(performance.now() - start).toBeLessThan(50);
      expect(out.endsWith("[TRUNCATED]")).toBe(true);
      expect(out.length).toBeLessThan(4200);
    }
  });
});

describe("sentry-scrub: events", () => {
  it("keeps origin and path only for the request URL, dropping query and hash", () => {
    const event = scrubEvent({
      request: {
        url: "https://user:pw@app.test/api/x?token=abc123&page=2#frag=zz",
      },
    });
    expect(event.request?.url).toBe("https://app.test/api/x");
  });

  it("strips breadcrumb fetch and navigation URLs, and drops query data", () => {
    const event = scrubEvent({
      breadcrumbs: [
        {
          category: "fetch",
          message: "GET https://api.test/x?api_key=k-1",
          data: { url: "https://api.test/x?api_key=k-1", query: "api_key=k-1" },
        },
        {
          category: "navigation",
          data: { from: "/a?token=t-1", to: "/b#access_token=t-2" },
        },
      ],
    });
    const json = JSON.stringify(event);
    for (const leaked of ["k-1", "t-1", "t-2"]) {
      expect(json).not.toContain(leaked);
    }
    expect(event.breadcrumbs?.[0]?.data?.url).toBe("https://api.test/x");
    expect(event.breadcrumbs?.[1]?.data?.to).toBe("/b");
  });

  it("deletes a JSON string body, a form body, a query_string object and cookies", () => {
    const events = [
      { request: { data: '{"password":"json-1"}' } },
      { request: { data: "password=form-1&a=2" } },
      { request: { query_string: { token: "obj-1" } } },
      { request: { cookies: { session: "cookie-1" } } },
    ].map((e) => scrubEvent(e));
    for (const e of events) {
      expect(e.request).toEqual({});
    }
  });

  it("keeps only allowlisted headers and strips the referer query", () => {
    const event = scrubEvent({
      request: {
        headers: {
          Accept: "json",
          "User-Agent": "UA/1.0",
          Referer: "https://app.test/p?token=r-1",
          "X-Custom-Note": "keep me out",
          Authorization: "Bearer h-1",
          "X-API-Key": "k-2",
        },
      },
    });
    expect(event.request?.headers).toEqual({
      Accept: "json",
      "User-Agent": "UA/1.0",
      Referer: "https://app.test/p",
    });
  });

  it("strips transaction names, span descriptions and span URL data, leaving db.statement", () => {
    const event = scrubEvent({
      transaction: "GET /u/jane@example.com?token=abc123",
      contexts: {
        trace: {
          data: {
            "http.url": "https://api.test/root?token=root-1",
            "url.full": "https://api.test/root?token=root-2#h",
          },
        },
      },
      spans: [
        {
          description: "fetch https://api.test/x?api_key=k-1",
          data: {
            "http.url": "https://api.test/x?access_token=t-1",
            "url.full": "https://api.test/y?secret=s-1#h",
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
      "root-1",
      "root-2",
    ]) {
      expect(json).not.toContain(leaked);
    }
    expect(event.spans?.[0]?.data?.["db.statement"]).toBe(
      "select * from users where id = $1",
    );
    expect(event.spans?.[0]?.data?.["http.status_code"]).toBe(200);
  });

  it("redacts the user, tags and nested breadcrumb data, and leaves stack frames", () => {
    const frames = [{ filename: "app/x.ts", function: "run", lineno: 7 }];
    const event = scrubEvent({
      user: { id: "u1", email: "jane@example.com" },
      tags: { contact: "jane@example.com" },
      breadcrumbs: [{ category: "console", data: { apiKey: "key-2" } }],
      exception: { values: [{ value: "x", stacktrace: { frames } } as never] },
    });
    const json = JSON.stringify(event);
    for (const leaked of ["jane@example.com", "key-2"]) {
      expect(json).not.toContain(leaked);
    }
    const [first] = event.exception?.values ?? [];
    expect(
      (first as unknown as { stacktrace: { frames: unknown[] } }).stacktrace
        .frames,
    ).toEqual(frames);
  });
});
