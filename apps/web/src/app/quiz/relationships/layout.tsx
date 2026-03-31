import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Divine Relationships Quiz",
  description:
    "Test your knowledge of divine family ties, marriages, rivalries, siblings, and lineages across mythological pantheons and traditions.",
  url: "/quiz/relationships",
});

export default function RelationshipsQuizLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
