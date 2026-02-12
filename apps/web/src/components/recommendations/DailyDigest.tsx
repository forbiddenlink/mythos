'use client';

import { useRecommendations } from '@/hooks/use-recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DailyDigestProps {
  className?: string;
  compact?: boolean;
}

export function DailyDigest({ className = '', compact = false }: DailyDigestProps) {
  const { dailyDigest } = useRecommendations();

  if (!dailyDigest.deity && !dailyDigest.story) {
    return null;
  }

  const formattedDate = new Date(dailyDigest.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-gold/5 to-amber-500/5 border-gold/20 ${className}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">Daily Myth</span>
          </div>
          {dailyDigest.deity && (
            <Link href={`/deities/${dailyDigest.deity.slug}`} className="group block">
              <div className="flex items-center gap-3">
                {dailyDigest.deity.imageUrl && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold/30">
                    <Image
                      src={dailyDigest.deity.imageUrl}
                      alt={dailyDigest.deity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold truncate group-hover:text-gold transition-colors">
                    {dailyDigest.deity.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {dailyDigest.deity.domain.slice(0, 2).join(', ')}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <section className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gold" />
        <h2 className="font-serif text-2xl font-bold">Daily Myth Digest</h2>
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {formattedDate}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Deity */}
        {dailyDigest.deity && (
          <Link href={`/deities/${dailyDigest.deity.slug}`}>
            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden bg-gradient-to-br from-gold/5 to-amber-500/5 border-gold/20">
              <div className="relative">
                {dailyDigest.deity.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={dailyDigest.deity.imageUrl}
                      alt={dailyDigest.deity.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gold/90 text-white border-0">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Deity of the Day
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-serif text-2xl font-bold text-white mb-1">
                        {dailyDigest.deity.name}
                      </h3>
                      {dailyDigest.deity.alternateNames && dailyDigest.deity.alternateNames.length > 0 && (
                        <p className="text-white/80 text-sm">
                          Also known as {dailyDigest.deity.alternateNames.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {!dailyDigest.deity.imageUrl && (
                  <CardHeader>
                    <Badge className="bg-gold/90 text-white border-0 w-fit mb-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Deity of the Day
                    </Badge>
                    <CardTitle className="font-serif text-2xl group-hover:text-gold transition-colors">
                      {dailyDigest.deity.name}
                    </CardTitle>
                    {dailyDigest.deity.alternateNames && dailyDigest.deity.alternateNames.length > 0 && (
                      <CardDescription>
                        Also known as {dailyDigest.deity.alternateNames.slice(0, 2).join(', ')}
                      </CardDescription>
                    )}
                  </CardHeader>
                )}
                <CardContent className={dailyDigest.deity.imageUrl ? 'pt-4' : ''}>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {dailyDigest.deity.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dailyDigest.deity.domain.slice(0, 3).map((d) => (
                      <Badge key={d} variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        {/* Featured Story */}
        {dailyDigest.story && (
          <Link href={`/stories/${dailyDigest.story.slug}`}>
            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border-teal-500/20">
              <div className="relative">
                {dailyDigest.story.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={dailyDigest.story.imageUrl}
                      alt={dailyDigest.story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-teal-600/90 text-white border-0">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Story of the Day
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-serif text-2xl font-bold text-white mb-1">
                        {dailyDigest.story.title}
                      </h3>
                      <Badge variant="outline" className="border-white/50 text-white/90 text-xs">
                        {dailyDigest.story.category}
                      </Badge>
                    </div>
                  </div>
                )}
                {!dailyDigest.story.imageUrl && (
                  <CardHeader>
                    <Badge className="bg-teal-600/90 text-white border-0 w-fit mb-2">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Story of the Day
                    </Badge>
                    <CardTitle className="font-serif text-2xl group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {dailyDigest.story.title}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="text-xs">
                        {dailyDigest.story.category}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                )}
                <CardContent className={dailyDigest.story.imageUrl ? 'pt-4' : ''}>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {dailyDigest.story.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dailyDigest.story.moralThemes.slice(0, 3).map((theme) => (
                      <Badge key={theme} variant="secondary" className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20 text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}
      </div>
    </section>
  );
}
