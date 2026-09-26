import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/analytics/events/route";

const ORIGINAL_ENV = { ...process.env };

function postEvent(body: unknown): Request {
  return new Request("http://localhost:3000/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analytics/events", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("rejects a body without an event name", async () => {
    const response = await POST(postEvent({ rating: "very" }));
    expect(response.status).toBe(400);
  });

  it("rejects an event outside the taxonomy", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    const response = await POST(postEvent({ type: "made_up", rating: "very" }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Unknown event",
    });
  });

  it("answers 501 when the sink is not configured, never a false ack", async () => {
    const response = await POST(
      postEvent({ type: "pmf_survey_answered", rating: "very", quizId: "q" }),
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      received: false,
      reason: "not_configured",
    });
  });

  it("forwards a valid event and acknowledges only on success", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("ok", { status: 200 }));

    const response = await POST(
      postEvent({
        type: "pmf_survey_answered",
        rating: "very",
        quizId: "mythology-quiz",
        distinctId: "anon-42",
      }),
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(
      String((fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.body),
    ) as Record<string, unknown>;
    expect(payload.event).toBe("pmf_survey_answered");
    expect(payload.distinct_id).toBe("anon-42");
    expect(payload.properties).toMatchObject({ rating: "very" });
    expect(payload.properties).not.toHaveProperty("distinctId");
    expect(payload.properties).not.toHaveProperty("type");
  });

  it("surfaces an upstream failure as 502", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 500 }),
    );

    const response = await POST(
      postEvent({ type: "pmf_survey_answered", rating: "very", quizId: "q" }),
    );

    expect(response.status).toBe(502);
  });
});
