'use client';

import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_STORIES } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string | null;
  fullNarrative: string | null;
  themes: string[];
  culturalSignificance: string | null;
  imageUrl: string | null;
}

export default function StoriesPage() {
  const { data, isLoading, error } = useQuery<{ stories: Story[] }>({
    queryKey: ['stories'],
    queryFn: async () => graphqlClient.request(GET_STORIES),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading stories</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/stories-hero.jpg"
            alt="Ancient Manuscripts"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/70 via-slate-800/65 to-amber-900/70"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
              <ScrollText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-white mb-2">
                Mythological Stories
              </h1>
              <p className="text-xl text-slate-200 font-light">
                Epic tales and legends from ancient civilizations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />
        {data?.stories && data.stories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.stories.map((story, index) => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <Card className="h-full group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-2 hover:border-amber-200 dark:hover:border-amber-800 overflow-hidden bg-white dark:bg-slate-900">
                  {/* Subtle Top Border */}
                  <div className="h-1 bg-linear-to-r from-amber-600 via-orange-600 to-amber-600"></div>
                  
                  <CardHeader className="relative">
                    <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BookOpen className="h-24 w-24 text-amber-600" />
                    </div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${
                        index % 3 === 0 ? 'from-amber-600 to-orange-700' :
                        index % 3 === 1 ? 'from-slate-600 to-slate-700' :
                        'from-teal-600 to-emerald-700'
                      } flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                        <ScrollText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="font-serif text-xl group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
                          {story.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {story.summary && (
                    <CardContent className="space-y-4">
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {story.summary}
                      </p>
                      {story.themes && story.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.themes.slice(0, 3).map((theme) => (
                            <Badge 
                              key={theme} 
                              variant="secondary"
                              className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            >
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <ScrollText className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">No stories yet</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Check back later for mythological tales and legends
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
