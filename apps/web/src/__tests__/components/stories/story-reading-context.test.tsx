import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.params,
}));

import { StoryReadingContext } from "@/components/stories/StoryReadingContext";
import { getStoryContexts } from "@/lib/story-contexts";

const contexts = getStoryContexts("prometheus-fire");

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
});
