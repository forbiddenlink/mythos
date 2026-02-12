import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Github } from 'lucide-react';

const footerLinks = {
  explore: [
    { label: 'All Pantheons', href: '/pantheons' },
    { label: 'Deities', href: '/deities' },
    { label: 'Stories', href: '/stories' },
    { label: 'Creatures', href: '/creatures' },
    { label: 'Artifacts', href: '/artifacts' },
    { label: 'Locations', href: '/locations' },
  ],
  discover: [
    { label: 'Divine Domains', href: '/divine-domains' },
    { label: 'Compare Deities', href: '/compare' },
    { label: 'Knowledge Graph', href: '/knowledge-graph' },
    { label: 'Family Tree', href: '/family-tree' },
    { label: 'Timeline', href: '/timeline' },
  ],
  learn: [
    { label: 'Quiz', href: '/quiz' },
    { label: 'Daily Review', href: '/review' },
    { label: 'Your Progress', href: '/progress' },
    { label: 'About', href: '/about' },
    { label: 'Changelog', href: '/changelog' },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-muted/30 backdrop-blur-sm">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="text-foreground group-hover:text-gold transition-colors duration-300">
                <Logo className="h-8 w-8" />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold text-foreground tracking-wide block">
                  Mythos Atlas
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
              An interactive encyclopedia of ancient mythology from civilizations around the world. Explore gods, heroes, creatures, and epic tales.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/forbiddenlink/mythos"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                aria-label="View source on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Discover
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Learn
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              Built by Elizabeth Stein with Next.js, TypeScript, and React
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Mythos Atlas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
