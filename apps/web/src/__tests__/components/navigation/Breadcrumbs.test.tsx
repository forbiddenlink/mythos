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

  it("keeps ordinary parents", () => {
    pathname.current = "/deities/zeus";
    render(<Breadcrumbs />);
    expect(screen.getByRole("link", { name: "Deities" })).toHaveAttribute(
      "href",
      "/deities",
    );
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
