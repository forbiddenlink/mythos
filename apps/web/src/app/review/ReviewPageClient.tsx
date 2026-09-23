"use client";

import { ReviewSession } from "@/components/review/ReviewSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReview } from "@/providers/review-provider";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { HeroMark } from "@/components/icons/hero-mark";
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

  if (isSessionActive) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Back Button */}
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
        </div>
      </div>
    );
  }

  if (
    Object.keys(reviewState.cards).length === 0 &&
    stats.totalReviewed === 0
  ) {
    return (
      <div className="page-shell max-w-4xl min-h-screen">
        <h1 className="page-title text-foreground">Daily Review</h1>
        <section
          className="mt-8 max-w-2xl"
          aria-labelledby="review-start-title"
        >
          <h2
            id="review-start-title"
            className="font-serif text-2xl text-foreground"
          >
            Build your first review deck
          </h2>
          <p className="mt-4 font-body text-xl leading-relaxed text-foreground">
            Visit a figure or read a story, then return here. Review cards are
            created from those entries to help you recall names, symbols and
            relationships.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/deities/athena"
              className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 font-medium text-midnight hover:bg-gold-light"
            >
              Start with Athena
            </Link>
            <Link
              href="/deities"
              className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
            >
              Choose another figure
            </Link>
          </div>
          <p className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground">
            Cards and review history are saved in this browser. When you return,
            answer a card and rate how easily you remembered it.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="mb-6 flex justify-center">
            <HeroMark mark="owl" tone="light" size="lg" />
          </div>
          <h1 className="page-title text-foreground mb-4">Daily Review</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strengthen your mythology knowledge with spaced repetition. Review
            what you have learned to commit it to long-term memory.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Review history is saved locally on this device.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Card className="border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MythosMark id="chronos" className="h-5 w-5 text-gold" />
              </div>
              <div className="text-2xl font-bold">{dueCount}</div>
              <div className="text-xs text-muted-foreground">Cards Due</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MythosMark id="scales" className="h-5 w-5 text-gold" />
              </div>
              <div className="text-2xl font-bold">{todayStats.reviewed}</div>
              <div className="text-xs text-muted-foreground">
                Reviewed Today
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MythosMark id="torch" className="h-5 w-5 text-bronze" />
              </div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MythosMark id="laurel" className="h-5 w-5 text-gold" />
              </div>
              <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Review Section */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-gold/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-serif">
                {dueCount > 0
                  ? `You have ${dueCount} cards ready for review`
                  : stats.totalReviewed === 0
                    ? "Build your first review deck"
                    : "All caught up!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8 space-y-6">
              {dueCount > 0 ? (
                <>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Review these cards now to strengthen your memory. The spaced
                    repetition algorithm will show you cards at optimal
                    intervals for learning.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStartSession}
                    className="h-14 px-8 text-lg gap-3 bg-gold hover:bg-gold/90 text-black font-semibold"
                  >
                    <MythosMark id="owl" className="h-5 w-5" />
                    Start Review Session
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {stats.totalReviewed === 0
                      ? "You have not built up any review cards yet. Explore deities and stories to generate your first cards."
                      : "Great job! You have reviewed all your due cards. Explore more content to generate new review cards."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="gap-2"
                    >
                      <Link href="/deities">Explore Deities</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="gap-2"
                    >
                      <Link href="/stories">Read Stories</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-serif font-semibold text-center mb-6">
            How Spaced Repetition Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-gold font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Learn Content</h3>
                <p className="text-sm text-muted-foreground">
                  Explore deities, read stories, and discover mythology across
                  pantheons.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-gold font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Review Cards</h3>
                <p className="text-sm text-muted-foreground">
                  Test your memory with flashcards generated from content you
                  have viewed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-gold font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Strengthen Memory</h3>
                <p className="text-sm text-muted-foreground">
                  Cards you struggle with appear more often. Easy cards are
                  spaced further apart.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Lifetime Stats */}
        {stats.totalReviewed > 0 && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <Card className="border-border/60 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg font-serif">
                  Your Learning Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gold">
                      {stats.totalReviewed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Reviews
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-500">
                      {stats.averageAccuracy}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Accuracy
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-500">
                      {stats.longestStreak}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Longest Streak
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500">
                      {Object.keys(reviewState.cards).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cards in Library
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
