'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Flame, Target, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewSession } from '@/components/review/ReviewSession';
import { useReview } from '@/providers/review-provider';
import { useEffect, useState } from 'react';

export function ReviewPageClient() {
  const router = useRouter();
  const { reviewState, dueCount, generateCardsFromProgress, getTodayStats } = useReview();
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    generateCardsFromProgress();
  }, [generateCardsFromProgress]);

  const todayStats = getTodayStats();
  const { stats } = reviewState;

  const handleStartSession = () => {
    setIsSessionActive(true);
  };

  const handleSessionComplete = () => {
    setIsSessionActive(false);
    router.push('/');
  };

  if (isSessionActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 ring-1 ring-gold/30 mb-6">
            <Brain className="h-10 w-10 text-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
            Daily Review
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strengthen your mythology knowledge with spaced repetition. Review what you have learned
            to commit it to long-term memory.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Card className="border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-gold/10">
                  <Calendar className="h-5 w-5 text-gold" />
                </div>
              </div>
              <div className="text-2xl font-bold">{dueCount}</div>
              <div className="text-xs text-muted-foreground">Cards Due</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">{todayStats.reviewed}</div>
              <div className="text-xs text-muted-foreground">Reviewed Today</div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-gold/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-serif">
                {dueCount > 0
                  ? `You have ${dueCount} cards ready for review`
                  : 'All caught up!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8 space-y-6">
              {dueCount > 0 ? (
                <>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Review these cards now to strengthen your memory. The spaced repetition
                    algorithm will show you cards at optimal intervals for learning.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStartSession}
                    className="h-14 px-8 text-lg gap-3 bg-gold hover:bg-gold/90 text-black font-semibold"
                  >
                    <Brain className="h-5 w-5" />
                    Start Review Session
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Great job! You have reviewed all your due cards. Explore more content to
                    generate new review cards.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" variant="outline" className="gap-2">
                      <Link href="/deities">
                        Explore Deities
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="gap-2">
                      <Link href="/stories">
                        Read Stories
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Learn Content</h3>
                <p className="text-sm text-muted-foreground">
                  Explore deities, read stories, and discover mythology across pantheons.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Review Cards</h3>
                <p className="text-sm text-muted-foreground">
                  Test your memory with flashcards generated from content you have viewed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Strengthen Memory</h3>
                <p className="text-sm text-muted-foreground">
                  Cards you struggle with appear more often. Easy cards are spaced further apart.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Lifetime Stats */}
        {stats.totalReviewed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <Card className="border-border/60 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Your Learning Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gold">{stats.totalReviewed}</div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-500">{stats.averageAccuracy}%</div>
                    <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-500">{stats.longestStreak}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500">
                      {Object.keys(reviewState.cards).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Cards in Library</div>
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
