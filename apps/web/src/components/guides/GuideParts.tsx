import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import type { GuideEntity } from "@/lib/guide-entities";

/**
 * Building blocks for the editorial guides. Manuscript-style prose sections,
 * a two-column "retelling / ancient sources" comparison, and a compact list
 * of linked catalog entries. All server-rendered.
 */

export interface GuideCitation {
  /** "Hesiod, Theogony 517-520". */
  label: string;
  /** Source page on this site, when the work is in the catalog. */
  href?: string;
}

export function GuideSection({
  id,
  title,
  intro,
  children,
}: Readonly<{
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mt-16 scroll-mt-24"
    >
      <h2 id={`${id}-heading`} className="page-section-title">
        {title}
      </h2>
      {intro ? (
        <div className="mt-3 max-w-[68ch] font-body text-lg leading-relaxed text-muted-foreground">
          {intro}
        </div>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Citations({ citations }: Readonly<{ citations: GuideCitation[] }>) {
  if (citations.length === 0) return null;
  return (
    <p className="mt-3 text-sm text-muted-foreground">
      <span className="text-gold-text">Sources:</span>{" "}
      {citations.map((citation, index) => (
        <span key={citation.label}>
          {index > 0 ? "; " : null}
          {citation.href ? (
            <Link
              href={citation.href}
              className="underline-offset-4 hover:text-gold-text hover:underline"
            >
              {citation.label}
            </Link>
          ) : (
            citation.label
          )}
        </span>
      ))}
    </p>
  );
}

/** Inline links to catalog entries: "Read: Atlas · Mount Othrys". */
export function EntityLinks({
  entities,
}: Readonly<{ entities: GuideEntity[] }>) {
  if (entities.length === 0) return null;
  return (
    <p className="mt-2 text-sm">
      <span className="page-eyebrow mr-2 text-muted-foreground">
        In the atlas
      </span>
      {entities.map((entity, index) => (
        <span key={entity.href}>
          {index > 0 ? " · " : null}
          <Link
            href={entity.href}
            className="font-body text-base text-foreground underline-offset-4 hover:text-gold-text hover:underline"
          >
            {entity.name}
          </Link>
        </span>
      ))}
    </p>
  );
}

/**
 * One figure or place set beside its ancient sources. `retelling` is what the
 * modern work does (kept brief and factual); `myth` is what the sources say.
 */
export function MythComparison({
  id,
  title,
  retellingLabel,
  retelling,
  myth,
  citations,
  entities,
}: Readonly<{
  id: string;
  title: string;
  retellingLabel: string;
  retelling: ReactNode;
  myth: ReactNode;
  citations: GuideCitation[];
  entities: GuideEntity[];
}>) {
  return (
    <article
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 border-t border-border/50 py-8 first:border-t-0 first:pt-0"
    >
      <h3 id={`${id}-heading`} className="font-serif text-2xl text-foreground">
        {title}
      </h3>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="page-eyebrow text-muted-foreground">{retellingLabel}</p>
          <div className="mt-2 font-body text-lg leading-relaxed text-foreground/90">
            {retelling}
          </div>
        </div>
        <div className="md:border-l md:border-gold/30 md:pl-6">
          <p className="page-eyebrow text-gold-text">In the ancient sources</p>
          <div className="mt-2 font-body text-lg leading-relaxed text-foreground">
            {myth}
          </div>
        </div>
      </div>
      <Citations citations={citations} />
      <EntityLinks entities={entities} />
    </article>
  );
}

/** A compact roster of catalog entries with their own one-line summaries. */
export function EntityRoster({
  entities,
  notes = {},
}: Readonly<{
  entities: GuideEntity[];
  /** Optional per-entry note keyed by href (the entry's role in the work). */
  notes?: Record<string, string>;
}>) {
  return (
    <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {entities.map((entity) => (
        <li key={entity.href} className="flex gap-4">
          {entity.imageUrl ? (
            <Image
              src={entity.imageUrl}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full border border-gold/30 object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <Link
              href={entity.href}
              className="font-serif text-xl text-foreground underline-offset-4 hover:text-gold-text hover:underline"
            >
              {entity.name}
            </Link>
            {notes[entity.href] ? (
              <p className="text-sm text-gold-text">{notes[entity.href]}</p>
            ) : null}
            <p className="mt-1 font-body text-muted-foreground">
              {entity.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Visible questions and answers, emitted as FAQPage data with the same text. */
export function GuideFaq({
  questions,
}: Readonly<{ questions: Array<{ question: string; answer: string }> }>) {
  return (
    <>
      <FAQJsonLd questions={questions} />
      <dl className="max-w-[68ch] space-y-6">
        {questions.map((entry) => (
          <div key={entry.question}>
            <dt className="font-serif text-xl text-foreground">
              {entry.question}
            </dt>
            <dd className="mt-2 font-body text-lg leading-relaxed text-muted-foreground">
              {entry.answer}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/** "On this page" jump links. */
export function GuideContents({
  items,
}: Readonly<{ items: Array<{ id: string; label: string }> }>) {
  return (
    <nav aria-label="On this page" className="mt-8 max-w-[68ch]">
      <p className="page-eyebrow text-muted-foreground">On this page</p>
      <ol className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-body text-base">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-foreground underline-offset-4 hover:text-gold-text hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Next steps: quiz, tree, stories. */
export function GuideNextSteps({
  links,
}: Readonly<{ links: Array<{ href: string; label: string; note: string }> }>) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="block h-full rounded-lg border border-border/60 bg-card/40 p-5 transition-colors hover:border-gold/60"
          >
            <span className="font-serif text-lg text-foreground">
              {link.label}
            </span>
            <span className="mt-1 block font-body text-muted-foreground">
              {link.note}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
