"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { pickStoryContext, type StoryContext } from "@/lib/story-context";

/**
 * Where the reader is in the list they came from (`?in=pantheon/greek`).
 * Reads the query on the client so the story page itself stays statically
 * prerendered with a parameter-free canonical URL. Renders nothing when the
 * parameter is absent or does not name a list this story belongs to.
 *
 * `top` is the position line under the hero; `bottom` is previous/next at the
 * end of the retelling.
 */
export function StoryReadingContext({
  contexts,
  placement,
}: {
  contexts: readonly StoryContext[];
  placement: "top" | "bottom";
}) {
  const params = useSearchParams();
  const context = pickStoryContext(contexts, params.get("in"));
  if (!context) return null;

  if (placement === "top") {
    return (
      <p className="type-ui text-muted-foreground">
        <Link
          href={context.listHref}
          className="text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
        >
          {context.listName}
        </Link>
        <span aria-hidden="true"> · </span>
        <span className="sr-only">Story </span>
        <span>{`${context.position} of ${context.total}`}</span>
      </p>
    );
  }

  if (!context.prev && !context.next) return null;

  const linkClass =
    "group flex min-h-11 flex-1 flex-col gap-1 border-border/70 py-3 type-ui text-foreground transition-colors hover:text-gold-text";
  return (
    <nav
      aria-label={`More in ${context.listName}`}
      className="mt-10 flex flex-col divide-y divide-border/70 border-y border-border/70 sm:flex-row sm:divide-x sm:divide-y-0"
    >
      {context.prev ? (
        <Link
          href={context.prev.href}
          className={`${linkClass} sm:pr-6`}
          rel="prev"
        >
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Previous
          </span>
          <span className="font-medium">{context.prev.title}</span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      {context.next ? (
        <Link
          href={context.next.href}
          className={`${linkClass} sm:items-end sm:pl-6 sm:text-right`}
          rel="next"
        >
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            Next
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
          <span className="font-medium">{context.next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
