'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_STORIES } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Tag } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import Link from 'next/link';

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  keyExcerpts?: string;
  category: string;
  moralThemes?: string[];
  culturalSignificance?: string;
}

export default function StoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  
  const { data, isLoading, error } = useQuery<{ stories: Story[] }>({
    queryKey: ['stories'],
    queryFn: async () => graphqlClient.request(GET_STORIES),
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
          <h2 className="text-2xl font-bold text-red-600">Error loading story</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const story = data?.stories.find(s => s.slug === slug);

  if (!story && !isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Story Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The story you're looking for doesn't exist.
          </p>
          <Link href="/stories" className="text-gold hover:underline mt-4 inline-block">
            View all stories
          </Link>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <BookOpen className="h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-parchment">
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Tag className="h-4 w-4 text-gold/80" />
            <p className="text-gold/80 font-body">{story.category}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs />

        <div className="mt-8 space-y-8">
          {/* Summary */}
          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-parchment/80 leading-relaxed text-lg whitespace-pre-line">
                {story.summary}
              </p>
            </CardContent>
          </Card>

          {/* Key Excerpts */}
          {story.keyExcerpts && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Key Passages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-midnight/30 p-6 rounded-lg border border-gold/10">
                  <p className="text-parchment/70 italic leading-relaxed whitespace-pre-line">
                    {story.keyExcerpts}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moral Themes */}
          {story.moralThemes && story.moralThemes.length > 0 && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {story.moralThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold/80 text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cultural Significance */}
          {story.culturalSignificance && (
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <CardTitle className="text-parchment text-2xl font-serif">Cultural Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/80 leading-relaxed text-lg whitespace-pre-line">
                  {story.culturalSignificance}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-center pt-8">
            <Link href="/stories">
              <button className="px-6 py-3 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/50 rounded-lg text-gold transition-colors">
                ← Back to All Stories
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
