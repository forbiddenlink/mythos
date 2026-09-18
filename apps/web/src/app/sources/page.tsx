import { HeroMark } from "@/components/icons/hero-mark";
import { generateBaseMetadata } from "@/lib/metadata";
import { RouteHero } from "@/components/layout/route-hero";
import {
  pageLedeOnDarkClass,
  pageTitleOnDarkClass,
} from "@/components/layout/page-typography";
import { cn } from "@/lib/utils";
import { SourcesPageClient } from "./SourcesPageClient";

export const metadata = generateBaseMetadata({
  title: "Sources & References",
  description:
    "Academic sources, primary texts, translations, and scholarly references used in compiling the Mythos Atlas mythology encyclopedia.",
  url: "/sources",
  keywords: [
    "mythology sources",
    "academic references",
    "primary texts",
    "Hesiod",
    "Homer",
    "Prose Edda",
    "Book of the Dead",
    "Rigveda",
    "Popol Vuh",
    "Enuma Elish",
    "Kojiki",
  ],
});

export default function SourcesPage() {
  return (
    <div className="min-h-screen bg-mythic">
      {/* Hero Section */}
      <RouteHero>
        <div className="flex items-center justify-center mb-6">
          <HeroMark mark="codex" tone="gold" size="lg" />
        </div>
        <h1 className={cn(pageTitleOnDarkClass, "mb-6")}>
          Sources &amp; References
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
        </div>
        <p className={pageLedeOnDarkClass}>
          Primary historical literature, translations, and scholarly references
          grounding the atlas
        </p>
      </RouteHero>

      {/* Interactive Sources Codex */}
      <SourcesPageClient />
    </div>
  );
}
