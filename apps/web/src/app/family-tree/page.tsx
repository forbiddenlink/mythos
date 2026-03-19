"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Network, GitBranch, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import {
  PageHeaderSkeleton,
  GridSkeleton,
} from "@/components/ui/skeleton-cards";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const {
    data: deitiesData,
    isLoading: deitiesLoading,
    error: deitiesError,
  } = useQuery<{ deities: Deity[] }>({
    queryKey: ["all-deities-family-tree"],
    queryFn: async () => {
      return graphqlClient.request(gql`
        query GetAllDeities {
          deities(pantheonId: null) {
            id
            name
            slug
            gender
            domain
            pantheonId
          }
        }
      `);
    },
  });

  const {
    data: relationshipsData,
    isLoading: relationshipsLoading,
    error: relationshipsError,
  } = useQuery<{
    allRelationships: Relationship[];
  }>({
    queryKey: ["all-relationships"],
    queryFn: async () => {
      return graphqlClient.request(gql`
        query GetAllRelationships {
          allRelationships {
            id
            fromDeityId
            toDeityId
            relationshipType
            description
          }
        }
      `);
    },
  });

  const isLoading = deitiesLoading || relationshipsLoading;
  const error = deitiesError || relationshipsError;

  // Calculate filtered data when deps change (memoized)
  const { deities: finalDeities, relationships: finalRelationships } =
    useMemo(() => {
      if (!deitiesData?.deities || !relationshipsData?.allRelationships)
        return { deities: [], relationships: [] };

      const filteredDeities = deitiesData.deities.filter(
        (d) => d.pantheonId === selectedPantheon,
      );
      const deityIds = new Set(filteredDeities.map((d) => d.id));

      const filteredRelationships = relationshipsData.allRelationships.filter(
        (r) => deityIds.has(r.fromDeityId) && deityIds.has(r.toDeityId),
      );

      return { deities: filteredDeities, relationships: filteredRelationships };
    }, [deitiesData, relationshipsData, selectedPantheon]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <h1 className="sr-only">Family Tree</h1>
        <PageHeaderSkeleton />
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <GridSkeleton count={4} columns={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-24">
        <h1 className="sr-only">Family Tree</h1>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-destructive">
            Error loading family tree
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/family-tree-hero.png"
            alt="Ancient Genealogy"
            fill
            className="object-cover"
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

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-xs">
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
