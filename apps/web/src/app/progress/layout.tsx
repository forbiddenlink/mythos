import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Progress",
  description:
    "Track your mythology learning progress. See deities viewed, stories read, pantheons explored, and quiz scores.",
  url: "/progress",
});

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
