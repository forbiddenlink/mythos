import { StoryPracticeQuiz } from "@/components/stories/StoryPracticeQuiz";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("StoryPracticeQuiz", () => {
  it("generates and displays questions when API succeeds", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          questions: [
            {
              question: "Who fled Troy?",
              options: ["Aeneas", "Hector", "Achilles", "Priam"],
              correctIndex: 0,
              rationale: "Stated in the narrative.",
            },
          ],
        }),
      }),
    );

    render(
      <StoryPracticeQuiz storySlug="aeneid" storyTitle="The Aeneid" />,
    );

    await user.click(
      screen.getByRole("button", { name: /Generate quiz from/i }),
    );

    expect(await screen.findByText(/Who fled Troy/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aeneas" }));

    expect(screen.getByText(/Stated in the narrative/i)).toBeInTheDocument();
    expect(screen.getByText(/Score: 1 \/ 1/i)).toBeInTheDocument();
  });

  it("shows server error message when API fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Quiz generation is not configured" }),
      }),
    );

    render(
      <StoryPracticeQuiz storySlug="aeneid" storyTitle="The Aeneid" />,
    );

    await user.click(
      screen.getByRole("button", { name: /Generate quiz from/i }),
    );

    expect(
      await screen.findByText(/Quiz generation is not configured/i),
    ).toBeInTheDocument();
  });
});
