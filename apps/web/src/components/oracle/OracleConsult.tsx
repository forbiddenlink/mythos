"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  ORACLE_CITATIONS_HEADER,
  ORACLE_GROUNDING_HITS_HEADER,
} from "@/lib/oracle/constants";
import {
  decodeCitationsHeader,
  type OracleCitation,
} from "@/lib/oracle/citations";

const PETITIONS = [
  "Why did the gods punish Prometheus?",
  "How do Norse and Greek creation myths differ?",
  "Who is the counterpart of Zeus in other pantheons?",
  "What does the underworld demand of the dead?",
];

interface Prophecy {
  question: string;
  answer: string;
  citations: OracleCitation[];
  grounded: boolean;
}

/**
 * Single-turn Delphic consultation panel. Poses one petition to the existing
 * /api/oracle endpoint and renders the streamed reply as a prophecy with its
 * Atlas citations. Kept separate from the global OracleChat modal on purpose:
 * this is the sanctuary experience, not the quick-access widget.
 */
export function OracleConsult() {
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [input, setInput] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [prophecy, setProphecy] = useState<Prophecy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const consult = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || isConsulting) return;

      setError(null);
      setProphecy(null);
      setStreaming("");
      setIsConsulting(true);

      try {
        const response = await fetch("/api/oracle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            messages: [{ role: "user", content: q }],
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            data.error ||
              "The Oracle is silent. She answers only so many petitions each day — return when the smoke has cleared.",
          );
        }

        const grounded =
          (parseInt(
            response.headers.get(ORACLE_GROUNDING_HITS_HEADER) ?? "0",
            10,
          ) || 0) > 0;
        const citationsRaw = response.headers.get(ORACLE_CITATIONS_HEADER);
        const citations = citationsRaw
          ? decodeCitationsHeader(citationsRaw)
          : [];

        const reader = response.body?.getReader();
        if (!reader) throw new Error("The Oracle's voice did not carry.");

        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setStreaming(full);
        }

        setProphecy({ question: q, answer: full, citations, grounded });
        setStreaming("");
        setInput("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "The Oracle's vision clouded over. Try again.",
        );
      } finally {
        setIsConsulting(false);
      }
    },
    [isConsulting, locale],
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          consult(input);
        }}
        className="rounded-2xl border border-gold/25 bg-[#f6ecd6]/[0.06] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-8"
      >
        <label
          htmlFor="oracle-petition"
          className="mb-3 block font-serif text-sm uppercase tracking-[0.3em] text-gold/70"
        >
          Pose your petition
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="oracle-petition"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isConsulting}
            placeholder="Ask the Oracle of the gods and their myths…"
            className="flex-1 rounded-lg border border-gold/25 bg-midnight/40 px-4 py-3 text-parchment placeholder:text-parchment/40 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isConsulting || !input.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold/90 px-5 py-3 font-semibold text-midnight transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConsulting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Consult
          </button>
        </div>

        {/* Suggested petitions */}
        {!prophecy && !isConsulting && (
          <div className="mt-5 flex flex-wrap gap-2">
            {PETITIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setInput(p);
                  consult(p);
                }}
                className="rounded-full border border-gold/20 px-3 py-1.5 text-xs text-parchment/70 transition-colors hover:border-gold/50 hover:text-gold"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Live region: streaming + settled prophecy */}
      <div ref={liveRef} aria-live="polite" className="mt-6">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          {(streaming || prophecy) && (
            <motion.div
              key={prophecy ? "settled" : "streaming"}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-gold/20 bg-midnight/50 p-6 sm:p-8"
            >
              <p className="mb-4 font-serif text-sm uppercase tracking-[0.25em] text-gold/60">
                The Oracle speaks
              </p>
              <p className="whitespace-pre-line font-serif text-lg leading-relaxed text-parchment/90">
                {prophecy ? prophecy.answer : streaming}
                {!prophecy && (
                  <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-gold align-middle" />
                )}
              </p>

              {prophecy && prophecy.citations.length > 0 && (
                <div className="mt-6 border-t border-gold/15 pt-4">
                  <p className="mb-2 text-xs uppercase tracking-widest text-gold/50">
                    Drawn from the Atlas
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {prophecy.citations.map((c) => (
                      <li key={`${c.type}:${c.slug}`}>
                        <Link
                          href={c.path}
                          className="rounded-full border border-gold/25 px-3 py-1 text-xs text-parchment/80 transition-colors hover:border-gold/50 hover:text-gold"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prophecy && !prophecy.grounded && (
                <p className="mt-4 text-xs italic text-parchment/40">
                  Spoken from memory alone — no Atlas source anchored this
                  reply.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OracleConsult;
