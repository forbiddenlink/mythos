import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { viewFromHash } from "@/app/timeline/TimelinePageClient";

function crumbs() {
  return screen
    .getByRole("navigation", { name: "Breadcrumb" })
    .querySelectorAll("li");
}

describe("Breadcrumbs", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("points collection details at the Paths hub", () => {
    pathname.current = "/collections/trickster-gods";
    render(<Breadcrumbs />);
    expect(screen.getByRole("link", { name: "Paths" })).toHaveAttribute(
      "href",
      "/paths",
    );
    expect(crumbs()).toHaveLength(3);
    expect(screen.queryByRole("link", { name: "Collections" })).toBeNull();
  });

  it("points study guides at the Paths hub", () => {
    pathname.current = "/study/greek-mythology";
    render(<Breadcrumbs />);
    expect(screen.getByRole("link", { name: "Paths" })).toHaveAttribute(
      "href",
      "/paths",
    );
  });

  it("names the current page from its title when given", () => {
    pathname.current = "/stories/interactive/thor-jotunheim";
    render(<Breadcrumbs currentLabel="Thor's Journey to Jotunheim" />);
    expect(crumbs()[crumbs().length - 1]).toHaveTextContent(
      "Thor's Journey to Jotunheim",
    );
  });

  it("keeps minor words lower case in a slug label", () => {
    pathname.current = "/stories/judgment-of-paris";
    render(<Breadcrumbs />);
    expect(crumbs()[crumbs().length - 1]).toHaveTextContent(
      "Judgment of Paris",
    );
  });

  it("keeps ordinary parents", () => {
    pathname.current = "/deities/zeus";
    render(<Breadcrumbs />);
    expect(screen.getByRole("link", { name: "Deities" })).toHaveAttribute(
      "href",
      "/deities",
    );
  });

  it("links shared quiz results back to the quiz without a nonexistent parent", () => {
    pathname.current = "/quiz/result/4-of-5";
    render(<Breadcrumbs />);
    expect(screen.getByRole("link", { name: "Quiz" })).toHaveAttribute(
      "href",
      "/quiz",
    );
    expect(screen.queryByRole("link", { name: "Result" })).toBeNull();
    expect(crumbs()).toHaveLength(3);
  });
});

describe("timeline view from the URL hash", () => {
  it("opens the story view for #stories only", () => {
    expect(viewFromHash("#stories")).toBe("stories");
    expect(viewFromHash("stories")).toBe("stories");
    expect(viewFromHash("")).toBe("traditions");
    expect(viewFromHash("#events")).toBe("traditions");
  });
});
