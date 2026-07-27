import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Deities of World Mythology",
  description:
    "Browse gods and goddesses from Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, and Aztec mythology, with domains and stories.",
  url: "/deities",
  keywords: [
    "deities",
    "gods",
    "goddesses",
    "Greek gods",
    "Norse gods",
    "Egyptian gods",
    "Roman gods",
    "Hindu deities",
    "mythology directory",
  ],
});

export default function DeitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
