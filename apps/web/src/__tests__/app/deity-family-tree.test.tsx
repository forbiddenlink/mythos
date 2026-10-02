import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The real tree pulls in reactflow and d3; stand in a marker component so the
// test checks WHEN the chunk is requested and what the section looks like
// before it is.
vi.mock("@/components/family-tree/FamilyTreeVisualization", () => ({
  FamilyTreeVisualization: ({ focusDeityId }: { focusDeityId: string }) => (
    <div data-testid="tree-content">tree for {focusDeityId}</div>
  ),
}));

import { DeityFamilyTree } from "@/app/deities/[slug]/_components/DeityFamilyTree";

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
let callback: Callback | undefined;

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

const deities = [
  { id: "zeus", name: "Zeus", slug: "zeus", domain: ["sky"], gender: "male" },
  {
    id: "hera",
    name: "Hera",
    slug: "hera",
    domain: ["marriage"],
    gender: "female",
  },
];
const relationships = [
  {
    id: "r1",
    fromDeityId: "zeus",
    toDeityId: "hera",
    relationshipType: "spouse",
    description: null,
  },
];

function renderTree(rels = relationships) {
  return render(
    <DeityFamilyTree
      deityId="zeus"
      deityName="Zeus"
      deities={deities}
      relationships={rels}
    />,
  );
}

describe("DeityFamilyTree", () => {
  beforeEach(() => {
    callback = undefined;
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("holds the tree back behind a 25rem placeholder until it nears the viewport", () => {
    renderTree();
    // Heading renders at once; the heavy tree does not.
    expect(screen.getByRole("heading", { name: "Family tree" })).toBeTruthy();
    expect(screen.queryByTestId("tree-content")).toBeNull();
    // Same box the dynamic loading state uses, so nothing shifts when it swaps.
    expect(screen.getByTestId("family-tree-fallback").className).toContain(
      "h-100",
    );
  });

  it("still renders the tree content once the section is near the viewport", async () => {
    renderTree();
    act(() => callback?.([{ isIntersecting: true }]));
    await waitFor(() =>
      expect(screen.getByTestId("tree-content").textContent).toBe(
        "tree for zeus",
      ),
    );
  });

  it("renders nothing without relationships", () => {
    const { container } = renderTree([]);
    expect(container.firstChild).toBeNull();
  });
});
