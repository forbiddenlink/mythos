"use client";

import { useContext, useMemo } from "react";
import { ProgressContext } from "@/providers/progress-provider";
import { LearningPathCard } from "@/components/learning/LearningPathCard";
import {
  extractUserPreferences,
  generateLearningPath,
  generatePersonalizedPaths,
  type Deity,
  type LearningPath,
  type Story,
} from "@/lib/recommendations";

function PathGroup({
  title,
  description,
  paths,
}: Readonly<{ title: string; description: string; paths: LearningPath[] }>) {
  if (paths.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="font-serif text-xl text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  );
}

/**
 * Reading paths generated in the browser from what this reader has opened
 * (formerly /learning-paths). Nothing leaves the device.
 */
export function ReadingPaths({
  allDeities,
  allStories,
}: Readonly<{ allDeities: Deity[]; allStories: Story[] }>) {
  const progress = useContext(ProgressContext)?.progress;

  const paths = useMemo(() => {
    const prefs = extractUserPreferences(
      progress?.deitiesViewed || [],
      progress?.storiesRead || [],
      allDeities,
      allStories,
    );
    const personalized = generatePersonalizedPaths(
      prefs,
      allDeities,
      allStories,
    );
    // A reader who has not explored much also gets a Norse route to try.
    if (
      personalized.length < 4 &&
      !prefs.favoritePantheons.includes("norse-pantheon")
    ) {
      const norsePath = generateLearningPath(
        prefs,
        "pantheon-mastery",
        allDeities,
        allStories,
        { pantheonId: "norse-pantheon" },
      );
      if (!personalized.some((p) => p.id === norsePath.id)) {
        personalized.push(norsePath);
      }
    }
    return personalized;
  }, [progress?.deitiesViewed, progress?.storiesRead, allDeities, allStories]);

  const active = paths.filter((p) => p.progress > 0 && p.progress < 100);
  const completed = paths.filter((p) => p.progress === 100);
  const available = paths.filter((p) => p.progress === 0);
  const hasProgress =
    (progress?.deitiesViewed?.length || 0) > 0 ||
    (progress?.storiesRead?.length || 0) > 0;

  return (
    <>
      <PathGroup
        title="Continue reading"
        description="Pick up where you left off."
        paths={active}
      />
      <PathGroup
        title={hasProgress ? "Suggested next" : "Start a reading path"}
        description={
          hasProgress
            ? "Chosen from the figures and stories you have opened."
            : "Each path orders deities and stories in one tradition, domain or story type; the quiz at the end is optional."
        }
        paths={available}
      />
      <PathGroup
        title="Completed"
        description="Paths you have read to the end."
        paths={completed}
      />
    </>
  );
}
