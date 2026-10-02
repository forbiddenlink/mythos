"use client";

import dynamic from "next/dynamic";
import { RenderWhenVisible } from "@/components/ui/render-when-visible";

// DidYouKnow already renders only this skeleton on the server (its fact is
// picked on the client from the date), and it sits at the bottom of the home
// page. So its code and the facts JSON load when the reader nears it, behind
// the same 13rem box, instead of in the first-load bundle.
function DidYouKnowSkeleton() {
  return (
    <section
      data-testid="did-you-know-skeleton"
      className="layout-container layout-container-content pb-[var(--section-space)]"
    >
      <div className="h-52 rounded-lg bg-muted/50 animate-pulse motion-reduce:animate-none" />
    </section>
  );
}

const DidYouKnow = dynamic(
  () => import("./DidYouKnow").then((mod) => ({ default: mod.DidYouKnow })),
  { ssr: false, loading: () => <DidYouKnowSkeleton /> },
);

export function LazyDidYouKnow({
  deityLookup,
}: {
  deityLookup: Record<string, { name: string; slug: string }>;
}) {
  return (
    <RenderWhenVisible fallback={<DidYouKnowSkeleton />}>
      <DidYouKnow deityLookup={deityLookup} />
    </RenderWhenVisible>
  );
}
