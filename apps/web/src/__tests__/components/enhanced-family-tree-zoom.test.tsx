import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnhancedFamilyTree } from "@/components/family-tree/EnhancedFamilyTree";

interface TreeView {
  translate: { x: number; y: number };
  zoom: number;
  onUpdate: (state: {
    node: null;
    zoom: number;
    translate: { x: number; y: number };
  }) => void;
}

// react-d3-tree rebinds its d3-zoom behavior whenever `translate` or `zoom`
// props change. Record every prop set it receives.
const treeProps: TreeView[] = [];
vi.mock("react-d3-tree", () => ({
  default: (props: TreeView) => {
    treeProps.push(props);
    return <div data-testid="tree" />;
  },
}));

const deities = [
  { id: "a", name: "Aa", slug: "aa", domain: [], gender: null },
  { id: "b", name: "Bb", slug: "bb", domain: [], gender: null },
];
const relationships = [
  {
    id: "r1",
    fromDeityId: "a",
    toDeityId: "b",
    relationshipType: "Parent",
    description: null,
  },
];

const latest = (): TreeView => treeProps[treeProps.length - 1];

beforeEach(() => {
  treeProps.length = 0;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(500);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("EnhancedFamilyTree zoom binding", () => {
  it("does not feed the tree's own pan/zoom updates back as new props", () => {
    render(<EnhancedFamilyTree deities={deities} relationships={relationships} />);
    const before = latest();

    // A drag or pinch makes react-d3-tree report its live view. Echoing it back
    // as props makes the tree rebind d3-zoom mid-gesture, which throws in
    // d3-zoom's touchended (undefined `touchfirst`) on a double tap.
    act(() => {
      before.onUpdate({ node: null, zoom: 1.4, translate: { x: 10, y: 20 } });
    });

    const after = latest();
    expect(after.zoom).toBe(before.zoom);
    expect(after.translate).toEqual(before.translate);
  });

  it("applies the zoom buttons relative to the live view", () => {
    render(<EnhancedFamilyTree deities={deities} relationships={relationships} />);
    act(() => {
      latest().onUpdate({ node: null, zoom: 1.4, translate: { x: 10, y: 20 } });
    });

    fireEvent.click(screen.getByRole("button", { name: /zoom in/i }));

    expect(latest().zoom).toBeCloseTo(1.55);
  });
});
