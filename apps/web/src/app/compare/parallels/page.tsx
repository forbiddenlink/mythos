"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import { ArchetypeMatrix } from "@/components/compare/ArchetypeMatrix";
import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";
import { Sparkles, ArrowLeftRight } from "lucide-react";

interface ParallelEdge {
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

function buildParallels(): ParallelEdge[] {
  const deities = deitiesData as Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    pantheonId: string;
    crossPantheonParallels?: Array<{
      pantheonId: string;
      deityId: string;
      note: string;
    }>;
  }>;
  const pantheonNames = new Map(
    (pantheonsData as { id: string; name: string }[]).map((p) => [
      p.id,
      p.name.replace(" Pantheon", ""),
    ]),
  );

  const byId = new Map(deities.map((d) => [d.id, d]));

  const out: ParallelEdge[] = [];
  const seenPairs = new Set<string>();
  for (const d of deities) {
    if (!d.crossPantheonParallels?.length) continue;
    for (const p of d.crossPantheonParallels) {
      const other = byId.get(p.deityId);
      if (!other) continue;
      const a = d.id < other.id ? d.id : other.id;
      const b = d.id < other.id ? other.id : d.id;
      const pairKey = `${a}::${b}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      out.push({
        fromDeityId: d.id,
        fromName: d.name,
        fromSlug: d.slug,
        fromPantheon: pantheonNames.get(d.pantheonId) ?? d.pantheonId,
        fromImage: d.imageUrl,
        toDeityId: other.id,
        toName: other.name,
        toSlug: other.slug,
        toPantheon: pantheonNames.get(other.pantheonId) ?? other.pantheonId,
        toImage: other.imageUrl,
        note: p.note,
      });
    }
  }

  return out.toSorted((a, b) => {
    const fa = `${a.fromName} ${a.toName}`;
    const fb = `${b.fromName} ${b.toName}`;
    return fa.localeCompare(fb);
  });
}

export default function CrossPantheonParallelsPage() {
  const [activeTab, setActiveTab] = useState<"archetypes" | "pairs">(
    "archetypes",
  );
  const edges = buildParallels();

  return (
    <div className="min-h-screen">
      <PageHero
        mark="scales"
        tagline="Comparative mythology"
        title="Cross-Pantheon Parallels"
        description="Explore universal motifs, syncretism, and analogies between figures from 13 world traditions — uncovering how different ancient cultures personified natural forces and human experience."
      />

      <div className="container mx-auto max-w-6xl px-4 py-10 bg-mythic space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Breadcrumbs />

          {/* Mode Switcher Tabs */}
          <div
            role="group"
            aria-label="Switch comparison mode"
            className="flex rounded-lg border border-border/80 bg-card/60 p-1 shrink-0"
          >
            <button
              type="button"
              aria-pressed={activeTab === "archetypes"}
              onClick={() => setActiveTab("archetypes")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "archetypes"
                  ? "bg-gold text-midnight shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-3.5" />
              Archetype Matrix
            </button>
            <button
              type="button"
              aria-pressed={activeTab === "pairs"}
              onClick={() => setActiveTab("pairs")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "pairs"
                  ? "bg-gold text-midnight shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowLeftRight className="size-3.5" />
              Direct Equivalences ({edges.length})
            </button>
          </div>
        </div>

        {activeTab === "archetypes" ? (
          <ArchetypeMatrix />
        ) : (
          <section className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Curated Editorial Equivalences
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                These pairwise comparisons reflect reception history and
                scholarly analogies (such as <em>interpretatio graeca</em> and{" "}
                <em>interpretatio romana</em>).
              </p>
            </div>

            {edges.length === 0 ? (
              <p className="text-muted-foreground">No parallels indexed yet.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {edges.map((e) => (
                  <li key={`${e.fromDeityId}-${e.toDeityId}`}>
                    <Card className="h-full border-border/60 bg-card hover:border-gold/40 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary">{e.fromPantheon}</Badge>
                          <Link
                            href={`/deities/${e.fromSlug}`}
                            className="font-serif font-semibold text-foreground hover:text-gold transition-colors"
                          >
                            {e.fromName}
                          </Link>
                          <span className="text-gold font-bold">↔</span>
                          <Badge variant="secondary">{e.toPantheon}</Badge>
                          <Link
                            href={`/deities/${e.toSlug}`}
                            className="font-serif font-semibold text-foreground hover:text-gold transition-colors"
                          >
                            {e.toName}
                          </Link>
                        </div>
                        <CardTitle className="sr-only">
                          {e.fromName} and {e.toName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground leading-relaxed">
                        {e.note}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <p className="pt-6 border-t border-border/60 text-xs text-muted-foreground max-w-2xl leading-relaxed">
          <strong>Editorial Standards:</strong> Parallels and universal
          archetypes reflect cross-cultural motifs and historical syncretism
          rather than genetic identity. Explore the{" "}
          <Link href="/about" className="text-gold hover:underline">
            About
          </Link>{" "}
          page for our methodology and citation standards.
        </p>
      </div>
    </div>
  );
}
