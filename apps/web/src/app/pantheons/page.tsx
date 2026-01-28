'use client';

import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_PANTHEONS } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
}

export default function PantheonsPage() {
  const { data, isLoading, error } = useQuery<{ pantheons: Pantheon[] }>({
    queryKey: ['pantheons'],
    queryFn: async () => graphqlClient.request(GET_PANTHEONS),
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
          <h2 className="text-2xl font-bold text-red-600">Error loading pantheons</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-100 flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pantheons-hero.jpg"
            alt="Ancient Pantheons"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-900/65 via-slate-900/65 to-slate-900/70 z-10" />
        
        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-amber-500/20 backdrop-blur-sm">
              <Globe className="h-12 w-12 text-amber-400" />
            </div>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
            Pantheons
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
            Explore mythological traditions from ancient civilizations around the world.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
      <Breadcrumbs />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.pantheons.map((pantheon) => (
          <Link key={pantheon.id} href={`/pantheons/${pantheon.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Globe className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <CardTitle className="font-serif text-slate-900 dark:text-slate-100">{pantheon.name}</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {pantheon.culture} • {pantheon.region}
                </CardDescription>
              </CardHeader>
              {pantheon.description && (
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                    {pantheon.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
