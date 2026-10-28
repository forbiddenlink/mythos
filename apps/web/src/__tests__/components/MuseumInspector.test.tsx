import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MuseumInspector } from "@/components/museum/MuseumInspector";
import type { MuseumObject } from "@/lib/museum";

const object: MuseumObject = {
  id: "met-39328",
  title: "Shiva as Lord of Dance (Nataraja)",
  institution: "The Metropolitan Museum of Art",
  context: "Ancient object",
  description: "A bronze of Shiva within a ring of flame.",
  url: "https://www.metmuseum.org/art/collection/search/39328",
  imageRights: "Public Domain",
  imageUrl: "https://images.metmuseum.org/CRDImages/as/web-large/DT240.jpg",
};

describe("museum inspection", () => {
  it("opens a labelled viewer, explains a documented detail and restores focus", async () => {
    const user = userEvent.setup();
    render(<MuseumInspector object={object} />);
    const trigger = screen.getByRole("button", {
      name: /Inspect artwork: Shiva/,
    });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: object.title })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Hand drum" }));
    expect(screen.getByText(/first sounds of creation/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Museum explanation/ }),
    ).toHaveAttribute("href", object.url);
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByRole("status")).toHaveTextContent("150%");
    await user.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(screen.getByRole("status")).toHaveTextContent("100%");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps a museum recovery link when the image cannot load", async () => {
    const user = userEvent.setup();
    render(<MuseumInspector object={{ ...object, id: "unknown" }} />);
    await user.click(
      screen.getByRole("button", { name: /Inspect artwork: Shiva/ }),
    );
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText(/image could not be loaded/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Open museum record/ }),
    ).toHaveAttribute("href", object.url);
    expect(
      screen.queryByRole("button", { name: "Hand drum" }),
    ).not.toBeInTheDocument();
  });

  it("does not offer inspection without an image", () => {
    render(<MuseumInspector object={{ ...object, imageUrl: undefined }} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
