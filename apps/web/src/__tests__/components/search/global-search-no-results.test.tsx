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

function noResultCalls() {
  return track.mock.calls.filter(([n]) => n === "search_no_results");
}

describe("GlobalSearch zero-result logging", () => {
  it("sends nothing while the visitor is still typing", () => {
    render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("za");
    typeQuery("zalg");
    typeQuery("Zalgo Prince");
    expect(noResultCalls()).toEqual([]);
  });

  it("sends the final term once when the dialog closes on zero results", () => {
    const { rerender } = render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("za");
    typeQuery("Zalgo Prince");
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    expect(noResultCalls()).toEqual([
      ["search_no_results", { term: "zalgo prince" }],
    ]);
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    expect(noResultCalls()).toHaveLength(1);
  });

  it("sends one term per open, not one per session", () => {
    const { rerender } = render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("zalgo");
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    rerender(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("morgoth");
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    expect(noResultCalls().map(([, p]) => p)).toEqual([
      { term: "zalgo" },
      { term: "morgoth" },
    ]);
  });

  it("sends nothing on close when the final query had results", () => {
    hits.list = [
      { type: "deity", id: "x", title: "Loki", description: "", matchScore: 1 },
    ];
    const { rerender } = render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("loki");
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    expect(noResultCalls()).toEqual([]);
    expect(track).toHaveBeenCalledWith("search_performed", {
      queryLength: 4,
      resultCount: 1,
    });
  });

  it("sends nothing on close when no query was typed", () => {
    const { rerender } = render(<GlobalSearch open onOpenChange={() => {}} />);
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    expect(noResultCalls()).toEqual([]);
  });

  it("never sends an email, link, domain or numeric term", () => {
    for (const raw of ["me@example.com", "example.com", "5551234567"]) {
      const { rerender, unmount } = render(
        <GlobalSearch open onOpenChange={() => {}} />,
      );
      typeQuery(raw);
      rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
      unmount();
    }
    expect(noResultCalls()).toEqual([]);
  });

  it("keeps a Greek or Devanagari name", () => {
    const { rerender } = render(<GlobalSearch open onOpenChange={() => {}} />);
    typeQuery("Ζεύς");
    rerender(<GlobalSearch open={false} onOpenChange={() => {}} />);
    expect(noResultCalls()).toEqual([["search_no_results", { term: "ζεύς" }]]);
  });
});
