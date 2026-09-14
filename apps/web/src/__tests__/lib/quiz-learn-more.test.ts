import { describe, expect, it } from "vitest";
import { quizLearnMore } from "@/lib/quiz-learn-more";

describe("quizLearnMore", () => {
  it("points a miss at the deity page", () => {
    expect(quizLearnMore({ slug: "odin", name: "Odin" })).toEqual({
      learnMoreHref: "/deities/odin",
      learnMoreLabel: "Read about Odin",
    });
  });

  it("names a primary source when the deity has one", () => {
    expect(
      quizLearnMore({
        slug: "odin",
        name: "Odin",
        primarySources: [
          {
            text: "They call him Allfather.",
            source: "Prose Edda, Gylfaginning (trans. Anderson)",
          },
        ],
      }),
    ).toEqual({
      learnMoreHref: "/deities/odin",
      learnMoreLabel: "Read about Odin",
      sourceCite: "Prose Edda, Gylfaginning (trans. Anderson)",
    });
  });
});
