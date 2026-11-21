import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import type { NextStepLink, NextStepSet } from "@/lib/next-steps";
import { cn } from "@/lib/utils";

interface NextStepsProps extends NextStepSet {
  /** Unique on the page; prefixes the heading id. */
  id: string;
  className?: string;
}

function LinkGroup({
  title,
  links,
}: Readonly<{ title: string; links: readonly NextStepLink[] }>) {
  if (links.length === 0) return null;
  return (
    <div>
      <h3 className="font-sans type-meta font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex min-h-11 flex-col justify-center py-1.5 type-ui"
            >
              <span className="font-medium text-gold-text underline decoration-gold/40 underline-offset-4 group-hover:decoration-current">
                {link.label}
              </span>
              {link.meta ? (
                <span className="type-meta text-muted-foreground">
                  {link.meta}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The closing block of a list or comparison page, the counterpart of
 * `EntryCloser` on entity pages: myths to read next, then related pages.
 * Plain links only; nothing opens, counts or gates.
 */
export function NextSteps({
  id,
  myths,
  related,
  className,
}: Readonly<NextStepsProps>) {
  if (myths.length === 0 && related.length === 0) return null;
  return (
    <section
      aria-labelledby={`${id}-heading`}
      data-testid="next-steps"
      className={cn("mt-16 max-w-3xl border-t border-gold/25 pt-8", className)}
    >
      <h2 id={`${id}-heading`} className="type-h3 text-foreground">
        Keep exploring
      </h2>
      <div className="mt-5 grid gap-x-12 gap-y-6 sm:grid-cols-2">
        <LinkGroup title="Read the myths" links={myths} />
        <LinkGroup title="Related pages" links={related} />
      </div>
      <NewsletterSignup
        placement="next_steps"
        headingLevel="h3"
        className="mt-8"
        title="One myth a week, by email"
        description="A short email with one myth, its sources and a question to think about. Unsubscribe any time."
      />
    </section>
  );
}
