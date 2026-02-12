'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Brain, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import deitiesData from '@/data/deities.json';
import storiesData from '@/data/stories.json';

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
}

interface ContentView {
  id: string;
  viewedAt: string; // ISO date
}

interface KnowledgeDecayProps {
  contentViews: ContentView[];
  deitiesViewed: string[];
  storiesRead: string[];
}

const DECAY_THRESHOLD_DAYS = 30;
const WARNING_THRESHOLD_DAYS = 21;

function getDaysSinceView(viewedAt: string): number {
  const viewDate = new Date(viewedAt);
  const now = new Date();
  const diffTime = now.getTime() - viewDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getDecayLevel(days: number): 'fresh' | 'fading' | 'decayed' {
  if (days >= DECAY_THRESHOLD_DAYS) return 'decayed';
  if (days >= WARNING_THRESHOLD_DAYS) return 'fading';
  return 'fresh';
}

function getDecayColor(level: 'fresh' | 'fading' | 'decayed'): string {
  switch (level) {
    case 'decayed':
      return 'text-orange-500';
    case 'fading':
      return 'text-amber-500';
    default:
      return 'text-green-500';
  }
}

function getDecayBgColor(level: 'fresh' | 'fading' | 'decayed'): string {
  switch (level) {
    case 'decayed':
      return 'bg-orange-500/10 border-orange-500/30';
    case 'fading':
      return 'bg-amber-500/10 border-amber-500/30';
    default:
      return 'bg-green-500/10 border-green-500/30';
  }
}

interface DecayingContent {
  id: string;
  name: string;
  slug: string;
  type: 'deity' | 'story';
  daysSinceView: number;
  level: 'fresh' | 'fading' | 'decayed';
}

export function KnowledgeDecay({
  contentViews,
  deitiesViewed,
  storiesRead,
}: KnowledgeDecayProps) {
  const deities = deitiesData as Deity[];
  const stories = storiesData as Story[];

  const decayingContent = useMemo(() => {
    const viewMap = new Map(contentViews.map(v => [v.id, v.viewedAt]));
    const result: DecayingContent[] = [];

    // Check deities
    for (const deityId of deitiesViewed) {
      const deity = deities.find(d => d.id === deityId);
      if (!deity) continue;

      const viewedAt = viewMap.get(deityId);
      if (!viewedAt) continue;

      const days = getDaysSinceView(viewedAt);
      const level = getDecayLevel(days);

      if (level !== 'fresh') {
        result.push({
          id: deity.id,
          name: deity.name,
          slug: deity.slug,
          type: 'deity',
          daysSinceView: days,
          level,
        });
      }
    }

    // Check stories
    for (const storyId of storiesRead) {
      const story = stories.find(s => s.id === storyId);
      if (!story) continue;

      const viewedAt = viewMap.get(storyId);
      if (!viewedAt) continue;

      const days = getDaysSinceView(viewedAt);
      const level = getDecayLevel(days);

      if (level !== 'fresh') {
        result.push({
          id: story.id,
          name: story.title,
          slug: story.slug,
          type: 'story',
          daysSinceView: days,
          level,
        });
      }
    }

    // Sort by decay level (most urgent first), then by days
    return result.sort((a, b) => {
      const levelOrder = { decayed: 0, fading: 1, fresh: 2 };
      if (levelOrder[a.level] !== levelOrder[b.level]) {
        return levelOrder[a.level] - levelOrder[b.level];
      }
      return b.daysSinceView - a.daysSinceView;
    });
  }, [contentViews, deitiesViewed, storiesRead, deities, stories]);

  const decayedCount = decayingContent.filter(c => c.level === 'decayed').length;
  const fadingCount = decayingContent.filter(c => c.level === 'fading').length;

  if (decayingContent.length === 0) {
    return null; // Don't show if no decaying content
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-orange-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-orange-500" strokeWidth={1.5} />
          Knowledge Refresh
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Content you haven&apos;t revisited in a while
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <div className="text-sm">
            <span className="font-medium">
              {decayedCount > 0 && (
                <span className="text-orange-500">{decayedCount} faded</span>
              )}
              {decayedCount > 0 && fadingCount > 0 && ' and '}
              {fadingCount > 0 && (
                <span className="text-amber-500">{fadingCount} fading</span>
              )}
            </span>
            <span className="text-muted-foreground"> memories need refreshing</span>
          </div>
        </div>

        {/* Decaying content list - show top 5 */}
        <div className="space-y-2">
          {decayingContent.slice(0, 5).map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${getDecayBgColor(content.level)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  content.level === 'decayed' ? 'bg-orange-500' : 'bg-amber-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{content.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{content.daysSinceView} days ago</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span className="capitalize">{content.type}</span>
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                variant="ghost"
                className={`${getDecayColor(content.level)} hover:bg-${content.level === 'decayed' ? 'orange' : 'amber'}-500/10`}
              >
                <Link href={`/${content.type === 'deity' ? 'deities' : 'stories'}/${content.slug}`}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {decayingContent.length > 5 && (
          <p className="text-xs text-center text-muted-foreground">
            +{decayingContent.length - 5} more items need refreshing
          </p>
        )}
      </CardContent>
    </Card>
  );
}
