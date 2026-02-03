import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Database, Zap } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Documentation - Mythos Atlas',
  description: 'GraphQL API documentation for accessing Mythos Atlas mythology data programmatically.',
};

export default function APIPage() {
  const endpoints = [
    {
      name: 'pantheons',
      description: 'Query all pantheons or filter by specific criteria',
      example: `query GetPantheons {
  pantheons {
    id
    name
    slug
    culture
    region
    description
  }
}`,
    },
    {
      name: 'deities',
      description: 'Query deities, optionally filtered by pantheonId',
      example: `query GetDeities($pantheonId: String) {
  deities(pantheonId: $pantheonId) {
    id
    name
    slug
    domain
    symbols
    description
  }
}`,
    },
    {
      name: 'deity',
      description: 'Query a single deity by id or slug',
      example: `query GetDeity($id: String!) {
  deity(id: $id) {
    id
    name
    description
    originStory
  }
}`,
    },
    {
      name: 'stories',
      description: 'Query stories, optionally filtered by pantheonId',
      example: `query GetStories($pantheonId: String) {
  stories(pantheonId: $pantheonId) {
    id
    title
    slug
    summary
    category
  }
}`,
    },
    {
      name: 'search',
      description: 'Search across deities, pantheons, and stories',
      example: `query Search($query: String!, $limit: Int) {
  search(query: $query, limit: $limit) {
    deities { id name }
    pantheons { id name }
    stories { id title }
  }
}`,
    },
  ];

  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <Code className="h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            API Documentation
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Access mythology data programmatically via GraphQL
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <Breadcrumbs />

        <div className="mt-8 space-y-8">
          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">GraphQL API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-parchment/80 leading-relaxed text-lg">
                Mythos Atlas provides a GraphQL API for accessing our mythology database. The API is free to use for personal and educational purposes.
              </p>
              <div className="bg-midnight/50 p-4 rounded-lg border border-gold/10">
                <p className="text-gold/80 font-mono text-sm">
                  Endpoint: <span className="text-parchment">{typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/graphql</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Fast & Reliable</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  Optimized queries with efficient data fetching and caching.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Database className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Comprehensive Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  Access pantheons, deities, stories, and relationships.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Code className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Easy to Use</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  GraphQL provides flexible, self-documenting queries.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-semibold text-parchment mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
              Available Queries
            </h2>
            <div className="space-y-6">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.name} className="border-gold/20 bg-midnight-light/50">
                  <CardHeader>
                    <CardTitle className="text-parchment font-mono">{endpoint.name}</CardTitle>
                    <CardDescription className="text-parchment/70">{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-midnight/70 p-4 rounded-lg border border-gold/10 overflow-x-auto">
                      <pre className="text-gold/80 text-sm font-mono">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Rate Limits & Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-parchment/80 leading-relaxed">
                The API is currently open for use without authentication. Please be respectful with your usage to ensure the service remains available for everyone.
              </p>
              <p className="text-parchment/70 text-sm">
                For high-volume use cases or commercial applications, please contact us to discuss rate limits and API keys.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
