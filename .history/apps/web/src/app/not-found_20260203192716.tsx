import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-midnight to-background px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[150px] md:text-[200px] font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-gold via-bronze to-patina leading-none">
              404
            </div>
            <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-br from-gold via-bronze to-patina"></div>
          </div>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Lost in the Myths
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          The page you seek has vanished like a forgotten legend. Perhaps it never existed, or the gods have hidden it from mortal eyes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/pantheons">
              <BookOpen className="h-4 w-4" />
              Explore Pantheons
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Try using the search (⌘K) to find what you're looking for</p>
        </div>
      </div>
    </div>
  );
}
