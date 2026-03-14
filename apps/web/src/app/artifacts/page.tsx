'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_ARTIFACTS } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid, Table, Gem } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { CollectionPageJsonLd } from '@/components/seo/JsonLd';
import { PageHero } from '@/components/layout/page-hero';

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
                    <h2 className="text-2xl font-bold text-destructive">Error loading artifacts</h2>
                    <p className="text-muted-foreground mt-2">
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                </div>
            </div>
        );
    }

    const artifacts = data?.artifacts || [];

    return (
        <div className="min-h-screen">
            <CollectionPageJsonLd
                name="Legendary Artifacts"
                description="Weapons, shields, and mystical objects of power wielded by gods and heroes"
                url="/artifacts"
                numberOfItems={artifacts.length}
            />
            <PageHero
                icon={<Gem />}
                tagline="The Arsenal"
                title="Legendary Artifacts"
                description="Weapons, shields, and mystical objects of power wielded by the gods and heroes of old."
                colorScheme="purple"
                minHeight="min-h-[40vh]"
            />

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
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Mythology</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Owner</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-50">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {artifacts.map((artifact) => (
                                        <tr key={artifact.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                {artifact.slug ? (
                                                    <Link href={`/artifacts/${artifact.slug}`} className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline">
                                                        {artifact.name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium">{artifact.name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    {{
                                                        'greek-pantheon': 'Greek',
                                                        'norse-pantheon': 'Norse',
                                                        'egyptian-pantheon': 'Egyptian',
                                                        'roman-pantheon': 'Roman',
                                                        'hindu-pantheon': 'Hindu',
                                                        'japanese-pantheon': 'Japanese',
                                                        'celtic-pantheon': 'Celtic',
                                                        'mesopotamian-pantheon': 'Mesopotamian',
                                                    }[artifact.pantheonId] || artifact.pantheonId}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <Badge variant="outline" className="border-purple-500/50 text-purple-500 bg-purple-500/5 capitalize">
                                                    {artifact.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap capitalize">
                                                {artifact.ownerId || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                                                <span className="line-clamp-2">{artifact.description}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {artifacts.map((artifact) => (
                            <Link key={artifact.id} href={`/artifacts/${artifact.slug}`} className="group">
                                <Card asArticle className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] hover:border-purple-500/30 transition-all duration-300">
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
                                                    <span key={power} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
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
