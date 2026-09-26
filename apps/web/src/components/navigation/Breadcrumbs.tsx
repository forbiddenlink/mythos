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

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  let currentPath = "";
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const parent = PARENT_CRUMBS[currentPath];
    if (parent && index < paths.length - 1) {
      breadcrumbs.push(parent);
      return;
    }

    // Format label: capitalize and replace hyphens with spaces
    const label =
      SEGMENT_LABELS[path] ??
      path
        .split("-")
        // "vs" joins two names in a comparison slug; it is not a word to title-case.
        .map((word) =>
          word === "vs" ? word : word.charAt(0).toUpperCase() + word.slice(1),
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
}

export function Breadcrumbs({
  className,
  tone = "default",
}: Readonly<BreadcrumbsProps> = {}) {
  const pathname = usePathname();
  const onDark = tone === "onDark";
  const breadcrumbs = generateBreadcrumbs(pathname);

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
