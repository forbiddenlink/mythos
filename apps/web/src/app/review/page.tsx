import { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { AboutThisPage } from "@/components/layout/about-this-page";
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
      <AboutThisPage title="How daily review works">
        <p>
          Read deity profiles and stories to build your review queue. Short
          sessions revisit their names, symbols, and traditions. Your answers
          determine when each card returns; review history stays in this
          browser.
        </p>
      </AboutThisPage>
    </>
  );
}
