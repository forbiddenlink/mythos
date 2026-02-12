'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
  Compass,
  BookOpen,
  Users,
  Scroll,
  Swords,
  Crown,
  MapPin,
  Network,
  GitCompare,
  Route,
  Brain,
  CalendarCheck,
  Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const exploreMenu: MenuSection = {
  label: 'Explore',
  items: [
    {
      label: 'Deities',
      href: '/deities',
      description: 'Gods and goddesses from all pantheons',
      icon: <Crown className="h-4 w-4" />
    },
    {
      label: 'Stories',
      href: '/stories',
      description: 'Myths, legends, and epic tales',
      icon: <Scroll className="h-4 w-4" />
    },
    {
      label: 'Creatures',
      href: '/creatures',
      description: 'Mythical beasts and monsters',
      icon: <Swords className="h-4 w-4" />
    },
    {
      label: 'Artifacts',
      href: '/artifacts',
      description: 'Legendary weapons and objects',
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      label: 'Locations',
      href: '/locations',
      description: 'Sacred places and mythical realms',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      label: 'Hero Journeys',
      href: '/journeys',
      description: 'Epic voyages across the ancient world',
      icon: <Route className="h-4 w-4" />
    },
  ],
};

const discoverMenu: MenuSection = {
  label: 'Discover',
  items: [
    {
      label: 'Divine Domains',
      href: '/divine-domains',
      description: 'Powers and spheres of influence',
      icon: <Compass className="h-4 w-4" />
    },
    {
      label: 'Compare Deities',
      href: '/compare',
      description: 'Side-by-side deity comparisons',
      icon: <GitCompare className="h-4 w-4" />
    },
    {
      label: 'Knowledge Graph',
      href: '/knowledge-graph',
      description: 'Visual mythology connections',
      icon: <Network className="h-4 w-4" />
    },
    {
      label: 'Family Tree',
      href: '/family-tree',
      description: 'Divine genealogies',
      icon: <Users className="h-4 w-4" />
    },
    {
      label: 'Timeline',
      href: '/timeline',
      description: 'Chronological myth events',
      icon: <Route className="h-4 w-4" />
    },
  ],
};

const learnMenu: MenuSection = {
  label: 'Learn',
  items: [
    {
      label: 'Quiz',
      href: '/quiz',
      description: 'Test your mythology knowledge',
      icon: <Gamepad2 className="h-4 w-4" />
    },
    {
      label: 'Symbol Memory',
      href: '/games/memory',
      description: 'Match deities with their symbols',
      icon: <Brain className="h-4 w-4" />
    },
    {
      label: 'Daily Review',
      href: '/review',
      description: 'Spaced repetition flashcards',
      icon: <CalendarCheck className="h-4 w-4" />
    },
    {
      label: 'Stories',
      href: '/stories',
      description: 'Interactive myth narratives',
      icon: <BookOpen className="h-4 w-4" />
    },
  ],
};

interface MegaMenuDropdownProps {
  section: MenuSection;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function MegaMenuDropdown({ section, isOpen, onOpen, onClose }: MegaMenuDropdownProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onOpen();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200 group",
          isOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="relative z-10">{section.label}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
        <span className={cn(
          "absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent transition-transform duration-300",
          isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
          >
            <div className="w-72 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-xl overflow-hidden">
              <div className="p-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 group"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-gold transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground group-hover:text-gold transition-colors">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MegaMenu() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleOpen = (label: string) => {
    setOpenMenu(label);
  };

  const handleClose = () => {
    setOpenMenu(null);
  };

  return (
    <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
      {/* Pantheons - direct link */}
      <Link
        href="/pantheons"
        className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
      >
        <span className="relative z-10">Pantheons</span>
        <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Link>

      {/* Explore dropdown */}
      <MegaMenuDropdown
        section={exploreMenu}
        isOpen={openMenu === 'Explore'}
        onOpen={() => handleOpen('Explore')}
        onClose={handleClose}
      />

      {/* Discover dropdown */}
      <MegaMenuDropdown
        section={discoverMenu}
        isOpen={openMenu === 'Discover'}
        onOpen={() => handleOpen('Discover')}
        onClose={handleClose}
      />

      {/* Learn dropdown */}
      <MegaMenuDropdown
        section={learnMenu}
        isOpen={openMenu === 'Learn'}
        onOpen={() => handleOpen('Learn')}
        onClose={handleClose}
      />

      {/* Progress - direct link */}
      <Link
        href="/progress"
        className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
      >
        <span className="relative z-10">Progress</span>
        <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Link>

      {/* About - direct link */}
      <Link
        href="/about"
        className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
      >
        <span className="relative z-10">About</span>
        <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Link>
    </nav>
  );
}
