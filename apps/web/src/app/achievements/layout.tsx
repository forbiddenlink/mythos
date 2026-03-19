import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Achievements",
  description:
    "Earn badges and milestones as you explore ancient mythology. Track your achievements across deities, stories, quizzes, and more.",
  url: "/achievements",
});

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
