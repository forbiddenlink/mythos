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
          <h2 className="text-2xl font-bold text-destructive">Error loading pantheons</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pantheons-hero.png"
            alt="Ancient Pantheons"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Globe className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Mythological Traditions
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Pantheons
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Explore mythological traditions from ancient civilizations around the world
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
      <Breadcrumbs />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {data?.pantheons.map((pantheon) => (
          <Link key={pantheon.id} href={`/pantheons/${pantheon.slug}`} className="group">
            <Card asArticle className="h-full cursor-pointer card-elevated bg-card hover:scale-[1.01]">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300">
                    <Globe className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-foreground group-hover:text-gold transition-colors duration-300">{pantheon.name}</CardTitle>
                </div>
                <CardDescription>
                  {pantheon.culture} • {pantheon.region}
                </CardDescription>
              </CardHeader>
              {pantheon.description && (
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
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
