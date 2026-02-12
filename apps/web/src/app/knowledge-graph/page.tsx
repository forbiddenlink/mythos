'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Network, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KnowledgeGraph, PANTHEON_COLORS } from '@/components/graph/KnowledgeGraph';
import { GraphControls } from '@/components/graph/GraphControls';
import { GraphLegend } from '@/components/graph/GraphLegend';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

// Import data directly
import deitiesData from '@/data/deities.json';
import relationshipsData from '@/data/relationships.json';
import pantheonsData from '@/data/pantheons.json';

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

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusterByPantheon, setClusterByPantheon] = useState(true);

  // Initialize with all pantheons selected
  const [selectedPantheons, setSelectedPantheons] = useState<Set<string>>(
    () => new Set((pantheonsData as Pantheon[]).map(p => p.id))
  );

  // Relationship filters
  const [relationshipFilters, setRelationshipFilters] = useState({
    parent: true,
    spouse: true,
    sibling: true,
    crossPantheon: true,
  });

  // Cast data to proper types
  const deities = deitiesData as Deity[];
  const relationships = relationshipsData as Relationship[];
  const pantheons = pantheonsData as Pantheon[];

  // Prepare pantheon colors for legend
  const pantheonColors = useMemo(() => {
    return pantheons.map(p => ({
      id: p.id,
      name: p.name.replace(' Pantheon', ''),
      color: PANTHEON_COLORS[p.id] || '#6b7280',
    }));
  }, [pantheons]);

  // Handlers
  const handleNodeClick = useCallback(
    (deityId: string, slug: string) => {
      router.push(`/deities/${slug}`);
    },
    [router]
  );

  const handleZoomIn = useCallback(() => {
    // ReactFlow controls handle this internally
  }, []);

  const handleZoomOut = useCallback(() => {
    // ReactFlow controls handle this internally
  }, []);

  const handleFitView = useCallback(() => {
    // ReactFlow controls handle this internally
  }, []);

  const handleCenterNode = useCallback((nodeId: string) => {
    // This would be handled by ReactFlow - for now we just highlight
    console.log('Center on node:', nodeId);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const filteredDeities = deities.filter(d => selectedPantheons.has(d.pantheonId));
    const filteredDeityIds = new Set(filteredDeities.map(d => d.id));

    const filteredRelationships = relationships.filter(
      r => filteredDeityIds.has(r.fromDeityId) && filteredDeityIds.has(r.toDeityId)
    );

    const crossPantheonCount = filteredDeities.reduce((count, d) => {
      if (!d.crossPantheonParallels) return count;
      return count + d.crossPantheonParallels.filter(p => filteredDeityIds.has(p.deityId)).length;
    }, 0);

    return {
      deities: filteredDeities.length,
      relationships: filteredRelationships.length,
      crossPantheon: crossPantheonCount / 2, // Divide by 2 since each connection is counted twice
    };
  }, [deities, relationships, selectedPantheons]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950">
        {/* Fullscreen header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-950 to-transparent">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-400" />
              Knowledge Graph
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800"
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        </div>

        {/* Fullscreen controls */}
        <div className="absolute top-16 left-4 z-10 w-80">
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
          />
        </div>

        {/* Fullscreen legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <GraphLegend pantheonColors={pantheonColors} />
        </div>

        {/* Graph */}
        <div className="w-full h-full">
          <KnowledgeGraph
            deities={deities}
            relationships={relationships}
            pantheons={pantheons}
            selectedPantheons={selectedPantheons}
            relationshipFilters={relationshipFilters}
            clusterByPantheon={clusterByPantheon}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/family-tree-hero.png"
            alt="Knowledge Graph"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/70 to-purple-900/80" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white">
                Knowledge Graph
              </h1>
              <p className="text-lg text-slate-200 mt-1 font-light">
                Explore deity relationships across all mythologies
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.deities}</div>
              <div className="text-sm text-slate-300">Deities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.relationships}</div>
              <div className="text-sm text-slate-300">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{Math.floor(stats.crossPantheon)}</div>
              <div className="text-sm text-slate-300">Cross-Pantheon Links</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        {/* Controls Bar */}
        <div className="mb-6">
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
          />
        </div>

        {/* Main Graph Card */}
        <Card className="bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif flex items-center gap-2">
                <Network className="h-5 w-5 text-indigo-500" />
                Interactive Graph
                <span className="text-muted-foreground font-sans font-normal text-sm opacity-60">
                  {selectedPantheons.size} pantheon{selectedPantheons.size !== 1 ? 's' : ''} selected
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[600px] relative">
              <KnowledgeGraph
                deities={deities}
                relationships={relationships}
                pantheons={pantheons}
                selectedPantheons={selectedPantheons}
                relationshipFilters={relationshipFilters}
                clusterByPantheon={clusterByPantheon}
                onNodeClick={handleNodeClick}
              />

              {/* Floating Legend */}
              <div className="absolute bottom-4 left-4">
                <GraphLegend pantheonColors={pantheonColors} className="max-w-xs" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium font-serif">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>- Drag to pan around the graph</p>
              <p>- Scroll to zoom in/out</p>
              <p>- Click on a deity node to view their profile</p>
              <p>- Use filters to show/hide relationship types</p>
              <p>- Toggle clustering to group by pantheon</p>
              <p>- Use the minimap for quick navigation</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium font-serif">About Cross-Pantheon Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                The golden glowing connections show parallel deities across different mythologies.
                These represent similar gods with shared attributes or roles:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Zeus (Greek) = Jupiter (Roman) = Odin (Norse)</li>
                <li>Aphrodite (Greek) = Venus (Roman) = Freyja (Norse)</li>
                <li>Hades (Greek) = Pluto (Roman) = Osiris (Egyptian)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
