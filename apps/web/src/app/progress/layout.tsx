import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Your Stats: Mythology Learning Progress",
  description:
    "Your own mythology study stats in this browser: XP, streaks, quiz bests, achievements, and the deities, stories and traditions you have explored.",
  url: "/progress",
});

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
