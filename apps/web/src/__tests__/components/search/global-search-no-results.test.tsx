import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/analytics/events")>()),
  trackEvent: track,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/use-debounce", () => ({ useDebounce: <T,>(v: T) => v }));
vi.mock("@/hooks/use-search-index", () => ({
  useSearchIndex: () => ({ index: {}, error: null }),
}));
const hits = vi.hoisted(() => ({ list: [] as unknown[] }));
vi.mock("@/lib/search-engine", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/search-engine")>()),
  searchIndex: () => hits.list,
  capPerType: (list: unknown[]) => list,
}));

import { GlobalSearch } from "@/components/search/GlobalSearch";

function typeQuery(value: string) {
  fireEvent.change(screen.getByRole("combobox"), { target: { value } });
}

beforeEach(() => {
  track.mockClear();
  hits.list = [];
});

describe("GlobalSearch zero-result logging", () => {
  it("records the term once when a search finds nothing", () => {
    render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("Zalgo Prince");
    const calls = track.mock.calls.filter(([n]) => n === "search_no_results");
    expect(calls).toEqual([["search_no_results", { term: "zalgo prince" }]]);
  });

  it("does not record the term when there are results", () => {
    hits.list = [
      {
        type: "deity",
        id: "x",
        title: "Loki",
        description: "",
        matchScore: 1,
      },
    ];
    render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("loki");
    expect(track.mock.calls.some(([n]) => n === "search_no_results")).toBe(
      false,
    );
    expect(track).toHaveBeenCalledWith("search_performed", {
      queryLength: 4,
      resultCount: 1,
    });
  });

  it("never records an email-shaped term", () => {
    render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("me@example.com");
    expect(track.mock.calls.some(([n]) => n === "search_no_results")).toBe(
      false,
    );
  });
});
