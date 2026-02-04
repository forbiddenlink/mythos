'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Network, GitBranch } from 'lucide-react';
import Image from 'next/image';
import { FamilyTreeVisualization } from '@/components/family-tree/FamilyTreeVisualization';
import { EnhancedFamilyTree } from '@/components/family-tree/EnhancedFamilyTree';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

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

export default function FamilyTreePage() {
  const [viewMode, setViewMode] = useState<'hierarchical' | 'network'>('hierarchical');
  const { data: deitiesData, isLoading: deitiesLoading } = useQuery<{ deities: Deity[] }>({
    queryKey: ['all-deities-family-tree'],
    queryFn: async () => {
      return graphqlClient.request(gql`
        query GetAllDeities {
          deities(pantheonId: null) {
            id
            name
            slug
            gender
            domain
          }
        }
      `);
    },
  });

  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery<{
    allRelationships: Relationship[]
  }>({
    queryKey: ['all-relationships'],
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

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-800/65 to-emerald-900/70"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white">Family Tree</h1>
              <p className="text-lg text-slate-200 mt-1 font-light">
                Explore the intricate relationships between deities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Visualization:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === 'hierarchical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hierarchical')}
              className="gap-2"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Hierarchical Tree</span>
              <span className="sm:hidden">Tree</span>
            </Button>
            <Button
              variant={viewMode === 'network' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('network')}
              className="gap-2"
            >
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Network Graph</span>
              <span className="sm:hidden">Network</span>
            </Button>
          </div>
        </div>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="font-serif">
                {viewMode === 'hierarchical' ? 'Hierarchical Family Tree' : 'Network View'}
              </CardTitle>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {viewMode === 'hierarchical'
                  ? 'Click nodes to expand/collapse'
                  : 'Drag to pan, scroll to zoom'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {deitiesData?.deities && relationshipsData?.allRelationships ? (
              viewMode === 'hierarchical' ? (
                <EnhancedFamilyTree
                  deities={deitiesData.deities}
                  relationships={relationshipsData.allRelationships}
                />
              ) : (
                <FamilyTreeVisualization
                  deities={deitiesData.deities}
                  relationships={relationshipsData.allRelationships}
                />
              )
            ) : (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{isLoading ? 'Loading relationship data...' : 'No relationship data available'}</p>
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

          <Card className="md:col-span-3 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium font-serif">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>• <span className="hidden sm:inline">Drag nodes to rearrange the layout</span><span className="sm:hidden">Drag nodes to rearrange</span></p>
              <p>• <span className="hidden sm:inline">Use the controls in the bottom-left to zoom and fit the view</span><span className="sm:hidden">Use bottom controls to zoom</span></p>
              <p>• Click deity cards to view profiles</p>
              <p className="hidden sm:block">• Use the minimap in the bottom-right for quick navigation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
