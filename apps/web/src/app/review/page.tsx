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
      <section className="bg-mythic">
        <div className="container mx-auto max-w-5xl px-4 pt-10">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Use Daily Review To Retain What You Read
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Daily review is the memory layer for Mythos Atlas. Instead of
              rereading full pages every time, you can revisit names, symbols,
              domains, and story facts in short spaced-repetition sessions that
              surface the material most likely to fade.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              This page works best after real exploration. Read a deity profile,
              finish a story, or complete a quiz, then return here later to
              reinforce the details that matter. Over time, the review queue
              becomes a compact memory loop for mythology study rather than a
              separate feature disconnected from the rest of the site.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              It also helps balance depth and repetition. Some routes are best
              for long reading and context, while this one is designed for short
              retrieval practice. Alternating between the two is usually what
              makes information durable enough to recognize later in quizzes,
              games, and comparisons.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              If your queue feels thin, open a few more deity or story pages and
              let the site build material for you naturally. Review becomes more
              useful when it reflects what you are actually studying, not a
              disconnected pile of random facts.
            </p>
          </div>
        </div>
      </section>
      <ReviewPageClient />
    </>
  );
}
