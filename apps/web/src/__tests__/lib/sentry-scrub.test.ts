import { describe, expect, it } from "vitest";
import { redactText, scrub, scrubEvent, stripUrl } from "@/lib/sentry-scrub";

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
        "ctx.alice@example.com": "x",
        [`ctx.${FAKE_KEY}`]: "x",
        "ctx.provider": "jane@example.com",
        runtime: "node",
      },
    }) as { tags: Record<string, string> };
    expect(event.tags).toEqual({
      route: "/api/x",
      "ctx.provider": "[EMAIL]",
      runtime: "node",
    });
  });
});

describe("sentry-scrub: Codex round 2", () => {
  const cardNumber = ["4242", "4242", "4242", "4242"].join(" ");
  const ssn = ["123", "45", "6789"].join("-");

  it("redacts key: value and key = value, including exception, breadcrumb, span, transaction", () => {
    const event = scrubEvent({
      transaction: "job password: canary-secret",
      exception: {
        values: [{ type: "Error", value: "failed, password: canary-secret" }],
      },
      breadcrumbs: [{ message: "retry token = canary-secret", category: "x" }],
      spans: [{ description: "run secret:canary-secret", op: "x" }],
    });
    expect(JSON.stringify(event)).not.toContain("canary-secret");
  });

  it("redacts escaped JSON, non-string scalars, and ssn / card / ip", () => {
    const text = redactText(
      `body {\\"password\\":\\"canary-secret\\"} {"pin":1,"token":12345678} ssn ${ssn} card ${cardNumber} ip 10.20.30.40 order 1234 5678 9012 3456`,
    );
    for (const leaked of [
      "canary-secret",
      "12345678",
      ssn,
      cardNumber,
      "10.20.30.40",
    ]) {
      expect(text).not.toContain(leaked);
    }
    expect(text).toContain("1234 5678 9012 3456"); // fails Luhn, left alone
  });

  it("never copies URL userinfo, in parsed and fallback paths", () => {
    expect(stripUrl("https://bob:hunter2@example.test/a?x=1")).toBe(
      "https://example.test/a",
    );
    expect(stripUrl("https://bob:p@ss@example.test:8080/a#f")).toBe(
      "https://example.test:8080/a",
    );
    expect(stripUrl("https://a:b@@c d/x?y=1")).toBe("https://c d/x");
    expect(redactText("see https://bob:hunter2@example.test/a")).not.toContain(
      "hunter2",
    );
  });

  it("rebuilds debug_meta without file paths, drops context lines, scrubs user id and fingerprint", () => {
    const event = scrubEvent({
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            debug_id: "abcdef12-3456",
            code_file: "https://example.test/a.js?token=canary-secret",
            debug_file: "/Users/alice/a.map",
          },
        ],
        sdk_info: { sdk_name: "sentry.javascript.nextjs" },
      },
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {
                  function: "f",
                  context_line: "password: canary-secret",
                  pre_context: ["a@b.com"],
                  post_context: ["c"],
                },
              ],
            },
          },
        ],
      },
      user: { id: "alice@example.com" },
      fingerprint: ["Bearer abc.def-123", "{{ default }}"],
    }) as {
      debug_meta: { images: Record<string, unknown>[] };
      user: { id: string };
    };
    const json = JSON.stringify(event);
    for (const leaked of ["canary-secret", "alice", "a@b.com", "abc.def-123"]) {
      expect(json).not.toContain(leaked);
    }
    expect(event.debug_meta.images[0]).toEqual({
      type: "sourcemap",
      debug_id: "abcdef12-3456",
    });
    expect(event.user.id).toBe("[EMAIL]");
  });

  it("stays linear on the new patterns", () => {
    const inputs = [
      `"${"a".repeat(4500)}`,
      `{"k":"${"\\\\".repeat(2200)}`,
      `password${" ".repeat(4500)}`,
      "1 ".repeat(2250),
      "1.".repeat(2250),
      `://${"a".repeat(4500)}`,
    ];
    for (const input of inputs) {
      const start = performance.now();
      redactText(input);
      expect(performance.now() - start).toBeLessThan(50);
    }
  });
});

