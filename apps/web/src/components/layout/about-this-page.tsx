import type * as React from "react";
import { ChevronDown } from "lucide-react";
import { Container, type ContainerSize } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface AboutThisPageProps {
  /** Summary line, e.g. "About this collection". */
  title?: string;
  /** Open by default (the text is in the HTML either way, so it stays indexable). */
  defaultOpen?: boolean;
  /** Wrap in a Container of this size; pass `false` when already inside one. */
  size?: ContainerSize | false;
  className?: string;
  children: React.ReactNode;
}

/**
 * Home for "how to use this page" and SEO explanation text that used to sit in
 * bordered boxes above the content. Renders below the content as a quiet,
 * collapsible note: native <details>, so it needs no JavaScript and the text
 * stays in the document for search engines and screen readers.
 */
export function AboutThisPage({
  title = "About this page",
  defaultOpen = false,
  size = "content",
  className,
  children,
}: AboutThisPageProps) {
  const body = (
    <details
      open={defaultOpen}
      className={cn(
        "group border-t border-border/70 pt-2 text-muted-foreground",
        className,
      )}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-sm type-ui font-medium text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="max-w-reading space-y-3 pb-2 pt-2 font-body text-[1.0625rem] leading-relaxed [&_a]:text-gold-text [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </details>
  );

  if (size === false) return body;
  return (
    <Container size={size} className="section-space-sm">
      {body}
    </Container>
  );
}
