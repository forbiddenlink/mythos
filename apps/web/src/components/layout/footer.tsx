import { FooterTools } from "@/components/layout/FooterTools";
import { Logo } from "@/components/ui/logo";
import { CookieSettingsButton } from "@/components/privacy/CookieSettingsButton";
import Link from "next/link";
import { Github } from "@/components/icons/brand";
import { CorrectionLink } from "@/components/layout/CorrectionLink";

// Secondary destinations live here; the header carries the primary IA
// (components/layout/nav-config.ts).
const footerLinks = {
  explore: [
    { label: "All Pantheons", href: "/pantheons" },
    { label: "Deities", href: "/deities" },
    { label: "Heroes", href: "/heroes" },
    { label: "Stories", href: "/stories" },
    { label: "Creatures", href: "/creatures" },
    { label: "Artifacts", href: "/artifacts" },
    { label: "Locations", href: "/locations" },
  ],
  discover: [
    { label: "Compare Deities", href: "/compare" },
    { label: "Compare Myths", href: "/compare/myths" },
    { label: "Cross-Pantheon Parallels", href: "/compare/parallels" },
    { label: "Divine Domains", href: "/divine-domains" },
    { label: "Cosmologies", href: "/cosmology" },
    { label: "Interactive Stories", href: "/stories/interactive" },
    { label: "Mythology Facts", href: "/facts" },
  ],
  learn: [
    { label: "Paths", href: "/paths" },
    { label: "Journeys", href: "/journeys" },
    { label: "Quiz", href: "/quiz" },
    { label: "Symbol Memory", href: "/games/memory" },
    { label: "Daily Review", href: "/review" },
    { label: "Achievements", href: "/achievements" },
    { label: "Your Stats", href: "/progress" },
    { label: "Bookmarks", href: "/bookmarks" },
  ],
  info: [
    { label: "About Mythos Atlas", href: "/about" },
    { label: "Support Mythos Atlas", href: "/support" },
    { label: "Contact Mythos Atlas", href: "/contact" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "AI / llms.txt", href: "/llms.txt" },
    { label: "Sources", href: "/sources" },
    { label: "Changelog", href: "/changelog" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-muted/30 backdrop-blur-sm pb-[max(env(safe-area-inset-bottom),var(--cookie-banner-offset))]">
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
              <div className="flex flex-col">
                <span className="font-serif text-lg font-semibold text-foreground group-hover:text-gold tracking-wide leading-tight block transition-colors duration-300">
                  Mythos Atlas
                </span>
                <span className="text-[10px] text-gold-text tracking-[0.2em] uppercase font-sans font-medium block">
                  Encyclopedia of Antiquity
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
                <Github className="h-5 w-5" />
              </a>
              <CorrectionLink />
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
              <li>
                <CookieSettingsButton className="flex min-h-11 w-full items-center py-1 text-sm text-muted-foreground hover:text-gold transition-colors duration-200 text-left" />
              </li>
            </ul>
          </div>
        </div>

        <FooterTools />

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
