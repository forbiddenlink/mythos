import { Logo } from "@/components/ui/logo";
import Link from "next/link";

function GithubIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const footerLinks = {
  explore: [
    { label: "All Pantheons", href: "/pantheons" },
    { label: "Deities", href: "/deities" },
    { label: "Stories", href: "/stories" },
    { label: "Creatures", href: "/creatures" },
    { label: "Artifacts", href: "/artifacts" },
    { label: "Locations", href: "/locations" },
  ],
  discover: [
    { label: "Divine Domains", href: "/divine-domains" },
    { label: "Compare Deities", href: "/compare" },
    { label: "Compare Myths", href: "/compare/myths" },
    { label: "Knowledge Graph", href: "/knowledge-graph" },
    { label: "Family Tree", href: "/family-tree" },
    { label: "Timeline", href: "/timeline" },
    { label: "Story Timeline", href: "/story-timeline" },
  ],
  learn: [
    { label: "Quiz", href: "/quiz" },
    { label: "Symbol Memory", href: "/games/memory" },
    { label: "Learning Paths", href: "/learning-paths" },
    { label: "Daily Review", href: "/review" },
    { label: "Achievements", href: "/achievements" },
    { label: "Your Stats", href: "/leaderboard" },
    { label: "Your Progress", href: "/progress" },
  ],
  info: [
    { label: "About Mythos Atlas", href: "/about" },
    { label: "Contact Mythos Atlas", href: "/contact" },
    { label: "Sources", href: "/sources" },
    { label: "Changelog", href: "/changelog" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-muted/30 backdrop-blur-sm">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group mb-4"
            >
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
              An interactive encyclopedia of ancient mythology from
              civilizations around the world. Explore gods, heroes, creatures,
              and epic tales.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/forbiddenlink/mythos"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                aria-label="View source on GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h2 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Explore
            </h2>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 w-full items-center py-1 text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover links */}
          <div>
            <h2 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Discover
            </h2>
            <ul className="space-y-2.5">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 w-full items-center py-1 text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn links */}
          <div>
            <h2 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Learn
            </h2>
            <ul className="space-y-2.5">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 w-full items-center py-1 text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h2 className="font-serif text-sm font-semibold text-foreground mb-4 tracking-wide">
              Info
            </h2>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 w-full items-center py-1 text-sm text-muted-foreground hover:text-gold transition-colors duration-200"
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
