import { act, renderHook } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({
  params: new URLSearchParams(),
  router: { replace: vi.fn() },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.router,
  useSearchParams: () => nav.params,
}));

import { useUrlSelection } from "@/hooks/use-url-selection";

interface Item {
  id: string;
  slug: string;
}
const items = new Map<string, Item>(
  ["zeus", "odin", "hel", "ra", "tyr"].map((s) => [s, { id: s, slug: s }]),
);
const resolve = (id: string) => items.get(id);
const getSlug = (item: Item) => item.slug;
const lower = (raw: string) => raw.trim().toLowerCase();

const options = {
  param: "deities",
  basePath: "/compare",
  resolve,
  getSlug,
  max: 4,
  normalizeId: lower,
};

beforeEach(() => {
  nav.params = new URLSearchParams();
  nav.router.replace.mockClear();
});

describe("useUrlSelection", () => {
  it("derives the selection from the URL, capped at max and dropping unknown ids", () => {
    nav.params = new URLSearchParams({ deities: "Zeus, nope,odin,hel,ra,tyr" });
    const { result } = renderHook(() => useUrlSelection<Item>(options));
    expect(result.current[0].map((i) => i.id)).toEqual([
      "zeus",
      "odin",
      "hel",
      "ra",
    ]);
  });

  it("clears the selection when the param is gone (bare route)", () => {
    nav.params = new URLSearchParams({ deities: "zeus,odin" });
    const { result, rerender } = renderHook(() =>
      useUrlSelection<Item>(options),
    );
    expect(result.current[0]).toHaveLength(2);
    nav.params = new URLSearchParams();
    rerender();
    expect(result.current[0]).toEqual([]);
  });

  it("writes the same URL format the page always used", () => {
    const { result } = renderHook(() => useUrlSelection<Item>(options));
    result.current[1]([items.get("zeus")!, items.get("odin")!]);
    expect(nav.router.replace).toHaveBeenCalledWith(
      "/compare?deities=zeus%2Codin",
      { scroll: false },
    );
    result.current[1]([]);
    expect(nav.router.replace).toHaveBeenLastCalledWith("/compare", {
      scroll: false,
    });
  });

  it("calls router.replace once per write under StrictMode", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StrictMode>{children}</StrictMode>
    );
    const { result } = renderHook(() => useUrlSelection<Item>(options), {
      wrapper,
    });
    result.current[1]([items.get("zeus")!]);
    expect(nav.router.replace).toHaveBeenCalledTimes(1);
  });

  it("keeps two quick removals when the first write has not reached the URL", () => {
    nav.params = new URLSearchParams({ deities: "zeus,odin,hel" });
    const { result, rerender } = renderHook(() =>
      useUrlSelection<Item>(options),
    );
    const remove = (id: string) =>
      act(() => {
        const [selection, setSelection] = result.current;
        setSelection(selection.filter((item) => item.id !== id));
      });

    remove("zeus");
    remove("odin");
    expect(result.current[0].map((i) => i.id)).toEqual(["hel"]);

    // The first write lands: the newer pending write must still win.
    nav.params = new URLSearchParams({ deities: "odin,hel" });
    rerender();
    expect(result.current[0].map((i) => i.id)).toEqual(["hel"]);

    nav.params = new URLSearchParams({ deities: "hel" });
    rerender();
    expect(result.current[0].map((i) => i.id)).toEqual(["hel"]);
    expect(nav.router.replace).toHaveBeenLastCalledWith(
      "/compare?deities=hel",
      { scroll: false },
    );
  });

  it("drops a pending write when the URL moves somewhere else", () => {
    nav.params = new URLSearchParams({ deities: "zeus,odin" });
    const { result, rerender } = renderHook(() =>
      useUrlSelection<Item>(options),
    );
    act(() => result.current[1]([items.get("zeus")!]));
    nav.params = new URLSearchParams({ deities: "ra" });
    rerender();
    expect(result.current[0].map((i) => i.id)).toEqual(["ra"]);
  });
});
