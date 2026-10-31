"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { formatCitations, type AccessedDate } from "@/lib/cite-page";
import { cn } from "@/lib/utils";

interface CitePageProps {
  /** Entry name, e.g. "Zeus". Not the SEO title. */
  title: string;
  /** Absolute canonical URL of the page. */
  url: string;
  siteName: string;
  className?: string;
}

type FormatKey = "mla" | "apa" | "chicago";

const FORMATS: ReadonlyArray<{ key: FormatKey; label: string }> = [
  { key: "mla", label: "MLA" },
  { key: "apa", label: "APA" },
  { key: "chicago", label: "Chicago" },
];

/** Today in the reader's time zone, as "y-m-d". A string, so the snapshot is stable between reads. */
function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function parseKey(key: string): AccessedDate {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

const subscribe = () => () => {};
const serverSnapshot = () => null;

/**
 * Collapsible "Cite this page" control. The accessed date is read on the
 * client (the server snapshot is null) and again each time the panel opens, so
 * the server render and hydration match and the date is never baked into
 * cached HTML.
 */
export function CitePage({ title, url, siteName, className }: CitePageProps) {
  const dayKey = useSyncExternalStore(subscribe, todayKey, serverSnapshot);
  const [, refreshDate] = useReducer((n: number) => n + 1, 0);
  const accessed = dayKey ? parseKey(dayKey) : null;
  const [copied, setCopied] = useState<FormatKey | null>(null);
  const [status, setStatus] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const citations = accessed
    ? formatCitations({ title, url, siteName, accessed })
    : null;

  const copy = useCallback(
    async (key: FormatKey, label: string, text: string) => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setStatus(`${label} citation copied to clipboard.`);
      } catch {
        setCopied(null);
        setStatus(
          `Could not copy the ${label} citation. Select the text and copy it instead.`,
        );
      }
      resetTimer.current = setTimeout(() => {
        setCopied(null);
        setStatus("");
      }, 3000);
    },
    [],
  );

  return (
    <details
      className={cn(
        "group border-t border-border/70 pt-2 text-muted-foreground",
        className,
      )}
      onToggle={(event) => {
        if (event.currentTarget.open) refreshDate();
      }}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-sm type-ui font-medium text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
        Cite this page
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="max-w-reading space-y-4 pb-2 pt-2">
        <p className="text-sm leading-6">
          No author or publication date is recorded for this page, so each
          citation uses n.d. and today&apos;s date as the access date.
        </p>
        {citations ? (
          <ul className="space-y-4">
            {FORMATS.map(({ key, label }) => {
              const text = citations[key];
              const isCopied = copied === key;
              return (
                <li key={key} className="space-y-1.5">
                  <div className="flex min-h-11 items-center justify-between gap-3">
                    <span className="type-ui font-medium text-foreground">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(key, label, text)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      {isCopied ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Copy className="size-4" aria-hidden="true" />
                      )}
                      {isCopied ? "Copied" : "Copy"}
                      <span className="sr-only"> {label} citation</span>
                    </button>
                  </div>
                  <p className="break-words font-body text-[1.0625rem] leading-relaxed">
                    {text}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p role="status" aria-live="polite" className="sr-only">
          {status}
        </p>
      </div>
    </details>
  );
}
