import Link from "next/link";
import { cn } from "@/lib/utils";

interface CatalogImageNoticeProps {
  className?: string;
}

/**
 * Single-line disclosure for catalog indexes informing readers that images are
 * modern illustrations rather than historical artifacts.
 */
export function CatalogImageNotice({ className }: CatalogImageNoticeProps) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Catalog pictures are illustrations, not historical artworks.{" "}
      <Link
        href="/about#images"
        className="underline underline-offset-2 hover:text-foreground"
      >
        About our images
      </Link>
    </p>
  );
}
