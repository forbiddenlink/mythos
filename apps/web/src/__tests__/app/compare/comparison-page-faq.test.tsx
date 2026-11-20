import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
  usePathname: () => "/compare/odin-vs-zeus",
}));

import ComparisonPage, { generateMetadata } from "@/app/compare/[pair]/page";
import { comparisonFaq, contrastSummary } from "@/lib/comparison-copy";
import { getDeityComparison } from "@/lib/comparisons";

function text(node: Element): string {
  return node.textContent!.replace(/\s+/g, " ").trim();
}

async function renderPage(pair: string): Promise<HTMLElement> {
  const page = await ComparisonPage({ params: Promise.resolve({ pair }) });
  return render(page).container;
}

// Two pairs across traditions, one whose records give neither figure a
// domain of its own, one where both carry a qualified name, and one inside a
// single tradition.
const PAIRS = [
  "odin-vs-zeus",
  "indra-vs-thor",
  "hera-vs-juno",
  "apollo-vs-apollo-roman",
  "apollo-vs-artemis",
];

describe("comparison page quick answers", () => {
  it.each(PAIRS)(
    "%s shows every structured-data question and answer on the page",
    async (pair) => {
      const comparison = getDeityComparison(pair);
      if (!comparison) throw new Error(`no comparison ${pair}`);
      const container = await renderPage(pair);

      const scripts = [
        ...container.querySelectorAll('script[type="application/ld+json"]'),
      ].map((script) => JSON.parse(script.textContent!));
      const faqPages = scripts.filter((data) => data["@type"] === "FAQPage");
      expect(faqPages).toHaveLength(1);

      const structured = faqPages[0].mainEntity.map(
        (entry: { name: string; acceptedAnswer: { text: string } }) => ({
          question: entry.name,
          answer: entry.acceptedAnswer.text,
        }),
      );
      expect(structured).toEqual(comparisonFaq(comparison));

      const section = container.querySelector("#faq")!;
      const visible = [...section.querySelectorAll("dt")].map((dt) => ({
        question: text(dt),
        answer: text(dt.nextElementSibling!),
      }));
      expect(visible).toEqual(structured);
      expect(container.querySelector('a[href="#faq"]')).not.toBeNull();
    },
  );

  it("opens with the reason for the pairing, then the short answer", async () => {
    const comparison = getDeityComparison("indra-vs-thor")!;
    const container = await renderPage("indra-vs-thor");
    expect(container.querySelector("h1")).toHaveTextContent(/^Indra vs Thor$/);
    expect(container).toHaveTextContent(contrastSummary(comparison));
  });

  it("titles the page for the search, and keeps the heading short", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ pair: "indra-vs-thor" }),
    });
    expect(metadata.title).toMatchObject({
      default: "Indra vs Thor: Similarities and Differences",
    });
  });
});
