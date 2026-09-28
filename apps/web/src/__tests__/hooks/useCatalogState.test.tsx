import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCatalogState } from "@/hooks/useCatalogState";
import { useCatalogPagination } from "@/hooks/useCatalogPagination";

beforeEach(() => {
  // The global setup replaces Location with a plain object. Keep that object
  // synchronized with history for this browser-state hook's unit tests.
  const replaceState = window.history.replaceState.bind(window.history);
  vi.spyOn(window.history, "replaceState").mockImplementation(
    (data, unused, url) => {
      replaceState(data, unused, url);
      const next = new URL(String(url), "http://localhost");
      Object.assign(window.location, {
        href: next.href,
        search: next.search,
        hash: next.hash,
        pathname: next.pathname,
      });
    },
  );
  window.history.replaceState(null, "", "/deities");
});
afterEach(() => vi.restoreAllMocks());

describe("catalog navigation state", () => {
  it("restores query and page from the current URL after remount", () => {
    window.history.replaceState(null, "", "/deities?q=Athena&page=2");
    const { result, unmount } = renderHook(() => useCatalogState("q", ""));
    expect(result.current[0]).toBe("Athena");
    unmount();
    const restored = renderHook(() => useCatalogState("q", ""));
    expect(restored.result.current[0]).toBe("Athena");
  });

  it("updates a mounted catalog on browser history navigation", () => {
    const { result } = renderHook(() => useCatalogState("q", ""));
    act(() => {
      window.history.replaceState(null, "", "/deities?q=Zeus");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current[0]).toBe("Zeus");
  });

  it("resets page on filtering and preserves simultaneous resets and unrelated parameters", () => {
    window.history.replaceState(
      null,
      "",
      "/deities?q=Athena&pantheon=greek&page=2&view=table#catalog",
    );
    const { result } = renderHook(() => ({
      query: useCatalogState("q", ""),
      pantheon: useCatalogState("pantheon", "all"),
    }));
    const historyLength = window.history.length;
    act(() => {
      result.current.query[1]("");
      result.current.pantheon[1]("all");
    });
    expect(window.location.search).toBe("?view=table");
    expect(window.location.hash).toBe("#catalog");
    expect(window.history.length).toBe(historyLength);
  });

  it("ignores unsupported facet values and safely parses pages", () => {
    window.history.replaceState(null, "", "/deities?view=invalid&page=NaN");
    const { result } = renderHook(() => ({
      view: useCatalogState("view", "grid", ["grid", "table"]),
      pagination: useCatalogPagination([1, 2, 3], 2),
    }));
    expect(result.current.view[0]).toBe("grid");
    expect(result.current.pagination.page).toBe(1);
    act(() => result.current.pagination.nextPage());
    expect(result.current.pagination.paginatedData).toEqual([3]);
    expect(window.location.search).toContain("page=2");
  });
});
