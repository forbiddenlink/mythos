import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { AboutPageJsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBaseMetadata } from "@/lib/metadata";
import { RouteHero } from "@/components/layout/route-hero";
import { BookOpen, Code, Globe, Users } from "lucide-react";

export const metadata = generateBaseMetadata({
  title: "About Mythos Atlas",
  description:
    "Learn about Mythos Atlas, an interactive encyclopedia exploring ancient mythology from civilizations around the world. Created by Elizabeth Stein.",
  url: "/about",
  keywords: [
    "about",
    "mythology encyclopedia",
    "Elizabeth Stein",
    "ancient mythology project",
  ],
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mythic">
      <AboutPageJsonLd
        creatorName="Elizabeth Stein"
        creatorDescription="A passionate developer and mythology enthusiast who combines technical expertise with a deep appreciation for ancient cultures and storytelling."
      />
      {/* Hero Section */}
      <RouteHero overlayClassName="bg-linear-to-b from-primary/70 via-primary/60 to-background z-10">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-foreground">
          About Mythos Atlas
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed">
          An interactive encyclopedia of ancient mythology
        </p>
      </RouteHero>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs />

        <div className="mt-8 space-y-8">
          <Card className="border-gold/20 bg-card">
            <CardHeader>
              <CardTitle
                as="h2"
                className="text-foreground text-2xl font-serif"
              >
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80 leading-relaxed text-lg">
                Mythos Atlas is built for learners who want mythology to stick —
                students, self-taught readers, and curious explorers who need
                more than isolated encyclopedia entries.
              </p>
              <p className="text-foreground/80 leading-relaxed text-lg">
                I connect pantheons, deities, stories, places, and family trees
                so you can move from quick orientation into deeper study, then
                reinforce what you learn with quizzes and review.
              </p>
              <p className="text-foreground/80 leading-relaxed text-lg">
                The atlas treats myths as an interconnected map: open a deity,
                follow their stories and relations, test yourself, and return
                with a clearer sense of the culture that shaped them.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gold/20 bg-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6 text-gold" />
                  <CardTitle as="h2" className="text-foreground">
                    Global Coverage
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse 13 pantheons from Greek to Yoruba, with 189+ deities,
                  96+ stories, and 85+ sacred locations documented.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-gold" />
                  <CardTitle as="h2" className="text-foreground">
                    Deity Relationships
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Visualize complex family trees and relationships between gods
                  and goddesses through interactive diagrams.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-6 w-6 text-gold" />
                  <CardTitle as="h2" className="text-foreground">
                    Epic Stories
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Read original myths from primary sources—the Eddas, Theogony,
                  Popol Vuh, and more—with modern context and academic
                  citations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Code className="h-6 w-6 text-gold" />
                  <CardTitle as="h2" className="text-foreground">
                    Open Platform
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built with modern web technologies and designed to be
                  accessible, fast, and user-friendly across all devices.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gold/20 bg-card">
            <CardHeader>
              <CardTitle
                as="h2"
                className="text-foreground text-2xl font-serif"
              >
                Creator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gold/10 border border-gold/20 shrink-0">
                  <Code className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-semibold text-xl mb-2">
                    Elizabeth Stein
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    Mythos Atlas was built by Elizabeth Stein, a passionate
                    developer and mythology enthusiast who combines technical
                    expertise with a deep appreciation for ancient cultures and
                    storytelling.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm italic border-l-2 border-gold/30 pl-4">
                &quot;I built Mythos Atlas because I couldn&apos;t find a
                mythology resource that combined scholarly accuracy with good
                design. These stories deserve better than dusty encyclopedias or
                clickbait listicles.&quot;
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-card">
            <CardHeader>
              <CardTitle
                as="h2"
                className="text-foreground text-2xl font-serif"
              >
                Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">
                    Next.js 16 (App Router)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">React 19</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">Built-in data API</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">
                    Static JSON content layer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">ReactFlow & D3</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-foreground/80">Vercel Hosting</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-card">
            <CardHeader>
              <CardTitle
                as="h2"
                className="text-foreground text-2xl font-serif"
              >
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground/80 leading-relaxed">
                <strong className="text-gold">Last Updated:</strong> February
                2026
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Mythos Atlas is an ongoing project with regular updates. The
                encyclopedia currently spans 13 pantheons, and we continuously
                expand depth, source coverage, and cross-cultural links across
                traditions.
              </p>
              <div className="pt-2 border-t border-gold/20">
                <p className="text-muted-foreground text-sm">
                  Have suggestions or found an error? We&apos;re continuously
                  improving accuracy and coverage based on scholarly sources and
                  community feedback.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
