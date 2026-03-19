import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Your Stats",
  description:
    "Track your personal mythology exploration progress. View XP, quiz scores, achievements, and daily streak.",
  url: "/leaderboard",
});

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
