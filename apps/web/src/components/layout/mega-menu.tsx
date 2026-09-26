"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import {
  PRIMARY_DIRECT_LINK,
  PRIMARY_NAV,
} from "@/components/layout/nav-config";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface MenuItem {
  label: string;
  href: string;
  current?: boolean;
  description?: string;
  mark?: MythosMarkId;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

interface MegaMenuDropdownProps {
  section: MenuSection;
  /** The current page belongs to this section. */
  isCurrent: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function MegaMenuDropdown({
  section,
  isCurrent,
  isOpen,
  onOpen,
  onClose,
}: Readonly<MegaMenuDropdownProps>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handlePointerEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onOpen();
  };

  const handlePointerLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 300);
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
      className="relative -mb-2 pb-2"
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onFocus={handlePointerEnter}
      onBlur={(event) => {
        if (menuRef.current?.contains(event.relatedTarget as Node)) return;
        handlePointerLeave();
      }}
    >
      <button
        type="button"
        className={cn(
          "group relative flex h-10 items-center gap-1 rounded-md px-3 text-[0.9375rem] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          isOpen || isCurrent
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) {
            onClose();
            return;
          }
          handlePointerEnter();
        }}
      >
        <span className="relative z-10">{section.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-3 -bottom-[0.6875rem] h-0.5 rounded-full bg-gold transition-transform duration-300",
            isCurrent ? "scale-x-100" : "scale-x-0",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
          >
            <div className="max-h-[calc(100dvh-5rem)] w-72 overflow-y-auto overscroll-contain rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-xl">
              <div className="p-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={item.current ? "page" : undefined}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60",
                      item.current && "bg-muted/60",
                    )}
                  >
                    <div className="shrink-0 mt-0.5 text-muted-foreground group-hover:text-gold transition-colors">
                      {item.mark ? (
                        <MythosMark id={item.mark} className="h-4 w-4" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground group-hover:text-gold transition-colors">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
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
  const t = useTranslations();
  const pathname = usePathname() ?? "/";
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const sections: MenuSection[] = PRIMARY_NAV.map((group) => ({
    label: t(`navigation.${group.titleKey}`),
    items: group.items.map((item) => ({
      label: t(`navigation.${item.labelKey}`),
      href: item.href,
      current: isActivePath(pathname, item.href),
      description: item.descriptionKey
        ? t(`navDescriptions.${item.descriptionKey}`)
        : undefined,
      mark: item.mark,
    })),
  }));

  const directActive = isActivePath(pathname, PRIMARY_DIRECT_LINK.href);

  return (
    <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
      {sections.map((section) => (
        <MegaMenuDropdown
          key={section.label}
          section={section}
          isCurrent={section.items.some((item) => item.current)}
          isOpen={openMenu === section.label}
          onOpen={() => setOpenMenu(section.label)}
          onClose={() => setOpenMenu(null)}
        />
      ))}

      <Link
        href={PRIMARY_DIRECT_LINK.href}
        aria-current={directActive ? "page" : undefined}
        className={cn(
          "relative inline-flex h-10 items-center rounded-md px-3 text-[0.9375rem] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          directActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t(`navigation.${PRIMARY_DIRECT_LINK.labelKey}`)}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-3 -bottom-[0.6875rem] h-0.5 rounded-full bg-gold transition-transform duration-300",
            directActive ? "scale-x-100" : "scale-x-0",
          )}
        />
      </Link>
    </nav>
  );
}
