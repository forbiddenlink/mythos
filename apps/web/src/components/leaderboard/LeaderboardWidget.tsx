'use client';

import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { LeaderboardContext } from '@/providers/leaderboard-provider';
import { ProgressContext } from '@/providers/progress-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, ChevronRight, Crown, TrendingUp } from 'lucide-react';

export function LeaderboardWidget() {
  const leaderboardContext = useContext(LeaderboardContext);
  const progressContext = useContext(ProgressContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
  }, []);

  // Sync progress to leaderboard
  useEffect(() => {
    if (mounted && leaderboardContext && progressContext) {
      leaderboardContext.syncFromProgress({
        totalXP: progressContext.progress.totalXP,
        quickQuizHighScore: progressContext.progress.quickQuizHighScore,
        achievementsCount: progressContext.progress.achievements.length,
        dailyStreak: progressContext.progress.dailyStreak,
      });
    }
  }, [
    mounted,
    leaderboardContext,
    progressContext,
    progressContext?.progress.totalXP,
    progressContext?.progress.quickQuizHighScore,
    progressContext?.progress.achievements.length,
    progressContext?.progress.dailyStreak,
  ]);

  if (!mounted || !leaderboardContext || !progressContext) {
    return null;
  }

  const { getRankings, getUserRank, currentEntry, entries } = leaderboardContext;
  const xpRank = getUserRank('xp');
  const topThree = getRankings('xp').slice(0, 3);

  // Don't show if no entries
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-linear-to-b from-background to-midnight/5">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="border-gold/20 bg-card/50 backdrop-blur-sm overflow-hidden">
          {/* Decorative header bar */}
          <div className="h-1 bg-linear-to-r from-gold via-amber-400 to-gold" />

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold/20 border border-gold/30">
                  <Trophy className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Leaderboard</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compete with other explorers
                  </p>
                </div>
              </div>

              <Button asChild variant="outline" className="border-gold/30 hover:bg-gold/10">
                <Link href="/leaderboard">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Your ranking */}
            {currentEntry && (
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold/20">
                      <TrendingUp className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Rank</p>
                      <p className="font-semibold text-gold text-lg">
                        #{xpRank} of {entries.length}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your XP</p>
                    <p className="font-semibold text-foreground text-lg flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold" />
                      {currentEntry.totalXP.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-1">Top Explorers</h3>
              {topThree.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.id === leaderboardContext.currentUserId;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentUser
                        ? 'bg-gold/10 border-gold/30'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          rank === 1
                            ? 'bg-yellow-500/20'
                            : rank === 2
                              ? 'bg-slate-400/20'
                              : 'bg-amber-600/20'
                        }`}
                      >
                        <Crown
                          className={`h-4 w-4 ${
                            rank === 1
                              ? 'text-yellow-500'
                              : rank === 2
                                ? 'text-slate-400'
                                : 'text-amber-600'
                          }`}
                        />
                      </div>
                      <span className={isCurrentUser ? 'text-gold font-medium' : 'font-medium'}>
                        {entry.nickname}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                          You
                        </Badge>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums text-muted-foreground">
                      {entry.totalXP.toLocaleString()} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