describe("sentry-scrub: Codex round 3", () => {
  it("redacts quoted values, whole, for key: value and key = value", () => {
    for (const input of [
      'password: "hunter2 with spaces"',
      "password = 'hunter2 x'",
      'login failed password: "hunter2" for user',
    ]) {
      const out = redactText(input);
      expect(out).not.toContain("hunter2");
      expect(out).not.toContain("spaces");
      expect(out).toContain("password");
    }
    expect(redactText('note: "hello" password: "x y"')).toContain(
      'note: "hello"',
    );
  });

  it("matches the sensitive word anywhere in the key token", () => {
    for (const input of [
      "access_token: leakleakleak",
      "x_api_key=leakleakleak",
      "refreshToken: leakleakleak",
      '{"refreshToken":"leakleakleak","sessionId":"leakleakleak"}',
    ]) {
      expect(redactText(input)).not.toContain("leakleakleak");
    }
  });

  it("redacts tel: and + phone numbers", () => {
    for (const input of [
      "tel:+14155552671",
      "call +14155552671 now",
      "x+14155552671",
    ]) {
      expect(redactText(input)).not.toContain("4155552671");
    }
  });

  it("redacts a 2048+ character JSON password whole, and a nested pair", () => {
    const long = `{"password":"${"a".repeat(2100)}LEAKME"}`;
    expect(redactText(long)).not.toContain("LEAKME");
    const nested = redactText('{"payload":"{\\"password\\":\\"nested-pw\\"}"}');
    expect(nested).not.toContain("nested-pw");
  });

  it("keeps image ids only when they look like hex ids", () => {
    const event = scrubEvent({
      debug_meta: {
        images: [
          {
            type: "sourcemap",
            debug_id: "alice@example.com",
            code_id: "deadbeef-1234",
          },
          {
            type: "macho",
            image_addr: "0x1000",
            image_size: "alice@example.com",
          },
        ],
      },
    }) as { debug_meta: { images: Record<string, unknown>[] } };
    const json = JSON.stringify(event);
    expect(json).not.toContain("alice");
    expect(event.debug_meta.images[0]).toEqual({
      type: "sourcemap",
      code_id: "deadbeef-1234",
    });
    expect(event.debug_meta.images[1]).toEqual({
      type: "macho",
      image_addr: "0x1000",
    });
  });

  it("stays linear on long key tokens and unclosed quotes", () => {
    const inputs = [
      "a".repeat(4500),
      `${"a_".repeat(2200)}:`,
      `password: "${"x".repeat(4500)}`,
      `{"password":"${"\\".repeat(2200)}`,
      '"k":"'.repeat(700),
      "tel:".repeat(1100),
    ];
    for (const input of inputs) {
      const start = performance.now();
      redactText(input);
      expect(performance.now() - start).toBeLessThan(50);
    }
  });

  it("redacts a JSON password after a token: inside an earlier string value", () => {
    const text = `{"msg":"retry token: \\"","note":"${"x ".repeat(300)}","password":"hunter2-leak"}`;
    expect(redactText(text)).not.toContain("hunter2-leak");
    const open = '{"msg":"token: \'","password":"hunter2-leak"}';
    expect(redactText(open)).not.toContain("hunter2-leak");
  });

  it("detects a sensitive key behind a very long prefix", () => {
    const out = redactText(`${"a".repeat(100)}_token: leak-me`);
    expect(out).not.toContain("leak-me");
    expect(redactText(`${"a".repeat(100)}_pass = "leak me"`)).not.toContain(
      "leak",
    );
  });
});

