import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RelationshipPathExplorer } from "@/components/family-tree/RelationshipPathExplorer";
import { FamilyTreePageClient } from "@/app/family-tree/FamilyTreePageClient";

vi.mock("next/dynamic", () => ({
  default: () => () => <div>Tree visualization</div>,
}));

const deities = [
  {
    id: "athena",
    name: "Athena",
    slug: "athena",
    pantheonId: "greek-pantheon",
    domain: ["wisdom"],
    gender: "female",
  },
  {
    id: "zeus",
    name: "Zeus",
    slug: "zeus",
    pantheonId: "greek-pantheon",
    domain: ["sky"],
    gender: "male",
  },
  {
    id: "hera",
    name: "Hera",
    slug: "hera",
    pantheonId: "greek-pantheon",
    domain: ["marriage"],
    gender: "female",
  },
  {
    id: "hestia",
    name: "Hestia",
    slug: "hestia",
    pantheonId: "greek-pantheon",
    domain: ["hearth"],
    gender: "female",
  },
];
const relationships = [
  {
    id: "parent",
    fromDeityId: "zeus",
    toDeityId: "athena",
    relationshipType: "parent_of",
    description: "A recorded parentage",
    confidenceLevel: "medium",
    isDisputed: true,
    evidence: [
      {
        sourceId: "theogony",
        sourceTitle: "Theogony",
        locator: "Lines 924–929",
        edition: "A named translation",
        sourceUrl: "https://example.org/passage",
      },
    ],
  },
  {
    id: "spouse",
    fromDeityId: "zeus",
    toDeityId: "hera",
    relationshipType: "spouse_of",
    description: null,
  },
];

afterEach(cleanup);

describe("relationship connection explorer", () => {
  it("updates the ordered chain and links its passage with confidence and missing evidence", () => {
    render(
      <RelationshipPathExplorer
        deities={deities}
        relationships={relationships}
      />,
    );
    const chain = screen.getByRole("list", {
      name: "Recorded connection chain",
    });
    const steps = within(chain)
      .getAllByRole("listitem")
      .filter((item) => item.parentElement === chain);
    expect(steps).toHaveLength(2);
    expect(steps[0].textContent).toContain("Athena is child of Zeus");
    expect(steps[1].textContent).toContain("Zeus is spouse of Hera");
    expect(screen.getByText("No passage attached")).toBeTruthy();
    expect(
      screen.getByText("Disputed · Catalog confidence: medium"),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Theogony" }).getAttribute("href"),
    ).toBe("/sources/theogony");
    expect(
      screen.getByRole("link", { name: "Read passage" }).getAttribute("href"),
    ).toBe("https://example.org/passage");
    expect(screen.getByText(/Lines 924–929/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("From figure"), {
      target: { value: "zeus" },
    });
    fireEvent.change(screen.getByLabelText("To figure"), {
      target: { value: "athena" },
    });
    expect(screen.getByRole("status").textContent).toBe(
      "1 recorded connection from Zeus to Athena.",
    );
    expect(
      screen.getByRole("list", { name: "Recorded connection chain" })
        .textContent,
    ).toContain("Zeus is parent of Athena");
  });

  it("announces equal selections and disconnected selections", () => {
    render(
      <RelationshipPathExplorer
        deities={deities}
        relationships={relationships}
      />,
    );
    fireEvent.change(screen.getByLabelText("To figure"), {
      target: { value: "athena" },
    });
    expect(screen.getByRole("status").textContent).toContain("same figure");
    expect(
      screen.queryByRole("list", { name: "Recorded connection chain" }),
    ).toBeNull();
    fireEvent.change(screen.getByLabelText("To figure"), {
      target: { value: "hestia" },
    });
    expect(screen.getByRole("status").textContent).toContain(
      "No recorded connection",
    );
  });

  it("opens Connection as the third family-tree view", () => {
    render(
      <FamilyTreePageClient
        pantheonsData={[{ id: "greek-pantheon", name: "Greek" }]}
        deitiesData={deities}
        relationshipsData={relationships}
      />,
    );
    const connection = screen.getByRole("button", {
      name: "Connection path view",
    });
    expect(connection.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(connection);
    expect(connection.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("combobox", { name: "From figure" })).toBeTruthy();
    expect(
      screen.getByRole("list", { name: "Recorded connection chain" }),
    ).toBeTruthy();
  });
});

it("resets figure choices and restricts paths when switching traditions", async () => {
  const user = userEvent.setup();
  render(
    <FamilyTreePageClient
      pantheonsData={[
        { id: "greek-pantheon", name: "Greek" },
        { id: "norse-pantheon", name: "Norse" },
      ]}
      deitiesData={[
        ...deities,
        {
          id: "odin",
          name: "Odin",
          slug: "odin",
          pantheonId: "norse-pantheon",
          domain: ["wisdom"],
          gender: "male",
        },
      ]}
      relationshipsData={relationships}
    />,
  );
  await user.click(
    screen.getByRole("button", { name: "Connection path view" }),
  );
  await user.click(screen.getByRole("combobox", { name: "Pantheon" }));
  await user.click(screen.getByRole("option", { name: "Norse" }));
  expect(
    within(screen.getByLabelText("From figure"))
      .getAllByRole("option")
      .map((option) => option.textContent),
  ).toEqual(["Odin"]);
  expect(screen.getByRole("status").textContent).toContain("same figure");
  expect(
    screen.queryByRole("list", { name: "Recorded connection chain" }),
  ).toBeNull();
});
