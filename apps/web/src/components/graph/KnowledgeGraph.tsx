'use client';

import { useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

// Types
interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
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
  onNodeClick?: (deityId: string, slug: string) => void;
}

// Pantheon color mapping
const PANTHEON_COLORS: Record<string, string> = {
  'greek-pantheon': '#3b82f6',     // Blue
  'norse-pantheon': '#10b981',     // Emerald
  'egyptian-pantheon': '#f59e0b',  // Amber
  'roman-pantheon': '#ef4444',     // Red
  'hindu-pantheon': '#8b5cf6',     // Purple
  'japanese-pantheon': '#ec4899',  // Pink
  'celtic-pantheon': '#14b8a6',    // Teal
  'aztec-pantheon': '#f97316',     // Orange
  'chinese-pantheon': '#eab308',   // Yellow
  'mesopotamian-pantheon': '#a16207', // Clay/Bronze
  'african-pantheon': '#7c3aed',   // Violet
  'polynesian-pantheon': '#06b6d4', // Cyan
  'mesoamerican-pantheon': '#65a30d', // Lime
};

const getPantheonColor = (pantheonId: string): string => {
  return PANTHEON_COLORS[pantheonId] || '#6b7280';
};

// Get edge style based on relationship type
const getEdgeStyle = (relationshipType: string, isCrossPantheon: boolean = false) => {
  const type = relationshipType.toLowerCase();

  if (isCrossPantheon) {
    return {
      stroke: '#fbbf24',
      strokeWidth: 3,
      strokeDasharray: undefined,
      filter: 'drop-shadow(0 0 6px #fbbf24)',
    };
  }

  if (type.includes('spouse') || type.includes('lover') || type === 'ally_of') {
    return {
      stroke: '#ec4899',
      strokeWidth: 2,
      strokeDasharray: '8 4',
    };
  }

  if (type.includes('sibling')) {
    return {
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDasharray: '4 2',
    };
  }

  // Parent/child - solid line
  return {
    stroke: '#64748b',
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
  };
}) {
  const { deity, pantheonColor, isHighlighted } = data;
  const nodeSize = deity.importanceRank && deity.importanceRank <= 5 ? 'large' : 'normal';

  return (
    <Card
      className={`
        transition-all duration-200 cursor-pointer
        ${nodeSize === 'large' ? 'p-3 min-w-[140px]' : 'p-2 min-w-[100px]'}
        ${isHighlighted ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/30' : ''}
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
            ${nodeSize === 'large' ? 'w-10 h-10' : 'w-7 h-7'}
          `}
          style={{ backgroundColor: pantheonColor }}
        >
          {deity.imageUrl ? (
            <Image
              src={deity.imageUrl}
              alt={deity.name}
              width={nodeSize === 'large' ? 40 : 28}
              height={nodeSize === 'large' ? 40 : 28}
              className="rounded-full object-cover"
            />
          ) : (
            <Sparkles className={`text-white ${nodeSize === 'large' ? 'h-5 w-5' : 'h-3.5 w-3.5'}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate text-slate-900 dark:text-slate-100 ${nodeSize === 'large' ? 'text-sm' : 'text-xs'}`}>
            {deity.name}
          </h3>
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

// Calculate layout positions using force-directed-like algorithm
function calculateLayout(
  deities: Deity[],
  relationships: Relationship[],
  clusterByPantheon: boolean,
  selectedPantheons: Set<string>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Filter deities by selected pantheons
  const filteredDeities = deities.filter(d => selectedPantheons.has(d.pantheonId));

  if (clusterByPantheon) {
    // Group by pantheon and arrange in clusters
    const pantheonGroups = new Map<string, Deity[]>();

    filteredDeities.forEach(deity => {
      const group = pantheonGroups.get(deity.pantheonId) || [];
      group.push(deity);
      pantheonGroups.set(deity.pantheonId, group);
    });

    const pantheonList = Array.from(pantheonGroups.entries());
    const numPantheons = pantheonList.length;
    const clusterRadius = 600;
    const nodeSpacing = 180;

    pantheonList.forEach(([pantheonId, deities], clusterIndex) => {
      // Position cluster centers in a circle
      const clusterAngle = (clusterIndex / numPantheons) * 2 * Math.PI - Math.PI / 2;
      const clusterCenterX = Math.cos(clusterAngle) * clusterRadius;
      const clusterCenterY = Math.sin(clusterAngle) * clusterRadius;

      // Sort deities by importance within cluster
      const sortedDeities = [...deities].sort((a, b) =>
        (a.importanceRank || 999) - (b.importanceRank || 999)
      );

      // Arrange deities in a smaller circle around cluster center
      const innerRadius = Math.max(100, sortedDeities.length * 30);

      sortedDeities.forEach((deity, index) => {
        if (index === 0 && deity.importanceRank === 1) {
          // Put the most important deity at center
          positions.set(deity.id, {
            x: clusterCenterX,
            y: clusterCenterY,
          });
        } else {
          const angle = ((index - 1) / Math.max(1, sortedDeities.length - 1)) * 2 * Math.PI;
          positions.set(deity.id, {
            x: clusterCenterX + Math.cos(angle) * innerRadius,
            y: clusterCenterY + Math.sin(angle) * innerRadius,
          });
        }
      });
    });
  } else {
    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(filteredDeities.length));
    const spacing = 200;

    // Sort by importance first
    const sortedDeities = [...filteredDeities].sort((a, b) =>
      (a.importanceRank || 999) - (b.importanceRank || 999)
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
  pantheons,
  selectedPantheons,
  relationshipFilters,
  clusterByPantheon,
  onNodeClick,
  highlightedNodeId,
  setHighlightedNodeId,
}: KnowledgeGraphProps & {
  highlightedNodeId: string | null;
  setHighlightedNodeId: (id: string | null) => void;
}) {
  const { setCenter, zoomIn, zoomOut, fitView } = useReactFlow();

  // Create deity map for quick lookups
  const deityMap = useMemo(() => new Map(deities.map(d => [d.id, d])), [deities]);

  // Calculate positions
  const positions = useMemo(
    () => calculateLayout(deities, relationships, clusterByPantheon, selectedPantheons),
    [deities, relationships, clusterByPantheon, selectedPantheons]
  );

  // Build nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const addedEdges = new Set<string>();

    // Filter deities by selected pantheons
    const filteredDeities = deities.filter(d => selectedPantheons.has(d.pantheonId));
    const filteredDeityIds = new Set(filteredDeities.map(d => d.id));

    // Create nodes
    filteredDeities.forEach(deity => {
      const position = positions.get(deity.id) || { x: 0, y: 0 };

      nodes.push({
        id: deity.id,
        type: 'deityNode',
        position,
        data: {
          deity,
          pantheonColor: getPantheonColor(deity.pantheonId),
          isHighlighted: highlightedNodeId === deity.id,
          showImage: true,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    // Create edges from relationships
    relationships.forEach(rel => {
      if (!filteredDeityIds.has(rel.fromDeityId) || !filteredDeityIds.has(rel.toDeityId)) {
        return;
      }

      const relType = rel.relationshipType.toLowerCase();

      // Check filters
      const isParentChild = relType.includes('parent');
      const isSpouse = relType.includes('spouse') || relType.includes('lover') || relType === 'ally_of';
      const isSibling = relType.includes('sibling');

      if (isParentChild && !relationshipFilters.parent) return;
      if (isSpouse && !relationshipFilters.spouse) return;
      if (isSibling && !relationshipFilters.sibling) return;

      const edgeKey = [rel.fromDeityId, rel.toDeityId].sort().join('-');
      if (addedEdges.has(edgeKey)) return;
      addedEdges.add(edgeKey);

      const style = getEdgeStyle(rel.relationshipType);

      edges.push({
        id: rel.id,
        source: rel.fromDeityId,
        target: rel.toDeityId,
        type: 'smoothstep',
        animated: false,
        style,
        markerEnd: isParentChild ? {
          type: MarkerType.ArrowClosed,
          color: style.stroke,
        } : undefined,
      });
    });

    // Add cross-pantheon parallel edges
    if (relationshipFilters.crossPantheon) {
      filteredDeities.forEach(deity => {
        if (!deity.crossPantheonParallels) return;

        deity.crossPantheonParallels.forEach(parallel => {
          if (!filteredDeityIds.has(parallel.deityId)) return;

          const edgeKey = [deity.id, parallel.deityId].sort().join('-cross-');
          if (addedEdges.has(edgeKey)) return;
          addedEdges.add(edgeKey);

          const style = getEdgeStyle('cross', true);

          edges.push({
            id: `cross-${deity.id}-${parallel.deityId}`,
            source: deity.id,
            target: parallel.deityId,
            type: 'smoothstep',
            animated: true,
            style,
            label: 'Parallel',
            labelStyle: { fill: '#fbbf24', fontSize: 10 },
            labelBgStyle: { fill: 'transparent' },
          });
        });
      });
    }

    return { nodes, edges };
  }, [deities, relationships, selectedPantheons, relationshipFilters, positions, highlightedNodeId]);

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
      if (onNodeClick) {
        onNodeClick(deity.id, deity.slug);
      }
    },
    [onNodeClick]
  );

  // Handle node hover
  const handleNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setHighlightedNodeId(node.id);
    },
    [setHighlightedNodeId]
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
  }, [fitView, selectedPantheons, clusterByPantheon]);

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
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <KnowledgeGraphInner
          {...props}
          highlightedNodeId={highlightedNodeId}
          setHighlightedNodeId={setHighlightedNodeId}
        />
      </ReactFlowProvider>
    </div>
  );
}

// Export pantheon colors for legend
export { PANTHEON_COLORS, getPantheonColor };
