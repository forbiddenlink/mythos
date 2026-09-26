"use client";

import {
  useMemo,
  useState,
  useCallback,
  useRef,
  KeyboardEvent,
  useEffect,
} from "react";
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
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Navigation map for finding connected nodes by direction
interface NavigationMap {
  parents: string[];
  children: string[];
  siblings: string[];
  spouses: string[];
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  gender: string | null;
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description: string | null;
}

interface FamilyTreeVisualizationProps {
  deities: Deity[];
  relationships: Relationship[];
  focusDeityId?: string;
}

interface RelationshipFilters {
  parent: boolean;
  child: boolean;
  spouse: boolean;
  sibling: boolean;
}

// Generation level markers for Greek mythology (reserved for future use)
// const GENERATION_LABELS = [
//   { y: -300, label: 'Primordials' },
//   { y: -150, label: 'Titans' },
//   { y: 0, label: 'Olympians' },
//   { y: 150, label: 'Heroes & Mortals' },
// ];

const getEdgeColor = (relationshipType: string) => {
  switch (relationshipType.toLowerCase()) {
    case "parent":
      return "#b28f56"; // gold
    case "child":
      return "#6b8f71"; // patina
    case "spouse":
      return "#a67c52"; // bronze
    case "sibling":
      return "#8a8578"; // muted parchment-ink
    default:
      return "#b28f56";
  }
};

// --- Layout helper: adds nodes and edges for a group of related deities ---

interface LayoutContext {
  focusDeityId: string;
  deityMap: Map<string, Deity>;
  searchMatchIds: Set<string>;
  keyboardFocusedId: string | null;
  positioned: Set<string>;
  nodes: Node[];
  edges: Edge[];
}

interface AddRelatedNodesConfig {
  relationships: Relationship[];
  filterFn: (rel: Relationship) => boolean;
  getRelatedId: (rel: Relationship) => string;
  positionFn: (idx: number) => { x: number; y: number };
  getEdgeSourceTarget: (
    focusId: string,
    relatedId: string,
  ) => { source: string; target: string };
  includeMarkerEnd: boolean;
}

