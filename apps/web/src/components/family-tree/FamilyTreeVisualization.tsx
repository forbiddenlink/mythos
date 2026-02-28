'use client';

import { useMemo, useState, useCallback, useRef, KeyboardEvent, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, X } from 'lucide-react';

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

const DeityNode = ({
  data,
}: {
  data: { deity: Deity; isFocused: boolean; isSearchMatch: boolean; isKeyboardFocused: boolean };
}) => {
  const { deity, isFocused, isSearchMatch, isKeyboardFocused } = data;

  // Determine node styling based on state
  let ringClass = '';
  if (isKeyboardFocused) {
    // Keyboard focus gets highest priority - cyan ring with glow
    ringClass = 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/40 outline-none';
  } else if (isSearchMatch) {
    ringClass = 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/30';
  } else if (isFocused) {
    ringClass = 'ring-2 ring-teal-500 shadow-lg';
  }

  return (
    <Card
      className={`p-4 min-w-50 bg-white dark:bg-slate-900 transition-shadow duration-150 ${ringClass}`}
      role="treeitem"
      aria-label={`${deity.name}${deity.domain && deity.domain.length > 0 ? `, ${deity.domain[0]}` : ''}`}
      aria-selected={isKeyboardFocused || isFocused}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0`}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
            {deity.name}
          </h3>
          {deity.domain && deity.domain.length > 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{deity.domain[0]}</p>
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
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={`text-xs h-7 ${active ? '' : 'opacity-60'}`}
      style={
        active ? { backgroundColor: color, borderColor: color } : { borderColor: color, color }
      }
    >
      {label}
    </Button>
  );
}

// Search results dropdown component
function SearchResults({
  results,
  onSelect,
}: {
  results: Deity[];
  onSelect: (deity: Deity) => void;
}) {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
      {results.map((deity) => (
        <button
          key={deity.id}
          onClick={() => onSelect(deity)}
          className="w-full px-3 py-2 text-left hover:bg-slate-800 text-slate-100 text-sm flex items-center gap-2 border-b border-slate-700 last:border-b-0"
        >
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <div className="font-medium">{deity.name}</div>
            {deity.domain && deity.domain.length > 0 && (
              <div className="text-xs text-slate-400">{deity.domain[0]}</div>
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
}: {
  deities: Deity[];
  relationships: Relationship[];
  focusDeityId?: string;
  searchMatchIds: Set<string>;
  filters: RelationshipFilters;
  keyboardFocusedId: string | null;
  setKeyboardFocusedId: (id: string | null) => void;
  deityMap: Map<string, Deity>;
  navigationMap: Map<string, NavigationMap>;
}) {
  const { setCenter, getNodes } = useReactFlow();
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
        type: 'deityNode',
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

      // Add parents above (if filter enabled)
      if (filters.parent) {
        const parents = relationships.filter(
          (r) =>
            r.toDeityId === focusDeityId && r.relationshipType.toLowerCase().includes('parent')
        );
        parents.forEach((rel, idx) => {
          const parentDeity = deityMap.get(rel.fromDeityId);
          if (parentDeity && !positioned.has(parentDeity.id)) {
            nodes.push({
              id: parentDeity.id,
              type: 'deityNode',
              data: {
                deity: parentDeity,
                isFocused: false,
                isSearchMatch: searchMatchIds.has(parentDeity.id),
                isKeyboardFocused: keyboardFocusedId === parentDeity.id,
              },
              position: { x: 200 + idx * xSpacing, y: yOffset - ySpacing * 2 },
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
      }

      // Add children below (if filter enabled)
      if (filters.child) {
        const children = relationships.filter(
          (r) =>
            r.fromDeityId === focusDeityId && r.relationshipType.toLowerCase().includes('parent')
        );
        children.forEach((rel, idx) => {
          const childDeity = deityMap.get(rel.toDeityId);
          if (childDeity && !positioned.has(childDeity.id)) {
            nodes.push({
              id: childDeity.id,
              type: 'deityNode',
              data: {
                deity: childDeity,
                isFocused: false,
                isSearchMatch: searchMatchIds.has(childDeity.id),
                isKeyboardFocused: keyboardFocusedId === childDeity.id,
              },
              position: { x: 200 + idx * xSpacing, y: yOffset },
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
      }

      // Add spouses to the side (if filter enabled)
      if (filters.spouse) {
        const spouses = relationships.filter(
          (r) =>
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
              data: {
                deity: spouseDeity,
                isFocused: false,
                isSearchMatch: searchMatchIds.has(spouseDeity.id),
                isKeyboardFocused: keyboardFocusedId === spouseDeity.id,
              },
              position: { x: 700, y: yOffset - ySpacing + idx * 100 },
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
      }

      // Add siblings (if filter enabled)
      if (filters.sibling) {
        const siblings = relationships.filter(
          (r) =>
            (r.fromDeityId === focusDeityId || r.toDeityId === focusDeityId) &&
            r.relationshipType.toLowerCase().includes('sibling')
        );
        siblings.forEach((rel, idx) => {
          const siblingId = rel.fromDeityId === focusDeityId ? rel.toDeityId : rel.fromDeityId;
          const siblingDeity = deityMap.get(siblingId);
          if (siblingDeity && !positioned.has(siblingDeity.id)) {
            nodes.push({
              id: siblingDeity.id,
              type: 'deityNode',
              data: {
                deity: siblingDeity,
                isFocused: false,
                isSearchMatch: searchMatchIds.has(siblingDeity.id),
                isKeyboardFocused: keyboardFocusedId === siblingDeity.id,
              },
              position: { x: -100, y: yOffset - ySpacing + idx * 100 },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
            });
            positioned.add(siblingDeity.id);

            edges.push({
              id: rel.id,
              source: focusDeityId,
              target: siblingDeity.id,
              type: 'smoothstep',
              animated: false,
              label: rel.relationshipType,
              style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
            });
          }
        });
      }
    } else {
      // If no focus deity, layout all deities in a grid
      deities.forEach((deity, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        nodes.push({
          id: deity.id,
          type: 'deityNode',
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
            (relType.includes('parent') && filters.parent) ||
            (relType.includes('child') && filters.child) ||
            (relType.includes('spouse') && filters.spouse) ||
            (relType.includes('sibling') && filters.sibling) ||
            (!relType.includes('parent') &&
              !relType.includes('child') &&
              !relType.includes('spouse') &&
              !relType.includes('sibling'));

          if (shouldShow) {
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
        }
      });
    }

    return { nodes, edges };
  }, [deities, relationships, focusDeityId, deityMap, searchMatchIds, filters, keyboardFocusedId]);

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
      }))
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
      // Don't handle if focus is in an input field
      if (event.target instanceof HTMLInputElement) return;

      const currentNav = keyboardFocusedId ? navigationMap.get(keyboardFocusedId) : null;
      const nodeIds = nodes.map((n) => n.id);
      let nextNodeId: string | null = null;

      switch (event.key) {
        case 'ArrowUp':
          // Move to parent
          if (currentNav && currentNav.parents.length > 0) {
            nextNodeId = currentNav.parents[0];
          }
          event.preventDefault();
          break;

        case 'ArrowDown':
          // Move to child
          if (currentNav && currentNav.children.length > 0) {
            nextNodeId = currentNav.children[0];
          }
          event.preventDefault();
          break;

        case 'ArrowLeft':
          // Move to sibling or spouse (left direction)
          if (currentNav) {
            const laterals = [...currentNav.siblings, ...currentNav.spouses];
            if (laterals.length > 0) {
              // Find current index in laterals or pick first
              const currentIndex = laterals.indexOf(keyboardFocusedId || '');
              nextNodeId = laterals[Math.max(0, currentIndex - 1)] || laterals[0];
            }
          }
          event.preventDefault();
          break;

        case 'ArrowRight':
          // Move to sibling or spouse (right direction)
          if (currentNav) {
            const laterals = [...currentNav.siblings, ...currentNav.spouses];
            if (laterals.length > 0) {
              const currentIndex = laterals.indexOf(keyboardFocusedId || '');
              nextNodeId = laterals[Math.min(laterals.length - 1, currentIndex + 1)] || laterals[0];
            }
          }
          event.preventDefault();
          break;

        case 'Enter':
          // Navigate to deity page or select node
          if (keyboardFocusedId) {
            const deity = deityMap.get(keyboardFocusedId);
            if (deity?.slug) {
              window.location.href = `/deities/${deity.slug}`;
            }
          } else if (nodeIds.length > 0) {
            // If no node focused, focus the first one
            nextNodeId = focusDeityId || nodeIds[0];
          }
          event.preventDefault();
          break;

        case 'Escape':
          // Deselect current node
          setKeyboardFocusedId(null);
          event.preventDefault();
          break;

        case 'Tab':
          // Tab through nodes sequentially
          if (!event.shiftKey) {
            const currentIndex = keyboardFocusedId ? nodeIds.indexOf(keyboardFocusedId) : -1;
            nextNodeId = nodeIds[(currentIndex + 1) % nodeIds.length];
          } else {
            const currentIndex = keyboardFocusedId ? nodeIds.indexOf(keyboardFocusedId) : nodeIds.length;
            nextNodeId = nodeIds[(currentIndex - 1 + nodeIds.length) % nodeIds.length];
          }
          event.preventDefault();
          break;

        case 'Home':
          // Jump to first node
          if (nodeIds.length > 0) {
            nextNodeId = nodeIds[0];
          }
          event.preventDefault();
          break;

        case 'End':
          // Jump to last node
          if (nodeIds.length > 0) {
            nextNodeId = nodeIds[nodeIds.length - 1];
          }
          event.preventDefault();
          break;
      }

      // Update focus if we have a new target
      if (nextNodeId && nodeIds.includes(nextNodeId)) {
        setKeyboardFocusedId(nextNodeId);
      }
    },
    [keyboardFocusedId, navigationMap, nodes, deityMap, focusDeityId, setKeyboardFocusedId]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const deity = (node.data as { deity: Deity }).deity;
      // Set keyboard focus on click as well
      setKeyboardFocusedId(node.id);
      if (deity?.slug) {
        window.location.href = `/deities/${deity.slug}`;
      }
    },
    [setKeyboardFocusedId]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      tabIndex={0}
      role="tree"
      aria-label="Family tree visualization. Use arrow keys to navigate between connected deities, Enter to select, Escape to deselect."
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
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isKeyboardFocused) return '#22d3ee'; // cyan-400
            if (node.data.isSearchMatch) return '#fbbf24'; // amber-400
            return node.data.isFocused ? '#8b5cf6' : '#f59e0b';
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
}: FamilyTreeVisualizationProps) {
  // Track keyboard-focused node
  const [keyboardFocusedId, setKeyboardFocusedId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
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
      navMap.set(d.id, { parents: [], children: [], siblings: [], spouses: [] });
    });

    // Build navigation based on relationships
    relationships.forEach((rel) => {
      const type = rel.relationshipType.toLowerCase();
      const fromNav = navMap.get(rel.fromDeityId);
      const toNav = navMap.get(rel.toDeityId);

      if (type.includes('parent')) {
        // fromDeity is parent of toDeity
        if (toNav && !toNav.parents.includes(rel.fromDeityId)) {
          toNav.parents.push(rel.fromDeityId);
        }
        if (fromNav && !fromNav.children.includes(rel.toDeityId)) {
          fromNav.children.push(rel.toDeityId);
        }
      } else if (type.includes('spouse')) {
        // Bidirectional spouse relationship
        if (fromNav && !fromNav.spouses.includes(rel.toDeityId)) {
          fromNav.spouses.push(rel.toDeityId);
        }
        if (toNav && !toNav.spouses.includes(rel.fromDeityId)) {
          toNav.spouses.push(rel.fromDeityId);
        }
      } else if (type.includes('sibling')) {
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
          d.domain?.some((domain) => domain.toLowerCase().includes(query))
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
    [setKeyboardFocusedId]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
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
            <label htmlFor="family-tree-search" className="sr-only">Search deities in family tree</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
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
              className="pl-9 pr-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <SearchResults results={searchResults} onSelect={handleSearchSelect} />
          )}
        </div>

        {/* Filter Toggles */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center mr-1">Show:</span>
          <FilterButton
            label="Parents"
            active={filters.parent}
            color="#3b82f6"
            onClick={() => toggleFilter('parent')}
          />
          <FilterButton
            label="Children"
            active={filters.child}
            color="#10b981"
            onClick={() => toggleFilter('child')}
          />
          <FilterButton
            label="Spouses"
            active={filters.spouse}
            color="#ec4899"
            onClick={() => toggleFilter('spouse')}
          />
          <FilterButton
            label="Siblings"
            active={filters.sibling}
            color="#a855f7"
            onClick={() => toggleFilter('sibling')}
          />
        </div>
      </div>

      {/* React Flow Visualization */}
      <div className="w-full h-150 border border-slate-700 rounded-lg overflow-hidden relative">
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
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
          <span>Parent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-emerald-500 rounded"></div>
          <span>Child</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-pink-500 rounded"></div>
          <span>Spouse</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-purple-500 rounded"></div>
          <span>Sibling</span>
        </div>
      </div>
    </div>
  );
}
