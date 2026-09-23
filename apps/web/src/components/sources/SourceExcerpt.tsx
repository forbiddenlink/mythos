"use client";

import { useState } from "react";
import { Languages, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import sourcesData from "@/data/sources.json";

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

interface Source {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  externalUrl?: string;
}

export function SourceExcerpt({
  excerpt,
  className,
  variant = "default",
}: SourceExcerptProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  const linkedSource = excerpt.sourceId
    ? (sourcesData as Source[]).find((source) => source.id === excerpt.sourceId)
    : null;
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
  const readUrl = excerpt.sourceUrl || linkedSource?.externalUrl;

  return (
    <figure
      className={cn(
        "border-l-2 border-gold/40 bg-muted/30",
        variant === "compact" ? "p-4" : "p-6",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-gold-text">
          {statusLabel}
        </span>
        {isDirectQuotation &&
          excerpt.originalLanguage &&
          excerpt.text !== excerpt.translation && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="inline-flex min-h-11 items-center gap-2 border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
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
        <p className="text-sm leading-relaxed text-muted-foreground">
          This passage is awaiting verification against its source edition. Its
          wording is withheld until that check is complete.
        </p>
      ) : isDirectQuotation ? (
        <blockquote>
          <p
            className="font-body text-lg leading-relaxed text-foreground"
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
        <p className="font-body text-lg leading-relaxed text-foreground">
          {excerpt.translation}
        </p>
      )}
      <figcaption className="mt-5 space-y-2 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
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
            className="inline-flex min-h-11 items-center gap-2 text-gold-text underline underline-offset-4"
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
    <div className={cn("space-y-4", className)}>
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
