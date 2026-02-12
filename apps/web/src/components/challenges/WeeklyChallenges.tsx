'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Clock, Sparkles, CheckCircle2, Gift, ChevronRight } from 'lucide-react';
import challengesData from '@/data/challenges.json';
import deitiesData from '@/data/deities.json';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  pantheon: string | null;
  target: number;
  minScore?: number;
  xpReward: number;
  duration: string;
}

interface Deity {
  id: string;
  pantheonId: string;
}

interface WeeklyChallengesProps {
  deitiesViewed: string[];
  storiesRead: string[];
  quizScores: Record<string, number>;
  dailyStreak: number;
  claimedChallenges: string[];
  onClaimReward: (challengeId: string, xp: number) => void;
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
}

function getTimeRemaining(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const diff = endOfWeek.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  return `${hours}h left`;
}

function getWeeklyChallenges(): Challenge[] {
  // Select 3 challenges based on week number for variety
  const weekNum = getWeekNumber();
  const challenges = challengesData as Challenge[];

  // Rotate through challenges weekly
  const startIndex = (weekNum * 3) % challenges.length;
  const selected: Challenge[] = [];

  for (let i = 0; i < 3; i++) {
    selected.push(challenges[(startIndex + i) % challenges.length]);
  }

  return selected;
}

export function WeeklyChallenges({
  deitiesViewed,
  storiesRead,
  quizScores,
  dailyStreak,
  claimedChallenges,
  onClaimReward,
}: WeeklyChallengesProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    setMounted(true);
    setTimeRemaining(getTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const challenges = useMemo(() => getWeeklyChallenges(), []);
  const deities = deitiesData as Deity[];

  const calculateProgress = (challenge: Challenge): number => {
    switch (challenge.type) {
      case 'deity_view': {
        if (challenge.pantheon) {
          const pantheonDeities = deities.filter(d => d.pantheonId === challenge.pantheon);
          const viewed = pantheonDeities.filter(d => deitiesViewed.includes(d.id)).length;
          return Math.min(viewed, challenge.target);
        }
        return Math.min(deitiesViewed.length, challenge.target);
      }
      case 'story_read':
        return Math.min(storiesRead.length, challenge.target);
      case 'quiz_score': {
        const minScore = challenge.minScore || 80;
        const qualifyingScores = Object.values(quizScores).filter(s => s >= minScore);
        return Math.min(qualifyingScores.length, challenge.target);
      }
      case 'streak':
        return Math.min(dailyStreak, challenge.target);
      case 'pantheon_variety': {
        const viewedPantheons = new Set(
          deities.filter(d => deitiesViewed.includes(d.id)).map(d => d.pantheonId)
        );
        return Math.min(viewedPantheons.size, challenge.target);
      }
      default:
        return 0;
    }
  };

  if (!mounted) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="h-48 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" strokeWidth={1.5} />
            Weekly Challenges
          </CardTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeRemaining}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {challenges.map((challenge, index) => {
            const progress = calculateProgress(challenge);
            const isComplete = progress >= challenge.target;
            const isClaimed = claimedChallenges.includes(challenge.id);
            const percentage = (progress / challenge.target) * 100;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border transition-all duration-300 ${
                  isClaimed
                    ? 'bg-green-500/5 border-green-500/30'
                    : isComplete
                      ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/30'
                      : 'bg-card/50 border-border/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isClaimed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : isComplete ? (
                        <Gift className="h-4 w-4 text-purple-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h4 className={`font-semibold text-sm ${
                        isClaimed
                          ? 'text-green-500'
                          : isComplete
                            ? 'text-purple-500'
                            : 'text-foreground'
                      }`}>
                        {challenge.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {challenge.description}
                    </p>

                    {/* Progress bar */}
                    <div className="relative h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full ${
                          isClaimed
                            ? 'bg-green-500'
                            : isComplete
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                              : 'bg-gradient-to-r from-purple-500/60 to-indigo-500/60'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {progress} / {challenge.target}
                      </span>
                      <span className="text-xs text-purple-500/80 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {challenge.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {/* Claim button */}
                  {isComplete && !isClaimed && (
                    <Button
                      size="sm"
                      onClick={() => onClaimReward(challenge.id, challenge.xpReward)}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shrink-0"
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Claim
                    </Button>
                  )}
                </div>

                {/* Complete glow effect */}
                {isComplete && !isClaimed && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), transparent)',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
