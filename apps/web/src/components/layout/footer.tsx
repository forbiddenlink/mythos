import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Github, Twitter } from 'lucide-react';

const footerLinks = {
  explore: [
    { label: 'Pantheons', href: '/pantheons' },
    { label: 'Deities', href: '/deities' },
    { label: 'Stories', href: '/stories' },
    { label: 'Family Tree', href: '/family-tree' },
  ],
  resources: [
    { label: 'About', href: '/about' },
    { label: 'API', href: '/api' },
    { label: 'Sources', href: '/sources' },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-muted/30">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
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
              An encyclopedia of ancient mythology. Exploring divine stories, legendary heroes, and timeless wisdom from civilizations across the world.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links columns */}
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

          <div>
            <h4 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
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
              Built with Next.js, Rust, and PostgreSQL. Data sourced from public domain mythology texts.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Mythos Atlas. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
