import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, OPTIONS, POST } from "@/app/ingest/[...path]/route";

const originalFetch = globalThis.fetch;
const fetchMock = vi.fn();

function lastCall(): {
  url: string;
  init: RequestInit & { headers: Headers; duplex?: string };
} {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return { url: String(url), init };
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(
    async () =>
      new Response("ok", {
        status: 200,
        headers: { "content-type": "application/javascript" },
      }),
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("PostHog proxy", () => {
  it("drops cookie and authorization before reaching upstream", async () => {
    const req = new NextRequest(
      "https://example.com/ingest/static/surveys.js?v=1",
      {
        headers: {
          cookie: "sb-ref-auth-token.0=" + "a".repeat(7000),
          authorization: "Bearer secret",
          "user-agent": "ua",
          accept: "*/*",
        },
      },
    );
    await GET(req);
    const { init } = lastCall();
    expect(init.headers.get("cookie")).toBeNull();
    expect(init.headers.get("authorization")).toBeNull();
    expect(init.headers.get("user-agent")).toBe("ua");
    expect(init.headers.get("accept")).toBe("*/*");
  });

  it("forwards only the allowlisted headers", async () => {
    const req = new NextRequest("https://example.com/ingest/e/", {
      method: "POST",
      body: "{}",
      headers: {
        "x-custom": "1",
        "x-vercel-id": "abc",
        "content-type": "application/json",
      },
    });
    await POST(req);
    expect([...lastCall().init.headers.keys()].sort()).toEqual([
      "content-type",
    ]);
  });

  it("sends static/ and array/ to the asset host and everything else to the API host", async () => {
    await GET(new NextRequest("https://example.com/ingest/static/surveys.js"));
    expect(lastCall().url).toBe(
      "https://us-assets.i.posthog.com/static/surveys.js",
    );
    await GET(
      new NextRequest("https://example.com/ingest/array/phc_x/config.js"),
    );
    expect(lastCall().url).toBe(
      "https://us-assets.i.posthog.com/array/phc_x/config.js",
    );
    await POST(
      new NextRequest("https://example.com/ingest/e/", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(lastCall().url).toBe("https://us.i.posthog.com/e/");
    await OPTIONS(
      new NextRequest("https://example.com/ingest/decide/", {
        method: "OPTIONS",
      }),
    );
    expect(lastCall().url).toBe("https://us.i.posthog.com/decide/");
  });

  it("keeps the query string", async () => {
    await GET(
      new NextRequest(
        "https://example.com/ingest/static/surveys.js?v=1.438.12&x=a%20b",
      ),
    );
    expect(lastCall().url).toBe(
      "https://us-assets.i.posthog.com/static/surveys.js?v=1.438.12&x=a%20b",
    );
  });

  it("sets x-forwarded-for from the Vercel client IP header", async () => {
    await GET(
      new NextRequest("https://example.com/ingest/static/a.js", {
        headers: {
          "x-vercel-forwarded-for": "203.0.113.9",
          "x-forwarded-for": "10.0.0.1",
        },
      }),
    );
    expect(lastCall().init.headers.get("x-forwarded-for")).toBe("203.0.113.9");
  });

  it("streams the POST body upstream with duplex half", async () => {
    await POST(
      new NextRequest("https://example.com/ingest/e/", {
        method: "POST",
        body: '{"a":1}',
      }),
    );
    const { init } = lastCall();
    expect(init.duplex).toBe("half");
    expect(init.body).toBeTruthy();
  });

  it("strips set-cookie from the response and keeps status and content-type", async () => {
    fetchMock.mockImplementation(async () => {
      const h = new Headers({ "content-type": "application/json" });
      h.append("set-cookie", "ph=1; Path=/");
      return new Response('{"status":1}', { status: 202, headers: h });
    });
    const res = await POST(
      new NextRequest("https://example.com/ingest/e/", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(202);
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(await res.text()).toBe('{"status":1}');
  });
});
