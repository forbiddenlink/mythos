import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DetailLayout } from "@/components/layout/detail-layout";
import { EntryCloser } from "@/components/layout/EntryCloser";
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
    expect(
      screen.getByRole("button", { name: "Save this: Zeus" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Walk a journey: / }),
    ).toHaveAttribute("href", expect.stringMatching(/^\/journeys\//));
    expect(
      screen.getByRole("link", { name: "Suggest a correction" }),
    ).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("link", { name: "See a sample issue" }),
    ).toHaveAttribute("href", "/newsletter");
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
      screen.getByRole("button", { name: /Save this: The Titanomachy/ }),
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

  it("holds the weekly myth sign-up form, one heading level below its own", () => {
    renderCloser({ entityType: "creature", id: "hydra", name: "Hydra" });
    const form = within(screen.getByTestId("newsletter-entry_closer"));
    expect(
      form.getByRole("heading", {
        level: 3,
        name: "One myth a week, by email",
      }),
    ).toBeVisible();
    expect(form.getByLabelText("Email address")).toBeVisible();
    expect(form.getByRole("checkbox")).not.toBeChecked();
    expect(form.getByRole("button", { name: "Subscribe" })).toBeVisible();
    // The footer form on the same page keeps a different name.
    expect(screen.queryByText("The weekly myth")).toBeNull();
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
