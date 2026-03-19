import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Bookmarks",
  description:
    "Your saved deities, stories, and pantheons from Mythos Atlas. Revisit your favorite mythology content.",
  url: "/bookmarks",
});

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
