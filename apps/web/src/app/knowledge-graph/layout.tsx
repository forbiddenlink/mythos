import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Knowledge Graph",
  description:
    "Trace divine family trees, rivalries, marriages, and cross-pantheon links in an interactive mythology knowledge graph for comparative study.",
  url: "/knowledge-graph",
});

export default function KnowledgeGraphLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
