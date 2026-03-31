import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Titanomachy Cinematic Story",
  description:
    "Experience the war between Titans and Olympians in a cinematic retelling of the Titanomachy.",
  url: "/stories/titanomachy/cinematic",
});

export default function TitanomachyCinematicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
