'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Clock, Trophy, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { InteractiveStory } from '@/components/stories/InteractiveStory';
import { BranchingStory, getDiscoveredEndings } from '@/lib/branching-story';
import branchingStoriesData from '@/data/branching-stories.json';
import { useState, useEffect } from 'react';

const branchingStories = branchingStoriesData as unknown as BranchingStory[];

export default function InteractiveStoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [isStarted, setIsStarted] = useState(false);
  const [discoveredCount, setDiscoveredCount] = useState(0);

  const story = branchingStories.find((s) => s.slug === slug);

  useEffect(() => {
    if (story) {
      const discovered = getDiscoveredEndings(story.id);
      setDiscoveredCount(discovered.length);
      // Auto-start if there's saved progress
      if (discovered.length > 0) {
        setIsStarted(true);
      }
    }
  }, [story]);

  if (!story) {
    return (
      <div className="min-h-screen bg-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-parchment">Story Not Found</h2>
            <p className="text-parchment/60 mt-2">
              The interactive story you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/stories" className="text-gold hover:underline mt-4 inline-block">
              View all stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Badge className="bg-gold/20 text-gold border-gold/30 gap-1">
              <BookOpen className="h-3 w-3" />
              Interactive Story
            </Badge>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 text-parchment">
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-parchment/60">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {story.protagonist}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {story.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {story.totalEndings} endings
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs />

        <div className="mt-8">
          {!isStarted ? (
            <Card className="border-gold/20 bg-midnight-light/50 overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-parchment">
                  Begin Your Journey
                </CardTitle>
                <CardDescription className="text-lg text-parchment/70 max-w-2xl mx-auto">
                  {story.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Story info cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-midnight/50 rounded-lg border border-gold/10 text-center">
                    <User className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-parchment/60">Playing As</p>
                    <p className="text-parchment font-medium">{story.protagonist}</p>
                  </div>
                  <div className="p-4 bg-midnight/50 rounded-lg border border-gold/10 text-center">
                    <Clock className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-parchment/60">Estimated Time</p>
                    <p className="text-parchment font-medium">{story.estimatedTime}</p>
                  </div>
                  <div className="p-4 bg-midnight/50 rounded-lg border border-gold/10 text-center">
                    <Trophy className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-parchment/60">Total Endings</p>
                    <p className="text-parchment font-medium">
                      {discoveredCount > 0 ? (
                        <>
                          <span className="text-gold">{discoveredCount}</span> / {story.totalEndings} discovered
                        </>
                      ) : (
                        <>{story.totalEndings} to discover</>
                      )}
                    </p>
                  </div>
                </div>

                {/* How to play */}
                <div className="p-4 bg-midnight/30 rounded-lg border border-gold/10">
                  <h3 className="text-gold font-semibold mb-2">How to Play</h3>
                  <ul className="space-y-2 text-sm text-parchment/70">
                    <li className="flex items-start gap-2">
                      <span className="text-gold">1.</span>
                      Read each scene and make your choice
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">2.</span>
                      Your choices shape the story and lead to different endings
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">3.</span>
                      Replay to discover all {story.totalEndings} endings
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold">4.</span>
                      Your progress is saved automatically
                    </li>
                  </ul>
                </div>

                {/* Start button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button
                    onClick={() => setIsStarted(true)}
                    variant="gold"
                    size="lg"
                    className="gap-2 min-w-[200px]"
                  >
                    <BookOpen className="h-5 w-5" />
                    {discoveredCount > 0 ? 'Continue Story' : 'Begin Story'}
                  </Button>
                  <Link href="/stories">
                    <Button variant="outline" size="lg" className="gap-2 border-gold/30 text-gold hover:bg-gold/10">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Stories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <InteractiveStory story={story} />
          )}
        </div>

        {/* Back navigation */}
        {isStarted && (
          <div className="flex justify-center pt-8">
            <Link href="/stories">
              <Button variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-gold/10">
                <ArrowLeft className="h-4 w-4" />
                Back to All Stories
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
