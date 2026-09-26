"use client";

import { ReviewSession } from "@/components/review/ReviewSession";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  EmptyState,
  primaryLinkClass,
  secondaryLinkClass,
} from "@/components/layout/tool-stage";
import { useReview } from "@/providers/review-provider";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ReviewPageClient() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { reviewState, dueCount, generateCardsFromProgress, getTodayStats } =
    useReview();
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    void generateCardsFromProgress().catch(() => {});
  }, [generateCardsFromProgress]);

  const todayStats = getTodayStats();
  const { stats } = reviewState;

  const handleStartSession = () => {
    setIsSessionActive(true);
  };

  const handleSessionComplete = () => {
    setIsSessionActive(false);
    router.push("/");
  };

  const header = (
    <PageHeader
      eyebrow="Spaced repetition"
      mark="owl"
      title="Daily Review"
      lede="Short sessions that revisit the figures and stories you have read, timed so they stay in long-term memory."
    />
  );

  if (isSessionActive) {
    return (
      <div className="min-h-screen">
        <Container size="reading" className="section-space-sm">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setIsSessionActive(false)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Session
            </Button>
          </div>

          <ReviewSession onComplete={handleSessionComplete} />
        </Container>
      </div>
    );
  }

  if (
    Object.keys(reviewState.cards).length === 0 &&
    stats.totalReviewed === 0
  ) {
    return (
      <div className="min-h-screen">
        {header}
        <Container className="section-space-sm">
          <EmptyState
            id="review-start-title"
            mark="owl"
            eyebrow="No cards yet"
            title="Build your first review deck"
            description="Visit a figure or read a story, then return here. Cards are made from those entries to help you recall names, symbols and relationships."
            actions={
              <>
                <Link href="/deities/athena" className={primaryLinkClass}>
                  Start with Athena
                </Link>
                <Link href="/deities" className={secondaryLinkClass}>
                  Choose another figure
                </Link>
              </>
            }
            preview={<FlashcardPreview />}
          />
        </Container>
      </div>
    );
  }

  const figures = [
    { label: "Cards Due", value: dueCount },
    { label: "Reviewed Today", value: todayStats.reviewed },
    { label: "Day Streak", value: stats.currentStreak },
    { label: "Accuracy", value: `${stats.averageAccuracy}%` },
  ];

  return (
    <div className="min-h-screen">
      {header}
      <Container className="section-space-sm">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <motion.section
            aria-labelledby="review-now-title"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="dark relative isolate overflow-hidden rounded-lg bg-midnight p-6 text-foreground md:p-8"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_0%_0%,color-mix(in_oklch,var(--gold)_20%,transparent),transparent_70%)]"
            />
            <p className="type-eyebrow text-gold-light">Today</p>
            <h2
              id="review-now-title"
              className="mt-2 font-serif text-2xl font-semibold text-parchment md:text-3xl"
            >
              {dueCount > 0
                ? `You have ${dueCount} cards ready for review`
                : "All caught up!"}
            </h2>
            <p className="mt-3 max-w-md type-reading text-parchment/80">
              {dueCount > 0
                ? "Review these cards now to strengthen your memory. Each answer sets when the card returns."
                : "You have reviewed every due card. Read more figures and stories to add new cards."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {dueCount > 0 ? (
                <Button
                  size="lg"
                  onClick={handleStartSession}
                  className="h-12 gap-2 bg-gold px-6 font-semibold text-midnight hover:bg-gold-light"
                >
                  <MythosMark id="owl" className="h-5 w-5" />
                  Start Review Session
                </Button>
              ) : (
                <>
                  <Link href="/deities" className={primaryLinkClass}>
                    Explore Deities
                  </Link>
                  <Link
                    href="/stories"
                    className="inline-flex min-h-11 items-center type-ui font-medium text-gold-light underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                  >
                    Read Stories
                  </Link>
                </>
              )}
            </div>
          </motion.section>

          <div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/70 bg-border/70">
              {figures.map((figure) => (
                <div key={figure.label} className="bg-background px-5 py-4">
                  <dt className="type-meta uppercase tracking-[0.14em] text-muted-foreground">
                    {figure.label}
                  </dt>
                  <dd className="mt-1 font-serif text-3xl font-semibold tabular-nums text-foreground">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 type-meta text-muted-foreground">
              Review history is saved locally on this device.
            </p>
          </div>
        </div>

        <section aria-labelledby="how-review-works" className="mt-14">
          <h2
            id="how-review-works"
            className="page-section-title text-foreground"
          >
            How spaced repetition works
          </h2>
          <ol className="mt-6 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map(([title, body], index) => (
              <li key={title} className="border-t border-gold/40 pt-4">
                <p className="font-serif text-3xl font-semibold text-gold-text">
                  {index + 1}
                </p>
                <h3 className="mt-2 type-h3 text-foreground">{title}</h3>
                <p className="mt-1 type-reading text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {stats.totalReviewed > 0 && (
          <section aria-labelledby="review-journey" className="mt-14">
            <h2
              id="review-journey"
              className="page-section-title text-foreground"
            >
              Your learning journey
            </h2>
            <dl className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { label: "Total Reviews", value: stats.totalReviewed },
                {
                  label: "Overall Accuracy",
                  value: `${stats.averageAccuracy}%`,
                },
                { label: "Longest Streak", value: stats.longestStreak },
                {
                  label: "Cards in Library",
                  value: Object.keys(reviewState.cards).length,
                },
              ].map((figure) => (
                <div
                  key={figure.label}
                  className="border-l border-gold/40 pl-4"
                >
                  <dt className="type-ui text-muted-foreground">
                    {figure.label}
                  </dt>
                  <dd className="font-serif text-3xl font-semibold tabular-nums text-foreground">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </Container>
    </div>
  );
}

const HOW_IT_WORKS = [
  [
    "Learn content",
    "Explore deities, read stories and discover mythology across pantheons.",
  ],
  [
    "Review cards",
    "Test your memory with flashcards generated from content you have viewed.",
  ],
  [
    "Strengthen memory",
    "Cards you struggle with appear more often. Easy cards are spaced further apart.",
  ],
] as const;

/** A sample card: what a review question looks like before the first one. */
function FlashcardPreview() {
  return (
    <figure className="relative mx-auto max-w-md">
      <div aria-hidden="true" className="relative">
        <div className="absolute inset-x-6 -bottom-3 h-full rounded-lg border border-border/70 bg-card/70" />
        <div className="absolute inset-x-3 -bottom-1.5 h-full rounded-lg border border-border/70 bg-card/85" />
        <div className="relative overflow-hidden rounded-lg border border-gold/35 bg-card shadow-xl shadow-black/5">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-3 type-meta text-muted-foreground">
            <span className="uppercase tracking-[0.14em]">Card 1 of 5</span>
            <span>Greek</span>
          </div>
          <div className="px-5 py-6">
            <p className="type-eyebrow">Symbol</p>
            <p className="mt-2 font-serif text-xl font-semibold leading-snug text-foreground">
              Which goddess is symbolized by the owl?
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 type-ui">
              {["Again", "Good", "Easy"].map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-border px-3 py-2 text-center text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-6 text-center type-meta text-muted-foreground">
        A sample card. Yours are made from what you read.
      </figcaption>
    </figure>
  );
}
