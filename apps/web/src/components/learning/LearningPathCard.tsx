'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import type { LearningPath, LearningPathStep, LearningGoal } from '@/lib/recommendations';

interface LearningPathCardProps {
  path: LearningPath;
  className?: string;
}

const goalIcons: Record<LearningGoal, typeof Crown> = {
  'pantheon-mastery': Crown,
  'domain-expert': Sparkles,
  'story-scholar': BookOpen,
  completionist: Trophy,
};

const goalColors: Record<LearningGoal, string> = {
  'pantheon-mastery': 'from-purple-500 to-indigo-500',
  'domain-expert': 'from-amber-500 to-orange-500',
  'story-scholar': 'from-teal-500 to-cyan-500',
  completionist: 'from-rose-500 to-pink-500',
};

const goalBgColors: Record<LearningGoal, string> = {
  'pantheon-mastery': 'bg-purple-500/10',
  'domain-expert': 'bg-amber-500/10',
  'story-scholar': 'bg-teal-500/10',
  completionist: 'bg-rose-500/10',
};

function getStepLink(step: LearningPathStep): string {
  switch (step.type) {
    case 'deity':
      return `/deities/${step.itemId}`;
    case 'story':
      return `/stories/${step.itemId}`;
    case 'quiz':
      return '/quiz';
    default:
      return '#';
  }
}

function StepIcon({ step }: { step: LearningPathStep }) {
  if (step.completed) {
    return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />;
}

export function LearningPathCard({ path, className = '' }: LearningPathCardProps) {
  const Icon = goalIcons[path.goal];
  const gradientColor = goalColors[path.goal];
  const bgColor = goalBgColors[path.goal];

  // Get the next 3 incomplete steps
  const incompleteSteps = path.steps.filter((s) => !s.completed);
  const nextSteps = incompleteSteps.slice(0, 3);
  const hasMoreSteps = incompleteSteps.length > 3;

  // Find the first incomplete step to link to
  const nextStep = incompleteSteps[0];
  const continueLink = nextStep ? getStepLink(nextStep) : '/quiz';

  const isComplete = path.progress === 100;
  const isStarted = path.progress > 0;

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>
      {/* Gradient accent at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColor}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 text-${path.goal === 'domain-expert' ? 'amber' : path.goal === 'story-scholar' ? 'teal' : path.goal === 'completionist' ? 'rose' : 'purple'}-500`} />
            </div>
            <div>
              <CardTitle className="text-lg">{path.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{path.estimatedTime}</span>
              </div>
            </div>
          </div>
          {isComplete && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
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
          <Progress value={path.progress} className="h-2" aria-label={`${path.name} progress: ${path.progress}%`} />
          <p className="text-xs text-muted-foreground">
            {path.steps.filter((s) => s.completed).length} of {path.steps.length} steps completed
          </p>
        </div>

        {/* Next steps */}
        {nextSteps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Next steps:</p>
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
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Link
          href={continueLink}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            isComplete
              ? 'bg-muted text-muted-foreground hover:bg-muted/80'
              : `bg-gradient-to-r ${gradientColor} text-white hover:opacity-90`
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
              Continue
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Path
            </>
          )}
        </Link>
      </CardFooter>
    </Card>
  );
}
