"use client";

import { useMemo, useState, useCallback, useEffect, memo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  Position,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { normalizeDeityReference } from "@/lib/deities";
import { Sparkles } from "lucide-react";
import Image from "next/image";

// Types
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

export type GraphLayoutMode = "cluster" | "grid" | "radial";

interface KnowledgeGraphProps {
  deities: Deity[];
  relationships: Relationship[];
  pantheons: Pantheon[];
  selectedPantheons: Set<string>;
  relationshipFilters: {
    parent: boolean;
    spouse: boolean;
    sibling: boolean;
    crossPantheon: boolean;
  };
  clusterByPantheon: boolean;
  exploreMode?: boolean;
  exploredDeityIds?: Set<string>;
  onNodeClick?: (deityId: string, slug: string) => void;
  /** Prefer layoutMode; clusterByPantheon kept for callers mid-migration. */
  layoutMode?: GraphLayoutMode;
}

import { PANTHEON_COLORS, getPantheonColor } from "@/lib/pantheon-colors";

// Re-export for callers that import colors from this module
export { PANTHEON_COLORS, getPantheonColor };

// Get edge style based on relationship type
const getEdgeStyle = (
  relationshipType: string,
  isCrossPantheon: boolean = false,
) => {
  const type = relationshipType.toLowerCase();

  if (isCrossPantheon) {
    return {
      stroke: "#fbbf24",
      strokeWidth: 3,
      strokeDasharray: undefined,
      filter: "drop-shadow(0 0 6px #fbbf24)",
    };
  }

  if (type.includes("spouse") || type.includes("lover") || type === "ally_of") {
    return {
      stroke: "#ec4899",
      strokeWidth: 2,
      strokeDasharray: "8 4",
    };
  }

  if (type.includes("sibling")) {
    return {
      stroke: "#3b82f6",
      strokeWidth: 2,
      strokeDasharray: "4 2",
    };
  }

  // Parent/child - solid line
  return {
    stroke: "#64748b",
    strokeWidth: 2,
    strokeDasharray: undefined,
  };
};

// Custom node component - memoized to prevent unnecessary re-renders
const DeityNode = memo(function DeityNode({
  data,
}: {
  data: {
    deity: Deity;
    pantheonColor: string;
    isHighlighted: boolean;
    showImage: boolean;
    explored?: boolean;
  };
}) {
  const { deity, pantheonColor, isHighlighted, explored } = data;
  const nodeSize =
    deity.importanceRank && deity.importanceRank <= 5 ? "large" : "normal";

  return (
    <Card
      className={`
        transition-all duration-200 cursor-pointer
        ${nodeSize === "large" ? "p-3 min-w-35" : "p-2 min-w-25"}
        ${isHighlighted ? "ring-2 ring-amber-400 shadow-lg shadow-amber-400/30" : ""}
        ${explored ? "ring-1 ring-patina/50" : ""}
        bg-white dark:bg-slate-900 hover:shadow-lg hover:scale-105
      `}
      style={{
        borderLeft: `4px solid ${pantheonColor}`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className={`
            rounded-full flex items-center justify-center shrink-0
            ${nodeSize === "large" ? "w-10 h-10" : "w-7 h-7"}
          `}
          style={{ backgroundColor: pantheonColor }}
        >
          {deity.imageUrl ? (
            <Image
              src={deity.imageUrl}
              alt={deity.name}
              width={nodeSize === "large" ? 40 : 28}
              height={nodeSize === "large" ? 40 : 28}
              className="rounded-full object-cover"
            />
          ) : (
            <Sparkles
              className={`text-white ${nodeSize === "large" ? "h-5 w-5" : "h-3.5 w-3.5"}`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold truncate text-slate-900 dark:text-slate-100 ${nodeSize === "large" ? "text-sm" : "text-xs"}`}
          >
            {deity.name}
          </div>
          {deity.domain && deity.domain.length > 0 && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {deity.domain[0]}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
});

const nodeTypes = {
  deityNode: DeityNode,
};

// Calculate layout positions
function calculateLayout(
  deities: Deity[],
  _relationships: Relationship[],
  layoutMode: GraphLayoutMode,
  selectedPantheons: Set<string>,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const filteredDeities = deities.filter((d) =>
    selectedPantheons.has(d.pantheonId),
  );

  if (layoutMode === "cluster") {
    const pantheonGroups = new Map<string, Deity[]>();

    filteredDeities.forEach((deity) => {
      const group = pantheonGroups.get(deity.pantheonId) || [];
      group.push(deity);
      pantheonGroups.set(deity.pantheonId, group);
    });

    const pantheonList = Array.from(pantheonGroups.entries());
    const numPantheons = pantheonList.length;
    const clusterRadius = 600;

    pantheonList.forEach(([_pantheonId, deities], clusterIndex) => {
      const clusterAngle =
        (clusterIndex / numPantheons) * 2 * Math.PI - Math.PI / 2;
      const clusterCenterX = Math.cos(clusterAngle) * clusterRadius;
      const clusterCenterY = Math.sin(clusterAngle) * clusterRadius;

      const sortedDeities = deities.toSorted(
        (a, b) => (a.importanceRank || 999) - (b.importanceRank || 999),
      );

      const innerRadius = Math.max(100, sortedDeities.length * 30);

      sortedDeities.forEach((deity, index) => {
        if (index === 0 && deity.importanceRank === 1) {
          positions.set(deity.id, {
            x: clusterCenterX,
            y: clusterCenterY,
          });
        } else {
          const angle =
            ((index - 1) / Math.max(1, sortedDeities.length - 1)) * 2 * Math.PI;
          positions.set(deity.id, {
            x: clusterCenterX + Math.cos(angle) * innerRadius,
            y: clusterCenterY + Math.sin(angle) * innerRadius,
          });
        }
      });
    });
  } else if (layoutMode === "radial") {
    // Single ring ordered by pantheon then importance (Obsidian radial feel)
    const sorted = filteredDeities.toSorted((a, b) => {
      const pantheonCmp = a.pantheonId.localeCompare(b.pantheonId);
      if (pantheonCmp !== 0) return pantheonCmp;
      return (a.importanceRank || 999) - (b.importanceRank || 999);
    });
    const n = sorted.length;
    const radius = Math.max(280, n * 18);
    sorted.forEach((deity, index) => {
      const angle = (index / Math.max(1, n)) * 2 * Math.PI - Math.PI / 2;
      const rank = deity.importanceRank || 999;
      const r = rank <= 3 ? radius * 0.55 : radius;
      positions.set(deity.id, {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    });
  } else {
    const cols = Math.ceil(Math.sqrt(filteredDeities.length));
    const spacing = 200;

    const sortedDeities = filteredDeities.toSorted(
      (a, b) => (a.importanceRank || 999) - (b.importanceRank || 999),
    );

    sortedDeities.forEach((deity, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      positions.set(deity.id, {
        x: col * spacing - (cols * spacing) / 2,
        y: row * spacing,
      });
    });
  }

  return positions;
}

// Inner component that uses ReactFlow hooks
function KnowledgeGraphInner({
  deities,
  relationships,
  pantheons: _pantheons,
  selectedPantheons,
  relationshipFilters,
  clusterByPantheon,
  exploreMode = false,
  exploredDeityIds,
  onNodeClick,
  layoutMode,
  highlightedNodeId,
  setHighlightedNodeId,
  exploreFocusId,
  setExploreFocusId,
}: KnowledgeGraphProps & {
  highlightedNodeId: string | null;
  setHighlightedNodeId: (id: string | null) => void;
  exploreFocusId: string | null;
  setExploreFocusId: (id: string | null) => void;
}) {
  const { fitView } = useReactFlow();
  const resolvedLayout: GraphLayoutMode =
    layoutMode ?? (clusterByPantheon ? "cluster" : "grid");

  // Create deity map for quick lookups
  const _deityMap = useMemo(
    () => new Map(deities.map((d) => [d.id, d])),
    [deities],
  );

  // Calculate positions
  const positions = useMemo(
    () =>
      calculateLayout(
        deities,
        relationships,
        resolvedLayout,
        selectedPantheons,
      ),
    [deities, relationships, resolvedLayout, selectedPantheons],
  );

  // Build nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const addedEdges = new Set<string>();

    // Filter deities by selected pantheons
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

    // Neighborhood for explore mode (Obsidian Explore pattern)
    const focusId = exploreMode ? exploreFocusId : null;
    const neighborIds = new Set<string>();
    if (focusId) {
      neighborIds.add(focusId);
      relationships.forEach((rel) => {
        if (rel.fromDeityId === focusId) neighborIds.add(rel.toDeityId);
        if (rel.toDeityId === focusId) neighborIds.add(rel.fromDeityId);
      });
      filteredDeities.forEach((deity) => {
        if (deity.id !== focusId) return;
        deity.crossPantheonParallels?.forEach((p) => {
          const target = deityReferenceMap.get(
            normalizeDeityReference(p.deityId),
          );
          if (target) neighborIds.add(target.id);
        });
      });
    }

    // Create nodes
    filteredDeities.forEach((deity) => {
      const position = positions.get(deity.id) || { x: 0, y: 0 };
      const inNeighborhood = !focusId || neighborIds.has(deity.id);
      const visited = exploredDeityIds?.has(deity.id);

      nodes.push({
        id: deity.id,
        type: "deityNode",
        position,
        data: {
          deity,
          pantheonColor: getPantheonColor(deity.pantheonId),
          isHighlighted:
            highlightedNodeId === deity.id || exploreFocusId === deity.id,
          showImage: true,
          explored: visited,
        },
        style: {
          opacity: inNeighborhood ? 1 : 0.18,
          transition: "opacity 200ms ease",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    // Create edges from relationships
    relationships.forEach((rel) => {
      if (
        !filteredDeityIds.has(rel.fromDeityId) ||
        !filteredDeityIds.has(rel.toDeityId)
      ) {
        return;
      }

      const relType = rel.relationshipType.toLowerCase();

      // Check filters
      const isParentChild = relType.includes("parent");
      const isSpouse =
        relType.includes("spouse") ||
        relType.includes("lover") ||
        relType === "ally_of";
      const isSibling = relType.includes("sibling");

      if (isParentChild && !relationshipFilters.parent) return;
      if (isSpouse && !relationshipFilters.spouse) return;
      if (isSibling && !relationshipFilters.sibling) return;

      const edgeKey = [rel.fromDeityId, rel.toDeityId].sort().join("-");
      if (addedEdges.has(edgeKey)) return;
      addedEdges.add(edgeKey);

      const style = getEdgeStyle(rel.relationshipType);

      edges.push({
        id: rel.id,
        source: rel.fromDeityId,
        target: rel.toDeityId,
        type: "smoothstep",
        animated: false,
        style,
        markerEnd: isParentChild
          ? {
              type: MarkerType.ArrowClosed,
              color: style.stroke,
            }
          : undefined,
      });
    });

    // Add cross-pantheon parallel edges
    if (relationshipFilters.crossPantheon) {
      filteredDeities.forEach((deity) => {
        if (!deity.crossPantheonParallels) return;

        deity.crossPantheonParallels.forEach((parallel) => {
          const targetDeity = deityReferenceMap.get(
            normalizeDeityReference(parallel.deityId),
          );
          if (!targetDeity || !filteredDeityIds.has(targetDeity.id)) return;

          const edgeKey = [deity.id, targetDeity.id].sort().join("-cross-");
          if (addedEdges.has(edgeKey)) return;
          addedEdges.add(edgeKey);

          const style = getEdgeStyle("cross", true);

          edges.push({
            id: `cross-${deity.id}-${targetDeity.id}`,
            source: deity.id,
            target: targetDeity.id,
            type: "smoothstep",
            animated: true,
            style,
            label: "Parallel",
            labelStyle: { fill: "#fbbf24", fontSize: 10 },
            labelBgStyle: { fill: "transparent" },
          });
        });
      });
    }

    return { nodes, edges };
  }, [
    deities,
    relationships,
    selectedPantheons,
    relationshipFilters,
    positions,
    highlightedNodeId,
    exploreMode,
    exploreFocusId,
    exploredDeityIds,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const deity = (node.data as { deity: Deity }).deity;
      if (exploreMode) {
        setExploreFocusId(deity.id);
        setHighlightedNodeId(deity.id);
        return;
      }
      if (onNodeClick) {
        onNodeClick(deity.id, deity.slug);
      }
    },
    [onNodeClick, exploreMode, setExploreFocusId, setHighlightedNodeId],
  );

  // Handle node hover
  const handleNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setHighlightedNodeId(node.id);
    },
    [setHighlightedNodeId],
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHighlightedNodeId(null);
  }, [setHighlightedNodeId]);

  // Expose control methods via ref or context if needed
  useEffect(() => {
    // Fit view after initial render
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView, selectedPantheons, resolvedLayout]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-left"
      minZoom={0.1}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls position="bottom-left" />
      <MiniMap
        nodeColor={(node) => {
          const deity = (node.data as { deity: Deity }).deity;
          return getPantheonColor(deity.pantheonId);
        }}
        maskColor="rgba(0, 0, 0, 0.2)"
        position="bottom-right"
      />
    </ReactFlow>
  );
}

// Wrapper component with provider
export function KnowledgeGraph(props: KnowledgeGraphProps) {
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null,
  );
  const [exploreFocusId, setExploreFocusId] = useState<string | null>(null);

  const listDeities = useMemo(() => {
    return props.deities
      .filter((d) => props.selectedPantheons.has(d.pantheonId))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [props.deities, props.selectedPantheons]);

  return (
    <div
      className="flex h-full w-full flex-col gap-3 lg:flex-row"
      role="region"
      aria-label="Knowledge graph of deity relationships"
    >
      <nav
        aria-label="Deities in this graph"
        className="max-h-40 shrink-0 overflow-y-auto rounded-lg border border-border bg-card/80 p-3 lg:max-h-none lg:w-56"
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Keyboard list ({listDeities.length})
          {props.exploreMode && exploreFocusId ? " · explore focus" : ""}
        </p>
        {props.exploreMode && exploreFocusId && (
          <button
            type="button"
            className="mb-2 text-xs text-gold underline-offset-2 hover:underline"
            onClick={() => setExploreFocusId(null)}
          >
            Clear explore focus
          </button>
        )}
        <ul className="space-y-1">
          {listDeities.map((deity) => (
            <li key={deity.id}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                onClick={() => {
                  if (props.exploreMode) {
                    setExploreFocusId(deity.id);
                    setHighlightedNodeId(deity.id);
                    return;
                  }
                  props.onNodeClick?.(deity.id, deity.slug);
                }}
                onFocus={() => setHighlightedNodeId(deity.id)}
                onBlur={() => setHighlightedNodeId(null)}
              >
                {deity.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-h-0 min-w-0 flex-1">
        <ReactFlowProvider>
          <KnowledgeGraphInner
            {...props}
            highlightedNodeId={highlightedNodeId}
            setHighlightedNodeId={setHighlightedNodeId}
            exploreFocusId={exploreFocusId}
            setExploreFocusId={setExploreFocusId}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
