import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.params,
}));

import { StoryReadingContext } from "@/components/stories/StoryReadingContext";
import { getNextInTradition, getStoryContexts } from "@/lib/story-contexts";

const contexts = getStoryContexts("prometheus-fire");
const nextStep = getNextInTradition("prometheus-fire");

beforeEach(() => {
  nav.params = new URLSearchParams();
});

describe("StoryReadingContext", () => {
  it("renders nothing without ?in=", () => {
    const { container } = render(
      <StoryReadingContext contexts={contexts} placement="top" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an unknown list", () => {
    nav.params = new URLSearchParams("in=pantheon/atlantis");
    const { container } = render(
      <StoryReadingContext contexts={contexts} placement="top" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the position and links back to the list", () => {
    nav.params = new URLSearchParams("in=pantheon/greek");
    render(<StoryReadingContext contexts={contexts} placement="top" />);
    expect(screen.getByText("2 of 11")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Greek/ })).toHaveAttribute(
      "href",
      "/pantheons/greek",
    );
  });

  it("links to the previous and next story and keeps the list in the URL", () => {
    nav.params = new URLSearchParams("in=pantheon/greek");
    render(<StoryReadingContext contexts={contexts} placement="bottom" />);
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute(
      "href",
      "/stories/titanomachy?in=pantheon/greek",
    );
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/stories/perseus-medusa?in=pantheon/greek",
    );
  });

  it("links the next story of the tradition for a reader with no list", () => {
    render(
      <StoryReadingContext
        contexts={contexts}
        placement="bottom"
        nextStep={nextStep}
      />,
    );
    const link = screen.getByRole("link", {
      name: /Next story in this tradition/,
    });
    expect(link).toHaveAttribute("href", "/stories/perseus-medusa");
    expect(link).toHaveAttribute("rel", "next");
    expect(link).toHaveTextContent("Perseus and Medusa");
    expect(screen.queryByRole("link", { name: /Previous/ })).toBeNull();
  });

  it("links the tradition after its last story", () => {
    render(
      <StoryReadingContext
        contexts={getStoryContexts("abduction-of-persephone")}
        placement="bottom"
        nextStep={getNextInTradition("abduction-of-persephone")}
      />,
    );
    const link = screen.getByRole("link", {
      name: /All stories in this tradition/,
    });
    expect(link).toHaveAttribute("href", "/pantheons/greek");
    expect(link).not.toHaveAttribute("rel");
  });

  it("keeps the reader's list when the URL names one", () => {
    nav.params = new URLSearchParams("in=pantheon/greek");
    render(
      <StoryReadingContext
        contexts={contexts}
        placement="bottom"
        nextStep={nextStep}
      />,
    );
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/stories/perseus-medusa?in=pantheon/greek",
    );
    expect(
      screen.queryByRole("link", { name: /Next story in this tradition/ }),
    ).toBeNull();
  });

  it("shows the onward link at the bottom only", () => {
    const { container } = render(
      <StoryReadingContext
        contexts={contexts}
        placement="top"
        nextStep={nextStep}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("still renders nothing at the bottom with no list and no next step", () => {
    const { container } = render(
      <StoryReadingContext contexts={contexts} placement="bottom" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
