import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NextSteps } from "@/components/layout/NextSteps";

const SIGNUP_TITLE = "One myth a week, by email";

const myths = [
  {
    href: "/stories/trojan-war",
    label: "The Trojan War",
    meta: "Features Hera",
  },
  {
    href: "/stories/titanomachy",
    label: "Titanomachy",
    meta: "Greek tradition",
  },
];
const related = [
  {
    href: "/gods-of/marriage",
    label: "Gods of Marriage",
    meta: "List across traditions",
  },
];

describe("NextSteps", () => {
  it("renders nothing when there is nowhere to send the reader", () => {
    const { container } = render(
      <NextSteps id="next-steps" myths={[]} related={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("names the section and groups the links under two headings", () => {
    render(<NextSteps id="next-steps" myths={myths} related={related} />);
    const section = screen.getByRole("region", { name: "Keep exploring" });
    expect(
      within(section).getByRole("heading", {
        level: 2,
        name: "Keep exploring",
      }),
    ).toHaveAttribute("id", "next-steps-heading");
    expect(
      within(section)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Read the myths", "Related pages", SIGNUP_TITLE]);
    const form = screen.getByTestId("newsletter-next_steps");
    const links = within(section)
      .getAllByRole("link")
      .filter((link) => !form.contains(link));
    expect(links).toHaveLength(3);
  });

  it("shows why each link is there", () => {
    render(<NextSteps id="next-steps" myths={myths} related={related} />);
    const link = screen.getByRole("link", { name: /The Trojan War/ });
    expect(link).toHaveAttribute("href", "/stories/trojan-war");
    expect(link).toHaveTextContent("Features Hera");
  });

  it("leaves out a group that has no link", () => {
    render(<NextSteps id="next-steps" myths={myths} related={[]} />);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Read the myths", SIGNUP_TITLE]);
  });

  it("offers the weekly sign-up under the links", () => {
    render(<NextSteps id="next-steps" myths={myths} related={related} />);
    const form = within(screen.getByTestId("newsletter-next_steps"));
    expect(form.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(
      form.getByRole("heading", { level: 3, name: /one myth a week/i }),
    ).toBeInTheDocument();
  });
});
