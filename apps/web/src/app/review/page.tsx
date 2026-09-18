import { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { ReviewPageClient } from "./ReviewPageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Daily Review - Spaced Repetition Learning",
  description:
    "Strengthen your mythology knowledge with daily spaced repetition flashcards. Review deities, domains, symbols, and stories from ancient civilizations.",
  url: "/review",
  keywords: [
    "spaced repetition",
    "flashcards",
    "mythology learning",
    "study",
    "review",
    "memory",
  ],
});

export default function ReviewPage() {
  return (
    <>
      <ReviewPageClient />
      <div className="page-shell max-w-4xl">
        <details className="border-t border-border py-6 text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            How daily review works
          </summary>
          <p className="mt-3 leading-relaxed">
            Read deity profiles and stories to build your review queue. Short
            sessions revisit their names, symbols, and traditions. Your answers
            determine when each card returns; review history stays in this
            browser.
          </p>
        </details>
      </div>
    </>
  );
}
