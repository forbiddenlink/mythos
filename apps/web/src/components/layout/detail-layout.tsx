import type * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
   DetailLayout — the entity-page template (deities first; heroes,
   creatures, stories, artifacts, locations and pantheons adopt it next).

   <DetailLayout hero={<DetailHero …/>} facts={<FactList …/>}
                 toc={[{ id, label }]} aside={<RelatedFigures …/>}
                 after={<wide content/>}>
     <ArticleSection id="about" title="About Zeus">…</ArticleSection>
   </DetailLayout>

   Desktop: article (68ch) + aside (facts, extras, then an "On this page"
   list that sticks while the article scrolls).
   Mobile: one column with the facts and contents above the article and
   the extras after it (single DOM, reordered with CSS order).
   ───────────────────────────────────────────────────────────────────── */

export interface TocItem {
  id: string;
  label: string;
}

interface DetailLayoutProps {
  hero: React.ReactNode;
  /** Key facts, usually a <FactList>. Shown first in the aside. */
  facts?: React.ReactNode;
  /** Section anchors for "On this page"; ids must exist in the article. */
  toc?: TocItem[];
  /** Extra aside blocks: <RelatedFigures>, <AsideLinks>. */
  aside?: React.ReactNode;
  /** Full-width content after the two-column body (trees, galleries). */
  after?: React.ReactNode;
  /** Accessible name for the aside landmark. */
  asideLabel?: string;
  children: React.ReactNode;
}

