import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { DeityFamilyFaq } from "@/app/deities/[slug]/_components/DeityFamilyFaq";
import { familyFaq } from "@/lib/deity-faq";

const answers = familyFaq("Zeus", {
  parents: [
    { key: "cronus", name: "Cronus", slug: "cronus", color: "#fff" },
    { key: "rhea", name: "Rhea", slug: "rhea", color: "#fff" },
  ],
  children: [],
  consorts: [],
  siblings: [],
  rivals: [],
});

describe("DeityFamilyFaq", () => {
  it("keeps the full answers and matching structured data inside a native disclosure", async () => {
    const { container } = render(
      <DeityFamilyFaq deityName="Zeus" answers={answers} />,
    );
    const details = container.querySelector("details")!;
    expect(details).not.toHaveAttribute("open");
    const summary = screen.getByText("Questions about Zeus's family");
    expect(summary.tagName).toBe("SUMMARY");
    await userEvent.tab();
    expect(summary).toHaveFocus();
    fireEvent.click(summary);
    expect(details).toHaveAttribute("open");
    expect(screen.getByRole("link", { name: "Cronus" })).toHaveAttribute(
      "href",
      "/deities/cronus",
    );
    const json = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!
        .textContent!,
    );
    const answer = container
      .querySelector("dd")!
      .textContent!.replace(/\s+/g, " ")
      .trim();
    expect(json.mainEntity[0].name).toBe(answers[0].question);
    expect(json.mainEntity[0].acceptedAnswer.text).toBe(answer);
    fireEvent.click(summary);
    expect(details).not.toHaveAttribute("open");
    expect(container.querySelector("dd")).toHaveTextContent(answers[0].answer);
  });

  it("omits the disclosure and structured data when no answers exist", () => {
    const { container } = render(
      <DeityFamilyFaq deityName="Zeus" answers={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
