import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Cross-pantheon parallels — comparative mythology",
  description:
    "Browse editorial parallels between mythological figures across pantheons — analogies for study, linked from deity entries.",
  url: "/compare/parallels",
});

export default function ParallelsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
