'use client';

import { useState, useMemo, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { Button } from '@/components/ui/button';
import { Sparkles, ZoomIn, ZoomOut, Maximize2, Users } from 'lucide-react';
import type { RawNodeDatum, TreeNodeDatum } from 'react-d3-tree';

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

interface EnhancedFamilyTreeProps {
  deities: Deity[];
  relationships: Relationship[];
  focusDeityId?: string;
}

interface CustomNodeDatum extends RawNodeDatum {
  deity: Deity;
  relationshipType?: string;
}

// Custom node rendering with HTML
const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
}: {
  nodeDatum: TreeNodeDatum;
  toggleNode: () => void;
}) => {
  const customNode = nodeDatum as TreeNodeDatum & { deity?: Deity; relationshipType?: string };
  const deity = customNode.deity;
  
  if (!deity) return null;

  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const genderColor = deity.gender === 'male' 
    ? 'from-blue-500 to-cyan-600' 
    : deity.gender === 'female' 
    ? 'from-pink-500 to-rose-600' 
    : 'from-amber-500 to-orange-600';

  return (
    <g>
      <foreignObject width={220} height={100} x={-110} y={-50}>
        <div className="flex flex-col items-center">
          <div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 border-2 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer w-50"
            onClick={toggleNode}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${genderColor} flex items-center justify-center shrink-0`}>
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                {deity.name}
              </h3>
            </div>
            {deity.domain && deity.domain.length > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {deity.domain.slice(0, 2).join(', ')}
              </p>
            )}
            {hasChildren && (
              <div className="mt-2 text-center">
                <span className="text-xs text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" />
                  {nodeDatum.children?.length} {nodeDatum.children?.length === 1 ? 'child' : 'children'}
                </span>
              </div>
            )}
          </div>
          {customNode.relationshipType && (
            <div className="mt-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs">
              {customNode.relationshipType}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

// Build hierarchical tree structure
function buildTreeData(
  deities: Deity[],
  relationships: Relationship[],
  rootDeityId?: string
): CustomNodeDatum | null {
  const deityMap = new Map(deities.map(d => [d.id, d]));
  
  // Find root deity (one without parents or the focused deity)
  let rootId = rootDeityId;
  if (!rootId) {
    const childIds = new Set(
      relationships
        .filter(r => r.relationshipType.toLowerCase() === 'parent')
        .map(r => r.toDeityId)
    );
    rootId = deities.find(d => !childIds.has(d.id))?.id || deities[0]?.id;
  }

  if (!rootId || !deityMap.has(rootId)) return null;

  const buildNode = (deityId: string, visited = new Set<string>()): CustomNodeDatum | null => {
    if (visited.has(deityId)) return null;
    visited.add(deityId);

    const deity = deityMap.get(deityId);
    if (!deity) return null;

    const children: CustomNodeDatum[] = [];
    
    // Add children
    const childRelationships = relationships.filter(
      r => r.deityId === deityId && r.relationshipType.toLowerCase() === 'child'
    );
    
    for (const rel of childRelationships) {
      const childNode = buildNode(rel.relatedDeityId, new Set(visited));
      if (childNode) {
        childNode.relationshipType = 'Child';
        children.push(childNode);
      }
    }

    // Add spouses as children (shown side by side)
    const spouseRelationships = relationships.filter(
      r => (r.deityId === deityId || r.relatedDeityId === deityId) && 
           r.relationshipType.toLowerCase() === 'spouse'
    );
    
    for (const rel of spouseRelationships) {
      const spouseId = rel.deityId === deityId ? rel.relatedDeityId : rel.deityId;
      if (!visited.has(spouseId)) {
        const spouseDeity = deityMap.get(spouseId);
        if (spouseDeity) {
          children.push({
            name: spouseDeity.name,
            deity: spouseDeity,
            relationshipType: 'Spouse',
            children: [],
          });
        }
      }
    }

    return {
      name: deity.name,
      deity,
      children: children.length > 0 ? children : undefined,
    };
  };

  return buildNode(rootId);
}

export function EnhancedFamilyTree({ 
  deities, 
  relationships, 
  focusDeityId 
}: EnhancedFamilyTreeProps) {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);

  const treeData = useMemo(() => {
    const data = buildTreeData(deities, relationships, focusDeityId);
    return data;
  }, [deities, relationships, focusDeityId]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.2));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(0.8);
    setTranslate({ x: 0, y: 0 });
  }, []);

  if (!treeData) {
    return (
      <div className="text-center py-12 text-slate-600 dark:text-slate-400">
        No family tree data available
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-white dark:bg-slate-900"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-white dark:bg-slate-900"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-white dark:bg-slate-900"
          aria-label="Reset view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Tree Container */}
      <div className="w-full h-200 bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <Tree
          data={treeData}
          translate={translate}
          zoom={zoom}
          onUpdate={(state) => {
            setTranslate(state.translate);
            setZoom(state.zoom);
          }}
          orientation="vertical"
          pathFunc="step"
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 240, y: 180 }}
          renderCustomNodeElement={renderForeignObjectNode}
          collapsible={true}
          initialDepth={2}
          enableLegacyTransitions={true}
          transitionDuration={500}
          depthFactor={200}
          pathClassFunc={() => 'custom-link'}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-linear-to-br from-blue-500 to-cyan-600"></div>
          <span>Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-linear-to-br from-pink-500 to-rose-600"></div>
          <span>Female</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-linear-to-br from-amber-500 to-orange-600"></div>
          <span>Unknown</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-teal-500"></div>
          <span>Family Connection</span>
        </div>
        <div className="ml-auto text-xs">
          💡 Click nodes to expand/collapse branches
        </div>
      </div>
    </div>
  );
}
