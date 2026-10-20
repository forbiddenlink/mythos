import * as Sentry from "@sentry/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scrubEvent } from "@/lib/sentry-scrub";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const capture = vi.mocked(Sentry.captureException);

async function loadLogger(env: "production" | "development" = "production") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", env);
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@example.invalid/1");
  return (await import("@/lib/logger")).logger;
}

type CaptureOpts = { tags: Record<string, string>; extra?: unknown };
const opts = () => capture.mock.calls[0][1] as unknown as CaptureOpts;

describe("logger.error -> Sentry", () => {
  beforeEach(() => {
    capture.mockReset();
  });

  it("captures once with the real Error and puts context in ctx.* tags, not extra", async () => {
    const logger = await loadLogger();
    const cause = new Error("quiz failed");
    logger.error("[api/quiz]", { error: cause, route: "/api/quiz" });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    expect(capture.mock.calls[0][0]).toBe(cause);
    expect(opts().tags).toEqual({ source: "logger", "ctx.route": "/api/quiz" });
    expect(opts().extra).toBeUndefined();
  });

  it("wraps the message when no Error is supplied and redacts emails", async () => {
    const logger = await loadLogger();
    logger.error("Newsletter sign-up failed for jane@example.com", {
      error: "upstream said jane@example.com bounced",
    });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    expect((capture.mock.calls[0][0] as Error).message).toBe(
      "Newsletter sign-up failed for [EMAIL]",
    );
    expect(opts().tags["ctx.error"]).toBe("upstream said [EMAIL] bounced");
  });

  it("redacts nested secrets in the context tags, whatever the key casing", async () => {
    const logger = await loadLogger();
    logger.error("Deep", {
      user: { password: "p", profile: { accessToken: "tok-1" } },
      headers: { Authorization: "Bearer x", "x-api-key": "key-1" },
      list: [{ access_token: "tok-2" }, { "refresh-token": "tok-3" }],
      deep: { a: { b: { c: { d: { e: "too-deep" } } } } },
    });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    const json = JSON.stringify(opts().tags);
    for (const leaked of [
      '\\"p\\"',
      "tok-1",
      "Bearer x",
      "key-1",
      "tok-2",
      "tok-3",
      "too-deep",
    ]) {
      expect(json).not.toContain(leaked);
    }
    expect(json).toContain("[REDACTED]");
    expect(json).toContain("[MAX_DEPTH]");
  });

  it("an Error with an email and bearer token comes out clean through scrubEvent", async () => {
    const logger = await loadLogger();
    const cause = new Error(
      "rejected jane@example.com with Bearer abc.def-123",
    );
    logger.error("Upstream failed", { error: cause });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    const captured = capture.mock.calls[0][0] as Error;
    expect(captured).toBe(cause); // real Error kept so grouping works
    const event = scrubEvent({
      exception: { values: [{ type: "Error", value: captured.message }] },
    });
    const json = JSON.stringify(event);
    expect(json).not.toContain("jane@example.com");
    expect(json).not.toContain("abc.def-123");
  });

  it("exception() captures the given Error once", async () => {
    const logger = await loadLogger();
    const err = new Error("boom");
    logger.exception(err, { op: "x" });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    expect(capture.mock.calls[0][0]).toBe(err);
  });

  it("does not capture in development or for warn", async () => {
    const dev = await loadLogger("development");
    vi.spyOn(console, "error").mockImplementation(() => {});
    dev.error("dev error");
    dev.warn("w");
    await new Promise((r) => setTimeout(r, 20));
    expect(capture).not.toHaveBeenCalled();
  });
});
