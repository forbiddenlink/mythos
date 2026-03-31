import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Leaderboard and Personal Stats",
  description:
    "Review mythology study stats including XP, quiz scores, achievement milestones, rankings, streaks, and recent personal progress.",
  url: "/leaderboard",
});

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
