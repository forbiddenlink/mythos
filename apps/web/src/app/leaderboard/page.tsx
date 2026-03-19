"use client";

import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LeaderboardContext,
  type LeaderboardCategory,
} from "@/providers/leaderboard-provider";
import { ProgressContext } from "@/providers/progress-provider";
import {
  Award,
  Check,
  Edit2,
  Flame,
  Star,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";

const categories: {
  id: LeaderboardCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "xp", label: "XP", icon: <Star className="h-4 w-4" /> },
  { id: "quiz", label: "Quiz", icon: <Trophy className="h-4 w-4" /> },
  {
    id: "achievements",
    label: "Achievements",
    icon: <Award className="h-4 w-4" />,
  },
  { id: "streak", label: "Streak", icon: <Flame className="h-4 w-4" /> },
];

export default function LeaderboardPage() {
  const leaderboardContext = useContext(LeaderboardContext);
  const progressContext = useContext(ProgressContext);
  const [mounted, setMounted] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [activeTab, setActiveTab] = useState<LeaderboardCategory>("xp");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
  }, []);

  // Sync progress to leaderboard
  useEffect(() => {
    if (mounted && leaderboardContext && progressContext) {
      leaderboardContext.syncFromProgress({
        totalXP: progressContext.progress.totalXP,
        quickQuizHighScore: progressContext.progress.quickQuizHighScore,
        achievementsCount: progressContext.progress.achievements.length,
        dailyStreak: progressContext.progress.dailyStreak,
      });
    }
  }, [
    mounted,
    leaderboardContext,
    progressContext,
    progressContext?.progress.totalXP,
    progressContext?.progress.quickQuizHighScore,
    progressContext?.progress.achievements.length,
    progressContext?.progress.dailyStreak,
  ]);

  // Initialize nickname input when entry loads
  useEffect(() => {
    if (leaderboardContext?.currentEntry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync nickname from context
      setNicknameInput(leaderboardContext.currentEntry.nickname);
    }
  }, [leaderboardContext?.currentEntry]);

  if (!mounted || !leaderboardContext || !progressContext) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const {
    currentEntry,
    setNickname,
    getUserRank,
    entries: _entries,
  } = leaderboardContext;

  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      setNickname(nicknameInput.trim());
    }
    setIsEditingNickname(false);
  };

  const handleCancelEdit = () => {
    setNicknameInput(currentEntry?.nickname || "");
    setIsEditingNickname(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 bg-linear-to-b from-midnight/30 to-background">
        <div className="container mx-auto max-w-4xl px-4">
          <Breadcrumbs />

          <div className="flex items-center gap-4 mt-6 mb-4">
            <div className="p-3 rounded-xl bg-gold/20 border border-gold/30">
              <Trophy className="h-8 w-8 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold text-foreground">
                Your Stats
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your personal mythology exploration progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          {/* Your Stats Card */}
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nickname */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Display Name
                  </p>
                  {isEditingNickname ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        className="h-8 w-48"
                        placeholder="Enter nickname"
                        maxLength={30}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveNickname();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={handleSaveNickname}
                        aria-label="Save nickname"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={handleCancelEdit}
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {currentEntry?.nickname || "Set your nickname"}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => setIsEditingNickname(true)}
                        aria-label="Edit nickname"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const rank = getUserRank(cat.id);
                  let value = 0;
                  if (currentEntry) {
                    switch (cat.id) {
                      case "xp":
                        value = currentEntry.totalXP;
                        break;
                      case "quiz":
                        value = currentEntry.quickQuizHighScore;
                        break;
                      case "achievements":
                        value = currentEntry.achievementsUnlocked;
                        break;
                      case "streak":
                        value = currentEntry.longestStreak;
                        break;
                    }
                  }

                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-xl bg-card border border-border text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-2">
                        {cat.icon}
                        <span className="text-sm">{cat.label}</span>
                      </div>
                      <p className="font-semibold text-xl text-foreground">
                        {value.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs border-gold/30 text-gold"
                      >
                        Rank #{rank}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Tabs */}
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="font-serif">Personal History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your progress across categories
              </p>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as LeaderboardCategory)}
              >
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex items-center gap-1.5"
                    >
                      {cat.icon}
                      <span className="hidden sm:inline">{cat.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id}>
                    <LeaderboardTable category={cat.id} limit={20} />
                  </TabsContent>
                ))}
              </Tabs>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Stats are stored locally on your device.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
