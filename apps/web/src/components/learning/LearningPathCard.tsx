"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  BookOpen,
  Sparkles,
  Trophy,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  Clock,
} from "lucide-react";
import { getDeityPath } from "@/lib/deities";
import { isRequiredLearningPathStep } from "@/lib/recommendations";
import type {
  LearningPath,
  LearningPathStep,
  LearningGoal,
} from "@/lib/recommendations";

interface LearningPathCardProps {
  path: LearningPath;
  className?: string;
}

const goalIcons: Record<LearningGoal, typeof Crown> = {
  "pantheon-mastery": Crown,
  "domain-expert": Sparkles,
  "story-scholar": BookOpen,
  completionist: Trophy,
};

const goalColors: Record<LearningGoal, string> = {
  "pantheon-mastery": "from-gold-dark to-gold",
  "domain-expert": "from-bronze to-gold",
  "story-scholar": "from-patina to-gold",
  completionist: "from-bronze to-patina",
};

const goalBgColors: Record<LearningGoal, string> = {
  "pantheon-mastery": "bg-gold/10",
  "domain-expert": "bg-bronze/10",
  "story-scholar": "bg-patina/10",
  completionist: "bg-bronze/10",
};

const goalIconColors: Record<LearningGoal, string> = {
  "pantheon-mastery": "text-gold",
  "domain-expert": "text-bronze",
  "story-scholar": "text-patina",
  completionist: "text-bronze",
};

function getStepLink(step: LearningPathStep): string {
  switch (step.type) {
    case "deity":
      return getDeityPath(step.itemId);
    case "story":
      return `/stories/${step.itemId}`;
    case "quiz":
      return "/quiz";
    default:
      return "#";
  }
}

function StepIcon({ step }: { step: LearningPathStep }) {
  if (step.completed) {
    return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />;
}

export function LearningPathCard({
  path,
  className = "",
}: LearningPathCardProps) {
  const Icon = goalIcons[path.goal];
  const gradientColor = goalColors[path.goal];
  const bgColor = goalBgColors[path.goal];
  const iconColor = goalIconColors[path.goal];

  const requiredSteps = path.steps.filter(isRequiredLearningPathStep);
  const completedRequiredSteps = requiredSteps.filter((step) => step.completed);
  const incompleteSteps = requiredSteps.filter((step) => !step.completed);
  const nextSteps = incompleteSteps.slice(0, 3);
  const hasMoreSteps = incompleteSteps.length > 3;
  const optionalPractice = path.steps.find(
    (step) => !isRequiredLearningPathStep(step),
  );

  const nextStep = incompleteSteps[0];
  const reviewStep = requiredSteps[0] ?? optionalPractice;
  const continueLink = nextStep
    ? getStepLink(nextStep)
    : reviewStep
      ? getStepLink(reviewStep)
      : "/quiz";

  const isComplete = path.progress === 100;
  const isStarted = path.progress > 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
    >
      {/* Gradient accent at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${gradientColor}`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{path.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {path.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          {isComplete && (
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-600 border-green-500/20"
            >
              Complete
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{path.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{path.progress}%</span>
          </div>
          <Progress
            value={path.progress}
            className="h-2"
            aria-label={`${path.name} progress: ${path.progress}%`}
          />
          <p className="text-xs text-muted-foreground">
            {completedRequiredSteps.length} of {requiredSteps.length} reading
            steps completed
          </p>
        </div>

        {/* Next steps */}
        {nextSteps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Next steps:
            </p>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={`${step.type}-${step.itemId}-${index}`}>
                  <Link
                    href={getStepLink(step)}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group/step"
                  >
                    <StepIcon step={step} />
                    <span className="truncate flex-1">{step.title}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover/step:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
            {hasMoreSteps && (
              <p className="text-xs text-muted-foreground ml-6">
                +{incompleteSteps.length - 3} more steps
              </p>
            )}
          </div>
        )}
        {optionalPractice && (
          <Link
            href={getStepLink(optionalPractice)}
            className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <Play className="h-3.5 w-3.5 shrink-0" />
            <span>Optional recall practice: {optionalPractice.title}</span>
          </Link>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Link
          href={continueLink}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            isComplete
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : `bg-linear-to-r ${gradientColor} text-white hover:opacity-90`
          }`}
        >
          {isComplete ? (
            <>
              <Trophy className="h-4 w-4" />
              Review Path
            </>
          ) : isStarted ? (
            <>
              <Play className="h-4 w-4" />
              Continue {path.name}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start {path.name}
            </>
          )}
        </Link>
      </CardFooter>
    </Card>
  );
}
