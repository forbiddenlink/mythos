import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StoryNextStep } from "@/lib/story-context";

/**
 * The onward link under a story for a reader who did not come from a list:
 * the next story of the same tradition, or the tradition's page after its
 * last story. It has no hooks, so the story page also renders it on the
 * server as the fallback of the list-aware navigation.
 */
export function StoryNextLink({ step }: Readonly<{ step: StoryNextStep }>) {
  const isStory = step.kind === "story";
  return (
    <nav aria-label="Keep reading" className="mt-10 border-y border-border/70">
      <Link
        href={step.href}
        rel={isStory ? "next" : undefined}
        className="group flex min-h-11 flex-col gap-1 py-3 type-ui text-foreground transition-colors hover:text-gold-text"
      >
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          {isStory
            ? "Next story in this tradition"
            : "All stories in this tradition"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
        <span className="font-medium">{step.title}</span>
      </Link>
    </nav>
  );
}
