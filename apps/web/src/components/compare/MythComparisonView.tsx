'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, X, Sparkles, BookText, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Story, MythComparison } from '@/lib/myth-comparison';
import { isSharedTheme } from '@/lib/myth-comparison';

interface MythComparisonViewProps {
  stories: Story[];
  comparison: MythComparison | null;
  onRemove: (id: string) => void;
  pantheonMap: Map<string, string>;
}

export function MythComparisonView({
  stories,
  comparison,
  onRemove,
  pantheonMap,
}: MythComparisonViewProps) {
  const getPantheonName = (pantheonId: string) => {
    return pantheonMap.get(pantheonId) ||
      pantheonId.replace('-pantheon', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  };

  // Identify shared themes for highlighting
  const sharedThemes = useMemo(() => {
    if (stories.length < 2) return new Set<string>();

    const themeCounts = new Map<string, number>();
    stories.forEach(story => {
      story.moralThemes.forEach(theme => {
        const key = theme.toLowerCase();
        themeCounts.set(key, (themeCounts.get(key) || 0) + 1);
      });
    });

    return new Set(
      Array.from(themeCounts.entries())
        .filter(([, count]) => count >= 2)
        .map(([theme]) => theme)
    );
  }, [stories]);

  if (stories.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-lg">
          Select myths above to start comparing
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Choose 2-3 stories to see how they compare across cultures
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Shared Themes Legend */}
      {comparison && comparison.commonThemes.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            Common Themes Across Stories
          </h3>
          <div className="flex flex-wrap gap-2">
            {comparison.commonThemes.map(theme => (
              <Badge
                key={theme}
                className="bg-gold text-midnight border-gold capitalize"
              >
                {theme}
              </Badge>
            ))}
          </div>
          {comparison.similarityScore > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Similarity score: {Math.round(comparison.similarityScore * 100)}%
            </p>
          )}
        </div>
      )}

      {/* Story Cards Grid */}
      <div
        className={cn(
          'grid gap-6',
          stories.length === 1 && 'grid-cols-1 max-w-2xl mx-auto',
          stories.length === 2 && 'grid-cols-1 lg:grid-cols-2',
          stories.length >= 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {stories.map(story => (
          <StoryCard
            key={story.id}
            story={story}
            onRemove={onRemove}
            sharedThemes={sharedThemes}
            pantheonName={getPantheonName(story.pantheonId)}
          />
        ))}
      </div>

      {/* Key Differences Section */}
      {comparison && comparison.differences.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-semibold flex items-center gap-2">
            <BookText className="h-5 w-5 text-gold" />
            Key Differences
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comparison.differences.map(diff => (
              <Card key={diff.aspect} className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {diff.aspect}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diff.descriptions.map(desc => (
                      <li key={desc.storyId} className="text-sm">
                        <span className="font-medium text-gold">
                          {desc.storyTitle}:
                        </span>{' '}
                        <span className="text-muted-foreground line-clamp-2">
                          {desc.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Context Section */}
      {comparison && comparison.culturalContext.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-gold" />
            Cultural Significance
          </h3>
          <div className="space-y-4">
            {comparison.culturalContext.map(context => (
              <Card key={context.storyId} className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{context.storyTitle}</span>
                    <Badge variant="outline" className="text-xs">
                      {getPantheonName(context.pantheonId)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {context.significance}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StoryCardProps {
  story: Story;
  onRemove: (id: string) => void;
  sharedThemes: Set<string>;
  pantheonName: string;
}

function StoryCard({ story, onRemove, sharedThemes, pantheonName }: StoryCardProps) {
  return (
    <Card className="h-full flex flex-col relative group">
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onRemove(story.id)}
        aria-label={`Remove ${story.title} from comparison`}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4">
        {/* Image */}
        {story.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gold/20 shadow-sm mb-4">
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Title and Pantheon */}
        <div>
          <CardTitle className="text-xl">
            <Link
              href={`/stories/${story.slug}`}
              className="hover:text-gold transition-colors"
            >
              {story.title}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-primary/10 border-primary/20">
              {pantheonName}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {story.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Summary
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {story.summary}
          </p>
        </div>

        {/* Key Excerpts */}
        {story.keyExcerpts && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              Key Elements
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {story.keyExcerpts}
            </p>
          </div>
        )}

        {/* Themes */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Themes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {story.moralThemes.map(theme => {
              const isShared = sharedThemes.has(theme.toLowerCase());
              return (
                <Badge
                  key={theme}
                  variant={isShared ? 'default' : 'outline'}
                  className={cn(
                    'capitalize',
                    isShared && 'bg-gold text-midnight border-gold'
                  )}
                >
                  {theme}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Sources */}
        {story.citationSources && story.citationSources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              Primary Sources
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {story.citationSources.slice(0, 2).map((source, idx) => (
                <li key={idx}>
                  {source.author ? `${source.author}, ` : ''}
                  <span className="italic">{source.title}</span>
                  {source.lines && ` (lines ${source.lines})`}
                  {source.chapters && ` (ch. ${source.chapters})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
