import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Learning Progress and Stats",
  description:
    "Track mythology learning progress with viewed deities, completed stories, explored pantheons, quiz scores, streaks, and achievement milestones.",
  url: "/progress",
});

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
