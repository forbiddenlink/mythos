import { notFound } from "next/navigation";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getBranchingStories } from "@/lib/data/catalog";
import { InteractiveStoryPlayer } from "./InteractiveStoryPlayer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every branching story is prerendered; unknown slugs use the static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getBranchingStories().map((story) => ({ slug: story.slug }));
}

export default async function InteractiveStoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = getBranchingStories().find((s) => s.slug === slug);
  if (!story) notFound();

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Interactive story"
        mark="scroll"
        title={story.title}
        lede={`Play as ${story.protagonist}. Every choice changes the path, and ${story.totalEndings} endings wait at the end of them.`}
        count={`${story.estimatedTime} · ${story.totalEndings} endings`}
        image={story.coverImage}
      />

      <Container className="section-space-sm">
        <div className="max-w-3xl">
          <InteractiveStoryPlayer story={story} />
        </div>
      </Container>

      <AboutThisPage title="Read the myth by making choices">
        <p>
          Interactive stories turn a familiar myth into a branching reading
          experience. Instead of staying outside the narrative, you move through
          it decision by decision and see how different choices reshape the
          ending, the lesson, or the character&apos;s fate.
        </p>
        <p>
          That makes this format useful for more than novelty. It helps you
          notice where a myth&apos;s tension really lives, which values are
          being tested, and why the original story structure pushes toward one
          outcome rather than another.
        </p>
        <p>
          Use the replay value deliberately. Try one path, compare the next,
          then return to the standard story page or related deity entries so the
          choices feel anchored in the wider mythology rather than detached from
          it.
        </p>
      </AboutThisPage>
    </div>
  );
}
