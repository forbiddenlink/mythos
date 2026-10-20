import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const capture = vi.mocked(Sentry.captureException);

async function loadLogger(env: "production" | "development" = "production") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", env);
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@example.invalid/1");
  return (await import("@/lib/logger")).logger;
}

describe("logger.error -> Sentry", () => {
  beforeEach(() => {
    capture.mockReset();
  });

  it("captures once, using the real Error from context.error", async () => {
    const logger = await loadLogger();
    const cause = new Error("quiz failed");
    logger.error("[api/quiz]", { error: cause, route: "/api/quiz" });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    expect(capture.mock.calls[0][0]).toBe(cause);
    expect(
      (capture.mock.calls[0][1] as { extra: Record<string, unknown> }).extra,
    ).toEqual({ route: "/api/quiz" });
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
    expect(
      (capture.mock.calls[0][1] as { extra: Record<string, unknown> }).extra
        .error,
    ).toBe("upstream said [EMAIL] bounced");
  });

  it("redacts nested secrets in objects and arrays, whatever the key casing", async () => {
    const logger = await loadLogger();
    logger.error("Deep", {
      user: { password: "p", profile: { accessToken: "tok-1" } },
      headers: { Authorization: "Bearer x", "x-api-key": "key-1" },
      list: [{ access_token: "tok-2" }, { "refresh-token": "tok-3" }],
      deep: { a: { b: { c: { d: { e: "too-deep" } } } } },
    });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    const json = JSON.stringify(
      (capture.mock.calls[0][1] as { extra: unknown }).extra,
    );
    for (const leaked of [
      '"p"',
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

  it("an Error with an email and bearer token is redacted by beforeSend, and nested Errors are plain objects", async () => {
    const logger = await loadLogger();
    const cause = new Error(
      "upstream rejected jane@example.com with Bearer abc.def-123",
    );
    logger.error("Upstream failed", {
      error: cause,
      attempt: { lastError: new Error("retry for jane@example.com") },
    });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    const [captured, opts] = capture.mock.calls[0] as [
      Error,
      { extra: Record<string, unknown> },
    ];
    expect(captured).toBe(cause); // real Error kept so grouping works
    // What the SDK builds from the capture, then beforeSend:
    const event = scrubEvent({
      message: captured.message,
      exception: { values: [{ value: captured.message }] },
      extra: opts.extra,
    });
    const json = JSON.stringify(event);
    expect(json).not.toContain("jane@example.com");
    expect(json).not.toContain("abc.def-123");
    expect(event.exception?.values?.[0].value).toBe(
      "upstream rejected [EMAIL] with Bearer [TOKEN]",
    );
    expect(
      (opts.extra.attempt as { lastError: { message: string } }).lastError
        .message,
    ).toBe("retry for [EMAIL]");
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
