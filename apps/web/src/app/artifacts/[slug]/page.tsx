'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_ARTIFACT } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, User, Gem, History } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Artifact {
    id: string;
    pantheonId: string;
    name: string;
    slug: string;
    ownerId: string;
    type: string;
    description: string;
    powers: string[];
    originStory: string;
    imageUrl: string | null;
}

export default function ArtifactPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug;

    const { data, isLoading, error } = useQuery<{ artifact: Artifact | null }>({
        queryKey: ['artifact', slug],
        queryFn: async () => {
            return graphqlClient.request(GET_ARTIFACT, { id: slug });
        },
    });

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-24 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data?.artifact) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-24">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Artifact Not Found</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        The legendary item you seek is lost to time.
                    </p>
                    <Link href="/artifacts" className="text-purple-500 hover:underline mt-4 inline-block">
                        Return to the Arsenal
                    </Link>
                </div>
            </div>
        );
    }

    const artifact = data.artifact;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-linear-to-b from-purple-950/20 via-slate-900/90 to-slate-950 z-10"></div>
                </div>

                {/* Abstract Purple Glow */}
                <div className="absolute top-0 left-0 w-[50%] h-[100%] bg-radial-gradient from-purple-900/10 to-transparent pointer-events-none z-0" />

                <div className="container mx-auto max-w-4xl px-4 py-12 relative z-20">
                    <Link
                        href="/artifacts"
                        className="text-sm text-slate-400 hover:text-white mb-6 inline-block transition-colors"
                    >
                        ← Back to Arsenal
                    </Link>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium">
                            <Gem className="h-3.5 w-3.5" />
                            {artifact.type}
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">{artifact.name}</h1>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto max-w-4xl px-4 py-12">
                <div className="space-y-8">

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Left Column: Image & Owner */}
                        <div className="md:col-span-1 space-y-6">
                            {/* Image Card */}
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl border border-purple-500/20 bg-slate-900/50">
                                {artifact.imageUrl ? (
                                    <Image
                                        src={artifact.imageUrl}
                                        alt={artifact.name}
                                        fill
                                        className="object-cover p-4 hover:scale-105 transition-transform duration-500"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Gem className="h-16 w-16 text-purple-500/20" />
                                    </div>
                                )}
                            </div>

                            {/* Owner Card */}
                            {artifact.ownerId && (
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Wielded By
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={`/deities/${artifact.ownerId}`} className="text-lg font-serif font-bold text-purple-400 hover:text-purple-300 hover:underline">
                                            {/* We might want to fetch the owner name properly in the future, using slug for now if it matches or just capitalizing */}
                                            {artifact.ownerId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Details */}
                        <div className="md:col-span-2 space-y-6">

                            <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                                        {artifact.description}
                                    </p>
                                </CardContent>
                            </Card>

                            {artifact.powers && artifact.powers.length > 0 && (
                                <Card className="bg-slate-900/30 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="font-serif flex items-center gap-2 text-lg">
                                            <Zap className="h-5 w-5 text-amber-400" />
                                            Powers & Abilities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {artifact.powers.map((power) => (
                                                <Badge key={power} variant="secondary" className="bg-purple-900/30 text-purple-300 border border-purple-500/30 py-1.5 px-3">
                                                    {power}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {artifact.originStory && (
                                <Card className="bg-slate-900/30 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="font-serif flex items-center gap-2 text-lg">
                                            <History className="h-5 w-5 text-slate-400" />
                                            Origin
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-400 leading-relaxed italic">
                                            "{artifact.originStory}"
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
