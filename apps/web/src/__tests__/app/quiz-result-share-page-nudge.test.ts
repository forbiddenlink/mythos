import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The share landing page is seen by people who received someone else's score.
// They have not finished a quiz, so the page must not count a value moment or
// ask for support on their behalf.
describe("quiz result share landing page", () => {
  it("does not render the support nudge", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/app/quiz/result/[result]/page.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/SupportNudge/);
    expect(source).not.toMatch(/recordValueMoment/);
  });
});
