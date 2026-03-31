import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Divine Domains Across Pantheons",
  description:
    "Compare gods of war, wisdom, love, death, sea, sky, and other divine domains across world mythologies and ancient pantheons.",
  url: "/divine-domains",
});

export default function DivineDomainsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
