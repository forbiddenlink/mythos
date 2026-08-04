import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { generateBaseMetadata } from "@/lib/metadata";
import { listGuides } from "./_guides";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Study Guides",
  description:
    "Short study routes for Greek gods, Norse mythology, and comparative mythology — built for undergrads and self-taught learners.",
  url: "/study",
  keywords: [
    "mythology study guide",
    "learn Greek gods",
    "Norse mythology guide",
    "comparative mythology",
  ],
});

export default function StudyIndexPage() {
  const guides = listGuides();

  return (
    <div className="min-h-screen">
      <PageHero
        mark="torch"
        tagline="For learners"
        title="Study Guides"
        description="Three focused routes that turn Mythos from a browse-and-hope encyclopedia into a study loop: orient, read, visualize, then quiz."
      />
      <div className="container mx-auto max-w-4xl px-4 py-12 bg-mythic">
        <Breadcrumbs />
        <ul className="mt-10 space-y-4">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/study/${guide.slug}`}
                className="block border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold/40"
              >
                <h2 className="font-serif text-2xl text-foreground hover:text-gold">
                  {guide.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {guide.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
