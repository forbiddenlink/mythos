"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphControls } from "@/components/graph/GraphControls";
import { GraphLegend } from "@/components/graph/GraphLegend";
import type { KnowledgeGraphControls } from "@/components/graph/KnowledgeGraph";
import { MythosMark } from "@/components/icons/mythos-marks";
import { StageLoading } from "@/components/layout/tool-stage";
import { normalizeDeityReference } from "@/lib/deity-reference";
import { useProgress } from "@/hooks/use-progress";
import { PANTHEON_COLORS } from "@/lib/pantheon-colors";
import { cn } from "@/lib/utils";

// Lazy load the heavy ReactFlow-based knowledge graph.
const KnowledgeGraph = dynamic(
  () =>
    import("@/components/graph/KnowledgeGraph").then((mod) => ({
      default: mod.KnowledgeGraph,
    })),
  {
    loading: () => (
      <StageLoading
        tone="dark"
        mark="constellation"
        label="Charting every relationship…"
        className="h-full rounded-lg"
      />
    ),
    ssr: false,
  },
);

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  alternateNames?: string[];
  domain?: string[];
  gender?: string | null;
  importanceRank?: number;
  imageUrl?: string;
  crossPantheonParallels?: {
    pantheonId: string;
    deityId: string;
    note?: string;
  }[];
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description?: string | null;
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

interface KnowledgeGraphPageClientProps {
  deitiesData: Deity[];
  relationshipsData: Relationship[];
  pantheonsData: Pantheon[];
}

