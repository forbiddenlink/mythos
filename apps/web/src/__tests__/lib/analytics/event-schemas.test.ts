import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  EVENT_PROPERTY_SPECS,
  matchesEventSchema,
} from "@/lib/analytics/event-schemas";

describe("server event schemas", () => {
  it("declares a schema for every event in the taxonomy", () => {
    expect(Object.keys(EVENT_PROPERTY_SPECS).sort()).toEqual(
      [...ANALYTICS_EVENTS].sort(),
    );
  });

  it("accepts the payloads the app actually sends", () => {
    expect(
      matchesEventSchema("quiz_completed", {
        quizId: "mythology-quiz",
        score: 7,
        total: 10,
      }),
    ).toBe(true);
    expect(
      matchesEventSchema("pmf_survey_answered", {
        quizId: "daily",
        rating: "very",
        score: 3,
        total: 5,
      }),
    ).toBe(true);
    expect(
      matchesEventSchema("entry_viewed", {
        entityType: "deity",
        slug: "zeus",
        pantheon: undefined,
      }),
    ).toBe(true);
    expect(matchesEventSchema("oracle_asked", { grounded: true })).toBe(true);
  });

  it("refuses fields outside the schema, so free text cannot ride along", () => {
    expect(
      matchesEventSchema("support_click", {
        placement: "footer",
        email: "someone@example.com",
      }),
    ).toBe(false);
  });

  it("refuses free text in identifier fields", () => {
    expect(
      matchesEventSchema("share_clicked", {
        surface: "deity page with a typed note",
        method: "native",
      }),
    ).toBe(false);
    expect(matchesEventSchema("support_page_viewed", { from: "a@b.co" })).toBe(
      false,
    );
  });

  it("refuses wrong types, out-of-range values and missing fields", () => {
    expect(
      matchesEventSchema("story_read_progress", { slug: "x", percent: 140 }),
    ).toBe(false);
    expect(
      matchesEventSchema("quiz_completed", {
        quizId: "daily",
        score: "7",
        total: 10,
      }),
    ).toBe(false);
    expect(
      matchesEventSchema("pmf_survey_answered", {
        quizId: "daily",
        rating: "love it",
      }),
    ).toBe(false);
    expect(matchesEventSchema("quiz_started", {})).toBe(false);
  });

  it("does not treat inherited object keys as allowed fields", () => {
    expect(
      matchesEventSchema("quiz_started", {
        quizId: "daily",
        toString: "x",
      }),
    ).toBe(false);
  });
});
