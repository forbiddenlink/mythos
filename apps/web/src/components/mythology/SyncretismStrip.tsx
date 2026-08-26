"use client";

import Link from "next/link";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { getSyncretismChains } from "@/lib/linked-mentions";
import { MythosMark } from "@/components/icons/mythos-marks";

/**
 * Homepage "Same Gods, Different Names" strip — curated syncretism chains
 * drawn from crossPantheonParallels (mythologies.wiki pattern).
 */
export function SyncretismStrip() {
  const chains = getSyncretismChains(5);
  if (chains.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-mythic/40 py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold-text">
              <MythosMark id="scales" className="h-4 w-4 text-gold" />
              Same gods, different names
            </div>
            <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
              When cultures met, deities traveled
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Follow one figure across pantheons — Roman equivalents, sky-father
              analogues, and living syncretism — then open any name to compare.
            </p>
          </div>
          <Link
            href="/compare/parallels"
            className="text-sm text-gold-text underline-offset-4 hover:underline"
          >
            Browse all parallels →
          </Link>
        </div>

        <ul className="space-y-6">
          {chains.map((chain) => (
            <li
              key={chain.id}
              className="flex flex-col gap-3 border border-border/50 bg-card/40 p-4 md:flex-row md:items-center md:gap-2"
            >
              <span className="shrink-0 font-serif text-sm text-muted-foreground md:w-28">
                {chain.label}
              </span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                {chain.members.map((m, i) => (
                  <span key={m.slug} className="inline-flex items-center gap-2">
                    {i > 0 && (
                      <span className="text-gold/50" aria-hidden>
                        =
                      </span>
                    )}
                    <Link
                      href={`/deities/${m.slug}`}
                      className="inline-flex items-center gap-2 border border-border/60 bg-background/60 px-3 py-1.5 text-sm transition-colors hover:border-gold/40 hover:text-gold"
                    >
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{
                          backgroundColor: getPantheonColor(m.pantheonId),
                        }}
                        aria-hidden
                      />
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {m.pantheonId
                          .replace(/-pantheon$/, "")
                          .replaceAll("-", " ")}
                      </span>
                    </Link>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
