"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Network, GitBranch } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

// Lazy load heavy ReactFlow-based components
const FamilyTreeVisualization = dynamic(
  () =>
    import("@/components/family-tree/FamilyTreeVisualization").then((mod) => ({
      default: mod.FamilyTreeVisualization,
    })),
  {
    loading: () => (
      <div className="h-150 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  },
);

const EnhancedFamilyTree = dynamic(
  () =>
    import("@/components/family-tree/EnhancedFamilyTree").then((mod) => ({
      default: mod.EnhancedFamilyTree,
    })),
  {
    loading: () => (
      <div className="h-150 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  },
);
import pantheonsData from "@/data/pantheons.json";
import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HERO_IMAGE_WIDTH = 1920;
const HERO_IMAGE_HEIGHT = 1080;

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  gender: string | null;
  pantheonId?: string;
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description: string | null;
}

export default function FamilyTreePage() {
  const [viewMode, setViewMode] = useState<"hierarchical" | "network">(
    "hierarchical",
  );
  const [selectedPantheon, setSelectedPantheon] =
    useState<string>("greek-pantheon");
  const allDeities = deitiesData as Deity[];
  const allRelationships = relationshipsData as Relationship[];

  // Calculate filtered data when deps change (memoized)
  const { deities: finalDeities, relationships: finalRelationships } =
    useMemo(() => {
      const filteredDeities = allDeities.filter(
        (d) => d.pantheonId === selectedPantheon,
      );
      const deityIds = new Set(filteredDeities.map((d) => d.id));

      const filteredRelationships = allRelationships.filter(
        (r) => deityIds.has(r.fromDeityId) && deityIds.has(r.toDeityId),
      );

      return { deities: filteredDeities, relationships: filteredRelationships };
    }, [allDeities, allRelationships, selectedPantheon]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/family-tree-hero.jpg"
            alt="Ancient Genealogy"
            width={HERO_IMAGE_WIDTH}
            height={HERO_IMAGE_HEIGHT}
            sizes="100vw"
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-br from-midnight/70 via-midnight/65 to-midnight/70"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-gold-dark to-gold flex items-center justify-center shadow-lg">
              <Network className="h-6 w-6 text-midnight" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-parchment">
                Family Tree
              </h1>
              <p className="text-lg text-parchment/70 mt-1 font-light">
                Explore the intricate relationships between deities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            See Mythology As A Network
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Family trees are one of the fastest ways to understand why myths
            branch the way they do. Switch pantheons to compare divine
            succession, marriage alliances, rival sibling lines, and the way
            heroic figures sit inside larger cosmic families. The hierarchical
            view works best for ancestry, while the network view makes it easier
            to spot clusters, loops, and cross-generational relationships at a
            glance.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Use the tree when you want to answer concrete questions such as who
            descends from whom, which marriages bind different divine houses,
            and how power passes from primordial beings to later gods. The
            visual structure makes long mythological genealogies easier to read
            than plain prose lists.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            It also helps surface narrative context. Feuds, inheritances,
            rivalries, and alliances tend to make more sense once you can see
            the full shape of a family rather than reading each character in
            isolation from the surrounding lineage.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Use the pantheon switcher to compare how different traditions
            organize divine authority. Some families center succession and
            inheritance, while others reveal looser networks of marriage,
            rivalry, and alliance that shape myth in a very different way.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            It is also a practical reference when a story assumes prior family
            knowledge. Before reading a complex myth, open the relevant pantheon
            here to see parents, siblings, spouses, and descendants in one pass,
            then carry that structure back into the narrative.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            The view is especially helpful for comparative reading because it
            exposes repeated structures: sky fathers replacing earlier powers,
            sibling rivalries shaping succession, and marriages acting as
            political links between divine houses. Those patterns are difficult
            to spot when the same information is scattered across separate deity
            pages.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Use this page as a map before and after deeper reading. Open the
            tree first to orient yourself, read a story or deity profile with
            that structure in mind, then return to the visualization to confirm
            how the narrative changed your understanding of the wider family.
          </p>
        </section>

        {/* Controls Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <span className="font-medium">Pantheon:</span>
            </div>
            <Select
              value={selectedPantheon}
              onValueChange={setSelectedPantheon}
            >
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select Pantheon" />
              </SelectTrigger>
              <SelectContent>
                {pantheonsData.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <span className="font-medium">Visualization:</span>
            </div>
            <div className="flex bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "hierarchical" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("hierarchical")}
                className="gap-2 h-8"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hierarchical</span>
              </Button>
              <Button
                variant={viewMode === "network" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("network")}
                className="gap-2 h-8"
              >
                <Network className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Network</span>
              </Button>
            </div>
          </div>
        </div>

        <Card className="bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="font-serif flex items-center gap-2">
                {pantheonsData.find((p) => p.id === selectedPantheon)?.name}
                <span className="text-muted-foreground font-sans font-normal text-sm opacity-60">
                  {viewMode === "hierarchical"
                    ? "Family Tree"
                    : "Network Graph"}
                </span>
              </CardTitle>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {viewMode === "hierarchical"
                  ? "Click nodes to expand/collapse branches"
                  : "Drag to pan, scroll to zoom"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {finalDeities.length > 0 && viewMode === "hierarchical" && (
              <EnhancedFamilyTree
                deities={finalDeities}
                relationships={finalRelationships}
              />
            )}
            {finalDeities.length > 0 && viewMode !== "hierarchical" && (
              <FamilyTreeVisualization
                deities={finalDeities}
                relationships={finalRelationships}
              />
            )}
            {finalDeities.length === 0 && (
              <div className="text-center py-24 text-muted-foreground bg-muted/30">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No family tree data available for this pantheon.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span className="text-xs sm:text-sm">Parent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="text-xs sm:text-sm">Child</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-pink-500"></div>
                <span className="text-xs sm:text-sm">Spouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500"></div>
                <span className="text-xs sm:text-sm">Sibling</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium font-serif">
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p>
                •{" "}
                <span className="hidden sm:inline">
                  Drag nodes to rearrange the layout
                </span>
                <span className="sm:hidden">Drag nodes to rearrange</span>
              </p>
              <p>
                •{" "}
                <span className="hidden sm:inline">
                  Use the controls in the bottom-left to zoom and fit the view
                </span>
                <span className="sm:hidden">Use bottom controls to zoom</span>
              </p>
              <p>• Click deity cards to view profiles</p>
              <p className="hidden sm:block">
                • Use the minimap in the bottom-right for quick navigation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
