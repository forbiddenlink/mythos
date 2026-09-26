"use client";

import dynamic from "next/dynamic";
import { Loader2, Network } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Lazy load heavy ReactFlow-based family tree
const FamilyTreeVisualization = dynamic(
  () =>
    import("@/components/family-tree/FamilyTreeVisualization").then((mod) => ({
      default: mod.FamilyTreeVisualization,
    })),
  {
    loading: () => (
      <div className="h-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
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
    <Card className="reveal-on-scroll">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Network className="h-5 w-5 text-gold" />
          Family Tree
        </CardTitle>
        <CardDescription>
          Explore {deityName}&apos;s relationships with other deities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FamilyTreeVisualization
          deities={deities}
          relationships={relationships}
          focusDeityId={deityId}
        />
      </CardContent>
    </Card>
  );
}
