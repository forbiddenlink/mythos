"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SegmentedControl } from "@/components/layout/tool-stage";
import { ArchetypeMatrix } from "@/components/compare/ArchetypeMatrix";
import type { ArchetypeDeity } from "@/components/compare/ArchetypeMatrix";
import { Sparkles, ArrowLeftRight } from "lucide-react";

export interface ParallelEdge {
  fromDeityId: string;
  fromName: string;
  fromSlug: string;
  fromPantheon: string;
  fromImage?: string;
  toDeityId: string;
  toName: string;
  toSlug: string;
  toPantheon: string;
  toImage?: string;
  note: string;
}

export function ParallelsPageClient({
  edges,
  deities,
  pantheons,
}: Readonly<{
  edges: ParallelEdge[];
  deities: ArchetypeDeity[];
  pantheons: Array<{ id: string; name: string; slug: string }>;
}>) {
  const [activeTab, setActiveTab] = useState<"archetypes" | "pairs">(
    "archetypes",
  );
  return (
    <div className="space-y-10">
      <SegmentedControl<"archetypes" | "pairs">
        label="Switch comparison mode"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          {
            value: "archetypes",
            label: (
              <>
                <Sparkles className="size-4" aria-hidden="true" />
                Archetype Matrix
              </>
            ),
          },
          {
            value: "pairs",
            label: (
              <>
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                Direct Equivalences ({edges.length})
              </>
            ),
          },
        ]}
      />

      {activeTab === "archetypes" ? (
        <ArchetypeMatrix deities={deities} pantheons={pantheons} />
      ) : (
        <section aria-labelledby="equivalences-title">
          <h2
            id="equivalences-title"
            className="page-section-title text-foreground"
          >
            Curated editorial equivalences
          </h2>
          <p className="type-lede mt-2 max-w-3xl text-muted-foreground">
            These pairwise comparisons reflect reception history and scholarly
            analogies (such as <em>interpretatio graeca</em> and{" "}
            <em>interpretatio romana</em>).
          </p>

          {edges.length === 0 ? (
            <p className="mt-8 text-muted-foreground">
              No parallels indexed yet.
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {edges.map((e) => (
                <li
                  key={`${e.fromDeityId}-${e.toDeityId}`}
                  className="flex h-full gap-4 rounded-lg border border-border/70 bg-card p-4"
                >
                  <span className="flex shrink-0 -space-x-3" aria-hidden="true">
                    {[
                      { name: e.fromName, image: e.fromImage },
                      { name: e.toName, image: e.toImage },
                    ].map((figure) => (
                      <span
                        key={figure.name}
                        className="relative block size-14 overflow-hidden rounded-full bg-muted ring-2 ring-card"
                      >
                        {figure.image ? (
                          <Image
                            src={figure.image}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center font-serif text-lg font-semibold text-gold-text">
                            {figure.name.charAt(0)}
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-semibold leading-snug text-foreground">
                      <Link
                        href={`/deities/${e.fromSlug}`}
                        className="hover:text-gold-text"
                      >
                        {e.fromName}
                      </Link>
                      <span className="mx-2 text-gold-text" aria-hidden="true">
                        ↔
                      </span>
                      <span className="sr-only"> and </span>
                      <Link
                        href={`/deities/${e.toSlug}`}
                        className="hover:text-gold-text"
                      >
                        {e.toName}
                      </Link>
                    </h3>
                    <p className="type-meta uppercase tracking-[0.12em] text-muted-foreground">
                      {e.fromPantheon} · {e.toPantheon}
                    </p>
                    <p className="mt-2 type-ui text-muted-foreground">
                      {e.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="max-w-2xl border-t border-border/70 pt-6 type-ui text-muted-foreground">
        <strong className="text-foreground">Editorial standards:</strong>{" "}
        Parallels and universal archetypes reflect cross-cultural motifs and
        historical syncretism rather than genetic identity. See the{" "}
        <Link
          href="/about"
          className="text-gold-text underline underline-offset-4"
        >
          About
        </Link>{" "}
        page for our methodology and citation standards.
      </p>
    </div>
  );
}
