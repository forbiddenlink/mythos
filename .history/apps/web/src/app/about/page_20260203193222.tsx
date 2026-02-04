import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Globe, Code } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About - Mythos Atlas',
  description: 'Learn about Mythos Atlas, an interactive encyclopedia exploring ancient mythology from civilizations around the world.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-mythic z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            About Mythos Atlas
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            An interactive encyclopedia of ancient mythology
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs />

        <div className="mt-8 space-y-8">
          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-parchment/80 leading-relaxed text-lg">
                Mythos Atlas is dedicated to preserving and sharing the rich tapestry of ancient mythology from civilizations around the world. We believe these timeless stories hold valuable insights into human nature, culture, and the universal questions that have captivated humanity for millennia.
              </p>
              <p className="text-parchment/80 leading-relaxed text-lg">
                Through interactive visualizations, comprehensive deity profiles, and carefully curated stories, we aim to make mythology accessible and engaging for everyone—from students and researchers to mythology enthusiasts and casual learners.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Global Coverage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  Explore mythologies from Greek, Norse, Egyptian, and other ancient civilizations, with new pantheons being added regularly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Deity Relationships</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  Visualize complex family trees and relationships between gods and goddesses through interactive diagrams.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Epic Stories</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  Discover the epic myths, creation stories, and heroic tales that have shaped cultures and inspired generations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-midnight-light/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Code className="h-6 w-6 text-gold" />
                  <CardTitle className="text-parchment">Open Platform</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-parchment/70">
                  Built with modern web technologies and designed to be accessible, fast, and user-friendly across all devices.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Creator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold/10 border border-gold/20 shrink-0">
                  <Code className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-parchment font-semibold text-xl mb-2">Elizabeth Stein</h3>
                  <p className="text-parchment/80 leading-relaxed">
                    Mythos Atlas was built by Elizabeth Stein, a passionate developer and mythology enthusiast who combines technical expertise with a deep appreciation for ancient cultures and storytelling.
                  </p>
                </div>
              </div>
              <p className="text-parchment/70 text-sm italic border-l-2 border-gold/30 pl-4">
                "This project was born from a fascination with how ancient myths connect cultures across time and space. By leveraging modern web technologies, I wanted to create an immersive experience that brings these timeless stories to life for a new generation."
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">Next.js 16 (App Router)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">React 19</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">GraphQL API</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">React Query</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">ReactFlow & D3</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-parchment/80">Vercel Hosting</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gold/20 bg-midnight-light/50">
            <CardHeader>
              <CardTitle className="text-parchment text-2xl font-serif">Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-parchment/80 leading-relaxed">
                <strong className="text-gold">Last Updated:</strong> February 2026
              </p>
              <p className="text-parchment/80 leading-relaxed">
                Mythos Atlas is an ongoing project with regular updates. Currently featuring Greek, Norse, and Egyptian pantheons, with plans to expand to Roman, Hindu, Japanese, Celtic, and other mythological traditions.
              </p>
              <div className="pt-2 border-t border-gold/20">
                <p className="text-parchment/70 text-sm">
                  Have suggestions or found an error? We're continuously improving accuracy and coverage based on scholarly sources and community feedback.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
