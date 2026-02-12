'use client';

import { useContext, useMemo } from 'react';
import { ProgressContext, type ProgressContextValue } from '@/providers/progress-provider';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LearningPathCard } from '@/components/learning/LearningPathCard';
import {
  extractUserPreferences,
  generatePersonalizedPaths,
  generateLearningPath,
  type Deity,
  type Story,
} from '@/lib/recommendations';
import deitiesData from '@/data/deities.json';
import storiesData from '@/data/stories.json';
import pantheonsData from '@/data/pantheons.json';
import {
  GraduationCap,
  Compass,
  Sparkles,
  Target,
} from 'lucide-react';

// Cast data to proper types
const allDeities = deitiesData as Deity[];
const allStories = storiesData as Story[];
const allPantheons = pantheonsData as { id: string; name: string }[];

// Custom hook for using the progress context
function useProgress(): ProgressContextValue | null {
  return useContext(ProgressContext);
}

export default function LearningPathsPage() {
  const progressContext = useProgress();
  const progress = progressContext?.progress;

  // Generate learning paths based on user progress
  const paths = useMemo(() => {
    const prefs = extractUserPreferences(
      progress?.deitiesViewed || [],
      progress?.storiesRead || [],
      allDeities,
      allStories
    );

    const personalizedPaths = generatePersonalizedPaths(prefs, allDeities, allStories);

    // If user hasn't explored much, suggest a Norse path as alternative
    if (personalizedPaths.length < 4 && !prefs.favoritePantheons.includes('norse-pantheon')) {
      const norsePath = generateLearningPath(prefs, 'pantheon-mastery', allDeities, allStories, {
        pantheonId: 'norse-pantheon',
      });
      // Only add if different from existing paths
      if (!personalizedPaths.some(p => p.id === norsePath.id)) {
        personalizedPaths.push(norsePath);
      }
    }

    return personalizedPaths;
  }, [progress?.deitiesViewed, progress?.storiesRead]);

  // Separate active and available paths
  const activePaths = paths.filter((p) => p.progress > 0 && p.progress < 100);
  const completedPaths = paths.filter((p) => p.progress === 100);
  const availablePaths = paths.filter((p) => p.progress === 0);

  const hasProgress = (progress?.deitiesViewed?.length || 0) > 0 || (progress?.storiesRead?.length || 0) > 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-midnight via-midnight/95 to-mythic py-16 md:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative p-4 rounded-xl border border-purple-500/20 bg-midnight/50 backdrop-blur-sm">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent" />
                <GraduationCap className="relative h-10 w-10 text-purple-400" strokeWidth={1.5} />
              </div>
            </div>
            <span className="inline-block text-purple-400/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
              Personalized Learning
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-parchment">
              Learning Paths
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {hasProgress
                ? 'Continue your journey with personalized paths based on your interests and progress.'
                : 'Choose a path to begin your mythological journey. Each path is designed to guide you through the rich tapestry of ancient myths.'}
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-purple-500/50" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500/40" />
            </div>
          </div>

          {/* Quick stats */}
          {hasProgress && (
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-parchment">{activePaths.length}</p>
                <p className="text-sm text-slate-400">Active Paths</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-parchment">{completedPaths.length}</p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-parchment">{availablePaths.length}</p>
                <p className="text-sm text-slate-400">Available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        {/* Active Paths */}
        {activePaths.length > 0 && (
          <section className="mt-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Continue Learning
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pick up where you left off
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePaths.map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          </section>
        )}

        {/* Available Paths */}
        {availablePaths.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Compass className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {hasProgress ? 'Explore New Paths' : 'Choose Your Path'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasProgress
                    ? 'Based on your interests, we recommend these paths'
                    : 'Each path offers a unique journey through mythology'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePaths.map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Paths */}
        {completedPaths.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Completed Paths
                </h2>
                <p className="text-sm text-muted-foreground">
                  You've mastered these paths
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedPaths.map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          </section>
        )}

        {/* Path type descriptions for new users */}
        {!hasProgress && (
          <section className="mt-12 pt-12 border-t border-border">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 text-center">
              How Learning Paths Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose a Path</h3>
                <p className="text-sm text-muted-foreground">
                  Select from pantheon mastery, domain expertise, or story-focused paths
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="font-semibold mb-2">Follow the Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Each path guides you through deities, stories, and quizzes
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Your progress is saved automatically as you explore
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">4</span>
                </div>
                <h3 className="font-semibold mb-2">Unlock Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Complete paths to earn XP and unlock special achievements
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
