"use client";

import { BookOpen, CircleSlash, ScrollText } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import {
  formatPrimarySource,
  isSitePath,
  type OracleSourcesPayload,
} from "@/lib/oracle/citations";

const LINK_RE = /\[([^\]\n]{1,200})\]\(([^)\s]{1,300})\)/g;

/**
 * Render an Oracle answer as plain text, turning markdown links to Atlas pages
 * (`[Zeus](/deities/zeus)`) into site links. Any other link target is shown as
 * its label only — the model never gets to emit an off-site href.
 */
export function renderOracleText(
  text: string,
  linkClassName: string,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const [whole, label, href] = match;
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(
      isSitePath(href) ? (
        <Link key={`l${i++}`} href={href} className={linkClassName}>
          {label}
        </Link>
      ) : (
        <Fragment key={`t${i++}`}>{label}</Fragment>
      ),
    );
    last = start + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

interface OracleSourcesProps {
  sources: OracleSourcesPayload | null;
  notInSources: boolean;
  /** "compact" for the chat widget, "full" for the /oracle sanctuary page. */
  variant?: "compact" | "full";
}

/**
 * Under-answer provenance: the Atlas pages the Oracle was given and the
 * primary texts they cite, or an explicit "not in our sources" state.
 */
export function OracleSources({
  sources,
  notInSources,
  variant = "compact",
}: Readonly<OracleSourcesProps>) {
  const t = useTranslations("oracle");
  const full = variant === "full";

  if (notInSources) {
    return (
      <div
        role="note"
        data-testid="oracle-not-in-sources"
        className={`mt-3 flex items-start gap-2 rounded-lg border border-gold/25 bg-gold/5 ${full ? "p-4" : "p-2.5"}`}
      >
        <CircleSlash
          aria-hidden="true"
          className={`${full ? "mt-0.5 size-4" : "mt-px size-3.5"} shrink-0 text-gold/70`}
        />
        <div>
          <p
            className={`font-serif text-gold/90 ${full ? "text-sm" : "text-xs"}`}
          >
            {t("notInSourcesTitle")}
          </p>
          <p
            className={`text-parchment/70 ${full ? "mt-1 text-sm" : "text-[11px] leading-snug"}`}
          >
            {t("notInSourcesBody")}
          </p>
        </div>
      </div>
    );
  }

  const entities = sources?.entities ?? [];
  const primary = sources?.primarySources ?? [];
  if (entities.length === 0 && primary.length === 0) return null;

  const heading = full
    ? "mb-2 flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold/60"
    : "mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-parchment/50";

  return (
    <div
      className={`border-t border-gold/15 ${full ? "mt-6 space-y-4 pt-4" : "mt-2 space-y-2 pt-2"}`}
    >
      {entities.length > 0 && (
        <section aria-label={t("sourcesAria")}>
          <p className={heading}>
            <BookOpen aria-hidden="true" className="size-3 shrink-0" />
            {t("entitiesLabel")}
          </p>
          <ul className={full ? "flex flex-wrap gap-2" : "space-y-0.5"}>
            {entities.slice(0, 10).map((c) => (
              <li key={`${c.type}:${c.slug}`}>
                <Link
                  href={c.path}
                  className={
                    full
                      ? "rounded-full border border-gold/25 px-3 py-1 text-xs text-parchment/80 transition-colors hover:border-gold/50 hover:text-gold"
                      : "text-[11px] text-gold/80 underline-offset-2 hover:text-gold hover:underline"
                  }
                >
                  {c.title}
                </Link>
                {!full && (
                  <span className="text-[10px] text-parchment/45">
                    {" "}
                    · {c.type}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {primary.length > 0 && (
        <section aria-label={t("primarySourcesLabel")}>
          <p className={heading}>
            <ScrollText aria-hidden="true" className="size-3 shrink-0" />
            {t("primarySourcesLabel")}
          </p>
          <ul
            className={full ? "space-y-1 text-sm" : "space-y-0.5 text-[11px]"}
          >
            {primary.map((s) => {
              const label = formatPrimarySource(s);
              return (
                <li key={label} className="font-body italic text-parchment/75">
                  {s.path ? (
                    <Link
                      href={s.path}
                      className="underline-offset-2 hover:text-gold hover:underline"
                    >
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
