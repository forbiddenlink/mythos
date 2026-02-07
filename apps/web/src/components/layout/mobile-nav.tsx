import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
    navLinks: { href: string; label: string }[];
}

export function MobileNav({ navLinks }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0" aria-label="Open Menu">
                    <Menu className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            {/* 
        Styling DialogContent to act like a side drawer. 
        Radix Dialog centers by default, so we override classes to position it left/full-height.
      */}
            <DialogContent
                className={cn(
                    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
                    "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                    "fixed left-0 top-0 translate-x-0 translate-y-0" // Force left positioning override
                )}
            >
                <div className="flex flex-col h-full">
                    <DialogTitle className="sr-only">Mobile Navigation</DialogTitle>
                    <DialogDescription className="sr-only">
                        Navigation menu for accessing pages on mobile.
                    </DialogDescription>

                    <Link href="/" className="flex items-center gap-3 mb-8" onClick={() => setOpen(false)}>
                        <Logo className="h-8 w-8 text-foreground" />
                        <span className="font-serif text-lg font-semibold text-foreground tracking-wide">
                            Mythos Atlas
                        </span>
                    </Link>

                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="text-lg font-medium text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground">© 2026 Mythos Atlas</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
