'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ScrollText, Calendar } from 'lucide-react';
import deities from '@/data/deities.json';
import stories from '@/data/stories.json';

type CardType = 'deity' | 'story';

interface DailyContent {
  type: CardType;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  badge: string;
}

// Deterministic "random" based on date - same card for everyone all day
function getDailyIndex(date: Date, arrayLength: number): number {
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + (dateString.codePointAt(i) ?? 0);
    hash = hash & hash;
  }
  return Math.abs(hash) % arrayLength;
}

function getDailyContent(): DailyContent {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  // Alternate between deities and stories
  const type: CardType = dayOfYear % 2 === 0 ? 'deity' : 'story';

  if (type === 'deity') {
    const index = getDailyIndex(today, deities.length);
    const deity = deities[index];
    return {
      type: 'deity',
      id: deity.id,
      title: deity.name,
      subtitle: deity.domain?.slice(0, 3).join(', ') || 'Divine Being',
      description: deity.description?.slice(0, 150) + '...' || 'A deity from ancient mythology.',
      href: `/deities/${deity.slug}`,
      badge: deity.pantheonId.replace('-pantheon', '').replaceAll('-', ' '),
    };
  } else {
    const index = getDailyIndex(today, stories.length);
    const story = stories[index];
    return {
      type: 'story',
      id: story.id,
      title: story.title,
      subtitle: story.themes?.slice(0, 3).join(', ') || 'Epic Tale',
      description: story.summary?.slice(0, 150) + '...' || 'An ancient story.',
      href: `/stories/${story.slug}`,
      badge: story.pantheonId.replace('-pantheon', '').replaceAll('-', ' '),
    };
  }
}

export function DailyCard() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
    setContent(getDailyContent());
  }, []);

  if (!mounted || !content) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const Icon = content.type === 'deity' ? Sparkles : ScrollText;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-serif font-semibold text-foreground">Today&apos;s Mythology</h2>
      </div>

      <Link href={content.href} className="block group">
        <Card className="card-elevated bg-linear-to-br from-card via-card to-gold/5 border-gold/20 hover:border-gold/40 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/20 transition-colors">
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs capitalize border-gold/30 text-gold mb-1">
                    {content.badge}
                  </Badge>
                  <CardTitle className="text-xl group-hover:text-gold transition-colors">
                    {content.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{content.subtitle}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{content.description}</p>
            <p className="text-sm text-gold mt-3 group-hover:underline">Read more &rarr;</p>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
}
