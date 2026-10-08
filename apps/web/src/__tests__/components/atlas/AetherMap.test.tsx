import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AtlasLayout } from "@/lib/atlas-layout";
import { AetherMap } from "@/components/atlas/AetherMap";

const mocks = vi.hoisted(() => ({ scene: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("next/dynamic", () => ({
  default: () =>
    function LazyScene({ onSelect }: { onSelect: (slug: string) => void }) {
      mocks.scene();
      return <button onClick={() => onSelect("zeus")}>Loaded scene</button>;
    },
}));

const layout: AtlasLayout = {
  nodes: [
    {
      id: "zeus",
      slug: "zeus",
      name: "Zeus",
      pantheonId: "greek-pantheon",
      position: [0, 0, 0],
      size: 1,
      importanceRank: 1,
      color: "#ffffff",
    },
  ],
  edges: [],
  pantheons: [
    {
      id: "greek-pantheon",
      name: "Greek",
      center: [0, 0, 0],
      color: "#ffffff",
    },
  ],
};

function device(reduced: boolean, webgl: boolean): void {
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() =>
    webgl ? {} : null) as typeof HTMLCanvasElement.prototype.getContext);
}

describe("Atlas scene loading gate", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the heavy scene unmounted for reduced motion until explicitly requested", () => {
    device(true, true);
    render(<AetherMap layout={layout} />);
    expect(
      screen.getByRole("img", { name: /Still chart/ }),
    ).toBeInTheDocument();
    expect(mocks.scene).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Show the star map anyway" }),
    );
    expect(
      screen.getByRole("button", { name: "Loaded scene" }),
    ).toBeInTheDocument();
    expect(mocks.scene).toHaveBeenCalled();
  });

  it("keeps the heavy scene unmounted when WebGL is unavailable", () => {
    device(false, false);
    render(<AetherMap layout={layout} />);
    expect(
      screen.getByText(/This browser cannot draw the 3D map/),
    ).toBeInTheDocument();
    expect(mocks.scene).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: /Show the star map/ }),
    ).toBeNull();
  });

  it("renders the normal scene and preserves deity navigation", () => {
    device(false, true);
    render(<AetherMap layout={layout} />);
    fireEvent.click(screen.getByRole("button", { name: "Loaded scene" }));
    expect(mocks.push).toHaveBeenCalledWith("/deities/zeus");
  });
});
