import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import enMessages from "../../../../messages/en.json";

// Next returns stable objects across renders; the component depends on that.
const nav = vi.hoisted(() => ({
  params: new URLSearchParams({ deities: "tyr,ares" }),
  router: { replace: () => {} },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.router,
  useSearchParams: () => nav.params,
}));
vi.mock("@/components/compare/ComparisonSelector", () => ({
  ComparisonSelector: () => null,
}));
vi.mock("@/components/compare/ComparisonTable", () => ({
  ComparisonTable: () => null,
}));

import { ComparePageClient } from "@/app/compare/ComparePageClient";

const deity = (slug: string, name: string) => ({
  id: slug,
  slug,
  name,
  pantheonId: "x",
  gender: null,
  domain: [],
  symbols: [],
  description: null,
  importanceRank: null,
  imageUrl: null,
  alternateNames: [],
});

function renderPage(written: string[]) {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ComparePageClient
        deitiesData={[
          deity("tyr", "Tyr"),
          deity("ares", "Ares"),
          deity("odin", "Odin"),
        ]}
        pantheonsData={[]}
        writtenComparisons={written}
      />
    </NextIntlClientProvider>,
  );
}

describe("compare tool written-comparison link", () => {
  it("links two selected figures to their written comparison in either order", async () => {
    nav.params = new URLSearchParams({ deities: "tyr,ares" });
    renderPage(["ares-vs-tyr"]);
    expect(
      await screen.findByRole("link", {
        name: "Read how Tyr and Ares compare",
      }),
    ).toHaveAttribute("href", "/compare/ares-vs-tyr");
  });

  it("shows no link when no written comparison exists", async () => {
    nav.params = new URLSearchParams({ deities: "tyr,odin" });
    renderPage(["ares-vs-tyr"]);
    await screen.findByText(/Next step/i).catch(() => null);
    expect(screen.queryByRole("link", { name: /Read how/ })).toBeNull();
  });
});
