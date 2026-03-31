import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Ragnarok Cinematic Story",
  description:
    "Watch the Norse apocalypse unfold scene by scene in a cinematic retelling of Ragnarok.",
  url: "/stories/ragnarok/cinematic",
});

export default function RagnarokCinematicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
