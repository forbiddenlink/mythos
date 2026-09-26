import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { generateBaseMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateBaseMetadata({
  title: "Accessibility Statement - Mythos Atlas",
  description:
    "Accessibility goals, known limitations, and how to report barriers on Mythos Atlas.",
  url: "/accessibility",
});

const TOC = [
  { id: "commitment", label: "Commitment" },
  { id: "known-limitations", label: "Known limitations" },
  { id: "feedback", label: "Feedback" },
];

export default function AccessibilityPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      mark="compass"
      title="Accessibility Statement"
      lede="How the atlas is built to be usable by everyone, where it still falls short, and how to report a barrier."
      toc={TOC}
      meta="Last updated: July 23, 2026"
    >
      <section id="commitment">
        <h2>Commitment</h2>
        <p>
          Mythos Atlas aims to conform to WCAG 2.2 Level AA for core reading and
          navigation flows (home, pantheons, deities, stories, search). We test
          with keyboard navigation and automated checks; interactive
          visualizations (knowledge graph, maps, family trees) may have
          remaining gaps.
        </p>
      </section>

      <section id="known-limitations">
        <h2>Known limitations</h2>
        <ul>
          <li>
            Canvas-based knowledge graphs and Leaflet maps are not fully
            operable by keyboard or screen reader yet; list/table alternatives
            exist on some routes.
          </li>
          <li>
            Some quiz and language controls need improved arrow-key patterns.
          </li>
          <li>
            Encyclopedia body content is primarily English; UI chrome has
            limited translations.
          </li>
        </ul>
      </section>

      <section id="feedback">
        <h2>Feedback</h2>
        <p>
          If you encounter a barrier, please tell us via the{" "}
          <Link href="/contact">contact page</Link>. Include the page URL and
          what you were trying to do. We aim to respond within 14 days.
        </p>
      </section>
    </InfoPage>
  );
}
