'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_ARTIFACTS } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, LayoutGrid, Table, Gem } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Badge } from '@/components/ui/badge';

interface Artifact {
    id: string;
    pantheonId: string;
    name: string;
    slug: string;
    ownerId?: string;
    type: string;
    description: string;
    powers: string[];
    imageUrl: string | null;
}

export default function ArtifactsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const { data, isLoading, error } = useQuery<{ artifacts: Artifact[] }>({
        queryKey: ['artifacts'],
        queryFn: async () => graphqlClient.request(GET_ARTIFACTS),
    });

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-24 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-24">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Error loading artifacts</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                </div>
            </div>
        );
    }

    const artifacts = data?.artifacts || [];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-slate-950">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950" />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative p-4 rounded-xl border border-purple-500/20 bg-slate-950/50 backdrop-blur-sm">
                            <Gem className="relative h-10 w-10 text-purple-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <span className="inline-block text-purple-400/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
                        The Arsenal
                    </span>
                    <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-slate-100">
                        Legendary Artifacts
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-body leading-relaxed">
                        Weapons, shields, and mystical objects of power wielded by the gods and heroes of old.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto max-w-6xl px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <Breadcrumbs />
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="gap-2"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="gap-2"
                        >
                            <Table className="h-4 w-4" />
                            Table
                        </Button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <div className="rounded-md border">
                        {/* Simple table fallback for now */}
                        <div className="p-4 text-center text-muted-foreground">Table view coming soon</div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {artifacts.map((artifact) => (
                            <Link key={artifact.id} href={`/artifacts/${artifact.slug}`}>
                                <Card className="group h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] hover:border-purple-500/30 transition-all duration-300">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            {artifact.imageUrl ? (
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/20 shadow-sm">
                                                    <Image
                                                        src={artifact.imageUrl}
                                                        alt={artifact.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/15 transition-colors duration-300">
                                                    <Gem className="h-5 w-5 text-purple-500" strokeWidth={1.5} />
                                                </div>
                                            )}

                                            <Badge variant="outline" className="border-purple-500/50 text-purple-500 bg-purple-500/5">
                                                {artifact.type}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-foreground mt-4 group-hover:text-purple-400 transition-colors duration-300">{artifact.name}</CardTitle>
                                        <CardDescription>
                                            {artifact.powers && artifact.powers.length > 0 ? artifact.powers[0] : 'Legendary Item'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                                            {artifact.description}
                                        </p>
                                        {artifact.powers.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {artifact.powers.slice(0, 3).map(power => (
                                                    <span key={power} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {power}
                                                    </span>
                                                ))}
                                                {artifact.powers.length > 3 && (
                                                    <span className="text-[10px] px-2 py-0.5 text-slate-400">+{artifact.powers.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
