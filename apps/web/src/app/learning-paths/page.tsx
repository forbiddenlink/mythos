"use client";

import { useContext, useMemo } from "react";
import {
  ProgressContext,
  type ProgressContextValue,
} from "@/providers/progress-provider";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { LearningPathCard } from "@/components/learning/LearningPathCard";
import {
  extractUserPreferences,
  generatePersonalizedPaths,
  generateLearningPath,
  type Deity,
  type Story,
} from "@/lib/recommendations";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import pantheonsData from "@/data/pantheons.json";
import { Compass, Sparkles, Target } from "lucide-react";

// Cast data to proper types
const allDeities = deitiesData as Deity[];
const allStories = storiesData as Story[];
const _allPantheons = pantheonsData as { id: string; name: string }[];

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
      allStories,
    );

    const personalizedPaths = generatePersonalizedPaths(
      prefs,
      allDeities,
      allStories,
    );

    // If user hasn't explored much, suggest a Norse path as alternative
    if (
      personalizedPaths.length < 4 &&
      !prefs.favoritePantheons.includes("norse-pantheon")
    ) {
      const norsePath = generateLearningPath(
        prefs,
        "pantheon-mastery",
        allDeities,
        allStories,
        {
          pantheonId: "norse-pantheon",
        },
      );
      // Only add if different from existing paths
      if (!personalizedPaths.some((p) => p.id === norsePath.id)) {
        personalizedPaths.push(norsePath);
      }
    }

    return personalizedPaths;
  }, [progress?.deitiesViewed, progress?.storiesRead]);

  // Separate active and available paths
  const activePaths = paths.filter((p) => p.progress > 0 && p.progress < 100);
  const completedPaths = paths.filter((p) => p.progress === 100);
  const availablePaths = paths.filter((p) => p.progress === 0);

  const hasProgress =
    (progress?.deitiesViewed?.length || 0) > 0 ||
    (progress?.storiesRead?.length || 0) > 0;

  return (
    <div className="min-h-screen">
      <PageHero
        mark="torch"
        tagline="Personalized Learning"
        title="Learning Paths"
        description={
          hasProgress
            ? "Continue where you left off with paths tailored to your interests and progress."
            : "Choose a focused path through mythology—from Greek heroes to Norse cosmology to Egyptian afterlife beliefs."
        }
        minHeight="min-h-[40vh]"
      >
        {hasProgress ? (
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-parchment">
                {activePaths.length}
              </p>
              <p className="text-sm text-parchment/50">Active Paths</p>
            </div>
            <div className="w-px h-10 bg-gold/20" />
            <div>
              <p className="text-2xl font-bold text-parchment">
                {completedPaths.length}
              </p>
              <p className="text-sm text-parchment/50">Completed</p>
            </div>
            <div className="w-px h-10 bg-gold/20" />
            <div>
              <p className="text-2xl font-bold text-parchment">
                {availablePaths.length}
              </p>
              <p className="text-sm text-parchment/50">Available</p>
            </div>
          </div>
        ) : null}
      </PageHero>

      {/* Main Content */}
      <div className="page-shell bg-mythic">
        <Breadcrumbs />

        <section className="mt-6 rounded-xl border border-border/60 bg-card/60 p-6">
          <h2 className="page-section-title text-foreground">
            Follow A Structured Reading Route
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Learning paths turn a very large mythology archive into a deliberate
            sequence. Instead of jumping randomly between pantheons, you can
            follow a route built around one tradition, one domain, or one story
            type and build context in a stable order.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The paths are most useful when you want momentum. Each one points
            you toward the next deity, story, or quiz that makes sense after the
            last stop, which reduces the friction of deciding what to read next
            and helps your study sessions feel cumulative rather than scattered.
          </p>
        </section>

        {/* Active Paths */}
        {activePaths.length > 0 && (
          <section className="mt-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h2 className="page-section-title text-foreground">
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
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Compass className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="page-section-title text-foreground">
                  {hasProgress ? "Explore New Paths" : "Choose Your Path"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasProgress
                    ? "Based on your interests, we recommend these paths"
                    : "Each path offers a unique journey through mythology"}
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
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="page-section-title text-foreground">
                  Completed Paths
                </h2>
                <p className="text-sm text-muted-foreground">
                  You&apos;ve mastered these paths
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
            <h2 className="page-section-title text-foreground mb-6 text-center">
              How Learning Paths Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-2xl font-serif text-gold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose a Path</h3>
                <p className="text-sm text-muted-foreground">
                  Select from pantheon mastery, domain expertise, or
                  story-focused paths
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-2xl font-serif text-gold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Follow the Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Each path guides you through deities, stories, and quizzes
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-2xl font-serif text-gold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Your progress is saved automatically as you explore
                </p>
              </div>
              <div className="text-center p-6 rounded-xl border border-border bg-card/50">
                <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/30 bg-gold/5">
                  <span className="text-2xl font-serif text-gold">4</span>
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
