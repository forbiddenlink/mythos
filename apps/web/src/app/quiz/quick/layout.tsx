import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Quick Quiz",
  description:
    "Race the clock in a fast mythology quiz focused on deity domains, names, symbols, and rapid-fire recall across multiple pantheons.",
  url: "/quiz/quick",
});

export default function QuickQuizLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
