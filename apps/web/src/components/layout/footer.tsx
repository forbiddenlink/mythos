import { FooterTools } from "@/components/layout/FooterTools";
import { Logo } from "@/components/ui/logo";
import { CookieSettingsButton } from "@/components/privacy/CookieSettingsButton";
import Link from "next/link";
import { Github } from "@/components/icons/brand";
import { CorrectionLink } from "@/components/layout/CorrectionLink";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

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

const columns = [
  { title: "Explore", links: footerLinks.explore },
  { title: "Discover", links: footerLinks.discover },
  { title: "Learn", links: footerLinks.learn },
  { title: "Info", links: footerLinks.info },
] as const;

const footerLinkClass =
  "inline-flex min-h-8 items-center py-1 text-[0.9375rem] text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-muted/40 pb-[max(env(safe-area-inset-bottom),var(--cookie-banner-offset))]">
      <div className="layout-container layout-container-content pt-10 pb-8 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-16">
          {/* Brand + newsletter */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <span className="text-foreground transition-colors duration-200 group-hover:text-gold-text">
                <Logo className="h-8 w-8" />
              </span>
              <span className="font-serif text-lg font-semibold tracking-wide text-foreground transition-colors duration-200 group-hover:text-gold-text">
                Mythos Atlas
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">
              An illustrated encyclopedia of world mythology: gods, heroes,
              creatures and the stories told about them.
            </p>
            <NewsletterSignup placement="footer" className="mt-6" />
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4"
          >
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="mb-2 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-foreground">
                  {column.title}
                </h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={footerLinkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {column.title === "Info" ? (
                    <li>
                      <CookieSettingsButton
                        className={`${footerLinkClass} text-left`}
                      />
                    </li>
                  ) : null}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <FooterTools />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 text-[0.8125rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Mythos Atlas · Built by Elizabeth Stein
            with Next.js, TypeScript and React
          </p>
          <div className="flex items-center gap-4">
            <CorrectionLink />
            <a
              href="https://github.com/forbiddenlink/mythos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="View source on GitHub"
            >
              <Github className="h-[1.125rem] w-[1.125rem]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
