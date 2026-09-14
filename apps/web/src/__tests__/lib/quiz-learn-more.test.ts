import { describe, expect, it } from "vitest";
import { quizLearnMore } from "@/lib/quiz-learn-more";

describe("quizLearnMore", () => {
  it("points a miss at the deity page", () => {
    expect(quizLearnMore({ slug: "odin", name: "Odin" })).toEqual({
      learnMoreHref: "/deities/odin",
      learnMoreLabel: "Read about Odin",
    });
  });
});
