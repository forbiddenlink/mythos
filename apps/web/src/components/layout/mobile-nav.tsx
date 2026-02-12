'use client';

import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, Flame, Brain } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/use-progress";
import { useReview } from "@/providers/review-provider";

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
        setMounted(true);
        generateCardsFromProgress();
    }, [generateCardsFromProgress]);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-3 mb-6 px-1">
            {progress.dailyStreak > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-orange-500/10 text-orange-500">
                    <Flame className="h-4 w-4" />
                    <span className="font-semibold tabular-nums">{progress.dailyStreak}</span>
                    <span className="text-xs opacity-80">day streak</span>
                </div>
            )}
            {dueCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500">
                    <Brain className="h-4 w-4" />
                    <span className="font-semibold tabular-nums">{dueCount}</span>
                    <span className="text-xs opacity-80">cards due</span>
                </div>
            )}
        </div>
    );
}

function CollapsibleSection({ section, onLinkClick }: { section: NavSection; onLinkClick: () => void }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground/70 uppercase tracking-wider"
            >
                {section.title}
                <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>
            <div className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="flex flex-col gap-1 pl-2 border-l-2 border-border/50">
                    {section.links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onLinkClick}
                            className="py-2 px-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-lg transition-all duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function MobileNav({ sections }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0" aria-label="Open Menu">
                    <Menu className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
                    "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                    "fixed left-0 top-0 translate-x-0 translate-y-0 overflow-y-auto"
                )}
            >
                <div className="flex flex-col h-full">
                    <DialogTitle className="sr-only">Mobile Navigation</DialogTitle>
                    <DialogDescription className="sr-only">
                        Navigation menu for accessing pages on mobile.
                    </DialogDescription>

                    <Link href="/" className="flex items-center gap-3 mb-6" onClick={() => setOpen(false)}>
                        <Logo className="h-8 w-8 text-foreground" />
                        <span className="font-serif text-lg font-semibold text-foreground tracking-wide">
                            Mythos Atlas
                        </span>
                    </Link>

                    {/* Quick Stats */}
                    <MobileQuickStats />

                    {/* Navigation Sections */}
                    <nav className="flex-1 overflow-y-auto">
                        {sections.map((section) => (
                            <CollapsibleSection
                                key={section.title}
                                section={section}
                                onLinkClick={() => setOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground">Built with Next.js and love for mythology</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
