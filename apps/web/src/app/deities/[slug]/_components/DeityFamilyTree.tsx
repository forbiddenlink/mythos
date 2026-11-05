"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { secondaryLinkClass } from "@/components/layout/tool-stage";
import { RenderWhenVisible } from "@/components/ui/render-when-visible";

// Same box while the chunk loads and before the card nears the viewport, so the
// section does not change height when the tree appears.
function FamilyTreeFallback() {
  return (
    <div
      data-testid="family-tree-fallback"
      className="h-100 flex items-center justify-center"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Lazy load heavy ReactFlow-based family tree
const FamilyTreeVisualization = dynamic(
  () =>
    import("@/components/family-tree/FamilyTreeVisualization").then((mod) => ({
      default: mod.FamilyTreeVisualization,
    })),
  {
    loading: () => <FamilyTreeFallback />,
    ssr: false,
  },
);

export interface FamilyTreeDeity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  gender: string | null;
}

export interface FamilyTreeRelationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description: string | null;
}

/**
 * Family tree block, set inside the page's Family section as a subsection.
 * Receives only the deity's own relationships and the deities they touch, not
 * the whole catalog.
 */
export function DeityFamilyTree({
  deityId,
  deityName,
  deities,
  relationships,
}: {
  deityId: string;
  deityName: string;
  deities: FamilyTreeDeity[];
  relationships: FamilyTreeRelationship[];
}) {
  if (relationships.length === 0) return null;
  return (
    <div
      id="family-tree"
      aria-labelledby="family-tree-heading"
      role="group"
      className="scroll-mt-24"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h3 id="family-tree-heading" className="type-h3 text-foreground">
            Family tree
          </h3>
          <p className="mt-1 type-ui text-muted-foreground">
            {`${deityName}'s parents, consorts, children and rivals, as recorded in the atlas.`}
          </p>
        </div>
        <Link href="/family-tree" className={`${secondaryLinkClass} shrink-0`}>
          Open the full tree
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-border/70">
        <RenderWhenVisible fallback={<FamilyTreeFallback />}>
          <FamilyTreeVisualization
            deities={deities}
            relationships={relationships}
            focusDeityId={deityId}
          />
        </RenderWhenVisible>
      </div>
    </div>
  );
}
