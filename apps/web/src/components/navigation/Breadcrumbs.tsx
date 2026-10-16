"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import { usePathname } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/metadata";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Hubs retired by the consolidation. Their detail pages keep their URLs, so
 * the parent crumb points at the page that now lists them.
 */
const PARENT_CRUMBS: Record<string, BreadcrumbItem> = {
  "/collections": { label: "Paths", href: "/paths" },
  "/study": { label: "Paths", href: "/paths" },
  "/story-timeline": { label: "Timeline", href: "/timeline" },
};

/** Segments whose title-cased slug would read wrongly ("Hades Ii"). */
const SEGMENT_LABELS: Record<string, string> = {
  "gods-of": "Gods of",
  "hades-ii": "Hades II",
  "percy-jackson-titans-curse": "Percy Jackson: The Titan's Curse",
};

// Kept lower case inside a title-cased slug ("Judgment of Paris").
const MINOR_WORDS = new Set([
  "of",
  "the",
  "and",
  "to",
  "in",
  "on",
  "at",
  "a",
  "an",
  "vs",
]);

function generateBreadcrumbs(
  pathname: string,
  currentLabel?: string,
): BreadcrumbItem[] {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  let currentPath = "";
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    // Shared results have a detail route but no results index page.
    if (currentPath === "/quiz/result" && index < paths.length - 1) return;
    const parent = PARENT_CRUMBS[currentPath];
    if (parent && index < paths.length - 1) {
      breadcrumbs.push(parent);
      return;
    }

    // Format label: capitalize and replace hyphens with spaces
    // The page's own title names the last crumb when the page supplies it.
    const isLast = index === paths.length - 1;
    const label =
      (isLast ? currentLabel : undefined) ??
      SEGMENT_LABELS[path] ??
      path
        .split("-")
        .map((word, i) =>
          i > 0 && MINOR_WORDS.has(word)
            ? word
            : word.charAt(0).toUpperCase() + word.slice(1),
        )
        .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

interface BreadcrumbsProps {
  className?: string;
  /** `onDark` for use over a midnight hero or image. */
  tone?: "default" | "onDark";
  /** Label for the current page, normally its title; else the slug is used. */
  currentLabel?: string;
}

export function Breadcrumbs({
  className,
  tone = "default",
  currentLabel,
}: Readonly<BreadcrumbsProps> = {}) {
  const pathname = usePathname();
  const onDark = tone === "onDark";
  const breadcrumbs = generateBreadcrumbs(pathname, currentLabel);

  // Don't show breadcrumbs on home page
  if (pathname === "/") return null;

  const jsonLdItems = breadcrumbs.map((item) => ({
    name: item.label,
    item: `${siteConfig.url}${item.href}`,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className={cn("mb-6", className)}>
        <ol
          className={cn(
            "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm",
            onDark ? "text-parchment/80" : "text-muted-foreground",
          )}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {index === 0 && (
                  <MythosMark
                    id="temple"
                    className={cn(
                      "h-4 w-4",
                      onDark ? "text-gold-light" : "text-gold-text",
                    )}
                  />
                )}

                {isLast ? (
                  <span
                    className={cn(
                      "font-medium",
                      onDark ? "text-parchment" : "text-foreground",
                    )}
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className={cn(
                        "inline-flex min-h-6 items-center underline-offset-4 transition-colors hover:underline",
                        onDark
                          ? "hover:text-parchment"
                          : "hover:text-foreground",
                      )}
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5",
                        onDark ? "text-parchment/60" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
