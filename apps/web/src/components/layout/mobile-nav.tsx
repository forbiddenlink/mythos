"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";
import { useReview } from "@/providers/review-provider";
import { ChevronDown, Menu } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

interface MobileNavProps {
  sections: NavSection[];
}

function MobileQuickStats() {
  const { progress } = useProgress();
  const { dueCount, generateCardsFromProgress } = useReview();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
    generateCardsFromProgress();
  }, [generateCardsFromProgress]);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-3 mb-6 px-1">
      {progress.dailyStreak > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-gold/10 text-gold-text border border-gold/20">
          <MythosMark id="torch" className="h-4 w-4" />
          <span className="font-semibold tabular-nums">
            {progress.dailyStreak}
          </span>
          <span className="text-xs opacity-80">day streak</span>
        </div>
      )}
      {dueCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-patina/10 text-patina border border-patina/25">
          <MythosMark id="owl" className="h-4 w-4" />
          <span className="font-semibold tabular-nums">{dueCount}</span>
          <span className="text-xs opacity-80">cards due</span>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  section,
  onLinkClick,
  defaultOpen = false,
}: Readonly<{
  section: NavSection;
  onLinkClick: () => void;
  defaultOpen?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = `mobile-nav-${section.title.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center justify-between w-full min-h-11 py-2 text-sm font-semibold text-foreground/70 uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
      >
        {section.title}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-label={section.title}
        hidden={!isOpen}
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-200",
          isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex flex-col gap-1 pl-2 border-l-2 border-gold/20">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className="py-2.5 px-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MobileNav({ sections }: Readonly<MobileNavProps>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        aria-label="Open Menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <DialogContent
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          "fixed left-0 top-0 translate-x-0 translate-y-0 overflow-y-auto",
        )}
      >
        <div className="flex flex-col h-full">
          <DialogTitle className="sr-only">Mobile Navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Navigation menu for accessing pages on mobile.
          </DialogDescription>

          <Link
            href="/"
            className="flex items-center gap-3 mb-6"
            onClick={() => setOpen(false)}
          >
            <Logo className="h-8 w-8 text-foreground" />
            <span className="font-serif text-lg font-semibold text-foreground tracking-wide">
              Mythos Atlas
            </span>
          </Link>

          {/* Quick Stats */}
          <MobileQuickStats />

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto">
            {sections.map((section, index) => (
              <CollapsibleSection
                key={section.title}
                section={section}
                onLinkClick={() => setOpen(false)}
                defaultOpen={index === 0}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Tip: Use the search icon to jump to any deity, story, or place
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
