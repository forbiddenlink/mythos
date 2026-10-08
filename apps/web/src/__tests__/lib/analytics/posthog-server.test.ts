import { getDeities, getJourneys, getStories } from "@/lib/data/catalog";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureServerEvent,
  isServerAnalyticsConfigured,
  resolveServerAnalyticsConfig,
} from "@/lib/analytics/posthog-server";

const ORIGINAL_ENV = { ...process.env };

describe("server analytics sink", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.POSTHOG_HOST;
    delete process.env.POSTHOG_INGEST_ORIGIN;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reports unconfigured when no key is present", () => {
    expect(isServerAnalyticsConfigured()).toBe(false);
  });

  it("falls back to the public key so one variable can drive both sides", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_public";
    expect(isServerAnalyticsConfigured()).toBe(true);
    expect(resolveServerAnalyticsConfig()?.key).toBe("phc_public");
  });

  it("defaults to the US ingest host", () => {
    process.env.POSTHOG_KEY = "phc_server";
    expect(resolveServerAnalyticsConfig()?.host).toBe(
      "https://us.i.posthog.com",
    );
  });

  it("strips a trailing slash from a custom host", () => {
    process.env.POSTHOG_KEY = "phc_server";
    process.env.POSTHOG_HOST = "https://eu.i.posthog.com/";
    expect(resolveServerAnalyticsConfig()?.host).toBe(
      "https://eu.i.posthog.com",
    );
  });

  it("returns not_configured instead of pretending to accept an event", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await captureServerEvent({
      event: "pmf_survey_answered",
      distinctId: "anon-1",
      properties: { rating: "very" },
    });

    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects an event name outside the taxonomy", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await captureServerEvent({
      event: "made_up_event",
      distinctId: "anon-1",
      properties: {},
    });

    expect(result).toEqual({ ok: false, reason: "unknown_event" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts a capture payload to the configured host", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("ok", { status: 200 }));

    const result = await captureServerEvent({
      event: "pmf_survey_answered",
      distinctId: "anon-1",
      properties: { rating: "very", quizId: "mythology-quiz" },
    });

    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://us.i.posthog.com/i/v0/e/");

    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.api_key).toBe("phc_server");
    expect(payload.event).toBe("pmf_survey_answered");
    expect(payload.distinct_id).toBe("anon-1");
    expect(payload.properties).toMatchObject({
      rating: "very",
      quizId: "mythology-quiz",
      $process_person_profile: false,
    });
  });

  it("reports an upstream failure rather than swallowing it", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 500 }),
    );

    const result = await captureServerEvent({
      event: "pmf_survey_answered",
      distinctId: "anon-1",
      properties: {},
    });

    expect(result).toEqual({
      ok: false,
      reason: "upstream_error",
      status: 500,
    });
  });

  it("reports a network failure", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    const result = await captureServerEvent({
      event: "pmf_survey_answered",
      distinctId: "anon-1",
      properties: {},
    });

    expect(result).toEqual({ ok: false, reason: "network_error" });
  });
  it("keeps server beacons in the browser project and shared ingest origin", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_browser";
    process.env.POSTHOG_KEY = "phc_other_project";
    process.env.POSTHOG_INGEST_ORIGIN = "https://eu.i.posthog.com/";
    process.env.POSTHOG_HOST = "https://legacy.example.com";
    expect(resolveServerAnalyticsConfig()).toEqual({
      key: "phc_browser",
      host: "https://eu.i.posthog.com",
    });
  });
  it.each([
    {
      event: "journey_stop_selected",
      properties: {
        journeySlug: "unknown-journey",
        stopIndex: 1,
        stopCount: 2,
      },
    },
    {
      event: "learning_path_step_selected",
      properties: {
        goal: "pantheon-mastery",
        entityType: "deity",
        slug: "unknown-deity",
        action: "start",
      },
    },
    {
      event: "learning_path_step_selected",
      properties: {
        goal: "story-scholar",
        entityType: "story",
        slug: "unknown-story",
        action: "step",
      },
    },
    {
      event: "learning_path_step_selected",
      properties: {
        goal: "completionist",
        entityType: "quiz",
        slug: "unknown-quiz",
        action: "practice",
      },
    },
  ])(
    "rejects invented catalog destinations even without configuration: $event",
    async ({ event, properties }) => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      expect(
        await captureServerEvent({
          event,
          distinctId: "anonymous",
          properties,
        }),
      ).toEqual({ ok: false, reason: "invalid_properties" });
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );
  it("validates learning properties before checking configuration", async () => {
    expect(
      await captureServerEvent({
        event: "journey_stop_selected",
        distinctId: "anonymous",
        properties: {
          journeySlug: "odysseus",
          stopIndex: 1e100,
          stopCount: 1e100,
        },
      }),
    ).toEqual({ ok: false, reason: "invalid_properties" });
  });
  it("accepts actual catalog destinations and checks a journey's true stop count", async () => {
    process.env.POSTHOG_KEY = "phc_server";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("ok", { status: 200 }),
    );
    const journey = getJourneys()[0];
    const stop = {
      journeySlug: journey.slug,
      stopIndex: 1,
      stopCount: journey.waypoints.length,
    };
    expect(
      await captureServerEvent({
        event: "journey_stop_selected",
        distinctId: "anonymous",
        properties: stop,
      }),
    ).toEqual({ ok: true });
    expect(
      await captureServerEvent({
        event: "journey_stop_selected",
        distinctId: "anonymous",
        properties: { ...stop, stopCount: stop.stopCount + 1 },
      }),
    ).toEqual({ ok: false, reason: "invalid_properties" });
    for (const [entityType, slug] of [
      ["deity", getDeities()[0].slug],
      ["story", getStories()[0].slug],
      ["quiz", "quiz"],
    ]) {
      expect(
        await captureServerEvent({
          event: "learning_path_step_selected",
          distinctId: "anonymous",
          properties: {
            goal: "pantheon-mastery",
            entityType,
            slug,
            action: "step",
          },
        }),
      ).toEqual({ ok: true });
    }
  });
  it("does not send server captures into a relative ingest rewrite", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_browser";
    process.env.POSTHOG_INGEST_ORIGIN = "/ingest";
    expect(resolveServerAnalyticsConfig()?.host).toBe(
      "https://us.i.posthog.com",
    );
  });
});
