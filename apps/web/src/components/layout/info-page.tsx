import type * as React from "react";
import { Container } from "@/components/layout/container";
import { OnThisPage, type TocItem } from "@/components/layout/detail-layout";
import { PageHeader } from "@/components/layout/page-header";
import type { MythosMarkId } from "@/components/icons/mythos-marks";
import { cn } from "@/lib/utils";

/**
 * Reading typography for info pages (about, privacy, terms, accessibility,
 * contact). Styles plain HTML children, so page files can write <h2>, <p>,
 * <ul> without per-element classes. Measure: 68ch.
 */
export const infoProseClass = cn(
  "type-reading text-foreground/90",
  "[&>*+*]:mt-5",
  // Same values as .page-section-title and .type-h3 (custom classes cannot
  // take variants in Tailwind v4).
  "[&_h2]:font-serif [&_h2]:text-[clamp(1.625rem,1.35rem+1vw,2.125rem)] [&_h2]:leading-[1.2] [&_h2]:font-semibold [&_h2]:text-pretty",
  "[&_h2]:scroll-mt-24 [&_h2]:text-foreground [&_h2]:mt-14 [&_h2:first-child]:mt-0",
  "[&_h3]:font-serif [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-9",
  "[&_h2+*]:mt-4 [&_h3+*]:mt-3",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
  "[&_li]:pl-1 [&_li::marker]:text-gold-text",
  "[&_a]:text-gold-text [&_a]:underline [&_a]:decoration-gold/45 [&_a]:underline-offset-4 hover:[&_a]:decoration-current",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_section]:scroll-mt-24 [&_section+section]:mt-14",
  "[&_section>*+*]:mt-5",
);

/**
 * The info-page body: a 68ch prose column on the header's left edge and, on
 * wide screens, a sticky right-hand column with the contents and any extras.
 * Phones get the prose, then the extras; the contents list is desktop-only.
 */
export function InfoColumns({
  toc,
  aside,
  children,
}: Readonly<{
  toc?: TocItem[];
  aside?: React.ReactNode;
  children: React.ReactNode;
}>) {
  const hasToc = Boolean(toc && toc.length > 1);
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,68ch)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
      <div className={infoProseClass}>{children}</div>
      {hasToc || aside ? (
        <div className="min-w-0">
          <div className="space-y-10 lg:sticky lg:top-24 lg:max-w-xs">
            {hasToc && toc ? (
              <div className="hidden lg:block">
                <OnThisPage items={toc} />
              </div>
            ) : null}
            {aside}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface InfoPageProps {
  eyebrow?: React.ReactNode;
  mark?: MythosMarkId;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** "Last updated …" or other one-line metadata under the lede. */
  meta?: React.ReactNode;
  /** Content between the header and the prose (e.g. an at-a-glance strip). */
  intro?: React.ReactNode;
  /** Prose body. Styled by infoProseClass. */
  children: React.ReactNode;
  /** Section anchors for a sticky "On this page" list on wide screens. */
  toc?: TocItem[];
  /** Extra blocks for the right-hand column (under the contents list). */
  aside?: React.ReactNode;
  /** Anything after the prose at content width (cards, CTAs). */
  after?: React.ReactNode;
  className?: string;
}

/** PageHeader plus a 68ch reading column and an optional sticky aside. */
export function InfoPage({
  eyebrow,
  mark,
  title,
  lede,
  meta,
  intro,
  children,
  toc,
  aside,
  after,
  className,
}: InfoPageProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      <PageHeader
        eyebrow={eyebrow}
        mark={mark}
        title={title}
        lede={lede}
        count={meta}
      />
      {intro ? <Container className="pt-10 md:pt-14">{intro}</Container> : null}
      <Container className="section-space">
        <InfoColumns toc={toc} aside={aside}>
          {children}
        </InfoColumns>
      </Container>
      {after}
    </div>
  );
}
