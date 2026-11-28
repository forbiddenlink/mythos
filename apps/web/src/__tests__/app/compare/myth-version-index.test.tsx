import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, it, vi } from "vitest";
import CompareMythsPage from "@/app/compare/myths/page";
import versions from "@/data/myth-versions.json";
import { getStories } from "@/lib/data/catalog";
import enMessages from "../../../../messages/en.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/compare/myths",
}));
vi.mock("@/app/compare/myths/CompareMythsPageClient", () => ({
  CompareMythsPageClient: () => null,
}));

it("links to every source comparison with the story title and editorial question", () => {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <CompareMythsPage />
    </NextIntlClientProvider>,
  );

  const index = screen.getByRole("region", {
    name: "Versions of the same myth",
  });
  expect(index).toHaveAttribute("id", "version-comparisons");
  expect(
    screen.getByRole("link", { name: "Browse source comparisons" }),
  ).toHaveAttribute("href", "#version-comparisons");

  const titles = new Map(getStories().map(({ slug, title }) => [slug, title]));
  const links = within(index).getAllByRole("link");
  expect(links).toHaveLength(versions.length);
  for (const [position, { storySlug, question }] of versions.entries()) {
    const link = links[position];
    expect(link).toHaveAttribute("href", `/stories/${storySlug}#versions`);
    expect(within(link).getByText(titles.get(storySlug)!)).toBeVisible();
    expect(within(link).getByText(question)).toBeVisible();
  }
});
