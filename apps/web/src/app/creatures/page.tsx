'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_CREATURES } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, LayoutGrid, Table, Skull } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Badge } from '@/components/ui/badge';

interface Creature {
    id: string;
    pantheonId: string;
    name: string;
    slug: string;
    habitat: string;
    abilities: string[];
    dangerLevel: number;
    description: string;
    imageUrl: string | null;
}

export default function CreaturesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const { data, isLoading, error } = useQuery<{ creatures: Creature[] }>({
        queryKey: ['creatures'],
        queryFn: async () => graphqlClient.request(GET_CREATURES),
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
                    <h2 className="text-2xl font-bold text-red-600">Error loading creatures</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                </div>
            </div>
        );
    }

    const creatures = data?.creatures || [];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-slate-950">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950" />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative p-4 rounded-xl border border-red-500/20 bg-slate-950/50 backdrop-blur-sm">
                            <Skull className="relative h-10 w-10 text-red-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <span className="inline-block text-red-500/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
                        The Bestiary
                    </span>
                    <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-slate-100">
                        Creatures & Monsters
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-body leading-relaxed">
                        From the depths of the underworld to the peaks of mountains, discover the legendary beasts of ancient mythology.
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
                        {creatures.map((creature) => (
                            <Link key={creature.id} href={`/creatures/${creature.slug}`}>
                                <Card className="group h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] hover:border-red-500/30 transition-all duration-300">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            {creature.imageUrl ? (
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-red-500/20 shadow-sm">
                                                    <Image
                                                        src={creature.imageUrl}
                                                        alt={creature.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/15 transition-colors duration-300">
                                                    <Skull className="h-5 w-5 text-red-500" strokeWidth={1.5} />
                                                </div>
                                            )}

                                            <Badge variant="outline" className={`
                        ${creature.dangerLevel >= 9 ? 'border-red-500 text-red-500 bg-red-500/10' :
                                                    creature.dangerLevel >= 7 ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                                                        'border-yellow-500 text-yellow-500 bg-yellow-500/10'}
                      `}>
                                                Danger: {creature.dangerLevel}/10
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-foreground mt-4 group-hover:text-red-500 transition-colors duration-300">{creature.name}</CardTitle>
                                        <CardDescription>
                                            {creature.habitat}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                                            {creature.description}
                                        </p>
                                        {creature.abilities.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {creature.abilities.slice(0, 3).map(ability => (
                                                    <span key={ability} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {ability}
                                                    </span>
                                                ))}
                                                {creature.abilities.length > 3 && (
                                                    <span className="text-[10px] px-2 py-0.5 text-slate-400">+{creature.abilities.length - 3}</span>
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
