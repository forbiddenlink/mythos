import { Compass, Home, BookOpen, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import deitiesData from '@/data/deities.json';
import storiesData from '@/data/stories.json';

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
}

interface Story {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
}

function getPantheonLabel(pantheonId: string): string {
  const labels: Record<string, string> = {
    'greek-pantheon': 'Greek',
    'norse-pantheon': 'Norse',
    'egyptian-pantheon': 'Egyptian',
    'roman-pantheon': 'Roman',
    'celtic-pantheon': 'Celtic',
    'hindu-pantheon': 'Hindu',
    'japanese-pantheon': 'Japanese',
    'chinese-pantheon': 'Chinese',
    'mesoamerican-pantheon': 'Mesoamerican',
    'mesopotamian-pantheon': 'Mesopotamian',
  };
  return labels[pantheonId] || 'Ancient';
}

// Get random suggestions - seeded by current hour for some consistency
function getRandomSuggestions() {
  const deities = deitiesData as Deity[];
  const stories = storiesData as Story[];

  // Use current timestamp for seeding (changes hourly)
  const seed = Math.floor(Date.now() / (1000 * 60 * 60));

  // Pick 3 random deities
  const shuffledDeities = [...deities].sort(() => {
    const x = Math.sin(seed * deities.length) * 10000;
    return x - Math.floor(x) - 0.5;
  });
  const suggestedDeities = shuffledDeities.slice(0, 3);

  // Pick 2 random stories
  const shuffledStories = [...stories].sort(() => {
    const x = Math.sin(seed * stories.length + 1) * 10000;
    return x - Math.floor(x) - 0.5;
  });
  const suggestedStories = shuffledStories.slice(0, 2);

  return { suggestedDeities, suggestedStories };
}

export default function NotFound() {
  const { suggestedDeities, suggestedStories } = getRandomSuggestions();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-midnight via-midnight-light to-midnight px-4 py-16">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Lost traveler icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-[-20px] rounded-full bg-gradient-radial from-gold/20 to-transparent animate-pulse" />
            <div className="relative p-6 rounded-full border border-gold/30 bg-midnight-light/80 backdrop-blur-sm">
              <Compass className="w-12 h-12 text-gold animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
        </div>

        {/* Error title */}
        <h1 className="font-serif text-6xl md:text-7xl font-bold text-gradient-hero mb-4">
          404
        </h1>

        <h2 className="font-serif text-2xl md:text-3xl text-parchment mb-4">
          Lost in the Mists of the Unknown
        </h2>

        {/* Mythological flavor text */}
        <div className="relative max-w-xl mx-auto mb-8 p-6 rounded-lg border border-gold/10 bg-midnight-light/30 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/30" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/30" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/30" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/30" />

          <p className="text-gold-light/80 italic font-body leading-relaxed">
            &ldquo;Like Odysseus blown off course by Poseidon&apos;s wrath, or Orpheus wandering
            the shadowy paths of the Underworld, you have strayed beyond the known realms.&rdquo;
          </p>
          <p className="text-parchment/50 text-sm mt-3">
            The page you seek does not exist in this realm.
          </p>
        </div>

        {/* Return home button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark hover:from-gold hover:via-gold-light hover:to-gold text-midnight font-semibold px-8"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Olympus
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
          >
            <Link href="/pantheons">
              Explore Pantheons
            </Link>
          </Button>
        </div>

        {/* Suggestions section */}
        <div className="text-left">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold uppercase tracking-wide">
              Perhaps you were seeking...
            </span>
            <Sparkles className="w-4 h-4 text-gold" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Deity suggestions */}
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gold" />
                  <span className="font-serif font-semibold text-parchment">Deities to Discover</span>
                </div>
                <ul className="space-y-2">
                  {suggestedDeities.map((deity) => (
                    <li key={deity.id}>
                      <Link
                        href={`/deities/${deity.slug}`}
                        className="flex items-center gap-2 text-sm text-parchment/70 hover:text-gold transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                        <span>{deity.name}</span>
                        <span className="text-parchment/40">
                          - {getPantheonLabel(deity.pantheonId)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Story suggestions */}
            <Card className="border-gold/20 bg-midnight-light/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-gold" />
                  <span className="font-serif font-semibold text-parchment">Tales to Explore</span>
                </div>
                <ul className="space-y-2">
                  {suggestedStories.map((story) => (
                    <li key={story.id}>
                      <Link
                        href={`/stories/${story.slug}`}
                        className="flex items-center gap-2 text-sm text-parchment/70 hover:text-gold transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                        <span className="line-clamp-1">{story.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search hint */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>Try using the search (Cmd+K) to find what you&apos;re looking for</p>
        </div>
      </div>
    </main>
  );
}
