"use client";

import { useContext, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProgressContext } from "@/providers/progress-provider";
import {
  getTodayChallenges,
  type DailyChallenge,
} from "@/lib/daily-challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  BookOpen,
  Sparkles,
  Globe,
  Award,
  Compass,
  Star,
  Check,
  ChevronRight,
  Flame,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="h-5 w-5" />,
  "book-open": <BookOpen className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  globe: <Globe className="h-5 w-5" />,
  award: <Award className="h-5 w-5" />,
  compass: <Compass className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
};

function getChallengeAction(challenge: DailyChallenge): {
  href: string;
  label: string;
} {
  switch (challenge.action.type) {
    case "complete_quick_quiz":
      return { href: "/quiz/quick", label: "Start Quiz" };
    case "read_story":
      return { href: "/stories", label: "Read Story" };
    case "view_new_deity":
    case "view_pantheon_deity":
      return { href: "/deities", label: "View Deities" };
    case "quiz_high_score":
      return { href: "/quiz", label: "Take Quiz" };
    case "view_multiple_pantheons":
      return { href: "/pantheons", label: "View Pantheons" };
    default:
      return { href: "/", label: "Explore" };
  }
}

interface ChallengeCardProps {
  challenge: DailyChallenge;
  isClaimed: boolean;
  onClaim: () => void;
  isCompleted: boolean;
}

function ChallengeCard({
  challenge,
  isClaimed,
  onClaim,
  isCompleted,
}: ChallengeCardProps) {
  const action = getChallengeAction(challenge);
  const icon = iconMap[challenge.icon] || <Star className="h-5 w-5" />;

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 ${
        isClaimed
          ? "bg-gold/10 border-gold/30"
          : isCompleted
            ? "bg-green-500/10 border-green-500/30"
            : "bg-card border-border hover:border-gold/30"
      }`}
    >
      {isClaimed && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-gold/20 text-gold-text border-gold/30 gap-1">
            <Check className="h-3 w-3" />
            Claimed
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl ${
            isClaimed
              ? "bg-gold/20 text-gold"
              : isCompleted
                ? "bg-green-500/20 text-green-500"
                : "bg-gold/10 text-gold"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground">{challenge.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {challenge.description}
          </p>

          <div className="flex items-center justify-between mt-3">
            <Badge variant="outline" className="border-gold/30 text-gold-text">
              +{challenge.xpReward} XP
            </Badge>

            {isClaimed ? (
              <span className="text-sm text-gold-text font-medium">
                Completed!
              </span>
            ) : isCompleted ? (
              <Button
                size="sm"
                onClick={onClaim}
                className="bg-gold hover:bg-gold-dark text-midnight"
              >
                Claim XP
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-gold/30 hover:bg-gold/10"
              >
                <Link href={action.href}>
                  {action.label}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DailyChallengeBanner() {
  const context = useContext(ProgressContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
  }, []);

  const todayChallenges = useMemo(() => getTodayChallenges(), []);

  if (!context || !mounted) {
    return null;
  }

  const { progress, claimDailyChallenge, isDailyChallengeClaimed } = context;

  // Check completion status for each challenge
  const challengeStatuses = todayChallenges.map((challenge) => {
    const claimed = isDailyChallengeClaimed(challenge.id);

    // Simple completion check based on today's activity
    let completed = false;
    const todayActivity = progress.todayActivity;

    switch (challenge.action.type) {
      case "complete_quick_quiz":
        completed = todayActivity.quizCompleted;
        break;
      case "read_story":
        completed = todayActivity.storiesRead.length > 0;
        break;
      case "view_new_deity":
        completed = todayActivity.deitiesViewed.length > 0;
        break;
      case "view_pantheon_deity":
        if (challenge.action.pantheonId) {
          completed = todayActivity.pantheonsViewed.includes(
            challenge.action.pantheonId,
          );
        }
        break;
      case "quiz_high_score":
        completed =
          todayActivity.quizScore >= (challenge.action.minScore || 80);
        break;
      case "view_multiple_pantheons":
        completed =
          todayActivity.pantheonsViewed.length >= (challenge.action.count || 3);
        break;
    }

    return { challenge, claimed, completed: completed || claimed };
  });

  const completedCount = challengeStatuses.filter((s) => s.claimed).length;
  const progressPercent = (completedCount / todayChallenges.length) * 100;

  return (
    <section className="py-8 bg-linear-to-b from-background to-midnight/5">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="border-gold/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold/20 border border-gold/30">
                  <Zap className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">
                    Daily Challenges
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete challenges to earn XP
                  </p>
                </div>
              </div>

              {/* Streak indicator */}
              {progress.dailyChallengeStreak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-500">
                    {progress.dailyChallengeStreak} day streak
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedCount}/{todayChallenges.length} completed
                </span>
                <span className="text-gold-text font-medium">
                  {todayChallenges.reduce(
                    (sum, c) =>
                      sum +
                      (challengeStatuses.find((s) => s.challenge.id === c.id)
                        ?.claimed
                        ? c.xpReward
                        : 0),
                    0,
                  )}{" "}
                  XP earned today
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2"
                aria-label="Daily challenge progress"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {challengeStatuses.map(({ challenge, claimed, completed }) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isClaimed={claimed}
                isCompleted={completed}
                onClaim={() =>
                  claimDailyChallenge(challenge.id, challenge.xpReward)
                }
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
