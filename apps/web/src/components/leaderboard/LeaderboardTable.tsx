'use client';

import { useContext } from 'react';
import { LeaderboardContext, type LeaderboardCategory, type LeaderboardEntry } from '@/providers/leaderboard-provider';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, Award, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  category: LeaderboardCategory;
  limit?: number;
}

const categoryLabels: Record<LeaderboardCategory, { label: string; icon: React.ReactNode; valueKey: keyof LeaderboardEntry }> = {
  xp: { label: 'Total XP', icon: <Star className="h-4 w-4" />, valueKey: 'totalXP' },
  quiz: { label: 'Quiz High Score', icon: <Trophy className="h-4 w-4" />, valueKey: 'quickQuizHighScore' },
  achievements: { label: 'Achievements', icon: <Award className="h-4 w-4" />, valueKey: 'achievementsUnlocked' },
  streak: { label: 'Longest Streak', icon: <Flame className="h-4 w-4" />, valueKey: 'longestStreak' },
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-muted-foreground font-mono w-5 text-center">{rank}</span>;
  }
}

function getRankBg(rank: number, isCurrentUser: boolean): string {
  if (isCurrentUser) {
    return 'bg-gold/10 border-gold/30';
  }
  switch (rank) {
    case 1:
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 2:
      return 'bg-slate-400/10 border-slate-400/30';
    case 3:
      return 'bg-amber-600/10 border-amber-600/30';
    default:
      return 'bg-card border-border';
  }
}

export function LeaderboardTable({ category, limit = 10 }: LeaderboardTableProps) {
  const context = useContext(LeaderboardContext);

  if (!context) {
    return null;
  }

  const { getRankings, currentUserId } = context;
  const rankings = getRankings(category).slice(0, limit);
  const { label, icon, valueKey } = categoryLabels[category];

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No entries yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
        <span>Rank</span>
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
      </div>

      {/* Entries */}
      {rankings.map((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = entry.id === currentUserId;
        const value = entry[valueKey];

        return (
          <div
            key={entry.id}
            className={cn(
              'flex items-center justify-between p-4 rounded-xl border transition-colors',
              getRankBg(rank, isCurrentUser)
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>
              <div>
                <span className={cn(
                  'font-medium',
                  isCurrentUser && 'text-gold'
                )}>
                  {entry.nickname}
                </span>
                {isCurrentUser && (
                  <Badge variant="outline" className="ml-2 text-xs border-gold/30 text-gold">
                    You
                  </Badge>
                )}
              </div>
            </div>
            <span className={cn(
              'font-semibold tabular-nums',
              rank === 1 && 'text-yellow-500',
              rank === 2 && 'text-slate-400',
              rank === 3 && 'text-amber-600',
              isCurrentUser && 'text-gold'
            )}>
              {typeof value === 'number' ? value.toLocaleString() : value}
              {category === 'streak' && <span className="text-muted-foreground font-normal ml-1">days</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
