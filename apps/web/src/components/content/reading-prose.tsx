import type * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * Reading styles for long-form catalog prose (markdown rendered on the
 * server). One measure, one rhythm for every entity page.
 */
export const readingProseClass =
  "prose prose-lg max-w-none dark:prose-invert type-reading text-foreground/90 prose-p:my-4 prose-p:leading-[1.7] prose-headings:font-serif prose-headings:font-semibold prose-headings:text-foreground prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-[1.375rem] prose-h4:mt-8 prose-h4:text-xl prose-a:text-gold-text prose-a:decoration-gold/50 prose-a:underline-offset-4 prose-strong:text-foreground prose-blockquote:border-l-gold/40 prose-blockquote:font-normal prose-li:marker:text-gold/60";

/**
 * Catalog markdown uses "##" for its own sub-headings, but it is always set
 * under a section's h2, so every level moves down one.
 */
const SHIFTED_HEADINGS: Components = {
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  h2: ({ node: _node, ...props }) => <h3 {...props} />,
  h3: ({ node: _node, ...props }) => <h4 {...props} />,
  h4: ({ node: _node, ...props }) => <h5 {...props} />,
};

/** Markdown (or plain text) set in the reading measure. */
export function ReadingProse({
  markdown,
  dropCap = false,
  className,
}: {
  markdown: string;
  /** Illuminated first letter, for the opening of an article. */
  dropCap?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        readingProseClass,
        dropCap && "illuminated-tale",
        className,
      )}
    >
      <ReactMarkdown components={SHIFTED_HEADINGS}>{markdown}</ReactMarkdown>
    </div>
  );
}

/** A plain paragraph in the reading style, keeping authored line breaks. */
export function ReadingParagraph({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "type-reading whitespace-pre-line text-foreground/90",
        className,
      )}
    >
      {children}
    </p>
  );
}

const EMPHASIS = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

/**
 * Inline emphasis for short catalog strings (bibliography lines, notes):
 * `*Title*` and `_Title_` become <em>, `**bold**` becomes <strong>. No other
 * markdown is interpreted, so a stray character never turns into markup.
 */
export function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(EMPHASIS);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
            <strong key={index} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (
          part.length > 2 &&
          ((part.startsWith("*") && part.endsWith("*")) ||
            (part.startsWith("_") && part.endsWith("_")))
        ) {
          // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}
