import Link from "next/link";
import { EntityGrid } from "@/components/entities/EntityCard";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { InteractiveStoryCard } from "@/components/stories/InteractiveStoryCard";
import { interactiveStoryItems } from "@/lib/data/interactive-stories";

export default function InteractiveStoriesIndexPage() {
  const stories = interactiveStoryItems();
  return (
    <div className="min-h-screen">
      <PageHero
        mark="labyrinth"
        tagline="Choose your path"
        title="Interactive Stories"
        description="Branching myths where your choices shape the ending."
        count={`${stories.length} stories · ${stories.reduce((sum, s) => sum + s.totalEndings, 0)} endings`}
      />

      <Container className="pt-8 pb-12 md:pt-10">
        {stories.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Interactive stories are being curated. Check back soon.
          </p>
        ) : (
          <EntityGrid>
            {stories.map((story, index) => (
              <InteractiveStoryCard
                key={story.id}
                story={story}
                priority={index < 3}
                headingLevel="h2"
              />
            ))}
          </EntityGrid>
        )}
      </Container>

      <AboutThisPage title="How interactive stories work">
        <p>
          Each tale has multiple endings. Progress is saved on this device, so
          you can return anytime to chase the routes you have not found yet.
          Prefer a linear reading list? Browse{" "}
          <Link href="/stories">all stories</Link>.
        </p>
      </AboutThisPage>
    </div>
  );
}
