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
              <CardTitle className="text-parchment text-2xl font-serif">The Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-parchment/80 leading-relaxed text-lg">
                Mythos Atlas is developed by a team passionate about mythology, history, and technology. We combine scholarly research with modern design to create an engaging learning experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
