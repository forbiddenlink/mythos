'use client';

import { motion } from 'framer-motion';
import { Flame, Sparkles, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import deitiesData from '@/data/deities.json';
import storiesData from '@/data/stories.json';

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  description: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
  summary: string;
}

const MILESTONE_STREAKS = [7, 30, 100, 365];

function getPantheonLabel(pantheonId: string): string {
  const labels: Record<string, string> = {
    'greek-pantheon': 'Greek',
    'norse-pantheon': 'Norse',
    'egyptian-pantheon': 'Egyptian',
    'roman-pantheon': 'Roman',
    'celtic-pantheon': 'Celtic',
    'hindu-pantheon': 'Hindu',
    'japanese-pantheon': 'Japanese',
    'chinese-pantheon': 'Chinese',
    'mesoamerican-pantheon': 'Mesoamerican',
    'mesopotamian-pantheon': 'Mesopotamian',
  };
  return labels[pantheonId] || 'Ancient';
}

export function StreakWidget() {
  const { progress, getStats } = useProgress();
  const stats = getStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if current streak is a milestone
  const isMilestone = MILESTONE_STREAKS.includes(stats.dailyStreak);
  const nextMilestone = MILESTONE_STREAKS.find(m => m > stats.dailyStreak) || 365;

  // Random "Mythology of the Day" selection - deity or story
  const dailySuggestion = useMemo(() => {
    if (!mounted) return null;

    // Use today's date as seed for consistent daily selection
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);

    // 50/50 chance of deity or story
    const isDeity = seed % 2 === 0;

    if (isDeity) {
      const deities = deitiesData as Deity[];
      // Filter out already viewed deities for variety
      const unviewedDeities = deities.filter(d => !progress.deitiesViewed.includes(d.id));
      const pool = unviewedDeities.length > 0 ? unviewedDeities : deities;
      const index = seed % pool.length;
      const deity = pool[index];
      return {
        type: 'deity' as const,
        item: deity,
        href: `/deities/${deity.slug}`,
        label: `${deity.name} - ${getPantheonLabel(deity.pantheonId)} ${deity.domain[0] || 'deity'}`,
        description: deity.description.slice(0, 100) + '...',
      };
    } else {
      const stories = storiesData as Story[];
      const unreadStories = stories.filter(s => !progress.storiesRead.includes(s.id));
      const pool = unreadStories.length > 0 ? unreadStories : stories;
      const index = seed % pool.length;
      const story = pool[index];
      return {
        type: 'story' as const,
        item: story,
        href: `/stories/${story.slug}`,
        label: `${story.title} - ${getPantheonLabel(story.pantheonId)}`,
        description: story.summary.slice(0, 100) + '...',
      };
    }
  }, [mounted, progress.deitiesViewed, progress.storiesRead]);

  // Don't render anything during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-mythic/30">
        <div className="container mx-auto max-w-4xl px-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-8">
              <div className="h-32 animate-pulse bg-muted rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-mythic/30">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="relative overflow-hidden border-gold/20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5" />

          {/* Milestone celebration overlay */}
          {isMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: `${20 + Math.random() * 60}%`,
                    y: `${20 + Math.random() * 60}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-gold" />
                </motion.div>
              ))}
            </motion.div>
          )}

          <CardContent className="relative p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Streak Display */}
              <div className="flex flex-col items-center text-center lg:text-left lg:items-start">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={isMilestone ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: isMilestone ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                  >
                    <Flame
                      className={`w-10 h-10 ${
                        stats.dailyStreak >= 30
                          ? 'text-orange-500'
                          : stats.dailyStreak >= 7
                            ? 'text-amber-500'
                            : 'text-gold'
                      }`}
                      fill="currentColor"
                    />
                  </motion.div>
                  <div>
                    <motion.span
                      key={stats.dailyStreak}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-bold font-serif text-gold"
                    >
                      {stats.dailyStreak}
                    </motion.span>
                    <span className="text-lg text-muted-foreground ml-1">
                      day{stats.dailyStreak !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                  {isMilestone ? 'Milestone Achieved!' : 'Daily Streak'}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {stats.dailyStreak === 0
                    ? 'Start your mythology journey today!'
                    : stats.dailyStreak === 1
                      ? 'Great start! Keep exploring tomorrow.'
                      : isMilestone
                        ? `Incredible! You've reached ${stats.dailyStreak} days!`
                        : `${nextMilestone - stats.dailyStreak} days until your next milestone`
                  }
                </p>

                {/* Quick stats */}
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{stats.totalDeitiesViewed} deities</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{stats.totalStoriesRead} stories</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="lg:hidden w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Mythology of the Day */}
              {dailySuggestion && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-gold uppercase tracking-wide">
                      Mythology of the Day
                    </span>
                  </div>

                  <h4 className="font-serif font-semibold text-lg text-foreground mb-2">
                    {dailySuggestion.label}
                  </h4>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {dailySuggestion.description}
                  </p>

                  <Button asChild variant="outline" size="sm" className="border-gold/40 hover:border-gold/60 hover:bg-gold/10">
                    <Link href={dailySuggestion.href}>
                      {dailySuggestion.type === 'deity' ? 'Meet this Deity' : 'Read this Story'}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
