'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

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

const getEdgeColor = (relationshipType: string) => {
  switch (relationshipType.toLowerCase()) {
    case 'parent':
      return '#3b82f6';
    case 'child':
      return '#10b981';
    case 'spouse':
      return '#ec4899';
    case 'sibling':
      return '#a855f7';
    default:
      return '#f59e0b';
  }
};

const DeityNode = ({ data }: { data: { deity: Deity; isFocused: boolean } }) => {
  const { deity, isFocused } = data;
  
  return (
    <Card className={`p-4 min-w-50 bg-white dark:bg-slate-900 ${isFocused ? 'ring-2 ring-teal-500 shadow-lg' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0`}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{deity.name}</h3>
          {deity.domain && deity.domain.length > 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
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

export function FamilyTreeVisualization({ 
  deities, 
  relationships, 
  focusDeityId 
}: FamilyTreeVisualizationProps) {
  // Create a map of deity IDs to deities for quick lookup
  const deityMap = useMemo(() => {
    return new Map(deities.map(d => [d.id, d]));
  }, [deities]);

  // Calculate layout using a hierarchical approach
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Group relationships by type
    const relationshipsByType = new Map<string, Relationship[]>();
    relationships.forEach(rel => {
      const type = rel.relationshipType.toLowerCase();
      if (!relationshipsByType.has(type)) {
        relationshipsByType.set(type, []);
      }
      relationshipsByType.get(type)!.push(rel);
    });

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
        type: 'deityNode',
        data: { deity, isFocused: true },
        position: { x: 400, y: yOffset },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      positioned.add(deity.id);
      yOffset += ySpacing;

      // Add parents above
      const parents = relationships.filter(r => 
        r.toDeityId === focusDeityId && r.relationshipType.toLowerCase().includes('parent')
      );
      parents.forEach((rel, idx) => {
        const parentDeity = deityMap.get(rel.fromDeityId);
        if (parentDeity && !positioned.has(parentDeity.id)) {
          nodes.push({
            id: parentDeity.id,
            type: 'deityNode',
            data: { deity: parentDeity, isFocused: false },
            position: { x: 200 + (idx * xSpacing), y: yOffset - ySpacing * 2 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          });
          positioned.add(parentDeity.id);
          
          edges.push({
            id: rel.id,
            source: parentDeity.id,
            target: focusDeityId,
            type: 'smoothstep',
            animated: false,
            label: rel.relationshipType,
            style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: getEdgeColor(rel.relationshipType) },
          });
        }
      });

      // Add children below
      const children = relationships.filter(r => 
        r.fromDeityId === focusDeityId && r.relationshipType.toLowerCase().includes('parent')
      );
      children.forEach((rel, idx) => {
        const childDeity = deityMap.get(rel.toDeityId);
        if (childDeity && !positioned.has(childDeity.id)) {
          nodes.push({
            id: childDeity.id,
            type: 'deityNode',
            data: { deity: childDeity, isFocused: false },
            position: { x: 200 + (idx * xSpacing), y: yOffset },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          });
          positioned.add(childDeity.id);
          
          edges.push({
            id: rel.id,
            source: focusDeityId,
            target: childDeity.id,
            type: 'smoothstep',
            animated: false,
            label: rel.relationshipType,
            style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: getEdgeColor(rel.relationshipType) },
          });
        }
      });

      // Add spouses to the side
      const spouses = relationships.filter(r => 
        (r.fromDeityId === focusDeityId || r.toDeityId === focusDeityId) && 
        r.relationshipType.toLowerCase().includes('spouse')
      );
      spouses.forEach((rel, idx) => {
        const spouseId = rel.fromDeityId === focusDeityId ? rel.toDeityId : rel.fromDeityId;
        const spouseDeity = deityMap.get(spouseId);
        if (spouseDeity && !positioned.has(spouseDeity.id)) {
          nodes.push({
            id: spouseDeity.id,
            type: 'deityNode',
            data: { deity: spouseDeity, isFocused: false },
            position: { x: 700, y: yOffset - ySpacing + (idx * 100) },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          });
          positioned.add(spouseDeity.id);
          
          edges.push({
            id: rel.id,
            source: focusDeityId,
            target: spouseDeity.id,
            type: 'smoothstep',
            animated: false,
            label: rel.relationshipType,
            style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
          });
        }
      });
    } else {
      // If no focus deity, layout all deities in a grid
      deities.forEach((deity, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        nodes.push({
          id: deity.id,
          type: 'deityNode',
          data: { deity, isFocused: false },
          position: { x: col * xSpacing, y: row * ySpacing },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });
      });

      // Add all edges
      relationships.forEach(rel => {
        if (deityMap.has(rel.fromDeityId) && deityMap.has(rel.toDeityId)) {
          edges.push({
            id: rel.id,
            source: rel.fromDeityId,
            target: rel.toDeityId,
            type: 'smoothstep',
            animated: false,
            label: rel.relationshipType,
            style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: getEdgeColor(rel.relationshipType) },
          });
        }
      });
    }

    return { nodes, edges };
  }, [deities, relationships, focusDeityId, deityMap]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    const deity = (node.data as { deity: Deity }).deity;
    if (deity?.slug) {
      window.location.href = `/deities/${deity.slug}`;
    }
  };

  return (
    <div className="w-full h-150 border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            return node.data.isFocused ? '#8b5cf6' : '#f59e0b';
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  );
}
