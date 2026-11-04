import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { toLocalDateString } from "@/lib/date";

describe("toLocalDateString", () => {
  // UTC+14: 08:00 local on 1 January is still 31 December in UTC, so a
  // UTC-based formatter would return the wrong day.
  const original = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "Pacific/Kiritimati";
  });
  afterAll(() => {
    process.env.TZ = original;
  });

  it("uses the local calendar day, not the UTC one", () => {
    expect(toLocalDateString(new Date(2026, 0, 1, 8))).toBe("2026-01-01");
  });

  it("pads single-digit months and days", () => {
    expect(toLocalDateString(new Date(2026, 2, 7, 12))).toBe("2026-03-07");
  });
});
