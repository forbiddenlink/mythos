import * as Sentry from "@sentry/nextjs";
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
