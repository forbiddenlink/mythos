"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/layout/section";
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
 * Family tree card. Receives only the deity's own relationships and the
 * deities they touch, not the whole catalog.
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
    <section
      id="family-tree"
      aria-labelledby="family-tree-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="family-tree-heading"
        eyebrow="Genealogy"
        title="Family tree"
        description={`${deityName}'s parents, consorts, children and rivals, as recorded in the atlas.`}
        action={{ href: "/family-tree", label: "Open the full tree" }}
      />
      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-border/70">
        <RenderWhenVisible fallback={<FamilyTreeFallback />}>
          <FamilyTreeVisualization
            deities={deities}
            relationships={relationships}
            focusDeityId={deityId}
          />
        </RenderWhenVisible>
      </div>
    </section>
  );
}
