import Link from "next/link";
import { generateBaseMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateBaseMetadata({
  title: "Accessibility Statement - Mythos Atlas",
  description:
    "Accessibility goals, known limitations, and how to report barriers on Mythos Atlas.",
  url: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-gold">
        Accessibility Statement
      </h1>
      <p className="mt-2 text-muted-foreground">Last updated: July 23, 2026</p>

      <div className="prose prose-invert mt-8 max-w-none space-y-8">
        <section>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Commitment
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mythos Atlas aims to conform to WCAG 2.2 Level AA for core reading
            and navigation flows (home, pantheons, deities, stories, search). We
            test with keyboard navigation and automated checks; interactive
            visualizations (knowledge graph, maps, family trees) may have
            remaining gaps.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Known limitations
          </h2>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
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

        <section>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Feedback
          </h2>
          <p className="mt-4 text-muted-foreground">
            If you encounter a barrier, please tell us via the{" "}
            <Link
              href="/contact"
              className="text-gold underline hover:text-gold/80"
            >
              contact page
            </Link>
            . Include the page URL and what you were trying to do. We aim to
            respond within 14 days.
          </p>
        </section>
      </div>
    </div>
  );
}
