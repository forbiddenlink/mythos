'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RefreshCw,
  ArrowRight,
  Flame,
  Target,
  CheckCircle2,
  XCircle,
  Brain,
  Sparkles,
} from 'lucide-react';
import { FlashCard } from './FlashCard';
import { useReview } from '@/providers/review-provider';
import type { DifficultyRating, ReviewCard } from '@/lib/spaced-repetition';

interface ReviewSessionProps {
  onComplete?: () => void;
}

export function ReviewSession({ onComplete }: ReviewSessionProps) {
  const {
    dueCards,
    dueCount,
    reviewCard,
    generateCardsFromProgress,
    getTodayStats,
    reviewState,
  } = useReview();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState<ReviewCard[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Initialize session with due cards
  useEffect(() => {
    generateCardsFromProgress();
  }, [generateCardsFromProgress]);

  // Set session cards when due cards are loaded
  useEffect(() => {
    if (dueCards.length > 0 && sessionCards.length === 0) {
      setSessionCards([...dueCards]);
    }
  }, [dueCards, sessionCards.length]);

  const currentCard = sessionCards[currentIndex];
  const progress = sessionCards.length > 0
    ? ((currentIndex) / sessionCards.length) * 100
    : 0;

  const handleRate = (rating: DifficultyRating) => {
    if (!currentCard) return;

    // Track session stats
    const isCorrect = rating >= 3;
    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Update the card in the review system
    reviewCard(currentCard.id, rating);

    // Move to next card or complete session
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionCards([]);
    setSessionComplete(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    generateCardsFromProgress();
  };

  const todayStats = getTodayStats();
  const accuracy = sessionStats.correct + sessionStats.incorrect > 0
    ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
    : 0;

  // No cards to review
  if (sessionCards.length === 0 && !sessionComplete) {
    return (
      <Card className="max-w-lg mx-auto border-gold/20 shadow-xl">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 w-fit ring-1 ring-emerald-500/30">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-serif">All Caught Up!</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-8 space-y-6">
          <p className="text-muted-foreground">
            You have no cards due for review right now. Great job staying on top of your learning!
          </p>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              To get more review cards, explore more deities and read more stories on Mythos Atlas.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </Button>
            {onComplete && (
              <Button onClick={onComplete} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Back to Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Session complete
  if (sessionComplete) {
    return (
      <Card className="max-w-lg mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />

        <CardHeader className="text-center pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner"
          >
            <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
          </motion.div>
          <CardTitle className="text-3xl font-serif">Session Complete!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pb-8">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-gold mb-2 tracking-tight">
              {sessionStats.correct}/{sessionCards.length}
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              {accuracy}% Accuracy
            </p>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
              <div className="font-bold text-lg text-emerald-400">{sessionStats.correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <div className="font-bold text-lg text-red-400">{sessionStats.incorrect}</div>
              <div className="text-xs text-muted-foreground">To Review</div>
            </div>
            <div className="p-3 rounded-lg bg-gold/10 border border-gold/20">
              <Flame className="h-5 w-5 text-gold mx-auto mb-1" />
              <div className="font-bold text-lg text-gold">{reviewState.stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="text-center max-w-sm mx-auto">
            {accuracy >= 80 ? (
              <p className="text-lg text-muted-foreground">
                Outstanding memory! The ancient scholars would be proud.
              </p>
            ) : accuracy >= 60 ? (
              <p className="text-lg text-muted-foreground">
                Good work! Keep practicing to master these myths.
              </p>
            ) : (
              <p className="text-lg text-muted-foreground">
                Every review strengthens your knowledge. Keep at it!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRestart}
              className="w-full h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
            >
              <RefreshCw className="h-5 w-5" />
              Review Again
            </Button>
            {onComplete && (
              <Button
                variant="outline"
                onClick={onComplete}
                className="w-full gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active review session
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Card {currentIndex + 1} of {sessionCards.length}
          </span>
          <Progress
            value={progress}
            className="h-1.5 w-32"
            aria-label="Review progress"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Today's Stats */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {todayStats.reviewed} today
            </span>
          </div>

          {/* Streak */}
          {reviewState.stats.currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium">
              <Flame className="h-3.5 w-3.5" />
              <span>{reviewState.stats.currentStreak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Flash Card */}
      <AnimatePresence mode="wait">
        {currentCard && (
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            <FlashCard
              card={currentCard}
              onRate={handleRate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Stats */}
      <div className="flex justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{sessionStats.correct} correct</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>{sessionStats.incorrect} to review</span>
        </div>
      </div>
    </div>
  );
}
