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

  it("redacts serialized JSON secrets, phone numbers and Authorization headers", () => {
    const text = redactText(
      '{"password":"demo-secret"} Call +1-202-555-0123 or (202) 555-0199. Authorization: Basic YWxpY2U6c2VjcmV0',
    );
    for (const leaked of [
      "demo-secret",
      "555-0123",
      "555-0199",
      "YWxpY2U6c2VjcmV0",
    ]) {
      expect(text).not.toContain(leaked);
    }
    expect(redactText("Basic YWxpY2U6c2VjcmV0")).toBe("Basic [TOKEN]");
    expect(redactText("order 2026-10-20 12:34 id 12345")).toContain(
      "2026-10-20",
    );
  });
});

describe("sentry-scrub: allowlist rebuild", () => {
  const dump = (event: unknown) => JSON.stringify(scrubEvent(event));
  const clean = (event: unknown, leaks: string[]) => {
    const json = dump(event);
    for (const leaked of leaks) expect(json).not.toContain(leaked);
  };

  it("drops span data entirely (authorization header and email in span data)", () => {
    clean(
      {
        spans: [
          {
            span_id: "s1",
            data: {
              authorization: "Bearer demo-secret",
              contact: "alice@example.test",
            },
          },
        ],
      },
      ["demo-secret", "alice@example.test", "authorization"],
    );
  });

  it("keeps only user.id, and drops extra entirely", () => {
    const event = scrubEvent({
      user: { id: "u1", name: "Alice Example", ip_address: "192.0.2.7" },
      extra: { session: "demo-secret" },
    }) as { user: unknown; extra?: unknown };
    expect(event.user).toEqual({ id: "u1" });
    expect(event.extra).toBeUndefined();
    clean(
      {
        user: { name: "Alice Example", ip_address: "192.0.2.7" },
        extra: { session: "demo-secret" },
      },
      ["Alice", "192.0.2.7", "demo-secret"],
    );
  });

  it("redacts JSON secrets and phone numbers in the message", () => {
    clean({ message: '{"password":"demo-secret"} Call +1-202-555-0123' }, [
      "demo-secret",
      "555-0123",
    ]);
  });

  it("redacts an Authorization header in free text", () => {
    clean({ message: "Authorization: Basic YWxpY2U6c2VjcmV0" }, [
      "YWxpY2U6c2VjcmV0",
    ]);
  });

  it("redacts logentry, drops stack frame vars, and strips frame filename queries", () => {
    const event = scrubEvent({
      logentry: {
        formatted: "alice@example.test",
        message: "alice@example.test",
        params: ["alice@example.test"],
      },
      exception: {
        values: [
          {
            type: "Error",
            value: "error",
            stacktrace: {
              frames: [
                {
                  filename: "https://example.test/a.js?token=demo-secret",
                  abs_path:
                    "https://example.test/a.js#access_token=demo-secret",
                  function: "run",
                  lineno: 7,
                  colno: 3,
                  in_app: true,
                  context_line: "call(alice@example.test)",
                  vars: { password: "demo-secret" },
                },
              ],
            },
          },
        ],
      },
    }) as {
      logentry: Record<string, unknown>;
      exception: {
        values: { stacktrace: { frames: Record<string, unknown>[] } }[];
      };
    };
    const json = JSON.stringify(event);
    expect(json).not.toContain("alice@example.test");
    expect(json).not.toContain("demo-secret");
    expect(event.logentry.params).toBeUndefined();
    const frame = event.exception.values[0]?.stacktrace.frames[0];
    expect(frame?.vars).toBeUndefined();
    expect(frame?.filename).toBe("https://example.test/a.js");
    expect(frame).toMatchObject({
      function: "run",
      lineno: 7,
      colno: 3,
      in_app: true,
    });
  });

  it("drops an email used as an object key (extra) and in contexts", () => {
    clean(
      {
        extra: { "alice@example.test": "value" },
        contexts: { device: { "alice@example.test": "x" } },
      },
      ["alice@example.test"],
    );
  });

  it("drops unknown top-level fields", () => {
    const event = scrubEvent({
      foo: "secret",
      level: "error",
      event_id: "e1",
    }) as Record<string, unknown>;
    expect(event.foo).toBeUndefined();
    expect(event).toMatchObject({ level: "error", event_id: "e1" });
  });

  it("keeps origin and path only for the request URL, drops body, query string and cookies", () => {
    const event = scrubEvent({
      request: {
        method: "POST",
        url: "https://user:pw@app.test/api/x?token=abc123&page=2#frag=zz",
        data: "password=form-1",
        query_string: { token: "obj-1" },
        cookies: { session: "cookie-1" },
        env: { REMOTE_ADDR: "192.0.2.7" },
      },
    }) as { request: Record<string, unknown> };
    expect(event.request).toEqual({
      method: "POST",
      url: "https://app.test/api/x",
    });
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
    }) as { request: { headers: Record<string, string> } };
    expect(event.request.headers).toEqual({
      Accept: "json",
      "User-Agent": "UA/1.0",
      Referer: "https://app.test/p",
    });
  });

  it("rebuilds breadcrumbs: url path only, data limited to method, status_code and url", () => {
    const event = scrubEvent({
      breadcrumbs: [
        {
          category: "fetch",
          type: "http",
          level: "info",
          timestamp: 1,
          message: "GET https://api.test/x?api_key=k-1",
          data: {
            url: "https://api.test/x?api_key=k-1",
            method: "GET",
            status_code: 200,
            body: "secret-body",
          },
        },
        {
          category: "navigation",
          message: "go /b#access_token=t-2",
          data: { from: "/a?token=t-1", to: "/b" },
        },
      ],
    }) as {
      breadcrumbs: { message?: string; data?: Record<string, unknown> }[];
    };
    const json = JSON.stringify(event);
    for (const leaked of ["k-1", "t-1", "t-2", "secret-body"]) {
      expect(json).not.toContain(leaked);
    }
    expect(event.breadcrumbs[0]?.data).toEqual({
      url: "https://api.test/x",
      method: "GET",
      status_code: 200,
    });
    expect(event.breadcrumbs[1]?.data).toEqual({});
  });

  it("rebuilds transactions and spans: path-only names, no span data, trace data dropped", () => {
    const event = scrubEvent({
      type: "transaction",
      transaction: "GET /u/jane@example.com?token=abc123",
      contexts: {
        trace: {
          trace_id: "t",
          span_id: "s",
          op: "http.server",
          data: { "http.url": "https://api.test/root?token=root-1" },
        },
        os: { name: "macOS" },
      },
      spans: [
        {
          span_id: "s2",
          op: "http.client",
          description: "GET https://api.test/x?api_key=k-1",
          data: {
            "http.url": "https://api.test/x?access_token=t-1",
            "db.statement": "select 1",
          },
        },
        {
          span_id: "s3",
          op: "db",
          description: "select * from users where id = ?",
        },
      ],
    }) as {
      contexts: { trace: Record<string, unknown>; os: unknown };
      spans: { description: string; data?: unknown }[];
    };
    const json = JSON.stringify(event);
    for (const leaked of ["example.com", "abc123", "k-1", "t-1", "root-1"]) {
      expect(json).not.toContain(leaked);
    }
    expect(event.contexts.trace.data).toBeUndefined();
    expect(event.contexts.trace.op).toBe("http.server");
    expect(event.contexts.os).toEqual({ name: "macOS" });
    expect(event.spans[0]?.data).toBeUndefined();
    expect(event.spans[0]?.description).toBe("GET https://api.test/x");
    expect(event.spans[1]?.description).toBe(
      "select * from users where id = ?",
    );
  });

  it("allowlists tags and redacts their values", () => {
    const event = scrubEvent({
      tags: {
        route: "/api/x",
        contact: "jane@example.com",
        "ctx.note": "jane@example.com",
        runtime: "node",
      },
    }) as { tags: Record<string, string> };
    expect(event.tags).toEqual({
      route: "/api/x",
      "ctx.note": "[EMAIL]",
      runtime: "node",
    });
  });
});