export function KnowledgeGraphPageClient({
  deitiesData: deities,
  relationshipsData: relationships,
  pantheonsData: pantheons,
}: Readonly<KnowledgeGraphPageClientProps>) {
  const router = useRouter();
  const { progress } = useProgress();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusterByPantheon, setClusterByPantheon] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"cluster" | "grid" | "radial">(
    "cluster",
  );
  const [exploreMode, setExploreMode] = useState(false);
  const graphControlsRef = useRef<KnowledgeGraphControls | null>(null);

  const exploredDeityIds = useMemo(
    () => new Set(progress.deitiesViewed ?? []),
    [progress.deitiesViewed],
  );

  const [selectedPantheons, setSelectedPantheons] = useState<Set<string>>(
    () => new Set(pantheons.map((p) => p.id)),
  );

  const [relationshipFilters, setRelationshipFilters] = useState({
    parent: true,
    spouse: true,
    sibling: true,
    crossPantheon: true,
  });

  const pantheonColors = useMemo(
    () =>
      pantheons.map((p) => ({
        id: p.id,
        name: p.name.replace(" Pantheon", ""),
        color: PANTHEON_COLORS[p.id] || "#6b7280",
      })),
    [pantheons],
  );

  const handleNodeClick = useCallback(
    (_deityId: string, slug: string) => {
      router.push(`/deities/${slug}`);
    },
    [router],
  );
  const handleZoomIn = useCallback(() => {
    graphControlsRef.current?.zoomIn();
  }, []);
  const handleZoomOut = useCallback(() => {
    graphControlsRef.current?.zoomOut();
  }, []);
  const handleFitView = useCallback(() => {
    graphControlsRef.current?.fitView();
  }, []);
  const handleCenterNode = useCallback((nodeId: string) => {
    graphControlsRef.current?.centerNode(nodeId);
  }, []);
  const handleControlsReady = useCallback(
    (controls: KnowledgeGraphControls) => {
      graphControlsRef.current = controls;
    },
    [],
  );

  // Live counts for the current filter.
  const stats = useMemo(() => {
    const filteredDeities = deities.filter((d) =>
      selectedPantheons.has(d.pantheonId),
    );
    const filteredDeityIds = new Set(filteredDeities.map((d) => d.id));
    const deityReferenceMap = new Map<string, Deity>();
    filteredDeities.forEach((deity) => {
      deityReferenceMap.set(normalizeDeityReference(deity.id), deity);
      deityReferenceMap.set(normalizeDeityReference(deity.slug), deity);
      deity.alternateNames?.forEach((alternateName) => {
        deityReferenceMap.set(normalizeDeityReference(alternateName), deity);
      });
    });

    const connections = relationships.filter(
      (r) =>
        filteredDeityIds.has(r.fromDeityId) &&
        filteredDeityIds.has(r.toDeityId),
    ).length;

    const crossPantheonCount = filteredDeities.reduce((count, d) => {
      if (!d.crossPantheonParallels) return count;
      return (
        count +
        d.crossPantheonParallels.filter((parallel) => {
          const target = deityReferenceMap.get(
            normalizeDeityReference(parallel.deityId),
          );
          return Boolean(target && filteredDeityIds.has(target.id));
        }).length
      );
    }, 0);

    return {
      deities: filteredDeities.length,
      relationships: connections,
      // Each parallel is listed on both figures.
      crossPantheon: Math.floor(crossPantheonCount / 2),
    };
  }, [deities, relationships, selectedPantheons]);

  const controls = (
    <GraphControls
      pantheons={pantheons}
      deities={deities}
      selectedPantheons={selectedPantheons}
      onPantheonsChange={setSelectedPantheons}
      relationshipFilters={relationshipFilters}
      onRelationshipFiltersChange={setRelationshipFilters}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onFitView={handleFitView}
      onCenterNode={handleCenterNode}
      clusterByPantheon={clusterByPantheon}
      onClusterChange={setClusterByPantheon}
      layoutMode={layoutMode}
      onLayoutModeChange={setLayoutMode}
    />
  );

  const graph = (
    <KnowledgeGraph
      deities={deities}
      relationships={relationships}
      pantheons={pantheons}
      selectedPantheons={selectedPantheons}
      relationshipFilters={relationshipFilters}
      clusterByPantheon={clusterByPantheon}
      layoutMode={layoutMode}
      exploreMode={exploreMode}
      exploredDeityIds={exploredDeityIds}
      onNodeClick={handleNodeClick}
      onControlsReady={handleControlsReady}
    />
  );

  const legend = (
    <details className="relative">
      <summary className="flex h-8 cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-xs marker:hidden hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
        <MythosMark id="constellation" className="size-4 text-gold-text" />
        Legend
      </summary>
      <GraphLegend
        pantheonColors={pantheonColors}
        className="absolute top-full right-0 z-30 mt-2 max-h-[60vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto"
      />
    </details>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-midnight">
        <div className="dark flex flex-wrap items-center justify-between gap-3 border-b border-parchment/10 px-4 py-3">
          <p className="flex items-center gap-2 font-serif text-lg font-semibold text-parchment">
            <MythosMark id="constellation" className="size-5 text-gold-light" />
            Knowledge Graph
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="gap-2"
          >
            <Minimize2 className="size-4" aria-hidden="true" />
            Exit fullscreen
          </Button>
        </div>
        <div className="dark flex flex-wrap items-start gap-3 border-b border-parchment/10 px-4 py-3">
          <div className="min-w-0 flex-1">{controls}</div>
          {legend}
        </div>
        <div className="relative min-h-0 flex-1 p-3">{graph}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border/70 pb-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">{controls}</div>
        <div className="flex flex-wrap items-center gap-2">
          {legend}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={exploreMode}
            onClick={() => setExploreMode((v) => !v)}
            className={cn(
              "gap-2",
              exploreMode &&
                "border-gold bg-gold text-midnight hover:bg-gold-light",
            )}
          >
            <MythosMark id="constellation" className="size-4" />
            {exploreMode ? "Explore mode on" : "Explore mode"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="gap-2"
            aria-label="Expand graph to fullscreen"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Fullscreen</span>
          </Button>
        </div>
      </div>

      <p className="mt-3 type-ui text-muted-foreground" aria-live="polite">
        <span className="font-medium tabular-nums text-foreground">
          {stats.deities}
        </span>{" "}
        deities ·{" "}
        <span className="font-medium tabular-nums text-foreground">
          {stats.relationships}
        </span>{" "}
        connections ·{" "}
        <span className="font-medium tabular-nums text-gold-text">
          {stats.crossPantheon}
        </span>{" "}
        cross-pantheon links
        {exploreMode ? (
          <span>
            {" "}
            · Click a deity to focus its neighbourhood; visited figures keep a
            patina ring.
          </span>
        ) : null}
      </p>

      <div className="relative mt-4 h-[min(78vh,50rem)] min-h-[36rem]">
        {graph}
      </div>
    </div>
  );
}