function addRelatedNodes(
  config: AddRelatedNodesConfig,
  ctx: LayoutContext,
): void {
  const filtered = config.relationships.filter(config.filterFn);
  filtered.forEach((rel, idx) => {
    const relatedId = config.getRelatedId(rel);
    const relatedDeity = ctx.deityMap.get(relatedId);
    if (relatedDeity && !ctx.positioned.has(relatedDeity.id)) {
      ctx.nodes.push({
        id: relatedDeity.id,
        type: "deityNode",
        width: 200,
        height: 72,
        data: {
          deity: relatedDeity,
          isFocused: false,
          isSearchMatch: ctx.searchMatchIds.has(relatedDeity.id),
          isKeyboardFocused: ctx.keyboardFocusedId === relatedDeity.id,
        },
        position: config.positionFn(idx),
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      ctx.positioned.add(relatedDeity.id);

      const { source, target } = config.getEdgeSourceTarget(
        ctx.focusDeityId,
        relatedDeity.id,
      );
      const edge: Edge = {
        id: rel.id,
        source,
        target,
        type: "smoothstep",
        animated: false,
        label: rel.relationshipType,
        style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
      };
      if (config.includeMarkerEnd) {
        edge.markerEnd = {
          type: MarkerType.ArrowClosed,
          color: getEdgeColor(rel.relationshipType),
        };
      }
      ctx.edges.push(edge);
    }
  });
}

// --- Keyboard navigation action map ---

interface KeyActionContext {
  currentNav: NavigationMap | null;
  nodeIds: string[];
  keyboardFocusedId: string | null;
  focusDeityId?: string;
  deityMap: Map<string, Deity>;
  navigateToDeity: (slug: string) => void;
}

const keyActionMap: Record<string, (ctx: KeyActionContext) => string | null> = {
  ArrowUp: ({ currentNav }) => currentNav?.parents[0] ?? null,
  ArrowDown: ({ currentNav }) => currentNav?.children[0] ?? null,
  ArrowLeft: ({ currentNav, keyboardFocusedId }) => {
    if (!currentNav) return null;
    const laterals = [...currentNav.siblings, ...currentNav.spouses];
    if (laterals.length === 0) return null;
    const currentIndex = laterals.indexOf(keyboardFocusedId || "");
    return laterals[Math.max(0, currentIndex - 1)] || laterals[0];
  },
  ArrowRight: ({ currentNav, keyboardFocusedId }) => {
    if (!currentNav) return null;
    const laterals = [...currentNav.siblings, ...currentNav.spouses];
    if (laterals.length === 0) return null;
    const currentIndex = laterals.indexOf(keyboardFocusedId || "");
    return (
      laterals[Math.min(laterals.length - 1, currentIndex + 1)] || laterals[0]
    );
  },
  Enter: ({
    keyboardFocusedId,
    deityMap,
    focusDeityId,
    nodeIds,
    navigateToDeity,
  }) => {
    if (keyboardFocusedId) {
      const deity = deityMap.get(keyboardFocusedId);
      if (deity?.slug) {
        navigateToDeity(deity.slug);
      }
      return null;
    }
    return focusDeityId || nodeIds[0] || null;
  },
  Home: ({ nodeIds }) => nodeIds[0] ?? null,
  End: ({ nodeIds }) => nodeIds.at(-1) ?? null,
};

const DeityNode = ({
  data,
}: {
  data: {
    deity: Deity;
    isFocused: boolean;
    isSearchMatch: boolean;
    isKeyboardFocused: boolean;
  };
}) => {
  const { deity, isFocused, isSearchMatch, isKeyboardFocused } = data;

  // Determine node styling based on state
  let ringClass = "";
  if (isKeyboardFocused) {
    // Keyboard focus gets highest priority - cyan ring with glow
    ringClass = "ring-2 ring-gold shadow-lg shadow-gold/30 outline-none";
  } else if (isSearchMatch) {
    ringClass = "ring-2 ring-gold-light shadow-lg shadow-gold/20";
  } else if (isFocused) {
    ringClass = "ring-2 ring-patina shadow-lg";
  }

  const domainLabel =
    deity.domain && deity.domain.length > 0 ? `, ${deity.domain[0]}` : "";

  return (
    <Card
      id={deity.id}
      className={`relative min-w-50 border-border bg-card px-3.5 py-3 transition-shadow duration-150 ${ringClass}`}
      // Not role="treeitem": React Flow renders its own wrapper elements between
      // the canvas container and each node, so the treeitem/tree parent-child
      // adjacency ARIA requires can never hold here (axe: aria-required-parent /
      // aria-required-children). The container is role="application" instead and
      // points at the focused node via aria-activedescendant.
      aria-label={`${deity.name}${domainLabel}`}
      aria-current={isKeyboardFocused || isFocused ? "true" : undefined}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-transparent"
        aria-hidden="true"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-transparent"
        aria-hidden="true"
      />
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-serif text-lg font-semibold text-gold-text"
        >
          {deity.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-serif text-[0.95rem] font-semibold text-foreground">
            {deity.name}
          </h3>
          {deity.domain && deity.domain.length > 0 && (
            <p className="truncate text-xs capitalize text-muted-foreground">
              {deity.domain[0]}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

const nodeTypes = {
  deityNode: DeityNode,
};

// Filter button component for relationship types
function FilterButton({
  label,
  active,
  color,
  onClick,
}: Readonly<{
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}>) {
  return (
    <Button
      variant={active ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      className="text-xs h-7"
      aria-pressed={active}
      style={{ borderColor: color }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </Button>
  );
}

// Search results dropdown component
function SearchResults({
  results,
  onSelect,
}: Readonly<{
  results: Deity[];
  onSelect: (deity: Deity) => void;
}>) {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
      {results.map((deity) => (
        <button
          key={deity.id}
          onClick={() => onSelect(deity)}
          className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm text-popover-foreground last:border-b-0 hover:bg-muted"
        >
          <div>
            <div className="font-medium">{deity.name}</div>
            {deity.domain && deity.domain.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {deity.domain[0]}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// Inner component that uses useReactFlow for centering on search results
function FamilyTreeInner({
  deities,
  relationships,
  focusDeityId,
  searchMatchIds,
  filters,
  keyboardFocusedId,
  setKeyboardFocusedId,
  deityMap,
  navigationMap,
}: Readonly<{
  deities: Deity[];
  relationships: Relationship[];
  focusDeityId?: string;
  searchMatchIds: Set<string>;
  filters: RelationshipFilters;
  keyboardFocusedId: string | null;
  setKeyboardFocusedId: (id: string | null) => void;
  deityMap: Map<string, Deity>;
  navigationMap: Map<string, NavigationMap>;
}>) {
  const { setCenter, getNodes } = useReactFlow();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate layout using a hierarchical approach
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Position nodes in a hierarchical layout
    const positioned = new Set<string>();
    let yOffset = 0;
    const xSpacing = 300;
    const ySpacing = 150;

    // If we have a focus deity, start with that
    if (focusDeityId && deityMap.has(focusDeityId)) {
      const deity = deityMap.get(focusDeityId)!;
      nodes.push({
        id: deity.id,
        type: "deityNode",
        width: 200,
        height: 72,
        data: {
          deity,
          isFocused: true,
          isSearchMatch: searchMatchIds.has(deity.id),
          isKeyboardFocused: keyboardFocusedId === deity.id,
        },
        position: { x: 400, y: yOffset },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      positioned.add(deity.id);
      yOffset += ySpacing;

      // Build shared layout context for helper calls
      const layoutCtx: LayoutContext = {
        focusDeityId,
        deityMap,
        searchMatchIds,
        keyboardFocusedId,
        positioned,
        nodes,
        edges,
      };

      // Add parents above
      if (filters.parent) {
        addRelatedNodes(
          {
            relationships,
            filterFn: (r) =>
              r.toDeityId === focusDeityId &&
              r.relationshipType.toLowerCase().includes("parent"),
            getRelatedId: (r) => r.fromDeityId,
            positionFn: (idx) => ({
              x: 200 + idx * xSpacing,
              y: yOffset - ySpacing * 2,
            }),
            getEdgeSourceTarget: (focusId, relatedId) => ({
              source: relatedId,
              target: focusId,
            }),
            includeMarkerEnd: true,
          },
          layoutCtx,
        );
      }

      // Add children below
      if (filters.child) {
        addRelatedNodes(
          {
            relationships,
            filterFn: (r) =>
              r.fromDeityId === focusDeityId &&
              r.relationshipType.toLowerCase().includes("parent"),
            getRelatedId: (r) => r.toDeityId,
            positionFn: (idx) => ({ x: 200 + idx * xSpacing, y: yOffset }),
            getEdgeSourceTarget: (focusId, relatedId) => ({
              source: focusId,
              target: relatedId,
            }),
            includeMarkerEnd: true,
          },
          layoutCtx,
        );
      }

      // Add spouses to the side
      if (filters.spouse) {
        addRelatedNodes(
          {
            relationships,
            filterFn: (r) =>
              (r.fromDeityId === focusDeityId ||
                r.toDeityId === focusDeityId) &&
              r.relationshipType.toLowerCase().includes("spouse"),
            getRelatedId: (r) =>
              r.fromDeityId === focusDeityId ? r.toDeityId : r.fromDeityId,
            positionFn: (idx) => ({
              x: 700,
              y: yOffset - ySpacing + idx * 100,
            }),
            getEdgeSourceTarget: (focusId, relatedId) => ({
              source: focusId,
              target: relatedId,
            }),
            includeMarkerEnd: false,
          },
          layoutCtx,
        );
      }

      // Add siblings
      if (filters.sibling) {
        addRelatedNodes(
          {
            relationships,
            filterFn: (r) =>
              (r.fromDeityId === focusDeityId ||
                r.toDeityId === focusDeityId) &&
              r.relationshipType.toLowerCase().includes("sibling"),
            getRelatedId: (r) =>
              r.fromDeityId === focusDeityId ? r.toDeityId : r.fromDeityId,
            positionFn: (idx) => ({
              x: -100,
              y: yOffset - ySpacing + idx * 100,
            }),
            getEdgeSourceTarget: (focusId, relatedId) => ({
              source: focusId,
              target: relatedId,
            }),
            includeMarkerEnd: false,
          },
          layoutCtx,
        );
      }
    } else {
      // If no focus deity, layout all deities in a grid
      deities.forEach((deity, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        nodes.push({
          id: deity.id,
          type: "deityNode",
          // Pre-set dimensions so ReactFlow can render edges immediately
          // without waiting for ResizeObserver to measure. DeityNode card
          // has min-w-50 (200px) and a fixed two-line content height (~72px).
          width: 200,
          height: 72,
          data: {
            deity,
            isFocused: false,
            isSearchMatch: searchMatchIds.has(deity.id),
            isKeyboardFocused: keyboardFocusedId === deity.id,
          },
          position: { x: col * xSpacing, y: row * ySpacing },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });
      });

      // Add filtered edges
      relationships.forEach((rel) => {
        if (deityMap.has(rel.fromDeityId) && deityMap.has(rel.toDeityId)) {
          const relType = rel.relationshipType.toLowerCase();
          // Check if this relationship type is enabled in filters
          const shouldShow =
            (relType.includes("parent") && filters.parent) ||
            (relType.includes("child") && filters.child) ||
            (relType.includes("spouse") && filters.spouse) ||
            (relType.includes("sibling") && filters.sibling) ||
            (!relType.includes("parent") &&
              !relType.includes("child") &&
              !relType.includes("spouse") &&
              !relType.includes("sibling"));

          if (shouldShow) {
            edges.push({
              id: rel.id,
              source: rel.fromDeityId,
              target: rel.toDeityId,
              type: "smoothstep",
              animated: false,
              label: rel.relationshipType,
              style: {
                stroke: getEdgeColor(rel.relationshipType),
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: getEdgeColor(rel.relationshipType),
              },
            });
          }
        }
      });
    }

    return { nodes, edges };
  }, [
    deities,
    relationships,
    focusDeityId,
    deityMap,
    searchMatchIds,
    filters,
    keyboardFocusedId,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when keyboard focus or search matches change
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isKeyboardFocused: node.id === keyboardFocusedId,
          isSearchMatch: searchMatchIds.has(node.id),
        },
      })),
    );
  }, [keyboardFocusedId, searchMatchIds, setNodes]);

  // Center on first search match when there is one
  useEffect(() => {
    if (searchMatchIds.size > 0) {
      const matchId = Array.from(searchMatchIds)[0];
      const matchNode = getNodes().find((n) => n.id === matchId);
      if (matchNode) {
        setTimeout(() => {
          setCenter(matchNode.position.x + 100, matchNode.position.y + 50, {
            zoom: 1.2,
            duration: 500,
          });
        }, 100);
      }
    }
  }, [searchMatchIds, setCenter, getNodes]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Nested controls and React Flow nodes keep their own keyboard behavior.
      if (event.target !== event.currentTarget) return;

      // Escape clears focus (special case — not in the action map)
      if (event.key === "Escape") {
        setKeyboardFocusedId(null);
        event.preventDefault();
        return;
      }

      const action = keyActionMap[event.key];
      if (!action) return;

      const currentNav = keyboardFocusedId
        ? (navigationMap.get(keyboardFocusedId) ?? null)
        : null;
      const nodeIds = nodes.map((n) => n.id);

      const nextNodeId = action({
        currentNav,
        nodeIds,
        keyboardFocusedId,
        focusDeityId,
        deityMap,
        navigateToDeity: (slug) => router.push(`/deities/${slug}`),
      });

      event.preventDefault();

      if (nextNodeId && nodeIds.includes(nextNodeId)) {
        setKeyboardFocusedId(nextNodeId);
      }
    },
    [
      keyboardFocusedId,
      navigationMap,
      nodes,
      deityMap,
      focusDeityId,
      setKeyboardFocusedId,
      router,
    ],
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const deity = (node.data as { deity: Deity }).deity;
      // Set keyboard focus on click as well
      setKeyboardFocusedId(node.id);
      if (deity?.slug) {
        router.push(`/deities/${deity.slug}`);
      }
    },
    [router, setKeyboardFocusedId],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
      tabIndex={0}
      role="application"
      aria-roledescription="Family tree graph"
      aria-label="Family tree visualization. Use arrow keys to navigate between connected deities, Enter to select, Escape to deselect."
      aria-activedescendant={keyboardFocusedId ?? undefined}
      onKeyDown={handleKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
        minZoom={0.2}
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isKeyboardFocused) return "#b28f56"; // gold
            if (node.data.isSearchMatch) return "#c4a35a"; // gold-light
            return node.data.isFocused ? "#a67c52" : "#b28f56";
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  );
}

export function FamilyTreeVisualization({
  deities,
  relationships,
  focusDeityId,
}: Readonly<FamilyTreeVisualizationProps>) {
  // Track keyboard-focused node
  const [keyboardFocusedId, setKeyboardFocusedId] = useState<string | null>(
    null,
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<RelationshipFilters>({
    parent: true,
    child: true,
    spouse: true,
    sibling: true,
  });

  // Create a map of deity IDs to deities for quick lookup
  const deityMap = useMemo(() => {
    return new Map(deities.map((d) => [d.id, d]));
  }, [deities]);

  // Build navigation map for each deity (which nodes are connected in each direction)
  const navigationMap = useMemo(() => {
    const navMap = new Map<string, NavigationMap>();

    // Initialize empty navigation for all deities
    deities.forEach((d) => {
      navMap.set(d.id, {
        parents: [],
        children: [],
        siblings: [],
        spouses: [],
      });
    });

    // Build navigation based on relationships
    relationships.forEach((rel) => {
      const type = rel.relationshipType.toLowerCase();
      const fromNav = navMap.get(rel.fromDeityId);
      const toNav = navMap.get(rel.toDeityId);

      if (type.includes("parent")) {
        // fromDeity is parent of toDeity
        if (toNav && !toNav.parents.includes(rel.fromDeityId)) {
          toNav.parents.push(rel.fromDeityId);
        }
        if (fromNav && !fromNav.children.includes(rel.toDeityId)) {
          fromNav.children.push(rel.toDeityId);
        }
      } else if (type.includes("spouse")) {
        // Bidirectional spouse relationship
        if (fromNav && !fromNav.spouses.includes(rel.toDeityId)) {
          fromNav.spouses.push(rel.toDeityId);
        }
        if (toNav && !toNav.spouses.includes(rel.fromDeityId)) {
          toNav.spouses.push(rel.fromDeityId);
        }
      } else if (type.includes("sibling")) {
        // Bidirectional sibling relationship
        if (fromNav && !fromNav.siblings.includes(rel.toDeityId)) {
          fromNav.siblings.push(rel.toDeityId);
        }
        if (toNav && !toNav.siblings.includes(rel.fromDeityId)) {
          toNav.siblings.push(rel.fromDeityId);
        }
      }
    });

    return navMap;
  }, [deities, relationships]);

  // Calculate search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return deities
      .filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.domain?.some((domain) => domain.toLowerCase().includes(query)),
      )
      .slice(0, 10);
  }, [searchQuery, deities]);

  const searchMatchIds = useMemo(() => {
    return new Set(searchResults.map((d) => d.id));
  }, [searchResults]);

  const handleSearchSelect = useCallback(
    (deity: Deity) => {
      setSearchQuery(deity.name);
      setShowResults(false);
      // Also set keyboard focus to the selected deity
      setKeyboardFocusedId(deity.id);
    },
    [setKeyboardFocusedId],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setShowResults(false);
  }, []);

  const toggleFilter = useCallback((key: keyof RelationshipFilters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="relative">
            <label htmlFor="family-tree-search" className="sr-only">
              Search deities in family tree
            </label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="family-tree-search"
              type="text"
              placeholder="Search deities..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex min-w-6 min-h-6 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <SearchResults
              results={searchResults}
              onSelect={handleSearchSelect}
            />
          )}
        </div>

        {/* Filter Toggles */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Show:
          </span>
          <FilterButton
            label="Parents"
            active={filters.parent}
            color="#b28f56"
            onClick={() => toggleFilter("parent")}
          />
          <FilterButton
            label="Children"
            active={filters.child}
            color="#6b8f71"
            onClick={() => toggleFilter("child")}
          />
          <FilterButton
            label="Spouses"
            active={filters.spouse}
            color="#a67c52"
            onClick={() => toggleFilter("spouse")}
          />
          <FilterButton
            label="Siblings"
            active={filters.sibling}
            color="#8a8578"
            onClick={() => toggleFilter("sibling")}
          />
        </div>
      </div>

      {/* React Flow Visualization */}
      <div className="relative h-[min(70vh,42rem)] min-h-96 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
        <ReactFlowProvider>
          <FamilyTreeInner
            deities={deities}
            relationships={relationships}
            focusDeityId={focusDeityId}
            searchMatchIds={searchMatchIds}
            filters={filters}
            keyboardFocusedId={keyboardFocusedId}
            setKeyboardFocusedId={setKeyboardFocusedId}
            deityMap={deityMap}
            navigationMap={navigationMap}
          />
        </ReactFlowProvider>
      </div>

      {/* Relationship Type Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gold rounded"></div>
          <span>Parent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-patina rounded"></div>
          <span>Child</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-bronze rounded"></div>
          <span>Spouse</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-muted-foreground/60 rounded"></div>
          <span>Sibling</span>
        </div>
      </div>
    </div>
  );
}
