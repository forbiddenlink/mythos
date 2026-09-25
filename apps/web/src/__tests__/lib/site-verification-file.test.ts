import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Search Console revokes ownership if a verification method disappears, and the
 * failure is silent: the property keeps working until Google next rechecks.
 * These assertions make a deletion or a rename fail the build instead.
 */
const VERIFICATION_FILE = "googlef30e6c575c816cfc.html";

describe("Search Console HTML file verification", () => {
  const path = join(process.cwd(), "public", VERIFICATION_FILE);

  it("is served from the public root", () => {
    expect(existsSync(path)).toBe(true);
  });

  it("carries exactly the token line Google looks for", () => {
    expect(readFileSync(path, "utf8").trim()).toBe(
      `google-site-verification: ${VERIFICATION_FILE}`,
    );
  });
});
