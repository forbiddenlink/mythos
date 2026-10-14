import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DetailLayout } from "@/components/layout/detail-layout";
import { EntryCloser } from "@/components/layout/EntryCloser";
import { NEWSLETTER_PLACEMENTS } from "@/lib/newsletter";
import { BookmarksProvider } from "@/providers/bookmarks-provider";

function renderCloser(props: Parameters<typeof EntryCloser>[0]) {
  return render(
    <BookmarksProvider>
      <EntryCloser {...props} />
    </BookmarksProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe("EntryCloser", () => {
  it("offers save, a journey, a correction link, the digest and support", () => {
    renderCloser({
      entityType: "deity",
      id: "zeus",
      name: "Zeus",
      pantheonId: "greek-pantheon",
    });
    expect(screen.getByTestId("entry-closer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Zeus" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Walk a journey: / }),
    ).toHaveAttribute("href", expect.stringMatching(/^\/journeys\//));
    expect(
      screen.getByRole("link", { name: "Suggest a correction" }),
    ).toHaveAttribute("href", "/contact");
    expect(screen.getByTestId("newsletter-entry")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Optional support." }),
    ).toHaveAttribute("href", "/support");
    expect(screen.getByText(/Free to read, no ads\./)).toBeInTheDocument();
  });

  it("toggles the bookmark", () => {
    renderCloser({
      entityType: "story",
      id: "titanomachy",
      name: "The Titanomachy",
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Save The Titanomachy/ }),
    );
    expect(
      screen.getByRole("button", { name: /Remove The Titanomachy from saved/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("skips Save for types the bookmark provider cannot store", () => {
    renderCloser({ entityType: "creature", id: "hydra", name: "Hydra" });
    expect(screen.queryByRole("button", { name: /Save/ })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Suggest a correction" }),
    ).toBeVisible();
  });

  it("skips the journey link when the tradition has none", () => {
    renderCloser({
      entityType: "deity",
      id: "x",
      name: "X",
      pantheonId: "no-such-pantheon",
    });
    expect(screen.queryByRole("link", { name: /Walk a journey/ })).toBeNull();
  });

  it("registers the entry newsletter placement", () => {
    expect(NEWSLETTER_PLACEMENTS).toContain("entry");
  });
});

describe("DetailLayout closer prop", () => {
  const hero = <div>hero</div>;

  it("renders the closer after the article when given entity info", () => {
    render(
      <BookmarksProvider>
        <DetailLayout
          hero={hero}
          closer={{ entityType: "hero", id: "h", name: "Hero" }}
        >
          <p>article</p>
        </DetailLayout>
      </BookmarksProvider>,
    );
    const article = screen.getByText("article");
    const closer = screen.getByTestId("entry-closer");
    expect(
      article.compareDocumentPosition(closer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders no closer when the prop is omitted", () => {
    render(
      <BookmarksProvider>
        <DetailLayout hero={hero}>
          <p>article</p>
        </DetailLayout>
      </BookmarksProvider>,
    );
    expect(screen.queryByTestId("entry-closer")).toBeNull();
  });
});
