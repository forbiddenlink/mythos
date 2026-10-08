import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { QuizDeity, Relationship } from "@/lib/relationship-quiz";
import { generateRelationshipQuiz } from "@/lib/relationship-quiz";

const client = vi.hoisted(() => vi.fn((_props: unknown) => null));
vi.mock("@/app/quiz/relationships/RelationshipQuizPageClient", () => ({
  RelationshipQuizPageClient: client,
}));
vi.mock("@/components/layout/page-header", () => ({ PageHeader: () => null }));
vi.mock("@/components/layout/container", () => ({
  Container: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/components/layout/about-this-page", () => ({
  AboutThisPage: () => null,
}));

import Page from "@/app/quiz/relationships/page";

it("passes confidence and disputed flags to the quiz without sending passage evidence", () => {
  render(<Page />);
  const props = client.mock.calls[0]?.[0] as unknown as {
    deitiesData: QuizDeity[];
    relationshipsData: Relationship[];
  };
  expect(props.relationshipsData.find((row) => row.id === "r15")).toMatchObject(
    { confidenceLevel: "high" },
  );
  expect(props.relationshipsData.find((row) => row.id === "r13")).toMatchObject(
    { confidenceLevel: "medium", isDisputed: true },
  );
  for (const row of props.relationshipsData) {
    expect(row).not.toHaveProperty("evidence");
    expect(row).not.toHaveProperty("description");
  }
  const random = vi.spyOn(Math, "random").mockReturnValue(0.1);
  try {
    const quiz = generateRelationshipQuiz(
      props.deitiesData,
      props.relationshipsData,
      10,
    );
    expect(quiz.some((question) => question.questionType !== "domain")).toBe(
      true,
    );
  } finally {
    random.mockRestore();
  }
});
