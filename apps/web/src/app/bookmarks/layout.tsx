import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Bookmarks and Saved Reading",
  description:
    "Save deities, stories, and pantheons so you can return to favorite mythology entries, study lists, and unfinished reading sessions.",
  url: "/bookmarks",
});

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