describe("sentry-scrub: Codex round 4", () => {
  const joinKey = (...parts: string[]) => parts.join("");

  it("never throws on malformed shapes and never returns the original", () => {
    const shapes: unknown[] = [
      { breadcrumbs: [null, 1, "x", [], { message: 5 }] },
      { spans: [null, { description: {} }] },
      {
        exception: {
          values: [
            null,
            { type: {}, value: 5, stacktrace: { frames: [null, 3] } },
          ],
        },
      },
      { request: { method: { email: "a@b.co" }, url: 5, headers: [] } },
      { request: { method: "post" } },
      { tags: { route: { email: "a@b.co" }, source: "x" } },
      { user: { id: { email: "a@b.co" } } },
      { debug_meta: { images: [null, 1], sdk_info: "x" } },
      { contexts: { os: "x", trace: 5 } },
      { sdk: { name: { a: 1 }, version: 3 } },
      { timestamp: Number.NaN, level: "weird" },
      null,
      "string",
      42,
    ];
    for (const shape of shapes) {
      const out = scrubEvent(shape);
      expect(JSON.stringify(out)).not.toContain("a@b.co");
      expect(out).not.toBe(shape);
    }
    const evt = scrubEvent({ request: { method: "post" } }) as {
      request: Record<string, unknown>;
    };
    expect(evt.request.method).toBeUndefined();
    const ok = scrubEvent({ request: { method: "POST" } }) as {
      request: { method: string };
    };
    expect(ok.request.method).toBe("POST");
  });

  it("returns a minimal safe event when rebuilding throws", () => {
    const hostile = {
      event_id: "abc",
      level: "error",
      exception: { values: [{ type: "TypeError" }] },
      get message(): string {
        throw new Error("boom");
      },
    };
    expect(scrubEvent(hostile)).toEqual({
      event_id: "abc",
      level: "error",
      exception: { values: [{ type: "TypeError" }] },
      message: "[scrub-error]",
    });
  });

  it("redacts a value of any length and any whitespace around the separator", () => {
    expect(redactText(`password: ${"Z".repeat(300)}`)).not.toContain("Z");
    expect(
      redactText(
        `password${" ".repeat(50)}:${" ".repeat(50)}${"a".repeat(300)}`,
      ),
    ).not.toContain("aaa");
    expect(redactText(`{"token":${"9".repeat(400)}}`)).not.toContain("999");
  });

  it("redacts the wider API key families", () => {
    const keys = [
      joinKey("sk-proj-", "A1b2C3d4E5f6G7h8I9j0K1l2"),
      joinKey("sk-ant-", "api03-A1b2C3d4E5f6G7h8I9j0"),
      joinKey("ghp_", "A1b2C3d4E5f6G7h8I9j0K1l2M3"),
      joinKey("gho_", "A1b2C3d4E5f6G7h8I9j0K1l2M3"),
      joinKey("github_pat_", "A1b2C3d4E5f6G7h8I9j0K1l2"),
      joinKey("xox", "b-123456789012-abcdefghij"),
      joinKey("AKI", "A", "ABCDEFGHIJKLMNOP"),
      joinKey("AI", "za", "SyA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q"),
    ];
    for (const key of keys) {
      expect(redactText(`failed with ${key} today`)).not.toContain(
        key.slice(4),
      );
    }
    expect(redactText("task-abcdefghijklmnopqrstuvwxyz stays")).toContain(
      "task-abcdefghijklmnopqrstuvwxyz",
    );
  });

  it("stays linear on the new patterns and long keys", () => {
    const inputs = [
      `password${" ".repeat(4500)}`,
      `${"a: ".repeat(1500)}`,
      `${"sk-".repeat(1500)}`,
      `password: ${"a".repeat(20000)}`,
      "a.".repeat(16000) + "@",
    ];
    for (const input of inputs) {
      const start = performance.now();
      redactText(input);
      expect(performance.now() - start).toBeLessThan(50);
    }
  });
});
