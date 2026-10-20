import * as Sentry from "@sentry/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scrubEvent } from "@/lib/sentry-scrub";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const FAKE_KEY = ["sk", "live", "ABCDEFGHIJKL"].join("_");
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
      provider: "upstream jane@example.com bounced",
    });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    expect((capture.mock.calls[0][0] as Error).message).toBe(
      "Newsletter sign-up failed for [EMAIL]",
    );
    expect(opts().tags["ctx.provider"]).toBe("upstream [EMAIL] bounced");
  });

  it("only allowlisted context keys become tags, values redacted", async () => {
    const logger = await loadLogger();
    logger.error("Ctx", {
      [FAKE_KEY]: "x",
      "alice@example.com": "y",
      password: "canary-secret",
      route: "/api?token=abc123",
      op: "Bearer abc.def-123",
      status: 500,
      deep: { a: "nested-secret" },
    });
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    const tags = opts().tags;
    expect(Object.keys(tags).sort()).toEqual([
      "ctx.op",
      "ctx.route",
      "ctx.status",
      "source",
    ]);
    const json = JSON.stringify(tags);
    for (const leaked of [
      FAKE_KEY,
      "alice@",
      "canary-secret",
      "abc123",
      "abc.def",
      "nested-secret",
    ]) {
      expect(json).not.toContain(leaked);
    }
    expect(tags["ctx.status"]).toBe("500");
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