export function DetailLayout({
  hero,
  facts,
  toc,
  aside,
  after,
  asideLabel = "Entry details",
  children,
}: DetailLayoutProps) {
  const hasToc = Boolean(toc && toc.length > 1);
  return (
    <>
      {hero}
      <Container className="pt-8 pb-16 md:pt-12 lg:pb-24">
        {/* One DOM order (article, then aside) for assistive tech. Phones show
            facts and contents above the article and the extras after it;
            desktop keeps a right-hand aside whose contents list sticks once
            the other aside blocks have scrolled by. */}
        <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-x-14 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-x-20">
          <div className="order-3 min-w-0 lg:order-none">{children}</div>
          <aside
            aria-label={asideLabel}
            className="contents lg:flex lg:flex-col lg:gap-10"
          >
            {facts ? <div className="order-1 lg:order-1">{facts}</div> : null}
            {aside ? (
              <div className="order-4 space-y-10 border-t border-border/70 pt-10 lg:order-2 lg:border-0 lg:pt-0">
                {aside}
              </div>
            ) : null}
            {hasToc && toc ? (
              <div className="order-2 lg:sticky lg:top-24 lg:order-3">
                <OnThisPage items={toc} />
              </div>
            ) : null}
          </aside>
        </div>
        {after ? (
          <div className="mt-16 space-y-16 lg:mt-24">{after}</div>
        ) : null}
      </Container>
    </>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */

interface DetailHeroImage {
  src: string;
  alt: string;
  /** Remote museum images are served as-is. */
  unoptimized?: boolean;
  /** `contain` for objects photographed on a plain ground. */
  fit?: "cover" | "contain";
}

interface DetailHeroProps {
  image?: DetailHeroImage | null;
  /** Caption under the image (credit, illustrative-image note). */
  imageCaption?: React.ReactNode;
  /** Shown in the frame when there is no image (e.g. the initial). */
  imageFallback?: React.ReactNode;
  /** Tradition · role, above the title. */
  eyebrow?: React.ReactNode;
  title: string;
  /** Pronunciation or other inline control after the title. */
  titleAddon?: React.ReactNode;
  /** Name in the original language/script. */
  nativeName?: React.ReactNode;
  /** Alternate names / epithets, joined as "Also known as". */
  epithets?: readonly string[];
  /** Domains or tags, shown as quiet chips. */
  tags?: readonly string[];
  tagsLabel?: string;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  /** Small print under the actions (byline). */
  meta?: React.ReactNode;
  /** Colour washed into the midnight backdrop (a pantheon colour). */
  accentColor?: string;
  breadcrumbs?: boolean;
  /** View-transition names shared with index cards. */
  imageTransitionName?: string;
  titleTransitionName?: string;
}

/**
 * Entity hero: a large 4:5 portrait beside the title block on a midnight
 * band. Always dark (it is a cinematic surface), so text uses parchment.
 */
export function DetailHero({
  image,
  imageCaption,
  imageFallback,
  eyebrow,
  title,
  titleAddon,
  nativeName,
  epithets,
  tags,
  tagsLabel = "Domains",
  lede,
  actions,
  meta,
  accentColor,
  breadcrumbs = true,
  imageTransitionName,
  titleTransitionName,
}: DetailHeroProps) {
  return (
    <div className="dark relative isolate overflow-hidden bg-midnight text-foreground">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {accentColor ? (
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(ellipse 70% 90% at 20% 30%, color-mix(in oklch, ${accentColor} 38%, transparent), transparent 70%)`,
            }}
          />
        ) : null}
        {image && !image.unoptimized ? (
          <Image
            src={image.src}
            alt=""
            fill
            sizes="256px"
            className="scale-110 object-cover opacity-25 blur-2xl"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-midnight via-midnight/60 to-midnight/30" />
      </div>

      <Container className="pt-5 pb-10 md:pb-14">
        {breadcrumbs ? (
          <Breadcrumbs tone="onDark" className="mb-6 md:mb-10" />
        ) : null}

        {/* Phones read the title first, then the portrait, then the rest;
            wider screens put the portrait beside both text groups. */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_1fr] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-x-16">
          <div className="min-w-0 md:col-start-2 md:row-start-2">
            {eyebrow ? (
              <p className="type-eyebrow mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-gold-light">
                {eyebrow}
              </p>
            ) : null}
            <div
              className="flex flex-wrap items-baseline gap-x-4 gap-y-2"
              style={
                titleTransitionName
                  ? { viewTransitionName: titleTransitionName }
                  : undefined
              }
            >
              <h1 className="detail-title text-parchment">{title}</h1>
              {titleAddon}
            </div>
            {nativeName ? (
              <p className="mt-3 font-body text-xl text-parchment/85 md:text-2xl">
                {nativeName}
              </p>
            ) : null}
            {epithets && epithets.length > 0 ? (
              <p className="mt-2 type-ui text-parchment/80">
                <span className="text-parchment/65">Also known as </span>
                {epithets.join(", ")}
              </p>
            ) : null}
          </div>

          <figure
            className="mx-auto w-full max-w-[15rem] md:col-start-1 md:row-span-4 md:row-start-1 md:mx-0 md:max-w-none md:self-center"
            style={
              imageTransitionName
                ? { viewTransitionName: imageTransitionName }
                : undefined
            }
          >
            <div className="relative aspect-4/5 overflow-hidden rounded-md bg-midnight-light shadow-2xl shadow-black/50 ring-1 ring-gold/25">
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  unoptimized={image.unoptimized}
                  sizes="(min-width: 1024px) 22rem, (min-width: 768px) 17rem, 15rem"
                  className={cn(
                    image.fit === "contain"
                      ? "object-contain p-3"
                      : "object-cover object-top",
                  )}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  {imageFallback}
                </div>
              )}
            </div>
            {imageCaption ? (
              <figcaption className="mt-2">{imageCaption}</figcaption>
            ) : null}
          </figure>

          <div className="min-w-0 md:col-start-2 md:row-start-3">
            {tags && tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label={tagsLabel}>
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-sm capitalize text-gold-light"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            {lede ? (
              <div className="type-lede mt-6 max-w-[52ch] text-parchment/90">
                {lede}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-7 flex flex-wrap items-center gap-2">
                {actions}
              </div>
            ) : null}
            {meta ? (
              <div className="mt-6 max-w-[60ch] type-meta text-parchment/70">
                {meta}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ── Article section ─────────────────────────────────────────────────── */

interface ArticleSectionProps {
  id: string;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** One line under the heading. */
  description?: React.ReactNode;
  /** Constrain to the 68ch reading measure (default true). */
  reading?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** A titled block of the article; its id feeds the "On this page" list. */
export function ArticleSection({
  id,
  title,
  eyebrow,
  description,
  reading = true,
  className,
  children,
}: ArticleSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24", reading && "max-w-reading", className)}
    >
      {eyebrow ? <p className="type-eyebrow mb-2">{eyebrow}</p> : null}
      <h2 id={headingId} className="page-section-title text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 type-ui text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ── Aside blocks ────────────────────────────────────────────────────── */

function AsideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </h2>
  );
}

export interface Fact {
  label: string;
  value: React.ReactNode;
}

/** Key facts as a definition list. Empty values are skipped. */
export function FactList({
  facts,
  title = "Key facts",
}: {
  facts: Fact[];
  title?: string;
}) {
  const rows = facts.filter(
    (fact) =>
      fact.value !== null &&
      fact.value !== undefined &&
      fact.value !== "" &&
      !(Array.isArray(fact.value) && fact.value.length === 0),
  );
  if (rows.length === 0) return null;
  return (
    <section aria-label={title}>
      <AsideHeading>{title}</AsideHeading>
      <dl className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-4 border-t border-border/70 text-[0.9375rem] leading-snug sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] lg:grid-cols-1">
        {rows.map((fact) => (
          <div
            key={fact.label}
            className="col-span-2 grid grid-cols-subgrid border-b border-border/70 py-2.5 lg:col-span-1 lg:block"
          >
            <dt className="text-muted-foreground lg:text-[0.8125rem]">
              {fact.label}
            </dt>
            <dd className="text-foreground lg:mt-0.5">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** "On this page" anchors. Vertical on desktop, wrapped chips on phones. */
export function OnThisPage({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="On this page">
      <AsideHeading>On this page</AsideHeading>
      <ol className="flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-l lg:border-border/70">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center rounded-full border border-border/80 px-3 text-sm text-foreground transition-colors hover:border-gold/50 hover:text-gold-text lg:-ml-px lg:min-h-9 lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:px-4 lg:text-[0.9375rem] lg:text-muted-foreground lg:hover:border-gold lg:hover:text-foreground"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface RelatedFigure {
  name: string;
  href: string;
  imageUrl?: string | null;
  /** Tradition, relation or role. */
  meta?: string;
}

/** Related figures with thumbnails, for the aside. */
export function RelatedFigures({
  title = "Related figures",
  figures,
}: {
  title?: string;
  figures: RelatedFigure[];
}) {
  if (figures.length === 0) return null;
  return (
    <section aria-label={title}>
      <AsideHeading>{title}</AsideHeading>
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {figures.map((figure) => (
          <li key={figure.href}>
            <Link
              href={figure.href}
              className="group flex min-h-14 items-center gap-3 rounded-md p-1.5 -mx-1.5 transition-colors hover:bg-muted/60"
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                {figure.imageUrl ? (
                  <Image
                    src={figure.imageUrl}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover object-top"
                  />
                ) : (
                  <span
                    className="flex h-full items-center justify-center font-serif text-lg text-gold-text"
                    aria-hidden="true"
                  >
                    {figure.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground group-hover:text-gold-text">
                  {figure.name}
                </span>
                {figure.meta ? (
                  <span className="block truncate text-[0.8125rem] text-muted-foreground">
                    {figure.meta}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A titled list of plain links for the aside (guides, domain hubs). */
export function AsideLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; meta?: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <section aria-label={title}>
      <AsideHeading>{title}</AsideHeading>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group block rounded-sm py-1.5 text-[0.9375rem] leading-snug text-foreground"
            >
              <span className="underline decoration-gold/40 underline-offset-4 group-hover:text-gold-text group-hover:decoration-current">
                {link.label}
              </span>
              {link.meta ? (
                <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
                  {link.meta}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
