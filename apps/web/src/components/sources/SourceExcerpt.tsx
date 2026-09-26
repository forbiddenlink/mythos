"use client";

import { useState } from "react";
import { Languages, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PrimarySourceExcerpt {
  text: string;
  translation: string;
  source: string;
  sourceId?: string;
  lineNumbers?: string;
  translator?: string;
  originalLanguage?: string;
  quoteStatus: "direct-quotation" | "editorial-paraphrase" | "unverified";
  verification: "verified" | "source-and-locator-verified" | "not-verified";
  sourceUrl: string;
  edition: string;
}

interface SourceExcerptProps {
  excerpt: PrimarySourceExcerpt;
  className?: string;
  variant?: "default" | "compact";
}

export function SourceExcerpt({
  excerpt,
  className,
  variant = "default",
}: SourceExcerptProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  const isDirectQuotation =
    excerpt.quoteStatus === "direct-quotation" &&
    excerpt.verification === "verified";
  const isUnverified =
    excerpt.verification === "not-verified" ||
    excerpt.quoteStatus === "unverified";
  const statusLabel = isUnverified
    ? "Verification pending"
    : isDirectQuotation
      ? "Direct quotation"
      : excerpt.quoteStatus === "editorial-paraphrase"
        ? "Editorial paraphrase"
        : "Original wording unverified";
  const readUrl = excerpt.sourceUrl;

  return (
    <figure className={cn(variant === "compact" ? "py-4" : "py-6", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="type-eyebrow">{statusLabel}</span>
        {isDirectQuotation &&
          excerpt.originalLanguage &&
          excerpt.text !== excerpt.translation && (
            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-3 type-ui text-foreground transition-colors hover:border-gold/50 hover:text-gold-text"
              aria-pressed={showOriginal}
              aria-label={
                showOriginal ? "Translation" : excerpt.originalLanguage
              }
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {showOriginal ? "Translation" : excerpt.originalLanguage}
            </button>
          )}
      </div>
      {isUnverified ? (
        <p className="type-ui text-muted-foreground">
          This passage is awaiting verification against its source edition. Its
          wording is withheld until that check is complete.
        </p>
      ) : isDirectQuotation ? (
        <blockquote>
          <p
            className="font-body text-[1.25rem] leading-relaxed text-foreground"
            lang={
              showOriginal && excerpt.originalLanguage
                ? getLanguageCode(excerpt.originalLanguage)
                : "en"
            }
          >
            &ldquo;{showOriginal ? excerpt.text : excerpt.translation}&rdquo;
          </p>
        </blockquote>
      ) : (
        <p className="font-body text-[1.1875rem] leading-relaxed text-foreground/90">
          {excerpt.translation}
        </p>
      )}
      <figcaption className="mt-4 space-y-1 type-meta text-muted-foreground">
        <p>
          <cite className="font-medium not-italic text-foreground">
            {excerpt.source}
          </cite>
          {excerpt.lineNumbers && ` · ${excerpt.lineNumbers}`}
        </p>
        {excerpt.translator && (
          <p>
            {isUnverified
              ? "Attribution to check"
              : isDirectQuotation
                ? "Translation"
                : "Reference translation"}
            : {excerpt.translator}
          </p>
        )}
        <p>{excerpt.edition}</p>
        {readUrl && (
          <a
            href={readUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 type-ui text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
            aria-label={`Read source: ${excerpt.source} (opens in new tab)`}
          >
            Read source{" "}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </figcaption>
    </figure>
  );
}

// Helper to convert language names to ISO codes for the lang attribute
function getLanguageCode(language: string): string {
  const codes: Record<string, string> = {
    "Ancient Greek": "grc",
    "Old Norse": "non",
    Sanskrit: "sa",
    Latin: "la",
    "Ancient Egyptian": "egy",
    "Ancient Egyptian (Hieroglyphic)": "egy",
    "Old Japanese": "ojp",
    Japanese: "ja",
    "K'iche' Maya": "quc",
    Akkadian: "akk",
    Sumerian: "sux",
    "Vedic Sanskrit": "sa",
    "Classical Chinese": "lzh",
  };
  return codes[language] || "und";
}

// Export a list component for multiple excerpts
interface SourceExcerptsListProps {
  excerpts: PrimarySourceExcerpt[];
  className?: string;
  variant?: "default" | "compact";
}

export function SourceExcerptsList({
  excerpts,
  className,
  variant = "default",
}: SourceExcerptsListProps) {
  if (!excerpts || excerpts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "divide-y divide-border/70 border-y border-border/70",
        className,
      )}
    >
      {excerpts.map((excerpt, index) => (
        <SourceExcerpt
          key={`${excerpt.sourceId || excerpt.source}-${index}`}
          excerpt={excerpt}
          variant={variant}
        />
      ))}
    </div>
  );
}
