import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Learning Paths",
  description:
    "Follow guided mythology learning paths that organize deities, stories, quizzes, and review sessions into focused study journeys.",
  url: "/learning-paths",
});

export default function LearningPathsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
