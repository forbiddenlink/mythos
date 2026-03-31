import type { Metadata } from "next";
import branchingStoriesData from "@/data/branching-stories.json";
import { generateBaseMetadata } from "@/lib/metadata";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const story = (
    branchingStoriesData as Array<{
      slug: string;
      title: string;
      description: string;
    }>
  ).find((entry) => entry.slug === slug);

  if (!story) {
    return generateBaseMetadata({
      title: "Interactive Mythology Story",
      description: "Choose a path through an interactive mythology story.",
      url: `/stories/interactive/${slug}`,
    });
  }

  const description =
    story.description.length > 155
      ? `${story.description.slice(0, 152).trimEnd()}...`
      : story.description;

  return generateBaseMetadata({
    title: `${story.title} Interactive Story`,
    description,
    url: `/stories/interactive/${story.slug}`,
  });
}

export default function InteractiveStoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
